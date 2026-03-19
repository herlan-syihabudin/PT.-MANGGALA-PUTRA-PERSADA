'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  RefreshCcw, 
  ArrowUpDown,
  Building2,
  Phone,
  Mail,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import { toast } from 'sonner'

interface Vendor {
  vendor_id: string
  vendor_code: string
  vendor_name: string
  phone?: string
  email?: string
  city?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

type SortKey = 'vendor_code' | 'vendor_name' | 'city' | 'status' | 'created_at'
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

export default function VendorsPage() {
  const router = useRouter()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const debouncedSearch = useDebouncedValue(search, 350)
  const abortRef = useRef<AbortController | null>(null)

  // 🔥 FETCH dengan pagination dari backend
  const fetchVendors = useCallback(async (opts?: { silent?: boolean }) => {
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
      qs.set('page', String(pagination.page))
      qs.set('limit', String(pagination.limit))
      qs.set('sort_by', sortKey)
      qs.set('sort_dir', sortDir)

      const res = await fetch(`/api/procurement/vendors?${qs.toString()}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load vendors')
      }

      setVendors(data.data || [])
      setPagination(data.pagination || {
        page: 1,
        limit: pagination.limit,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      })
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      console.error('Fetch error:', err)
      
      // 🔥 Better error messages
      if (err?.message?.includes('rate limit')) {
        setError('Too many requests. Please wait a moment.')
        toast.error('Rate limit exceeded')
      } else {
        setError(err?.message || 'Failed to load vendors')
      }
      
      setVendors([])
    } finally {
      setFetching(false)
      setLoading(false)
    }
  }, [statusFilter, debouncedSearch, pagination.page, pagination.limit, sortKey, sortDir])

  // 🔥 Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K untuk focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
      }
      // Ctrl/Cmd + N untuk new vendor
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/admin/procurement/vendors/create')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // initial + refetch on filter/search/sort
  useEffect(() => {
    fetchVendors()
  }, [statusFilter, debouncedSearch, sortKey, sortDir, pagination.page, pagination.limit])

  function toggleSort(key: SortKey) {
    setPagination(prev => ({ ...prev, page: 1 }))
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
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  function goToPage(newPage: number) {
    setPagination(prev => ({ ...prev, page: Math.max(1, Math.min(newPage, prev.totalPages)) }))
  }

  const hasActiveFilters = search || statusFilter
  const isEmpty = !loading && !error && vendors.length === 0

  // 🔥 Loading skeleton
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

  // 🔥 Error state dengan detail
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-red-600">
                {error.includes('rate limit') ? 'Too Many Requests' : 'Failed to Load Vendors'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
              {error.includes('rate limit') && (
                <p className="text-xs text-gray-500 mt-2">Please wait a moment before retrying</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => fetchVendors()}
              disabled={fetching}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCcw size={16} className={cn(fetching && 'animate-spin')} />
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
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-gray-500">
            Manage supplier/vendor master data • <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">⌘K</kbd> search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchVendors({ silent: true })}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50',
              fetching && 'opacity-70'
            )}
            disabled={fetching}
            title="Refresh (Ctrl+R)"
          >
            <RefreshCcw size={16} className={cn(fetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/procurement/vendors/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Create new vendor (Ctrl+N)"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Vendor</span>
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
              placeholder="Search by name / code / email... (⌘K)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={pagination.limit}
              onChange={(e) => {
                setPagination({ page: 1, limit: Number(e.target.value), total: 0, totalPages: 1, hasNext: false, hasPrev: false })
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
          <span>
            Showing <span className="font-medium text-gray-700">{vendors.length}</span> of{' '}
            <span className="font-medium text-gray-700">{pagination.total}</span> vendor(s)
          </span>
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
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <div className="text-lg font-semibold">No vendors found</div>
            <div className="text-sm text-gray-500 mt-2">
              {hasActiveFilters 
                ? 'No vendors match your filters. Try different keywords or clear filters.'
                : 'Start by creating your first vendor to begin procurement transactions.'}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/admin/procurement/vendors/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Vendor
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
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('vendor_code')}
                      >
                        Code <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('vendor_name')}
                      >
                        Name <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">Contact</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('city')}
                      >
                        City <ArrowUpDown size={14} />
                      </button>
                    </th>
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
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.vendor_id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/procurement/vendors/${vendor.vendor_id}`)}
                    >
                      <td className="p-4 font-mono text-sm whitespace-nowrap">{vendor.vendor_code}</td>
                      <td className="p-4 font-medium">{vendor.vendor_name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm" title="Phone">
                          <Phone size={12} className="text-gray-400" />
                          {vendor.phone || '-'}
                        </div>
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1" title="Email">
                            <Mail size={10} className="text-gray-400" />
                            {vendor.email}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {vendor.city ? (
                          <div className="flex items-center gap-1" title="City">
                            <MapPin size={12} className="text-gray-400" />
                            {vendor.city}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={vendor.status} type="vendor" />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/procurement/vendors/${vendor.vendor_id}`}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="View Details"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Link>
                          <Link
                            href={`/admin/procurement/vendors/${vendor.vendor_id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Edit Vendor"
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

            {/* Pagination Footer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-white">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{pagination.page}</span> of{' '}
                <span className="font-medium text-gray-900">{pagination.totalPages}</span>
                {' '}· Showing <span className="font-medium">{vendors.length}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> vendors
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={!pagination.hasPrev}
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={!pagination.hasPrev}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-2 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={!pagination.hasNext}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => goToPage(pagination.totalPages)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
                  disabled={!pagination.hasNext}
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
