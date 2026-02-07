"""Mathematical utilities for feature extraction."""

from typing import List, Tuple
import numpy as np


def normalize_to_range(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to [0, 1] range."""
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def calculate_center_of_mass(mask: np.ndarray) -> Tuple[float, float]:
    """
    Calculate the center of mass of a binary mask.

    Args:
        mask: Binary mask (2D array)

    Returns:
        Tuple of (x, y) normalized coordinates [0, 1]
    """
    if mask.sum() == 0:
        return 0.5, 0.5

    h, w = mask.shape
    y_coords, x_coords = np.where(mask > 0)

    cx = x_coords.mean() / w
    cy = y_coords.mean() / h

    return float(cx), float(cy)


def euclidean_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Calculate Euclidean distance between two points."""
    return float(np.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2))


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex color string."""
    return "#{:02x}{:02x}{:02x}".format(*rgb)


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color string to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Safe division that returns default on divide by zero."""
    if denominator == 0:
        return float(default)
    return float(numerator / denominator)
