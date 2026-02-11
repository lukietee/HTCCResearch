"""Thumbnail ingestion service."""

import re
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import datetime

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.thumbnail import Thumbnail
from app.utils.images import is_image_file, get_image_dimensions


def scan_directory_for_images(directory: Path) -> List[Path]:
    """
    Recursively scan a directory for image files.

    Args:
        directory: Directory to scan

    Returns:
        List of paths to image files
    """
    if not directory.exists():
        return []

    images = []
    for path in directory.rglob("*"):
        if path.is_file() and is_image_file(path):
            images.append(path)

    return sorted(images)


def extract_metadata_from_path(file_path: Path, group: str) -> dict:
    """
    Extract metadata from file path and filename.

    Attempts to parse:
    - Year from filename (e.g., "2020_thumbnail.jpg" or "video_2020.png")
    - Title from filename

    Args:
        file_path: Path to the image file
        group: Thumbnail group (mrbeast, modern, historical)

    Returns:
        Dictionary with extracted metadata
    """
    filename = file_path.stem  # Filename without extension
    metadata = {
        "group": group,
        "source": "local",
        "file_path": str(file_path.resolve()),
        "title": None,
        "year": None,
    }

    # Try to extract year from filename
    # Match patterns like: 2020, _2020_, -2020-
    year_patterns = [
        r"[_\-\s]?(20[0-2][0-9])[_\-\s]?",  # Years 2000-2029
        r"^(20[0-2][0-9])$",  # Just the year
    ]

    for pattern in year_patterns:
        match = re.search(pattern, filename)
        if match:
            year = int(match.group(1))
            if 2000 <= year <= 2030:  # Sanity check
                metadata["year"] = year
                break

    # Try to parse channel name from {ChannelName}_{NN}_{Title}.jpg format
    # e.g., "MKBHD_03_Best Phones 2024.jpg" -> channel="MKBHD", title="Best Phones 2024"
    channel_pattern = r"^(.+?)_(\d{2})_(.+)$"
    channel_match = re.match(channel_pattern, filename)
    if channel_match:
        metadata["channel"] = channel_match.group(1).replace("_", " ")
        metadata["title"] = channel_match.group(3).strip()
    else:
        # Fallback: use filename as title (cleaned up)
        clean_title = re.sub(r"[_\-]+", " ", filename)
        clean_title = re.sub(r"\s+", " ", clean_title).strip()
        if clean_title:
            metadata["title"] = clean_title

    return metadata


def ingest_thumbnail(
    db: Session,
    file_path: Path,
    group: str,
    metadata: Optional[dict] = None,
    force: bool = False,
) -> Tuple[Optional[Thumbnail], bool]:
    """
    Ingest a single thumbnail into the database.

    Args:
        db: Database session
        file_path: Path to the image file
        group: Thumbnail group
        metadata: Optional additional metadata
        force: If True, update existing record

    Returns:
        Tuple of (Thumbnail object, was_created boolean)
    """
    file_path = Path(file_path).resolve()

    # Check if already exists
    existing = db.query(Thumbnail).filter(
        Thumbnail.file_path == str(file_path)
    ).first()

    if existing and not force:
        return existing, False

    # Extract metadata from path
    extracted = extract_metadata_from_path(file_path, group)

    # Merge with provided metadata
    if metadata:
        extracted.update({k: v for k, v in metadata.items() if v is not None})

    if existing:
        # Update existing record
        for key, value in extracted.items():
            if hasattr(existing, key) and value is not None:
                setattr(existing, key, value)
        db.commit()
        return existing, False
    else:
        # Create new record
        thumbnail = Thumbnail(**extracted)
        db.add(thumbnail)
        db.commit()
        db.refresh(thumbnail)
        return thumbnail, True


def ingest_directory(
    db: Session,
    directory: Path,
    group: str,
    force: bool = False,
) -> dict:
    """
    Ingest all images from a directory.

    Args:
        db: Database session
        directory: Directory containing images
        group: Thumbnail group for all images in directory
        force: If True, update existing records

    Returns:
        Dictionary with ingestion statistics
    """
    stats = {
        "total_found": 0,
        "created": 0,
        "skipped": 0,
        "errors": 0,
        "error_files": [],
    }

    images = scan_directory_for_images(directory)
    stats["total_found"] = len(images)

    for image_path in images:
        try:
            thumbnail, was_created = ingest_thumbnail(
                db, image_path, group, force=force
            )
            if was_created:
                stats["created"] += 1
            else:
                stats["skipped"] += 1
        except Exception as e:
            stats["errors"] += 1
            stats["error_files"].append({"path": str(image_path), "error": str(e)})

    return stats


def ingest_all_groups(db: Session, root_dir: Path, force: bool = False) -> dict:
    """
    Ingest images from all group directories.

    Expected structure:
    root_dir/
        mrbeast/
        modern/
        historical/

    Args:
        db: Database session
        root_dir: Root thumbnails directory
        force: If True, update existing records

    Returns:
        Dictionary with per-group statistics
    """
    results = {}

    for group in settings.VALID_GROUPS:
        group_dir = root_dir / group
        if group_dir.exists():
            results[group] = ingest_directory(db, group_dir, group, force=force)
        else:
            results[group] = {
                "total_found": 0,
                "created": 0,
                "skipped": 0,
                "errors": 0,
                "error_files": [],
                "warning": f"Directory not found: {group_dir}",
            }

    return results
