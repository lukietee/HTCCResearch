'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts'
import { getConvergenceTests, getMrBeastSimilarity, getWeightedLikeness } from '@/lib/api'
import type { ConvergenceTestsResponse, MrBeastSimilarityResponse, WeightedLikenessResponse } from '@/lib/types'

const YEAR_ORDER = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']

const FEATURE_LABELS: Record<string, string> = {
  avg_brightness: 'Brightness',
  face_count: 'Face Count',
  largest_face_area_ratio: 'Face Size',
  smile_score: 'Smile',
  mouth_open_score: 'Mouth Open',
  brow_raise_score: 'Brow Raise',
  body_coverage: 'Body Coverage',
  text_box_count: 'Text Boxes',
  text_area_ratio: 'Text Area',
  avg_saturation: 'Saturation',
}

const FEATURE_LINE_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
]

export default function ConvergencePage() {
  const [tests, setTests] = useState<ConvergenceTestsResponse | null>(null)
  const [simData, setSimData] = useState<MrBeastSimilarityResponse | null>(null)
  const [weightedData, setWeightedData] = useState<WeightedLikenessResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [panelOnly, setPanelOnly] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getConvergenceTests(panelOnly),
      getMrBeastSimilarity(panelOnly),
      getWeightedLikeness(panelOnly),
    ])
      .then(([t, s, w]) => {
        setTests(t)
        setSimData(s)
        setWeightedData(w)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [panelOnly])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (!tests) return null

  // --- Statistical evidence cards ---
  const cards = [
    {
      label: 'T-Test p-value',
      value: tests.ttest ? tests.ttest.p_value.toExponential(2) : 'N/A',
      detail: tests.ttest ? (tests.ttest.significant ? 'Significant' : 'Not significant') : '',
      color: tests.ttest?.significant ? 'text-green-600' : 'text-red-600',
    },
    {
      label: "Cohen's d",
      value: tests.cohens_d ? tests.cohens_d.d.toFixed(3) : 'N/A',
      detail: tests.cohens_d?.interpretation || '',
      color: tests.cohens_d && Math.abs(tests.cohens_d.d) >= 0.5 ? 'text-green-600' : 'text-yellow-600',
    },
    {
      label: 'Regression Slope',
      value: tests.linear_regression ? `${tests.linear_regression.slope > 0 ? '+' : ''}${tests.linear_regression.slope.toFixed(4)}` : 'N/A',
      detail: tests.linear_regression ? `R² = ${tests.linear_regression.r_squared}` : '',
      color: tests.linear_regression?.slope && tests.linear_regression.slope > 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'ANOVA F-stat',
      value: tests.anova ? tests.anova.f_statistic.toFixed(2) : 'N/A',
      detail: tests.anova ? (tests.anova.significant ? `p = ${tests.anova.p_value.toExponential(2)}` : 'Not significant') : '',
      color: tests.anova?.significant ? 'text-green-600' : 'text-red-600',
    },
  ]

  // --- Trendline with CI bands ---
  const ciData = YEAR_ORDER
    .filter((y) => tests.year_confidence_intervals[y])
    .map((y) => {
      const ci = tests.year_confidence_intervals[y]
      return {
        year: y,
        mean: ci.mean,
        ci_low: ci.ci_low,
        ci_high: ci.ci_high,
        ci_range: [ci.ci_low, ci.ci_high] as [number, number],
      }
    })

  const mbMean = tests.ttest
    ? undefined // We'll use simData for MrBeast reference
    : undefined

  // --- Gap-closing chart ---
  const gapData = simData
    ? YEAR_ORDER
        .filter((y) => simData.groups[y])
        .map((y) => {
          const row: Record<string, number | string> = { year: y }
          for (const fname of simData.feature_names) {
            const mbVal = simData.mrbeast_centroid[fname] || 0
            const yearVal = simData.feature_trends[fname]?.[y] || 0
            row[fname] = Math.abs(yearVal - mbVal)
          }
          return row
        })
    : []

  // --- Weighted vs unweighted comparison ---
  const weightCompData = weightedData && simData
    ? YEAR_ORDER
        .filter((y) => weightedData.groups[y])
        .map((y) => ({
          year: y,
          weighted: weightedData.groups[y].normalized_mean,
          similarity: (simData.groups[y]?.mean_similarity || 0) / 100,
        }))
    : []

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Convergence Evidence</h1>
          <p className="mt-2 text-gray-600">
            Statistical tests and visualizations demonstrating whether YouTube thumbnails are converging toward MrBeast&apos;s style.
          </p>
        </div>
        <label className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={panelOnly}
            onChange={(e) => setPanelOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Panel channels only</span>
        </label>
      </div>

      {/* Statistical Evidence Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.detail}</div>
          </div>
        ))}
      </div>

      {/* Test Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Test Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {tests.ttest && (
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">Welch&apos;s T-Test (Early vs Late)</div>
              <div>Early mean: {tests.ttest.early_mean} (n={tests.ttest.early_n})</div>
              <div>Late mean: {tests.ttest.late_mean} (n={tests.ttest.late_n})</div>
              <div>t = {tests.ttest.t_statistic}, p = {tests.ttest.p_value.toExponential(3)}</div>
            </div>
          )}
          {tests.linear_regression && (
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">Linear Regression (Score ~ Year)</div>
              <div>Slope: {tests.linear_regression.slope.toFixed(4)} pts/year</div>
              <div>R²: {tests.linear_regression.r_squared}</div>
              <div>p = {tests.linear_regression.p_value.toExponential(3)} (n={tests.linear_regression.n})</div>
            </div>
          )}
          {tests.cohens_d && (
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">Effect Size (Cohen&apos;s d)</div>
              <div>d = {tests.cohens_d.d.toFixed(4)}</div>
              <div>Interpretation: <span className="font-semibold">{tests.cohens_d.interpretation}</span></div>
            </div>
          )}
          {tests.anova && (
            <div className="border rounded p-3">
              <div className="font-semibold mb-1">One-Way ANOVA</div>
              <div>F = {tests.anova.f_statistic} across {tests.anova.num_groups} year groups</div>
              <div>p = {tests.anova.p_value.toExponential(3)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Trendline with 95% CI Bands */}
      {ciData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Likeness Trend with 95% Confidence Intervals</h2>
          <p className="text-sm text-gray-500 mb-4">
            Shaded band shows 95% CI for each year&apos;s mean score. Upward trend = convergence toward MrBeast.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={ciData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 8]} label={{ value: 'Likeness Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val: unknown) => {
                if (Array.isArray(val)) return `[${val.map((v: number) => v.toFixed(2)).join(', ')}]`
                if (typeof val === 'number') return val.toFixed(3)
                return String(val)
              }} />
              <Legend />
              <Area
                type="monotone"
                dataKey="ci_range"
                fill="#4363d8"
                fillOpacity={0.15}
                stroke="none"
                name="95% CI"
              />
              <Line
                type="monotone"
                dataKey="mean"
                stroke="#4363d8"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Mean Score"
              />
              {simData?.groups['mrbeast'] && (
                <ReferenceLine
                  y={6.13}
                  stroke="#e6194b"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ value: 'MrBeast baseline', position: 'right', fill: '#e6194b', fontSize: 11 }}
                />
              )}
              {tests.linear_regression && (
                <ReferenceLine
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  segment={[
                    { x: ciData[0].year, y: tests.linear_regression.intercept + tests.linear_regression.slope * parseInt(ciData[0].year) },
                    { x: ciData[ciData.length - 1].year, y: tests.linear_regression.intercept + tests.linear_regression.slope * parseInt(ciData[ciData.length - 1].year) },
                  ]}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gap-Closing Chart */}
      {gapData.length > 0 && simData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Feature Gap from MrBeast Over Time</h2>
          <p className="text-sm text-gray-500 mb-4">
            |year mean - MrBeast mean| for each feature. Lines trending toward 0 = convergence.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: 'Absolute Gap', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val: number) => val.toFixed(4)} />
              <Legend />
              <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
              {simData.feature_names.map((fname, i) => (
                <Line
                  key={fname}
                  type="monotone"
                  dataKey={fname}
                  stroke={FEATURE_LINE_COLORS[i]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={FEATURE_LABELS[fname] || fname}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weighted vs Similarity Comparison */}
      {weightCompData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Weighted Likeness vs Continuous Similarity</h2>
          <p className="text-sm text-gray-500 mb-4">
            Two independent measures of convergence, both normalized to 0-1. Agreement strengthens the finding.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={weightCompData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 1]} label={{ value: 'Normalized Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val: number) => val.toFixed(4)} />
              <Legend />
              <Line type="monotone" dataKey="weighted" stroke="#e6194b" strokeWidth={2} dot={{ r: 4 }} name="Weighted Likeness (normalized)" />
              <Line type="monotone" dataKey="similarity" stroke="#4363d8" strokeWidth={2} dot={{ r: 4 }} name="Z-score Similarity (normalized)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-Year CI Table */}
      {Object.keys(tests.year_confidence_intervals).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Per-Year Confidence Intervals</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Year</th>
                <th className="text-right py-2 px-3">N</th>
                <th className="text-right py-2 px-3">Mean</th>
                <th className="text-right py-2 px-3">95% CI Low</th>
                <th className="text-right py-2 px-3">95% CI High</th>
                <th className="text-right py-2 px-3">SEM</th>
              </tr>
            </thead>
            <tbody>
              {YEAR_ORDER.map((y) => {
                const ci = tests.year_confidence_intervals[y]
                if (!ci) return null
                return (
                  <tr key={y} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{y}</td>
                    <td className="text-right py-2 px-3">{ci.n}</td>
                    <td className="text-right py-2 px-3">{ci.mean}</td>
                    <td className="text-right py-2 px-3">{ci.ci_low}</td>
                    <td className="text-right py-2 px-3">{ci.ci_high}</td>
                    <td className="text-right py-2 px-3">{ci.sem}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
