"""Depth feature extraction module using MiDaS."""

from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import numpy as np
import cv2

try:
    import torch

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from app.core.config import settings
from app.utils.images import load_image_rgb
from app.utils.math import calculate_center_of_mass, safe_divide


# Global model cache to avoid reloading
_midas_model = None
_midas_transform = None
_midas_device = None


def get_midas_model():
    """
    Load and cache the MiDaS model.

    Returns:
        Tuple of (model, transform, device)
    """
    global _midas_model, _midas_transform, _midas_device

    if _midas_model is not None:
        return _midas_model, _midas_transform, _midas_device

    if not TORCH_AVAILABLE:
        return None, None, None

    # Determine device
    _midas_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load MiDaS model (using smaller model for speed)
    # Options: "MiDaS_small", "DPT_Hybrid", "DPT_Large"
    _midas_model = torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True)
    _midas_model.to(_midas_device)
    _midas_model.eval()

    # Load transforms
    midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
    _midas_transform = midas_transforms.small_transform

    return _midas_model, _midas_transform, _midas_device


def extract_depth_features(
    image_path: str, save_depth_map: bool = False
) -> Dict[str, Any]:
    """
    Extract depth-related features from an image using MiDaS.

    Features:
    - depth_contrast: Standard deviation of depth map (normalized)
    - foreground_ratio: Fraction of pixels in foreground (closer than median)
    - subject_depth_center: Center of mass of closest region (x, y normalized)
    - depth_range: Range of depth values (max - min, normalized)

    Args:
        image_path: Path to the image file
        save_depth_map: If True, save the depth map to outputs directory

    Returns:
        Dictionary of depth features
    """
    if not TORCH_AVAILABLE:
        return {
            "depth_contrast": 0.0,
            "foreground_ratio": 0.0,
            "subject_depth_center": {"x": 0.5, "y": 0.5},
            "depth_range": 0.0,
            "error": "torch not available",
        }

    img = load_image_rgb(image_path, max_size=settings.DEPTH_IMAGE_SIZE)
    if img is None:
        return {}

    try:
        model, transform, device = get_midas_model()
        if model is None:
            return {
                "depth_contrast": 0.0,
                "foreground_ratio": 0.0,
                "subject_depth_center": {"x": 0.5, "y": 0.5},
                "depth_range": 0.0,
                "error": "MiDaS model not available",
            }

        # Prepare input
        input_batch = transform(img).to(device)

        # Run inference
        with torch.no_grad():
            depth_map = model(input_batch)

            # Resize to original image size
            depth_map = torch.nn.functional.interpolate(
                depth_map.unsqueeze(1),
                size=img.shape[:2],
                mode="bicubic",
                align_corners=False,
            ).squeeze()

        # Convert to numpy
        depth_np = depth_map.cpu().numpy()

        # Normalize depth map to 0-1
        depth_min = depth_np.min()
        depth_max = depth_np.max()
        if depth_max > depth_min:
            depth_normalized = (depth_np - depth_min) / (depth_max - depth_min)
        else:
            depth_normalized = np.zeros_like(depth_np)

        # Calculate features
        depth_contrast = float(np.std(depth_normalized))
        depth_range = float(depth_max - depth_min) / float(max(depth_max, 1e-6))

        # Foreground ratio (pixels closer than median)
        # In MiDaS, higher values = closer to camera
        median_depth = np.median(depth_normalized)
        foreground_mask = depth_normalized > median_depth
        foreground_ratio = float(np.mean(foreground_mask))

        # Subject center (center of mass of closest 20% pixels)
        threshold = np.percentile(depth_normalized, 80)  # Top 20% = closest
        close_mask = depth_normalized > threshold
        subject_center = calculate_center_of_mass(close_mask)

        # Optionally save depth map
        depth_map_path = None
        if save_depth_map:
            depth_map_path = save_depth_map_image(
                image_path, depth_normalized
            )

        result = {
            "depth_contrast": round(depth_contrast, 4),
            "foreground_ratio": round(foreground_ratio, 4),
            "subject_depth_center": {
                "x": round(subject_center[0], 4),
                "y": round(subject_center[1], 4),
            },
            "depth_range": round(depth_range, 4),
        }

        if depth_map_path:
            result["depth_map_path"] = depth_map_path

        return result

    except Exception as e:
        return {
            "depth_contrast": 0.0,
            "foreground_ratio": 0.0,
            "subject_depth_center": {"x": 0.5, "y": 0.5},
            "depth_range": 0.0,
            "error": str(e),
        }


def save_depth_map_image(
    original_path: str, depth_normalized: np.ndarray
) -> Optional[str]:
    """
    Save the depth map as a visualization image.

    Args:
        original_path: Path to the original image
        depth_normalized: Normalized depth map (0-1)

    Returns:
        Path to saved depth map, or None if save failed
    """
    try:
        # Create output directory if needed
        settings.DEPTH_MAPS_DIR.mkdir(parents=True, exist_ok=True)

        # Generate output filename
        original_name = Path(original_path).stem
        output_path = settings.DEPTH_MAPS_DIR / f"{original_name}_depth.png"

        # Convert to colormap for visualization
        depth_uint8 = (depth_normalized * 255).astype(np.uint8)
        depth_colored = cv2.applyColorMap(depth_uint8, cv2.COLORMAP_INFERNO)

        cv2.imwrite(str(output_path), depth_colored)

        return str(output_path)

    except Exception:
        return None


def get_depth_stats(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get summary statistics from depth features.

    Args:
        features: Depth features dictionary

    Returns:
        Summary statistics
    """
    center = features.get("subject_depth_center", {"x": 0.5, "y": 0.5})
    return {
        "depth_contrast": features.get("depth_contrast", 0),
        "foreground_ratio": features.get("foreground_ratio", 0),
        "subject_center_x": center.get("x", 0.5),
        "subject_center_y": center.get("y", 0.5),
    }
