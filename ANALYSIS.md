# Thumbnail Convergence Analysis — Entertainment Panel

## Thesis

MrBeast's thumbnail style (high brightness, large faces, expressive emotions, bold colors, minimal text) and title style (short, numeric, first-person, challenge-framing) have influenced the broader **entertainment** side of YouTube. This analysis tracks whether entertainment creators' thumbnails *and titles* have converged toward MrBeast's "clickbait package" over the period 2015–2025.

## Dataset Overview

**Panel restructured** from 38 mixed-category channels to **22 entertainment-focused channels** + MrBeast reference set. Removed 24 non-entertainment (tech, science, education, news, filmmaking, cooking, beauty, productivity, storytelling) and unusable channels whose divergence reflected genre differences rather than creative choices.

### Dataset Status (as of Feb 17, 2026)

| Group | Files on Disk | In DB | Notes |
|-------|--------------|-------|-------|
| MrBeast (ref) | 307 | 309 | Era-structured reference set (2015–2025), API-collected |
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
| **Total** | **6,751** | **6,753** | **Fully ingested** |

### Database Pipeline Status

| Metric | Count |
|--------|-------|
| Total DB records | 6,753 |
| With features extracted | 6,753 (100%) |
| With title features | 6,753 (100%) |
| With cluster assignment | 6,751 (99.97%) |
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

- **On disk:** 307 thumbnails (100 pre-collected + 207 API-collected with full metadata)
- **In DB:** 309 (all with features extracted, title features, and cluster assignments)
- **API era collection:** Complete (Feb 17, 2026). 1,111 quota units used.
- **Era breakdown:** early (2015–16, 30 collected), growth (2017–18, 40), mainstream (2019–20, 50), peak (2021–22, 41/60 target), current (2023–25, 46/70 target)
- **Total collected:** 207 API + 102 pre-existing = 309 in DB
- **Note:** Peak and current eras fell short of target because MrBeast posted fewer long-form videos than expected (Shorts filtered out). The 309 total still provides 3x the coverage of the previous 102-thumbnail set.

---

## Key Findings

### 1. Likeness Scores Show a Clear 2024–2025 Convergence

Binary likeness scores (0–8 scale) across all 6,753 thumbnails:

| Group | N | Mean | Median | ≥4 | ≥5 | ≥6 | ≥7 | 8/8 |
|-------|---|------|--------|-----|-----|-----|-----|-----|
| **MrBeast** | **309** | **5.42** | **6.0** | **75.1%** | **68.6%** | **63.1%** | **44.0%** | **23.3%** |
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

**Key observation:** The MrBeast reference set was expanded from 102 → 309 thumbnails via era-structured API collection (early 2015–16 through current 2023–25). This lowered MrBeast's own mean from 6.13 → 5.42 because the expanded set now includes early-era content (2015–2016) when MrBeast's thumbnails were themselves lower-quality, text-heavy, and less distinctive. The reference now represents MrBeast's *full trajectory*, not just his peak.

The year-group scores are unchanged (same thumbnails). The 2015–2020 baseline (3.59–3.88) and 2024–2025 acceleration (4.55–4.62) remain clear. With MrBeast's centroid now at 5.42, the field has closed ~53% of the gap (vs. ~40% with the old centroid at 6.13). This is a more realistic measure of convergence: creators aren't converging toward an impossible peak, but toward MrBeast's overall style.

### 2. Continuous Similarity Confirms the Step-Change

Z-score distance from MrBeast centroid (10 features, exponential decay to 0–100%):

| Group | Mean % | Median % | Std Dev |
|-------|--------|----------|---------|
| **MrBeast** | **71.9** | **74.4** | **10.2** |
| 2015 | 63.7 | 62.5 | 10.7 |
| 2016 | 64.5 | 63.9 | 10.6 |
| 2017 | 64.1 | 63.8 | 11.0 |
| 2018 | 64.8 | 64.5 | 10.1 |
| 2019 | 64.2 | 64.0 | 10.3 |
| 2020 | 64.9 | 64.6 | 10.9 |
| 2021 | 64.9 | 65.0 | 11.1 |
| 2022 | 64.9 | 64.4 | 10.0 |
| 2023 | 63.5 | 63.0 | 10.2 |
| **2024** | **67.2** | **67.5** | **9.6** |
| **2025** | **67.9** | **69.3** | **9.9** |

With the expanded MrBeast centroid (309 vs. 102 thumbnails), all similarity scores shifted downward because the centroid now includes early-era MrBeast content. MrBeast's own self-similarity dropped from 79.0% → 71.9%, reflecting the internal variance across his 10-year career. Despite the recalibration, the **relative pattern is identical**: 2024–2025 show a **3–4 percentage-point jump** over the 2015–2022 plateau (~64–65%). The field has closed about 53% of the gap to MrBeast's centroid in 2024–2025.

### 3. Feature-Level Trends

#### 3a. Core Visual Features (group means)

| Group | Brightness | Saturation | Face Count | Text Area | Largest Face Area |
|-------|-----------|-----------|-----------|-----------|-------------------|
| **MrBeast** | **0.641** | **0.385** | **1.12** | **0.0072** | **0.071** |
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
- **Brightness**: Stable 0.55–0.59 through 2020, drops to 0.49 in 2023, recovers to 0.56–0.60 in 2024–2025. Approaching MrBeast's 0.64.
- **Saturation**: Gradual rise from 0.38 (2015) to 0.45 (2024), now **exceeding** MrBeast's 0.39. Thumbnails are getting more colorful.
- **Face count**: Rose from 0.78 (2015) to 1.16 (2024), now **matching** MrBeast's expanded mean of 1.12. The strongest single-feature convergence — essentially closed.
- **Text area**: Dropped from 0.019 (2015) to 0.005 (2025) — a **74% reduction** — converging toward MrBeast's 0.007. With the expanded reference set, MrBeast's own text usage is higher than previously measured (early-era thumbnails included text overlays), making the gap smaller than thought.
- **Face size**: Rose from 0.056 (2015) to 0.071 (2024), now **matching** MrBeast's expanded mean of 0.071. Another effectively closed gap.

#### 3b. Emotion & Pose Proxies (group means)

| Group | Smile | Mouth Open | Brow Raise | Body Coverage |
|-------|-------|-----------|-----------|--------------|
| **MrBeast** | **0.443** | **0.175** | **0.332** | **0.350** |
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

This is where convergence is strongest. Between 2015 and 2025 (with expanded MrBeast centroid):
- **Smile scores** rose from 0.27 → 0.38 (+42%), closing **63%** of the gap to MrBeast's 0.44
- **Brow raise** rose from 0.21 → 0.28 (+34%), closing **59%** of the gap to MrBeast's 0.33
- **Body coverage** rose from 0.25 → 0.34 (+37%), closing **87%** of the gap to MrBeast's 0.35 — nearly matched
- **Mouth open** rose from 0.11 → 0.16 (+49%), closing **73%** of the gap to MrBeast's 0.18

With the expanded MrBeast reference (309 thumbnails across all eras), the gap is significantly smaller than previously measured. Body coverage and mouth-open scores are now **within 1–2 percentage points** of MrBeast's means. People in thumbnails are smiling bigger, raising eyebrows more, and showing more of their bodies — and by 2024–2025 they are approaching or matching MrBeast's levels on multiple emotion/pose metrics.

#### 3c. Text Disappearing from Thumbnails

| Group | Text Box Count | % with Any Text |
|-------|---------------|-----------------|
| **MrBeast** | **0.482** | **10.4%** |
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

Text peaked in 2021 (1.07 boxes, 19.4% with text) then dropped. 2025 hit the lowest text prevalence at 12.9%. With the expanded MrBeast set (10.4% with text, text_box_count 0.48), the gap is much smaller than previously measured. Early-era MrBeast actually used text overlays; the "no text" aesthetic is a later-era refinement. The 2025 field (12.9% with text) is now **approaching** MrBeast's full-career average.

#### 3d. Depth & Composition

| Group | Depth Range | Depth Contrast |
|-------|-----------|---------------|
| **MrBeast** | **0.948** | **0.284** |
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

Depth range (foreground/background separation) increased from 0.91 (2015) to 0.97 (2025), now **exceeding** MrBeast's expanded mean of 0.95. By 2025, the field has surpassed MrBeast's career average on this metric. Creators are increasingly using shallow depth of field, isolated subjects, or graphic backgrounds that maximize figure-ground contrast.

### 4. Per-Criterion Threshold Pass Rates

| Criterion | MrBeast | 2015 | 2018 | 2021 | 2023 | 2024 | 2025 | Δ 2015→2025 |
|-----------|---------|------|------|------|------|------|------|-------------|
| Brightness ≥ 0.60 | 68.3% | 41.0% | 45.4% | 49.3% | 35.3% | **56.2%** | 41.9% | +0.9 pp |
| Face count ≥ 1 | 80.6% | 60.0% | 67.0% | 68.7% | 64.5% | **76.9%** | **77.4%** | **+17.4 pp** |
| Text area ≤ 0.005 | 93.9% | 86.3% | 86.2% | 82.1% | 86.4% | 87.7% | **91.4%** | **+5.1 pp** |
| Smile ≥ 0.40 | 75.1% | 47.0% | 50.3% | 55.5% | 48.5% | **63.5%** | **65.9%** | **+18.9 pp** |
| Mouth open ≥ 0.15 | 56.3% | 25.9% | 33.6% | 33.3% | 31.0% | **36.5%** | **38.0%** | **+12.1 pp** |
| Body coverage ≥ 0.30 | 53.1% | 30.5% | 31.7% | 38.8% | 28.1% | **45.4%** | **44.8%** | **+14.3 pp** |
| Brow raise ≥ 0.30 | 60.8% | 33.6% | 38.1% | 43.3% | 36.9% | **49.2%** | **47.7%** | **+14.1 pp** |
| Face area ≥ 0.06 | 54.0% | 34.4% | 36.0% | 40.0% | 33.6% | **46.5%** | **47.7%** | **+13.3 pp** |

**Strongest convergence (2015 → 2025):**
- Smile score: +18.9 pp (47% → 66%)
- Face count: +17.4 pp (60% → 77%)
- Body coverage: +14.3 pp (31% → 45%)
- Brow raise: +14.1 pp (34% → 48%)
- Face area ratio: +13.3 pp (34% → 48%)
- Mouth open: +12.1 pp (26% → 38%)

The convergence is broadest across **facial expression and body visibility** criteria. With the expanded MrBeast reference, the gap is smaller than previously measured: 2025's face count (77.4%) is now within 3 pp of MrBeast (80.6%), body coverage (44.8%) is within 8 pp of MrBeast (53.1%), and face area (47.7%) is within 6 pp of MrBeast (54.0%). On several criteria, 2024–2025 has closed **over 70%** of the gap to MrBeast.

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

### 6. Channel Evolution — 28 Converging, 17 Diverging

Across all 46 channels with ≥4 years of data:

- **61% converging** (28/46), **37% diverging** (17/46), **2% flat** (1/46)
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

### 7. Title Convergence Analysis (NEW)

Title features were extracted from all 6,753 records using pure string analysis — no ML, no external dependencies. Titles are cleaned to fix filename artifacts (numeric prefixes, `39` → apostrophe, channel name prefixes). A binary scoring approach (0–9) is applied to title traits that characterize MrBeast's titling style.

#### 7a. Title Likeness Scoring Criteria

Each title gets 0–9 points:

| Criterion | MrBeast Rationale |
|-----------|-------------------|
| `word_count <= 8` | MrBeast avg ~6 words, short & punchy |
| `char_count <= 50` | MrBeast avg ~32 chars, concise |
| `has_number` | 76.5% of MrBeast titles contain numbers |
| `has_large_number` | "$1,000,000", "100,000 People" — 52% |
| `has_money_reference` | "$500,000", "gave", "paid", "won" — 29.4% |
| `first_person` | "I ..." pattern — 20.6% of MrBeast titles |
| `has_superlative` | "World's Largest", "Most Expensive" — 16.7% |
| `has_challenge_framing` | "Survive", "vs", "Win" — 54.9% |
| `avg_word_length <= 5.0` | Simple vocabulary, accessible to young audiences |

The `has_money_reference` criterion detects dollar signs (`$50,000`), money-related words (paid, bought, spent, gave, worth, cost, etc.), and — for filename-derived titles where `$` was stripped — large numbers paired with money-context words (win, gave, vs, bet). With the expanded MrBeast set (207 API-collected titles with real `$` signs + 102 original filename-derived), MrBeast's money prevalence rose to 44.7% — significantly higher than the 29.4% measured with only filename-derived titles.

#### 7b. Title Likeness Scores by Group

| Group | N | Mean (0–9) | Median | ≥5 | ≥6 | ≥7 |
|-------|---|------------|--------|-----|-----|-----|
| **MrBeast** | **309** | **4.95** | **5.0** | **63.1%** | **42.1%** | **17.5%** |
| 2015 | 607 | 2.94 | 3.0 | 5.1% | 0.2% | 0.0% |
| 2016 | 612 | 2.90 | 3.0 | 5.9% | 0.2% | 0.0% |
| 2017 | 722 | 2.98 | 3.0 | 7.5% | 2.1% | 0.4% |
| 2018 | 712 | 3.02 | 3.0 | 7.9% | 1.5% | 0.4% |
| 2019 | 660 | 3.31 | 3.0 | 15.0% | 5.2% | 2.4% |
| 2020 | 614 | 3.13 | 3.0 | 11.4% | 3.1% | 0.8% |
| 2021 | 598 | 3.37 | 3.0 | 18.2% | 6.5% | 2.3% |
| 2022 | 689 | 3.36 | 3.0 | 17.0% | 6.7% | 1.2% |
| 2023 | 691 | 3.29 | 3.0 | 13.7% | 5.6% | 1.4% |
| **2024** | **260** | **3.34** | **3.0** | **18.1%** | **7.3%** | **1.5%** |
| **2025** | **279** | **3.37** | **3.0** | **16.5%** | **6.1%** | **2.5%** |

**Key observation:** Title convergence is **weaker and more gradual** than thumbnail convergence. Mean scores rise from 2.94 (2015) to 3.37 (2025) — a 14.6% increase vs. the 27% increase seen in thumbnail scores over the same period. There is no dramatic 2024–2025 step-change for titles the way there is for thumbnails. Instead, title convergence is steady and incremental, with 2019 (3.31) marking the first notable jump. The ≥5 threshold shows the story more sharply: 5.1% (2015) → 16.5% (2025), more than tripling but still far from MrBeast's 63.1%.

The gap between MrBeast (4.95) and the field (3.37) remains notable — titles have closed ~21% of the distance, vs. ~53% for thumbnails. However, the expanded MrBeast set (309 with proper API titles vs. old 102 with filename-derived titles) gives a more realistic reference: MrBeast's title mean dropped from 5.23 → 4.95, as early-era titles were less formulaic.

#### 7c. Per-Criterion Title Feature Trends

| Group | Avg Words | Avg Chars | % Number | % Large# | % Money Ref | % 1st Person | % Superlative | % Challenge | Avg Word Len |
|-------|-----------|-----------|----------|----------|-------------|-------------|---------------|-------------|--------------|
| **MrBeast** | **6.6** | **35.7** | **67.3%** | **46.3%** | **44.7%** | **25.9%** | **15.5%** | **39.8%** | **4.66** |
| 2015 | 6.0 | 34.1 | 31.0% | 3.5% | 2.3% | 2.1% | 9.7% | 11.4% | 5.03 |
| 2018 | 6.8 | 37.9 | 29.8% | 4.1% | 3.8% | 5.1% | 11.9% | 17.1% | 4.88 |
| 2021 | 6.1 | 33.9 | 28.3% | 9.0% | 9.2% | 13.5% | 12.9% | 12.7% | 4.84 |
| 2023 | 6.2 | 34.0 | 24.3% | 6.7% | 6.5% | 16.4% | 15.5% | 9.8% | 4.78 |
| **2025** | **6.7** | **36.8** | **32.6%** | **9.3%** | **11.8%** | **25.4%** | **12.2%** | **13.3%** | **4.75** |

**Strongest converging title traits (2015 → 2025):**
- **First person ("I ...")**: 2.1% → 25.4% — a **12x increase**, now **matching** MrBeast's 25.9%. This is the single strongest title convergence signal. The "I did X" framing that MrBeast popularized is now ubiquitous and has essentially reached parity with his rate.
- **Money references**: 2.3% → 11.8% — a **5x increase**. Titles increasingly feature dollar amounts, "gave", "spent", "paid", "worth" etc. Still well below MrBeast's 44.7% (which jumped from the old 29.4% because the expanded API-collected set has real `$` signs in titles). The trajectory is clear and accelerating (was 6.5% as recently as 2020).
- **Large numbers (≥1,000)**: 3.5% → 9.3% — nearly tripled, though still far from MrBeast's 46.3%.
- **Word length**: 5.03 → 4.75 — vocabulary is getting simpler, converging toward MrBeast's 4.66.
- **Superlatives**: 9.7% → 12.2% — modest increase toward MrBeast's 15.5%.

**Weakest/non-converging title traits:**
- **Numbers in titles**: 31% → 33% — essentially flat, well below MrBeast's 67.3%. Titles have not adopted MrBeast's aggressive use of numeric hooks.
- **Challenge framing**: 11.4% → 13.3% — barely moved, far from MrBeast's 39.8%. "vs", "Survive", "Win" vocabulary remains distinctively MrBeast.
- **Word/char count**: Titles are actually getting *slightly longer* (6.0 → 6.7 words, 34.1 → 36.8 chars), matching MrBeast's expanded career average (6.6 words, 35.7 chars). With the expanded set, MrBeast is less concise than previously measured — early-era titles were longer.

**Interpretation:** The expanded MrBeast reference (309 with real API titles) reveals that MrBeast's titling style evolved significantly. Early MrBeast used longer titles and fewer dollar signs; the iconic "$X" format is a later development. This means the convergence target is a moving one. Despite this, the field has closed the gap on first-person framing (now at parity), simpler vocabulary (near parity), and title length (now matching). The biggest remaining gaps are money references (11.8% vs 44.7%), numeric hooks (33% vs 67%), and challenge framing (13% vs 40%) — all traits tied to MrBeast's specific content format.

#### 7d. Combined Likeness Scores (Thumbnail + Title, 0–17)

| Group | N | Thumb (0–8) | Title (0–9) | Combined (0–17) | ≥8 | ≥10 | ≥12 |
|-------|---|-------------|-------------|-----------------|-----|------|------|
| **MrBeast** | **309** | **5.42** | **4.95** | **10.37** | **81.2%** | **66.3%** | **43.7%** |
| 2015 | 607 | 3.59 | 2.94 | 6.52 | 35.6% | 17.1% | 2.1% |
| 2016 | 612 | 3.76 | 2.90 | 6.66 | 39.5% | 17.0% | 2.6% |
| 2017 | 722 | 3.80 | 2.98 | 6.78 | 39.8% | 17.9% | 1.9% |
| 2018 | 712 | 3.88 | 3.02 | 6.90 | 41.2% | 20.5% | 2.5% |
| 2019 | 660 | 3.85 | 3.31 | 7.16 | 45.9% | 21.8% | 4.2% |
| 2020 | 614 | 3.85 | 3.13 | 6.98 | 43.3% | 22.1% | 5.0% |
| 2021 | 598 | 4.11 | 3.37 | 7.48 | 50.7% | 25.4% | 7.7% |
| 2022 | 689 | 4.13 | 3.36 | 7.48 | 51.5% | 26.0% | 7.3% |
| 2023 | 691 | 3.64 | 3.29 | 6.94 | 44.1% | 18.5% | 5.4% |
| **2024** | **260** | **4.62** | **3.34** | **7.96** | **57.7%** | **33.1%** | **10.8%** |
| **2025** | **279** | **4.55** | **3.37** | **7.92** | **58.8%** | **27.6%** | **8.2%** |

**Key observation:** Combined scores confirm the convergence pattern and make the 2024–2025 acceleration more visible. The gap between 2015 baseline (6.52) and 2024–2025 (7.92–7.96) is **1.4 points on the 0–17 scale** — a 22% increase. With MrBeast's combined mean now at 10.37 (down from 11.35 with the expanded set), the field has closed **~37%** of the distance.

The combined score also makes the **2021–2022 inflection** clearer: the jump from 6.90–6.98 (2018–2020) to 7.48 (2021–2022) is a half-point step-change in combined terms, followed by the 2023 dip and 2024–2025 acceleration. This reinforces the two-phase convergence pattern.

#### 7e. Channel Evolution — Title Slopes

Across 46 channels with ≥4 years of data:

| Metric | Thumbnail | Title | Combined |
|--------|-----------|-------|----------|
| Avg slope / year | **+0.050** | **+0.020** | **+0.069** |
| Converging channels | 28 (61%) | — | — |
| Diverging channels | 17 (37%) | — | — |
| Flat | 1 (2%) | — | — |

**Top combined convergers:**

| Channel | Thumb Slope | Title Slope | Combined Slope |
|---------|-------------|-------------|----------------|
| ZHC | +0.434 | +0.220 | **+0.654** |
| Disguised Toast | +0.968 | −0.326 | **+0.642** |
| Danny Duncan | +0.552 | +0.058 | **+0.610** |
| Sidemen | +0.314 | +0.187 | **+0.501** |
| FaZe Rug | +0.355 | +0.115 | **+0.470** |
| IShowSpeed | +0.361 | +0.060 | **+0.421** |
| Ryan Trahan | +0.269 | +0.101 | **+0.370** |

**Notable patterns:**
- **Disguised Toast** has the highest thumbnail slope (+0.968) but a *negative* title slope (−0.326), suggesting a purely visual convergence with an independent titling strategy.
- **ZHC** converges strongly on both dimensions (+0.434 thumb, +0.220 title), the most balanced convergence in the dataset.
- **Sidemen** has the highest title slope among top convergers (+0.187), reflecting increased adoption of money framing and challenge language in their titles alongside visual changes.
- Most top convergers show positive slopes on *both* dimensions, suggesting the "clickbait package" is adopted as a whole.

#### 7f. Title vs. Thumbnail Convergence: Different Speeds, Same Direction

The data reveals that **titles and thumbnails converge at different rates**:

1. **Thumbnails converge faster** (avg slope +0.050/yr vs. title +0.020/yr). Visual changes are easier to adopt — you can redesign a thumbnail without changing your content. Title patterns like "challenge framing" require the content itself to shift.

2. **First-person framing has reached parity.** At 25.4% (2025) vs. MrBeast's 25.9%, the field has **matched** MrBeast's rate. "I did X" titles are now a platform-wide convention, not just a MrBeast signature. (Previously reported as "over-converged" at 25.4% vs 20.6%, but the expanded MrBeast set revealed his true first-person rate is 25.9%, not 20.6%.)

3. **Money references are the fastest-growing title trait** — from 2.3% (2015) to 11.8% (2025), a 5x increase. With the expanded MrBeast set, his money reference rate jumped to 44.7% (from 29.4%) because API-collected titles retain the `$` character that filename-derived titles lost. The gap is larger than previously measured, suggesting significant room for further convergence.

4. **The combined (0–17) score smooths noise** and makes the convergence trajectory clearer than either dimension alone. It also reveals that some creators converge visually but not linguistically (or vice versa), suggesting different adoption barriers.

### 8. MrBeast Centroid (Visual Reference Profile)

The visual target that other channels are converging toward (expanded N=309):

| Feature | MrBeast Mean | Role |
|---------|-------------|------|
| avg_brightness | 0.641 | Bright, well-lit compositions |
| avg_saturation | 0.385 | Moderate, not oversaturated |
| face_count | 1.120 | Almost always at least one face |
| largest_face_area_ratio | 0.071 | Large, prominent faces |
| smile_score | 0.443 | Strong positive expressions |
| mouth_open_score | 0.175 | Exaggerated surprise/excitement |
| brow_raise_score | 0.332 | Expressive eyebrows |
| body_coverage | 0.350 | Significant body presence |
| text_box_count | 0.482 | Low text (but higher than previously measured) |
| text_area_ratio | 0.007 | Low text area coverage |

**Key change from expanded reference set:** With 309 thumbnails spanning 2015–2025, the centroid is less extreme than the previous 102-thumbnail set (which was biased toward peak-era content). Notably, text usage is higher (0.48 text boxes vs. 0.09 previously) because early MrBeast used text overlays. The face count, face size, smile score, and body coverage all moderated. This means the "MrBeast style" as a convergence target is **less extreme and more attainable** than previously measured — and the field has closed a larger percentage of the gap.

The profile can be summarized as: **bright, face-forward, emotionally expressive thumbnails with moderate text, strong foreground subjects, and clear depth separation.**

### 9. Panel-Only Reanalysis — Composition Effect Resolved

Filtering 2015–2023 to the 22 curated panel channels (excluding ~93 non-panel channels from the initial scrape) reveals a **cleaner convergence trajectory** and largely resolves the 2023 anomaly.

#### 9a. Panel-Only vs. All-Channel Likeness Scores

| Group | All-Channel Mean | Panel-Only Mean | Delta | Panel N |
|-------|-----------------|----------------|-------|---------|
| 2015 | 3.59 | 3.55 | −0.04 | 258 |
| 2016 | 3.76 | 3.93 | +0.17 | 316 |
| 2017 | 3.80 | 3.80 | 0.00 | 384 |
| 2018 | 3.88 | 3.92 | +0.04 | 412 |
| 2019 | 3.85 | 3.88 | +0.03 | 434 |
| 2020 | 3.85 | 4.12 | **+0.27** | 407 |
| 2021 | 4.11 | 4.49 | **+0.38** | 400 |
| 2022 | 4.12 | 4.58 | **+0.46** | 359 |
| **2023** | **3.64** | **4.35** | **+0.71** | 333 |
| 2024 | 4.62 | 4.62 | 0.00 | 260 |
| 2025 | 4.55 | 4.55 | 0.00 | 279 |

**Key finding: The 2023 anomaly is almost entirely a composition effect.** In the all-channel view, 2023 (3.64) was the lowest-scoring year. In the panel-only view, 2023 (4.35) is higher than 2020 (4.12) and close to 2024 (4.62). The dip from 2022 (4.58) to 2023 (4.35) is still present but minor — a 0.23 decrease vs. the alarming 0.48 decrease in the all-channel data.

The composition effect grows over time because the non-panel channels (from the initial scrape) are lower-scoring on average. In 2015, both populations score similarly (~3.55). By 2022, the gap is 0.46 points — the non-panel channels drag the all-channel mean down significantly.

#### 9b. Panel-Only Continuous Similarity

| Group | All-Channel Sim% | Panel-Only Sim% | Delta |
|-------|------------------|-----------------|-------|
| 2015 | 63.7 | 63.2 | −0.5 |
| 2016 | 64.5 | 63.6 | −0.9 |
| 2017 | 64.1 | 63.7 | −0.4 |
| 2018 | 64.8 | 65.1 | +0.3 |
| 2019 | 64.2 | 64.3 | +0.1 |
| 2020 | 64.9 | 65.8 | **+0.9** |
| 2021 | 64.9 | 66.4 | **+1.5** |
| 2022 | 64.9 | 65.9 | **+1.0** |
| 2023 | 63.5 | 66.0 | **+2.5** |
| 2024 | 67.2 | 67.2 | 0.0 |
| 2025 | 67.9 | 67.9 | 0.0 |

The panel-only similarity scores tell the same story: a **steady climb from 63.2% (2015) to 67.9% (2025)** with no dramatic 2023 dip. The trajectory is monotonically increasing from 2017 onward in the panel-only view, confirming the convergence is real and consistent.

#### 9c. Panel-Only Channel Evolution

Panel-only (22 channels, ≥3 years):

| Metric | All Channels (≥4yr) | Panel Only (≥3yr) |
|--------|--------------------|--------------------|
| Total channels | 46 | 22 |
| Converging | 28 (61%) | **16 (73%)** |
| Diverging | 17 (37%) | **6 (27%)** |
| Avg thumbnail slope | +0.050 | **+0.127** |
| Avg title slope | +0.020 | **+0.039** |
| Avg combined slope | +0.069 | **+0.167** |

The panel channels converge **2.5x faster** than the overall channel set (+0.127 vs +0.050 per year). This is expected: the panel was curated for entertainment channels, and entertainment channels are more likely to share MrBeast's visual language. The 73% convergence rate among panel channels (vs. 61% overall) confirms that the convergence phenomenon is strongest among creators in MrBeast's direct competitive space.

### 10. Statistical Testing Results

#### 10a. Hypothesis Tests (All Channels)

| Test | Statistic | p-value | Significant? | Interpretation |
|------|-----------|---------|-------------|----------------|
| **Welch's t-test** (early 15-17 vs late 24-25) | t = −7.74 | 2.75 × 10⁻¹⁴ | Yes | Late years score significantly higher |
| **ANOVA** (11 year groups) | F = 7.96 | 7.37 × 10⁻¹³ | Yes | Year groups differ significantly |
| **Cohen's d** | d = 0.37 | — | Small effect | Meaningful but not large |
| **Linear regression** (score ~ year) | slope = +0.058/yr | 1.04 × 10⁻⁸ | Yes | Significant upward trend |

- **R² = 0.005** (all-channel): Year explains only 0.5% of variance. Individual variation dominates — most thumbnails don't look like MrBeast regardless of year. But the trend is highly significant (p < 10⁻⁸) due to the large sample (N=6,444).
- **Cohen's d = 0.37 (small)**: The early-to-late shift is detectable but modest. Mean moved from 3.72 → 4.58, about 0.37 standard deviations. This is expected — we're measuring a population-level drift, not an on/off switch.
- **Early mean: 3.72**, Late mean: 4.58 — a **+0.86 point increase** (23% rise).

#### 10b. Hypothesis Tests (Panel Only)

| Test | Statistic | p-value | Significant? | Interpretation |
|------|-----------|---------|-------------|----------------|
| **Welch's t-test** | t = −6.57 | 7.81 × 10⁻¹¹ | Yes | Even within panel, late > early |
| **ANOVA** | F = 8.11 | 4.33 × 10⁻¹³ | Yes | Year groups differ within panel |
| **Cohen's d** | d = 0.35 | — | Small effect | Similar effect size to all-channel |
| **Linear regression** | slope = **+0.105/yr** | 3.34 × 10⁻¹⁶ | Yes | **1.8x steeper than all-channel** |

- **Panel R² = 0.017** — 3.4x higher than all-channel (0.005). Year explains more variance when channel composition is controlled.
- **Panel slope = +0.105/yr** — nearly double the all-channel slope (+0.058/yr). The convergence rate is significantly stronger among entertainment panel channels.
- The p-values remain highly significant (all < 10⁻¹⁰), confirming the trend is not an artifact of the channel mix.

#### 10c. Per-Year 95% Confidence Intervals (All Channels)

| Year | N | Mean | 95% CI | Width |
|------|---|------|--------|-------|
| 2015 | 607 | 3.59 | [3.40, 3.77] | 0.38 |
| 2016 | 612 | 3.76 | [3.57, 3.94] | 0.37 |
| 2017 | 722 | 3.80 | [3.63, 3.97] | 0.34 |
| 2018 | 712 | 3.88 | [3.71, 4.05] | 0.34 |
| 2019 | 660 | 3.85 | [3.67, 4.03] | 0.36 |
| 2020 | 614 | 3.85 | [3.66, 4.03] | 0.37 |
| 2021 | 598 | 4.11 | [3.92, 4.30] | 0.39 |
| 2022 | 689 | 4.12 | [3.94, 4.31] | 0.36 |
| 2023 | 691 | 3.64 | [3.46, 3.82] | 0.36 |
| **2024** | 260 | **4.62** | **[4.34, 4.90]** | 0.56 |
| **2025** | 279 | **4.55** | **[4.28, 4.81]** | 0.53 |

The 2024 and 2025 confidence intervals do **not overlap** with 2015's CI ([3.40, 3.77]), confirming the difference is statistically robust. The 2024–2025 CIs are wider (smaller N since only panel channels), but their lower bounds (4.28–4.34) still exceed the upper bounds of the 2015–2020 years.

#### 10d. Per-Year 95% CIs (Panel Only)

| Year | N | Mean | 95% CI | Width |
|------|---|------|--------|-------|
| 2015 | 258 | 3.55 | [3.27, 3.84] | 0.57 |
| 2016 | 316 | 3.93 | [3.67, 4.18] | 0.51 |
| 2017 | 384 | 3.80 | [3.57, 4.03] | 0.46 |
| 2018 | 412 | 3.92 | [3.70, 4.14] | 0.44 |
| 2019 | 434 | 3.88 | [3.66, 4.10] | 0.44 |
| 2020 | 407 | 4.12 | [3.89, 4.34] | 0.46 |
| **2021** | 400 | **4.49** | **[4.26, 4.71]** | 0.45 |
| **2022** | 359 | **4.58** | **[4.33, 4.83]** | 0.49 |
| 2023 | 333 | 4.35 | [4.09, 4.60] | 0.51 |
| **2024** | 260 | **4.62** | **[4.34, 4.90]** | 0.56 |
| **2025** | 279 | **4.55** | **[4.28, 4.81]** | 0.53 |

In the panel-only view, **2021–2025 form a clear elevated plateau** (4.35–4.62) with overlapping CIs, distinct from the 2015–2019 baseline (3.55–3.92). The convergence inflection point is at **2020–2021**, not 2024 — the panel channels began converging earlier than the all-channel data suggested.

### 11. Weighted Likeness Score

#### 11a. Data-Derived Feature Weights (All Channels)

| Feature | Weight | Rank | Interpretation |
|---------|--------|------|----------------|
| **Smile score** | **0.515** | 1 | Most discriminative — MrBeast's smile is his strongest signature |
| **Brightness** | **0.471** | 2 | Bright thumbnails strongly distinguish MrBeast |
| **Brow raise** | 0.353 | 3 | Expressive eyebrows are a key differentiator |
| **Body coverage** | 0.296 | 4 | Larger body presence moderately distinctive |
| **Face count** | 0.222 | 5 | Face presence matters but many channels already have faces |
| **Mouth open** | 0.198 | 6 | Moderate discriminative power |
| **Text area** | 0.120 | 7 | Low text is somewhat distinctive |
| **Face area ratio** | 0.109 | 8 | Least discriminative — face sizes are similar across channels |

Weight = |MrBeast mean − field mean| / field std. Higher weight means the feature more strongly separates MrBeast from the field. The **smile score and brightness** are the two most discriminative features, together accounting for 43% of the total weight.

#### 11b. Weighted vs. Unweighted Normalized Scores

| Group | Unweighted (0–1) | Weighted (0–1) | Delta |
|-------|-------------------|----------------|-------|
| **MrBeast** | **0.678** | **0.675** | −0.003 |
| 2015 | 0.448 | 0.424 | −0.024 |
| 2016 | 0.470 | 0.446 | −0.024 |
| 2017 | 0.475 | 0.452 | −0.023 |
| 2018 | 0.485 | 0.464 | −0.022 |
| 2019 | 0.481 | 0.459 | −0.022 |
| 2020 | 0.481 | 0.464 | −0.018 |
| 2021 | 0.514 | 0.502 | −0.012 |
| 2022 | 0.516 | 0.495 | −0.021 |
| 2023 | 0.456 | 0.427 | −0.029 |
| **2024** | **0.577** | **0.569** | −0.009 |
| **2025** | **0.569** | **0.546** | −0.023 |

The weighted scores are consistently **lower** than unweighted for year groups because the field is weakest on the most-weighted features (smile, brightness). 2024 shows the **smallest gap** (−0.009), meaning 2024 thumbnails are strongest on precisely the features that matter most. MrBeast's own scores are nearly identical across both methods, confirming he passes the high-weight criteria consistently.

#### 11c. Panel-Only Weights

| Feature | All-Channel Weight | Panel-Only Weight | Change |
|---------|-------------------|-------------------|--------|
| Smile score | 0.515 | **0.442** | −0.073 |
| Brightness | 0.471 | **0.441** | −0.030 |
| Brow raise | 0.353 | **0.270** | −0.084 |
| Body coverage | 0.296 | **0.182** | −0.114 |
| Face count | 0.222 | **0.146** | −0.076 |
| Mouth open | 0.198 | **0.141** | −0.057 |
| Text area | 0.120 | **0.019** | −0.101 |
| Face area ratio | 0.109 | **0.017** | −0.092 |

Panel-only weights are **uniformly lower** — the panel channels are already closer to MrBeast on every dimension. The two largest drops are **body coverage** (−0.114) and **text area** (−0.101), meaning panel channels have nearly matched MrBeast on these traits. Text area weight drops to near-zero (0.019), confirming that text reduction is essentially complete among entertainment channels.

---

## Assessment

### The Entertainment Convergence Hypothesis: Supported

The data robustly supports the thesis that entertainment YouTubers' thumbnails *and titles* have converged toward MrBeast's signature style. The panel-only reanalysis and statistical testing resolve the key methodological caveats from earlier analysis.

#### What the data shows

1. **Convergence is statistically significant.** Welch's t-test (early vs. late) yields p = 2.75 × 10⁻¹⁴. ANOVA across all 11 year groups yields p = 7.37 × 10⁻¹³. Linear regression slope is +0.058 pts/year (p < 10⁻⁸). All three tests reject the null hypothesis that scores are constant over time.

2. **The composition effect is resolved.** Panel-only reanalysis (Finding 9) shows the 2023 anomaly was almost entirely caused by non-panel channels. Panel-only 2023 mean is 4.35 (vs. all-channel 3.64). The panel-only trajectory shows a **steady climb** from 3.55 (2015) to 4.62 (2024), with the inflection point at 2020–2021 — not the sudden 2024 jump that the all-channel data suggested.

3. **Panel channels converge 2.5x faster** (+0.127/yr vs. +0.058/yr). The regression R² triples (0.017 vs. 0.005). Entertainment channels are converging more strongly than the broader YouTube population, as expected if MrBeast's influence is genre-specific.

4. **Convergence is multi-dimensional.** Face count, face size, smile intensity, brow expressiveness, body coverage, and text reduction all move toward MrBeast's values simultaneously. This coordinated shift across 6+ features is difficult to attribute to coincidence.

5. **Smile and brightness are the most discriminative features** (weights 0.515 and 0.471 respectively). Weighted scoring confirms that the field is weakest on exactly the features that most distinguish MrBeast. 2024 thumbnails show the smallest gap on high-weight features, indicating convergence is targeting the right traits.

6. **73% of panel channels are converging** (16/22). Among the 6 divergers, most have explanations: JiDion has sparse/volatile data, KSI's trajectory is volatile rather than directional, and PewDiePie/Markiplier have stabilized at their own styles.

7. **Titles converge too, but slower.** Title likeness scores rise from 2.94 (2015) to 3.37 (2025), +14.6% vs. +27% for thumbnails. First-person framing has fully converged (25.4% vs. MrBeast's 25.9%). Money references show a 5x increase (2.3% → 11.8%). However, MrBeast's most distinctive title traits (numeric hooks at 67.3%, challenge framing at 39.8%) remain largely unadopted.

8. **The two-phase pattern is real but the phases differ by population.** All-channel data shows a baseline plateau (2015–2020) then sudden jump (2024–2025). Panel-only data shows a **gradual climb from 2018 onward** with an inflection at 2021. The "sudden jump" in all-channel data is partly an artifact of 2024–2025 being panel-only. The true convergence process is more gradual — consistent with a diffusion-of-innovation model.

9. **The expanded MrBeast reference (309 vs. 102) reveals MrBeast's own evolution.** His thumbnail mean dropped from 6.13 → 5.42 and title mean from 5.23 → 4.95 because early-era (2015–2016) content used text overlays, had lower brightness, and fewer signature traits. The field has closed ~53% of the gap for thumbnails and ~37% combined.

10. **Effect size is small but meaningful (Cohen's d = 0.37).** This is expected for a population-level cultural drift. The convergence is not that every thumbnail now looks like MrBeast, but that the *distribution* has shifted — more thumbnails pass more MrBeast-like criteria, more often, across more channels.

#### What the data doesn't show

1. **Causation.** The convergence could reflect MrBeast's influence, or both MrBeast and other creators could be independently responding to the same YouTube algorithm pressures, audience preferences, or thumbnail design tools.

2. **Brightness convergence.** Unlike every other feature, brightness has *not* consistently converged. Creators may use darker/moodier palettes as a deliberate differentiator.

3. **Strong title convergence on MrBeast's core patterns.** Challenge framing (39.8% vs. 13.3%) and heavy numeric usage (67.3% vs. 32.6%) remain largely unadopted. Title convergence is selective: creators adopt easy patterns (first-person, dollar amounts, simpler words) while skipping those that require content-level changes.

#### Remaining methodological caveats

- **No engagement data.** We have no views or CTR data, so we cannot test whether convergence toward MrBeast's style correlates with performance — a key question for the influence hypothesis.
- **Sparse early data for some channels.** JiDion (n=2 in 2019), Ryan Trahan (n=1 in 2015), and several others have very low sample sizes in early years, making their starting points unreliable for slope calculation.
- **Low R² values.** Year explains only 0.5–1.7% of score variance. Individual thumbnail variation dominates. The convergence is a statistically robust but small population-level shift, not a dramatic transformation.
- **Panel selection bias.** The 22 panel channels were chosen as entertainment-focused creators likely to share MrBeast's competitive space. The higher convergence rate among panel channels may partly reflect this selection.

---

## Data Gaps & Next Steps

### Completed (Feb 16, 2026)

1. ~~**Ingest new thumbnails into DB**~~ — Done. 1,125 new records ingested (0 errors). DB at 5,371.
2. ~~**Run feature extraction**~~ — Done. 1,125 thumbnails processed (100% pipeline completion).
3. ~~**Re-run clustering**~~ — Done. 5,369/5,371 thumbnails clustered into 3 clusters.
4. ~~**Collect historical years for 11 panel channels**~~ — Done. 1,266 thumbnails collected via YouTube API for Dude Perfect, Smosh, GMM, Markiplier, PewDiePie, VanossGaming, Sidemen, Unspeakable, Ryan Trahan, David Dobrik, JiDion (2015–2023). Then ingested (1,175 new records), extracted features, and re-clustered.
5. ~~**Title feature extraction**~~ — Done. 15 title features extracted from all 6,546 records (pure string processing, 37s, zero errors). Title likeness scoring (0–9, including money reference detection), combined likeness (0–17), and channel-evolution title slopes all computed. New endpoints: `/stats/title-likeness`, `/stats/combined-likeness`. Channel evolution extended with `title_slope` and `combined_slope`. Frontend updated with title likeness charts, combined score visualization, and title slopes in evolution page.

### Completed (Feb 17, 2026)

6. ~~**Collect MrBeast reference set via API**~~ — Done. 207 thumbnails collected across 5 eras (1,111 quota units). Total MrBeast in DB: 309. Era breakdown: early 30, growth 40, mainstream 50, peak 41, current 46. Peak and current fell short of targets (60/70) because fewer long-form videos available (Shorts filtered). All 309 records now have features extracted, title features, and cluster assignments. MrBeast centroid recalculated across all scoring methods.

7. ~~**Re-run full pipeline**~~ — Done. Auto-ingested and auto-extracted on server startup. Re-clustered 6,751 records into 3 clusters. All analysis tables updated with expanded MrBeast reference (N=309).

### Completed (Feb 17, 2026 — continued)

8. ~~**Panel-only reanalysis**~~ — Done. Added `panel_only` query parameter to 5 backend endpoints (`mrbeast-likeness`, `title-likeness`, `combined-likeness`, `mrbeast-similarity`, `channel-evolution`). Panel channel list loaded from `scripts/channels.json` (22 channels). Frontend toggle on Likeness and Evolution pages. **Key finding:** 2023 anomaly resolved — panel-only 2023 mean is 4.35 (vs. all-channel 3.64). Panel convergence slope is 2.5x steeper than all-channel.

9. ~~**Statistical testing**~~ — Done. New `GET /stats/convergence-tests` endpoint computing Welch's t-test, one-way ANOVA, Cohen's d, linear regression, and per-year 95% confidence intervals. Supports `panel_only` filter. **Key results:** All tests significant (p < 10⁻⁸). Cohen's d = 0.37 (small). Regression slope = +0.058/yr all-channel, +0.105/yr panel-only. Frontend `ConvergenceTestsResponse` type and `getConvergenceTests()` API function added.

10. ~~**Weighted likeness score**~~ — Done. New `_derive_feature_weights()` function computes |MrBeast mean − field mean| / field std for each of 8 criteria features. New `GET /stats/weighted-likeness` endpoint. Smile (0.515) and brightness (0.471) are most discriminative. Frontend `WeightedLikenessResponse` type and `getWeightedLikeness()` API function added. Feature weights bar chart and weighted vs. unweighted comparison on Likeness page.

11. ~~**Convergence visualizations**~~ — Done. New `/convergence` page with: (1) 4-card statistical evidence summary, (2) trendline with 95% CI bands, (3) gap-closing multi-line chart (|year − MrBeast| per feature), (4) weighted vs. similarity comparison. Heatmap on Evolution page (channels × years, color-coded blue→red). Dual-axis chart on Likeness page (thumbnail left Y, title right Y). Nav link added.

### Remaining Steps

12. **Before/after thumbnail galleries** — For the top 5 convergers (Danny Duncan, FaZe Rug, ZHC, Sidemen, SSSniperWolf), show a 2×N grid: row 1 = earliest year thumbnails, row 2 = latest year thumbnails.

13. **Feature distribution ridgeline plots** — Show how each feature's distribution shifts over time. For face count or smile score, the distribution should visibly migrate rightward (toward MrBeast) across years.

14. **Per-channel trajectory sparklines** — Small multiples showing each panel channel's score trajectory (2015–2025) with a MrBeast reference line. Sort by slope.

### API Quota Budget

| Task | Status | Quota Used |
|------|--------|------------|
| Panel channel collection (Feb 15–16) | Complete | ~5,000 |
| MrBeast era collection (Feb 17) | Complete | 1,111 |
| **Total used** | | **~6,111** |
| **Remaining daily budget** | | **~3,889** |
