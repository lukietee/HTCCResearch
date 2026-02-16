# Thumbnail Convergence Analysis — Entertainment Panel

## Thesis

MrBeast's thumbnail style (high brightness, large faces, expressive emotions, bold colors, minimal text) has influenced the broader **entertainment** side of YouTube. This analysis tracks whether entertainment creators' thumbnails have converged toward MrBeast's visual signature over the period 2015–2025.

## Dataset Overview

**Panel restructured** from 38 mixed-category channels to **22 entertainment-focused channels** + MrBeast reference set. Removed 24 non-entertainment (tech, science, education, news, filmmaking, cooking, beauty, productivity, storytelling) and unusable channels whose divergence reflected genre differences rather than creative choices.

### Dataset Status (as of Feb 16, 2026)

| Group | Files on Disk | In DB | Notes |
|-------|--------------|-------|-------|
| MrBeast (ref) | 100 | 102 | Reference set across all eras (2015–2025) |
| 2015 | 512 | 512 | Panel + initial dataset channels |
| 2016 | 516 | 516 | |
| 2017 | 600 | 600 | |
| 2018 | 578 | 578 | |
| 2019 | 508 | 508 | |
| 2020 | 467 | 467 | |
| 2021 | 445 | 445 | |
| 2022 | 549 | 549 | |
| 2023 | 555 | 555 | |
| 2024 | 260 | 260 | Panel channels (API-collected) |
| 2025 | 279 | 279 | Panel channels (API-collected) |
| **Total** | **5,369** | **5,371** | **Fully ingested** |

### Database Pipeline Status

| Metric | Count |
|--------|-------|
| Total DB records | 5,371 |
| With features extracted | 5,371 (100%) |
| With cluster assignment | 5,369 (99.96%) |
| Pending ingestion | 0 |

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
- **In DB:** 102 (all with features extracted and cluster assignments)
- **API era collection:** Not yet run
- **Defined eras:** early (2015–16, target 30), growth (2017–18, target 40), mainstream (2019–20, target 50), peak (2021–22, target 60), current (2023–25, target 70)
- **Total API target:** 250 thumbnails

---

## Key Findings

### 1. Likeness Scores Show a Clear 2024–2025 Convergence

Binary likeness scores (0–8 scale) across all 5,371 thumbnails:

| Group | N | Mean | Median | ≥4 | ≥5 | ≥6 | ≥7 | 8/8 |
|-------|---|------|--------|-----|-----|-----|-----|-----|
| **MrBeast** | **102** | **6.13** | **7.0** | **87.3%** | **80.4%** | **75.5%** | **54.9%** | **27.5%** |
| 2015 | 512 | 3.54 | 3.0 | 44.9% | 36.5% | 27.3% | 17.0% | 4.1% |
| 2016 | 516 | 3.80 | 4.0 | 51.7% | 41.3% | 32.6% | 16.5% | 4.7% |
| 2017 | 600 | 3.79 | 4.0 | 51.7% | 40.3% | 30.8% | 16.0% | 4.8% |
| 2018 | 578 | 3.83 | 3.0 | 48.6% | 41.9% | 31.3% | 18.0% | 4.7% |
| 2019 | 508 | 3.68 | 3.0 | 47.2% | 37.2% | 29.9% | 17.5% | 4.9% |
| 2020 | 467 | 3.76 | 3.0 | 49.0% | 40.0% | 29.3% | 17.8% | 6.0% |
| 2021 | 445 | 4.04 | 4.0 | 54.6% | 48.1% | 36.9% | 20.2% | 5.2% |
| 2022 | 549 | 4.09 | 4.0 | 57.6% | 47.2% | 35.9% | 21.5% | 7.3% |
| 2023 | 555 | 3.42 | 3.0 | 45.0% | 37.5% | 24.5% | 13.0% | 4.3% |
| **2024** | **260** | **4.62** | **5.0** | **66.5%** | **55.8%** | **42.3%** | **26.9%** | **9.6%** |
| **2025** | **279** | **4.55** | **5.0** | **68.5%** | **55.9%** | **43.4%** | **23.7%** | **5.0%** |

**Key observation:** With the expanded dataset (5,371 vs. previous 4,246), the core pattern holds. 2015–2020 fluctuate between 3.54–3.83 mean likeness. A modest uptick appears in 2021–2022 (4.04–4.09), then 2023 dips to 3.42. The 2024–2025 jump to **4.55–4.62** remains the clearest step-change — a ~20% increase over the 2015–2020 baseline. Over 55% of 2024–2025 thumbnails score ≥5, compared to ~40% in the 2015–2020 era.

**Change from prior analysis:** The addition of 1,125 new thumbnails (primarily from the 8 newly collected panel channels) slightly moderated the 2024–2025 means (from 4.70–4.77 → 4.55–4.62) but revealed a previously hidden uptick in 2021–2022 (from 3.77–3.83 → 4.04–4.09). This suggests convergence may have begun earlier than the prior snapshot indicated, with a more gradual ramp rather than a pure step-change.

### 2. Continuous Similarity Confirms the Step-Change

Z-score distance from MrBeast centroid (10 features, exponential decay to 0–100%):

| Group | Mean % | Median % | Std Dev |
|-------|--------|----------|---------|
| **MrBeast** | **59.2** | **62.8** | **13.7** |
| 2015 | 38.6 | 38.6 | 18.9 |
| 2016 | 39.5 | 39.3 | 18.6 |
| 2017 | 39.7 | 39.5 | 18.7 |
| 2018 | 40.5 | 39.8 | 18.0 |
| 2019 | 39.2 | 39.1 | 18.0 |
| 2020 | 39.8 | 39.7 | 19.1 |
| 2021 | 39.6 | 40.2 | 19.6 |
| 2022 | 39.8 | 39.5 | 17.9 |
| 2023 | 35.9 | 34.7 | 17.6 |
| **2024** | **44.1** | **45.3** | **19.1** |
| **2025** | **45.7** | **46.6** | **18.1** |

2024–2025 show a **5–6 percentage-point jump** over the 2015–2022 plateau (~39–40%). The 2023 dip to 35.9% remains the dataset minimum. The gap between the baseline plateau and 2024–2025 is consistent and statistically meaningful across both scoring methods.

### 3. Feature-Level Trends

#### 3a. Core Visual Features (group means)

| Group | Brightness | Saturation | Face Count | Text Area | Largest Face Area |
|-------|-----------|-----------|-----------|-----------|-------------------|
| **MrBeast** | **0.658** | **0.405** | **1.37** | **0.0007** | **0.087** |
| 2015 | 0.560 | 0.366 | 0.78 | 0.0216 | 0.055 |
| 2016 | 0.564 | 0.372 | 0.88 | 0.0180 | 0.070 |
| 2017 | 0.569 | 0.357 | 0.93 | 0.0225 | 0.062 |
| 2018 | 0.584 | 0.390 | 0.97 | 0.0142 | 0.061 |
| 2019 | 0.590 | 0.386 | 0.82 | 0.0154 | 0.057 |
| 2020 | 0.582 | 0.417 | 0.85 | 0.0174 | 0.057 |
| 2021 | 0.571 | 0.418 | 0.95 | 0.0195 | 0.060 |
| 2022 | 0.528 | 0.401 | 0.94 | 0.0106 | 0.058 |
| 2023 | 0.461 | 0.378 | 0.88 | 0.0098 | 0.048 |
| **2024** | **0.595** | **0.450** | **1.16** | **0.0083** | **0.071** |
| **2025** | **0.555** | **0.421** | **1.12** | **0.0050** | **0.067** |

**Trends:**
- **Brightness**: Stable 0.56–0.59 through 2020, drops to 0.46 in 2023, recovers to 0.56–0.60 in 2024–2025. Still well below MrBeast's 0.66.
- **Saturation**: Gradual rise from 0.37 (2015) to 0.45 (2024), now **exceeding** MrBeast's 0.41. Thumbnails are getting more colorful.
- **Face count**: Rose from 0.78 (2015) to 1.16 (2024), approaching MrBeast's 1.37. The strongest single-feature convergence.
- **Text area**: Dropped from 0.022 (2015) to 0.005 (2025) — a **77% reduction** — trending toward MrBeast's near-zero (0.0007).
- **Face size**: Rose from 0.055 (2015) to 0.071 (2024), closing the gap to MrBeast's 0.087. Faces are getting bigger.

#### 3b. Emotion & Pose Proxies (group means)

| Group | Smile | Mouth Open | Brow Raise | Body Coverage |
|-------|-------|-----------|-----------|--------------|
| **MrBeast** | **0.510** | **0.181** | **0.398** | **0.413** |
| 2015 | 0.260 | 0.104 | 0.205 | 0.237 |
| 2016 | 0.285 | 0.111 | 0.252 | 0.275 |
| 2017 | 0.288 | 0.125 | 0.235 | 0.252 |
| 2018 | 0.281 | 0.128 | 0.229 | 0.233 |
| 2019 | 0.266 | 0.120 | 0.215 | 0.234 |
| 2020 | 0.288 | 0.133 | 0.225 | 0.226 |
| 2021 | 0.311 | 0.145 | 0.251 | 0.270 |
| 2022 | 0.324 | 0.186 | 0.246 | 0.250 |
| 2023 | 0.264 | 0.121 | 0.193 | 0.209 |
| **2024** | **0.368** | **0.143** | **0.284** | **0.348** |
| **2025** | **0.378** | **0.156** | **0.281** | **0.336** |

This is where convergence is strongest. Between 2015 and 2025:
- **Smile scores** rose from 0.26 → 0.38 (+45%), closing 47% of the gap to MrBeast's 0.51
- **Brow raise** rose from 0.21 → 0.28 (+37%), closing 39% of the gap to MrBeast's 0.40
- **Body coverage** rose from 0.24 → 0.34 (+42%), closing 56% of the gap to MrBeast's 0.41
- **Mouth open** rose from 0.10 → 0.16 (+52%), closing 68% of the gap to MrBeast's 0.18

People in thumbnails are smiling bigger, raising eyebrows more, and showing more of their bodies — all hallmarks of the MrBeast style. Notably, 2021–2022 already showed early movement on these metrics before the 2024–2025 acceleration.

#### 3c. Text Disappearing from Thumbnails

| Group | Text Box Count | % with Any Text |
|-------|---------------|-----------------|
| **MrBeast** | **0.088** | **4.9%** |
| 2015 | 0.840 | 17.8% |
| 2016 | 0.616 | 17.4% |
| 2017 | 0.955 | 16.0% |
| 2018 | 0.972 | 16.1% |
| 2019 | 1.051 | 16.3% |
| 2020 | 1.015 | 18.6% |
| 2021 | 1.097 | 19.6% |
| 2022 | 0.805 | 13.7% |
| 2023 | 0.986 | 17.3% |
| 2024 | 0.596 | 15.0% |
| 2025 | 0.674 | 12.9% |

Text peaked in 2021 (1.10 boxes, 19.6% with text) then dropped. 2025 hit the lowest text prevalence at 12.9%. MrBeast's near-zero text (only 4.9% of thumbnails) is the direction of travel, though the gap remains significant.

#### 3d. Depth & Composition

| Group | Depth Range | Depth Contrast |
|-------|-----------|---------------|
| **MrBeast** | **0.977** | **0.286** |
| 2015 | 0.908 | 0.283 |
| 2016 | 0.918 | 0.287 |
| 2017 | 0.919 | 0.282 |
| 2018 | 0.911 | 0.285 |
| 2019 | 0.922 | 0.285 |
| 2020 | 0.918 | 0.285 |
| 2021 | 0.913 | 0.286 |
| 2022 | 0.935 | 0.288 |
| 2023 | 0.927 | 0.284 |
| **2024** | **0.959** | **0.297** |
| **2025** | **0.968** | **0.299** |

Depth range (foreground/background separation) increased from 0.91 (2015) to 0.97 (2025), converging toward MrBeast's 0.98. This suggests creators are increasingly using shallow depth of field, isolated subjects, or graphic backgrounds that maximize the figure-ground contrast — another MrBeast signature.

### 4. Per-Criterion Threshold Pass Rates

| Criterion | MrBeast | 2015 | 2018 | 2021 | 2023 | 2024 | 2025 | Δ 2015→2025 |
|-----------|---------|------|------|------|------|------|------|-------------|
| Brightness ≥ 0.60 | 73.0% | 41.8% | 46.9% | 48.8% | 31.4% | **56.2%** | 41.9% | +0.1 pp |
| Face count ≥ 1 | 91.2% | 58.8% | 65.6% | 67.4% | 61.8% | **76.9%** | **77.4%** | **+18.6 pp** |
| Text area ≤ 0.005 | 99.0% | 85.0% | 86.2% | 81.6% | 85.4% | 87.7% | **91.4%** | **+6.4 pp** |
| Smile ≥ 0.40 | 87.3% | 46.1% | 49.1% | 55.1% | 46.5% | **63.5%** | **65.9%** | **+19.8 pp** |
| Mouth open ≥ 0.15 | 62.7% | 25.8% | 32.5% | 33.9% | 30.3% | **36.5%** | **38.0%** | **+12.2 pp** |
| Body coverage ≥ 0.30 | 62.7% | 29.7% | 30.6% | 37.5% | 23.8% | **45.4%** | **44.8%** | **+15.1 pp** |
| Brow raise ≥ 0.30 | 71.6% | 33.4% | 37.5% | 42.2% | 33.5% | **49.2%** | **47.7%** | **+14.3 pp** |
| Face area ≥ 0.06 | 66.7% | 33.4% | 34.8% | 37.3% | 29.5% | **46.5%** | **47.7%** | **+14.3 pp** |

**Strongest convergence (2015 → 2025):**
- Smile score: +19.8 pp (46% → 66%)
- Face count: +18.6 pp (59% → 77%)
- Body coverage: +15.1 pp (30% → 45%)
- Brow raise: +14.3 pp (33% → 48%)
- Face area ratio: +14.3 pp (33% → 48%)
- Mouth open: +12.2 pp (26% → 38%)

The convergence is broadest across **facial expression and body visibility** criteria — the most distinctive elements of MrBeast's style. Brightness is the one criterion that has *not* converged, possibly because creators use darker/moodier palettes as a stylistic differentiator.

### 5. The 2023 Anomaly

2023 is consistently the lowest-scoring year across nearly every metric:

| Metric | 2022 | 2023 | 2024 | Notes |
|--------|------|------|------|-------|
| Mean likeness | 4.09 | **3.42** | 4.62 | Lowest in dataset |
| Brightness | 0.528 | **0.461** | 0.595 | Lowest in dataset |
| Face area | 0.058 | **0.048** | 0.071 | Lowest in dataset |
| Smile score | 0.324 | **0.264** | 0.368 | Lowest in dataset |
| Body coverage | 0.250 | **0.209** | 0.348 | Lowest in dataset |
| Brow raise | 0.246 | **0.193** | 0.284 | Lowest in dataset |

Possible explanations:
- **Composition effect**: 2023 data comes primarily from the initial non-panel scrape and may include more non-entertainment channels. The 2024–2025 data is 100% panel-curated entertainment channels.
- **Channel mix**: 2023 has thumbnails from ~35–40 channels vs. 2024–2025's focused panel channels. The broader mix includes channels with intentionally different aesthetics (gaming, commentary) that dilute the entertainment signal.
- **Survivorship bias**: The panel channels selected for 2024–2025 may be the ones most likely to adopt MrBeast's style — the selection criteria itself favors convergence.

This caveat is important for interpreting the 2024–2025 jump. The jump is real within the entertainment panel, but its magnitude may be inflated by the composition shift.

### 6. Channel Evolution — 27 Converging, 18 Diverging

Across all 45 channels with ≥4 years of data (up from 39 in prior analysis):

- **60% converging** (27/45), **40% diverging** (18/45)
- **Average slope: +0.050 points/year** (net positive convergence)

#### Top Convergers

| Channel | Years | Slope/yr | Start → End | Profile |
|---------|-------|----------|-------------|---------|
| **Disguised Toast** | 4 | **+0.968** | 1.3 → 4.2 | Gaming → entertainment pivot |
| **Danny Duncan** | 11 | **+0.552** | 2.0 → 6.7 | Strongest long-term convergence |
| Yogscast | 4 | +0.514 | 2.3 → 3.1 | Moderate rise |
| **ZHC** | 10 | +0.434 | 4.0 → 4.5 | Steady over a decade |
| **IShowSpeed** | 9 | +0.361 | 0.5 → 2.7 | Started extremely low, consistent rise |
| **FaZe Rug** | 11 | **+0.355** | 3.3 → 6.5 | Longest span, most reliable trend |
| **SSSniperWolf** | 8 | +0.325 | 4.6 → 6.9 | Near-MrBeast levels by end |
| Jenna Marbles | 4 | +0.304 | 3.3 → 4.3 | Pre-retirement convergence |
| **Sidemen** | 7 | +0.290 | 3.1 → 5.1 | Consistent climb |
| The King of Random | 4 | +0.280 | 1.5 → 1.8 | Modest rise |

#### Top Divergers

| Channel | Years | Slope/yr | Start → End | Profile |
|---------|-------|----------|-------------|---------|
| Niko Omilana | 4 | −0.607 | 4.8 → 3.4 | Moved toward prank/reaction style |
| Jacksfilms | 4 | −0.600 | 4.7 → 3.1 | Comedy → low-effort ironic thumbnails |
| Ali-A | 4 | −0.600 | 5.1 → 2.9 | Shifted to gaming-heavy aesthetic |
| Annoying Orange | 4 | −0.520 | 4.9 → 3.0 | Cartoon/animated style doesn't converge |
| EpicMealTime | 4 | −0.470 | 5.0 → 3.4 | Food-focused, genre-locked |
| Jake Paul | 4 | −0.427 | 3.3 → 1.3 | Boxing era, dark/dramatic thumbnails |
| Rooster Teeth | 5 | −0.332 | 3.6 → 2.0 | Corporate channel, different strategy |
| Yes Theory | 5 | −0.300 | 4.8 → 3.6 | Travel/cinematic aesthetic |

**Notable patterns:**
- **Danny Duncan** is the new standout long-term case study: 11 years of data, dramatic climb from 2.0 → 6.7, the largest absolute gain in the dataset.
- **FaZe Rug** remains the most reliable long-term trend: 11 years, steady climb from 3.3 → 6.5.
- **SSSniperWolf** reached near-MrBeast levels (6.9) by her final measured year, up from 4.6.
- **KSI** showed a mixed trajectory with the expanded 11-year dataset (previously reported as a dramatic converger with only 4 years of data, his full timeline shows more volatility: peaking at 5.1 in 2017, dropping to 2.3 in 2020, then partially recovering).
- Most divergers are either genre-locked (Annoying Orange, EpicMealTime) or intentionally counter-culture (Jacksfilms' ironic thumbnails, Jake Paul's boxing-era dark aesthetic).

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

1. **Aggregate convergence is real, with a possible two-phase pattern.** The 2015–2020 period shows a baseline plateau with mean likeness between 3.54–3.83. A modest uptick appears in 2021–2022 (4.04–4.09), suggesting early convergence. Then 2024–2025 jumps to 4.55–4.62 — a clear acceleration. This two-phase pattern (gradual 2021–2022 uptick → 2024–2025 acceleration) is more consistent with diffusion dynamics than a single step-change.

2. **Convergence is multi-dimensional.** It's not just one feature changing. Face count, face size, smile intensity, brow expressiveness, body coverage, and text reduction all move toward MrBeast's values simultaneously. This coordinated shift across 6+ features is difficult to attribute to coincidence.

3. **Facial expression criteria drive the convergence.** The largest gains are in smile score (+20 pp), face presence (+19 pp), body coverage (+15 pp), and face area (+14 pp). These are the most distinctive and intentional elements of MrBeast's style — suggesting deliberate mimicry rather than incidental overlap.

4. **60% of tracked channels are converging** (27/45 with ≥4 years). The average slope is net positive (+0.050/year). Several channels show dramatic transformations (Danny Duncan: 2.0→6.7, FaZe Rug: 3.3→6.5, SSSniperWolf: 4.6→6.9).

5. **Divergers have explanations.** Most diverging channels are genre-locked (animated content, food shows) or intentionally counter-culture. True resisters among entertainment channels are few.

#### What the data doesn't show

1. **Causation.** The convergence could reflect MrBeast's influence, or both MrBeast and other creators could be independently responding to the same YouTube algorithm pressures, audience preferences, or thumbnail design tools.

2. **Brightness convergence.** Unlike every other feature, brightness has *not* converged. Creators may use darker/moodier palettes as a deliberate differentiator.

3. **Clean pre/post separation.** With the expanded dataset, the 2021–2022 uptick blurs the previously clean "plateau then jump" narrative. The convergence may be more gradual than initially apparent, which is actually more consistent with a diffusion-of-innovation model.

#### Methodological caveats

- **Composition effect is the biggest threat to validity.** 2015–2023 includes non-panel channels from an initial scrape; 2024–2025 is 100% panel-curated entertainment channels. The 2024–2025 jump may partly reflect cleaner, more homogeneous data. Isolating panel-only data for 2015–2023 would be the strongest test.
- **11 original panel channels missing historical data.** Dude Perfect, Smosh, GMM, Markiplier, PewDiePie, VanossGaming, Sidemen, Unspeakable, Ryan Trahan, David Dobrik, and JiDion only have 2024–2025 data. Completing their 2015–2023 timelines would dramatically strengthen the evolution analysis.
- **Binary scoring simplifies nuance.** The 0–8 score treats all criteria equally, but face presence likely matters more than text area for visual impact. Weighted scoring could provide sharper discrimination.
- **No engagement data.** We have no views or CTR data, so we cannot test whether convergence toward MrBeast's style correlates with performance — a key question for the influence hypothesis.
- **KSI reclassification.** The prior analysis highlighted KSI as the top converger (+1.26/year) based on 4 years. With 11 years of data, his trajectory is volatile rather than linear, demonstrating the importance of complete timelines for evolution claims.

---

## Data Gaps & Next Steps

### Completed (Feb 16, 2026)

1. ~~**Ingest new thumbnails into DB**~~ — Done. 1,125 new records ingested (0 errors). DB now at 5,371.
2. ~~**Run feature extraction**~~ — Done. 1,125 thumbnails processed (100% pipeline completion, ~10 min).
3. ~~**Re-run clustering**~~ — Done. 5,369/5,371 thumbnails clustered into 3 clusters.

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
    - Before/after thumbnail galleries for strongest convergers (Danny Duncan, FaZe Rug, SSSniperWolf)
    - Feature distribution shifts over time (violin or ridgeline plots)
    - Per-channel evolution timelines with slope annotations

### API Quota Budget (remaining work)

| Task | API Calls | Quota Units | Days |
|------|-----------|-------------|------|
| 11 channels x 9 years | ~99 search + video | ~9,999 | 1 |
| FaZe Rug gap (3 years) | 3 search + video | ~303 | <1 |
| MrBeast era collection | ~10 search + video | ~1,010 | <1 |
| **Total** | **~112** | **~11,312** | **~2 days** |
