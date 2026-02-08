"""Thumbnail database model."""

from datetime import datetime
from typing import Optional
import json

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.db import Base


class ThumbnailGroup(str, enum.Enum):
    """Thumbnail group categories."""

    MRBEAST = "mrbeast"
    Y2015 = "2015"
    Y2016 = "2016"
    Y2017 = "2017"
    Y2018 = "2018"
    Y2019 = "2019"
    Y2020 = "2020"
    Y2021 = "2021"
    Y2022 = "2022"
    Y2023 = "2023"
    Y2024 = "2024"
    Y2025 = "2025"


class ThumbnailSource(str, enum.Enum):
    """Thumbnail source types."""

    LOCAL = "local"
    URL = "url"


class Thumbnail(Base):
    """Thumbnail record with metadata."""

    __tablename__ = "thumbnails"

    id = Column(Integer, primary_key=True, autoincrement=True)
    group = Column(String(20), nullable=False, index=True)
    source = Column(String(10), default="local")
    file_path = Column(String(500), nullable=False, unique=True)
    url = Column(String(500), nullable=True)

    # Metadata
    title = Column(String(500), nullable=True)
    channel = Column(String(200), nullable=True)
    publish_date = Column(DateTime, nullable=True)
    year = Column(Integer, nullable=True, index=True)
    views = Column(Integer, nullable=True)
    ctr = Column(Float, nullable=True)

    # Processing status
    features_extracted = Column(Boolean, default=False)
    features_json = Column(Text, nullable=True)  # JSON blob for all features
    cluster_id = Column(Integer, nullable=True)
    cluster_x = Column(Float, nullable=True)  # 2D projection X
    cluster_y = Column(Float, nullable=True)  # 2D projection Y

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_features(self) -> dict:
        """Parse and return features as a dictionary."""
        if self.features_json:
            return json.loads(self.features_json)
        return {}

    def set_features(self, features: dict):
        """Set features from a dictionary."""
        self.features_json = json.dumps(features)
        self.features_extracted = True

    def update_features(self, new_features: dict):
        """Update existing features with new ones."""
        current = self.get_features()
        current.update(new_features)
        self.set_features(current)

    def __repr__(self):
        return f"<Thumbnail(id={self.id}, group={self.group}, file_path={self.file_path})>"
