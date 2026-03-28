'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Cell, Area, AreaChart, ReferenceLine,
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

const TOTAL_SLIDES = 29;

const CASE_STUDY_CHANNELS = ['Danny Duncan', 'ZHC', 'FaZe Rug', 'Sidemen'];
const CASE_STUDY_COLORS = ['#e6194b', '#f58231', '#3cb44b', '#4363d8'];
const MRBEAST_MEAN_LIKENESS = 5.42;
const EXAMPLE_THUMB = 'http://localhost:8000/static/thumbnails/mrbeast/019_I%20Survived%20100%20Hours%20In%20An%20Ancient%20Temple.jpg';

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

function ThumbOverlay({ children, label }: { children?: React.ReactNode; label?: string }) {
  return (
    <div className="relative inline-block rounded-lg overflow-hidden shadow-lg mb-4" style={{ width: 300 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={EXAMPLE_THUMB} alt="Example MrBeast thumbnail" className="w-full h-auto block" />
      {children}
      {label && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">{label}</div>
      )}
    </div>
  );
}

function CodeBlock({ lines }: { lines: Array<{ tokens: Array<{ text: string; color: string }> }> }) {
  return (
    <pre className="bg-[#1e1e2e] p-4 rounded-lg text-[12px] leading-relaxed font-mono whitespace-pre-wrap break-words">
      {lines.map((line, i) => (
        <div key={i}>
          {line.tokens.map((t, j) => (
            <span key={j} style={{ color: t.color }}>{t.text}</span>
          ))}
        </div>
      ))}
    </pre>
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
  const [gapClosureData, setGapClosureData] = useState<Array<{ feature: string; closure2024: number; closure2025: number }>>([]);

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

    // Fetch gap closure data for multiple features
    const gapFeatures = [
      { path: 'face.face_count', label: 'Face Count' },
      { path: 'face.largest_face_area_ratio', label: 'Face Size' },
      { path: 'pose.body_coverage', label: 'Body Coverage' },
      { path: 'face.emotion_proxies.mouth_open_score', label: 'Mouth Open' },
      { path: 'face.emotion_proxies.smile_score', label: 'Smile Score' },
      { path: 'face.emotion_proxies.brow_raise_score', label: 'Brow Raise' },
      { path: 'color.avg_brightness', label: 'Brightness' },
    ];
    Promise.all(gapFeatures.map((f) => compareGroups(f.path))).then((results) => {
      const closures = results.map((r, i) => {
        const mb = r.groups['mrbeast']?.mean ?? 0;
        const y15 = r.groups['2015']?.mean ?? 0;
        const y24 = r.groups['2024']?.mean ?? 0;
        const y25 = r.groups['2025']?.mean ?? 0;
        const gap = mb - y15;
        return {
          feature: gapFeatures[i].label,
          closure2024: Math.abs(gap) > 0.001 ? Math.round(((y24 - y15) / gap) * 100) : 0,
          closure2025: Math.abs(gap) > 0.001 ? Math.round(((y25 - y15) / gap) * 100) : 0,
        };
      });
      closures.sort((a, b) => b.closure2025 - a.closure2025);
      setGapClosureData(closures);
    }).catch(() => {});
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
        <StatCard label="Have a Face" value="81%" sub="vs 60% in 2015" />
        <StatCard label="Are Smiling" value="75%" sub="vs 47% in 2015" />
        <StatCard label="Bright Thumbnails" value="69%" sub="vs 41% in 2015" />
        <StatCard label="Large Body in Frame" value="53%" sub="vs 30% in 2015" />
      </div>
      <p className="text-gray-500 mt-6 text-center text-lg italic">&ldquo;Big faces, big expressions, bright colors.&rdquo;</p>
    </Slide>,

    // 3 — Data Collection Methodology
    <Slide key={3}>
      <SlideTitle>Data Collection</SlideTitle>
      <SlideSubtitle>YouTube Data API v3 &mdash; top 15 most-viewed videos per channel per year, 2015&ndash;2025</SlideSubtitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <CodeBlock lines={[
            { tokens: [{ text: '# YouTube API search by channel + year', color: '#6c7086' }] },
            { tokens: [{ text: 'response', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'youtube.', color: '#cdd6f4' }, { text: 'search', color: '#89b4fa' }, { text: '().', color: '#cdd6f4' }, { text: 'list', color: '#89b4fa' }, { text: '(', color: '#cdd6f4' }] },
            { tokens: [{ text: '  channelId', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: 'channel_id,', color: '#cdd6f4' }] },
            { tokens: [{ text: '  publishedAfter', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: '"2020-01-01"', color: '#a6e3a1' }, { text: ',', color: '#cdd6f4' }] },
            { tokens: [{ text: '  publishedBefore', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: '"2020-12-31"', color: '#a6e3a1' }, { text: ',', color: '#cdd6f4' }] },
            { tokens: [{ text: '  order', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: '"viewCount"', color: '#a6e3a1' }, { text: ',', color: '#cdd6f4' }] },
            { tokens: [{ text: '  maxResults', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: '15', color: '#fab387' }, { text: ')', color: '#cdd6f4' }] },
          ]} />
          <div className="mt-4">
            <BulletList items={[
              '15 thumbnails per channel per year (top by views, Shorts excluded)',
              '22 panel channels tracked across all 11 years',
              '309 MrBeast reference thumbnails (5 eras)',
              'Downloaded at max resolution (1280\u00D7720)',
            ]} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Panel Channels (22)</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Entertainment (14)</span>
              <p className="text-sm text-gray-700">Dude Perfect, PewDiePie, Sidemen, FaZe Rug, Danny Duncan, Logan Paul, KSI, IShowSpeed, Ryan Trahan, Airrack, JiDion, Unspeakable, David Dobrik, Matt Stonie</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Gaming (3)</span>
              <p className="text-sm text-gray-700">Markiplier, VanossGaming, Dream</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Art &amp; Other (3)</span>
              <p className="text-sm text-gray-700">ZHC, Good Mythical Morning, Smosh</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Controls (2)</span>
              <p className="text-sm text-gray-700">Kurzgesagt, CinemaSins</p>
            </div>
          </div>
        </div>
      </div>
    </Slide>,

    // 4 — Dataset Overview
    <Slide key={4}>
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

    // 5 — Color Analysis
    <Slide key={5}>
      <SlideTitle>Feature: Color Analysis</SlideTitle>
      <SlideSubtitle>Converts each thumbnail to HSV color space to measure brightness, saturation, and color temperature.</SlideSubtitle>
      <ThumbOverlay label="brightness: 0.58 | warm_cool: 0.31">
        {/* Color palette swatches */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
          {['#4a6e3a', '#8b7355', '#c8a44e', '#5b8c6e', '#2d3b2a'].map((c) => (
            <div key={c} className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="absolute inset-0 border-4 border-yellow-400/40 rounded-lg pointer-events-none" />
      </ThumbOverlay>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">Each pixel&apos;s hue is classified as warm (reds, oranges: 0&ndash;30 and 150&ndash;179) or cool (greens, blues: 30&ndash;150). The ratio gives a single warm/cool score.</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# Warm/cool color scoring', color: '#6c7086' }] },
            { tokens: [{ text: 'warm', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(hue ', color: '#cdd6f4' }, { text: '<= ', color: '#89dceb' }, { text: '30', color: '#fab387' }, { text: ') ', color: '#cdd6f4' }, { text: '| ', color: '#89dceb' }, { text: '(hue ', color: '#cdd6f4' }, { text: '>= ', color: '#89dceb' }, { text: '150', color: '#fab387' }, { text: ')', color: '#cdd6f4' }] },
            { tokens: [{ text: 'cool', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(hue ', color: '#cdd6f4' }, { text: '> ', color: '#89dceb' }, { text: '30', color: '#fab387' }, { text: ') ', color: '#cdd6f4' }, { text: '& ', color: '#89dceb' }, { text: '(hue ', color: '#cdd6f4' }, { text: '< ', color: '#89dceb' }, { text: '150', color: '#fab387' }, { text: ')', color: '#cdd6f4' }] },
            { tokens: [{ text: 'score', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(warm ', color: '#cdd6f4' }, { text: '- ', color: '#89dceb' }, { text: 'cool) ', color: '#cdd6f4' }, { text: '/ ', color: '#89dceb' }, { text: 'total', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">avg_saturation</code> &mdash; mean color intensity</li>
            <li><code className="text-blue-600">avg_brightness</code> &mdash; mean luminance</li>
            <li><code className="text-blue-600">warm_cool_score</code> &mdash; -1 (cool) to +1 (warm)</li>
            <li><code className="text-blue-600">dominant_palette</code> &mdash; top 5 hex colors</li>
            <li><code className="text-blue-600">hue_hist</code> &mdash; 36-bin hue distribution</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">OpenCV, PIL, NumPy</p>
        </div>
      </div>
    </Slide>,

    // 6 — Face & Emotion Detection
    <Slide key={6}>
      <SlideTitle>Feature: Face &amp; Emotion Detection</SlideTitle>
      <SlideSubtitle>Uses MediaPipe FaceMesh (468 landmarks per face) to detect faces and approximate emotional expressions.</SlideSubtitle>
      <ThumbOverlay label="faces: 1 | mouth_open: 0.62 | brow: 0.71">
        {/* Face bounding box */}
        <div className="absolute border-2 border-green-400/60 rounded" style={{ top: '8%', left: '25%', width: '45%', height: '55%' }}>
          <span className="absolute top-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded">mouth_open: 0.62</span>
          <span className="absolute bottom-1 left-1 text-[9px] bg-green-500 text-white px-1 rounded">brow_raise: 0.71</span>
        </div>
        {/* FaceMesh landmark dots */}
        <svg className="absolute pointer-events-none" style={{ top: '8%', left: '25%', width: '45%', height: '55%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Jaw outline */}
          {[[10,85],[14,82],[18,78],[22,72],[24,65],[25,57],[26,50],[28,44],[32,40],[38,38],[44,37],[50,38],[56,37],[62,38],[68,40],[72,44],[74,50],[75,57],[76,65],[78,72],[82,78],[86,82],[90,85]].map(([x,y],i) => (
            <circle key={`j${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Left eyebrow */}
          {[[22,28],[28,24],[35,22],[42,23],[48,26]].map(([x,y],i) => (
            <circle key={`lb${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Right eyebrow */}
          {[[52,26],[58,23],[65,22],[72,24],[78,28]].map(([x,y],i) => (
            <circle key={`rb${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Left eye */}
          {[[28,35],[32,32],[37,31],[42,32],[44,35],[42,37],[37,38],[32,37]].map(([x,y],i) => (
            <circle key={`le${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Right eye */}
          {[[56,35],[58,32],[63,31],[68,32],[72,35],[68,37],[63,38],[58,37]].map(([x,y],i) => (
            <circle key={`re${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Nose */}
          {[[50,32],[50,38],[50,44],[50,50],[44,52],[47,54],[50,55],[53,54],[56,52]].map(([x,y],i) => (
            <circle key={`n${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Outer mouth */}
          {[[34,62],[38,58],[43,56],[50,57],[57,56],[62,58],[66,62],[62,68],[57,72],[50,73],[43,72],[38,68]].map(([x,y],i) => (
            <circle key={`mo${i}`} cx={x} cy={y} r="0.8" fill="#4ade80" opacity="0.9" />
          ))}
          {/* Inner mouth */}
          {[[38,62],[43,60],[50,61],[57,60],[62,62],[57,66],[50,68],[43,66]].map(([x,y],i) => (
            <circle key={`mi${i}`} cx={x} cy={y} r="0.8" fill="#22d3ee" opacity="0.9" />
          ))}
          {/* Mesh fill - forehead, cheeks, chin area */}
          {[
            [30,30],[35,28],[40,28],[45,28],[55,28],[60,28],[65,28],[70,30],
            [26,40],[30,42],[34,44],[38,46],[42,46],[46,46],[54,46],[58,46],[62,46],[66,44],[70,42],[74,40],
            [28,50],[32,52],[36,54],[40,56],[60,56],[64,54],[68,52],[72,50],
            [30,60],[34,60],[66,60],[70,60],
            [32,70],[36,72],[40,74],[44,76],[50,78],[56,76],[60,74],[64,72],[68,70],
            [36,80],[42,82],[50,84],[58,82],[64,80],
            [25,34],[75,34],[26,44],[74,44],[50,46],
            [34,48],[66,48],[40,64],[60,64],[45,68],[55,68],
          ].map(([x,y],i) => (
            <circle key={`f${i}`} cx={x} cy={y} r="0.6" fill="#4ade80" opacity="0.6" />
          ))}
        </svg>
      </ThumbOverlay>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">Smile is measured by comparing mouth corner height to lip center height, normalized by mouth width. Higher values indicate upturned corners (smiling).</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# Smile from landmark geometry', color: '#6c7086' }] },
            { tokens: [{ text: 'lip_y', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(up_lip.y ', color: '#cdd6f4' }, { text: '+ ', color: '#89dceb' }, { text: 'lo_lip.y) ', color: '#cdd6f4' }, { text: '/ ', color: '#89dceb' }, { text: '2', color: '#fab387' }] },
            { tokens: [{ text: 'corner_y', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(left.y ', color: '#cdd6f4' }, { text: '+ ', color: '#89dceb' }, { text: 'right.y) ', color: '#cdd6f4' }, { text: '/ ', color: '#89dceb' }, { text: '2', color: '#fab387' }] },
            { tokens: [{ text: 'smile', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(lip_y ', color: '#cdd6f4' }, { text: '- ', color: '#89dceb' }, { text: 'corner_y) ', color: '#cdd6f4' }, { text: '/ ', color: '#89dceb' }, { text: 'width', color: '#cdd6f4' }] },
            { tokens: [{ text: 'smile', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'clamp', color: '#89b4fa' }, { text: '(smile ', color: '#cdd6f4' }, { text: '+ ', color: '#89dceb' }, { text: '0.5', color: '#fab387' }, { text: ', ', color: '#cdd6f4' }, { text: '0', color: '#fab387' }, { text: ', ', color: '#cdd6f4' }, { text: '1', color: '#fab387' }, { text: ')', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">face_count</code> &mdash; number of faces detected</li>
            <li><code className="text-blue-600">largest_face_area_ratio</code> &mdash; biggest face as % of image</li>
            <li><code className="text-blue-600">smile_score</code> &mdash; 0&ndash;1 smile intensity</li>
            <li><code className="text-blue-600">mouth_open_score</code> &mdash; 0&ndash;1 mouth openness</li>
            <li><code className="text-blue-600">brow_raise_score</code> &mdash; 0&ndash;1 eyebrow lift</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">MediaPipe FaceMesh</p>
        </div>
      </div>
    </Slide>,

    // 7 — Pose Detection
    <Slide key={7}>
      <SlideTitle>Feature: Pose Detection</SlideTitle>
      <SlideSubtitle>Uses MediaPipe Pose (33 body landmarks) to measure how much of the frame a person occupies.</SlideSubtitle>
      <ThumbOverlay label="body_coverage: 0.38 | people: 1">
        {/* Body coverage bounding box */}
        <div className="absolute border-2 border-blue-400 bg-blue-400/15 rounded" style={{ top: '3%', left: '18%', width: '55%', height: '92%' }}>
          <span className="absolute top-1 left-1 text-[9px] bg-blue-500 text-white px-1 rounded">coverage: 38%</span>
        </div>
        {/* Hand marker on torch hand */}
        <div className="absolute w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-white" style={{ top: '22%', left: '22%' }}>
          <span className="absolute -top-4 -left-2 text-[8px] bg-yellow-500 text-white px-1 rounded">hand</span>
        </div>
      </ThumbOverlay>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">Body coverage is the bounding box area of all visible pose landmarks divided by total image area. Higher values mean the subject dominates the thumbnail.</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# Body coverage from landmarks', color: '#6c7086' }] },
            { tokens: [{ text: 'xs', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '[p.x ', color: '#cdd6f4' }, { text: 'for ', color: '#cba6f7' }, { text: 'p ', color: '#cdd6f4' }, { text: 'in ', color: '#cba6f7' }, { text: 'points]', color: '#cdd6f4' }] },
            { tokens: [{ text: 'ys', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '[p.y ', color: '#cdd6f4' }, { text: 'for ', color: '#cba6f7' }, { text: 'p ', color: '#cdd6f4' }, { text: 'in ', color: '#cba6f7' }, { text: 'points]', color: '#cdd6f4' }] },
            { tokens: [{ text: 'w', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'max', color: '#89b4fa' }, { text: '(xs) ', color: '#cdd6f4' }, { text: '- ', color: '#89dceb' }, { text: 'min', color: '#89b4fa' }, { text: '(xs)', color: '#cdd6f4' }] },
            { tokens: [{ text: 'h', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'max', color: '#89b4fa' }, { text: '(ys) ', color: '#cdd6f4' }, { text: '- ', color: '#89dceb' }, { text: 'min', color: '#89b4fa' }, { text: '(ys)', color: '#cdd6f4' }] },
            { tokens: [{ text: 'coverage', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: '(w ', color: '#cdd6f4' }, { text: '* ', color: '#89dceb' }, { text: 'h) ', color: '#cdd6f4' }, { text: '/ ', color: '#89dceb' }, { text: 'img_area', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">people_count</code> &mdash; number of people detected</li>
            <li><code className="text-blue-600">body_coverage</code> &mdash; 0&ndash;1 frame occupancy</li>
            <li><code className="text-blue-600">hand_visible_count</code> &mdash; visible hands (0&ndash;2)</li>
            <li><code className="text-blue-600">pose_orientation</code> &mdash; frontal, side, or back</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">MediaPipe Pose</p>
        </div>
      </div>
    </Slide>,

    // 8 — Text Detection
    <Slide key={8}>
      <SlideTitle>Feature: Text Detection</SlideTitle>
      <SlideSubtitle>Runs Tesseract OCR to detect and measure text overlays on thumbnails.</SlideSubtitle>
      <ThumbOverlay label="text_area: 0.000 | boxes: 0">
        {/* No text detected — show the empty state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-lg font-mono">No text detected</span>
        </div>
      </ThumbOverlay>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">OCR scans each thumbnail, filters results by confidence (&gt;30%), then measures total text bounding box area as a fraction of the image. MrBeast thumbnails average near-zero text.</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# OCR text detection', color: '#6c7086' }] },
            { tokens: [{ text: 'data', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'pytesseract.', color: '#cdd6f4' }, { text: 'image_to_data', color: '#89b4fa' }, { text: '(img)', color: '#cdd6f4' }] },
            { tokens: [{ text: 'for ', color: '#cba6f7' }, { text: 'i ', color: '#cdd6f4' }, { text: 'in ', color: '#cba6f7' }, { text: 'range', color: '#89b4fa' }, { text: '(n):', color: '#cdd6f4' }] },
            { tokens: [{ text: '  ', color: '#cdd6f4' }, { text: 'if ', color: '#cba6f7' }, { text: 'data[', color: '#cdd6f4' }, { text: '"conf"', color: '#a6e3a1' }, { text: '][i] ', color: '#cdd6f4' }, { text: '> ', color: '#89dceb' }, { text: '30', color: '#fab387' }, { text: ':', color: '#cdd6f4' }] },
            { tokens: [{ text: '    boxes.', color: '#cdd6f4' }, { text: 'append', color: '#89b4fa' }, { text: '(box)', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">has_text</code> &mdash; boolean, any text detected</li>
            <li><code className="text-blue-600">text_area_ratio</code> &mdash; text area / image area</li>
            <li><code className="text-blue-600">text_box_count</code> &mdash; number of text regions</li>
            <li><code className="text-blue-600">detected_text</code> &mdash; recognized strings</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">PyTesseract OCR</p>
        </div>
      </div>
    </Slide>,

    // 9 — Depth Estimation
    <Slide key={9}>
      <SlideTitle>Feature: Depth Estimation</SlideTitle>
      <SlideSubtitle>Uses MiDaS (monocular depth) to estimate foreground/background separation without stereo cameras.</SlideSubtitle>
      <ThumbOverlay label="depth_contrast: 0.34 | fg_ratio: 0.42">
        {/* Depth gradient overlay simulating depth map */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(255,0,0,0.25) 0%, rgba(255,165,0,0.2) 30%, rgba(0,100,255,0.25) 70%, rgba(0,0,180,0.3) 100%)',
        }} />
        <div className="absolute top-2 right-2 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-mono">
          <span className="text-red-400">near</span> &rarr; <span className="text-blue-400">far</span>
        </div>
      </ThumbOverlay>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">A pre-trained MiDaS model produces a per-pixel depth map from a single image. We then analyze the depth distribution to measure subject isolation and depth contrast.</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# MiDaS depth inference', color: '#6c7086' }] },
            { tokens: [{ text: 'x', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'transform', color: '#89b4fa' }, { text: '(img).', color: '#cdd6f4' }, { text: 'to', color: '#89b4fa' }, { text: '(device)', color: '#cdd6f4' }] },
            { tokens: [{ text: 'with ', color: '#cba6f7' }, { text: 'torch.', color: '#cdd6f4' }, { text: 'no_grad', color: '#89b4fa' }, { text: '():', color: '#cdd6f4' }] },
            { tokens: [{ text: '  depth', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'model', color: '#89b4fa' }, { text: '(x)', color: '#cdd6f4' }] },
            { tokens: [{ text: '  depth', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'F.', color: '#cdd6f4' }, { text: 'interpolate', color: '#89b4fa' }, { text: '(', color: '#cdd6f4' }] },
            { tokens: [{ text: '    depth, size', color: '#cdd6f4' }, { text: '=', color: '#89dceb' }, { text: 'img.shape[:',  color: '#cdd6f4' }, { text: '2', color: '#fab387' }, { text: '],', color: '#cdd6f4' }] },
            { tokens: [{ text: '    mode', color: '#fab387' }, { text: '=', color: '#89dceb' }, { text: '"bicubic"', color: '#a6e3a1' }, { text: ')', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">depth_contrast</code> &mdash; std of depth values</li>
            <li><code className="text-blue-600">foreground_ratio</code> &mdash; % of pixels in foreground</li>
            <li><code className="text-blue-600">depth_range</code> &mdash; max &minus; min depth</li>
            <li><code className="text-blue-600">subject_depth_center</code> &mdash; (x, y) of subject</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">MiDaS / PyTorch</p>
        </div>
      </div>
    </Slide>,

    // 10 — Title Analysis
    <Slide key={10}>
      <SlideTitle>Feature: Title Analysis</SlideTitle>
      <SlideSubtitle>Parses video titles to detect MrBeast-style linguistic patterns using keyword matching and regex.</SlideSubtitle>
      <div className="bg-gray-900 rounded-lg px-6 py-4 mb-4 text-lg font-mono">
        <span className="text-white">I </span>
        <span className="text-purple-400 font-bold underline">Survived</span>
        <span className="text-white"> </span>
        <span className="text-orange-400 font-bold">100</span>
        <span className="text-white"> Hours In An Ancient Temple</span>
      </div>
      <div className="flex gap-3 mb-4 text-xs">
        <span className="bg-orange-400/20 text-orange-400 px-2 py-1 rounded">has_number (100)</span>
        <span className="bg-purple-400/20 text-purple-400 px-2 py-1 rounded">has_challenge_framing</span>
        <span className="bg-blue-400/20 text-blue-400 px-2 py-1 rounded">first_person</span>
        <span className="bg-pink-400/20 text-pink-400 px-2 py-1 rounded">has_superlative</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <p className="text-gray-700 mb-4">Titles are tokenized, lowercased, then checked against curated word lists for money references (&ldquo;$10,000&rdquo;), superlatives (&ldquo;craziest&rdquo;), and challenge framing (&ldquo;survive&rdquo;, &ldquo;last to&rdquo;).</p>
          <CodeBlock lines={[
            { tokens: [{ text: '# Title pattern matching', color: '#6c7086' }] },
            { tokens: [{ text: 'w', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'set', color: '#89b4fa' }, { text: '(title.', color: '#cdd6f4' }, { text: 'lower', color: '#89b4fa' }, { text: '().', color: '#cdd6f4' }, { text: 'split', color: '#89b4fa' }, { text: '())', color: '#cdd6f4' }] },
            { tokens: [{ text: 'money', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 're.', color: '#cdd6f4' }, { text: 'search', color: '#89b4fa' }, { text: '(', color: '#cdd6f4' }, { text: 'r"\\$[\\d,]+"', color: '#a6e3a1' }, { text: ', title)', color: '#cdd6f4' }] },
            { tokens: [{ text: 'superlative', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'SUPERLATIVES ', color: '#f5c2e7' }, { text: '& ', color: '#89dceb' }, { text: 'w', color: '#cdd6f4' }] },
            { tokens: [{ text: 'challenge', color: '#cdd6f4' }, { text: ' = ', color: '#89dceb' }, { text: 'CHALLENGES ', color: '#f5c2e7' }, { text: '& ', color: '#89dceb' }, { text: 'w', color: '#cdd6f4' }] },
          ]} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Outputs</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><code className="text-blue-600">has_money_reference</code> &mdash; dollar amounts detected</li>
            <li><code className="text-blue-600">has_superlative</code> &mdash; extreme adjectives</li>
            <li><code className="text-blue-600">has_challenge_framing</code> &mdash; competition language</li>
            <li><code className="text-blue-600">uppercase_ratio</code> &mdash; ALL CAPS intensity</li>
            <li><code className="text-blue-600">word_count</code> &mdash; title length</li>
          </ul>
          <p className="text-xs text-blue-500 mt-3">NLP / Regex</p>
        </div>
      </div>
    </Slide>,

    // 11 — Methodology: Scoring Systems
    <Slide key={11}>
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

    // 12 — The MrBeast Formula
    <Slide key={12}>
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

    // 13 — Weighted Likeness Over Time (PRIMARY METRIC)
    <Slide key={13}>
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

    // 14 — Binary Likeness (secondary reference)
    <Slide key={14}>
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

    // 15 — Continuous Similarity Trend
    <Slide key={15}>
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

    // 16 — Feature-Level Convergence
    <Slide key={16}>
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

    // 17 — Gap Closure
    <Slide key={17}>
      <SlideTitle>Gap Closure: How Far Has the Industry Moved?</SlideTitle>
      <SlideSubtitle>Percentage of the 2015-to-MrBeast gap that has been closed by 2024 and 2025 (panel only)</SlideSubtitle>
      {gapClosureData.length > 0 ? (
        <div className="w-full max-w-3xl h-[380px]">
          <ResponsiveContainer>
            <BarChart data={gapClosureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 110]} tickFormatter={(v: number) => `${v}%`} />
              <YAxis type="category" dataKey="feature" width={120} tick={{ fontSize: 13 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="closure2025" name="By 2025" fill="#e6194b" barSize={16} />
              <Bar dataKey="closure2024" name="By 2024" fill="#fabed4" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading gap closure data...</p>}
      <p className="text-gray-500 mt-4 text-center max-w-2xl">
        Face count, face size, and body coverage have <strong>fully converged</strong> to MrBeast&apos;s levels. Expression features (smile, brow, mouth) are 58&ndash;73% of the way there.
      </p>
    </Slide>,

    // 18 — Clustering Analysis
    <Slide key={18}>
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

    // 19 — Channel-Level Evolution (slopes)
    <Slide key={19}>
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

    // 20 — Danny Duncan
    <Slide key={20}>
      <SlideTitle>Case Study: Danny Duncan</SlideTitle>
      <SlideSubtitle>Fastest converger &mdash; surpassed MrBeast&apos;s average by 2022</SlideSubtitle>
      {caseStudyData.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <LineChart data={caseStudyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <ReferenceLine y={MRBEAST_MEAN_LIKENESS} stroke="#e6194b" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: 'MrBeast avg (5.42)', position: 'right', fontSize: 11, fill: '#e6194b' }} />
              <Line type="monotone" dataKey="Danny Duncan" stroke="#e6194b" strokeWidth={3} dot={{ r: 5 }} connectNulls name="Danny Duncan" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-4 mt-4">
        <StatCard label="Start (2015)" value="2.00" />
        <StatCard label="End (2025)" value="6.67" sub="Exceeds MrBeast avg" />
        <StatCard label="Slope" value="+0.551/yr" sub="Fastest in panel" />
        <StatCard label="Peak" value="6.67" sub="2025" />
      </div>
    </Slide>,

    // 21 — ZHC
    <Slide key={21}>
      <SlideTitle>Case Study: ZHC</SlideTitle>
      <SlideSubtitle>Peaked at 7.40 in 2024 &mdash; highest single-year score of any panel channel</SlideSubtitle>
      {caseStudyData.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <LineChart data={caseStudyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <ReferenceLine y={MRBEAST_MEAN_LIKENESS} stroke="#e6194b" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: 'MrBeast avg (5.42)', position: 'right', fontSize: 11, fill: '#e6194b' }} />
              <Line type="monotone" dataKey="ZHC" stroke="#f58231" strokeWidth={3} dot={{ r: 5 }} connectNulls name="ZHC" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-4 mt-4">
        <StatCard label="Start (2017)" value="1.47" />
        <StatCard label="End (2025)" value="4.53" />
        <StatCard label="Slope" value="+0.434/yr" sub="2nd fastest" />
        <StatCard label="Peak" value="7.40" sub="2024 — highest ever" />
      </div>
    </Slide>,

    // 22 — FaZe Rug
    <Slide key={22}>
      <SlideTitle>Case Study: FaZe Rug</SlideTitle>
      <SlideSubtitle>Slow start, rapid adoption &mdash; jumped from 3.1 to 6.6 in three years</SlideSubtitle>
      {caseStudyData.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <LineChart data={caseStudyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <ReferenceLine y={MRBEAST_MEAN_LIKENESS} stroke="#e6194b" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: 'MrBeast avg (5.42)', position: 'right', fontSize: 11, fill: '#e6194b' }} />
              <Line type="monotone" dataKey="FaZe Rug" stroke="#3cb44b" strokeWidth={3} dot={{ r: 5 }} connectNulls name="FaZe Rug" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-4 mt-4">
        <StatCard label="Start (2015)" value="3.33" />
        <StatCard label="End (2025)" value="6.47" sub="Exceeds MrBeast avg" />
        <StatCard label="Slope" value="+0.355/yr" />
        <StatCard label="2021 → 2024" value="3.1 → 6.6" sub="Rapid jump" />
      </div>
    </Slide>,

    // 23 — Sidemen
    <Slide key={23}>
      <SlideTitle>Case Study: Sidemen</SlideTitle>
      <SlideSubtitle>Steady climb from 1.3 to 5.1 &mdash; now approaching MrBeast&apos;s average</SlideSubtitle>
      {caseStudyData.length > 0 ? (
        <div className="w-full max-w-3xl h-[320px]">
          <ResponsiveContainer>
            <LineChart data={caseStudyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} />
              <Tooltip />
              <ReferenceLine y={MRBEAST_MEAN_LIKENESS} stroke="#e6194b" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: 'MrBeast avg (5.42)', position: 'right', fontSize: 11, fill: '#e6194b' }} />
              <Line type="monotone" dataKey="Sidemen" stroke="#4363d8" strokeWidth={3} dot={{ r: 5 }} connectNulls name="Sidemen" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="text-gray-400">Loading data...</p>}
      <div className="flex gap-4 mt-4">
        <StatCard label="Start (2016)" value="1.29" />
        <StatCard label="End (2025)" value="5.07" sub="94% of MrBeast avg" />
        <StatCard label="Slope" value="+0.314/yr" />
        <StatCard label="Gap Remaining" value="0.35 pts" sub="from MrBeast mean" />
      </div>
    </Slide>,

    // 24 — Weighted Feature Importance
    <Slide key={24}>
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

    // 25 — Statistical Validation
    <Slide key={25}>
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

    // 26 — Title Convergence
    <Slide key={26}>
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

    // 27 — Diffusion of Innovation
    <Slide key={27}>
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

    // 28 — Limitations & Conclusions
    <Slide key={28}>
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
