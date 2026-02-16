# Thumbnail Convergence Analysis — Entertainment Panel

## Thesis

MrBeast's thumbnail style (high brightness, large faces, expressive emotions, bold colors, minimal text) has influenced the broader **entertainment** side of YouTube. This analysis tracks whether entertainment creators' thumbnails have converged toward MrBeast's visual signature over the period 2015–2025.

## Dataset Overview

**Panel restructured** from 38 mixed-category channels to **22 entertainment-focused channels** + MrBeast reference set. Removed 24 non-entertainment (tech, science, education, news, filmmaking, cooking, beauty, productivity, storytelling) and unusable channels whose divergence reflected genre differences rather than creative choices.

### Thumbnails on Disk (as of Feb 15, 2026)

| Group | Files on Disk | In DB | Notes |
|-------|--------------|-------|-------|
| MrBeast (ref) | 100 | 102 | Reference set across all eras (2015–2025) |
| 2015 | 512 | 434 | Panel + initial dataset channels |
| 2016 | 516 | 413 | |
| 2017 | 600 | 493 | |
| 2018 | 578 | 461 | |
| 2019 | 508 | 390 | |
| 2020 | 467 | 347 | |
| 2021 | 445 | 334 | |
| 2022 | 549 | 440 | |
| 2023 | 555 | 464 | |
| 2024 | 260 | 172 | Panel channels (API-collected) |
| 2025 | 279 | 196 | Panel channels (API-collected) |
| **Total** | **5,369** | **4,246** | **1,123 pending ingestion** |

### Database Pipeline Status

| Metric | Count |
|--------|-------|
| Total DB records | 4,246 |
| With features extracted | 4,246 (100%) |
| With cluster assignment | 2,700 (63.6%) |
| Pending ingestion (on disk, not in DB) | ~1,123 |

### Panel Channels (22)

**Original 14:** Dude Perfect, Smosh, Good Mythical Morning, Markiplier, PewDiePie, VanossGaming, David Dobrik, Sidemen, Unspeakable, Ryan Trahan, Airrack, ZHC, FaZe Rug, JiDion

**Added 8 (collected Feb 15):** Logan Paul, KSI, LazarBeam, IShowSpeed, Danny Duncan, Jelly, Cody Ko, Matt Stonie

### Per-Channel Collection Status

#### Fully collected (all applicable years via API)

| Channel | Active Since | Thumbnails | Years |
|---------|-------------|------------|-------|
| Danny Duncan | 2014 | 165 | 2015–2025 (11/11) |
| Jelly | 2014 | 165 | 2015–2025 (11/11) |
| LazarBeam | 2015 | 158 | 2015–2025 (11/11) |
| Matt Stonie | 2012 | 153 | 2015–2025 (11/11) |
| KSI | 2009 | 129 | 2015–2025 (11/11) |
| Cody Ko | 2014 | 130 | 2015–2024 (10/11, no 2025 content) |
| Logan Paul | 2015 | 120 | 2016–2025 (10/11, no 2015 content) |
| ZHC | 2016 | 118 | 2016–2025 (10/10) |
| IShowSpeed | 2016 | 117 | 2017–2025 (9/10, no 2016 content) |
| FaZe Rug | 2012 | 105 | 2015–2020, 2024–2025 (7/11, gap 2021–2023) |
| Airrack | 2015 | 100 | 2019–2025 (7/11, no content pre-2019) |

#### Partially collected (2024–2025 only, need 2015–2023 historical data)

| Channel | Active Since | Thumbnails | Years Missing |
|---------|-------------|------------|---------------|
| Dude Perfect | 2009 | 30 | 2015–2023 (9 years) |
| Smosh | 2005 | 30 | 2015–2023 (9 years) |
| Good Mythical Morning | 2012 | 30 | 2015–2023 (9 years) |
| Markiplier | 2012 | 30 | 2015–2023 (9 years) |
| PewDiePie | 2010 | 30 | 2015–2023 (9 years) |
| VanossGaming | 2011 | 30 | 2015–2023 (9 years) |
| Sidemen | 2013 | 30 | 2015–2023 (9 years) |
| Unspeakable | 2012 | 30 | 2015–2023 (9 years) |
| Ryan Trahan | 2013 | 30 | 2015–2023 (9 years) |
| David Dobrik | 2014 | 13 | 2015–2023 (9 years) |
| JiDion | 2018 | 9 | 2018–2023 (6 years) |

### Non-Panel Channels (supplementary data, 2024–2025 only)

20 additional channels collected for supplementary analysis. Not part of evolution panel.

MKBHD (30), Linus Tech Tips (30), Vsauce (30), Veritasium (30), Mark Rober (30), Corridor Crew (30), Kurzgesagt (30), Ali Abdaal (30), Aphmau (30), MrBallen (30), Philip DeFranco (30), Unbox Therapy (30), SSundee (30), Binging with Babish (30), The Slow Mo Guys (27), SmarterEveryDay (18), Casey Neistat (13), Typical Gamer (6), h3h3Productions (4), Jeffree Star (3)

### MrBeast Reference Set

- **On disk:** 100 thumbnails (pre-collected, no API metadata)
- **API era collection:** Not yet run
- **Defined eras:** early (2015–16, target 30), growth (2017–18, target 40), mainstream (2019–20, target 50), peak (2021–22, target 60), current (2023–25, target 70)
- **Total API target:** 250 thumbnails

---

## Key Findings

### 1. Likeness Scores Show a Clear 2024–2025 Convergence

Binary likeness scores (0–8 scale) across all 4,246 ingested thumbnails:

| Group | N | Mean | Median | ≥4 | ≥5 | ≥6 | ≥7 | 8/8 |
|-------|---|------|--------|-----|-----|-----|-----|-----|
| **MrBeast** | **102** | **6.13** | **7.0** | **87.3%** | **80.4%** | **75.5%** | **54.9%** | **27.5%** |
| 2015 | 434 | 3.69 | 3.0 | 47.7% | 39.6% | 29.5% | 18.0% | 4.1% |
| 2016 | 413 | 3.78 | 4.0 | 52.5% | 40.7% | 31.7% | 15.0% | 4.1% |
| 2017 | 493 | 3.82 | 4.0 | 52.5% | 41.4% | 31.8% | 16.8% | 4.9% |
| 2018 | 461 | 3.89 | 3.0 | 49.7% | 42.3% | 32.5% | 18.4% | 4.8% |
| 2019 | 390 | 3.78 | 3.0 | 48.5% | 38.5% | 31.8% | 19.7% | 5.9% |
| 2020 | 347 | 3.76 | 3.0 | 49.3% | 40.9% | 30.5% | 16.7% | 5.8% |
| 2021 | 334 | 3.83 | 4.0 | 50.6% | 44.3% | 35.0% | 17.7% | 5.1% |
| 2022 | 440 | 3.77 | 4.0 | 51.8% | 41.6% | 30.5% | 17.7% | 5.9% |
| 2023 | 464 | 3.17 | 3.0 | 40.7% | 33.6% | 20.9% | 9.7% | 3.0% |
| **2024** | **172** | **4.77** | **5.0** | **70.3%** | **58.7%** | **43.6%** | **26.2%** | **9.3%** |
| **2025** | **196** | **4.70** | **5.0** | **72.4%** | **59.2%** | **46.9%** | **25.0%** | **4.1%** |

**Key observation:** 2015–2022 fluctuate narrowly between 3.69–3.89 mean likeness. 2023 dips to 3.17 (lowest in dataset). Then 2024–2025 jump to **4.70–4.77** — a ~24% increase over the baseline and the highest scores ever recorded outside MrBeast himself. Nearly 59% of 2024–2025 thumbnails score ≥5, compared to ~40% in the 2015–2022 era.

### 2. Continuous Similarity Confirms the Step-Change

Z-score distance from MrBeast centroid (10 features, exponential decay to 0–100%):

| Group | Mean % | Median % | Std Dev |
|-------|--------|----------|---------|
| **MrBeast** | **72.4** | **75.3** | **9.9** |
| 2015 | 54.1 | 55.3 | 20.6 |
| 2016 | 54.6 | 56.5 | 19.4 |
| 2017 | 54.6 | 57.6 | 20.1 |
| 2018 | 55.4 | 57.3 | 19.1 |
| 2019 | 55.4 | 56.4 | 18.2 |
| 2020 | 54.7 | 56.7 | 19.9 |
| 2021 | 53.2 | 56.8 | 21.6 |
| 2022 | 55.1 | 56.7 | 17.2 |
| 2023 | 52.0 | 52.8 | 17.6 |
| **2024** | **60.8** | **64.3** | **16.5** |
| **2025** | **61.4** | **65.6** | **16.7** |

2024–2025 show a **6–8 percentage-point jump** over the 2015–2023 plateau (~53–55%). The standard deviation also narrows (16.5–16.7 vs. 17–21), suggesting the convergence is **uniform** — not driven by outliers, but by a broad shift across channels.

### 3. Feature-Level Trends

#### 3a. Core Visual Features (group means)

| Group | Brightness | Saturation | Face Count | Text Area | Largest Face Area |
|-------|-----------|-----------|-----------|-----------|-------------------|
| **MrBeast** | **0.658** | **0.405** | **1.37** | **0.0007** | **0.087** |
| 2015 | 0.569 | 0.379 | 0.81 | 0.0249 | 0.056 |
| 2016 | 0.563 | 0.386 | 0.89 | 0.0221 | 0.069 |
| 2017 | 0.569 | 0.366 | 0.92 | 0.0261 | 0.064 |
| 2018 | 0.589 | 0.394 | 1.00 | 0.0174 | 0.064 |
| 2019 | 0.595 | 0.381 | 0.83 | 0.0171 | 0.059 |
| 2020 | 0.587 | 0.413 | 0.84 | 0.0226 | 0.058 |
| 2021 | 0.570 | 0.419 | 0.88 | 0.0256 | 0.054 |
| 2022 | 0.510 | 0.397 | 0.88 | 0.0128 | 0.051 |
| 2023 | 0.446 | 0.371 | 0.81 | 0.0111 | 0.043 |
| **2024** | **0.594** | **0.445** | **1.20** | **0.0110** | **0.074** |
| **2025** | **0.564** | **0.438** | **1.15** | **0.0058** | **0.070** |

**Trends:**
- **Brightness**: Stable 0.56–0.59 through 2021, drops to 0.45 in 2023, recovers to 0.56–0.59 in 2024–2025. Still well below MrBeast's 0.66.
- **Saturation**: Gradual rise from 0.37 (2015) to 0.44 (2024–2025), now **exceeding** MrBeast's 0.41. Thumbnails are getting more colorful.
- **Face count**: Rose from 0.81 (2015) to 1.20 (2024), approaching MrBeast's 1.37. The strongest single-feature convergence.
- **Text area**: Dropped from 0.025 (2015) to 0.006 (2025) — a **76% reduction** — trending toward MrBeast's near-zero (0.0007).
- **Face size**: Rose from 0.056 (2015) to 0.074 (2024), closing the gap to MrBeast's 0.087. Faces are getting bigger.

#### 3b. Emotion & Pose Proxies (group means)

| Group | Smile | Mouth Open | Brow Raise | Body Coverage |
|-------|-------|-----------|-----------|--------------|
| **MrBeast** | **0.511** | **0.181** | **0.398** | **0.413** |
| 2015 | 0.280 | 0.107 | 0.219 | 0.246 |
| 2016 | 0.289 | 0.109 | 0.257 | 0.264 |
| 2017 | 0.291 | 0.123 | 0.239 | 0.256 |
| 2018 | 0.287 | 0.133 | 0.240 | 0.233 |
| 2019 | 0.275 | 0.131 | 0.226 | 0.240 |
| 2020 | 0.294 | 0.135 | 0.224 | 0.225 |
| 2021 | 0.292 | 0.135 | 0.231 | 0.252 |
| 2022 | 0.296 | 0.170 | 0.220 | 0.218 |
| 2023 | 0.238 | 0.108 | 0.173 | 0.191 |
| **2024** | **0.391** | **0.157** | **0.310** | **0.340** |
| **2025** | **0.397** | **0.158** | **0.301** | **0.356** |

This is where convergence is strongest. Between 2015 and 2025:
- **Smile scores** rose from 0.28 → 0.40 (+42%), closing 43% of the gap to MrBeast's 0.51
- **Brow raise** rose from 0.22 → 0.30 (+37%), closing 46% of the gap to MrBeast's 0.40
- **Body coverage** rose from 0.25 → 0.36 (+44%), closing 66% of the gap to MrBeast's 0.41
- **Mouth open** rose from 0.11 → 0.16 (+47%), closing 68% of the gap to MrBeast's 0.18

People in thumbnails are smiling bigger, raising eyebrows more, and showing more of their bodies — all hallmarks of the MrBeast style.

#### 3c. Text Disappearing from Thumbnails

| Group | Text Box Count | % with Any Text |
|-------|---------------|-----------------|
| **MrBeast** | **0.088** | **4.9%** |
| 2015 | 0.873 | 18.9% |
| 2016 | 0.734 | 20.6% |
| 2017 | 0.992 | 17.4% |
| 2018 | 1.095 | 18.7% |
| 2019 | 0.885 | 15.4% |
| 2020 | 1.000 | 20.8% |
| 2021 | 1.350 | 24.0% |
| 2022 | 0.730 | 14.3% |
| 2023 | 1.032 | 18.1% |
| 2024 | 0.459 | 13.4% |
| 2025 | 0.730 | 14.8% |

Text peaked in 2021 (1.35 boxes, 24% with text) then dropped sharply. 2024 hit a low of 0.46 text boxes and 13.4% text prevalence. MrBeast's near-zero text (only 4.9% of thumbnails) is the direction of travel.

#### 3d. Depth & Composition

| Group | Depth Range | Depth Contrast |
|-------|-----------|---------------|
| **MrBeast** | **0.977** | **0.286** |
| 2015 | 0.904 | 0.282 |
| 2022 | 0.927 | 0.285 |
| **2024** | **0.948** | **0.297** |
| **2025** | **0.958** | **0.298** |

Depth range (foreground/background separation) increased from 0.90 (2015) to 0.96 (2025), converging toward MrBeast's 0.98. This suggests creators are increasingly using shallow depth of field, isolated subjects, or graphic backgrounds that maximize the figure-ground contrast — another MrBeast signature.

### 4. Per-Criterion Threshold Pass Rates

| Criterion | MrBeast | 2015 | 2018 | 2021 | 2023 | 2024 | 2025 | Δ 2015→2025 |
|-----------|---------|------|------|------|------|------|------|-------------|
| Brightness ≥ 0.60 | 71.6% | 45.2% | 47.9% | 47.9% | 29.3% | **55.8%** | 43.4% | −1.8 pp |
| Face count ≥ 1 | 91.2% | 61.1% | 67.9% | 64.4% | 58.4% | **81.4%** | **80.1%** | **+19.0 pp** |
| Text area ≤ 0.005 | 99.0% | 83.4% | 83.9% | 77.2% | 85.1% | 87.2% | **89.8%** | **+6.4 pp** |
| Smile ≥ 0.40 | 87.3% | 49.5% | 49.7% | 52.1% | 42.0% | **66.9%** | **68.9%** | **+19.4 pp** |
| Mouth open ≥ 0.15 | 62.7% | 26.7% | 33.6% | 30.8% | 26.3% | **38.4%** | **40.3%** | **+13.6 pp** |
| Body coverage ≥ 0.30 | 62.7% | 32.3% | 30.4% | 35.6% | 20.0% | **44.2%** | **45.4%** | **+13.1 pp** |
| Brow raise ≥ 0.30 | 71.6% | 35.7% | 39.3% | 39.5% | 30.2% | **54.7%** | **51.5%** | **+15.8 pp** |
| Face area ≥ 0.06 | 66.7% | 34.8% | 36.0% | 35.0% | 26.1% | **48.3%** | **50.5%** | **+15.7 pp** |

**Strongest convergence (2015 → 2025):**
- Face count: +19.0 pp (61% → 80%)
- Smile score: +19.4 pp (50% → 69%)
- Brow raise: +15.8 pp (36% → 52%)
- Face area ratio: +15.7 pp (35% → 51%)
- Body coverage: +13.1 pp (32% → 45%)
- Mouth open: +13.6 pp (27% → 40%)

The convergence is broadest across **facial expression and body visibility** criteria — the most distinctive elements of MrBeast's style. Brightness is the one criterion that has *not* converged, possibly because creators use darker/moodier palettes as a stylistic differentiator.

### 5. The 2023 Anomaly

2023 is consistently the lowest-scoring year across nearly every metric:

| Metric | 2022 | 2023 | 2024 | Notes |
|--------|------|------|------|-------|
| Mean likeness | 3.77 | **3.17** | 4.77 | Lowest in dataset |
| Brightness | 0.510 | **0.446** | 0.594 | Lowest in dataset |
| Face area | 0.051 | **0.043** | 0.074 | Lowest in dataset |
| Smile score | 0.296 | **0.238** | 0.391 | Lowest in dataset |
| Body coverage | 0.218 | **0.191** | 0.340 | Lowest in dataset |
| Brow raise | 0.220 | **0.173** | 0.310 | Lowest in dataset |

Possible explanations:
- **Composition effect**: 2023 data comes primarily from the initial non-panel scrape and may include more non-entertainment channels. The 2024–2025 data is 100% panel-curated entertainment channels.
- **Channel mix**: 2023 has thumbnails from ~35–40 channels vs. 2024–2025's 13–14 focused channels. The broader mix includes channels with intentionally different aesthetics (gaming, commentary) that dilute the entertainment signal.
- **Survivorship bias**: The panel channels selected for 2024–2025 may be the ones most likely to adopt MrBeast's style — the selection criteria itself favors convergence.

This caveat is important for interpreting the 2024–2025 jump. The jump is real within the entertainment panel, but its magnitude may be inflated by the composition shift.

### 6. Channel Evolution — 23 Converging, 16 Diverging

Across all 39 channels with ≥4 years of data:

- **59% converging** (23/39), **41% diverging** (16/39)
- **Average slope: +0.056 points/year** (net positive convergence)

#### Top Convergers

| Channel | Years | Slope/yr | Start → End | Profile |
|---------|-------|----------|-------------|---------|
| **KSI** | 4 | **+1.260** | 3.0 → 7.0 | Most dramatic single transformation |
| **Disguised Toast** | 4 | +0.968 | 1.3 → 4.2 | Gaming → entertainment pivot |
| Yogscast | 4 | +0.514 | 2.3 → 3.1 | Moderate rise |
| **ZHC** | 10 | +0.434 | 4.0 → 4.5 | Steady over a decade |
| **FaZe Rug** | 11 | **+0.355** | 3.3 → 6.5 | Longest span, most reliable trend |
| **SSSniperWolf** | 8 | +0.325 | 4.6 → 6.9 | Near-MrBeast levels by end |
| Jenna Marbles | 4 | +0.304 | 3.3 → 4.3 | Pre-retirement convergence |
| **Sidemen** | 7 | +0.291 | 3.1 → 5.1 | Consistent climb |

#### Top Divergers

| Channel | Years | Slope/yr | Start → End | Profile |
|---------|-------|----------|-------------|---------|
| Niko Omilana | 4 | −0.607 | 4.8 → 3.4 | Moved toward prank/reaction style |
| Jacksfilms | 4 | −0.600 | 4.7 → 3.1 | Comedy → low-effort ironic thumbnails |
| Ali-A | 4 | −0.600 | 5.1 → 2.9 | Shifted to gaming-heavy aesthetic |
| Annoying Orange | 4 | −0.520 | 4.9 → 3.0 | Cartoon/animated style doesn't converge |
| EpicMealTime | 4 | −0.470 | 5.0 → 3.4 | Food-focused, genre-locked |
| Jake Paul | 4 | −0.427 | 3.3 → 1.3 | Boxing era, dark/dramatic thumbnails |

**Notable patterns:**
- **KSI** has the steepest convergence slope (+1.26). His transformation from 3.0 → 7.0 likeness represents a near-complete adoption of MrBeast's thumbnail formula.
- **FaZe Rug** is the best long-term case study: 11 years of data, steady climb from 3.3 → 6.5, demonstrating gradual organic convergence.
- **SSSniperWolf** reached near-MrBeast levels (6.9) by her final measured year, up from 4.6.
- Most divergers are either genre-locked (Annoying Orange, EpicMealTime) or intentionally counter-culture (Jacksfilms' ironic thumbnails, Jake Paul's boxing-era dark aesthetic).
- **PewDiePie** is essentially flat (~5.8), having started at high likeness and maintained it — not converging or diverging, just steady.

### 7. MrBeast Centroid (Reference Profile)

The target that other channels are converging toward:

| Feature | MrBeast Mean | MrBeast Std | Role |
|---------|-------------|-------------|------|
| avg_brightness | 0.658 | 0.093 | Bright, well-lit compositions |
| avg_saturation | 0.405 | 0.121 | Moderate, not oversaturated |
| face_count | 1.373 | 0.939 | Almost always at least one face |
| largest_face_area_ratio | 0.087 | 0.048 | Large, prominent faces |
| smile_score | 0.511 | 0.200 | Strong positive expressions |
| mouth_open_score | 0.181 | 0.164 | Exaggerated surprise/excitement |
| brow_raise_score | 0.398 | 0.204 | Expressive eyebrows |
| body_coverage | 0.413 | 0.306 | Significant body presence |
| text_box_count | 0.088 | 0.399 | Almost no text overlays |
| text_area_ratio | 0.001 | 0.007 | Near-zero text coverage |

The profile can be summarized as: **bright, face-forward, emotionally expressive, text-free thumbnails with clear foreground/background separation.**

---

## Assessment

### The Entertainment Convergence Hypothesis: Supported with Caveats

The data supports the thesis that entertainment YouTubers' thumbnails have converged toward MrBeast's visual signature, with the following nuances:

#### What the data shows

1. **Aggregate convergence is real but concentrated in 2024–2025.** The 2015–2022 period shows a slow, noisy plateau with mean likeness fluctuating between 3.69–3.89. The 2024–2025 jump to 4.70+ is a clear step-change — the sharpest increase in the dataset.

2. **Convergence is multi-dimensional.** It's not just one feature changing. Face count, face size, smile intensity, brow expressiveness, body coverage, and text reduction all move toward MrBeast's values simultaneously. This coordinated shift across 6+ features is difficult to attribute to coincidence.

3. **Facial expression criteria drive the convergence.** The largest gains are in smile score (+19 pp), face presence (+19 pp), brow raise (+16 pp), and face area (+16 pp). These are the most distinctive and intentional elements of MrBeast's style — suggesting deliberate mimicry rather than incidental overlap.

4. **59% of tracked channels are converging** (23/39 with ≥4 years). The average slope is net positive (+0.056/year). Several channels show dramatic transformations (KSI: 3.0→7.0, FaZe Rug: 3.3→6.5, SSSniperWolf: 4.6→6.9).

5. **Divergers have explanations.** Most diverging channels are genre-locked (animated content, food shows) or intentionally counter-culture. True resisters among entertainment channels are few.

#### What the data doesn't show

1. **Causation.** The convergence could reflect MrBeast's influence, or both MrBeast and other creators could be independently responding to the same YouTube algorithm pressures, audience preferences, or thumbnail design tools.

2. **Smooth trajectory.** The convergence is not gradual — it's a plateau (2015–2022) followed by a step-change (2024–2025). This pattern is more consistent with a tipping point or composition effect than steady diffusion.

3. **Brightness convergence.** Unlike every other feature, brightness has *not* converged. Creators may use darker/moodier palettes as a deliberate differentiator.

#### Methodological caveats

- **Composition effect is the biggest threat to validity.** 2015–2023 includes non-panel channels from an initial scrape; 2024–2025 is 100% panel-curated entertainment channels. The 2024–2025 jump may partly reflect cleaner, more homogeneous data. Isolating panel-only data for 2015–2023 would be the strongest test.
- **11 original panel channels missing historical data.** Dude Perfect, Smosh, GMM, Markiplier, PewDiePie, VanossGaming, Sidemen, Unspeakable, Ryan Trahan, David Dobrik, and JiDion only have 2024–2025 data. Completing their 2015–2023 timelines would dramatically strengthen the evolution analysis.
- **Binary scoring simplifies nuance.** The 0–8 score treats all criteria equally, but face presence likely matters more than text area for visual impact. Weighted scoring could provide sharper discrimination.
- **No engagement data.** We have no views or CTR data, so we cannot test whether convergence toward MrBeast's style correlates with performance — a key question for the influence hypothesis.
- **1,123 thumbnails pending ingestion.** The 8 new channels collected Feb 15 are on disk but not yet in the DB. Findings above reflect only 4,246 ingested records.

---

## Data Gaps & Next Steps

### Immediate (before next analysis)

1. **Ingest new thumbnails into DB** — 1,123 files on disk not yet in database
   ```bash
   cd backend && source .venv/bin/activate
   python scripts/ingest_dataset.py
   ```

2. **Run feature extraction** on newly ingested records
   ```bash
   python scripts/run_pipeline.py --status   # check what needs processing
   python scripts/run_pipeline.py             # extract all missing features
   ```

3. **Re-run clustering** with expanded dataset (currently only 2015–2021 + MrBeast have cluster assignments)
   ```bash
   curl -X POST http://localhost:8000/clustering/run
   ```

### Next collection session (requires API quota)

4. **Collect historical years for 11 remaining panel channels** — These only have 2024–2025 data. Need 2015–2023 for complete evolution analysis. This is the single most important data gap.
   ```bash
   python scripts/collect_youtube.py panel \
     --channels "Dude Perfect" "Smosh" "Good Mythical Morning" "Markiplier" \
     "PewDiePie" "VanossGaming" "Sidemen" "Unspeakable" "Ryan Trahan" \
     "David Dobrik" "JiDion" \
     --years 2015 2016 2017 2018 2019 2020 2021 2022 2023
   ```
   **Quota estimate:** ~99 search calls = ~9,999 quota units (1 full day). Script is resumable if quota runs out mid-run.

5. **Fill FaZe Rug gap (2021–2023)** — Currently missing 3 years mid-timeline
   ```bash
   python scripts/collect_youtube.py panel --channels "FaZe Rug" --years 2021 2022 2023
   ```
   **Quota estimate:** ~303 units.

6. **Collect MrBeast reference set via API** — Structured era-based collection with full metadata
   ```bash
   python scripts/collect_youtube.py mrbeast
   ```
   **Quota estimate:** ~1,010 units.

### Analysis phase (after all data collected)

7. **Re-run full pipeline** — Ingest → features → clustering on complete dataset (~6,500+ thumbnails expected)

8. **Panel-only reanalysis** — Filter 2015–2023 to panel channels only and recompute all findings tables. This is the key test to resolve the composition effect caveat.

9. **Statistical testing:**
   - Paired t-tests or Wilcoxon signed-rank on early vs. late similarity scores per channel
   - ANOVA across year groups for key features (brightness, face size, text ratio)
   - Effect sizes (Cohen's d) for 2015 vs. 2025 feature differences
   - Confidence intervals on year-over-year likeness differences
   - Regression: similarity score ~ year, controlling for channel fixed effects

10. **Weighted likeness score** — Develop an alternative to the binary 0–8 score that weights criteria by their discriminative power (e.g., face features weighted higher than text absence).

11. **Generate publication-ready visualizations:**
    - Heatmap of similarity scores (channels x years)
    - Aggregate trendline: mean panel similarity by year with confidence bands
    - Before/after thumbnail galleries for strongest convergers (KSI, FaZe Rug, SSSniperWolf)
    - Feature distribution shifts over time (violin or ridgeline plots)
    - Per-channel evolution timelines with slope annotations

### API Quota Budget (remaining work)

| Task | API Calls | Quota Units | Days |
|------|-----------|-------------|------|
| 11 channels x 9 years | ~99 search + video | ~9,999 | 1 |
| FaZe Rug gap (3 years) | 3 search + video | ~303 | <1 |
| MrBeast era collection | ~10 search + video | ~1,010 | <1 |
| **Total** | **~112** | **~11,312** | **~2 days** |
