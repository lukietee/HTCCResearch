"""Feature extraction pipeline orchestration."""

from typing import Dict, Any, List, Optional, Set
from pathlib import Path
import time

from sqlalchemy.orm import Session

from app.models.thumbnail import Thumbnail
from app.services.features_color import extract_color_features
from app.services.features_text import extract_text_features
from app.services.features_face import extract_face_features
from app.services.features_pose import extract_pose_features
from app.services.features_depth import extract_depth_features
from app.services.features_title import extract_title_features


# Available feature extractors
FEATURE_EXTRACTORS = {
    "color": extract_color_features,
    "text": extract_text_features,
    "face": extract_face_features,
    "pose": extract_pose_features,
    "depth": extract_depth_features,
    "title": extract_title_features,
}

# Extractors that use DB metadata (title, channel) instead of image_path
METADATA_EXTRACTORS = {"title"}

ALL_FEATURES = set(FEATURE_EXTRACTORS.keys())


def extract_all_features(
    image_path: str,
    features: Optional[Set[str]] = None,
    save_depth_map: bool = False,
    title: Optional[str] = None,
    channel: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Extract all (or selected) features from an image.

    Args:
        image_path: Path to the image file
        features: Set of feature types to extract (default: all)
        save_depth_map: If True, save depth map visualization
        title: Video title (for title feature extraction)
        channel: Channel name (for title cleaning)

    Returns:
        Dictionary with all extracted features
    """
    if features is None:
        features = ALL_FEATURES

    result = {}
    errors = []

    for feature_name in features:
        if feature_name not in FEATURE_EXTRACTORS:
            errors.append(f"Unknown feature type: {feature_name}")
            continue

        extractor = FEATURE_EXTRACTORS[feature_name]

        try:
            if feature_name in METADATA_EXTRACTORS:
                feature_data = extractor(title or "", channel=channel)
            elif feature_name == "depth":
                feature_data = extractor(image_path, save_depth_map=save_depth_map)
            else:
                feature_data = extractor(image_path)

            if feature_data:
                result[feature_name] = feature_data
        except Exception as e:
            errors.append(f"{feature_name}: {str(e)}")
            result[feature_name] = {"error": str(e)}

    if errors:
        result["_errors"] = errors

    return result


def process_thumbnail(
    db: Session,
    thumbnail: Thumbnail,
    features: Optional[Set[str]] = None,
    force: bool = False,
    save_depth_map: bool = False,
) -> Dict[str, Any]:
    """
    Process a single thumbnail and update its features in the database.

    Args:
        db: Database session
        thumbnail: Thumbnail record to process
        features: Set of feature types to extract (default: all)
        force: If True, reprocess even if already processed
        save_depth_map: If True, save depth map visualization

    Returns:
        Dictionary with processing status and extracted features
    """
    if features is None:
        features = ALL_FEATURES

    # Check if already processed (unless force)
    if thumbnail.features_extracted and not force:
        existing = thumbnail.get_features()
        # Check if all requested features are present
        missing = features - set(existing.keys())
        if not missing:
            return {
                "status": "skipped",
                "reason": "already processed",
                "thumbnail_id": thumbnail.id,
            }
        # Only process missing features
        features = missing

    # Extract features
    start_time = time.time()
    extracted = extract_all_features(
        thumbnail.file_path,
        features=features,
        save_depth_map=save_depth_map,
        title=thumbnail.title,
        channel=thumbnail.channel,
    )
    processing_time = time.time() - start_time

    # Update database
    thumbnail.update_features(extracted)
    db.commit()

    return {
        "status": "processed",
        "thumbnail_id": thumbnail.id,
        "features_extracted": list(extracted.keys()),
        "processing_time": round(processing_time, 2),
        "errors": extracted.get("_errors", []),
    }


def run_pipeline(
    db: Session,
    group: Optional[str] = None,
    features: Optional[Set[str]] = None,
    force: bool = False,
    limit: Optional[int] = None,
    save_depth_maps: bool = False,
) -> Dict[str, Any]:
    """
    Run the feature extraction pipeline on thumbnails.

    Args:
        db: Database session
        group: Filter by group (default: all groups)
        features: Set of feature types to extract (default: all)
        force: If True, reprocess all thumbnails
        limit: Maximum number of thumbnails to process
        save_depth_maps: If True, save depth map visualizations

    Returns:
        Dictionary with pipeline statistics
    """
    if features is None:
        features = ALL_FEATURES

    # Build query
    query = db.query(Thumbnail)

    if group:
        query = query.filter(Thumbnail.group == group)

    if not force:
        # Only get unprocessed or partially processed
        query = query.filter(
            (Thumbnail.features_extracted == False) |
            (Thumbnail.features_json == None)
        )

    if limit:
        query = query.limit(limit)

    thumbnails = query.all()

    stats = {
        "total": len(thumbnails),
        "processed": 0,
        "skipped": 0,
        "errors": 0,
        "error_details": [],
        "total_time": 0,
    }

    start_time = time.time()

    for i, thumbnail in enumerate(thumbnails):
        try:
            result = process_thumbnail(
                db,
                thumbnail,
                features=features,
                force=force,
                save_depth_map=save_depth_maps,
            )

            if result["status"] == "processed":
                stats["processed"] += 1
            else:
                stats["skipped"] += 1

            if result.get("errors"):
                stats["error_details"].extend([
                    {"thumbnail_id": thumbnail.id, "error": e}
                    for e in result["errors"]
                ])

            # Progress logging
            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1}/{len(thumbnails)} thumbnails...")

        except Exception as e:
            stats["errors"] += 1
            stats["error_details"].append({
                "thumbnail_id": thumbnail.id,
                "error": str(e),
            })

    stats["total_time"] = round(time.time() - start_time, 2)

    return stats


def get_pipeline_status(db: Session) -> Dict[str, Any]:
    """
    Get the current status of the pipeline (processed vs unprocessed).

    Args:
        db: Database session

    Returns:
        Dictionary with pipeline status
    """
    total = db.query(Thumbnail).count()
    processed = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True
    ).count()

    return {
        "total_thumbnails": total,
        "processed": processed,
        "unprocessed": total - processed,
        "completion_percentage": round(processed / total * 100, 1) if total > 0 else 0,
    }
