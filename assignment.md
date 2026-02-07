# Assignment: MrBeast Thumbnail Evolution Analyzer + Stats Dashboard Webapp

This assignment implements the analysis pipeline + visual dashboard described in the HTCC proposal. :contentReference[oaicite:0]{index=0}

## Goal

Build a small system that:
1) Ingests thumbnail images across 3 groups:
   - MrBeast thumbnails (2018–2025)
   - Modern trending thumbnails
   - Historical trending thumbnails (~10 years ago)
2) Extracts visual features (color, depth/composition, face/pose, text)
3) Stores results in a database
4) Hosts a basic webapp to visualize stats, compare groups, and run clustering

The pipeline should support the proposal’s features:
- Color palette extraction (K-means)  
- Depth map analysis  
- Body/pose detection (MediaPipe)  
- Face landmarks + “basic emotion signals” (MediaPipe FaceMesh)  
- Text detection (OCR)  
- Clustering + group comparison  
- Correlation vs performance (views/CTR) if available :contentReference[oaicite:1]{index=1}

---

## Deliverables

### A) Data + Analysis Pipeline
- CLI to:
  - Import thumbnails and metadata
  - Run feature extraction
  - Export analysis to JSON/CSV
  - Re-run on new data incrementally (don’t recompute if already processed unless `--force`)

### B) Storage
- Persist extracted features + metadata in a DB (SQLite is fine for MVP).
- Keep the original file path or URL reference.

### C) Basic Dashboard Webapp
A simple dashboard that can:
- Show dataset overview counts per group/year
- Histograms/boxplots for key metrics (saturation, face size, text amount, people count, etc.)
- Group comparisons (MrBeast vs modern vs historical)
- Thumbnail gallery with filters (e.g., “has text”, “2+ faces”, “top saturation”, “year range”)
- Clustering view (2D scatter of embeddings/features)
- Correlation table (feature vs views/CTR if available)

---

## Non-goals (for now)
- Perfect “emotion detection” (keep it simple: mouth openness, smile ratio, eyebrow raise proxies)
- Production-grade scalability
- Auth/users
- Upload UI (can be done later; CLI ingestion is enough)

---

## Suggested Tech Stack

### Backend
- Python 3.11+
- FastAPI (API server)
- SQLite + SQLAlchemy (or sqlite3 if you want minimal)
- OpenCV, NumPy, Pillow
- scikit-learn (k-means + clustering + PCA/UMAP optional)
- MediaPipe (pose + face mesh)
- OCR: pytesseract (requires Tesseract installed locally)

### Depth Map
Pick ONE for MVP:
- Option 1 (recommended): local MiDaS depth via PyTorch (offline, reproducible)
- Option 2: depth-map API (if you already have one) + store returned maps :contentReference[oaicite:2]{index=2}

### Frontend
- Next.js (App Router)
- Basic charts: Recharts or Chart.js
- Fetch from FastAPI endpoints

---

## Repo Structure
thumbnail-analyzer/
backend/
app/
main.py
api/
thumbnails.py
stats.py
clustering.py
core/
config.py
db.py
models/
thumbnail.py
services/
ingest.py
features_color.py
features_depth.py
features_face.py
features_pose.py
features_text.py
pipeline.py
clustering.py
utils/
images.py
math.py
scripts/
ingest_dataset.py
run_pipeline.py
data/
thumbnails/
mrbeast/
modern/
historical/
outputs/
depth_maps/
palettes/
requirements.txt
web/
app/
page.tsx
dashboard/
thumbnails/
compare/
clustering/
lib/
api.ts
types.ts
package.json
README.md


---

## Data Model (Minimum)

### Thumbnail table
- id (uuid or int)
- group: `mrbeast | modern | historical`
- source: `local | url`
- file_path (or url)
- title (optional)
- channel (optional)
- publish_date (optional)
- year (derived or provided)
- views (optional)
- ctr (optional)

### Features table (or JSON column)
Store as a JSON blob for MVP, or separate columns if you prefer.
Suggested fields:
- color:
  - avg_saturation
  - avg_brightness
  - hue_hist (array)
  - dominant_palette (list of RGB)
  - warm_cool_score
- composition/depth:
  - foreground_ratio
  - depth_contrast
  - subject_depth_center (x,y proxy)
- faces:
  - face_count
  - largest_face_area_ratio
  - avg_face_area_ratio
  - “emotion proxies” (smile_score, mouth_open_score, brow_raise_score)
- pose:
  - people_count
  - hand_visible_count
  - pose_orientation (front/side proxy)
- text:
  - has_text (bool)
  - text_area_ratio
  - text_box_count
  - text_position_heat (e.g., top/mid/bottom)

This matches the proposal’s measurement categories. :contentReference[oaicite:3]{index=3}

---

## Feature Extraction Specs

### 1) Color Palette Extraction
Input: thumbnail image  
Output:
- avg_saturation: compute from HSV S channel mean
- dominant colors: k-means on pixels (k=5 default)
- warm_cool_score: compare warm hue bins vs cool hue bins
- hue_hist: 36-bin histogram of hue

### 2) Depth Map Analysis
Output (MVP):
- depth_contrast = std(depth_map)
- foreground_ratio = fraction of pixels above a depth threshold (e.g., closer than median)
- subject_depth_center: center-of-mass of “closest region” mask

### 3) Pose Detection (MediaPipe Pose)
Output:
- people_count (MVP proxy: 0/1 from pose detection; later multi-person)
- hand_visible_count (use landmarks availability)
- pose_orientation proxy: shoulder-to-shoulder width vs torso depth cues

### 4) Face Landmarks (MediaPipe FaceMesh)
Output:
- face_count (MVP: detect face bounding boxes; FaceMesh gives landmarks for one; for many faces use a face detector + FaceMesh on largest)
- face area ratio: face bbox area / image area
- emotion proxies:
  - smile_score: mouth corner distance / mouth width
  - mouth_open_score: lip gap / mouth width
  - brow_raise_score: eyebrow-to-eye distance normalized

### 5) Text Detection (OCR)
Output:
- has_text: any confident OCR result
- text_area_ratio: sum of OCR word boxes area / image area
- text_box_count
- text position: top/middle/bottom distribution

---

## API Requirements (FastAPI)

### Endpoints
- `GET /health`
- `POST /thumbnails/ingest` (optional; CLI is fine)
- `POST /pipeline/run?group=...&force=false`
- `GET /thumbnails?group=&year_min=&year_max=&has_text=&min_faces=&sort=`
- `GET /thumbnails/{id}`
- `GET /stats/overview`  
  Returns counts by group/year + missing-fields summary
- `GET /stats/distributions?feature=avg_saturation&group=...`
- `GET /stats/compare?feature=largest_face_area_ratio`
- `GET /clustering/run?k=3&method=kmeans`
- `GET /clustering/points`  
  Returns 2D points + group labels (PCA or UMAP)

---

## Webapp Pages (Next.js)

### 1) Dashboard Overview
- Total thumbnails
- Counts per group
- Year timeline bar chart
- Missing metadata (views/ctr missing count)

### 2) Compare Groups
- Select feature dropdown (saturation, face size, text_area_ratio, etc.)
- Show distribution chart per group
- Show summary stats (mean/median/std)

### 3) Thumbnails Explorer
- Grid gallery
- Filters:
  - group
  - year range
  - has text
  - face_count >= N
  - sort by: saturation, face size, text amount, depth contrast
- Click thumbnail -> detail panel with all extracted features

### 4) Clustering
- Button: “Run clustering”
- 2D scatter plot colored by group
- Cluster assignment display
- Ability to click a point and see the thumbnail

---

## Milestones (Do in order)

### Milestone 1: Dataset + DB
- Create DB schema
- Implement ingestion from:
  - `backend/data/thumbnails/{group}/`
- Store metadata JSON (optional)

### Milestone 2: Color + Text Features
- Implement color extraction module
- Implement OCR module
- Persist results

### Milestone 3: Face + Pose Features
- Implement MediaPipe face + pose
- Compute face count + face ratios + emotion proxies

### Milestone 4: Depth Features
- Implement MiDaS or chosen depth method
- Store depth summary metrics (no need to store full map unless you want)

### Milestone 5: Clustering + Compare
- Build a feature vector per thumbnail
- Normalize features
- Run k-means clustering
- Reduce to 2D for plotting (PCA first, optional UMAP later)
- Save cluster labels

### Milestone 6: Web Dashboard
- Build the 4 pages above
- Hook to FastAPI endpoints

---

## Acceptance Criteria

### Pipeline
- Running `run_pipeline.py` on a folder of images populates DB with feature rows for each image.
- Re-running does not duplicate records.
- Features exist for at least:
  - avg_saturation
  - dominant_palette
  - has_text + text_area_ratio
  - face_count + largest_face_area_ratio
  - depth_contrast
  - people_count/pose detected (even if 0/1)

### Dashboard
- You can visually compare at least 3 features across the 3 groups.
- You can filter thumbnails by group and “has text”.
- You can view clustering scatter plot with clickable thumbnails.

---

## Commands (Target UX)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/ingest_dataset.py --root data/thumbnails
python scripts/run_pipeline.py --group mrbeast
uvicorn app.main:app --reload --port 8000
