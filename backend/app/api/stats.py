"""Statistics API endpoints."""

from typing import Optional, List, Dict, Any
from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from app.core.db import get_db
from app.core.config import settings
from app.models.thumbnail import Thumbnail


router = APIRouter()


class OverviewResponse(BaseModel):
    """Response model for overview statistics."""

    total_thumbnails: int
    by_group: Dict[str, int]
    by_year: Dict[str, int]
    features_extracted: int
    missing_views: int
    missing_ctr: int


class DistributionResponse(BaseModel):
    """Response model for feature distribution."""

    feature: str
    group: Optional[str]
    values: List[float]
    histogram: List[Dict[str, Any]]
    stats: Dict[str, float]


class CompareResponse(BaseModel):
    """Response model for group comparison."""

    feature: str
    groups: Dict[str, Dict[str, float]]


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(db: Session = Depends(get_db)):
    """Get overview statistics of the dataset."""
    total = db.query(Thumbnail).count()

    # Count by group
    by_group = {}
    for group in settings.VALID_GROUPS:
        count = db.query(Thumbnail).filter(Thumbnail.group == group).count()
        by_group[group] = count

    # Count by year
    year_counts = db.query(
        Thumbnail.year, func.count(Thumbnail.id)
    ).filter(
        Thumbnail.year != None
    ).group_by(Thumbnail.year).all()

    by_year = {str(year): count for year, count in year_counts}

    # Features extracted count
    features_extracted = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True
    ).count()

    # Missing data counts
    missing_views = db.query(Thumbnail).filter(Thumbnail.views == None).count()
    missing_ctr = db.query(Thumbnail).filter(Thumbnail.ctr == None).count()

    return OverviewResponse(
        total_thumbnails=total,
        by_group=by_group,
        by_year=by_year,
        features_extracted=features_extracted,
        missing_views=missing_views,
        missing_ctr=missing_ctr,
    )


@router.get("/distributions")
async def get_distribution(
    db: Session = Depends(get_db),
    feature: str = Query(..., description="Feature path (e.g., 'color.avg_saturation')"),
    group: Optional[str] = Query(None, description="Filter by group"),
    bins: int = Query(20, ge=5, le=100, description="Number of histogram bins"),
):
    """Get distribution of a specific feature."""
    # Parse feature path
    parts = feature.split(".")
    if len(parts) != 2:
        return {"error": "Feature must be in format 'category.feature_name'"}

    category, feature_name = parts

    # Query thumbnails
    query = db.query(Thumbnail).filter(Thumbnail.features_extracted == True)
    if group:
        query = query.filter(Thumbnail.group == group)

    thumbnails = query.all()

    # Extract feature values
    values = []
    for thumb in thumbnails:
        features = thumb.get_features()
        if category in features and feature_name in features[category]:
            value = features[category][feature_name]
            if isinstance(value, (int, float)):
                values.append(float(value))
            elif isinstance(value, bool):
                values.append(1.0 if value else 0.0)

    if not values:
        return {
            "feature": feature,
            "group": group,
            "values": [],
            "histogram": [],
            "stats": {},
        }

    # Calculate histogram
    import numpy as np

    values_np = np.array(values)
    hist, bin_edges = np.histogram(values_np, bins=bins)

    histogram = []
    for i in range(len(hist)):
        histogram.append({
            "bin_start": float(bin_edges[i]),
            "bin_end": float(bin_edges[i + 1]),
            "count": int(hist[i]),
        })

    # Calculate stats
    stats = {
        "count": len(values),
        "mean": float(np.mean(values_np)),
        "median": float(np.median(values_np)),
        "std": float(np.std(values_np)),
        "min": float(np.min(values_np)),
        "max": float(np.max(values_np)),
        "q25": float(np.percentile(values_np, 25)),
        "q75": float(np.percentile(values_np, 75)),
    }

    return {
        "feature": feature,
        "group": group,
        "values": values,
        "histogram": histogram,
        "stats": stats,
    }


@router.get("/compare")
async def compare_groups(
    db: Session = Depends(get_db),
    feature: str = Query(..., description="Feature path (e.g., 'color.avg_saturation')"),
):
    """Compare a feature across all groups."""
    import numpy as np

    # Parse feature path
    parts = feature.split(".")
    if len(parts) != 2:
        return {"error": "Feature must be in format 'category.feature_name'"}

    category, feature_name = parts

    # Get values per group
    groups_data = {}

    for group in settings.VALID_GROUPS:
        thumbnails = db.query(Thumbnail).filter(
            Thumbnail.group == group,
            Thumbnail.features_extracted == True,
        ).all()

        values = []
        for thumb in thumbnails:
            features = thumb.get_features()
            if category in features and feature_name in features[category]:
                value = features[category][feature_name]
                if isinstance(value, (int, float)):
                    values.append(float(value))
                elif isinstance(value, bool):
                    values.append(1.0 if value else 0.0)

        if values:
            values_np = np.array(values)
            groups_data[group] = {
                "count": len(values),
                "mean": float(np.mean(values_np)),
                "median": float(np.median(values_np)),
                "std": float(np.std(values_np)),
                "min": float(np.min(values_np)),
                "max": float(np.max(values_np)),
            }
        else:
            groups_data[group] = {
                "count": 0,
                "mean": 0,
                "median": 0,
                "std": 0,
                "min": 0,
                "max": 0,
            }

    return {
        "feature": feature,
        "groups": groups_data,
    }


@router.get("/correlations")
async def get_correlations(
    db: Session = Depends(get_db),
    target: str = Query("views", description="Target variable (views or ctr)"),
):
    """Get correlation between features and target variable (views/CTR)."""
    import numpy as np
    from scipy import stats as scipy_stats

    # Define features to correlate
    feature_paths = [
        ("color", "avg_saturation"),
        ("color", "avg_brightness"),
        ("color", "warm_cool_score"),
        ("text", "text_area_ratio"),
        ("text", "text_box_count"),
        ("face", "face_count"),
        ("face", "largest_face_area_ratio"),
        ("pose", "hand_visible_count"),
        ("depth", "depth_contrast"),
        ("depth", "foreground_ratio"),
    ]

    # Get thumbnails with target variable
    query = db.query(Thumbnail).filter(Thumbnail.features_extracted == True)

    if target == "views":
        query = query.filter(Thumbnail.views != None)
    elif target == "ctr":
        query = query.filter(Thumbnail.ctr != None)
    else:
        return {"error": "Target must be 'views' or 'ctr'"}

    thumbnails = query.all()

    if len(thumbnails) < 10:
        return {
            "error": "Not enough data points for correlation",
            "count": len(thumbnails),
        }

    # Build data arrays
    correlations = []

    target_values = []
    for thumb in thumbnails:
        if target == "views":
            target_values.append(float(thumb.views))
        else:
            target_values.append(float(thumb.ctr))

    target_np = np.array(target_values)

    for category, feature_name in feature_paths:
        feature_values = []
        valid_indices = []

        for i, thumb in enumerate(thumbnails):
            features = thumb.get_features()
            if category in features and feature_name in features[category]:
                value = features[category][feature_name]
                if isinstance(value, (int, float)):
                    feature_values.append(float(value))
                    valid_indices.append(i)

        if len(feature_values) < 10:
            continue

        feature_np = np.array(feature_values)
        target_subset = target_np[valid_indices]

        # Calculate Pearson correlation
        corr, p_value = scipy_stats.pearsonr(feature_np, target_subset)

        correlations.append({
            "feature": f"{category}.{feature_name}",
            "correlation": round(corr, 4),
            "p_value": round(p_value, 6),
            "sample_size": len(feature_values),
            "significant": p_value < 0.05,
        })

    # Sort by absolute correlation
    correlations.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "target": target,
        "total_samples": len(thumbnails),
        "correlations": correlations,
    }
