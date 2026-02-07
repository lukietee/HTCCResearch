"""Image loading and processing utilities."""

from pathlib import Path
from typing import Tuple, Optional

import cv2
import numpy as np
from PIL import Image

from app.core.config import settings


# Supported image extensions
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}


def is_image_file(path: Path) -> bool:
    """Check if a file is a supported image format."""
    return path.suffix.lower() in SUPPORTED_EXTENSIONS


def load_image(path: str | Path, max_size: Optional[int] = None) -> Optional[np.ndarray]:
    """
    Load an image from disk as a BGR numpy array.

    Args:
        path: Path to the image file
        max_size: Optional maximum dimension (width or height)

    Returns:
        Image as BGR numpy array, or None if loading fails
    """
    path = Path(path)
    if not path.exists():
        return None

    img = cv2.imread(str(path))
    if img is None:
        return None

    if max_size is not None:
        img = resize_for_processing(img, max_size)

    return img


def load_image_rgb(path: str | Path, max_size: Optional[int] = None) -> Optional[np.ndarray]:
    """
    Load an image from disk as an RGB numpy array.

    Args:
        path: Path to the image file
        max_size: Optional maximum dimension

    Returns:
        Image as RGB numpy array, or None if loading fails
    """
    img = load_image(path, max_size)
    if img is not None:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img


def resize_for_processing(
    img: np.ndarray, max_size: int = settings.MAX_IMAGE_SIZE
) -> np.ndarray:
    """
    Resize an image so its largest dimension is at most max_size.

    Args:
        img: Input image array
        max_size: Maximum dimension (width or height)

    Returns:
        Resized image array
    """
    h, w = img.shape[:2]
    if max(h, w) <= max_size:
        return img

    scale = max_size / max(h, w)
    new_w = int(w * scale)
    new_h = int(h * scale)

    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def get_image_dimensions(path: str | Path) -> Optional[Tuple[int, int]]:
    """
    Get image dimensions without fully loading the image.

    Args:
        path: Path to the image file

    Returns:
        Tuple of (width, height), or None if file cannot be read
    """
    path = Path(path)
    if not path.exists():
        return None

    try:
        with Image.open(path) as img:
            return img.size
    except Exception:
        return None


def convert_to_hsv(img: np.ndarray) -> np.ndarray:
    """Convert BGR image to HSV color space."""
    return cv2.cvtColor(img, cv2.COLOR_BGR2HSV)


def convert_to_rgb(img: np.ndarray) -> np.ndarray:
    """Convert BGR image to RGB color space."""
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def get_image_area(img: np.ndarray) -> int:
    """Get the total pixel area of an image."""
    return img.shape[0] * img.shape[1]
