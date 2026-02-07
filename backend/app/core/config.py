"""Application configuration settings."""

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
    VALID_GROUPS: list[str] = ["mrbeast", "modern", "historical"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
