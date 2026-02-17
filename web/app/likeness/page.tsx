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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
} from 'recharts'
import { getMrBeastLikeness, getMrBeastSimilarity, getTitleLikeness, getCombinedLikeness } from '@/lib/api'
import { getGroupColor } from '@/lib/constants'
import type { MrBeastSimilarityResponse, TitleLikenessResponse, CombinedLikenessResponse } from '@/lib/types'

type LikenessData = Awaited<ReturnType<typeof getMrBeastLikeness>>

const YEAR_ORDER = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']

// Human-readable labels for feature names
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

export default function LikenessPage() {
  const [data, setData] = useState<LikenessData | null>(null)
  const [simData, setSimData] = useState<MrBeastSimilarityResponse | null>(null)
  const [titleData, setTitleData] = useState<TitleLikenessResponse | null>(null)
  const [combinedData, setCombinedData] = useState<CombinedLikenessResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState('2025')

  useEffect(() => {
    Promise.all([getMrBeastLikeness(), getMrBeastSimilarity(), getTitleLikeness(), getCombinedLikeness()])
      .then(([likeness, similarity, title, combined]) => {
        setData(likeness)
        setSimData(similarity)
        setTitleData(title)
        setCombinedData(combined)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (!data) return null

  const mbScore = data.groups['mrbeast']

  // --- Binary likeness chart data ---
  const yearChartData = YEAR_ORDER
    .filter((y) => data.groups[y])
    .map((y) => ({
      group: y,
      mean_score: data.groups[y].mean_score,
      pct_4plus: data.groups[y].pct_4plus,
      pct_5plus: data.groups[y].pct_5plus,
      pct_6plus: data.groups[y].pct_6plus,
      pct_7plus: data.groups[y].pct_7plus,
      pct_8: data.groups[y].pct_8,
    }))

  const distData = YEAR_ORDER
    .filter((y) => data.groups[y])
    .map((y) => {
      const dist = data.groups[y].score_distribution
      const total = data.groups[y].count
      const row: Record<string, number | string> = { group: y }
      for (let i = 0; i <= 8; i++) {
        row[String(i)] = (Number(dist[String(i)] || 0) / total) * 100
      }
      return row
    })

  const scoreColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
    '#0ea5e9', '#8b5cf6', '#6366f1', '#ec4899',
  ]

  // --- Continuous similarity chart data ---
  const simChartData = simData
    ? YEAR_ORDER
        .filter((y) => simData.groups[y])
        .map((y) => ({
          group: y,
          mean_similarity: simData.groups[y].mean_similarity,
        }))
    : []

  const mbSimilarity = simData?.groups['mrbeast']?.mean_similarity

  // --- Radar chart data ---
  const radarData = simData
    ? simData.feature_names.map((fname) => {
        const mbVal = simData.mrbeast_centroid[fname] || 0
        const yearVal = simData.feature_trends[fname]?.[selectedYear] || 0
        // Normalize: MrBeast = 1.0, year = ratio to MrBeast
        const mbNorm = 1.0
        const yearNorm = mbVal !== 0 ? yearVal / mbVal : 0
        return {
          feature: FEATURE_LABELS[fname] || fname,
          mrbeast: parseFloat(mbNorm.toFixed(3)),
          [selectedYear]: parseFloat(yearNorm.toFixed(3)),
        }
      })
    : []

  // --- Per-feature trend data (normalized to MrBeast = 1.0) ---
  const featureTrendData = simData
    ? YEAR_ORDER
        .filter((y) => simData.groups[y])
        .map((y) => {
          const row: Record<string, number | string> = { group: y }
          for (const fname of simData.feature_names) {
            const mbVal = simData.mrbeast_centroid[fname] || 0
            const yearVal = simData.feature_trends[fname]?.[y] || 0
            row[fname] = mbVal !== 0 ? parseFloat((yearVal / mbVal).toFixed(3)) : 0
          }
          return row
        })
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">MrBeast-Likeness Analysis</h1>
        <p className="mt-2 text-gray-600">
          Continuous similarity scoring and 8-trait binary likeness analysis across year groups.
        </p>
      </div>

      {/* ========== CONTINUOUS SIMILARITY SECTION ========== */}
      {simData && (
        <>
          {/* Continuous Similarity Score */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Continuous Similarity Score (0-100)</h2>
            <p className="text-sm text-gray-500 mb-4">
              Z-score distance from MrBeast centroid across 10 features, converted to 0-100 via exponential decay.
              Higher = more similar to MrBeast&apos;s thumbnail style.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={simChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis domain={[0, 100]} label={{ value: 'Similarity (0-100)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(val: number) => `${val.toFixed(1)}`} />
                {mbSimilarity && (
                  <ReferenceLine
                    y={mbSimilarity}
                    stroke="#e6194b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: `MrBeast: ${mbSimilarity}`, position: 'right', fill: '#e6194b', fontSize: 12 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="mean_similarity"
                  stroke="#4363d8"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Mean Similarity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Feature Profile: MrBeast vs Year</h2>
                <p className="text-sm text-gray-500">
                  Each axis normalized so MrBeast = 1.0. Values {'>'} 1 mean that year exceeds MrBeast on that trait.
                </p>
              </div>
              <select
                className="border rounded px-3 py-1.5 text-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {YEAR_ORDER.filter((y) => simData.groups[y]).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 10 }} />
                <Radar
                  name="MrBeast"
                  dataKey="mrbeast"
                  stroke="#e6194b"
                  fill="#e6194b"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name={selectedYear}
                  dataKey={selectedYear}
                  stroke={getGroupColor(selectedYear)}
                  fill={getGroupColor(selectedYear)}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip formatter={(val: number) => val.toFixed(3)} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-Feature Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Individual Feature Trends (Normalized to MrBeast = 1.0)</h2>
            <p className="text-sm text-gray-500 mb-4">
              Each line shows a feature&apos;s year-over-year mean, divided by MrBeast&apos;s mean.
              Values approaching 1.0 indicate convergence toward MrBeast&apos;s style.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={featureTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis label={{ value: 'Ratio to MrBeast', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(val: number) => val.toFixed(3)} />
                <Legend />
                <ReferenceLine y={1.0} stroke="#999" strokeDasharray="3 3" label={{ value: 'MrBeast = 1.0', position: 'right', fontSize: 10 }} />
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
        </>
      )}

      {/* ========== BINARY LIKENESS SECTION ========== */}

      {/* Criteria */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Binary Scoring Criteria (1 point each, max {data.max_score})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.criteria.map((c, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: scoreColors[i + 1] || '#6b7280' }}>
                {i + 1}
              </span>
              <span className="text-gray-700">{c}</span>
            </div>
          ))}
        </div>
        {mbScore && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <span className="font-semibold text-red-700">MrBeast baseline: </span>
            <span className="text-red-600">
              mean {mbScore.mean_score}/{data.max_score} | {mbScore.pct_6plus}% score 6+ | {mbScore.pct_8}% score {data.max_score}/{data.max_score}
            </span>
          </div>
        )}
      </div>

      {/* Mean Score Over Time */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Mean Likeness Score Over Time</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={yearChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis domain={[0, 8]} label={{ value: `Score (0-${data.max_score})`, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            {mbScore && (
              <ReferenceLine
                y={mbScore.mean_score}
                stroke="#e6194b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{ value: `MrBeast: ${mbScore.mean_score}`, position: 'right', fill: '#e6194b', fontSize: 12 }}
              />
            )}
            <Line
              type="monotone"
              dataKey="mean_score"
              stroke="#4363d8"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Mean Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* % Meeting Thresholds */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">% of Thumbnails Meeting Score Thresholds</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={yearChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis domain={[0, 100]} label={{ value: '% of thumbnails', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(val: number) => `${val}%`} />
            <Legend />
            <Line type="monotone" dataKey="pct_4plus" stroke="#22c55e" strokeWidth={2} name="4+ traits" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pct_5plus" stroke="#0ea5e9" strokeWidth={2} name="5+ traits" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pct_6plus" stroke="#8b5cf6" strokeWidth={2} name="6+ traits" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pct_7plus" stroke="#6366f1" strokeWidth={2} name="7+ traits" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pct_8" stroke="#ec4899" strokeWidth={2} name={`All ${data.max_score}`} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score Distribution by Year */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Score Distribution by Year</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={distData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="group" />
            <YAxis label={{ value: '% of thumbnails', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(val: number) => `${(val as number).toFixed(1)}%`} />
            <Legend />
            {Array.from({ length: 9 }, (_, i) => (
              <Bar
                key={i}
                dataKey={String(i)}
                stackId="a"
                fill={scoreColors[i]}
                name={`Score ${i}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ========== TITLE LIKENESS SECTION ========== */}
      {titleData && (() => {
        const mbTitleScore = titleData.groups['mrbeast']
        const titleChartData = YEAR_ORDER
          .filter((y) => titleData.groups[y])
          .map((y) => ({
            group: y,
            mean_score: titleData.groups[y].mean_score,
            pct_4plus: titleData.groups[y].pct_4plus,
            pct_5plus: titleData.groups[y].pct_5plus,
            pct_6plus: titleData.groups[y].pct_6plus,
          }))
        return (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-3">Title Likeness Scoring Criteria (1 point each, max {titleData.max_score})</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {titleData.criteria.map((c, i) => (
                  <div key={i} className="flex items-center space-x-2 text-sm">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: scoreColors[i + 1] || '#6b7280' }}>
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{c}</span>
                  </div>
                ))}
              </div>
              {mbTitleScore && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-700">MrBeast baseline: </span>
                  <span className="text-red-600">
                    mean {mbTitleScore.mean_score}/{titleData.max_score} | {mbTitleScore.pct_4plus}% score 4+ | {mbTitleScore.pct_6plus}% score 6+
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Title Likeness Score Over Time</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={titleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis domain={[0, 8]} label={{ value: `Score (0-${titleData.max_score})`, angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  {mbTitleScore && (
                    <ReferenceLine
                      y={mbTitleScore.mean_score}
                      stroke="#e6194b"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: `MrBeast: ${mbTitleScore.mean_score}`, position: 'right', fill: '#e6194b', fontSize: 12 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="mean_score"
                    stroke="#911eb4"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Title Mean Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">% of Titles Meeting Score Thresholds</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={titleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis domain={[0, 100]} label={{ value: '% of titles', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(val: number) => `${val}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="pct_4plus" stroke="#22c55e" strokeWidth={2} name="4+ traits" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pct_5plus" stroke="#0ea5e9" strokeWidth={2} name="5+ traits" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pct_6plus" stroke="#8b5cf6" strokeWidth={2} name="6+ traits" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      })()}

      {/* ========== COMBINED LIKENESS SECTION ========== */}
      {combinedData && (() => {
        const combinedChartData = YEAR_ORDER
          .filter((y) => combinedData.groups[y])
          .map((y) => ({
            group: y,
            thumbnail_mean: combinedData.groups[y].thumbnail_mean,
            title_mean: combinedData.groups[y].title_mean,
            combined_mean: combinedData.groups[y].combined_mean,
          }))
        const mbCombined = combinedData.groups['mrbeast']
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Combined Score Over Time (Thumbnail + Title, 0-{combinedData.max_score})</h2>
            <p className="text-sm text-gray-500 mb-4">
              Thumbnail likeness (0-8) + title likeness (0-8) = combined (0-16).
              Higher combined scores indicate convergence on both visual and linguistic dimensions.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis domain={[0, 16]} label={{ value: `Score (0-${combinedData.max_score})`, angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {mbCombined && (
                  <ReferenceLine
                    y={mbCombined.combined_mean}
                    stroke="#e6194b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: `MrBeast: ${mbCombined.combined_mean}`, position: 'right', fill: '#e6194b', fontSize: 12 }}
                  />
                )}
                <Line type="monotone" dataKey="thumbnail_mean" stroke="#4363d8" strokeWidth={2} dot={{ r: 4 }} name="Thumbnail (0-8)" />
                <Line type="monotone" dataKey="title_mean" stroke="#911eb4" strokeWidth={2} dot={{ r: 4 }} name="Title (0-8)" />
                <Line type="monotone" dataKey="combined_mean" stroke="#e6194b" strokeWidth={3} dot={{ r: 5 }} name="Combined (0-16)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )
      })()}

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Summary Table</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Group</th>
              <th className="text-right py-2 px-3">Count</th>
              <th className="text-right py-2 px-3">Thumb Score</th>
              <th className="text-right py-2 px-3">Median</th>
              <th className="text-right py-2 px-3">6+</th>
              <th className="text-right py-2 px-3">8/8</th>
              {titleData && <th className="text-right py-2 px-3">Title Score</th>}
              {titleData && <th className="text-right py-2 px-3">Title 4+</th>}
              {combinedData && <th className="text-right py-2 px-3">Combined</th>}
              {simData && <th className="text-right py-2 px-3">Similarity</th>}
            </tr>
          </thead>
          <tbody>
            {['mrbeast', ...YEAR_ORDER].map((g) => {
              const d = data.groups[g]
              if (!d) return null
              const sim = simData?.groups[g]
              const ti = titleData?.groups[g]
              const co = combinedData?.groups[g]
              return (
                <tr key={g} className={`border-b ${g === 'mrbeast' ? 'bg-red-50 font-semibold' : ''}`}>
                  <td className="py-2 px-3">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getGroupColor(g) }} />
                    {g}
                  </td>
                  <td className="text-right py-2 px-3">{d.count}</td>
                  <td className="text-right py-2 px-3">{d.mean_score}</td>
                  <td className="text-right py-2 px-3">{d.median_score}</td>
                  <td className="text-right py-2 px-3">{d.pct_6plus}%</td>
                  <td className="text-right py-2 px-3">{d.pct_8}%</td>
                  {titleData && (
                    <td className="text-right py-2 px-3">{ti ? ti.mean_score : '—'}</td>
                  )}
                  {titleData && (
                    <td className="text-right py-2 px-3">{ti ? `${ti.pct_4plus}%` : '—'}</td>
                  )}
                  {combinedData && (
                    <td className="text-right py-2 px-3">{co ? co.combined_mean : '—'}</td>
                  )}
                  {simData && (
                    <td className="text-right py-2 px-3">
                      {sim ? `${sim.mean_similarity}` : '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
