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
  Cell,
} from 'recharts'
import { getMrBeastLikeness } from '@/lib/api'
import { getGroupColor } from '@/lib/constants'

type LikenessData = Awaited<ReturnType<typeof getMrBeastLikeness>>

const YEAR_ORDER = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']

export default function LikenessPage() {
  const [data, setData] = useState<LikenessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMrBeastLikeness()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (!data) return null

  const mbScore = data.groups['mrbeast']

  // Build chart data for year groups
  const yearChartData = YEAR_ORDER
    .filter((y) => data.groups[y])
    .map((y) => ({
      group: y,
      mean_score: data.groups[y].mean_score,
      pct_4plus: data.groups[y].pct_4plus,
      pct_5plus: data.groups[y].pct_5plus,
      pct_6: data.groups[y].pct_6,
    }))

  // Build score distribution stacked data
  const distData = YEAR_ORDER
    .filter((y) => data.groups[y])
    .map((y) => {
      const dist = data.groups[y].score_distribution
      const total = data.groups[y].count
      return {
        group: y,
        '0': ((Number(dist['0'] || 0) / total) * 100),
        '1': ((Number(dist['1'] || 0) / total) * 100),
        '2': ((Number(dist['2'] || 0) / total) * 100),
        '3': ((Number(dist['3'] || 0) / total) * 100),
        '4': ((Number(dist['4'] || 0) / total) * 100),
        '5': ((Number(dist['5'] || 0) / total) * 100),
        '6': ((Number(dist['6'] || 0) / total) * 100),
      }
    })

  const scoreColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#0ea5e9', '#8b5cf6']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">MrBeast-Likeness Score</h1>
        <p className="mt-2 text-gray-600">
          Each thumbnail is scored 0-6 based on how many MrBeast signature traits it has.
        </p>
      </div>

      {/* Criteria */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Scoring Criteria (1 point each)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.criteria.map((c, i) => (
            <div key={i} className="flex items-center space-x-2 text-sm">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: scoreColors[i + 1] }}>
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
              mean {mbScore.mean_score}/6 | {mbScore.pct_5plus}% score 5+ | {mbScore.pct_6}% score 6/6
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
            <YAxis domain={[0, 6]} label={{ value: 'Score (0-6)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="mean_score"
              stroke="#e6194b"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Mean Score"
            />
          </LineChart>
        </ResponsiveContainer>
        {mbScore && (
          <p className="text-sm text-gray-500 mt-2">
            MrBeast reference line: {mbScore.mean_score}/6
          </p>
        )}
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
            <Line type="monotone" dataKey="pct_6" stroke="#8b5cf6" strokeWidth={2} name="All 6 traits" dot={{ r: 4 }} />
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
            <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`} />
            <Legend />
            {[0, 1, 2, 3, 4, 5, 6].map((score) => (
              <Bar
                key={score}
                dataKey={String(score)}
                stackId="a"
                fill={scoreColors[score]}
                name={`Score ${score}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Summary Table</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Group</th>
              <th className="text-right py-2 px-3">Count</th>
              <th className="text-right py-2 px-3">Mean Score</th>
              <th className="text-right py-2 px-3">Median</th>
              <th className="text-right py-2 px-3">4+ traits</th>
              <th className="text-right py-2 px-3">5+ traits</th>
              <th className="text-right py-2 px-3">6/6</th>
            </tr>
          </thead>
          <tbody>
            {['mrbeast', ...YEAR_ORDER].map((g) => {
              const d = data.groups[g]
              if (!d) return null
              return (
                <tr key={g} className={`border-b ${g === 'mrbeast' ? 'bg-red-50 font-semibold' : ''}`}>
                  <td className="py-2 px-3">
                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getGroupColor(g) }} />
                    {g}
                  </td>
                  <td className="text-right py-2 px-3">{d.count}</td>
                  <td className="text-right py-2 px-3">{d.mean_score}</td>
                  <td className="text-right py-2 px-3">{d.median_score}</td>
                  <td className="text-right py-2 px-3">{d.pct_4plus}%</td>
                  <td className="text-right py-2 px-3">{d.pct_5plus}%</td>
                  <td className="text-right py-2 px-3">{d.pct_6}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
