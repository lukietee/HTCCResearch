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


def _resolve_feature_value(features: dict, feature_path: str):
    """Resolve a dotted feature path like 'face.emotion_proxies.smile_score'."""
    parts = feature_path.split(".")
    if len(parts) < 2:
        return None
    category = parts[0]
    if category not in features:
        return None
    value = features[category]
    for part in parts[1:]:
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            return None
    if isinstance(value, bool):
        return 1.0 if value else 0.0
    if isinstance(value, (int, float)):
        return float(value)
    return None


@router.get("/distributions")
async def get_distribution(
    db: Session = Depends(get_db),
    feature: str = Query(..., description="Feature path (e.g., 'color.avg_saturation')"),
    group: Optional[str] = Query(None, description="Filter by group"),
    bins: int = Query(20, ge=5, le=100, description="Number of histogram bins"),
):
    """Get distribution of a specific feature."""
    # Query thumbnails
    query = db.query(Thumbnail).filter(Thumbnail.features_extracted == True)
    if group:
        query = query.filter(Thumbnail.group == group)

    thumbnails = query.all()

    # Extract feature values
    values = []
    for thumb in thumbnails:
        features = thumb.get_features()
        value = _resolve_feature_value(features, feature)
        if value is not None:
            values.append(value)

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
            value = _resolve_feature_value(features, feature)
            if value is not None:
                values.append(value)

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


def _compute_likeness_score(f: dict) -> int:
    """Compute 0-8 MrBeast-likeness score from extracted features."""
    score = 0
    if f.get("color", {}).get("avg_brightness", 0) >= 0.60:
        score += 1
    if f.get("face", {}).get("face_count", 0) >= 1:
        score += 1
    if f.get("text", {}).get("text_area_ratio", 1) <= 0.005:
        score += 1
    if f.get("face", {}).get("emotion_proxies", {}).get("smile_score", 0) >= 0.40:
        score += 1
    if f.get("face", {}).get("emotion_proxies", {}).get("mouth_open_score", 0) >= 0.15:
        score += 1
    if f.get("pose", {}).get("body_coverage", 0) >= 0.30:
        score += 1
    if f.get("face", {}).get("emotion_proxies", {}).get("brow_raise_score", 0) >= 0.30:
        score += 1
    if f.get("face", {}).get("largest_face_area_ratio", 0) >= 0.06:
        score += 1
    return score


@router.get("/mrbeast-likeness")
async def mrbeast_likeness(db: Session = Depends(get_db)):
    """Compute per-group MrBeast-likeness scores using trait thresholds.

    Each thumbnail gets 0-8 points:
      +1 brightness >= 0.60
      +1 face_count >= 1
      +1 text_area <= 0.005
      +1 smile_score >= 0.40
      +1 mouth_open_score >= 0.15
      +1 body_coverage >= 0.30
      +1 brow_raise_score >= 0.30
      +1 largest_face_area_ratio >= 0.06
    """
    import numpy as np

    thumbnails = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True
    ).all()

    groups_data = defaultdict(list)
    for thumb in thumbnails:
        f = thumb.get_features()
        score = _compute_likeness_score(f)
        groups_data[thumb.group].append(score)

    result = {}
    for group, scores in groups_data.items():
        arr = np.array(scores)
        result[group] = {
            "count": len(scores),
            "mean_score": round(float(np.mean(arr)), 3),
            "median_score": float(np.median(arr)),
            "pct_4plus": round(float(np.mean(arr >= 4) * 100), 1),
            "pct_5plus": round(float(np.mean(arr >= 5) * 100), 1),
            "pct_6plus": round(float(np.mean(arr >= 6) * 100), 1),
            "pct_7plus": round(float(np.mean(arr >= 7) * 100), 1),
            "pct_8": round(float(np.mean(arr >= 8) * 100), 1),
            "score_distribution": {
                str(i): int(np.sum(arr == i)) for i in range(9)
            },
        }

    return {
        "criteria": [
            "brightness >= 0.60",
            "face_count >= 1",
            "text_area <= 0.005",
            "smile_score >= 0.40",
            "mouth_open_score >= 0.15",
            "body_coverage >= 0.30",
            "brow_raise_score >= 0.30",
            "largest_face_area_ratio >= 0.06",
        ],
        "max_score": 8,
        "groups": result,
    }


@router.get("/channel-evolution")
async def channel_evolution(
    db: Session = Depends(get_db),
    min_years: int = Query(2, ge=2, description="Minimum number of year groups a channel must appear in"),
):
    """Track how channels evolve their MrBeast-likeness score over time.

    Returns per-channel, per-year likeness scores for channels that span
    multiple year groups.
    """
    import numpy as np

    thumbnails = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True,
        Thumbnail.channel != None,
        Thumbnail.channel != "",
    ).all()

    # group by channel -> year -> scores
    channel_year_scores: Dict[str, Dict[str, List]] = defaultdict(lambda: defaultdict(list))

    for thumb in thumbnails:
        f = thumb.get_features()
        score = _compute_likeness_score(f)
        channel_year_scores[thumb.channel][thumb.group].append(score)

    # Filter to channels with enough year groups (exclude mrbeast group)
    channels = {}
    for ch, year_data in channel_year_scores.items():
        year_groups = {y: scores for y, scores in year_data.items() if y != "mrbeast"}
        if len(year_groups) >= min_years:
            years_summary = {}
            for y, scores in sorted(year_groups.items()):
                arr = np.array(scores)
                years_summary[y] = {
                    "count": len(scores),
                    "mean_score": round(float(np.mean(arr)), 3),
                    "pct_4plus": round(float(np.mean(arr >= 4) * 100), 1),
                }
            channels[ch] = {
                "num_years": len(year_groups),
                "years": years_summary,
            }

    # Compute overall trend: for channels with 3+ years, compute slope of mean_score over time
    trends = []
    for ch, data in channels.items():
        years_list = sorted(data["years"].keys())
        if len(years_list) >= 2:
            x = [int(y) for y in years_list]
            y_vals = [data["years"][y]["mean_score"] for y in years_list]
            # simple linear regression slope
            x_arr = np.array(x, dtype=float)
            y_arr = np.array(y_vals, dtype=float)
            slope = float(np.polyfit(x_arr, y_arr, 1)[0])
            trends.append({
                "channel": ch,
                "slope": round(slope, 4),
                "start_score": y_vals[0],
                "end_score": y_vals[-1],
                "start_year": years_list[0],
                "end_year": years_list[-1],
                "num_years": len(years_list),
            })

    trends.sort(key=lambda t: t["slope"], reverse=True)

    converging = len([t for t in trends if t["slope"] > 0])
    diverging = len([t for t in trends if t["slope"] < 0])
    flat = len([t for t in trends if t["slope"] == 0])

    return {
        "total_channels": len(channels),
        "channels": channels,
        "trends": trends,
        "summary": {
            "converging_toward_mrbeast": converging,
            "diverging_from_mrbeast": diverging,
            "flat": flat,
            "avg_slope": round(float(np.mean([t["slope"] for t in trends])), 4) if trends else 0,
        },
    }


@router.get("/mrbeast-similarity")
async def mrbeast_similarity(db: Session = Depends(get_db)):
    """Compute continuous 0-100 MrBeast similarity score per thumbnail.

    Uses z-score distance from MrBeast centroid across the 10 most
    discriminative features, converted to a percentage via exponential decay.
    """
    import numpy as np

    # 10 most discriminative features and their extraction paths
    FEATURE_DEFS = [
        ("avg_brightness",         ("color", "avg_brightness")),
        ("face_count",             ("face", "face_count")),
        ("largest_face_area_ratio",("face", "largest_face_area_ratio")),
        ("smile_score",            ("face", "emotion_proxies", "smile_score")),
        ("mouth_open_score",       ("face", "emotion_proxies", "mouth_open_score")),
        ("brow_raise_score",       ("face", "emotion_proxies", "brow_raise_score")),
        ("body_coverage",          ("pose", "body_coverage")),
        ("text_box_count",         ("text", "text_box_count")),
        ("text_area_ratio",        ("text", "text_area_ratio")),
        ("avg_saturation",         ("color", "avg_saturation")),
    ]
    FEATURE_NAMES = [name for name, _ in FEATURE_DEFS]
    NUM_FEATURES = len(FEATURE_NAMES)

    thumbnails = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True
    ).all()

    def _extract_vector(thumb):
        f = thumb.get_features()
        values = []
        for _, path in FEATURE_DEFS:
            val = f
            for key in path:
                if isinstance(val, dict) and key in val:
                    val = val[key]
                else:
                    val = None
                    break
            if val is not None and isinstance(val, (int, float)):
                values.append(float(val))
            else:
                values.append(float("nan"))
        return values

    # Separate MrBeast vs year groups
    mrbeast_vectors = []
    group_thumbs: Dict[str, list] = defaultdict(list)

    for thumb in thumbnails:
        vec = _extract_vector(thumb)
        group_thumbs[thumb.group].append(vec)
        if thumb.group == "mrbeast":
            mrbeast_vectors.append(vec)

    if not mrbeast_vectors:
        return {"error": "No MrBeast thumbnails found"}

    # MrBeast centroid (mean + std per feature)
    mb_array = np.array(mrbeast_vectors, dtype=float)
    mb_mean = np.nanmean(mb_array, axis=0)
    mb_std = np.nanstd(mb_array, axis=0)
    mb_std = np.where(mb_std < 1e-6, 1e-6, mb_std)  # avoid /0

    def _similarity(vec):
        arr = np.array(vec, dtype=float)
        z = np.abs((arr - mb_mean) / mb_std)
        valid = ~np.isnan(z)
        if not np.any(valid):
            return None
        avg_z = float(np.mean(z[valid]))
        return round(100.0 * float(np.exp(-avg_z / 2)), 1)

    # Per-group similarity stats
    groups_result = {}
    for group, vecs in group_thumbs.items():
        scores = [s for s in (_similarity(v) for v in vecs) if s is not None]
        if scores:
            arr = np.array(scores)
            groups_result[group] = {
                "count": len(scores),
                "mean_similarity": round(float(np.mean(arr)), 1),
                "median_similarity": round(float(np.median(arr)), 1),
                "std_similarity": round(float(np.std(arr)), 1),
            }

    # Per-feature means by group
    feature_trends: Dict[str, Dict[str, float]] = {}
    for i, fname in enumerate(FEATURE_NAMES):
        feature_trends[fname] = {}
        for group, vecs in group_thumbs.items():
            vals = [v[i] for v in vecs if not np.isnan(v[i])]
            if vals:
                feature_trends[fname][group] = round(float(np.mean(vals)), 4)

    return {
        "feature_names": FEATURE_NAMES,
        "mrbeast_centroid": {
            name: round(float(mb_mean[i]), 4)
            for i, name in enumerate(FEATURE_NAMES)
        },
        "groups": groups_result,
        "feature_trends": feature_trends,
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
