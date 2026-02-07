"""Clustering API endpoints."""

from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.db import get_db
from app.services.clustering import (
    run_clustering,
    get_clustering_points,
    get_cluster_summary,
)


router = APIRouter()


class ClusterPoint(BaseModel):
    """Response model for a cluster point."""

    id: int
    x: float
    y: float
    cluster_id: Optional[int]
    group: str
    file_path: str
    title: Optional[str]


class ClusteringRunRequest(BaseModel):
    """Request model for running clustering."""

    k: int = 3
    group: Optional[str] = None
    method: str = "kmeans"


@router.post("/run")
async def run_clustering_endpoint(
    request: ClusteringRunRequest,
    db: Session = Depends(get_db),
):
    """Run clustering algorithm on thumbnail features."""
    result = run_clustering(
        db,
        k=request.k,
        group=request.group,
        method=request.method,
    )
    return result


@router.get("/run")
async def run_clustering_get(
    db: Session = Depends(get_db),
    k: int = Query(3, ge=2, le=10, description="Number of clusters"),
    group: Optional[str] = Query(None, description="Filter by group"),
    method: str = Query("kmeans", description="Clustering method"),
):
    """Run clustering algorithm (GET endpoint for convenience)."""
    result = run_clustering(
        db,
        k=k,
        group=group,
        method=method,
    )
    return result


@router.get("/points", response_model=List[ClusterPoint])
async def get_points(
    db: Session = Depends(get_db),
    group: Optional[str] = Query(None, description="Filter by group"),
):
    """Get 2D clustering points for visualization."""
    points = get_clustering_points(db, group)
    return [ClusterPoint(**p) for p in points]


@router.get("/summary")
async def get_summary(db: Session = Depends(get_db)):
    """Get summary of current clustering state."""
    return get_cluster_summary(db)
