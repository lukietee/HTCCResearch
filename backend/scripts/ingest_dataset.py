#!/usr/bin/env python3
"""CLI script to ingest thumbnail images into the database."""

import argparse
import csv
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.services.ingest import ingest_all_groups, ingest_directory, ingest_thumbnail


def ingest_from_csv(db, csv_path: Path, force: bool = False) -> dict:
    """Ingest thumbnails from a metadata CSV file with full metadata.

    CSV expected columns: file_path, channel, title, video_id, views,
    publish_date, duration, group

    Args:
        db: Database session
        csv_path: Path to the CSV file
        force: If True, update existing records

    Returns:
        Dictionary with ingestion statistics
    """
    stats = {
        "total_found": 0,
        "created": 0,
        "skipped": 0,
        "updated": 0,
        "errors": 0,
        "error_files": [],
    }

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            stats["total_found"] += 1

            file_path = Path(row.get("file_path", ""))
            if not file_path.exists():
                stats["errors"] += 1
                stats["error_files"].append({
                    "path": str(file_path),
                    "error": "File not found",
                })
                continue

            group = row.get("group", "")
            if not group:
                stats["errors"] += 1
                stats["error_files"].append({
                    "path": str(file_path),
                    "error": "Missing group",
                })
                continue

            # Build metadata from CSV columns
            metadata = {
                "channel": row.get("channel") or None,
                "title": row.get("title") or None,
                "url": f"https://youtube.com/watch?v={row['video_id']}" if row.get("video_id") else None,
            }

            # Parse views
            views_str = row.get("views", "")
            if views_str:
                try:
                    metadata["views"] = int(views_str)
                except ValueError:
                    pass

            # Parse publish_date
            publish_str = row.get("publish_date", "")
            if publish_str:
                try:
                    metadata["publish_date"] = datetime.fromisoformat(
                        publish_str.replace("Z", "+00:00")
                    )
                    metadata["year"] = metadata["publish_date"].year
                except ValueError:
                    pass

            try:
                thumbnail, was_created = ingest_thumbnail(
                    db, file_path, group, metadata=metadata, force=force,
                )
                if was_created:
                    stats["created"] += 1
                elif force:
                    stats["updated"] += 1
                else:
                    stats["skipped"] += 1
            except Exception as e:
                stats["errors"] += 1
                stats["error_files"].append({
                    "path": str(file_path),
                    "error": str(e),
                })

    return stats


def main():
    parser = argparse.ArgumentParser(
        description="Ingest thumbnail images into the database"
    )
    parser.add_argument(
        "--root",
        type=str,
        default=str(settings.THUMBNAILS_DIR),
        help="Root directory containing group folders (default: backend/data/thumbnails)",
    )
    parser.add_argument(
        "--group",
        type=str,
        choices=settings.VALID_GROUPS,
        help="Only ingest a specific group (default: all groups)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force update existing records",
    )
    parser.add_argument(
        "--from-csv",
        type=str,
        dest="csv_path",
        help="Ingest from a metadata CSV file (produced by collect_youtube.py)",
    )

    args = parser.parse_args()

    # Initialize database
    print("Initializing database...")
    init_db()

    db = SessionLocal()
    try:
        if args.csv_path:
            # CSV-based ingestion
            csv_path = Path(args.csv_path)
            if not csv_path.exists():
                print(f"Error: CSV file not found: {csv_path}")
                sys.exit(1)

            print(f"Ingesting from CSV: {csv_path}")
            print(f"Force update: {args.force}")
            print()

            stats = ingest_from_csv(db, csv_path, force=args.force)

            print("\n" + "=" * 50)
            print("CSV INGESTION RESULTS")
            print("=" * 50)
            print(f"  Found:   {stats['total_found']}")
            print(f"  Created: {stats['created']}")
            print(f"  Updated: {stats.get('updated', 0)}")
            print(f"  Skipped: {stats['skipped']}")
            print(f"  Errors:  {stats['errors']}")

            if stats.get("error_files"):
                print("\n  Error files:")
                for err in stats["error_files"][:10]:
                    print(f"    - {err['path']}: {err['error']}")
                if len(stats["error_files"]) > 10:
                    print(f"    ... and {len(stats['error_files']) - 10} more")

        else:
            # Directory-based ingestion (original behavior)
            root_dir = Path(args.root)
            if not root_dir.exists():
                print(f"Error: Root directory not found: {root_dir}")
                sys.exit(1)

            print(f"Scanning directory: {root_dir}")
            print(f"Force update: {args.force}")
            print()

            if args.group:
                # Ingest single group
                group_dir = root_dir / args.group
                print(f"Ingesting group: {args.group}")
                stats = ingest_directory(db, group_dir, args.group, force=args.force)
                results = {args.group: stats}
            else:
                # Ingest all groups
                print("Ingesting all groups...")
                results = ingest_all_groups(db, root_dir, force=args.force)

            # Print results
            print("\n" + "=" * 50)
            print("INGESTION RESULTS")
            print("=" * 50)

            total_created = 0
            total_skipped = 0
            total_errors = 0

            for group, stats in results.items():
                print(f"\n{group.upper()}:")
                print(f"  Found:   {stats['total_found']}")
                print(f"  Created: {stats['created']}")
                print(f"  Skipped: {stats['skipped']}")
                print(f"  Errors:  {stats['errors']}")

                if stats.get("warning"):
                    print(f"  Warning: {stats['warning']}")

                if stats.get("error_files"):
                    print("  Error files:")
                    for err in stats["error_files"][:5]:  # Show first 5 errors
                        print(f"    - {err['path']}: {err['error']}")
                    if len(stats["error_files"]) > 5:
                        print(f"    ... and {len(stats['error_files']) - 5} more")

                total_created += stats["created"]
                total_skipped += stats["skipped"]
                total_errors += stats["errors"]

            print("\n" + "-" * 50)
            print(f"TOTAL: {total_created} created, {total_skipped} skipped, {total_errors} errors")

    finally:
        db.close()


if __name__ == "__main__":
    main()
