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
  Legend,
} from 'recharts'
import { compareGroups, getDistribution } from '@/lib/api'
import type { CompareStats, DistributionStats } from '@/lib/types'
import { GROUPS, getGroupColor } from '@/lib/constants'

const FEATURES = [
  { value: 'color.avg_saturation', label: 'Average Saturation' },
  { value: 'color.avg_brightness', label: 'Average Brightness' },
  { value: 'color.warm_cool_score', label: 'Warm/Cool Score' },
  { value: 'text.text_area_ratio', label: 'Text Area Ratio' },
  { value: 'text.text_box_count', label: 'Text Box Count' },
  { value: 'face.face_count', label: 'Face Count' },
  { value: 'face.largest_face_area_ratio', label: 'Largest Face Size' },
  { value: 'face.emotion_proxies.smile_score', label: 'Smile Score' },
  { value: 'face.emotion_proxies.mouth_open_score', label: 'Mouth Open Score' },
  { value: 'face.emotion_proxies.brow_raise_score', label: 'Brow Raise Score' },
  { value: 'pose.hand_visible_count', label: 'Visible Hands' },
  { value: 'pose.body_coverage', label: 'Body Coverage' },
  { value: 'depth.depth_contrast', label: 'Depth Contrast' },
  { value: 'depth.foreground_ratio', label: 'Foreground Ratio' },
]

export default function ComparePage() {
  const [selectedFeature, setSelectedFeature] = useState(FEATURES[0].value)
  const [compareData, setCompareData] = useState<CompareStats | null>(null)
  const [distributions, setDistributions] = useState<Record<string, DistributionStats>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [compare, ...groupDists] = await Promise.all([
          compareGroups(selectedFeature),
          ...GROUPS.map(g => getDistribution(selectedFeature, g)),
        ])
        setCompareData(compare)
        const distMap: Record<string, DistributionStats> = {}
        GROUPS.forEach((g, i) => { distMap[g] = groupDists[i] })
        setDistributions(distMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedFeature])

  const featureLabel = FEATURES.find(f => f.value === selectedFeature)?.label || selectedFeature

  // Prepare comparison chart data
  const comparisonChartData = compareData
    ? Object.entries(compareData.groups).map(([group, stats]) => ({
        group,
        mean: stats.mean,
        median: stats.median,
        fill: getGroupColor(group),
      }))
    : []

  // Prepare histogram data (combined)
  const histogramData = Object.entries(distributions).length > 0
    ? (() => {
        // Get all unique bin starts
        const allBins = new Set<number>()
        Object.values(distributions).forEach(dist => {
          dist.histogram.forEach(bin => allBins.add(bin.bin_start))
        })

        // Sort bins
        const sortedBins = Array.from(allBins).sort((a, b) => a - b)

        // Create combined data
        return sortedBins.map(binStart => {
          const data: Record<string, number | string> = {
            bin: binStart.toFixed(3),
          }
          Object.entries(distributions).forEach(([group, dist]) => {
            const bin = dist.histogram.find(b => Math.abs(b.bin_start - binStart) < 0.0001)
            data[group] = bin?.count || 0
          })
          return data
        })
      })()
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compare Groups</h1>
        <p className="mt-2 text-gray-600">
          Compare feature distributions across thumbnail groups
        </p>
      </div>

      {/* Feature Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Feature
        </label>
        <select
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
        >
          {FEATURES.map((feature) => (
            <option key={feature.value} value={feature.value}>
              {feature.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      ) : (
        <>
          {/* Comparison Stats */}
          {compareData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {featureLabel} - Group Comparison
              </h2>

              {/* Stats Table */}
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mean
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Median
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Std Dev
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Min
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Max
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(compareData.groups).map(([group, stats]) => (
                      <tr key={group}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getGroupColor(group) }}
                            />
                            <span className="capitalize font-medium">{group}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.mean.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.median.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.std.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.min.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {stats.max.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mean Comparison Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="group" width={80} />
                    <Tooltip />
                    <Bar dataKey="mean" name="Mean">
                      {comparisonChartData.map((entry, index) => (
                        <Bar key={index} dataKey="mean" fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Distribution Histogram */}
          {histogramData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {featureLabel} - Distribution
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="bin"
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {GROUPS.map(g => (
                      <Bar key={g} dataKey={g} fill={getGroupColor(g)} name={g} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
