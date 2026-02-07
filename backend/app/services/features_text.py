"""Text/OCR feature extraction module using pytesseract."""

from typing import Dict, Any, List, Tuple
import numpy as np

try:
    import pytesseract
    from pytesseract import Output

    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

from app.core.config import settings
from app.utils.images import load_image, get_image_area
from app.utils.math import safe_divide


def extract_text_features(image_path: str) -> Dict[str, Any]:
    """
    Extract text-related features from an image using OCR.

    Features:
    - has_text: Boolean indicating if text was detected
    - text_area_ratio: Ratio of text bounding box area to image area
    - text_box_count: Number of text regions detected
    - text_position_heat: Distribution of text (top/middle/bottom)
    - detected_text: List of detected text strings (for reference)

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary of text features
    """
    if not TESSERACT_AVAILABLE:
        return {
            "has_text": False,
            "text_area_ratio": 0.0,
            "text_box_count": 0,
            "text_position_heat": {"top": 0.0, "middle": 0.0, "bottom": 0.0},
            "error": "pytesseract not available",
        }

    img = load_image(image_path, max_size=settings.MAX_IMAGE_SIZE)
    if img is None:
        return {}

    img_height, img_width = img.shape[:2]
    img_area = img_height * img_width

    try:
        # Run OCR with bounding box data
        ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)

        # Filter for confident text detections
        text_boxes = []
        detected_texts = []

        n_boxes = len(ocr_data["text"])
        for i in range(n_boxes):
            conf = int(ocr_data["conf"][i])
            text = ocr_data["text"][i].strip()

            # Filter by confidence and non-empty text
            if conf > 30 and text:
                x = ocr_data["left"][i]
                y = ocr_data["top"][i]
                w = ocr_data["width"][i]
                h = ocr_data["height"][i]

                text_boxes.append({
                    "x": x,
                    "y": y,
                    "width": w,
                    "height": h,
                    "text": text,
                    "confidence": conf,
                })
                detected_texts.append(text)

        # Calculate features
        has_text = len(text_boxes) > 0
        text_box_count = len(text_boxes)

        # Calculate total text area
        total_text_area = sum(box["width"] * box["height"] for box in text_boxes)
        text_area_ratio = safe_divide(total_text_area, img_area)

        # Calculate text position distribution
        text_position_heat = calculate_text_position_heat(text_boxes, img_height)

        return {
            "has_text": has_text,
            "text_area_ratio": round(text_area_ratio, 4),
            "text_box_count": text_box_count,
            "text_position_heat": text_position_heat,
            "detected_text": detected_texts[:10],  # Limit to first 10
        }

    except Exception as e:
        return {
            "has_text": False,
            "text_area_ratio": 0.0,
            "text_box_count": 0,
            "text_position_heat": {"top": 0.0, "middle": 0.0, "bottom": 0.0},
            "error": str(e),
        }


def calculate_text_position_heat(
    text_boxes: List[Dict], img_height: int
) -> Dict[str, float]:
    """
    Calculate distribution of text across vertical regions.

    Divides image into thirds (top, middle, bottom) and calculates
    what fraction of text area falls into each region.

    Args:
        text_boxes: List of text bounding boxes
        img_height: Image height in pixels

    Returns:
        Dictionary with top/middle/bottom ratios (sum to 1.0)
    """
    if not text_boxes:
        return {"top": 0.0, "middle": 0.0, "bottom": 0.0}

    third = img_height / 3
    region_areas = {"top": 0, "middle": 0, "bottom": 0}

    for box in text_boxes:
        y_center = box["y"] + box["height"] / 2
        box_area = box["width"] * box["height"]

        if y_center < third:
            region_areas["top"] += box_area
        elif y_center < 2 * third:
            region_areas["middle"] += box_area
        else:
            region_areas["bottom"] += box_area

    total = sum(region_areas.values())
    if total == 0:
        return {"top": 0.0, "middle": 0.0, "bottom": 0.0}

    return {
        region: round(area / total, 4)
        for region, area in region_areas.items()
    }


def get_text_stats(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get summary statistics from text features.

    Args:
        features: Text features dictionary

    Returns:
        Summary statistics
    """
    return {
        "has_text": features.get("has_text", False),
        "text_coverage": features.get("text_area_ratio", 0),
        "text_count": features.get("text_box_count", 0),
    }
