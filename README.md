# MrBeast Thumbnail Evolution Analyzer

A complete system for analyzing YouTube thumbnail visual features with a Python backend and Next.js dashboard.

## Project Structure

```
HTCCResearch/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI endpoints
│   │   ├── core/           # Config and database
│   │   ├── models/         # SQLAlchemy models
│   │   ├── services/       # Feature extraction & pipeline
│   │   └── utils/          # Helper functions
│   ├── scripts/            # CLI scripts
│   ├── data/thumbnails/    # Input images
│   │   ├── mrbeast/
│   │   ├── modern/
│   │   └── historical/
│   └── outputs/            # Generated files
└── web/                    # Next.js dashboard
    ├── app/                # Pages
    └── lib/                # API client & types
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Tesseract OCR (for text detection)

### Install Tesseract (macOS)
```bash
brew install tesseract
```

## Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd web

# Install dependencies
npm install
```

## Usage

### 1. Add Thumbnail Images

Place your thumbnail images in the appropriate directories:
- `backend/data/thumbnails/mrbeast/` - MrBeast thumbnails
- `backend/data/thumbnails/modern/` - Modern trending thumbnails
- `backend/data/thumbnails/historical/` - Historical thumbnails (~10 years ago)

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.bmp`, `.gif`

### 2. Ingest Images

```bash
cd backend
source .venv/bin/activate

# Ingest all groups
python scripts/ingest_dataset.py --root data/thumbnails

# Or ingest a specific group
python scripts/ingest_dataset.py --root data/thumbnails --group mrbeast
```

### 3. Run Feature Extraction

```bash
# Run pipeline on all thumbnails
python scripts/run_pipeline.py

# Run on specific group
python scripts/run_pipeline.py --group mrbeast

# Check status
python scripts/run_pipeline.py --status

# Force re-extraction
python scripts/run_pipeline.py --force

# Extract specific features only
python scripts/run_pipeline.py --features color text face
```

### 4. Start the API Server

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API will be available at http://localhost:8000
- API docs: http://localhost:8000/docs

### 5. Start the Dashboard

```bash
cd web
npm run dev
```

Dashboard will be available at http://localhost:3000

## Features Extracted

### Color Features
- Average saturation and brightness
- 36-bin hue histogram
- Dominant color palette (5 colors via K-means)
- Warm/cool color score

### Text Features (OCR)
- Text presence detection
- Text area ratio
- Text box count
- Text position distribution (top/middle/bottom)

### Face Features (MediaPipe)
- Face count
- Face area ratios
- Emotion proxies (smile, mouth open, brow raise)

### Pose Features (MediaPipe)
- People count
- Visible hands count
- Pose orientation
- Body coverage ratio

### Depth Features (MiDaS)
- Depth contrast
- Foreground ratio
- Subject center of mass

## API Endpoints

### Thumbnails
- `GET /thumbnails` - List with filters
- `GET /thumbnails/{id}` - Single thumbnail
- `POST /thumbnails/ingest` - Ingest from disk
- `POST /thumbnails/pipeline/run` - Run extraction
- `GET /thumbnails/pipeline/status` - Pipeline status

### Statistics
- `GET /stats/overview` - Dataset overview
- `GET /stats/distributions?feature=...` - Feature distribution
- `GET /stats/compare?feature=...` - Group comparison
- `GET /stats/correlations?target=views` - Feature correlations

### Clustering
- `GET /clustering/run?k=3` - Run K-means clustering
- `GET /clustering/points` - Get 2D projection points
- `GET /clustering/summary` - Clustering status

## Dashboard Pages

1. **Dashboard** - Overview statistics, group distribution, year timeline
2. **Compare** - Compare feature distributions across groups
3. **Thumbnails** - Browse and filter thumbnails with feature details
4. **Clustering** - 2D scatter plot visualization with cluster analysis

## Development

### Adding New Features

1. Create a new extractor in `backend/app/services/features_*.py`
2. Add to pipeline in `backend/app/services/pipeline.py`
3. Update clustering features in `backend/app/services/clustering.py`
4. Add UI components in `web/app/`

### Database

SQLite database is stored at `backend/thumbnail_analyzer.db`

To reset:
```bash
rm backend/thumbnail_analyzer.db
```
