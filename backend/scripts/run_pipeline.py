#!/usr/bin/env python3
"""CLI script to run the feature extraction pipeline."""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.services.pipeline import run_pipeline, get_pipeline_status, ALL_FEATURES


def main():
    parser = argparse.ArgumentParser(
        description="Run feature extraction pipeline on thumbnails"
    )
    parser.add_argument(
        "--group",
        type=str,
        choices=settings.VALID_GROUPS,
        help="Only process a specific group (default: all groups)",
    )
    parser.add_argument(
        "--features",
        type=str,
        nargs="+",
        choices=list(ALL_FEATURES),
        help="Specific features to extract (default: all)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force reprocess all thumbnails",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Limit number of thumbnails to process",
    )
    parser.add_argument(
        "--save-depth-maps",
        action="store_true",
        help="Save depth map visualizations to outputs/depth_maps/",
    )
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show pipeline status and exit",
    )

    args = parser.parse_args()

    # Initialize database
    print("Initializing database...")
    init_db()

    db = SessionLocal()
    try:
        # Show status if requested
        if args.status:
            status = get_pipeline_status(db)
            print("\nPIPELINE STATUS")
            print("=" * 40)
            print(f"Total thumbnails:  {status['total_thumbnails']}")
            print(f"Processed:         {status['processed']}")
            print(f"Unprocessed:       {status['unprocessed']}")
            print(f"Completion:        {status['completion_percentage']}%")
            return

        # Prepare features set
        features = set(args.features) if args.features else None

        print("\nRUNNING PIPELINE")
        print("=" * 40)
        print(f"Group:          {args.group or 'all'}")
        print(f"Features:       {', '.join(features) if features else 'all'}")
        print(f"Force:          {args.force}")
        print(f"Limit:          {args.limit or 'none'}")
        print(f"Save depth maps: {args.save_depth_maps}")
        print()

        # Run pipeline
        stats = run_pipeline(
            db,
            group=args.group,
            features=features,
            force=args.force,
            limit=args.limit,
            save_depth_maps=args.save_depth_maps,
        )

        # Print results
        print("\n" + "=" * 40)
        print("PIPELINE RESULTS")
        print("=" * 40)
        print(f"Total found:    {stats['total']}")
        print(f"Processed:      {stats['processed']}")
        print(f"Skipped:        {stats['skipped']}")
        print(f"Errors:         {stats['errors']}")
        print(f"Total time:     {stats['total_time']}s")

        if stats["error_details"]:
            print("\nError details:")
            for err in stats["error_details"][:10]:
                print(f"  - Thumbnail {err['thumbnail_id']}: {err['error']}")
            if len(stats["error_details"]) > 10:
                print(f"  ... and {len(stats['error_details']) - 10} more errors")

        # Show updated status
        print()
        status = get_pipeline_status(db)
        print(f"Pipeline completion: {status['completion_percentage']}%")

    finally:
        db.close()


if __name__ == "__main__":
    main()
