#!/usr/bin/env python3
"""CLI script to ingest thumbnail images into the database."""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.services.ingest import ingest_all_groups, ingest_directory


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

    args = parser.parse_args()

    # Initialize database
    print("Initializing database...")
    init_db()

    root_dir = Path(args.root)
    if not root_dir.exists():
        print(f"Error: Root directory not found: {root_dir}")
        sys.exit(1)

    print(f"Scanning directory: {root_dir}")
    print(f"Force update: {args.force}")
    print()

    db = SessionLocal()
    try:
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
