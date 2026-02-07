"""Thumbnail API endpoints."""

from typing import Optional, List
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from pydantic import BaseModel

from app.core.db import get_db
from app.core.config import settings
from app.models.thumbnail import Thumbnail
from app.services.ingest import ingest_all_groups
from app.services.pipeline import run_pipeline, get_pipeline_status, ALL_FEATURES


router = APIRouter()


class ThumbnailResponse(BaseModel):
    """Response model for a single thumbnail."""

    id: int
    group: str
    file_path: str
    title: Optional[str]
    channel: Optional[str]
    year: Optional[int]
    views: Optional[int]
    ctr: Optional[float]
    features_extracted: bool
    features: Optional[dict]
    cluster_id: Optional[int]

    class Config:
        from_attributes = True


class ThumbnailListResponse(BaseModel):
    """Response model for thumbnail list."""

    items: List[ThumbnailResponse]
    total: int
    page: int
    page_size: int


class PipelineRunRequest(BaseModel):
    """Request model for running the pipeline."""

    group: Optional[str] = None
    features: Optional[List[str]] = None
    force: bool = False
    limit: Optional[int] = None


@router.get("", response_model=ThumbnailListResponse)
async def list_thumbnails(
    db: Session = Depends(get_db),
    group: Optional[str] = Query(None, description="Filter by group"),
    year_min: Optional[int] = Query(None, description="Minimum year"),
    year_max: Optional[int] = Query(None, description="Maximum year"),
    has_text: Optional[bool] = Query(None, description="Filter by text presence"),
    min_faces: Optional[int] = Query(None, description="Minimum face count"),
    sort: str = Query("id", description="Sort field"),
    order: str = Query("asc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    """List thumbnails with filters and pagination."""
    query = db.query(Thumbnail)

    # Apply filters
    if group:
        query = query.filter(Thumbnail.group == group)

    if year_min is not None:
        query = query.filter(Thumbnail.year >= year_min)

    if year_max is not None:
        query = query.filter(Thumbnail.year <= year_max)

    # Note: has_text and min_faces require feature inspection
    # For MVP, we'll do this post-query (not ideal for large datasets)

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_column = getattr(Thumbnail, sort, Thumbnail.id)
    if order == "desc":
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))

    # Apply pagination
    offset = (page - 1) * page_size
    thumbnails = query.offset(offset).limit(page_size).all()

    # Filter by features (post-query for MVP)
    filtered_items = []
    for thumb in thumbnails:
        features = thumb.get_features()

        # Filter by has_text
        if has_text is not None:
            text_features = features.get("text", {})
            thumb_has_text = text_features.get("has_text", False)
            if has_text != thumb_has_text:
                continue

        # Filter by min_faces
        if min_faces is not None:
            face_features = features.get("face", {})
            face_count = face_features.get("face_count", 0)
            if face_count < min_faces:
                continue

        filtered_items.append(ThumbnailResponse(
            id=thumb.id,
            group=thumb.group,
            file_path=thumb.file_path,
            title=thumb.title,
            channel=thumb.channel,
            year=thumb.year,
            views=thumb.views,
            ctr=thumb.ctr,
            features_extracted=thumb.features_extracted,
            features=features,
            cluster_id=thumb.cluster_id,
        ))

    return ThumbnailListResponse(
        items=filtered_items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{thumbnail_id}", response_model=ThumbnailResponse)
async def get_thumbnail(
    thumbnail_id: int,
    db: Session = Depends(get_db),
):
    """Get a single thumbnail by ID."""
    thumb = db.query(Thumbnail).filter(Thumbnail.id == thumbnail_id).first()

    if not thumb:
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return ThumbnailResponse(
        id=thumb.id,
        group=thumb.group,
        file_path=thumb.file_path,
        title=thumb.title,
        channel=thumb.channel,
        year=thumb.year,
        views=thumb.views,
        ctr=thumb.ctr,
        features_extracted=thumb.features_extracted,
        features=thumb.get_features(),
        cluster_id=thumb.cluster_id,
    )


@router.post("/ingest")
async def ingest_thumbnails(
    db: Session = Depends(get_db),
    force: bool = Query(False, description="Force update existing records"),
):
    """Ingest thumbnails from the data directory."""
    results = ingest_all_groups(db, settings.THUMBNAILS_DIR, force=force)
    return {"status": "completed", "results": results}


@router.post("/pipeline/run")
async def run_extraction_pipeline(
    request: PipelineRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Run the feature extraction pipeline."""
    features = set(request.features) if request.features else None

    # For small datasets, run synchronously
    # For larger datasets, could run in background
    stats = run_pipeline(
        db,
        group=request.group,
        features=features,
        force=request.force,
        limit=request.limit,
    )

    return {"status": "completed", "stats": stats}


@router.get("/pipeline/status")
async def pipeline_status(db: Session = Depends(get_db)):
    """Get the current pipeline status."""
    return get_pipeline_status(db)
