"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.db import init_db, SessionLocal
from app.api import thumbnails, stats, clustering
from app.services.watcher import start_watcher, stop_watcher
from app.services.ingest import ingest_all_groups
from app.services.pipeline import run_pipeline


# Initialize FastAPI app
app = FastAPI(
    title="Thumbnail Analyzer API",
    description="API for analyzing YouTube thumbnail visual features",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving thumbnails
if settings.THUMBNAILS_DIR.exists():
    app.mount(
        "/static/thumbnails",
        StaticFiles(directory=str(settings.THUMBNAILS_DIR)),
        name="thumbnails",
    )

if settings.DEPTH_MAPS_DIR.exists():
    app.mount(
        "/static/depth_maps",
        StaticFiles(directory=str(settings.DEPTH_MAPS_DIR)),
        name="depth_maps",
    )

# Include routers
app.include_router(thumbnails.router, prefix="/thumbnails", tags=["thumbnails"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])
app.include_router(clustering.router, prefix="/clustering", tags=["clustering"])


@app.on_event("startup")
async def startup_event():
    """Initialize database, ingest existing thumbnails, and start file watcher."""
    import logging
    logger = logging.getLogger(__name__)

    init_db()

    # Ingest any existing thumbnails from all group folders
    db = SessionLocal()
    try:
        logger.info("Scanning for existing thumbnails...")
        results = ingest_all_groups(db, settings.THUMBNAILS_DIR)

        total_created = sum(r["created"] for r in results.values())
        total_found = sum(r["total_found"] for r in results.values())

        if total_created > 0:
            logger.info(f"Ingested {total_created} new thumbnails out of {total_found} found")

        # Process any unprocessed thumbnails
        logger.info("Processing unprocessed thumbnails...")
        pipeline_stats = run_pipeline(db, force=False, save_depth_maps=True)

        if pipeline_stats["processed"] > 0:
            logger.info(f"Processed {pipeline_stats['processed']} thumbnails in {pipeline_stats['total_time']}s")
    except Exception as e:
        logger.error(f"Error during startup ingestion: {e}")
    finally:
        db.close()

    start_watcher()


@app.on_event("shutdown")
async def shutdown_event():
    """Stop file watcher on shutdown."""
    stop_watcher()


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Thumbnail Analyzer API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "endpoints": {
            "health": "/health",
            "thumbnails": "/thumbnails",
            "stats": "/stats",
            "clustering": "/clustering",
        },
    }
