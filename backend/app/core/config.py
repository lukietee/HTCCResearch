"""Application configuration settings."""

import json as _json
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "sqlite:///./thumbnail_analyzer.db"

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    THUMBNAILS_DIR: Path = DATA_DIR / "thumbnails"
    OUTPUTS_DIR: Path = BASE_DIR / "outputs"
    DEPTH_MAPS_DIR: Path = OUTPUTS_DIR / "depth_maps"
    PALETTES_DIR: Path = OUTPUTS_DIR / "palettes"

    # YouTube API
    YOUTUBE_API_KEY: str = ""
    COLLECTION_STATE_FILE: Path = DATA_DIR / "collection_state.json"
    METADATA_DIR: Path = DATA_DIR / "metadata"

    # Image processing
    MAX_IMAGE_SIZE: int = 1280  # Max dimension for processing
    DEPTH_IMAGE_SIZE: int = 384  # Size for MiDaS processing

    # Feature extraction
    COLOR_KMEANS_CLUSTERS: int = 5
    HUE_HISTOGRAM_BINS: int = 36

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]

    # Groups
    VALID_GROUPS: list[str] = [
        "mrbeast",
        "2015", "2016", "2017", "2018", "2019",
        "2020", "2021", "2022", "2023", "2024", "2025",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# Panel channels loaded from channels.json
_channels_file = Path(__file__).resolve().parent.parent.parent / "scripts" / "channels.json"
if _channels_file.exists():
    _channels_data = _json.loads(_channels_file.read_text())
    PANEL_CHANNELS: list[str] = [ch["name"] for ch in _channels_data["panel"]]
else:
    PANEL_CHANNELS: list[str] = []
