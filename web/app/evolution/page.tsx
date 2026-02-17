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
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts'
import { getChannelEvolution } from '@/lib/api'

type EvolutionData = Awaited<ReturnType<typeof getChannelEvolution>>

const LINE_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9a6324', '#800000', '#aaffc3', '#808000',
  '#000075', '#a9a9a9',
]

export default function EvolutionPage() {
  const [data, setData] = useState<EvolutionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minYears, setMinYears] = useState(3)
  const [panelOnly, setPanelOnly] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoading(true)
    getChannelEvolution(minYears, panelOnly)
      .then((d) => {
        setData(d)
        // Auto-select top 5 converging + top 3 diverging
        const initial = new Set<string>()
        d.trends.slice(0, 5).forEach((t) => initial.add(t.channel))
        d.trends.slice(-3).forEach((t) => initial.add(t.channel))
        setSelectedChannels(initial)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [minYears, panelOnly])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (!data) return null

  // Build line chart data: one entry per year, with channel scores
  const allYears = new Set<string>()
  for (const ch of Object.values(data.channels)) {
    Object.keys(ch.years).forEach((y) => allYears.add(y))
  }
  const sortedYears = Array.from(allYears).sort()

  const lineData = sortedYears.map((year) => {
    const entry: Record<string, unknown> = { year }
    selectedChannels.forEach((ch) => {
      const chData = data.channels[ch]
      if (chData?.years[year]) {
        entry[ch] = chData.years[year].mean_score
      }
    })
    return entry
  })

  // Slope chart: all channels as bars
  const slopeData = data.trends.map((t) => ({
    channel: t.channel,
    slope: t.slope,
    color: t.slope > 0 ? '#22c55e' : t.slope < 0 ? '#ef4444' : '#9ca3af',
  }))

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev)
      if (next.has(ch)) next.delete(ch)
      else next.add(ch)
      return next
    })
  }

  const selectAll = () => setSelectedChannels(new Set(Object.keys(data.channels)))
  const selectNone = () => setSelectedChannels(new Set())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Channel Evolution</h1>
        <p className="mt-2 text-gray-600">
          Tracking how individual channels change their MrBeast-likeness score over the years.
          Same channel, different eras — this controls for genre.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{data.total_channels}</div>
          <div className="text-sm text-gray-500">Channels Tracked</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{data.summary.converging_toward_mrbeast}</div>
          <div className="text-sm text-gray-500">Converging ({Math.round(data.summary.converging_toward_mrbeast / data.total_channels * 100)}%)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{data.summary.diverging_from_mrbeast}</div>
          <div className="text-sm text-gray-500">Diverging ({Math.round(data.summary.diverging_from_mrbeast / data.total_channels * 100)}%)</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{data.summary.avg_slope > 0 ? '+' : ''}{data.summary.avg_slope}</div>
          <div className="text-sm text-gray-500">Avg Thumbnail Slope</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{data.summary.avg_title_slope > 0 ? '+' : ''}{data.summary.avg_title_slope}</div>
          <div className="text-sm text-gray-500">Avg Title Slope</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Min years per channel:</label>
          <select
            value={minYears}
            onChange={(e) => setMinYears(Number(e.target.value))}
            className="border rounded px-3 py-1.5 text-sm"
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+ years</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={panelOnly}
            onChange={(e) => setPanelOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Panel channels only</span>
        </label>
      </div>

      {/* Slope Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Trend Slope by Channel</h2>
        <p className="text-sm text-gray-500 mb-4">
          Green = getting more MrBeast-like over time. Red = diverging.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(400, slopeData.length * 28)}>
          <BarChart data={slopeData} layout="vertical" margin={{ left: 140 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={['auto', 'auto']} />
            <YAxis type="category" dataKey="channel" width={130} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(val: number) => `${val > 0 ? '+' : ''}${val.toFixed(4)} pts/year`} />
            <ReferenceLine x={0} stroke="#374151" strokeWidth={2} />
            <Bar dataKey="slope" name="Slope">
              {slopeData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Line Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Channel Score Over Time</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={selectAll} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
            All
          </button>
          <button onClick={selectNone} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
            None
          </button>
          {Object.keys(data.channels).sort().map((ch, i) => (
            <button
              key={ch}
              onClick={() => toggleChannel(ch)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectedChannels.has(ch)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedChannels.has(ch) ? {
                backgroundColor: LINE_COLORS[i % LINE_COLORS.length]
              } : undefined}
            >
              {ch}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 8]} label={{ value: 'Likeness Score', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <ReferenceLine y={6.13} stroke="#e6194b" strokeDasharray="5 5" label="MrBeast avg (6.13)" />
            {Array.from(selectedChannels).map((ch, i) => (
              <Line
                key={ch}
                type="monotone"
                dataKey={ch}
                stroke={LINE_COLORS[Object.keys(data.channels).sort().indexOf(ch) % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Score Heatmap: Channels x Years</h2>
        <p className="text-sm text-gray-500 mb-4">
          Rows sorted by slope (most converging at top). Color: blue (low) to red (high score).
        </p>
        {(() => {
          const heatYears = sortedYears
          const sortedChannels = data.trends.map((t) => t.channel)
          const getColor = (score: number) => {
            const t = Math.min(Math.max(score / 8, 0), 1)
            const r = Math.round(59 + t * (220 - 59))
            const g = Math.round(130 + t * (38 - 130))
            const b = Math.round(246 + t * (38 - 246))
            return `rgb(${r},${g},${b})`
          }
          return (
            <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${heatYears.length}, 1fr)`, gap: '2px', fontSize: '12px' }}>
              <div className="font-semibold text-gray-600 p-1">Channel</div>
              {heatYears.map((y) => (
                <div key={y} className="font-semibold text-gray-600 p-1 text-center">{y}</div>
              ))}
              {sortedChannels.map((ch) => {
                const chData = data.channels[ch]
                if (!chData) return null
                return [
                  <div key={`${ch}-label`} className="p-1 truncate font-medium text-gray-700" title={ch}>{ch}</div>,
                  ...heatYears.map((y) => {
                    const yearData = chData.years[y]
                    if (!yearData) {
                      return <div key={`${ch}-${y}`} className="p-1 text-center rounded" style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>—</div>
                    }
                    return (
                      <div
                        key={`${ch}-${y}`}
                        className="p-1 text-center rounded text-white font-medium"
                        style={{ backgroundColor: getColor(yearData.mean_score) }}
                        title={`${ch} ${y}: ${yearData.mean_score}`}
                      >
                        {yearData.mean_score.toFixed(1)}
                      </div>
                    )
                  }),
                ]
              })}
            </div>
          )
        })()}
      </div>

      {/* Trends Table */}
      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">All Channel Trends</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Channel</th>
              <th className="text-right py-2 px-3">Years</th>
              <th className="text-right py-2 px-3">Start</th>
              <th className="text-right py-2 px-3">End</th>
              <th className="text-right py-2 px-3">Thumb Slope</th>
              <th className="text-right py-2 px-3">Title Slope</th>
              <th className="text-right py-2 px-3">Combined</th>
              <th className="text-center py-2 px-3">Dir</th>
            </tr>
          </thead>
          <tbody>
            {data.trends.map((t) => (
              <tr key={t.channel} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">{t.channel}</td>
                <td className="text-right py-2 px-3">{t.start_year}-{t.end_year}</td>
                <td className="text-right py-2 px-3">{t.start_score}</td>
                <td className="text-right py-2 px-3">{t.end_score}</td>
                <td className="text-right py-2 px-3">
                  <span className={t.slope > 0 ? 'text-green-600' : t.slope < 0 ? 'text-red-600' : ''}>
                    {t.slope > 0 ? '+' : ''}{t.slope}
                  </span>
                </td>
                <td className="text-right py-2 px-3">
                  <span className={t.title_slope > 0 ? 'text-green-600' : t.title_slope < 0 ? 'text-red-600' : ''}>
                    {t.title_slope > 0 ? '+' : ''}{t.title_slope}
                  </span>
                </td>
                <td className="text-right py-2 px-3">
                  <span className={t.combined_slope > 0 ? 'text-green-600' : t.combined_slope < 0 ? 'text-red-600' : ''}>
                    {t.combined_slope > 0 ? '+' : ''}{t.combined_slope}
                  </span>
                </td>
                <td className="text-center py-2 px-3">
                  {t.slope > 0 ? '↗' : t.slope < 0 ? '↘' : '→'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
