"""Title feature extraction module."""

import re
from typing import Dict, Any, Optional


# Superlative / extreme language words (lowercased for matching)
SUPERLATIVE_WORDS = {
    "world", "worlds", "world's",
    "biggest", "largest", "most", "best", "worst",
    "deadliest", "fastest", "strongest", "craziest",
    "impossible", "extreme", "insane", "expensive",
    "cheapest", "tallest", "smallest", "longest",
    "shortest", "hardest", "easiest", "rarest",
    "ultimate", "unbelievable", "incredible", "amazing",
    "massive", "tiny", "giant", "huge", "epic",
}

# Challenge / competition framing words (lowercased)
CHALLENGE_WORDS = {
    "vs", "versus", "win", "survive", "fight",
    "beat", "challenge", "race", "battle",
    "eliminated", "trapped", "escape",
    "last", "first", "competition", "competing",
    "loser", "winner",
}

# Numeric prefix pattern: "001 ", "094 ", etc.
_NUMERIC_PREFIX_RE = re.compile(r"^\d{1,4}\s+")

# HTML entity artifact: 39 used as apostrophe
_APOSTROPHE_39_RE = re.compile(r"39(?=[a-zA-Z])")


def _clean_title(title: str, channel: Optional[str] = None) -> tuple[str, bool]:
    """Clean a title string, returning (cleaned_title, is_filename_derived).

    Cleaning steps:
    1. Strip leading numeric prefix (e.g. "001 " from filenames)
    2. Strip channel name prefix if present
    3. Fix '39' -> apostrophe artifacts
    4. Detect if title looks filename-derived
    """
    original = title.strip()
    cleaned = original
    is_filename_derived = False

    # Detect filename-derived titles (no spaces = likely a filename slug,
    # or contains file extensions)
    if "." in cleaned and cleaned.rsplit(".", 1)[-1].lower() in ("jpg", "png", "jpeg", "webp"):
        cleaned = cleaned.rsplit(".", 1)[0]
        is_filename_derived = True

    # Strip leading numeric prefix
    stripped = _NUMERIC_PREFIX_RE.sub("", cleaned)
    if stripped != cleaned:
        is_filename_derived = True
        cleaned = stripped

    # Strip channel name prefix (e.g. "Dude Perfect 02 ..." -> "02 ...")
    if channel:
        ch_lower = channel.lower().strip()
        cl_lower = cleaned.lower()
        if cl_lower.startswith(ch_lower):
            rest = cleaned[len(channel):].lstrip()
            # Strip any remaining numeric prefix after channel name
            rest = _NUMERIC_PREFIX_RE.sub("", rest)
            if rest:
                cleaned = rest
                is_filename_derived = True

    # Fix 39 -> apostrophe artifacts
    cleaned = _APOSTROPHE_39_RE.sub("'", cleaned)

    # Also handle standalone "39" between words as apostrophe (e.g. "I39m")
    cleaned = re.sub(r"(\w)39(\w)", r"\1'\2", cleaned)

    # Replace underscores with spaces (filename artifacts)
    if "_" in cleaned and " " not in cleaned:
        cleaned = cleaned.replace("_", " ")
        is_filename_derived = True

    return cleaned.strip(), is_filename_derived


def extract_title_features(title: str, channel: Optional[str] = None) -> Dict[str, Any]:
    """Extract text-analysis features from a video title.

    Args:
        title: Raw title string from the database
        channel: Optional channel name for prefix stripping

    Returns:
        Dictionary of title features
    """
    if not title or not title.strip():
        return {
            "cleaned_title": "",
            "is_filename_derived": True,
            "char_count": 0,
            "word_count": 0,
            "has_number": False,
            "number_count": 0,
            "has_large_number": False,
            "first_person": False,
            "has_superlative": False,
            "has_challenge_framing": False,
            "uppercase_ratio": 0.0,
            "exclamation_count": 0,
            "question_mark": False,
            "avg_word_length": 0.0,
        }

    cleaned, is_filename_derived = _clean_title(title, channel)

    words = cleaned.split()
    word_count = len(words)
    char_count = len(cleaned)

    # Number features
    numbers_found = re.findall(r"[\d,]+", cleaned)
    number_count = len(numbers_found)
    has_number = number_count > 0

    # Check for large numbers (>= 1000), handling commas
    has_large_number = False
    for num_str in numbers_found:
        try:
            val = int(num_str.replace(",", ""))
            if val >= 1000:
                has_large_number = True
                break
        except ValueError:
            continue

    # First person: starts with "I " (case-sensitive)
    first_person = cleaned.startswith("I ") or cleaned.startswith("I'")

    # Superlative / extreme words
    words_lower = [w.lower().strip(".,!?\"'()[]") for w in words]
    has_superlative = bool(SUPERLATIVE_WORDS & set(words_lower))

    # Challenge framing
    has_challenge_framing = bool(CHALLENGE_WORDS & set(words_lower))

    # Uppercase ratio (only among alpha characters)
    alpha_chars = [c for c in cleaned if c.isalpha()]
    if alpha_chars:
        uppercase_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
    else:
        uppercase_ratio = 0.0

    # Punctuation
    exclamation_count = cleaned.count("!")
    question_mark = "?" in cleaned

    # Average word length
    if words:
        avg_word_length = sum(len(w) for w in words) / len(words)
    else:
        avg_word_length = 0.0

    return {
        "cleaned_title": cleaned,
        "is_filename_derived": is_filename_derived,
        "char_count": char_count,
        "word_count": word_count,
        "has_number": has_number,
        "number_count": number_count,
        "has_large_number": has_large_number,
        "first_person": first_person,
        "has_superlative": has_superlative,
        "has_challenge_framing": has_challenge_framing,
        "uppercase_ratio": round(uppercase_ratio, 3),
        "exclamation_count": exclamation_count,
        "question_mark": question_mark,
        "avg_word_length": round(avg_word_length, 2),
    }
