# Clicking Toward Conformity: Quantifying the Convergence of YouTube Thumbnail Design Toward MrBeast's Visual Formula (2015–2025)

**Lucas Trinh & Zachary Chen — 2026 HTCC Conference**

## Abstract

This study investigates whether YouTube thumbnail design has converged toward the visual style pioneered by MrBeast over the period 2015–2025. Using a panel of 22 YouTube channels tracked across 11 years, we extract 23 computational features (14 visual, 9 title-based) from thousands of thumbnails and apply multiple scoring systems, clustering, and statistical hypothesis testing. We find statistically significant convergence (linear regression slope = +0.105 likeness points/year, p < 10⁻¹⁰), with 73% of panel channels trending toward MrBeast's formula. The most discriminative features are smile intensity and brightness, which together account for 53% of the data-derived feature weighting. The convergence follows a Diffusion of Innovation pattern, with early adopters (2018–2019), an early majority inflection point (2020–2022), and near-ubiquity among entertainment channels by 2023–2025.

---

## Table of Contents

1. [Research Questions](#research-questions)
2. [Dataset](#dataset)
3. [System Architecture](#system-architecture)
4. [Feature Extraction Pipeline](#feature-extraction-pipeline)
5. [Scoring Systems](#scoring-systems)
6. [Statistical Analysis](#statistical-analysis)
7. [Key Findings](#key-findings)
8. [Clustering Analysis](#clustering-analysis)
9. [Channel-Level Evolution](#channel-level-evolution)
10. [Title Analysis](#title-analysis)
11. [API Reference](#api-reference)
12. [Setup & Reproduction](#setup--reproduction)
13. [Limitations](#limitations)
14. [References](#references)

---

## Research Questions

1. **Has YouTube thumbnail design converged toward MrBeast's visual style over 2015–2025?**
2. **Which visual features changed most over time?**
3. **Do modern thumbnails cluster closer to MrBeast's than historical ones?**
4. **Is the shift statistically significant — or just noise?**

---

## Dataset

### Data Collection

Thumbnails were collected via the **YouTube Data API v3** using a resumable, quota-aware collection script (`scripts/collect_youtube.py`). For each channel-year pair, the top 15 most-viewed long-form videos (Shorts excluded via duration filtering) were retrieved, and their highest-resolution thumbnails (1280×720 maxresdefault, with hqdefault fallback) were downloaded.

**Quota management:** Each `search.list` call costs 100 quota units, `videos.list` costs 1 unit, against a daily limit of 10,000 units. The script tracks usage in real time and stops at 9,800 units to preserve a safety margin. Collection state is persisted to JSON for resumability across sessions.

### Panel Channels (22)

Channels were selected to represent the dominant YouTube entertainment ecosystem while including genre diversity:

| Category | Channels |
|---|---|
| **Entertainment (14)** | Dude Perfect, PewDiePie, Sidemen, FaZe Rug, Danny Duncan, Logan Paul, KSI, IShowSpeed, Ryan Trahan, Airrack, JiDion, Unspeakable, David Dobrik, Matt Stonie |
| **Gaming (3)** | Markiplier, VanossGaming, LazarBeam |
| **Comedy/Art/Other (3)** | ZHC, Good Mythical Morning, Smosh |
| **Controls (2)** | Jelly, Cody Ko |

Each channel is tracked across 2015–2025 (subject to `active_since` dates), yielding up to 15 thumbnails × 11 years × 22 channels.

### MrBeast Reference Set (309 thumbnails)

MrBeast's thumbnails are collected by era to capture his stylistic evolution:

| Era | Years | Target |
|---|---|---|
| Early | 2015–2016 | 30 thumbnails |
| Growth | 2017–2018 | 40 thumbnails |
| Mainstream | 2019–2020 | 50 thumbnails |
| Peak | 2021–2022 | 60 thumbnails |
| Current | 2023–2025 | 70 thumbnails |

Within each era, videos are sorted by view count and the top N are selected.

### Supplementary Channels (36)

An additional 36 channels (AMP, Ali-A, Dream, Kai Cenat, Ludwig, etc.) are registered for 2024–2025 snapshots to broaden the modern comparison pool.

### Metadata

For every collected video, the following metadata is stored in CSV (`data/metadata/all_collected.csv`):
- `file_path`, `channel`, `title`, `video_id`, `views`, `publish_date`, `duration`, `group`

---

## System Architecture

The project is a full-stack research platform:

```
HTCCResearch/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI REST endpoints
│   │   │   ├── thumbnails.py # CRUD, ingestion, pipeline triggers
│   │   │   ├── stats.py      # All statistical analysis endpoints
│   │   │   └── clustering.py # K-means clustering endpoints
│   │   ├── core/
│   │   │   ├── config.py     # Pydantic settings (env-driven)
│   │   │   └── db.py         # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   └── thumbnail.py  # SQLAlchemy ORM model
│   │   ├── services/
│   │   │   ├── pipeline.py       # Orchestrates all extractors
│   │   │   ├── features_color.py # Color analysis
│   │   │   ├── features_face.py  # Face detection + emotion proxies
│   │   │   ├── features_pose.py  # Pose detection
│   │   │   ├── features_text.py  # OCR text detection
│   │   │   ├── features_depth.py # MiDaS depth estimation
│   │   │   ├── features_title.py # Title NLP analysis
│   │   │   ├── clustering.py     # K-means + PCA
│   │   │   ├── ingest.py         # Directory scanning + DB ingestion
│   │   │   └── watcher.py        # Filesystem watcher (auto-ingest)
│   │   └── utils/
│   │       ├── images.py     # Image loading, resizing, color conversion
│   │       └── math.py       # Euclidean distance, center of mass, etc.
│   ├── scripts/
│   │   ├── collect_youtube.py  # YouTube API collection (panel/mrbeast/supplementary)
│   │   ├── channels.json       # Channel registry with IDs and metadata
│   │   ├── generate_pptx.py    # PowerPoint presentation generator
│   │   ├── ingest_dataset.py   # Batch ingestion script
│   │   └── run_pipeline.py     # CLI pipeline runner
│   ├── models/                 # Pre-trained ML model files
│   │   ├── blaze_face_short_range.tflite
│   │   ├── face_landmarker.task
│   │   └── pose_landmarker.task
│   ├── data/
│   │   ├── thumbnails/         # Raw images organized by group
│   │   │   ├── mrbeast/
│   │   │   ├── 2015/ ... 2025/
│   │   └── metadata/
│   │       └── all_collected.csv
│   └── outputs/
│       ├── depth_maps/         # Generated depth visualizations
│       └── presentation.pptx   # Auto-generated slides
├── web/                        # Next.js frontend (visualization dashboard)
└── .gitignore
```

### Database

SQLite database (`thumbnail_analyzer.db`) managed by SQLAlchemy ORM. Each `Thumbnail` record stores:

| Column | Type | Description |
|---|---|---|
| `id` | Integer | Auto-increment primary key |
| `group` | String | Year group (`2015`–`2025`) or `mrbeast` |
| `file_path` | String | Absolute path to thumbnail image |
| `title` | String | Video title |
| `channel` | String | Channel name |
| `year` | Integer | Publication year |
| `views` | Integer | View count at time of collection |
| `ctr` | Float | Click-through rate (when available) |
| `features_extracted` | Boolean | Processing status |
| `features_json` | Text | JSON blob containing all extracted features |
| `cluster_id` | Integer | K-means cluster assignment |
| `cluster_x` / `cluster_y` | Float | 2D PCA projection coordinates |

### Backend Server

FastAPI application (`app/main.py`) with:
- **Startup auto-processing:** On launch, scans for new thumbnails, ingests them, and runs the extraction pipeline on any unprocessed images
- **File watcher:** Watchdog-based filesystem monitor that auto-ingests new thumbnails dropped into data directories
- **CORS:** Configured for local development (ports 3000, 3001)
- **Static file serving:** Thumbnails and depth maps served at `/static/`

---

## Feature Extraction Pipeline

The pipeline (`services/pipeline.py`) orchestrates six independent feature extractors. Each thumbnail is processed through all extractors, and results are stored as a JSON blob in the database. Processing is idempotent — already-extracted features are skipped unless `force=True`.

### 1. Color Analysis (`features_color.py`)

**Tools:** OpenCV, scikit-learn (K-Means), NumPy

Converts each thumbnail from BGR to HSV color space to analyze color properties independent of lighting.

| Feature | Type | Description |
|---|---|---|
| `avg_saturation` | float (0–1) | Mean saturation across all pixels. Higher values indicate more vivid, intense colors. |
| `avg_brightness` | float (0–1) | Mean value/brightness channel. MrBeast thumbnails average 0.658 vs 0.570 for 2015. |
| `hue_hist` | float[36] | Normalized 36-bin hue histogram (10° increments over OpenCV's 0–179 hue range). |
| `dominant_palette` | string[5] | Top 5 hex colors extracted via K-means clustering on a 10,000-pixel subsample. |
| `warm_cool_score` | float (-1 to +1) | Ratio of warm pixels (hue ≤30 or ≥150, i.e., reds/oranges/yellows) to cool pixels (hue 30–150, i.e., greens/blues). Score = (warm − cool) / total. |

**K-means color extraction:** The image is reshaped to a flat list of BGR pixel values. If there are more than 10,000 pixels, a random subsample of 10,000 is taken for performance. K-means (k=5, 10 initializations, 100 max iterations, seed=42) finds the 5 dominant colors, which are sorted by cluster frequency and returned as hex strings.

### 2. Face & Emotion Detection (`features_face.py`)

**Tools:** MediaPipe Face Detection (BlazeFace short-range TFLite model), MediaPipe FaceLandmarker (468-landmark model)

Two-stage pipeline: first detect faces to get count and bounding boxes, then run the full 468-landmark mesh on the largest face for emotion proxy estimation.

| Feature | Type | Description |
|---|---|---|
| `face_count` | int | Number of faces detected (confidence > 0.5). MrBeast averages 1.37 vs 0.78 for 2015. |
| `largest_face_area_ratio` | float | Bounding box area of the largest face divided by total image area. Measures close-up intensity. |
| `avg_face_area_ratio` | float | Average face area ratio across all detected faces. |
| `smile_score` | float (0–1) | Measures mouth corner elevation relative to lip center, normalized by mouth width. Corners above center → smile. Computed as `clamp((lip_center_y − corner_avg_y) / mouth_width + 0.5, 0, 1)`. |
| `mouth_open_score` | float (0–1) | Euclidean distance between upper lip (landmark 13) and lower lip (landmark 14), normalized by mouth width. Captures "shocked face" expressions. |
| `brow_raise_score` | float (0–1) | Average distance from eyebrow landmarks (66, 296) to eye-top landmarks (159, 386), normalized by estimated face height and scaled by 3×. |

**Emotion proxy design rationale:** Rather than using a black-box emotion classifier (which would introduce its own biases), we measure geometric relationships between facial landmarks. Smile detection is based on the well-established FACS Action Unit 12 (lip corner puller). Mouth openness approximates AU 25+26. Brow raise approximates AU 1+2. These are more interpretable and reproducible than model-predicted emotion labels.

### 3. Pose Detection (`features_pose.py`)

**Tools:** MediaPipe Pose Landmarker (33-landmark model)

Detects body pose to measure how prominently a person appears in the thumbnail.

| Feature | Type | Description |
|---|---|---|
| `people_count` | int | 0 or 1 (single-person detection in MVP). |
| `hand_visible_count` | int (0–2) | Counts hands where the average visibility of wrist/pinky/index/thumb landmarks exceeds 0.3. |
| `pose_orientation` | string | Estimated as `"front"`, `"left"`, `"right"`, `"side"`, or `"unknown"` based on shoulder width and nose visibility. Narrow shoulder width (<0.08 normalized) indicates a side view. |
| `body_coverage` | float (0–1) | Bounding box area of all visible pose landmarks (visibility > 0.3) divided by image area. MrBeast averages 0.413 vs 0.237 for 2015. |

### 4. Text Detection (`features_text.py`)

**Tools:** PyTesseract (Tesseract OCR)

Runs OCR to detect and measure text overlays on thumbnails.

| Feature | Type | Description |
|---|---|---|
| `has_text` | bool | Whether any text was detected with confidence > 30%. |
| `text_area_ratio` | float | Total bounding box area of all detected text regions divided by image area. MrBeast thumbnails trend toward minimal text (≤ 0.005). |
| `text_box_count` | int | Number of distinct text regions detected. |
| `text_position_heat` | dict | Distribution of text across vertical thirds: `{"top": 0.0, "middle": 0.0, "bottom": 0.0}` (sums to 1.0). |
| `detected_text` | string[] | Up to 10 recognized text strings (for reference). |

### 5. Depth Estimation (`features_depth.py`)

**Tools:** MiDaS (monocular depth estimation via PyTorch), Intel ISL

Generates per-pixel depth maps from single images to analyze foreground/background separation without stereo cameras.

| Feature | Type | Description |
|---|---|---|
| `depth_contrast` | float | Standard deviation of the normalized depth map. Higher values indicate stronger foreground/background separation. |
| `foreground_ratio` | float | Fraction of pixels closer than the median depth. Values above 0.5 indicate a dominant foreground subject. |
| `subject_depth_center` | dict | `{"x": float, "y": float}` — Center of mass of the closest 20% of pixels (top 80th percentile depth). Indicates where the main subject is positioned. |
| `depth_range` | float | Range of depth values (max − min, normalized). |

**Model:** MiDaS_small (loaded via `torch.hub`), run on CUDA if available, otherwise CPU. Input images are resized to 384px for inference, then the depth map is bilinearly interpolated back to the original resolution. Depth maps are optionally saved as Inferno-colormap PNGs to `outputs/depth_maps/`.

### 6. Title Analysis (`features_title.py`)

**Tools:** Python regex, curated keyword dictionaries

Parses video titles to detect linguistic patterns characteristic of MrBeast's titling style.

**Title cleaning pipeline:**
1. Strip file extensions (`.jpg`, `.png`, etc.)
2. Remove leading numeric prefixes (e.g., `001_`)
3. Strip channel name prefixes
4. Fix HTML entity artifacts (`39` → apostrophe)
5. Replace underscores with spaces in filename-derived titles

| Feature | Type | Description |
|---|---|---|
| `cleaned_title` | string | Title after cleaning pipeline. |
| `is_filename_derived` | bool | Whether the title appears to come from a filename rather than actual metadata. |
| `char_count` | int | Character length. MrBeast titles average ≤50 characters. |
| `word_count` | int | Word count. MrBeast titles average ≤8 words. |
| `has_number` | bool | Contains any numeric value. |
| `number_count` | int | Total count of numeric tokens. |
| `has_large_number` | bool | Contains a number ≥ 1,000 (handles comma-formatted numbers). |
| `has_money_reference` | bool | Detected via three signals: (1) explicit `$N` pattern, (2) money-related keywords (dollar, paid, bought, worth, etc.), (3) for filename-derived titles, large number + money-context words (win, gave, spent, etc.). |
| `first_person` | bool | Title starts with "I " or "I'" (case-sensitive). |
| `has_superlative` | bool | Contains superlative/extreme words from a 33-word dictionary (biggest, fastest, impossible, insane, epic, etc.). |
| `has_challenge_framing` | bool | Contains competition/challenge words from an 18-word dictionary (vs, survive, fight, challenge, eliminated, etc.). |
| `uppercase_ratio` | float (0–1) | Fraction of alphabetic characters that are uppercase. |
| `exclamation_count` | int | Number of exclamation marks. |
| `question_mark` | bool | Whether the title contains a question mark. |
| `avg_word_length` | float | Mean word length. MrBeast favors short, punchy words (≤5.0 average). |

---

## Scoring Systems

### 1. Binary Likeness Score (0–8 points)

A simple threshold-based score where each MrBeast-characteristic trait earns 1 point:

| Criterion | Threshold | MrBeast Avg | 2015 Avg |
|---|---|---|---|
| Brightness | ≥ 0.60 | 0.658 | 0.570 |
| Face count | ≥ 1 | 1.37 | 0.78 |
| Text area | ≤ 0.005 | Low text | High text |
| Smile score | ≥ 0.40 | 0.443 | 0.266 |
| Mouth open score | ≥ 0.15 | 0.175 | 0.105 |
| Body coverage | ≥ 0.30 | 0.413 | 0.237 |
| Brow raise score | ≥ 0.30 | 0.332 | 0.209 |
| Largest face area ratio | ≥ 0.06 | 0.087 | 0.058 |

### 2. Weighted Likeness Score (data-derived weights)

Same 8 criteria, but instead of +1 per trait, each adds a **data-derived weight** based on discriminative power. Weights are computed as:

```
weight[feature] = |mean_mrbeast − mean_panel| / std_panel
```

This measures how many standard deviations MrBeast's mean is from the panel mean. Higher weights indicate features where MrBeast is most distinctive.

**Derived weights (representative):**
- Smile score: 0.442
- Brightness: 0.441
- Brow raise: 0.270
- Body coverage: 0.182
- (Smile + brightness = 53% of total weight)

### 3. Continuous Similarity Score (0–100%)

A z-score-based similarity measure across 10 discriminative features:

1. `avg_brightness`, `avg_saturation`
2. `face_count`, `largest_face_area_ratio`
3. `smile_score`, `mouth_open_score`, `brow_raise_score`
4. `body_coverage`
5. `text_box_count`, `text_area_ratio`

**Algorithm:**
1. Compute the MrBeast centroid (mean and std per feature) from all MrBeast thumbnails
2. For each thumbnail, compute the absolute z-score per feature: `z = |value − μ_mrbeast| / σ_mrbeast`
3. Average z-scores across all valid features
4. Map to 0–100% via exponential decay: `similarity = 100 × exp(−avg_z / 2)`

### 4. Title Likeness Score (0–9 points)

Binary threshold scoring for title characteristics:

| Criterion | Threshold |
|---|---|
| Word count | ≤ 8 |
| Character count | ≤ 50 |
| Has number | true |
| Has large number | true |
| Has money reference | true |
| First person ("I...") | true |
| Has superlative | true |
| Has challenge framing | true |
| Avg word length | ≤ 5.0 |

### 5. Combined Likeness Score (0–17 points)

Sum of binary thumbnail likeness (0–8) and title likeness (0–9).

---

## Statistical Analysis

### Convergence Tests (`/stats/convergence-tests`)

Four tests validate whether the year-over-year increase in likeness scores is statistically significant:

#### Welch's t-test (Early vs. Late)
Compares mean likeness scores between early-period thumbnails (2015–2017) and late-period thumbnails (2024–2025) using Welch's t-test (unequal variance assumption).

#### Cohen's d (Effect Size)
Measures the practical significance of the early-vs-late difference:
- |d| ≥ 0.8: large
- |d| ≥ 0.5: medium
- |d| ≥ 0.2: small
- |d| < 0.2: negligible

#### One-way ANOVA
Tests whether mean likeness scores differ significantly across all year groups simultaneously (F-test).

#### Linear Regression (Score ~ Year)
Fits `likeness_score = slope × year + intercept` across all individual thumbnail scores.

**Key results:**
- Slope: **+0.105 likeness points per year**
- p-value: < 10⁻¹⁰
- R² = 0.5–1.7% (low — individual variation dominates, but the trend is real)
- Per-year 95% confidence intervals computed via t-distribution

### Feature-Level Comparisons (`/stats/compare`)

For each feature, computes per-group statistics (mean, median, std, min, max, count) to track how individual features evolve over time.

### Performance Correlations (`/stats/correlations`)

Computes Pearson correlations between each visual feature and target metrics (views, CTR), with p-values and significance testing. Features analyzed:
- `color.avg_saturation`, `color.avg_brightness`, `color.warm_cool_score`
- `text.text_area_ratio`, `text.text_box_count`
- `face.face_count`, `face.largest_face_area_ratio`
- `pose.hand_visible_count`
- `depth.depth_contrast`, `depth.foreground_ratio`

---

## Key Findings

### The MrBeast Formula vs. 2015 Baseline

| Feature | MrBeast | 2015 | Change |
|---|---|---|---|
| Face Count | 1.37 | 0.78 | +75.6% |
| Body Coverage | 0.413 | 0.237 | +74.3% |
| Smile Score | 0.443 | 0.266 | +66.9% |
| Mouth Open | 0.175 | 0.105 | +66.7% |
| Brow Raise | 0.332 | 0.209 | +58.7% |
| Largest Face Size | 0.087 | 0.058 | +50.5% |
| Brightness | 0.658 | 0.570 | +15.5% |

### Convergence Evidence

- **73% of panel channels** show positive convergence slope toward MrBeast's style
- **Average slope:** +0.127 likeness points per year (panel channels)
- **Regression is statistically significant** (p < 10⁻¹⁰)
- **Effect size:** Small to medium (Cohen's d)
- **Smile + brightness** account for 53% of discriminative weight

### Feature-Level Gap Closure (2015 → 2025 toward MrBeast)

The industry has closed significant portions of the 2015-to-MrBeast gap:
- Face count: nearly fully closed
- Smile score: +18.9 percentage points
- Brow raise: 59–87% gap closure
- Body coverage: significant increase
- Mouth open score: +66.7%

---

## Clustering Analysis

### Method

K-means clustering (k=3, 10 initializations, seed=42) is run across 12 normalized features:

**Clustering features:**
1. `color.avg_saturation`
2. `color.avg_brightness`
3. `color.warm_cool_score`
4. `text.text_area_ratio`
5. `text.text_box_count`
6. `face.face_count`
7. `face.largest_face_area_ratio`
8. `face.emotion_proxies.smile_score`
9. `face.emotion_proxies.mouth_open_score`
10. `face.emotion_proxies.brow_raise_score`
11. `pose.hand_visible_count`
12. `pose.body_coverage`

**Process:**
1. Build feature matrix from all processed thumbnails
2. Standardize features (StandardScaler)
3. Run K-means
4. Project to 2D via PCA for visualization
5. Store cluster assignments and PCA coordinates in the database

**Results:**
- PCA explains 43.2% of variance (2 components)
- Cluster 0 ("Modern"): 59% of MrBeast thumbnails
- Cluster 1 ("Classic"): 52% of 2015 thumbnails
- Centroid distance: 1.05 (PCA Euclidean)

---

## Channel-Level Evolution

### Channel Evolution Tracking (`/stats/channel-evolution`)

For each channel appearing in 2+ year groups, the system computes:
- Per-year mean likeness score (binary 0–8)
- Per-year mean title likeness score (0–9)
- Linear regression slope (likeness vs. year) as a convergence/divergence indicator
- Combined slope (thumbnail + title)

### Case Studies

**Danny Duncan** — Fastest converger
- 2015: 2.00 → 2025: 6.67 (exceeds MrBeast average)
- Slope: +0.551 points/year

**ZHC** — Highest peak
- 2017: 1.47 → 2024: 7.40 (highest single-year score of any panel channel)
- Slope: +0.434 points/year

**FaZe Rug** — Rapid late adoption
- Jumped from 3.1 to 6.6 in three years (2021–2024)
- Slope: +0.355 points/year

**Sidemen** — Steady climber
- 2016: 1.29 → 2025: 5.07 (94% of MrBeast average)
- Slope: +0.314 points/year

### Diffusion of Innovation Model

| Phase | Period | Description |
|---|---|---|
| **Innovators** | 2015–2017 | MrBeast pioneering the bright, face-forward, expressive formula |
| **Early Adopters** | 2018–2019 | David Dobrik, ZHC, Ryan Trahan begin experimenting |
| **Early Majority** | 2020–2022 | Broad panel adoption; inflection point in convergence data |
| **Late Majority** | 2023–2025 | Near-ubiquitous among entertainment channels |
| **Laggards/Resisters** | Ongoing | PewDiePie (stable), Markiplier (diverging), genre-locked channels |

---

## Title Analysis

Title convergence is slower and less complete than visual convergence:

- **Title likeness increased +14.6%** (vs. +27% for thumbnails)
- **First-person framing** reached parity: 25.4% (panel 2025) vs. 25.9% (MrBeast)
- **Money references** surged 5× (2.3% in 2015 → 11.8% in 2025)
- **Challenge framing** largely unadopted: 13.3% (panel) vs. 39.8% (MrBeast)
- **Numeric hooks** still far behind: 32.6% (panel) vs. 67.3% (MrBeast)

---

## API Reference

The backend exposes a comprehensive REST API at `http://localhost:8000` (Swagger docs at `/docs`).

### Thumbnail Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/thumbnails` | List thumbnails with filters (group, year, face count, text presence) and pagination |
| GET | `/thumbnails/{id}` | Get single thumbnail with all features |
| POST | `/thumbnails/ingest` | Trigger directory scan and ingestion |
| POST | `/thumbnails/pipeline/run` | Run feature extraction pipeline |
| GET | `/thumbnails/pipeline/status` | Get pipeline completion status |

### Statistics Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats/overview` | Dataset totals, group counts, coverage |
| GET | `/stats/distributions?feature=X` | Histogram and summary stats for any feature path |
| GET | `/stats/compare?feature=X` | Compare a feature across all year groups |
| GET | `/stats/correlations?target=views` | Pearson correlations of features vs. views/CTR |
| GET | `/stats/mrbeast-likeness` | Binary likeness scores per group (0–8) |
| GET | `/stats/title-likeness` | Title likeness scores per group (0–9) |
| GET | `/stats/combined-likeness` | Combined thumbnail + title scores (0–17) |
| GET | `/stats/weighted-likeness` | Data-derived weighted likeness scores |
| GET | `/stats/mrbeast-similarity` | Continuous z-score similarity (0–100%) |
| GET | `/stats/convergence-tests` | t-test, ANOVA, regression, Cohen's d |
| GET | `/stats/channel-evolution` | Per-channel per-year likeness trends and slopes |

Most stats endpoints support `?panel_only=true` to restrict analysis to the 22 panel channels + MrBeast.

### Clustering Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/clustering/run` | Run K-means clustering (configurable k, method, group filter) |
| GET | `/clustering/run?k=3` | GET convenience endpoint for clustering |
| GET | `/clustering/points` | Get 2D PCA-projected points for visualization |
| GET | `/clustering/summary` | Current clustering state summary |

---

## Setup & Reproduction

### Prerequisites

- Python 3.10+
- Tesseract OCR installed on system PATH
- CUDA-capable GPU recommended (for MiDaS depth estimation)

### Installation

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Dependencies

| Package | Purpose |
|---|---|
| FastAPI + Uvicorn | REST API server |
| SQLAlchemy | ORM and database |
| OpenCV (`opencv-python`) | Image processing, color analysis |
| NumPy | Array operations |
| Pillow | Image loading |
| scikit-learn | K-means clustering, PCA, StandardScaler |
| MediaPipe | Face detection, face landmarks, pose detection |
| PyTesseract | OCR text detection |
| PyTorch + TorchVision + timm | MiDaS depth estimation |
| google-api-python-client | YouTube Data API v3 |
| pydantic + pydantic-settings | Configuration management |
| watchdog | Filesystem monitoring |
| SciPy | Statistical tests (t-test, ANOVA, Pearson correlation) |

### Configuration

Copy `backend/.env.example` to `backend/.env` and set:

```env
YOUTUBE_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./thumbnail_analyzer.db
```

### Data Collection

```bash
# Check collection status
python scripts/collect_youtube.py status

# Collect panel channels (all years)
python scripts/collect_youtube.py panel

# Collect specific channels/years
python scripts/collect_youtube.py panel --channels "Sidemen" "ZHC" --years 2023 2024

# Expand MrBeast reference set
python scripts/collect_youtube.py mrbeast

# Collect supplementary channels (2024-2025)
python scripts/collect_youtube.py supplementary

# Validate completeness
python scripts/collect_youtube.py validate
```

### Running the Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On startup, the server automatically:
1. Initializes the database
2. Scans `data/thumbnails/` and ingests any new images
3. Runs the feature extraction pipeline on unprocessed thumbnails
4. Starts the filesystem watcher

### Generating the Presentation

```bash
# Requires backend API running
python scripts/generate_pptx.py
# Output: outputs/presentation.pptx (29 slides)
```

---

## Limitations

1. **No engagement data linkage** — Views and CTR are not systematically linked to all thumbnails
2. **Low R²** (0.5–1.7%) — Individual variation dominates; the convergence trend is real but explains a small fraction of total variance
3. **Cannot prove causation** — Algorithm incentives, editing tools, audience preferences, and cross-creator imitation are all plausible drivers
4. **Panel selection bias** — Heavily weighted toward English-language entertainment channels
5. **Single-person pose detection** — MVP uses single-pose detection; group thumbnails undercount people
6. **OCR limitations** — Tesseract performs poorly on stylized/warped text common in thumbnails
7. **Filename-derived titles** — Some titles are recovered from filenames rather than API metadata, introducing noise

---

## Academic Context

This project was prepared for submission to the **2026 HTCC Conference** and contributes to research on:
- Computational media analysis
- Platform-driven aesthetic convergence
- Algorithmic influence on creator behavior
- Diffusion of visual design patterns in online media

---

## References

A full reference list is included in the research proposal and final paper.

---

## Tools and Technologies

| Tool | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Core language |
| FastAPI | ≥0.104 | REST API framework |
| SQLAlchemy | ≥2.0 | ORM |
| OpenCV | ≥4.8 | Image processing |
| MediaPipe | ≥0.10 | Face and pose detection |
| PyTesseract | ≥0.3.10 | OCR |
| MiDaS (PyTorch) | ≥2.0 | Monocular depth estimation |
| scikit-learn | ≥1.3 | Clustering and PCA |
| SciPy | — | Statistical testing |
| YouTube Data API | v3 | Data collection |
| python-pptx | — | Presentation generation |
