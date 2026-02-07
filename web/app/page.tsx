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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getOverviewStats, getPipelineStatus } from '@/lib/api'
import type { OverviewStats, PipelineStatus } from '@/lib/types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']
const GROUP_COLORS: Record<string, string> = {
  mrbeast: '#3b82f6',
  modern: '#10b981',
  historical: '#f59e0b',
}

export default function Dashboard() {
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewData, pipelineData] = await Promise.all([
          getOverviewStats(),
          getPipelineStatus(),
        ])
        setOverview(overviewData)
        setPipeline(pipelineData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <p className="text-red-600 text-sm mt-1">
          Make sure the backend server is running on http://localhost:8000
        </p>
      </div>
    )
  }

  if (!overview) return null

  // Prepare data for charts
  const groupData = Object.entries(overview.by_group).map(([name, count]) => ({
    name,
    count,
    fill: GROUP_COLORS[name] || '#6b7280',
  }))

  const yearData = Object.entries(overview.by_year)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of the thumbnail dataset and analysis status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Total Thumbnails</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {overview.total_thumbnails}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Features Extracted</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {overview.features_extracted}
          </p>
          <p className="text-sm text-gray-500">
            {pipeline
              ? `${pipeline.completion_percentage}% complete`
              : ''}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Missing Views</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {overview.missing_views}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-500">Missing CTR</p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {overview.missing_ctr}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Group Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thumbnails by Group
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {groupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center space-x-6">
            {groupData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-600 capitalize">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Year Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thumbnails by Year
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      {pipeline && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Feature Extraction Progress</span>
                <span className="text-gray-900 font-medium">
                  {pipeline.processed} / {pipeline.total_thumbnails}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${pipeline.completion_percentage}%` }}
                />
              </div>
            </div>
            {pipeline.unprocessed > 0 && (
              <p className="text-sm text-gray-500">
                {pipeline.unprocessed} thumbnails waiting to be processed
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
