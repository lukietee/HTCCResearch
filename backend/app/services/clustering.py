"""Clustering service for thumbnail analysis."""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from sqlalchemy.orm import Session

from app.models.thumbnail import Thumbnail


# Features to use for clustering (numeric features only)
CLUSTERING_FEATURES = [
    # Color features
    ("color", "avg_saturation"),
    ("color", "avg_brightness"),
    ("color", "warm_cool_score"),
    # Text features
    ("text", "text_area_ratio"),
    ("text", "text_box_count"),
    # Face features
    ("face", "face_count"),
    ("face", "largest_face_area_ratio"),
    # Emotion features (nested under face.emotion_proxies)
    ("face", "emotion_proxies.smile_score"),
    ("face", "emotion_proxies.mouth_open_score"),
    ("face", "emotion_proxies.brow_raise_score"),
    # Pose features
    ("pose", "hand_visible_count"),
    ("pose", "body_coverage"),
    # Depth features
    ("depth", "depth_contrast"),
    ("depth", "foreground_ratio"),
]


def extract_feature_vector(features: Dict[str, Any]) -> Optional[List[float]]:
    """
    Extract a numeric feature vector from a thumbnail's features.

    Args:
        features: Dictionary of extracted features

    Returns:
        List of numeric values, or None if features are incomplete
    """
    vector = []

    for category, feature_name in CLUSTERING_FEATURES:
        if category not in features:
            return None

        category_features = features[category]

        # Handle nested features
        if feature_name in category_features:
            value = category_features[feature_name]
        elif "." in feature_name:
            parts = feature_name.split(".")
            value = category_features
            for part in parts:
                if isinstance(value, dict) and part in value:
                    value = value[part]
                else:
                    return None
        else:
            return None

        # Handle special cases
        if isinstance(value, bool):
            value = 1.0 if value else 0.0
        elif isinstance(value, (int, float)):
            value = float(value)
        else:
            return None

        vector.append(value)

    return vector


def build_feature_matrix(
    db: Session, group: Optional[str] = None
) -> Tuple[np.ndarray, List[int], List[str]]:
    """
    Build a feature matrix from all processed thumbnails.

    Args:
        db: Database session
        group: Optional group filter

    Returns:
        Tuple of (feature matrix, thumbnail IDs, group labels)
    """
    query = db.query(Thumbnail).filter(Thumbnail.features_extracted == True)

    if group:
        query = query.filter(Thumbnail.group == group)

    thumbnails = query.all()

    vectors = []
    ids = []
    groups = []

    for thumb in thumbnails:
        features = thumb.get_features()
        vector = extract_feature_vector(features)

        if vector is not None:
            vectors.append(vector)
            ids.append(thumb.id)
            groups.append(thumb.group)

    if not vectors:
        return np.array([]), [], []

    return np.array(vectors), ids, groups


def run_clustering(
    db: Session,
    k: int = 3,
    group: Optional[str] = None,
    method: str = "kmeans",
) -> Dict[str, Any]:
    """
    Run clustering on thumbnail features.

    Args:
        db: Database session
        k: Number of clusters
        group: Optional group filter
        method: Clustering method (currently only "kmeans")

    Returns:
        Dictionary with clustering results
    """
    # Build feature matrix
    X, ids, groups = build_feature_matrix(db, group)

    if len(X) < k:
        return {
            "error": f"Not enough samples ({len(X)}) for {k} clusters",
            "sample_count": len(X),
        }

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Run clustering
    if method == "kmeans":
        clusterer = KMeans(n_clusters=k, n_init=10, random_state=42)
        cluster_labels = clusterer.fit_predict(X_scaled)
    else:
        return {"error": f"Unknown clustering method: {method}"}

    # Reduce to 2D for visualization
    if X_scaled.shape[1] > 2:
        pca = PCA(n_components=2, random_state=42)
        X_2d = pca.fit_transform(X_scaled)
        explained_variance = pca.explained_variance_ratio_.tolist()
    else:
        X_2d = X_scaled
        explained_variance = [1.0, 0.0]

    # Update database with cluster assignments
    for i, thumb_id in enumerate(ids):
        thumb = db.query(Thumbnail).get(thumb_id)
        if thumb:
            thumb.cluster_id = int(cluster_labels[i])
            thumb.cluster_x = float(X_2d[i, 0])
            thumb.cluster_y = float(X_2d[i, 1])

    db.commit()

    # Calculate cluster statistics
    cluster_stats = {}
    for cluster_id in range(k):
        mask = cluster_labels == cluster_id
        cluster_stats[cluster_id] = {
            "count": int(np.sum(mask)),
            "groups": {},
        }
        # Count by group
        for group_name in set(groups):
            group_mask = [g == group_name for g in groups]
            cluster_stats[cluster_id]["groups"][group_name] = int(
                np.sum(np.array(mask) & np.array(group_mask))
            )

    return {
        "method": method,
        "k": k,
        "sample_count": len(X),
        "cluster_stats": cluster_stats,
        "explained_variance": explained_variance,
        "feature_names": [f"{cat}.{name}" for cat, name in CLUSTERING_FEATURES],
    }


def get_clustering_points(
    db: Session, group: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get 2D clustering points for visualization.

    Args:
        db: Database session
        group: Optional group filter

    Returns:
        List of point dictionaries with x, y, cluster_id, group, thumbnail_id
    """
    query = db.query(Thumbnail).filter(
        Thumbnail.cluster_x != None,
        Thumbnail.cluster_y != None,
    )

    if group:
        query = query.filter(Thumbnail.group == group)

    thumbnails = query.all()

    points = []
    for thumb in thumbnails:
        points.append({
            "id": thumb.id,
            "x": thumb.cluster_x,
            "y": thumb.cluster_y,
            "cluster_id": thumb.cluster_id,
            "group": thumb.group,
            "file_path": thumb.file_path,
            "title": thumb.title,
        })

    return points


def get_cluster_summary(db: Session) -> Dict[str, Any]:
    """
    Get summary of current clustering state.

    Args:
        db: Database session

    Returns:
        Dictionary with clustering summary
    """
    # Count thumbnails with cluster assignments
    clustered = db.query(Thumbnail).filter(
        Thumbnail.cluster_id != None
    ).count()

    total = db.query(Thumbnail).filter(
        Thumbnail.features_extracted == True
    ).count()

    # Get unique cluster IDs
    cluster_ids = db.query(Thumbnail.cluster_id).filter(
        Thumbnail.cluster_id != None
    ).distinct().all()

    return {
        "total_processed": total,
        "clustered": clustered,
        "num_clusters": len(cluster_ids),
        "cluster_ids": [c[0] for c in cluster_ids],
    }
