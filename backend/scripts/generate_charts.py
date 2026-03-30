"""Generate chart PNGs from API data for the README."""
import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
from pathlib import Path

API = "http://localhost:8000"
OUT = Path(__file__).parent.parent.parent / "assets"
OUT.mkdir(exist_ok=True)

YEARS = ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025']
COLORS = ['#3CB44B','#4363D8','#F58231','#911EB4','#42D4F4','#F032E6','#BFEF45','#FABED4','#469990','#DCBEFF','#000075']

plt.rcParams.update({
    'figure.facecolor': 'white',
    'axes.facecolor': '#FAFAFA',
    'font.family': 'sans-serif',
    'font.size': 11,
    'axes.grid': True,
    'grid.alpha': 0.3,
})


def fetch(endpoint):
    return requests.get(f"{API}{endpoint}", timeout=30).json()


def save(fig, name):
    fig.savefig(OUT / name, dpi=150, bbox_inches='tight', pad_inches=0.3)
    plt.close(fig)
    print(f"  Saved: {name}")


def chart_weighted_likeness():
    d = fetch("/stats/weighted-likeness?panel_only=true")
    vals = [d['groups'].get(y, {}).get('normalized_mean', 0) * 100 for y in YEARS]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(YEARS, vals, color=COLORS, edgecolor='white', linewidth=0.5)
    ax.set_ylabel('Weighted Likeness (%)')
    ax.set_title('Weighted Likeness Over Time (Panel Only)', fontsize=14, fontweight='bold')
    ax.set_ylim(0, 80)
    ax.yaxis.set_major_formatter(ticker.PercentFormatter())

    # Add MrBeast reference line
    mb = d['groups'].get('mrbeast', {}).get('normalized_mean', 0) * 100
    ax.axhline(y=mb, color='#E6194B', linestyle='--', linewidth=1.5, label=f'MrBeast avg ({mb:.0f}%)')
    ax.legend()
    save(fig, 'weighted_likeness.png')


def chart_gap_closure():
    features = [
        ("face.face_count", "Face Count"),
        ("face.largest_face_area_ratio", "Face Size"),
        ("pose.body_coverage", "Body Coverage"),
        ("face.emotion_proxies.mouth_open_score", "Mouth Open"),
        ("face.emotion_proxies.smile_score", "Smile Score"),
        ("face.emotion_proxies.brow_raise_score", "Brow Raise"),
        ("color.avg_brightness", "Brightness"),
    ]
    data = []
    for path, label in features:
        d = fetch(f"/stats/compare?feature={path}")
        mb = d['groups'].get('mrbeast', {}).get('mean', 0)
        y15 = d['groups'].get('2015', {}).get('mean', 0)
        y25 = d['groups'].get('2025', {}).get('mean', 0)
        gap = mb - y15
        closure = round(((y25 - y15) / gap) * 100) if abs(gap) > 0.001 else 0
        data.append((label, closure))
    data.sort(key=lambda x: -x[1])

    fig, ax = plt.subplots(figsize=(10, 5))
    labels = [d[0] for d in data]
    vals = [d[1] for d in data]
    colors = ['#E6194B' if v >= 90 else '#3B82F6' if v >= 50 else '#9CA3AF' for v in vals]
    bars = ax.barh(labels[::-1], vals[::-1], color=colors[::-1], edgecolor='white')
    ax.set_xlabel('Gap Closed (%)')
    ax.set_title('Gap Closure: 2015 → 2025 (Panel Only)', fontsize=14, fontweight='bold')
    ax.set_xlim(0, 110)
    for bar, val in zip(bars, vals[::-1]):
        ax.text(bar.get_width() + 2, bar.get_y() + bar.get_height()/2, f'{val}%',
                va='center', fontsize=10, fontweight='bold')
    save(fig, 'gap_closure.png')


def chart_similarity_trend():
    d = fetch("/stats/mrbeast-similarity?panel_only=true")
    vals = [d['groups'].get(y, {}).get('mean_similarity', 0) for y in YEARS]

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.plot(YEARS, vals, color='#E6194B', linewidth=2.5, marker='o', markersize=6)
    ax.fill_between(YEARS, vals, alpha=0.1, color='#E6194B')
    ax.set_ylabel('Similarity to MrBeast (%)')
    ax.set_title('Continuous Similarity Trend (Panel Only)', fontsize=14, fontweight='bold')
    ax.set_ylim(55, 75)
    ax.yaxis.set_major_formatter(ticker.PercentFormatter())
    save(fig, 'similarity_trend.png')


def chart_case_studies():
    d = fetch("/stats/channel-evolution?min_years=3&panel_only=true")
    channels = {
        'Danny Duncan': '#E6194B',
        'ZHC': '#F58231',
        'FaZe Rug': '#3CB44B',
        'Sidemen': '#4363D8',
    }

    fig, ax = plt.subplots(figsize=(10, 5))
    for ch, color in channels.items():
        if ch in d['channels']:
            years = sorted(d['channels'][ch]['years'].keys())
            scores = [d['channels'][ch]['years'][y]['mean_score'] for y in years]
            ax.plot(years, scores, color=color, linewidth=2.5, marker='o', markersize=5, label=ch)

    ax.axhline(y=5.42, color='gray', linestyle='--', linewidth=1, alpha=0.7, label='MrBeast avg (5.42)')
    ax.set_ylabel('Likeness Score (0-8)')
    ax.set_title('Case Study: Channel Trajectories Over Time', fontsize=14, fontweight='bold')
    ax.set_ylim(0, 8)
    ax.legend(loc='upper left')
    save(fig, 'case_studies.png')


def chart_channel_evolution():
    d = fetch("/stats/channel-evolution?min_years=3&panel_only=true")
    trends = sorted(d['trends'], key=lambda x: -x['slope'])[:12]

    fig, ax = plt.subplots(figsize=(10, 5))
    names = [t['channel'] for t in trends][::-1]
    slopes = [t['slope'] for t in trends][::-1]
    colors = ['#E6194B' if s > 0.3 else '#3B82F6' if s > 0 else '#9CA3AF' for s in slopes]
    ax.barh(names, slopes, color=colors, edgecolor='white')
    ax.set_xlabel('Convergence Slope (pts/yr)')
    ax.set_title('Channel-Level Convergence Rates', fontsize=14, fontweight='bold')
    ax.axvline(x=0, color='black', linewidth=0.5)
    save(fig, 'channel_evolution.png')


def chart_feature_convergence():
    d = fetch("/stats/compare?feature=face.face_count")
    vals = [d['groups'].get(y, {}).get('mean', 0) for y in YEARS]
    mb = d['groups'].get('mrbeast', {}).get('mean', 0)

    fig, ax = plt.subplots(figsize=(10, 5))
    ax.bar(YEARS, vals, color=COLORS, edgecolor='white', linewidth=0.5)
    ax.axhline(y=mb, color='#E6194B', linestyle='--', linewidth=1.5, label=f'MrBeast ({mb:.2f})')
    ax.set_ylabel('Mean Face Count')
    ax.set_title('Face Count by Year (Panel Only)', fontsize=14, fontweight='bold')
    ax.legend()
    save(fig, 'face_count.png')


if __name__ == "__main__":
    print("Generating charts from API data...")
    chart_weighted_likeness()
    chart_gap_closure()
    chart_similarity_trend()
    chart_case_studies()
    chart_channel_evolution()
    chart_feature_convergence()
    print("Done!")
