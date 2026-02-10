# The MrBeast Effect: A Computational Analysis of YouTube Thumbnail Evolution (2014–2025)

## Overview

This research project investigates how YouTube thumbnail design has evolved over the past decade, with a particular focus on the influence of MrBeast’s distinctive visual style. By applying computational vision techniques to large thumbnail datasets, the study examines whether modern trending thumbnails have converged toward stylistic features popularized by MrBeast.

The project is designed as an empirical, data-driven analysis suitable for academic research, including conference submission and reproducibility.

## Research Questions

* How did MrBeast’s thumbnail style influence broader YouTube thumbnail design?
* Did visual attributes such as color, composition, facial expressions, or depth change over time?
* Do modern thumbnails cluster closer to MrBeast thumbnails than historical ones?
* Which visual features are most strongly associated with high-performing videos?

## Datasets

The analysis uses three curated thumbnail datasets:

* **MrBeast thumbnails:** 100 videos from 2018–2025
* **Modern trending thumbnails:** 100 recent trending videos
* **Historical trending thumbnails:** 100 trending videos from approximately 10 years ago

All images are stored locally and processed uniformly to ensure fair comparison across groups.

## Analysis Pipeline

The computational pipeline extracts visual features using Python-based computer vision tools:

### Color Analysis

* Dominant color palette extraction
* Average saturation and hue distribution
* Warm vs. cool color temperature
* Implemented using K-means clustering with PIL, NumPy, and SciPy

### Depth and Composition

* Depth map generation to analyze foreground vs. background separation
* Subject placement and emphasis
* Implemented using depth estimation APIs and OpenCV

### Face and Pose Detection

* Face detection and landmark extraction
* Face size and close-up frequency
* Basic emotional signals (smiling, shocked, angry)
* Hand visibility and pose orientation
* Implemented using MediaPipe FaceMesh and Pose

### Text Detection

* Optical character recognition (OCR) to detect text presence
* Measurement of text quantity and placement
* Implemented using PyTesseract and OpenCV

## Feature Measurements

Potential measurements include:

* **Color:** saturation, hue distribution, dominant palettes
* **Composition:** depth separation, number of people, foreground emphasis
* **Faces and Poses:** face count, emotional expression, hand visibility
* **Text:** presence, amount, spatial placement

## Methods

* **Clustering:** K-means clustering across all extracted features to analyze stylistic similarity between groups
* **Correlation Analysis:** Comparison of visual features with performance metrics such as views or click-through rate (when available)

## Visualizations

The project generates multiple plots and figures, including:

* Cluster visualizations across thumbnail groups
* Color palette comparisons
* Depth map visualizations
* Face, pose, and emotion frequency graphs
* Text usage distributions
* Correlation tables of visual features vs. performance

## Expected Outcomes

* Modern thumbnails will exhibit higher saturation, more prominent faces, clearer depth separation, and reduced text
* Most modern thumbnails will cluster closer to MrBeast’s visual style
* High-performing thumbnails are expected to favor bright colors, close-up faces, strong emotional cues, and simple compositions

## Tools and Technologies

* Python
* OpenCV
* MediaPipe
* NumPy / SciPy
* PIL
* PyTesseract
* K-means clustering


## Academic Context

This project is intended for conference submission and contributes to research on computational media analysis, platform-driven aesthetics, and algorithmic influence on creator behavior.

## References

A full reference list is included in the research proposal and final paper.
