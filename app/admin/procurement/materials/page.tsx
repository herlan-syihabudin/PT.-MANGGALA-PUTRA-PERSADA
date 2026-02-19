'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  RefreshCcw, 
  ArrowUpDown,
  Package,
  AlertCircle,
  X
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'

interface Material {
  material_id: string
  material_code: string
  material_name: string
  category?: string
  unit: string
  default_price?: number
  last_price?: number
  min_stock?: number
  location?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
}

type SortKey = 'material_code' | 'material_name' | 'category' | 'unit' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function normalizeStr(v: any) {
  return String(v || '').trim().toLowerCase()
}

function compare(a: any, b: any) {
  const A = normalizeStr(a)
  const B = normalizeStr(b)
  if (A < B) return -1
  if (A > B) return 1
  return 0
}

export default function MaterialsPage() {
  const router = useRouter()

  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const [categories, setCategories] = useState<string[]>([])

  const debouncedSearch = useDebouncedValue(search, 350)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchMaterials(opts?: { silent?: boolean }) {
    const silent = opts?.silent ?? false

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (!silent) setLoading(true)
      setFetching(true)
      setError(null)

      const qs = new URLSearchParams()
      if (statusFilter) qs.set('status', statusFilter)
      if (debouncedSearch.trim()) qs.set('search', debouncedSearch.trim())

      const res = await fetch(`/api/procurement/materials?${qs.toString()}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load materials')
      }

      const materialsData = Array.isArray(data.data) ? data.data : []
      setMaterials(materialsData)

      // Extract unique categories for filter
      const uniqueCategories = Array.from(
        new Set(materialsData.map((m: Material) => m.category).filter(Boolean))
      ) as string[]
      setCategories(uniqueCategories)

    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('Fetch error:', err)
      setError(err?.message || 'Failed to load materials')
      setMaterials([])
    } finally {
      setFetching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchMaterials()
  }, [statusFilter, debouncedSearch])

  const filteredMaterials = useMemo(() => {
    let filtered = [...materials]
    
    if (categoryFilter) {
      filtered = filtered.filter(m => m.category === categoryFilter)
    }
    
    return filtered
  }, [materials, categoryFilter])

  const sortedMaterials = useMemo(() => {
    const arr = [...filteredMaterials]
    arr.sort((x, y) => {
      let c = 0
      switch (sortKey) {
        case 'material_code':
          c = compare(x.material_code, y.material_code)
          break
        case 'material_name':
          c = compare(x.material_name, y.material_name)
          break
        case 'category':
          c = compare(x.category, y.category)
          break
        case 'unit':
          c = compare(x.unit, y.unit)
          break
        case 'status':
          c = compare(x.status, y.status)
          break
        case 'created_at':
        default:
          c = compare(x.created_at, y.created_at)
          break
      }
      return sortDir === 'asc' ? c : -c
    })
    return arr
  }, [filteredMaterials, sortKey, sortDir])

  const totalRows = sortedMaterials.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  const pagedMaterials = useMemo(() => {
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    return sortedMaterials.slice(start, start + pageSize)
  }, [sortedMaterials, page, pageSize, totalPages])

  function toggleSort(key: SortKey) {
    setPage(1)
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setPage(1)
  }

  const hasActiveFilters = search || statusFilter || categoryFilter
  const isEmpty = !loading && !error && totalRows === 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-red-600">Gagal memuat Materials</h1>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchMaterials()}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCcw size={16} />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Material Master</h1>
          <p className="text-sm text-gray-500">Manage materials and items for procurement</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchMaterials({ silent: true })}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50',
              fetching && 'opacity-70'
            )}
            disabled={fetching}
            title="Refresh"
          >
            <RefreshCcw size={16} className={cn(fetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/procurement/materials/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Material</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1)
                setPageSize(Number(e.target.value))
              }}
              className="px-3 py-2 border rounded-lg bg-white"
              title="Rows per page"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1 text-sm"
                title="Clear filters"
              >
                <X size={14} />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <span>Showing <span className="font-medium text-gray-700">{totalRows}</span> material(s)</span>
          {fetching && (
            <span className="inline-flex items-center gap-1">
              <RefreshCcw size={12} className="animate-spin" />
              syncing...
            </span>
          )}
        </div>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <div className="mx-auto max-w-md">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <div className="text-lg font-semibold">No materials found</div>
            <div className="text-sm text-gray-500 mt-2">
              {hasActiveFilters 
                ? 'No materials match your filters. Try different keywords or clear filters.'
                : 'Create your first material to start procurement.'}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/admin/procurement/materials/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Material
              </Link>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-auto max-h-[70vh]">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('material_code')}
                      >
                        Code <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('material_name')}
                      >
                        Name <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('category')}
                      >
                        Category <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('unit')}
                      >
                        Unit <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-right text-sm font-medium text-gray-600">Default Price</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-600">Last Price</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-600">Min Stock</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Location</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('status')}
                      >
                        Status <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedMaterials.map((material) => (
                    <tr
                      key={material.material_id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/procurement/materials/${material.material_id}`)}
                    >
                      <td className="p-4 font-mono text-sm whitespace-nowrap">{material.material_code}</td>
                      <td className="p-4 font-medium">{material.material_name}</td>
                      <td className="p-4">{material.category || '-'}</td>
                      <td className="p-4">{material.unit}</td>
                      <td className="p-4 text-right font-medium">
                        {material.default_price ? <Money value={material.default_price} /> : '-'}
                      </td>
                      <td className="p-4 text-right">
                        {material.last_price ? <Money value={material.last_price} /> : '-'}
                      </td>
                      <td className="p-4 text-right">{material.min_stock || '-'}</td>
                      <td className="p-4">{material.location || '-'}</td>
                      <td className="p-4">
                        <StatusBadge status={material.status} type="vendor" />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/procurement/materials/${material.material_id}`}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="View Details"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Link>
                          <Link
                            href={`/admin/procurement/materials/${material.material_id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Edit Material"
                          >
                            <Edit size={16} className="text-gray-700" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-white">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{page}</span> of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
                {' '}· Showing <span className="font-medium">{pagedMaterials.length}</span> materials
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={page <= 1}
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span className="px-3 py-2 text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={page >= totalPages}
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={page >= totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
