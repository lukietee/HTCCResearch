#!/usr/bin/env python3
"""YouTube Data API v3 thumbnail collection script.

Collects thumbnails for a controlled panel of channels across years 2015-2025,
plus expanded MrBeast reference set. Supports resumability and quota tracking.

Usage:
    python scripts/collect_youtube.py panel               # Collect panel channels
    python scripts/collect_youtube.py panel --dry-run      # Preview without API calls
    python scripts/collect_youtube.py panel --channels "MKBHD" "Smosh" --years 2020 2021
    python scripts/collect_youtube.py mrbeast              # Expand MrBeast reference set
    python scripts/collect_youtube.py status               # Show collection progress
    python scripts/collect_youtube.py validate             # Check completeness
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode

import requests

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("ERROR: google-api-python-client not installed.")
    print("Run: pip install google-api-python-client")
    sys.exit(1)

from app.core.config import settings


# --- Constants ---

DAILY_QUOTA_LIMIT = 10000
QUOTA_SAFETY_MARGIN = 200
QUOTA_STOP_THRESHOLD = DAILY_QUOTA_LIMIT - QUOTA_SAFETY_MARGIN  # 9,800

SEARCH_LIST_COST = 100  # quota units per search.list call
VIDEOS_LIST_COST = 1    # quota units per videos.list call (up to 50 IDs)

THUMBNAILS_PER_CHANNEL_YEAR = 15
YEARS = list(range(2015, 2026))  # 2015-2025

SCRIPTS_DIR = Path(__file__).resolve().parent
CHANNELS_FILE = SCRIPTS_DIR / "channels.json"
DATA_DIR = settings.DATA_DIR
THUMBNAILS_DIR = settings.THUMBNAILS_DIR
STATE_FILE = settings.COLLECTION_STATE_FILE
METADATA_DIR = settings.METADATA_DIR
METADATA_CSV = METADATA_DIR / "all_collected.csv"


# --- Quota Tracker ---

class QuotaTracker:
    """Tracks YouTube API quota usage within a session."""

    def __init__(self, limit: int = QUOTA_STOP_THRESHOLD):
        self.limit = limit
        self.used = 0

    def charge(self, units: int):
        self.used += units

    def can_afford(self, units: int) -> bool:
        return (self.used + units) <= self.limit

    @property
    def remaining(self) -> int:
        return max(0, self.limit - self.used)

    def __repr__(self) -> str:
        return f"Quota: {self.used}/{self.limit} used ({self.remaining} remaining)"


# --- Collection State ---

class CollectionState:
    """JSON-file-based progress tracking for resumability."""

    def __init__(self, state_file: Path):
        self.state_file = state_file
        self.data = self._load()

    def _load(self) -> dict:
        if self.state_file.exists():
            with open(self.state_file, "r") as f:
                return json.load(f)
        return {"completed": {}, "mrbeast_completed": {}}

    def save(self):
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, "w") as f:
            json.dump(self.data, f, indent=2)

    def is_panel_done(self, channel_id: str, year: int) -> bool:
        completed = self.data.get("completed", {})
        channel_data = completed.get(channel_id, {})
        year_data = channel_data.get(str(year), {})
        return year_data.get("count", 0) >= THUMBNAILS_PER_CHANNEL_YEAR

    def mark_panel_done(self, channel_id: str, year: int, count: int):
        completed = self.data.setdefault("completed", {})
        channel_data = completed.setdefault(channel_id, {})
        channel_data[str(year)] = {"count": count, "timestamp": datetime.now().isoformat()}
        self.save()

    def get_panel_count(self, channel_id: str, year: int) -> int:
        completed = self.data.get("completed", {})
        channel_data = completed.get(channel_id, {})
        year_data = channel_data.get(str(year), {})
        return year_data.get("count", 0)

    def is_mrbeast_era_done(self, era: str, target: int) -> bool:
        mrbeast = self.data.get("mrbeast_completed", {})
        return mrbeast.get(era, 0) >= target

    def mark_mrbeast_era(self, era: str, count: int):
        self.data.setdefault("mrbeast_completed", {})[era] = count
        self.save()

    def get_mrbeast_era_count(self, era: str) -> int:
        return self.data.get("mrbeast_completed", {}).get(era, 0)

    def get_summary(self) -> dict:
        """Return summary of completed collections."""
        completed = self.data.get("completed", {})
        total_channel_years = 0
        total_thumbnails = 0
        for channel_id, years in completed.items():
            for year, info in years.items():
                total_channel_years += 1
                total_thumbnails += info.get("count", 0)

        mrbeast = self.data.get("mrbeast_completed", {})
        mrbeast_total = sum(mrbeast.values())

        return {
            "panel_channel_years_done": total_channel_years,
            "panel_thumbnails": total_thumbnails,
            "mrbeast_eras": mrbeast,
            "mrbeast_total": mrbeast_total,
        }


# --- Metadata CSV ---

class MetadataWriter:
    """Manages the metadata CSV file."""

    FIELDS = [
        "file_path", "channel", "title", "video_id", "views",
        "publish_date", "duration", "group",
    ]

    def __init__(self, csv_path: Path):
        self.csv_path = csv_path
        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_header()

    def _ensure_header(self):
        if not self.csv_path.exists():
            with open(self.csv_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=self.FIELDS)
                writer.writeheader()

    def append(self, row: dict):
        with open(self.csv_path, "a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=self.FIELDS)
            writer.writerow({k: row.get(k, "") for k in self.FIELDS})


# --- YouTube Collector ---

class YouTubeCollector:
    """Wraps YouTube Data API v3 client and orchestrates collection."""

    def __init__(self, api_key: str, dry_run: bool = False):
        self.api_key = api_key
        self.dry_run = dry_run
        self.quota = QuotaTracker()
        self.state = CollectionState(STATE_FILE)
        self.metadata = MetadataWriter(METADATA_CSV)
        self.youtube = None
        if not dry_run:
            self.youtube = build("youtube", "v3", developerKey=api_key)

    def _sanitize_filename(self, name: str, max_length: int = 80) -> str:
        """Sanitize a string for use in filenames."""
        # Remove/replace problematic characters
        name = re.sub(r'[<>:"/\\|?*]', '', name)
        name = re.sub(r'\s+', ' ', name).strip()
        # Truncate
        if len(name) > max_length:
            name = name[:max_length].rstrip()
        return name

    def _download_thumbnail(self, video_id: str, dest_path: Path) -> bool:
        """Download thumbnail image, trying maxres then hq fallback."""
        urls = [
            f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
            f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
        ]

        for url in urls:
            try:
                resp = requests.get(url, timeout=15)
                if resp.status_code == 200 and len(resp.content) > 1000:
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(dest_path, "wb") as f:
                        f.write(resp.content)
                    return True
            except requests.RequestException:
                continue

        return False

    def _parse_duration_seconds(self, iso_duration: str) -> int:
        """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
        match = re.match(
            r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?',
            iso_duration or ""
        )
        if not match:
            return 0
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        return hours * 3600 + minutes * 60 + seconds

    def search_channel_year(
        self, channel_id: str, year: int, max_results: int = 50
    ) -> list[dict]:
        """Search for top videos from a channel in a given year.

        Uses search.list (100 quota units) then videos.list (1 unit) to get
        full metadata including duration and exact view counts.
        """
        if self.dry_run:
            print(f"    [DRY RUN] Would search {channel_id} for {year}")
            return []

        if not self.quota.can_afford(SEARCH_LIST_COST + VIDEOS_LIST_COST):
            print(f"    [QUOTA] Not enough quota remaining ({self.quota.remaining} units)")
            return []

        published_after = f"{year}-01-01T00:00:00Z"
        published_before = f"{year}-12-31T23:59:59Z"

        try:
            # Step 1: search.list to find top videos by view count
            search_response = self.youtube.search().list(
                channelId=channel_id,
                publishedAfter=published_after,
                publishedBefore=published_before,
                order="viewCount",
                type="video",
                maxResults=max_results,
                part="id",
            ).execute()
            self.quota.charge(SEARCH_LIST_COST)

            video_ids = [
                item["id"]["videoId"]
                for item in search_response.get("items", [])
            ]

            if not video_ids:
                return []

            # Step 2: videos.list to get full details (duration, exact views)
            videos_response = self.youtube.videos().list(
                id=",".join(video_ids),
                part="snippet,contentDetails,statistics",
            ).execute()
            self.quota.charge(VIDEOS_LIST_COST)

            videos = []
            for item in videos_response.get("items", []):
                duration_sec = self._parse_duration_seconds(
                    item["contentDetails"].get("duration", "")
                )
                # Filter out Shorts (< 60 seconds)
                if duration_sec < 60:
                    continue

                videos.append({
                    "video_id": item["id"],
                    "title": item["snippet"]["title"],
                    "channel_title": item["snippet"]["channelTitle"],
                    "publish_date": item["snippet"]["publishedAt"],
                    "views": int(item["statistics"].get("viewCount", 0)),
                    "duration": duration_sec,
                    "thumbnail_url": item["snippet"]["thumbnails"].get(
                        "maxres", item["snippet"]["thumbnails"].get("high", {})
                    ).get("url", ""),
                })

            # Re-sort by exact view count (search.list ordering is approximate)
            videos.sort(key=lambda v: v["views"], reverse=True)
            return videos

        except HttpError as e:
            print(f"    [API ERROR] {e}")
            if e.resp.status == 403:
                print("    Quota exceeded or API key invalid. Stopping.")
                self.quota.used = self.quota.limit  # Force stop
            return []

    def collect_panel(
        self,
        channel_filter: Optional[list[str]] = None,
        year_filter: Optional[list[int]] = None,
    ):
        """Collect thumbnails for panel channels.

        Args:
            channel_filter: If set, only collect these channel names.
            year_filter: If set, only collect these years.
        """
        channels_data = self._load_channels()
        panel = channels_data["panel"]

        # Apply channel name filter
        if channel_filter:
            filter_lower = [c.lower() for c in channel_filter]
            panel = [ch for ch in panel if ch["name"].lower() in filter_lower]
            if not panel:
                print(f"No channels matched filter: {channel_filter}")
                return

        years = year_filter or YEARS

        total_pairs = len(panel) * len(years)
        done_pairs = 0
        skipped_pairs = 0
        collected_total = 0

        print(f"\nPanel collection: {len(panel)} channels x {len(years)} years = {total_pairs} pairs")
        print(f"Target: {THUMBNAILS_PER_CHANNEL_YEAR} thumbnails per channel-year")
        print(f"{self.quota}\n")

        for ch in panel:
            channel_name = ch["name"]
            channel_id = ch["channel_id"]
            active_since = ch.get("active_since", 2010)

            print(f"\n{'='*60}")
            print(f"Channel: {channel_name} (active since {active_since})")
            print(f"{'='*60}")

            for year in years:
                if year < active_since:
                    print(f"  {year}: Skipped (before channel active date)")
                    skipped_pairs += 1
                    continue

                if self.state.is_panel_done(channel_id, year):
                    existing = self.state.get_panel_count(channel_id, year)
                    print(f"  {year}: Already done ({existing} thumbnails)")
                    skipped_pairs += 1
                    done_pairs += 1
                    continue

                if not self.quota.can_afford(SEARCH_LIST_COST + VIDEOS_LIST_COST):
                    print(f"\n[QUOTA EXHAUSTED] {self.quota}")
                    print(f"Progress: {done_pairs}/{total_pairs} pairs completed")
                    self.state.save()
                    return

                print(f"  {year}: Searching...")
                videos = self.search_channel_year(channel_id, year)

                if not videos:
                    print(f"  {year}: No videos found")
                    # Mark as done with 0 count so we don't retry
                    if not self.dry_run:
                        self.state.mark_panel_done(channel_id, year, 0)
                    continue

                # Download top N thumbnails
                group = str(year)
                count = 0
                for i, video in enumerate(videos[:THUMBNAILS_PER_CHANNEL_YEAR]):
                    safe_channel = self._sanitize_filename(channel_name)
                    safe_title = self._sanitize_filename(video["title"], max_length=60)
                    filename = f"{safe_channel}_{i+1:02d}_{safe_title}.jpg"
                    dest_path = THUMBNAILS_DIR / group / filename

                    if dest_path.exists():
                        count += 1
                        continue

                    if self.dry_run:
                        print(f"    [{i+1}] Would download: {filename}")
                        count += 1
                        continue

                    success = self._download_thumbnail(video["video_id"], dest_path)
                    if success:
                        count += 1
                        # Write metadata
                        self.metadata.append({
                            "file_path": str(dest_path),
                            "channel": channel_name,
                            "title": video["title"],
                            "video_id": video["video_id"],
                            "views": video["views"],
                            "publish_date": video["publish_date"],
                            "duration": video["duration"],
                            "group": group,
                        })
                        # Small delay to be polite
                        time.sleep(0.2)
                    else:
                        print(f"    [{i+1}] Failed to download: {video['video_id']}")

                print(f"  {year}: Collected {count}/{len(videos[:THUMBNAILS_PER_CHANNEL_YEAR])} thumbnails")
                collected_total += count
                done_pairs += 1

                if not self.dry_run:
                    self.state.mark_panel_done(channel_id, year, count)

        print(f"\n{'='*60}")
        print(f"PANEL COLLECTION COMPLETE")
        print(f"{'='*60}")
        print(f"Pairs completed: {done_pairs}")
        print(f"Pairs skipped: {skipped_pairs}")
        print(f"Thumbnails collected this session: {collected_total}")
        print(f"{self.quota}")

    def collect_mrbeast(self):
        """Collect expanded MrBeast reference set by era."""
        channels_data = self._load_channels()
        mrbeast = channels_data["mrbeast"]
        channel_id = mrbeast["channel_id"]
        channel_name = mrbeast["name"]

        print(f"\nMrBeast collection: {channel_name}")
        print(f"Channel ID: {channel_id}")
        print(f"{self.quota}\n")

        total_collected = 0

        for era_name, era_config in mrbeast["eras"].items():
            target = era_config["target"]
            era_years = era_config["years"]

            if self.state.is_mrbeast_era_done(era_name, target):
                existing = self.state.get_mrbeast_era_count(era_name)
                print(f"  Era '{era_name}' ({era_years}): Already done ({existing} thumbnails)")
                continue

            if not self.quota.can_afford(SEARCH_LIST_COST + VIDEOS_LIST_COST):
                print(f"\n[QUOTA EXHAUSTED] {self.quota}")
                self.state.save()
                return

            print(f"  Era '{era_name}' ({era_years}): Target {target} thumbnails")

            # Collect across all years in this era
            all_videos = []
            for year in era_years:
                videos = self.search_channel_year(channel_id, year, max_results=50)
                all_videos.extend(videos)

            # Sort by views and take top N
            all_videos.sort(key=lambda v: v["views"], reverse=True)
            selected = all_videos[:target]

            count = 0
            for i, video in enumerate(selected):
                safe_title = self._sanitize_filename(video["title"], max_length=60)
                filename = f"MrBeast_{era_name}_{i+1:02d}_{safe_title}.jpg"
                dest_path = THUMBNAILS_DIR / "mrbeast" / filename

                if dest_path.exists():
                    count += 1
                    continue

                if self.dry_run:
                    print(f"    [{i+1}] Would download: {filename}")
                    count += 1
                    continue

                success = self._download_thumbnail(video["video_id"], dest_path)
                if success:
                    count += 1
                    self.metadata.append({
                        "file_path": str(dest_path),
                        "channel": "MrBeast",
                        "title": video["title"],
                        "video_id": video["video_id"],
                        "views": video["views"],
                        "publish_date": video["publish_date"],
                        "duration": video["duration"],
                        "group": "mrbeast",
                    })
                    time.sleep(0.2)
                else:
                    print(f"    [{i+1}] Failed to download: {video['video_id']}")

            print(f"  Era '{era_name}': Collected {count} thumbnails")
            total_collected += count

            if not self.dry_run:
                self.state.mark_mrbeast_era(era_name, count)

        print(f"\nMrBeast total collected this session: {total_collected}")
        print(f"{self.quota}")

    def show_status(self):
        """Show collection progress."""
        channels_data = self._load_channels()
        summary = self.state.get_summary()

        panel = channels_data["panel"]
        total_possible = len(panel) * len(YEARS)

        print(f"\n{'='*60}")
        print("COLLECTION STATUS")
        print(f"{'='*60}")

        print(f"\nPanel channels: {len(panel)}")
        print(f"Years: {YEARS[0]}-{YEARS[-1]} ({len(YEARS)} years)")
        print(f"Target per channel-year: {THUMBNAILS_PER_CHANNEL_YEAR}")
        print(f"\nChannel-year pairs completed: {summary['panel_channel_years_done']}/{total_possible}")
        print(f"Panel thumbnails collected: {summary['panel_thumbnails']}")

        # Per-channel breakdown
        completed = self.state.data.get("completed", {})
        if completed:
            print(f"\nPer-channel progress:")
            channel_id_to_name = {ch["channel_id"]: ch["name"] for ch in panel}
            for channel_id, years in sorted(completed.items()):
                name = channel_id_to_name.get(channel_id, channel_id[:20])
                done_years = len(years)
                total_thumbs = sum(info.get("count", 0) for info in years.values())
                print(f"  {name}: {done_years}/{len(YEARS)} years, {total_thumbs} thumbnails")

        # MrBeast status
        mrbeast = channels_data["mrbeast"]
        print(f"\nMrBeast reference set:")
        for era_name, era_config in mrbeast["eras"].items():
            target = era_config["target"]
            collected = summary["mrbeast_eras"].get(era_name, 0)
            status = "DONE" if collected >= target else f"{collected}/{target}"
            print(f"  {era_name} ({era_config['years']}): {status}")
        print(f"  Total: {summary['mrbeast_total']}")

    def validate(self):
        """Check completeness and quality of collected data."""
        channels_data = self._load_channels()
        panel = channels_data["panel"]

        print(f"\n{'='*60}")
        print("VALIDATION REPORT")
        print(f"{'='*60}")

        issues = []
        warnings = []

        # Check panel coverage
        print(f"\nPanel coverage:")
        for ch in panel:
            channel_id = ch["channel_id"]
            channel_name = ch["name"]
            active_since = ch.get("active_since", 2010)
            missing_years = []
            low_count_years = []

            for year in YEARS:
                if year < active_since:
                    continue
                count = self.state.get_panel_count(channel_id, year)
                if count == 0:
                    missing_years.append(year)
                elif count < 12:
                    low_count_years.append((year, count))

            if missing_years:
                issues.append(f"  {channel_name}: Missing years: {missing_years}")
            if low_count_years:
                for y, c in low_count_years:
                    warnings.append(f"  {channel_name}/{y}: Only {c} thumbnails (target: {THUMBNAILS_PER_CHANNEL_YEAR})")

            status = "OK" if not missing_years and not low_count_years else "INCOMPLETE"
            applicable_years = [y for y in YEARS if y >= active_since]
            done = len(applicable_years) - len(missing_years)
            print(f"  {channel_name}: {done}/{len(applicable_years)} years [{status}]")

        # Check MrBeast
        mrbeast = channels_data["mrbeast"]
        print(f"\nMrBeast coverage:")
        for era_name, era_config in mrbeast["eras"].items():
            target = era_config["target"]
            collected = self.state.get_mrbeast_era_count(era_name)
            status = "OK" if collected >= target else "INCOMPLETE"
            print(f"  {era_name}: {collected}/{target} [{status}]")

        # Check for actual files on disk
        print(f"\nFile verification:")
        total_on_disk = 0
        for group_dir in THUMBNAILS_DIR.iterdir():
            if group_dir.is_dir():
                files = list(group_dir.glob("*.jpg")) + list(group_dir.glob("*.png"))
                total_on_disk += len(files)
                print(f"  {group_dir.name}/: {len(files)} files")
        print(f"  Total on disk: {total_on_disk}")

        # Check for duplicates in metadata CSV
        if METADATA_CSV.exists():
            seen_video_ids = set()
            duplicates = 0
            with open(METADATA_CSV, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    vid = row.get("video_id", "")
                    if vid in seen_video_ids:
                        duplicates += 1
                    seen_video_ids.add(vid)
            print(f"\nMetadata CSV: {len(seen_video_ids)} unique videos, {duplicates} duplicates")

        # Print issues and warnings
        if issues:
            print(f"\nISSUES ({len(issues)}):")
            for issue in issues:
                print(issue)

        if warnings:
            print(f"\nWARNINGS ({len(warnings)}):")
            for warn in warnings[:20]:
                print(warn)
            if len(warnings) > 20:
                print(f"  ... and {len(warnings) - 20} more")

        if not issues and not warnings:
            print("\nAll checks passed!")

    def _load_channels(self) -> dict:
        """Load channel registry from JSON file."""
        if not CHANNELS_FILE.exists():
            print(f"ERROR: Channel registry not found: {CHANNELS_FILE}")
            sys.exit(1)
        with open(CHANNELS_FILE, "r") as f:
            return json.load(f)


# --- CLI ---

def main():
    parser = argparse.ArgumentParser(
        description="YouTube thumbnail collection script for panel study"
    )
    subparsers = parser.add_subparsers(dest="command", help="Collection command")

    # panel command
    panel_parser = subparsers.add_parser("panel", help="Collect panel channel thumbnails")
    panel_parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview what would be collected without making API calls",
    )
    panel_parser.add_argument(
        "--channels", nargs="+", type=str,
        help="Only collect specific channels (by name)",
    )
    panel_parser.add_argument(
        "--years", nargs="+", type=int,
        help="Only collect specific years",
    )

    # mrbeast command
    mrbeast_parser = subparsers.add_parser("mrbeast", help="Expand MrBeast reference set")
    mrbeast_parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview without making API calls",
    )

    # status command
    subparsers.add_parser("status", help="Show collection progress")

    # validate command
    subparsers.add_parser("validate", help="Check completeness of collected data")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Load API key
    api_key = settings.YOUTUBE_API_KEY or os.environ.get("YOUTUBE_API_KEY", "")

    if args.command in ("panel", "mrbeast"):
        dry_run = getattr(args, "dry_run", False)

        if not api_key and not dry_run:
            print("ERROR: No YouTube API key found.")
            print("Set YOUTUBE_API_KEY in backend/.env or as environment variable.")
            sys.exit(1)

        collector = YouTubeCollector(api_key, dry_run=dry_run)

        if args.command == "panel":
            collector.collect_panel(
                channel_filter=getattr(args, "channels", None),
                year_filter=getattr(args, "years", None),
            )
        elif args.command == "mrbeast":
            collector.collect_mrbeast()

    elif args.command == "status":
        collector = YouTubeCollector(api_key or "dummy", dry_run=True)
        collector.show_status()

    elif args.command == "validate":
        collector = YouTubeCollector(api_key or "dummy", dry_run=True)
        collector.validate()


if __name__ == "__main__":
    main()
