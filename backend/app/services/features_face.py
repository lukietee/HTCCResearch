"""Face feature extraction module using MediaPipe Tasks API."""

from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path
import numpy as np

try:
    import mediapipe as mp
    from mediapipe.tasks import python as mp_tasks
    from mediapipe.tasks.python import vision

    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

from app.core.config import settings
from app.utils.images import load_image_rgb, get_image_area
from app.utils.math import euclidean_distance, safe_divide

# Model paths - relative to backend directory
MODEL_DIR = Path(__file__).parent.parent.parent / "models"
FACE_DETECTOR_MODEL = MODEL_DIR / "blaze_face_short_range.tflite"
FACE_LANDMARKER_MODEL = MODEL_DIR / "face_landmarker.task"

# MediaPipe FaceMesh landmark indices for emotion proxies
# Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
LANDMARKS = {
    # Mouth corners
    "mouth_left": 61,
    "mouth_right": 291,
    # Lip points for mouth openness
    "upper_lip": 13,
    "lower_lip": 14,
    # Eyebrow points
    "left_eyebrow": 66,
    "right_eyebrow": 296,
    # Eye points (for brow distance)
    "left_eye_top": 159,
    "right_eye_top": 386,
}


def extract_face_features(image_path: str) -> Dict[str, Any]:
    """
    Extract face-related features from an image.

    Features:
    - face_count: Number of faces detected
    - largest_face_area_ratio: Largest face bbox area / image area
    - avg_face_area_ratio: Average face area ratio
    - emotion_proxies: smile_score, mouth_open_score, brow_raise_score

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary of face features
    """
    if not MEDIAPIPE_AVAILABLE:
        return {
            "face_count": 0,
            "largest_face_area_ratio": 0.0,
            "avg_face_area_ratio": 0.0,
            "emotion_proxies": {
                "smile_score": 0.0,
                "mouth_open_score": 0.0,
                "brow_raise_score": 0.0,
            },
            "error": "mediapipe not available",
        }

    # Check if model files exist
    if not FACE_DETECTOR_MODEL.exists():
        return {
            "face_count": 0,
            "largest_face_area_ratio": 0.0,
            "avg_face_area_ratio": 0.0,
            "emotion_proxies": {
                "smile_score": 0.0,
                "mouth_open_score": 0.0,
                "brow_raise_score": 0.0,
            },
            "error": f"face detector model not found at {FACE_DETECTOR_MODEL}",
        }

    img = load_image_rgb(image_path, max_size=settings.MAX_IMAGE_SIZE)
    if img is None:
        return {}

    img_height, img_width = img.shape[:2]
    img_area = img_height * img_width

    # First, detect faces to get count and bounding boxes
    face_boxes = detect_faces(img, img_width, img_height)
    face_count = len(face_boxes)

    if face_count == 0:
        return {
            "face_count": 0,
            "largest_face_area_ratio": 0.0,
            "avg_face_area_ratio": 0.0,
            "emotion_proxies": {
                "smile_score": 0.0,
                "mouth_open_score": 0.0,
                "brow_raise_score": 0.0,
            },
        }

    # Calculate face area ratios
    face_areas = [box["width"] * box["height"] for box in face_boxes]
    largest_face_area_ratio = safe_divide(max(face_areas), img_area)
    avg_face_area_ratio = safe_divide(sum(face_areas) / len(face_areas), img_area)

    # Get emotion proxies from the largest face using FaceLandmarker
    emotion_proxies = extract_emotion_proxies(image_path)

    return {
        "face_count": face_count,
        "largest_face_area_ratio": round(largest_face_area_ratio, 4),
        "avg_face_area_ratio": round(avg_face_area_ratio, 4),
        "emotion_proxies": emotion_proxies,
    }


def detect_faces(img: np.ndarray, img_width: int, img_height: int) -> List[Dict]:
    """
    Detect faces in an image using MediaPipe Face Detection Tasks API.

    Args:
        img: RGB image array
        img_width: Image width in pixels
        img_height: Image height in pixels

    Returns:
        List of face bounding boxes with x, y, width, height
    """
    face_boxes = []

    try:
        # Create FaceDetector
        base_options = mp_tasks.BaseOptions(model_asset_path=str(FACE_DETECTOR_MODEL))
        options = vision.FaceDetectorOptions(
            base_options=base_options,
            min_detection_confidence=0.5,
        )

        with vision.FaceDetector.create_from_options(options) as detector:
            # Create MediaPipe Image from numpy array
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img)

            # Detect faces
            detection_result = detector.detect(mp_image)

            for detection in detection_result.detections:
                bbox = detection.bounding_box

                face_boxes.append({
                    "x": max(0, bbox.origin_x),
                    "y": max(0, bbox.origin_y),
                    "width": bbox.width,
                    "height": bbox.height,
                    "confidence": detection.categories[0].score if detection.categories else 0.0,
                })
    except Exception as e:
        # Return empty list on error
        pass

    return face_boxes


def extract_emotion_proxies(image_path: str) -> Dict[str, float]:
    """
    Extract emotion proxy scores using MediaPipe FaceLandmarker Tasks API.

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary with smile_score, mouth_open_score, brow_raise_score
    """
    default_proxies = {
        "smile_score": 0.0,
        "mouth_open_score": 0.0,
        "brow_raise_score": 0.0,
    }

    if not FACE_LANDMARKER_MODEL.exists():
        return default_proxies

    try:
        # Create FaceLandmarker
        base_options = mp_tasks.BaseOptions(model_asset_path=str(FACE_LANDMARKER_MODEL))
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        with vision.FaceLandmarker.create_from_options(options) as landmarker:
            # Load image using MediaPipe
            mp_image = mp.Image.create_from_file(image_path)
            img_width = mp_image.width
            img_height = mp_image.height

            # Detect face landmarks
            result = landmarker.detect(mp_image)

            if not result.face_landmarks:
                return default_proxies

            landmarks = result.face_landmarks[0]

            # Convert landmarks to pixel coordinates
            def get_point(idx: int) -> Tuple[float, float]:
                lm = landmarks[idx]
                return (lm.x * img_width, lm.y * img_height)

            # Calculate smile score (mouth corner distance / mouth width)
            mouth_left = get_point(LANDMARKS["mouth_left"])
            mouth_right = get_point(LANDMARKS["mouth_right"])
            upper_lip = get_point(LANDMARKS["upper_lip"])
            lower_lip = get_point(LANDMARKS["lower_lip"])

            mouth_width = euclidean_distance(mouth_left, mouth_right)

            # Smile: corners lifted relative to center
            # Using vertical position of corners vs center of lips
            lip_center_y = (upper_lip[1] + lower_lip[1]) / 2
            corner_avg_y = (mouth_left[1] + mouth_right[1]) / 2

            # If corners are above lip center, that's a smile
            # Normalize by mouth width
            smile_score = safe_divide(lip_center_y - corner_avg_y, mouth_width)
            smile_score = max(0, min(1, smile_score + 0.5))  # Normalize to 0-1

            # Mouth openness score
            lip_gap = euclidean_distance(upper_lip, lower_lip)
            mouth_open_score = safe_divide(lip_gap, mouth_width)
            mouth_open_score = min(1.0, mouth_open_score)  # Cap at 1.0

            # Brow raise score (eyebrow to eye distance)
            left_brow = get_point(LANDMARKS["left_eyebrow"])
            right_brow = get_point(LANDMARKS["right_eyebrow"])
            left_eye = get_point(LANDMARKS["left_eye_top"])
            right_eye = get_point(LANDMARKS["right_eye_top"])

            left_brow_dist = abs(left_brow[1] - left_eye[1])
            right_brow_dist = abs(right_brow[1] - right_eye[1])
            avg_brow_dist = (left_brow_dist + right_brow_dist) / 2

            # Normalize by face height (approximate)
            face_height = img_height * 0.3  # Rough estimate
            brow_raise_score = safe_divide(avg_brow_dist, face_height)
            brow_raise_score = min(1.0, brow_raise_score * 3)  # Scale up

            return {
                "smile_score": round(smile_score, 4),
                "mouth_open_score": round(mouth_open_score, 4),
                "brow_raise_score": round(brow_raise_score, 4),
            }

    except Exception:
        return default_proxies


def get_face_stats(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get summary statistics from face features.

    Args:
        features: Face features dictionary

    Returns:
        Summary statistics
    """
    emotion = features.get("emotion_proxies", {})
    return {
        "face_count": features.get("face_count", 0),
        "face_size": features.get("largest_face_area_ratio", 0),
        "smile": emotion.get("smile_score", 0),
        "mouth_open": emotion.get("mouth_open_score", 0),
    }
