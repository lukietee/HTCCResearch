'use client'

import { useEffect, useState } from 'react'
import { getThumbnails, getThumbnailImageUrl } from '@/lib/api'
import type { Thumbnail, ThumbnailListResponse } from '@/lib/types'

const GROUPS = ['', 'mrbeast', 'modern', 'historical']
const SORT_OPTIONS = [
  { value: 'id', label: 'ID' },
  { value: 'year', label: 'Year' },
]

export default function ThumbnailsPage() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null)

  // Filters
  const [group, setGroup] = useState('')
  const [hasText, setHasText] = useState<string>('')
  const [minFaces, setMinFaces] = useState<string>('')
  const [sort, setSort] = useState('id')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')

  const pageSize = 12

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, unknown> = {
          page,
          page_size: pageSize,
          sort,
          order,
        }
        if (group) params.group = group
        if (hasText === 'true') params.has_text = true
        if (hasText === 'false') params.has_text = false
        if (minFaces) params.min_faces = parseInt(minFaces)

        const response = await getThumbnails(params as Parameters<typeof getThumbnails>[0])
        setThumbnails(response.items)
        setTotal(response.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page, group, hasText, minFaces, sort, order])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thumbnail Explorer</h1>
        <p className="mt-2 text-gray-600">
          Browse and filter thumbnail images with their extracted features
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <select
              value={group}
              onChange={(e) => { setGroup(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="">All Groups</option>
              {GROUPS.filter(g => g).map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Has Text
            </label>
            <select
              value={hasText}
              onChange={(e) => { setHasText(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Faces
            </label>
            <select
              value={minFaces}
              onChange={(e) => { setMinFaces(e.target.value); setPage(1); }}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
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
          {/* Results count */}
          <p className="text-sm text-gray-500">
            Showing {thumbnails.length} of {total} thumbnails
          </p>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {thumbnails.map((thumb) => (
              <div
                key={thumb.id}
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedThumbnail(thumb)}
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={getThumbnailImageUrl(thumb.file_path)}
                    alt={thumb.title || `Thumbnail ${thumb.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.png'
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      thumb.group === 'mrbeast' ? 'bg-blue-100 text-blue-800' :
                      thumb.group === 'modern' ? 'bg-green-100 text-green-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {thumb.group}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {thumb.title || `Thumbnail ${thumb.id}`}
                  </p>
                  {thumb.year && (
                    <p className="text-xs text-gray-500">{thumb.year}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {thumb.features?.face && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {thumb.features.face.face_count} faces
                      </span>
                    )}
                    {thumb.features?.text?.has_text && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        has text
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedThumbnail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedThumbnail(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedThumbnail.title || `Thumbnail ${selectedThumbnail.id}`}
                </h2>
                <button
                  onClick={() => setSelectedThumbnail(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={getThumbnailImageUrl(selectedThumbnail.file_path)}
                  alt={selectedThumbnail.title || 'Thumbnail'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Features */}
              {selectedThumbnail.features && (
                <div className="space-y-4">
                  {/* Color Features */}
                  {selectedThumbnail.features.color && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Saturation</p>
                          <p className="font-medium">{(selectedThumbnail.features.color.avg_saturation * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Brightness</p>
                          <p className="font-medium">{(selectedThumbnail.features.color.avg_brightness * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Warm/Cool</p>
                          <p className="font-medium">{selectedThumbnail.features.color.warm_cool_score.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-1">
                        {selectedThumbnail.features.color.dominant_palette.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Face Features */}
                  {selectedThumbnail.features.face && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Face</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Face Count</p>
                          <p className="font-medium">{selectedThumbnail.features.face.face_count}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Face Size</p>
                          <p className="font-medium">{(selectedThumbnail.features.face.largest_face_area_ratio * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Smile Score</p>
                          <p className="font-medium">{selectedThumbnail.features.face.emotion_proxies.smile_score.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Features */}
                  {selectedThumbnail.features.text && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Text</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Has Text</p>
                          <p className="font-medium">{selectedThumbnail.features.text.has_text ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Text Area</p>
                          <p className="font-medium">{(selectedThumbnail.features.text.text_area_ratio * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Text Boxes</p>
                          <p className="font-medium">{selectedThumbnail.features.text.text_box_count}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Depth Features */}
                  {selectedThumbnail.features.depth && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Depth</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Contrast</p>
                          <p className="font-medium">{selectedThumbnail.features.depth.depth_contrast.toFixed(3)}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Foreground</p>
                          <p className="font-medium">{(selectedThumbnail.features.depth.foreground_ratio * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-500">Subject Center</p>
                          <p className="font-medium">
                            ({selectedThumbnail.features.depth.subject_depth_center.x.toFixed(2)},
                            {selectedThumbnail.features.depth.subject_depth_center.y.toFixed(2)})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
