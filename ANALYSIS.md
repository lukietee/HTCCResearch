# Thumbnail Convergence Analysis — Entertainment Panel

## Thesis

MrBeast's thumbnail style (high brightness, large faces, expressive emotions, bold colors, minimal text) has influenced the broader **entertainment** side of YouTube. This analysis tracks whether entertainment creators' thumbnails have converged toward MrBeast's visual signature over the period 2015–2025.

## Dataset Overview

**Panel restructured** from 38 mixed-category channels to **22 entertainment-focused channels** + MrBeast reference set. Removed 24 non-entertainment (tech, science, education, news, filmmaking, cooking, beauty, productivity, storytelling) and unusable channels whose divergence reflected genre differences rather than creative choices.

### Dataset Status (as of Feb 16, 2026)

| Group | Files on Disk | In DB | Notes |
|-------|--------------|-------|-------|
| MrBeast (ref) | 100 | 102 | Reference set across all eras (2015–2025) |
| 2015 | 607 | 607 | Panel + initial dataset channels |
| 2016 | 612 | 612 | |
| 2017 | 722 | 722 | |
| 2018 | 712 | 712 | |
| 2019 | 660 | 660 | |
| 2020 | 614 | 614 | |
| 2021 | 598 | 598 | |
| 2022 | 689 | 689 | |
| 2023 | 691 | 691 | |
| 2024 | 260 | 260 | Panel channels (API-collected) |
| 2025 | 279 | 279 | Panel channels (API-collected) |
| **Total** | **6,544** | **6,546** | **Fully ingested** |

### Database Pipeline Status

| Metric | Count |
|--------|-------|
| Total DB records | 6,546 |
| With features extracted | 6,546 (100%) |
| With cluster assignment | 6,544 (99.97%) |
| Pending ingestion | 0 |

### Panel Channels (22)

**Original 14:** Dude Perfect, Smosh, Good Mythical Morning, Markiplier, PewDiePie, VanossGaming, David Dobrik, Sidemen, Unspeakable, Ryan Trahan, Airrack, ZHC, FaZe Rug, JiDion

**Added 8 (collected Feb 15):** Logan Paul, KSI, LazarBeam, IShowSpeed, Danny Duncan, Jelly, Cody Ko, Matt Stonie

### Per-Channel Collection Status

All 22 panel channels now have historical data (2015–2023 collected via YouTube API on Feb 16).

| Channel | Active Since | Thumbnails | Years Covered | Notes |
|---------|-------------|------------|---------------|-------|
| Markiplier | 2012 | 245 | 2015–2025 (11/11) | |
| Dude Perfect | 2009 | 242 | 2015–2025 (11/11) | |
| PewDiePie | 2010 | 236 | 2015–2025 (11/11) | |
| VanossGaming | 2011 | 214 | 2015–2025 (11/11) | |
| Ryan Trahan | 2013 | 213 | 2015–2025 (11/11) | Sparse 2015 (n=1) |
| Smosh | 2005 | 209 | 2015–2025 (11/11) | |
| Good Mythical Morning | 2012 | 205 | 2015–2025 (11/11) | |
| Unspeakable | 2012 | 202 | 2017–2025 (9/11) | No content pre-2017 |
| FaZe Rug | 2012 | 200 | 2015–2025 (11/11) | Gap filled with scraped data |
| Sidemen | 2013 | 179 | 2016–2025 (10/11) | No 2015 content |
| Logan Paul | 2015 | 169 | 2016–2025 (10/11) | No 2015 content |
| Jelly | 2014 | 165 | 2015–2025 (11/11) | |
| Danny Duncan | 2014 | 165 | 2015–2025 (11/11) | |
| KSI | 2009 | 160 | 2015–2025 (11/11) | |
| David Dobrik | 2014 | 160 | 2015–2022, 2025 (9/11) | No 2023–2024 content found |
| Matt Stonie | 2012 | 153 | 2015–2025 (11/11) | |
| LazarBeam | 2015 | 153 | 2015–2025 (11/11) | |
| ZHC | 2016 | 148 | 2016–2025 (10/10) | |
| IShowSpeed | 2016 | 147 | 2017–2025 (9/10) | No 2016 content |
| Cody Ko | 2014 | 130 | 2015–2024 (10/11) | No 2025 content |
| Airrack | 2015 | 120 | 2019–2025 (7/11) | No content pre-2019 |
| JiDion | 2018 | 27 | 2019, 2021–2025 (6/8) | Sparse early years |

### Non-Panel Channels (supplementary data, from initial scrape)

~93 additional channels in the dataset from the initial 2015–2023 web scrape. Not part of the evolution panel but contribute to year-group aggregate statistics.

### MrBeast Reference Set

- **On disk:** 100 thumbnails (pre-collected, no API metadata)
- **In DB:** 102 (all with features extracted and cluster assignments)
- **API era collection:** Not yet run
- **Defined eras:** early (2015–16, target 30), growth (2017–18, target 40), mainstream (2019–20, target 50), peak (2021–22, target 60), current (2023–25, target 70)
- **Total API target:** 250 thumbnails

---

## Key Findings

### 1. Likeness Scores Show a Clear 2024–2025 Convergence

Binary likeness scores (0–8 scale) across all 6,546 thumbnails:

| Group | N | Mean | Median | ≥4 | ≥5 | ≥6 | ≥7 | 8/8 |
|-------|---|------|--------|-----|-----|-----|-----|-----|
| **MrBeast** | **102** | **6.13** | **7.0** | **87.3%** | **80.4%** | **75.5%** | **54.9%** | **27.5%** |
| 2015 | 607 | 3.59 | 3.0 | 45.5% | 37.1% | 27.8% | 17.0% | 4.6% |
| 2016 | 612 | 3.76 | 4.0 | 50.7% | 40.0% | 31.5% | 15.8% | 4.2% |
| 2017 | 722 | 3.80 | 4.0 | 52.2% | 41.0% | 31.0% | 15.9% | 4.4% |
| 2018 | 712 | 3.88 | 3.0 | 49.7% | 42.6% | 32.4% | 18.0% | 4.5% |
| 2019 | 660 | 3.85 | 4.0 | 50.9% | 40.6% | 33.0% | 19.4% | 4.5% |
| 2020 | 614 | 3.85 | 4.0 | 50.8% | 42.2% | 30.8% | 18.1% | 5.5% |
| 2021 | 598 | 4.11 | 4.0 | 55.9% | 49.0% | 38.0% | 20.2% | 5.7% |
| 2022 | 689 | 4.12 | 4.0 | 57.0% | 47.6% | 37.0% | 21.9% | 7.4% |
| 2023 | 691 | 3.64 | 3.0 | 48.8% | 40.8% | 28.7% | 15.2% | 5.2% |
| **2024** | **260** | **4.62** | **5.0** | **66.5%** | **55.8%** | **42.3%** | **26.9%** | **9.6%** |
| **2025** | **279** | **4.55** | **5.0** | **68.5%** | **55.9%** | **43.4%** | **23.7%** | **5.0%** |

**Key observation:** With the expanded dataset (6,546 vs. previous 5,371), the core pattern holds. 2015–2020 fluctuate between 3.59–3.88 mean likeness. A modest uptick appears in 2021–2022 (4.11–4.12), followed by a 2023 dip to 3.64. The 2024–2025 jump to **4.55–4.62** remains the clearest step-change — a ~20% increase over the 2015–2020 baseline. Over 55% of 2024–2025 thumbnails score ≥5, compared to ~40% in the 2015–2020 era.

**Change from prior analysis:** Adding 1,175 historical thumbnails for 11 panel channels strengthened the 2015–2023 year groups (e.g., 2017 grew from 600 → 722, 2019 from 508 → 660). The 2023 anomaly is slightly less severe (3.64 vs. prior 3.42) as panel channel historical data diluted the composition effect. The 2021–2022 uptick (4.11–4.12) remains robust, confirming the two-phase convergence pattern: gradual 2021–2022 ramp → 2024–2025 acceleration.

### 2. Continuous Similarity Confirms the Step-Change

Z-score distance from MrBeast centroid (10 features, exponential decay to 0–100%):

| Group | Mean % | Median % | Std Dev |
|-------|--------|----------|---------|
| **MrBeast** | **79.0** | **81.3** | **8.0** |
| 2015 | 67.1 | 64.9 | 10.4 |
| 2016 | 68.0 | 66.9 | 10.3 |
| 2017 | 67.7 | 67.5 | 10.5 |
| 2018 | 68.4 | 67.4 | 9.8 |
| 2019 | 67.7 | 66.2 | 10.0 |
| 2020 | 68.5 | 68.6 | 10.7 |
| 2021 | 68.7 | 68.9 | 10.8 |
| 2022 | 68.7 | 68.3 | 9.9 |
| 2023 | 67.2 | 66.1 | 10.2 |
| **2024** | **71.5** | **72.3** | **9.6** |
| **2025** | **71.9** | **74.0** | **9.9** |

2024–2025 show a **3–4 percentage-point jump** over the 2015–2022 plateau (~67–69%). The 2023 dip to 67.2% is the dataset minimum among non-2015 years. The gap between the baseline plateau and 2024–2025 is consistent across both scoring methods, though the continuous measure shows a tighter spread than the binary score.

### 3. Feature-Level Trends

#### 3a. Core Visual Features (group means)

| Group | Brightness | Saturation | Face Count | Text Area | Largest Face Area |
|-------|-----------|-----------|-----------|-----------|-------------------|
| **MrBeast** | **0.658** | **0.405** | **1.37** | **0.0007** | **0.087** |
| 2015 | 0.554 | 0.380 | 0.78 | 0.0191 | 0.056 |
| 2016 | 0.560 | 0.377 | 0.87 | 0.0166 | 0.068 |
| 2017 | 0.564 | 0.360 | 0.94 | 0.0220 | 0.065 |
| 2018 | 0.580 | 0.395 | 0.99 | 0.0133 | 0.064 |
| 2019 | 0.589 | 0.396 | 0.86 | 0.0144 | 0.063 |
| 2020 | 0.581 | 0.425 | 0.90 | 0.0152 | 0.062 |
| 2021 | 0.577 | 0.429 | 0.98 | 0.0177 | 0.065 |
| 2022 | 0.541 | 0.412 | 0.94 | 0.0106 | 0.061 |
| 2023 | 0.485 | 0.392 | 0.91 | 0.0090 | 0.055 |
| **2024** | **0.595** | **0.450** | **1.16** | **0.0083** | **0.071** |
| **2025** | **0.555** | **0.422** | **1.12** | **0.0050** | **0.067** |

**Trends:**
- **Brightness**: Stable 0.55–0.59 through 2020, drops to 0.49 in 2023, recovers to 0.56–0.60 in 2024–2025. Still well below MrBeast's 0.66.
- **Saturation**: Gradual rise from 0.38 (2015) to 0.45 (2024), now **exceeding** MrBeast's 0.41. Thumbnails are getting more colorful.
- **Face count**: Rose from 0.78 (2015) to 1.16 (2024), approaching MrBeast's 1.37. The strongest single-feature convergence.
- **Text area**: Dropped from 0.019 (2015) to 0.005 (2025) — a **74% reduction** — trending toward MrBeast's near-zero (0.0007).
- **Face size**: Rose from 0.056 (2015) to 0.071 (2024), closing the gap to MrBeast's 0.087. Faces are getting bigger.

#### 3b. Emotion & Pose Proxies (group means)

| Group | Smile | Mouth Open | Brow Raise | Body Coverage |
|-------|-------|-----------|-----------|--------------|
| **MrBeast** | **0.511** | **0.181** | **0.398** | **0.413** |
| 2015 | 0.266 | 0.105 | 0.209 | 0.246 |
| 2016 | 0.279 | 0.108 | 0.245 | 0.270 |
| 2017 | 0.287 | 0.120 | 0.237 | 0.253 |
| 2018 | 0.286 | 0.134 | 0.236 | 0.245 |
| 2019 | 0.281 | 0.133 | 0.233 | 0.251 |
| 2020 | 0.300 | 0.137 | 0.235 | 0.233 |
| 2021 | 0.314 | 0.144 | 0.252 | 0.280 |
| 2022 | 0.323 | 0.175 | 0.251 | 0.252 |
| 2023 | 0.279 | 0.127 | 0.215 | 0.235 |
| **2024** | **0.368** | **0.143** | **0.284** | **0.348** |
| **2025** | **0.378** | **0.156** | **0.281** | **0.337** |

This is where convergence is strongest. Between 2015 and 2025:
- **Smile scores** rose from 0.27 → 0.38 (+42%), closing 46% of the gap to MrBeast's 0.51
- **Brow raise** rose from 0.21 → 0.28 (+34%), closing 38% of the gap to MrBeast's 0.40
- **Body coverage** rose from 0.25 → 0.34 (+37%), closing 54% of the gap to MrBeast's 0.41
- **Mouth open** rose from 0.11 → 0.16 (+49%), closing 67% of the gap to MrBeast's 0.18

People in thumbnails are smiling bigger, raising eyebrows more, and showing more of their bodies — all hallmarks of the MrBeast style. Notably, 2021–2022 already showed early movement on these metrics before the 2024–2025 acceleration.

#### 3c. Text Disappearing from Thumbnails

| Group | Text Box Count | % with Any Text |
|-------|---------------|-----------------|
| **MrBeast** | **0.088** | **4.9%** |
| 2015 | 0.756 | 16.1% |
| 2016 | 0.600 | 16.2% |
| 2017 | 0.902 | 15.2% |
| 2018 | 0.879 | 15.7% |
| 2019 | 0.961 | 15.2% |
| 2020 | 0.959 | 17.9% |
| 2021 | 1.067 | 19.4% |
| 2022 | 0.803 | 14.4% |
| 2023 | 0.896 | 16.1% |
| 2024 | 0.596 | 15.0% |
| 2025 | 0.674 | 12.9% |

Text peaked in 2021 (1.07 boxes, 19.4% with text) then dropped. 2025 hit the lowest text prevalence at 12.9%. MrBeast's near-zero text (only 4.9% of thumbnails) is the direction of travel, though the gap remains significant.

#### 3d. Depth & Composition

| Group | Depth Range | Depth Contrast |
|-------|-----------|---------------|
| **MrBeast** | **0.977** | **0.286** |
| 2015 | 0.906 | 0.284 |
| 2016 | 0.920 | 0.286 |
| 2017 | 0.920 | 0.282 |
| 2018 | 0.910 | 0.286 |
| 2019 | 0.920 | 0.286 |
| 2020 | 0.914 | 0.287 |
| 2021 | 0.913 | 0.287 |
| 2022 | 0.933 | 0.288 |
| 2023 | 0.926 | 0.285 |
| **2024** | **0.959** | **0.297** |
| **2025** | **0.968** | **0.299** |

Depth range (foreground/background separation) increased from 0.91 (2015) to 0.97 (2025), converging toward MrBeast's 0.98. This suggests creators are increasingly using shallow depth of field, isolated subjects, or graphic backgrounds that maximize the figure-ground contrast — another MrBeast signature.

### 4. Per-Criterion Threshold Pass Rates

| Criterion | MrBeast | 2015 | 2018 | 2021 | 2023 | 2024 | 2025 | Δ 2015→2025 |
|-----------|---------|------|------|------|------|------|------|-------------|
| Brightness ≥ 0.60 | 73.0% | 41.0% | 45.4% | 49.3% | 35.3% | **56.2%** | 41.9% | +0.9 pp |
| Face count ≥ 1 | 91.2% | 60.0% | 67.0% | 68.7% | 64.5% | **76.9%** | **77.4%** | **+17.4 pp** |
| Text area ≤ 0.005 | 99.0% | 86.3% | 86.2% | 82.1% | 86.4% | 87.7% | **91.4%** | **+5.1 pp** |
| Smile ≥ 0.40 | 87.3% | 47.0% | 50.3% | 55.5% | 48.5% | **63.5%** | **65.9%** | **+18.9 pp** |
| Mouth open ≥ 0.15 | 62.7% | 25.9% | 33.6% | 33.3% | 31.0% | **36.5%** | **38.0%** | **+12.1 pp** |
| Body coverage ≥ 0.30 | 62.7% | 30.5% | 31.7% | 38.8% | 28.1% | **45.4%** | **44.8%** | **+14.3 pp** |
| Brow raise ≥ 0.30 | 71.6% | 33.6% | 38.1% | 43.3% | 36.9% | **49.2%** | **47.7%** | **+14.1 pp** |
| Face area ≥ 0.06 | 66.7% | 34.4% | 36.0% | 40.0% | 33.6% | **46.5%** | **47.7%** | **+13.3 pp** |

**Strongest convergence (2015 → 2025):**
- Smile score: +18.9 pp (47% → 66%)
- Face count: +17.4 pp (60% → 77%)
- Body coverage: +14.3 pp (31% → 45%)
- Brow raise: +14.1 pp (34% → 48%)
- Face area ratio: +13.3 pp (34% → 48%)
- Mouth open: +12.1 pp (26% → 38%)

The convergence is broadest across **facial expression and body visibility** criteria — the most distinctive elements of MrBeast's style. Brightness is the one criterion that has *not* converged, possibly because creators use darker/moodier palettes as a stylistic differentiator.

### 5. The 2023 Anomaly (Partially Resolved)

2023 remains the lowest-scoring year across most metrics, but the effect is now less severe:

| Metric | 2022 | 2023 | 2024 | Prior 2023 | Change |
|--------|------|------|------|------------|--------|
| Mean likeness | 4.12 | **3.64** | 4.62 | 3.42 | +0.22 |
| Brightness | 0.541 | **0.485** | 0.595 | 0.461 | +0.024 |
| Face area | 0.061 | **0.055** | 0.071 | 0.048 | +0.007 |
| Smile score | 0.323 | **0.279** | 0.368 | 0.264 | +0.015 |
| Body coverage | 0.252 | **0.235** | 0.348 | 0.209 | +0.026 |

Adding panel channel historical data to 2023 (691 thumbnails, up from 555) raised scores across the board. The 2023 dip is still real but smaller — confirming the **composition effect** was partly responsible. The panel channels score higher than the initial scrape's broader channel mix.

Remaining explanations:
- **Channel mix**: 2023 still includes ~35 non-panel channels from the initial scrape. 2024–2025 is 100% panel-curated entertainment channels.
- **Survivorship bias**: Panel channels selected for tracking may be those most likely to adopt MrBeast's style.

### 6. Channel Evolution — 29 Converging, 17 Diverging

Across all 46 channels with ≥4 years of data (up from 45 in prior analysis):

- **63% converging** (29/46), **37% diverging** (17/46)
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
| **Sidemen** | 10 | +0.314 | 1.3 → 5.1 | Expanded to 10 years, consistent climb |
| Jenna Marbles | 4 | +0.304 | 3.3 → 4.3 | Pre-retirement convergence |
| **Ryan Trahan** | 11 | +0.269 | 1.0 → 4.8 | Dramatic long-term rise |
| **Matt Stonie** | 11 | +0.252 | 1.3 → 3.6 | Steady food-to-entertainment shift |
| **Cody Ko** | 10 | +0.241 | 5.0 → 6.2 | Already high, still climbing |
| **David Dobrik** | 9 | +0.226 | 3.6 → 5.9 | Strong convergence, peaked at 7.2 in 2022 |

#### Top Divergers

| Channel | Years | Slope/yr | Start → End | Profile |
|---------|-------|----------|-------------|---------|
| Niko Omilana | 4 | −0.607 | 4.8 → 3.4 | Moved toward prank/reaction style |
| Jacksfilms | 4 | −0.600 | 4.7 → 3.1 | Comedy → low-effort ironic thumbnails |
| Ali-A | 4 | −0.600 | 5.1 → 2.9 | Shifted to gaming-heavy aesthetic |
| Annoying Orange | 4 | −0.520 | 4.9 → 3.0 | Cartoon/animated style doesn't converge |
| **JiDion** | 6 | −0.507 | 6.5 → 2.0 | Volatile; sparse early data (n=2 in 2019) |
| EpicMealTime | 4 | −0.470 | 5.0 → 3.4 | Food-focused, genre-locked |
| Jake Paul | 4 | −0.427 | 3.3 → 1.3 | Boxing era, dark/dramatic thumbnails |
| Rooster Teeth | 5 | −0.332 | 3.6 → 2.0 | Corporate channel, different strategy |
| Yes Theory | 5 | −0.300 | 4.8 → 3.6 | Travel/cinematic aesthetic |

**Notable patterns:**
- **Danny Duncan** is the standout long-term case study: 11 years of data, dramatic climb from 2.0 → 6.7, the largest absolute gain in the dataset.
- **FaZe Rug** now has a complete 11-year timeline (gap filled): steady climb from 3.3 → 6.5, with a pronounced jump in 2024–2025 (4.3 → 6.5).
- **Sidemen** expanded from 7 → 10 years of data. Consistent climb from 1.3 (2016) → 5.1 (2025), one of the clearest long-term convergence trajectories.
- **Ryan Trahan** shows 11 years of evolution: from 1.0 (2015) to 4.8 (2025), with a volatile but upward trajectory.
- **David Dobrik** peaked at 7.2 (2022) before declining — possible "convergence overshoot" or content shift.
- **JiDion** appears as a diverger but with very sparse early data (n=2 in 2019, n=3 in 2021). His negative slope should be treated cautiously.
- **KSI** now shows 11 years of volatile trajectory (slope −0.148): peaked at 5.1 in 2017, dropped to 2.3 in 2020, partially recovered. Not a clean convergence or divergence story.
- Most divergers are either genre-locked (Annoying Orange, EpicMealTime) or intentionally counter-culture (Jacksfilms' ironic thumbnails, Jake Paul's boxing-era dark aesthetic).

#### Panel Channel Trajectories (detailed)

| Channel | Slope | Years | Trajectory Summary |
|---------|-------|-------|--------------------|
| Danny Duncan | **+0.552** | 11 | 2.0 → 2.3 → 3.3 → 4.9 → 5.8 → 6.2 → **6.7** |
| ZHC | +0.434 | 10 | 4.0 → 1.5 → 3.8 → 5.7 → 6.7 → 6.8 → **4.5** |
| IShowSpeed | +0.361 | 9 | 0.5 → 1.1 → 2.3 → 4.8 → 4.8 → 4.2 → **2.7** |
| FaZe Rug | +0.355 | 11 | 3.3 → 1.9 → 3.0 → 3.6 → 4.4 → 6.6 → **6.5** |
| Sidemen | +0.314 | 10 | 1.3 → 3.1 → 3.2 → 4.2 → 4.0 → 4.5 → **5.1** |
| Ryan Trahan | +0.269 | 11 | 1.0 → 1.9 → 5.0 → 3.8 → 2.9 → 4.4 → **4.8** |
| Matt Stonie | +0.252 | 11 | 1.3 → 2.3 → 2.9 → 3.5 → 3.7 → 4.7 → **3.6** |
| Cody Ko | +0.241 | 10 | 5.0 → 4.5 → 5.5 → 5.9 → 6.5 → 6.6 → **6.2** |
| David Dobrik | +0.226 | 9 | 3.6 → 5.7 → 6.8 → 6.2 → 6.8 → 7.2 → **5.9** |
| Dude Perfect | +0.165 | 11 | 2.3 → 2.3 → 2.1 → 2.4 → 3.2 → 2.0 → **4.1** |
| LazarBeam | +0.135 | 11 | 2.7 → 6.2 → 3.8 → 5.4 → 7.3 → 5.5 → **4.3** |
| Good Mythical Morning | +0.121 | 11 | 5.6 → 4.6 → 5.2 → 5.8 → 6.1 → 6.5 → **5.4** |
| Unspeakable | +0.116 | 9 | 5.1 → 3.3 → 3.7 → 5.4 → 5.3 → 4.6 → **4.2** |
| VanossGaming | +0.081 | 11 | 4.0 → 3.3 → 2.6 → 1.3 → 1.8 → 3.8 → **4.7** |
| Smosh | +0.039 | 11 | 5.1 → 4.3 → 3.1 → 4.1 → 5.4 → 5.9 → **3.6** |
| Jelly | +0.037 | 11 | 3.1 → 3.5 → 4.4 → 2.3 → 2.9 → 2.5 → **5.1** |
| PewDiePie | −0.018 | 11 | 5.7 → 5.8 → 5.9 → 5.8 → 5.4 → 5.6 → **5.7** |
| Logan Paul | −0.045 | 10 | 5.9 → 3.1 → 4.6 → 4.7 → 3.3 → 4.0 → **2.9** |
| Airrack | −0.079 | 7 | 4.9 → 4.2 → 3.5 → 4.4 → 3.0 → 3.8 → **4.6** |
| Markiplier | −0.102 | 11 | 2.4 → 3.7 → 4.1 → 3.7 → 3.1 → 2.0 → **2.7** |
| KSI | −0.148 | 11 | 3.6 → 5.1 → 4.2 → 2.3 → 2.9 → 3.0 → **3.8** |
| JiDion | −0.507 | 6 | 6.5 → 1.7 → 2.0 → 4.9 → 2.5 → **2.0** |

**Panel summary:** 16/22 panel channels (73%) have positive slopes, vs. 63% across all tracked channels. The panel's average slope is higher than the overall, partly because these channels were selected for being entertainment-focused (and thus more likely to share MrBeast's visual language).

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

1. **Aggregate convergence is real, with a two-phase pattern.** The 2015–2020 period shows a baseline plateau with mean likeness between 3.59–3.88. A modest uptick appears in 2021–2022 (4.11–4.12), suggesting early convergence. Then 2024–2025 jumps to 4.55–4.62 — a clear acceleration. This two-phase pattern (gradual 2021–2022 uptick → 2024–2025 acceleration) is consistent with diffusion dynamics.

2. **Convergence is multi-dimensional.** It's not just one feature changing. Face count, face size, smile intensity, brow expressiveness, body coverage, and text reduction all move toward MrBeast's values simultaneously. This coordinated shift across 6+ features is difficult to attribute to coincidence.

3. **Facial expression criteria drive the convergence.** The largest gains are in smile score (+19 pp), face presence (+17 pp), body coverage (+14 pp), and brow raise (+14 pp). These are the most distinctive and intentional elements of MrBeast's style — suggesting deliberate mimicry rather than incidental overlap.

4. **63% of tracked channels are converging** (29/46 with ≥4 years). The average slope is net positive (+0.050/year). Several channels show dramatic transformations (Danny Duncan: 2.0→6.7, FaZe Rug: 3.3→6.5, SSSniperWolf: 4.6→6.9).

5. **73% of panel channels are converging** (16/22). When restricted to the entertainment panel, convergence is even stronger, with the panel's average slope exceeding the overall average.

6. **Divergers have explanations.** Most diverging channels are genre-locked (animated content, food shows) or intentionally counter-culture. True resisters among entertainment channels are few.

#### What the data doesn't show

1. **Causation.** The convergence could reflect MrBeast's influence, or both MrBeast and other creators could be independently responding to the same YouTube algorithm pressures, audience preferences, or thumbnail design tools.

2. **Brightness convergence.** Unlike every other feature, brightness has *not* converged. Creators may use darker/moodier palettes as a deliberate differentiator.

3. **Clean pre/post separation.** With the expanded dataset, the 2021–2022 uptick blurs the previously clean "plateau then jump" narrative. The convergence may be more gradual than initially apparent, which is actually more consistent with a diffusion-of-innovation model.

#### Methodological caveats

- **Composition effect is partially resolved but remains a concern.** Adding panel channel historical data to 2015–2023 raised the 2023 mean from 3.42 → 3.64, confirming the composition effect was real. However, 2015–2023 still includes ~93 non-panel channels, while 2024–2025 is panel-only. A panel-only reanalysis is still needed.
- **Binary scoring simplifies nuance.** The 0–8 score treats all criteria equally, but face presence likely matters more than text area for visual impact. Weighted scoring could provide sharper discrimination.
- **No engagement data.** We have no views or CTR data, so we cannot test whether convergence toward MrBeast's style correlates with performance — a key question for the influence hypothesis.
- **Sparse early data for some channels.** JiDion (n=2 in 2019), Ryan Trahan (n=1 in 2015), and several others have very low sample sizes in early years, making their starting points unreliable for slope calculation.
- **MrBeast reference set is small.** The 102-thumbnail reference set lacks API metadata and era-based stratification. An expanded, era-structured reference would strengthen the centroid calculation.

---

## Data Gaps & Next Steps

### Completed (Feb 16, 2026)

1. ~~**Ingest new thumbnails into DB**~~ — Done. 1,125 new records ingested (0 errors). DB at 5,371.
2. ~~**Run feature extraction**~~ — Done. 1,125 thumbnails processed (100% pipeline completion).
3. ~~**Re-run clustering**~~ — Done. 5,369/5,371 thumbnails clustered into 3 clusters.
4. ~~**Collect historical years for 11 panel channels**~~ — Done. 1,266 thumbnails collected via YouTube API for Dude Perfect, Smosh, GMM, Markiplier, PewDiePie, VanossGaming, Sidemen, Unspeakable, Ryan Trahan, David Dobrik, JiDion (2015–2023). Then ingested (1,175 new records), extracted features, and re-clustered. DB now at 6,546.

### Remaining Steps

5. **Collect MrBeast reference set via API** — Structured era-based collection with full metadata
   ```bash
   python scripts/collect_youtube.py mrbeast
   ```
   **Quota estimate:** ~1,010 units.

6. **Re-run full pipeline** — Ingest → features → clustering on complete dataset after MrBeast era collection.

7. **Panel-only reanalysis** — Filter 2015–2023 to panel channels only and recompute all findings tables. This is the key test to resolve the composition effect caveat. Compare panel-only vs. all-channel trends to quantify the composition effect.

8. **Statistical testing:**
   - Paired t-tests or Wilcoxon signed-rank on early vs. late similarity scores per channel
   - ANOVA across year groups for key features (brightness, face size, text ratio)
   - Effect sizes (Cohen's d) for 2015 vs. 2025 feature differences
   - Confidence intervals on year-over-year likeness differences
   - Regression: similarity score ~ year, controlling for channel fixed effects

9. **Weighted likeness score** — Develop an alternative to the binary 0–8 score that weights criteria by their discriminative power (e.g., face features weighted higher than text absence).

10. **Generate publication-ready visualizations:**
    - Heatmap of similarity scores (channels x years)
    - Aggregate trendline: mean panel similarity by year with confidence bands
    - Before/after thumbnail galleries for strongest convergers (Danny Duncan, FaZe Rug, SSSniperWolf)
    - Feature distribution shifts over time (violin or ridgeline plots)
    - Per-channel evolution timelines with slope annotations

### API Quota Budget (remaining work)

| Task | API Calls | Quota Units | Days |
|------|-----------|-------------|------|
| MrBeast era collection | ~10 search + video | ~1,010 | <1 |
| **Total** | **~10** | **~1,010** | **<1 day** |
