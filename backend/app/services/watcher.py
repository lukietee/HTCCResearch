"""File watcher service for automatic thumbnail ingestion and processing."""

import logging
import threading
from pathlib import Path
from typing import Optional

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

from app.core.config import settings
from app.core.db import SessionLocal
from app.services.ingest import ingest_thumbnail
from app.services.pipeline import process_thumbnail
from app.utils.images import is_image_file


logger = logging.getLogger(__name__)

# Global observer instance
_observer: Optional[Observer] = None
_observer_lock = threading.Lock()


class ThumbnailEventHandler(FileSystemEventHandler):
    """Handle file system events for new thumbnails."""

    def on_created(self, event: FileCreatedEvent):
        """Handle new file creation events."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        # Check if it's an image file
        if not is_image_file(file_path):
            return

        # Determine group from parent folder
        group = self._get_group_from_path(file_path)
        if not group:
            logger.warning(f"Could not determine group for: {file_path}")
            return

        logger.info(f"New thumbnail detected: {file_path} (group: {group})")

        # Process in a separate thread to avoid blocking the watcher
        thread = threading.Thread(
            target=self._ingest_and_process,
            args=(file_path, group),
            daemon=True,
        )
        thread.start()

    def _get_group_from_path(self, file_path: Path) -> Optional[str]:
        """Extract group name from file path."""
        # Expected structure: .../thumbnails/{group}/image.jpg
        try:
            parent = file_path.parent.name.lower()
            if parent in settings.VALID_GROUPS:
                return parent
        except Exception:
            pass
        return None

    def _ingest_and_process(self, file_path: Path, group: str):
        """Ingest and process a single thumbnail."""
        db = SessionLocal()
        try:
            # Ingest the thumbnail
            thumbnail, was_created = ingest_thumbnail(db, file_path, group)

            if was_created:
                logger.info(f"Ingested new thumbnail: {file_path}")

                # Process features
                result = process_thumbnail(
                    db,
                    thumbnail,
                    force=False,
                    save_depth_map=True,
                )
                logger.info(
                    f"Processed thumbnail {thumbnail.id}: {result.get('status')}"
                )
            else:
                logger.debug(f"Thumbnail already exists: {file_path}")

        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
        finally:
            db.close()


def start_watcher():
    """Start the file system watcher."""
    global _observer

    with _observer_lock:
        if _observer is not None:
            logger.warning("Watcher is already running")
            return

        watch_path = settings.THUMBNAILS_DIR
        if not watch_path.exists():
            logger.warning(f"Thumbnails directory not found: {watch_path}")
            watch_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created thumbnails directory: {watch_path}")

        _observer = Observer()
        event_handler = ThumbnailEventHandler()

        # Watch the thumbnails directory recursively
        _observer.schedule(event_handler, str(watch_path), recursive=True)
        _observer.start()

        logger.info(f"File watcher started, monitoring: {watch_path}")


def stop_watcher():
    """Stop the file system watcher."""
    global _observer

    with _observer_lock:
        if _observer is None:
            return

        _observer.stop()
        _observer.join(timeout=5)
        _observer = None

        logger.info("File watcher stopped")
