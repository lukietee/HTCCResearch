'use client'

import { useEffect, useState } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts'
import {
  runClustering,
  getClusteringPoints,
  getClusteringSummary,
  getThumbnailImageUrl,
} from '@/lib/api'
import type { ClusterPoint, ClusteringResult } from '@/lib/types'

import { getGroupColor } from '@/lib/constants'

const CLUSTER_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#84cc16',
]

export default function ClusteringPage() {
  const [points, setPoints] = useState<ClusterPoint[]>([])
  const [result, setResult] = useState<ClusteringResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<ClusterPoint | null>(null)
  const [colorBy, setColorBy] = useState<'group' | 'cluster'>('group')
  const [k, setK] = useState(3)

  useEffect(() => {
    async function fetchData() {
      try {
        const [pointsData, summary] = await Promise.all([
          getClusteringPoints(),
          getClusteringSummary(),
        ])
        setPoints(pointsData)
      } catch (err) {
        // No clustering data yet is fine
        console.log('No clustering data yet')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleRunClustering() {
    setRunning(true)
    setError(null)
    try {
      const clusterResult = await runClustering({ k })
      setResult(clusterResult)
      // Refresh points after clustering
      const newPoints = await getClusteringPoints()
      setPoints(newPoints)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run clustering')
    } finally {
      setRunning(false)
    }
  }

  // Compute axis domains from percentiles so outliers don't compress the view
  const axisDomains = (() => {
    if (points.length === 0) return { x: [-5, 5] as [number, number], y: [-5, 5] as [number, number] }
    const sorted = (arr: number[]) => [...arr].sort((a, b) => a - b)
    const percentile = (arr: number[], p: number) => {
      const s = sorted(arr)
      const i = Math.floor(s.length * p)
      return s[Math.min(i, s.length - 1)]
    }
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    const pad = 0.15 // 15% padding
    const xMin = percentile(xs, 0.02)
    const xMax = percentile(xs, 0.98)
    const yMin = percentile(ys, 0.02)
    const yMax = percentile(ys, 0.98)
    const xPad = (xMax - xMin) * pad
    const yPad = (yMax - yMin) * pad
    return {
      x: [xMin - xPad, xMax + xPad] as [number, number],
      y: [yMin - yPad, yMax + yPad] as [number, number],
    }
  })()

  // Group points by color criteria
  const groupedPoints: Record<string, ClusterPoint[]> = {}

  if (colorBy === 'group') {
    points.forEach(point => {
      const key = point.group
      if (!groupedPoints[key]) groupedPoints[key] = []
      groupedPoints[key].push(point)
    })
  } else {
    points.forEach(point => {
      const key = `Cluster ${point.cluster_id ?? 'N/A'}`
      if (!groupedPoints[key]) groupedPoints[key] = []
      groupedPoints[key].push(point)
    })
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ClusterPoint }> }) => {
    if (active && payload && payload.length > 0) {
      const point = payload[0].payload
      return (
        <div className="bg-white p-2 shadow rounded border text-sm">
          <p className="font-medium">{point.title || `ID: ${point.id}`}</p>
          <p className="text-gray-500 capitalize">Group: {point.group}</p>
          <p className="text-gray-500">Cluster: {point.cluster_id}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clustering</h1>
        <p className="mt-2 text-gray-600">
          Visualize thumbnail clusters based on extracted features
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Clusters (k)
            </label>
            <select
              value={k}
              onChange={(e) => setK(parseInt(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm p-2 border"
            >
              {[2, 3, 4, 5, 6, 7, 8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color By
            </label>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value as 'group' | 'cluster')}
              className="rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="group">Group</option>
              <option value="cluster">Cluster</option>
            </select>
          </div>

          <button
            onClick={handleRunClustering}
            disabled={running}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? 'Running...' : 'Run Clustering'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Clustering Result */}
      {result && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Clustering Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Method</p>
              <p className="font-medium">{result.method}</p>
            </div>
            <div>
              <p className="text-gray-500">Clusters</p>
              <p className="font-medium">{result.k}</p>
            </div>
            <div>
              <p className="text-gray-500">Samples</p>
              <p className="font-medium">{result.sample_count}</p>
            </div>
            <div>
              <p className="text-gray-500">Variance Explained</p>
              <p className="font-medium">
                {((result.explained_variance[0] + result.explained_variance[1]) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Cluster Stats */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Cluster Composition</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-1 pr-4">Cluster</th>
                    <th className="text-left py-1 pr-4">Total</th>
                    {Object.keys(
                      Object.values(result.cluster_stats).reduce<Record<string, boolean>>((acc, s) => {
                        Object.keys(s.groups).forEach(g => { acc[g] = true })
                        return acc
                      }, {})
                    ).sort().map(g => (
                      <th key={g} className="text-left py-1 pr-4">{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.cluster_stats).map(([clusterId, stats]) => {
                    const allGroups = Object.keys(
                      Object.values(result.cluster_stats).reduce<Record<string, boolean>>((acc, s) => {
                        Object.keys(s.groups).forEach(g => { acc[g] = true })
                        return acc
                      }, {})
                    ).sort()
                    return (
                      <tr key={clusterId}>
                        <td className="py-1 pr-4">
                          <span className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: CLUSTER_COLORS[parseInt(clusterId)] }}
                            />
                            Cluster {clusterId}
                          </span>
                        </td>
                        <td className="py-1 pr-4">{stats.count}</td>
                        {allGroups.map(g => (
                          <td key={g} className="py-1 pr-4">{stats.groups[g] || 0}</td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Scatter Plot */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : points.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            No clustering data yet. Click &quot;Run Clustering&quot; to start.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            2D Projection (PCA)
          </h3>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="PC1"
                  domain={axisDomains.x}
                  allowDataOverflow
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="PC2"
                  domain={axisDomains.y}
                  allowDataOverflow
                />
                <ZAxis range={[50, 50]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {Object.entries(groupedPoints).map(([key, groupPoints], index) => (
                  <Scatter
                    key={key}
                    name={key}
                    data={groupPoints}
                    fill={
                      colorBy === 'group'
                        ? getGroupColor(key)
                        : CLUSTER_COLORS[index % CLUSTER_COLORS.length]
                    }
                    onClick={(data) => setSelectedPoint(data)}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Click on a point to view the thumbnail
          </p>
        </div>
      )}

      {/* Selected Point Detail */}
      {selectedPoint && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPoint(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedPoint.title || `Thumbnail ${selectedPoint.id}`}
                </h2>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={getThumbnailImageUrl(selectedPoint.file_path)}
                  alt={selectedPoint.title || 'Thumbnail'}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Group</p>
                  <p className="font-medium capitalize">{selectedPoint.group}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Cluster</p>
                  <p className="font-medium">{selectedPoint.cluster_id}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">X (PC1)</p>
                  <p className="font-medium">{selectedPoint.x.toFixed(3)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Y (PC2)</p>
                  <p className="font-medium">{selectedPoint.y.toFixed(3)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
