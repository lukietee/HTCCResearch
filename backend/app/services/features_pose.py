"""Pose feature extraction module using MediaPipe Pose Tasks API."""

from typing import Dict, Any, List, Optional, Tuple
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
from app.utils.images import load_image_rgb
from app.utils.math import euclidean_distance, safe_divide

# Model path
MODEL_DIR = Path(__file__).parent.parent.parent / "models"
POSE_LANDMARKER_MODEL = MODEL_DIR / "pose_landmarker.task"

# MediaPipe Pose landmark indices
# Reference: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
POSE_LANDMARKS = {
    # Shoulders
    "left_shoulder": 11,
    "right_shoulder": 12,
    # Hips
    "left_hip": 23,
    "right_hip": 24,
    # Hands
    "left_wrist": 15,
    "right_wrist": 16,
    "left_pinky": 17,
    "right_pinky": 18,
    "left_index": 19,
    "right_index": 20,
    "left_thumb": 21,
    "right_thumb": 22,
    # For orientation
    "nose": 0,
}


def extract_pose_features(image_path: str) -> Dict[str, Any]:
    """
    Extract pose-related features from an image.

    Features:
    - people_count: 0 or 1 (MVP - single person detection)
    - hand_visible_count: Number of visible hands (0, 1, or 2)
    - pose_orientation: Estimated pose orientation (front/side/back proxy)
    - body_coverage: Ratio of body bbox to image area

    Args:
        image_path: Path to the image file

    Returns:
        Dictionary of pose features
    """
    if not MEDIAPIPE_AVAILABLE:
        return {
            "people_count": 0,
            "hand_visible_count": 0,
            "pose_orientation": "unknown",
            "body_coverage": 0.0,
            "error": "mediapipe not available",
        }

    if not POSE_LANDMARKER_MODEL.exists():
        return {
            "people_count": 0,
            "hand_visible_count": 0,
            "pose_orientation": "unknown",
            "body_coverage": 0.0,
            "error": f"pose landmarker model not found at {POSE_LANDMARKER_MODEL}",
        }

    try:
        # Create PoseLandmarker
        base_options = mp_tasks.BaseOptions(model_asset_path=str(POSE_LANDMARKER_MODEL))
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        with vision.PoseLandmarker.create_from_options(options) as landmarker:
            # Load image using MediaPipe
            mp_image = mp.Image.create_from_file(image_path)
            img_width = mp_image.width
            img_height = mp_image.height

            # Detect pose
            result = landmarker.detect(mp_image)

            if not result.pose_landmarks:
                return {
                    "people_count": 0,
                    "hand_visible_count": 0,
                    "pose_orientation": "unknown",
                    "body_coverage": 0.0,
                }

            landmarks = result.pose_landmarks[0]

            # People count (1 if pose detected)
            people_count = 1

            # Count visible hands
            hand_visible_count = count_visible_hands(landmarks)

            # Calculate pose orientation
            pose_orientation = calculate_pose_orientation(landmarks, img_width)

            # Calculate body coverage
            body_coverage = calculate_body_coverage(landmarks, img_width, img_height)

            return {
                "people_count": people_count,
                "hand_visible_count": hand_visible_count,
                "pose_orientation": pose_orientation,
                "body_coverage": round(body_coverage, 4),
            }

    except Exception as e:
        return {
            "people_count": 0,
            "hand_visible_count": 0,
            "pose_orientation": "unknown",
            "body_coverage": 0.0,
            "error": str(e),
        }


def count_visible_hands(landmarks: List) -> int:
    """
    Count the number of visible hands based on landmark visibility.

    Args:
        landmarks: MediaPipe pose landmarks (list of NormalizedLandmark)

    Returns:
        Number of visible hands (0, 1, or 2)
    """
    visible_hands = 0

    # Check left hand (wrist, pinky, index, thumb)
    left_hand_indices = [
        POSE_LANDMARKS["left_wrist"],
        POSE_LANDMARKS["left_pinky"],
        POSE_LANDMARKS["left_index"],
        POSE_LANDMARKS["left_thumb"],
    ]
    left_visibility = sum(
        landmarks[idx].visibility if hasattr(landmarks[idx], 'visibility') else 0.5
        for idx in left_hand_indices
    ) / len(left_hand_indices)
    if left_visibility > 0.3:
        visible_hands += 1

    # Check right hand
    right_hand_indices = [
        POSE_LANDMARKS["right_wrist"],
        POSE_LANDMARKS["right_pinky"],
        POSE_LANDMARKS["right_index"],
        POSE_LANDMARKS["right_thumb"],
    ]
    right_visibility = sum(
        landmarks[idx].visibility if hasattr(landmarks[idx], 'visibility') else 0.5
        for idx in right_hand_indices
    ) / len(right_hand_indices)
    if right_visibility > 0.3:
        visible_hands += 1

    return visible_hands


def calculate_pose_orientation(landmarks: List, img_width: int) -> str:
    """
    Estimate pose orientation based on shoulder positions.

    If both shoulders are visible and roughly equal distance from center,
    person is likely facing front. If one shoulder is much closer to
    center than the other, person is likely facing sideways.

    Args:
        landmarks: MediaPipe pose landmarks (list of NormalizedLandmark)
        img_width: Image width in pixels

    Returns:
        Orientation string: "front", "left", "right", or "unknown"
    """
    left_shoulder = landmarks[POSE_LANDMARKS["left_shoulder"]]
    right_shoulder = landmarks[POSE_LANDMARKS["right_shoulder"]]

    # Check visibility (use presence if visibility not available)
    left_vis = getattr(left_shoulder, 'visibility', 0.5)
    right_vis = getattr(right_shoulder, 'visibility', 0.5)

    if left_vis < 0.3 and right_vis < 0.3:
        return "unknown"

    # Get shoulder x positions (normalized 0-1)
    left_x = left_shoulder.x
    right_x = right_shoulder.x

    # Calculate shoulder width (normalized)
    shoulder_width = abs(right_x - left_x)

    # If shoulder width is very small, person is likely facing sideways
    if shoulder_width < 0.08:
        # Determine which side
        center_x = (left_x + right_x) / 2
        if center_x < 0.45:
            return "left"  # Person's left side visible (facing right from camera)
        elif center_x > 0.55:
            return "right"  # Person's right side visible
        return "side"

    # Check for front/back based on nose visibility
    nose = landmarks[POSE_LANDMARKS["nose"]]
    nose_vis = getattr(nose, 'visibility', 0.5)
    if nose_vis > 0.5:
        return "front"

    # Default to front if shoulders are wide and visible
    if shoulder_width > 0.15:
        return "front"

    return "unknown"


def calculate_body_coverage(
    landmarks: List, img_width: int, img_height: int
) -> float:
    """
    Calculate the ratio of body bounding box to image area.

    Args:
        landmarks: MediaPipe pose landmarks (list of NormalizedLandmark)
        img_width: Image width in pixels
        img_height: Image height in pixels

    Returns:
        Body coverage ratio (0-1)
    """
    # Get all visible landmark positions
    visible_points = []
    for lm in landmarks:
        vis = getattr(lm, 'visibility', 0.5)
        if vis > 0.3:
            visible_points.append((lm.x * img_width, lm.y * img_height))

    if len(visible_points) < 4:
        return 0.0

    # Calculate bounding box
    xs = [p[0] for p in visible_points]
    ys = [p[1] for p in visible_points]

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    body_area = (max_x - min_x) * (max_y - min_y)
    img_area = img_width * img_height

    return safe_divide(body_area, img_area)


def get_pose_stats(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get summary statistics from pose features.

    Args:
        features: Pose features dictionary

    Returns:
        Summary statistics
    """
    return {
        "people_detected": features.get("people_count", 0) > 0,
        "hands_visible": features.get("hand_visible_count", 0),
        "orientation": features.get("pose_orientation", "unknown"),
        "body_coverage": features.get("body_coverage", 0),
    }
