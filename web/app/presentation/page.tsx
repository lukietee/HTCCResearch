'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Cell, Area, AreaChart,
} from 'recharts';
import {
  getOverviewStats,
  getMrBeastLikeness,
  getMrBeastSimilarity,
  compareGroups,
  getClusteringPoints,
  getChannelEvolution,
  getWeightedLikeness,
  getConvergenceTests,
  getTitleLikeness,
} from '@/lib/api';
import { getGroupColor, YEAR_GROUPS } from '@/lib/constants';
import type {
  OverviewStats,
  MrBeastSimilarityResponse,
  ClusterPoint,
  CompareStats,
  ConvergenceTestsResponse,
  TitleLikenessResponse,
  WeightedLikenessResponse,
} from '@/lib/types';

const TOTAL_SLIDES = 19;

const CASE_STUDY_CHANNELS = ['Danny Duncan', 'ZHC', 'FaZe Rug', 'Sidemen'];
const CASE_STUDY_COLORS = ['#e6194b', '#f58231', '#3cb44b', '#4363d8'];

// ─── Slide wrapper ───────────────────────────────────────────────
function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-8 py-6">
      {children}
    </div>
  );
}

function SlideTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{children}</h2>;
}

function SlideSubtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-lg text-gray-500 mb-8 text-center max-w-3xl">{children}</p>;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 text-center min-w-[160px]">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-lg text-gray-700 max-w-2xl">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="text-blue-500 mt-1.5 text-xs">&#9679;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function PresentationPage() {
  const [slide, setSlide] = useState(0);

  // API data
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [likeness, setLikeness] = useState<Record<string, { count: number; mean_score: number; median_score: number }> | null>(null);
  const [similarity, setSimilarity] = useState<MrBeastSimilarityResponse | null>(null);
  const [faceCompare, setFaceCompare] = useState<CompareStats | null>(null);
  const [clusterPoints, setClusterPoints] = useState<ClusterPoint[]>([]);
  const [evolution, setEvolution] = useState<{
    channels: Record<string, { num_years: number; years: Record<string, { count: number; mean_score: number }> }>;
    trends: Array<{ channel: string; slope: number; start_score: number; end_score: number; num_years: number }>;
    summary: { converging_toward_mrbeast: number; diverging_from_mrbeast: number; avg_slope: number };
  } | null>(null);
  const [weighted, setWeighted] = useState<WeightedLikenessResponse | null>(null);
  const [convergence, setConvergence] = useState<ConvergenceTestsResponse | null>(null);
  const [titleData, setTitleData] = useState<TitleLikenessResponse | null>(null);

  useEffect(() => {
    getOverviewStats().then(setOverview).catch(() => {});
    getMrBeastLikeness(true).then((d) => setLikeness(d.groups)).catch(() => {});
    getMrBeastSimilarity(true).then(setSimilarity).catch(() => {});
    compareGroups('face_count').then(setFaceCompare).catch(() => {});
    getClusteringPoints().then(setClusterPoints).catch(() => {});
    getChannelEvolution(3, true).then((d) => setEvolution({ channels: d.channels, trends: d.trends, summary: d.summary })).catch(() => {});
    getWeightedLikeness(true).then(setWeighted).catch(() => {});
    getConvergenceTests(true).then(setConvergence).catch(() => {});
    getTitleLikeness(true).then(setTitleData).catch(() => {});
  }, []);

  const goNext = useCallback(() => setSlide((s) => Math.min(s + 1, TOTAL_SLIDES - 1)), []);
  const goPrev = useCallback(() => setSlide((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  // ─── Derived chart data ──────────────────────────────────────

  // Weighted likeness by year (primary metric)
  const weightedChartData = weighted
    ? YEAR_GROUPS.map((g) => ({
        group: g,
        mean: weighted.groups[g]?.normalized_mean ?? 0,
      }))
    : [];

  // Binary likeness (secondary reference)
  const likenessChartData = likeness
    ? YEAR_GROUPS.map((g) => ({ group: g, mean: likeness[g]?.mean_score ?? 0 }))
    : [];

  const similarityChartData = similarity
    ? YEAR_GROUPS.map((g) => ({ group: g, similarity: similarity.groups[g]?.mean_similarity ?? 0 }))
    : [];

  const faceChartData = faceCompare
    ? YEAR_GROUPS.map((g) => ({ group: g, mean: faceCompare.groups[g]?.mean ?? 0 }))
    : [];

  const topConvergers = evolution
    ? [...evolution.trends].sort((a, b) => b.slope - a.slope).slice(0, 10)
    : [];

  // Case study data: per-year scores for specific channels
  const caseStudyData = evolution?.channels
    ? YEAR_GROUPS.map((year) => {
        const point: Record<string, string | number> = { year };
        CASE_STUDY_CHANNELS.forEach((ch) => {
          const chData = evolution.channels[ch];
          if (chData?.years[year]) {
            point[ch] = chData.years[year].mean_score;
          }
        });
        return point;
      }).filter((d) => CASE_STUDY_CHANNELS.some((ch) => ch in d))
    : [];

  const weightFeatureChartData = weighted
    ? Object.entries(weighted.weights)
        .sort(([, a], [, b]) => b - a)
        .map(([feat, w]) => ({ feature: feat.replace(/_/g, ' '), weight: Number(w.toFixed(3)) }))
    : [];

  const ciChartData = convergence?.year_confidence_intervals
    ? YEAR_GROUPS.map((g) => {
        const ci = convergence.year_confidence_intervals[g];
        return ci ? { group: g, mean: ci.mean, ciLow: ci.ci_low, ciHigh: ci.ci_high } : null;
      }).filter(Boolean) as Array<{ group: string; mean: number; ciLow: number; ciHigh: number }>
    : [];

  const titleChartData = titleData
    ? YEAR_GROUPS.map((g) => ({ group: g, mean: titleData.groups[g]?.mean_score ?? 0 }))
    : [];

  // ─── Slides ──────────────────────────────────────────────────
  const slides: React.ReactNode[] = [
    // 0 — Title
    <Slide key={0}>
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Clicking Toward Conformity
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
          Quantifying the Convergence of YouTube Thumbnail Design<br />
          Toward MrBeast&apos;s Visual Formula (2015&ndash;2025)
        </p>
        <div className="flex justify-center gap-8 text-gray-500 text-lg">
          <span>Lucas Trinh</span>
          <span>&amp;</span>
          <span>Zachary Chen</span>
        </div>
        <p className="text-gray-400 mt-4">2026 HTCC Conference</p>
      </div>
    </Slide>,

    // 1 — Research Questions
    <Slide key={1}>
      <SlideTitle>Research Questions</SlideTitle>
      <BulletList items={[
        'Has YouTube thumbnail design converged toward MrBeast\'s visual style over 2015\u20132025?',
        'Which visual features changed most over time?',
        'Do modern thumbnails cluster closer to MrBeast\u2019s than historical ones?',
        'Is the shift statistically significant \u2014 or just noise?',
      ]} />
    </Slide>,

    // 2 — Why MrBeast?
    <Slide key={2}>
      <SlideTitle>Why MrBeast?</SlideTitle>
      <SlideSubtitle>Most subscribed individual creator (~300M+). Pioneered a distinct, widely-imitated thumbnail formula.</SlideSubtitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Brightness" value="0.658" sub="+15.5% vs 2015" />
        <StatCard label="Face Count" value="1.37" sub="+75.6% vs 2015" />
        <StatCard label="Smile Score" value="0.443" sub="+66.9% vs 2015" />
        <StatCard label="Body Coverage" value="0.413" sub="+74.3% vs 2015" />
      </div>
      <p className="text-gray-500 mt-6 text-center text-lg italic">&ldquo;Big faces, big expressions, bright colors.&rdquo;</p>
    </Slide>,

    // 3 — Dataset Overview
    <Slide key={3}>
      <SlideTitle>Dataset Overview</SlideTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Thumbnails" value={overview ? overview.total_thumbnails.toLocaleString() : '...'} />
        <StatCard label="Visual Features" value="14" />
        <StatCard label="Title Features" value="9" />
        <StatCard label="MrBeast Reference" value="309" sub="5 eras, 2015\u20132025" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Panel Channels" value="22" sub="Entertainment focus" />
        <StatCard label="Time Span" value="11 years" sub="2015\u20132025" />
        <StatCard label="Features Extracted" value={overview ? `${overview.features_extracted.toLocaleString()}` : '...'} />
      </div>
    </Slide>,

    // 4 — Methodology: Feature Extraction
    <Slide key={4}>
      <SlideTitle>Methodology: Feature Extraction</SlideTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {[
          { title: 'Color Analysis', desc: 'Saturation, brightness, hue distribution, warm/cool scoring', tool: 'OpenCV, PIL, NumPy' },
          { title: 'Face & Emotion', desc: 'Face count, face size, smile, brow raise, mouth open proxies', tool: 'MediaPipe FaceMesh' },
          { title: 'Pose Detection', desc: 'Body coverage, hand visibility, people count, orientation', tool: 'MediaPipe Pose' },
          { title: 'Text Detection', desc: 'Text area ratio, box count, spatial placement', tool: 'PyTesseract OCR' },
          { title: 'Depth Estimation', desc: 'Foreground/background separation, depth contrast, subject center', tool: 'MiDaS / PyTorch' },
          { title: 'Title Analysis', desc: 'Word count, numbers, money refs, challenge framing, superlatives', tool: 'NLP / Regex' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
            <p className="text-xs text-blue-500 mt-2">{item.tool}</p>
          </div>
        ))}
      </div>
    </Slide>,

    // 5 — Methodology: Scoring Systems
    <Slide key={5}>
      <SlideTitle>Scoring Systems</SlideTitle>
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
          <h3 className="font-semibold text-gray-900 text-lg">Weighted Likeness (Primary)</h3>
          <p className="text-sm text-gray-600 mt-2">Data-derived weights per feature based on discriminative power (z-score separation from MrBeast). Captures gradual shifts that binary scoring misses. Features weighted by importance: smile (0.442), brightness (0.441), brow raise (0.270), body coverage (0.182).</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-900 text-lg">Continuous Similarity (0&ndash;100%)</h3>
          <p className="text-sm text-gray-600 mt-2">Z-score distance from MrBeast centroid across 10 discriminative features with exponential decay mapping</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-gray-900 text-lg">Binary Likeness (0&ndash;8 pts, Reference)</h3>
          <p className="text-sm text-gray-600 mt-2">+1 for each threshold met: brightness &ge; 0.60, face count &ge; 1, text area &le; 0.005, smile &ge; 0.40, mouth open &ge; 0.15, body coverage &ge; 0.30, brow raise &ge; 0.30, face area &ge; 0.06</p>
        </div>
      </div>
    </Slide>,

    // 6 — The MrBeast Formula
    <Slide key={6}>
      <SlideTitle>The MrBeast Formula vs. 2015 Baseline</SlideTitle>
      <div className="overflow-x-auto w-full max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="py-3 px-4 text-sm font-semibold text-gray-600">Feature</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">MrBeast</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">2015</th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Face Count', '1.37', '0.78', '+75.6%'],
              ['Body Coverage', '0.413', '0.237', '+74.3%'],
              ['Smile Score', '0.443', '0.266', '+66.9%'],
              ['Mouth Open', '0.175', '0.105', '+66.7%'],
              ['Brow Raise', '0.332', '0.209', '+58.7%'],
              ['Largest Face Size', '0.087', '0.058', '+50.5%'],
              ['Brightness', '0.658', '0.570', '+15.5%'],
            ].map(([feat, mb, base, change]) => (
              <tr key={feat} className="border-b border-gray-200">
                <td className="py-2.5 px-4 text-gray-800">{feat}</td>
                <td className="py-2.5 px-4 text-right font-mono font-semibold text-red-600">{mb}</td>
                <td className="py-2.5 px-4 text-right font-mono text-gray-500">{base}</td>
                <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-600">{change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Slide>,

    // 7 — Weighted Likeness Over Time (PRIMARY METRIC)
    <Slide key={7}>
      <SlideTitle>Weighted Likeness Over Time (Panel Only)</SlideTitle>
      <SlideSubtitle>Normalized weighted score by year. Features weighted by discriminative power &mdash; captures gradual convergence that binary scoring misses.</SlideSubtitle>
      {weightedChartData.length > 0 ? (
        <div className="w-full max-w-3xl h-[350px]">
          <ResponsiveContainer>
            <BarChart data={weightedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
              <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
              <Bar dataKey="mean" name="Weighted Likeness (normalized)">
                {weightedChartData.map((d) => (
                  <Cell key={d.group} fill={getGroupColor(d.group)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      {weighted && (
        <div className="flex gap-6 mt-4">
          <StatCard label="Max Possible" value={weighted.max_possible_score.toFixed(2)} sub="weighted points" />
          <StatCard
            label="MrBeast Mean"
            value={weighted.groups['mrbeast'] ? `${(weighted.groups['mrbeast'].normalized_mean * 100).toFixed(1)}%` : '...'}
          />
        </div>
      )}
    </Slide>,

    // 8 — Binary Likeness (secondary reference)
    <Slide key={8}>
      <SlideTitle>Binary Likeness Score (Reference)</SlideTitle>
      <SlideSubtitle>Simple 0&ndash;8 threshold scoring. Shows the same upward trend but with less sensitivity to gradual change.</SlideSubtitle>
      {likenessChartData.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <BarChart data={likenessChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <Bar dataKey="mean" name="Mean Likeness">
                {likenessChartData.map((d) => (
                  <Cell key={d.group} fill={getGroupColor(d.group)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-6 mt-4">
        <StatCard label="2015 Baseline" value="3.59" />
        <StatCard label="2024 Peak" value="4.58" sub="+23% increase" />
      </div>
    </Slide>,

    // 9 — Continuous Similarity Trend
    <Slide key={9}>
      <SlideTitle>Continuous Similarity Trend (Panel Only)</SlideTitle>
      <SlideSubtitle>Mean z-score similarity to MrBeast centroid (0&ndash;100%)</SlideSubtitle>
      {similarityChartData.length > 0 ? (
        <div className="w-full max-w-3xl h-[350px]">
          <ResponsiveContainer>
            <LineChart data={similarityChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis domain={[50, 80]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Line type="monotone" dataKey="similarity" stroke="#e6194b" strokeWidth={3} dot={{ r: 5 }} name="Similarity %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-6 mt-4">
        <StatCard label="2015" value="63.7%" />
        <StatCard label="2025" value="67.9%" />
      </div>
    </Slide>,

    // 10 — Feature-Level Convergence
    <Slide key={10}>
      <SlideTitle>Feature-Level Convergence</SlideTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Features Moving Toward MrBeast</h3>
          <BulletList items={[
            'Face count: nearly closed the gap entirely',
            'Smile score: +18.9 percentage points',
            'Brow raise: 59\u201387% gap closure',
            'Body coverage: significant increase',
            'Mouth open score: +66.7%, matching MrBeast\u2019s expressive style',
          ]} />
        </div>
        {faceChartData.length > 0 && (
          <div className="h-[280px]">
            <p className="text-sm text-gray-500 mb-2 text-center">Mean Face Count by Year</p>
            <ResponsiveContainer>
              <BarChart data={faceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mean" name="Face Count">
                  {faceChartData.map((d) => (
                    <Cell key={d.group} fill={getGroupColor(d.group)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Slide>,

    // 11 — Clustering Analysis
    <Slide key={11}>
      <SlideTitle>Clustering Analysis</SlideTitle>
      <SlideSubtitle>K-means clustering with PCA 2D projection (12 signal-bearing features, depth noise removed). PCA explains 43.2% of variance (up from 33.4% with depth).</SlideSubtitle>
      {clusterPoints.length > 0 ? (
        <div className="w-full max-w-3xl h-[350px]">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="PC1" type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="y" name="PC2" type="number" tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={clusterPoints.map((p) => ({ ...p, fill: getGroupColor(p.group) }))} >
                {clusterPoints.map((p, i) => (
                  <Cell key={i} fill={getGroupColor(p.group)} opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading cluster data...</p>}
      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <StatCard label="Cluster 0 (Modern)" value="59%" sub="of MrBeast in this cluster" />
        <StatCard label="Cluster 1 (Classic)" value="52%" sub="of 2015 here" />
        <StatCard label="Centroid Distance" value="1.05" sub="PCA Euclidean" />
        <StatCard label="PCA Variance" value="43.2%" sub="up from 33.4%" />
      </div>
    </Slide>,

    // 12 — Channel-Level Evolution (slopes)
    <Slide key={12}>
      <SlideTitle>Channel-Level Evolution</SlideTitle>
      <SlideSubtitle>Per-channel likeness trends over time (panel channels, &ge;3 years)</SlideSubtitle>
      {topConvergers.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <BarChart data={topConvergers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="channel" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="slope" name="Slope (pts/yr)" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading evolution data...</p>}
      <div className="flex gap-4 mt-4">
        <StatCard label="Converging" value={evolution ? `${evolution.summary.converging_toward_mrbeast}` : '...'} sub="of panel channels" />
        <StatCard label="Avg Slope" value={evolution ? `+${evolution.summary.avg_slope.toFixed(3)}/yr` : '...'} />
      </div>
    </Slide>,

    // 13 — Case Studies (NEW SLIDE)
    <Slide key={13}>
      <SlideTitle>Case Studies: Individual Channel Trajectories</SlideTitle>
      <SlideSubtitle>Tracking likeness scores year-by-year for top converging channels</SlideSubtitle>
      {caseStudyData.length > 0 ? (
        <div className="w-full max-w-3xl h-[350px]">
          <ResponsiveContainer>
            <LineChart data={caseStudyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              {CASE_STUDY_CHANNELS.map((ch, i) => (
                <Line
                  key={ch}
                  type="monotone"
                  dataKey={ch}
                  stroke={CASE_STUDY_COLORS[i]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  connectNulls
                  name={ch}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading channel data...</p>}
      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        {CASE_STUDY_CHANNELS.map((ch, i) => {
          const trend = evolution?.trends.find((t) => t.channel === ch);
          return (
            <div key={ch} className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CASE_STUDY_COLORS[i] }} />
                <span className="text-sm font-semibold text-gray-700">{ch}</span>
              </div>
              {trend && (
                <p className="text-xs text-gray-500">{trend.start_score.toFixed(1)} &rarr; {trend.end_score.toFixed(1)}</p>
              )}
            </div>
          );
        })}
      </div>
    </Slide>,

    // 14 — Weighted Feature Importance
    <Slide key={14}>
      <SlideTitle>Weighted Feature Importance</SlideTitle>
      <SlideSubtitle>Data-derived weights: how discriminative is each feature?</SlideSubtitle>
      {weightFeatureChartData.length > 0 ? (
        <div className="w-full max-w-3xl h-[350px]">
          <ResponsiveContainer>
            <BarChart data={weightFeatureChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 0.6]} />
              <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="weight" name="Weight" fill="#e6194b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading weights...</p>}
      <p className="text-gray-500 mt-3 text-center">Smile (0.442) + Brightness (0.441) = <strong>53%</strong> of total discriminative weight</p>
    </Slide>,

    // 15 — Statistical Validation
    <Slide key={15}>
      <SlideTitle>Statistical Validation</SlideTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Welch's t-test"
          value={convergence?.ttest ? `t = ${convergence.ttest.t_statistic.toFixed(2)}` : '...'}
          sub={convergence?.ttest ? `p = ${convergence.ttest.p_value.toExponential(2)}` : ''}
        />
        <StatCard
          label="ANOVA"
          value={convergence?.anova ? `F = ${convergence.anova.f_statistic.toFixed(2)}` : '...'}
          sub={convergence?.anova ? `p = ${convergence.anova.p_value.toExponential(2)}` : ''}
        />
        <StatCard
          label="Linear Regression"
          value={convergence?.linear_regression ? `slope = +${convergence.linear_regression.slope.toFixed(3)}/yr` : '...'}
          sub={convergence?.linear_regression ? `p = ${convergence.linear_regression.p_value.toExponential(2)}` : ''}
        />
        <StatCard
          label="Cohen's d"
          value={convergence?.cohens_d ? convergence.cohens_d.d.toFixed(2) : '...'}
          sub={convergence?.cohens_d?.interpretation || ''}
        />
      </div>
      {ciChartData.length > 0 && (
        <div className="w-full max-w-3xl h-[280px]">
          <p className="text-sm text-gray-500 mb-2 text-center">Mean Likeness with 95% Confidence Intervals</p>
          <ResponsiveContainer>
            <AreaChart data={ciChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis domain={[2, 6]} />
              <Tooltip />
              <Area type="monotone" dataKey="ciHigh" stroke="none" fill="#e6194b" fillOpacity={0.15} name="CI High" />
              <Area type="monotone" dataKey="ciLow" stroke="none" fill="#ffffff" fillOpacity={1} name="CI Low" />
              <Line type="monotone" dataKey="mean" stroke="#e6194b" strokeWidth={2} dot={{ r: 4 }} name="Mean" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Slide>,

    // 16 — Title Convergence
    <Slide key={16}>
      <SlideTitle>Title Convergence</SlideTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Key Findings</h3>
          <BulletList items={[
            'Title likeness +14.6% (vs +27% for thumbnails)',
            'First-person framing reached parity (25.4% vs 25.9%)',
            'Money references: 5x increase (2.3% \u2192 11.8%)',
            'Challenge framing largely unadopted (13.3% vs 39.8%)',
            'Numeric hooks still far behind (32.6% vs 67.3%)',
          ]} />
        </div>
        {titleChartData.length > 0 && (
          <div className="h-[280px]">
            <p className="text-sm text-gray-500 mb-2 text-center">Mean Title Likeness by Year</p>
            <ResponsiveContainer>
              <BarChart data={titleChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 9]} />
                <Tooltip />
                <Bar dataKey="mean" name="Title Likeness">
                  {titleChartData.map((d) => (
                    <Cell key={d.group} fill={getGroupColor(d.group)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Slide>,

    // 17 — Diffusion of Innovation
    <Slide key={17}>
      <SlideTitle>Diffusion of Innovation Model</SlideTitle>
      <div className="max-w-3xl w-full space-y-4">
        {[
          { phase: 'Innovators', years: '2015\u20132017', desc: 'MrBeast pioneering the bright, face-forward, expressive formula', color: '#e6194b' },
          { phase: 'Early Adopters', years: '2018\u20132019', desc: 'David Dobrik, ZHC, Ryan Trahan begin experimenting', color: '#f58231' },
          { phase: 'Early Majority', years: '2020\u20132022', desc: 'Broad panel adoption; inflection point in convergence data', color: '#3cb44b' },
          { phase: 'Late Majority', years: '2023\u20132025', desc: 'Near-ubiquitous among entertainment channels', color: '#4363d8' },
          { phase: 'Laggards / Resisters', years: 'Ongoing', desc: 'PewDiePie (stable), Markiplier (diverging), genre-locked channels (Kurzgesagt, CinemaSins)', color: '#911eb4' },
        ].map((item) => (
          <div key={item.phase} className="flex items-center gap-4 bg-white rounded-lg shadow p-4">
            <div className="w-3 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-semibold text-gray-900">{item.phase}</span>
                <span className="text-sm text-gray-400">{item.years}</span>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Slide>,

    // 18 — Limitations
    <Slide key={18}>
      <SlideTitle>Limitations &amp; Conclusions</SlideTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Limitations</h3>
          <BulletList items={[
            'No engagement data (views/CTR not linked)',
            'Low R\u00B2 (0.5\u20131.7%) \u2014 individual variation dominates',
            'Cannot prove causation \u2014 algorithm, tools, audience all plausible',
            'Panel selection bias toward entertainment',
          ]} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Conclusions</h3>
          <BulletList items={[
            'Convergence is statistically significant (p < 10\u207B\u00B9\u2070, slope +0.105/yr)',
            '73% of panel channels converge (avg slope +0.127/yr)',
            'Multi-dimensional shift: face, smile, brow, body coverage',
            'Smile + brightness = 53% of discriminative weight',
          ]} />
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-xl text-gray-600">Thank You</p>
        <p className="text-gray-400 mt-2">Lucas Trinh &amp; Zachary Chen &middot; 2026 HTCC Conference</p>
      </div>
    </Slide>,
  ];

  return (
    <div className="relative min-h-[80vh] select-none">
      {/* Slide content */}
      <div className="transition-opacity duration-300">
        {slides[slide]}
      </div>

      {/* Navigation controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/90 backdrop-blur rounded-full shadow-lg px-6 py-3 z-50">
        <button
          onClick={goPrev}
          disabled={slide === 0}
          className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 text-xl font-bold transition-colors"
          aria-label="Previous slide"
        >
          &larr;
        </button>
        <span className="text-sm text-gray-500 font-mono min-w-[60px] text-center">
          {slide + 1} / {TOTAL_SLIDES}
        </span>
        <button
          onClick={goNext}
          disabled={slide === TOTAL_SLIDES - 1}
          className="text-gray-600 hover:text-gray-900 disabled:text-gray-300 text-xl font-bold transition-colors"
          aria-label="Next slide"
        >
          &rarr;
        </button>
      </div>

      {/* Keyboard hint */}
      {slide === 0 && (
        <p className="text-center text-gray-300 text-xs mt-4">Use arrow keys or click to navigate</p>
      )}
    </div>
  );
}
