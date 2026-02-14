"""Color feature extraction module."""

from typing import List, Tuple, Dict, Any
import numpy as np
import cv2
from sklearn.cluster import KMeans

from app.core.config import settings
from app.utils.images import load_image, convert_to_hsv
from app.utils.math import rgb_to_hex


def extract_color_features(image_path: str) -> Dict[str, Any]:
    """
    Extract color-related features from an image.

    Features:
    - avg_saturation: Mean saturation (0-1)
    - avg_brightness: Mean brightness/value (0-1)
    - hue_hist: 36-bin hue histogram (normalized)
    - dominant_palette: List of dominant colors (RGB hex)
    - warm_cool_score: Ratio of warm to cool colors (-1 to 1)

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary of color features
    """
    img = load_image(image_path, max_size=settings.MAX_IMAGE_SIZE)
    if img is None:
        return {}

    # Convert to HSV
    hsv = convert_to_hsv(img)
    h, s, v = cv2.split(hsv)

    # Calculate average saturation and brightness (normalized to 0-1)
    avg_saturation = float(np.mean(s) / 255.0)
    avg_brightness = float(np.mean(v) / 255.0)

    # Calculate hue histogram (36 bins for 10-degree increments)
    hue_hist = calculate_hue_histogram(h, bins=settings.HUE_HISTOGRAM_BINS)

    # Extract dominant colors using k-means
    dominant_palette = extract_dominant_colors(
        img, k=settings.COLOR_KMEANS_CLUSTERS
    )

    # Calculate warm/cool score
    warm_cool_score = calculate_warm_cool_score(h)

    return {
        "avg_saturation": round(avg_saturation, 4),
        "avg_brightness": round(avg_brightness, 4),
        "hue_hist": [round(v, 4) for v in hue_hist],
        "dominant_palette": dominant_palette,
        "warm_cool_score": round(warm_cool_score, 4),
    }


def calculate_hue_histogram(
    hue_channel: np.ndarray, bins: int = 36
) -> List[float]:
    """
    Calculate normalized hue histogram.

    Args:
        hue_channel: Hue channel from HSV image (0-179 in OpenCV)
        bins: Number of histogram bins

    Returns:
        Normalized histogram as list of floats
    """
    # OpenCV hue is 0-179, scale bins accordingly
    # Use cv2.calcHist to avoid numpy 2.x histogram broadcasting bug
    hist = cv2.calcHist([hue_channel], [0], None, [bins], [0, 180])
    hist = hist.flatten().astype(float)

    # Normalize
    total = hist.sum()
    if total > 0:
        hist = hist / total

    return hist.tolist()


def extract_dominant_colors(
    img: np.ndarray, k: int = 5
) -> List[str]:
    """
    Extract dominant colors using k-means clustering.

    Args:
        img: BGR image array
        k: Number of clusters/colors

    Returns:
        List of hex color strings sorted by frequency
    """
    # Reshape to list of pixels (BGR)
    pixels = img.reshape(-1, 3).astype(np.float32)

    # Subsample for performance (max 10k pixels)
    if len(pixels) > 10000:
        indices = np.random.choice(len(pixels), 10000, replace=False)
        pixels = pixels[indices]

    # Run k-means
    kmeans = KMeans(n_clusters=k, n_init=10, max_iter=100, random_state=42)
    kmeans.fit(pixels)

    # Get cluster centers and counts
    centers = kmeans.cluster_centers_
    labels = kmeans.labels_
    counts = np.bincount(labels, minlength=k)

    # Sort by frequency (most common first)
    sorted_indices = np.argsort(-counts)

    # Convert to hex colors (BGR -> RGB -> hex)
    colors = []
    for idx in sorted_indices:
        bgr = centers[idx].astype(int)
        rgb = (int(bgr[2]), int(bgr[1]), int(bgr[0]))  # BGR to RGB
        colors.append(rgb_to_hex(rgb))

    return colors


def calculate_warm_cool_score(hue_channel: np.ndarray) -> float:
    """
    Calculate warm/cool color balance score.

    Warm colors: Red, Orange, Yellow (hue ~0-60 and ~150-180)
    Cool colors: Green, Cyan, Blue (hue ~60-150)

    Args:
        hue_channel: Hue channel from HSV image (0-179 in OpenCV)

    Returns:
        Score from -1 (all cool) to 1 (all warm)
    """
    # OpenCV hue is 0-179 (0-360 degrees / 2)
    # Warm: 0-30 (red-yellow) and 150-179 (red-magenta)
    # Cool: 30-150 (yellow-green-cyan-blue-purple)

    h_flat = hue_channel.flatten()

    # Count warm pixels
    warm_mask = (h_flat <= 30) | (h_flat >= 150)
    warm_count = np.sum(warm_mask)

    # Count cool pixels
    cool_mask = (h_flat > 30) & (h_flat < 150)
    cool_count = np.sum(cool_mask)

    total = warm_count + cool_count
    if total == 0:
        return 0.0

    # Score: (warm - cool) / total -> range [-1, 1]
    score = (warm_count - cool_count) / total

    return float(score)


def get_color_stats(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get summary statistics from color features.

    Args:
        features: Color features dictionary

    Returns:
        Summary statistics
    """
    return {
        "saturation": features.get("avg_saturation", 0),
        "brightness": features.get("avg_brightness", 0),
        "warm_cool": features.get("warm_cool_score", 0),
        "primary_color": features.get("dominant_palette", ["#000000"])[0],
    }
