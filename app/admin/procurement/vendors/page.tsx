'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Eye, RefreshCcw, ArrowUpDown } from 'lucide-react'
import StatusBadge from '@/components/dashboard/procurement/StatusBadge'

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

export default function VendorsPage() {
  const router = useRouter()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const debouncedSearch = useDebouncedValue(search, 350)
  const abortRef = useRef<AbortController | null>(null)

  async function fetchVendors(opts?: { silent?: boolean }) {
    const silent = opts?.silent ?? false

    // cancel previous
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

      const res = await fetch(`/api/procurement/vendors?${qs.toString()}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load vendors')
      }

      setVendors(Array.isArray(data.data) ? data.data : [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load vendors')
      setVendors([])
    } finally {
      setFetching(false)
      setLoading(false)
    }
  }

  // initial + refetch on filter/search
  useEffect(() => {
    // reset pagination on new query
    setPage(1)
    fetchVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch])

  const sortedVendors = useMemo(() => {
    const arr = [...vendors]
    arr.sort((x, y) => {
      let c = 0
      switch (sortKey) {
        case 'vendor_code':
          c = compare(x.vendor_code, y.vendor_code)
          break
        case 'vendor_name':
          c = compare(x.vendor_name, y.vendor_name)
          break
        case 'city':
          c = compare(x.city, y.city)
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
  }, [vendors, sortKey, sortDir])

  const totalRows = sortedVendors.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  const pagedVendors = useMemo(() => {
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * pageSize
    return sortedVendors.slice(start, start + pageSize)
  }, [sortedVendors, page, pageSize, totalPages])

  function toggleSort(key: SortKey) {
    setPage(1)
    setSortKey(prev => {
      if (prev !== key) {
        setSortDir('asc')
        return key
      }
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
      return prev
    })
  }

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
              <h1 className="text-lg font-semibold text-red-600">Gagal memuat Vendors</h1>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchVendors()}
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
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-gray-500">Manage supplier/vendor master data</p>
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
            title="Refresh"
          >
            <RefreshCcw size={16} className={cn(fetching && 'animate-spin')} />
            Refresh
          </button>

          <Link
            href="/procurement/vendors/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New Vendor
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
              placeholder="Search by name / code / email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{totalRows}</span> vendor(s)
          {fetching ? <span className="ml-2">(syncing...)</span> : null}
        </div>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="text-lg font-semibold">No vendors found</div>
            <div className="text-sm text-gray-500 mt-2">
              Coba ubah filter/search, atau buat vendor baru untuk mulai transaksi procurement.
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/procurement/vendors/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Create Vendor
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Reset Filter
              </button>
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
                        title="Sort"
                      >
                        Code <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('vendor_name')}
                        title="Sort"
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
                        title="Sort"
                      >
                        City <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-left text-sm font-medium text-gray-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-gray-900"
                        onClick={() => toggleSort('status')}
                        title="Sort"
                      >
                        Status <ArrowUpDown size={14} />
                      </button>
                    </th>
                    <th className="p-4 text-center text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedVendors.map((vendor) => (
                    <tr
                      key={vendor.vendor_id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/procurement/vendors/${vendor.vendor_id}`)}
                    >
                      <td className="p-4 font-mono text-sm whitespace-nowrap">{vendor.vendor_code}</td>
                      <td className="p-4 font-medium">{vendor.vendor_name}</td>
                      <td className="p-4">
                        <div className="text-sm">{vendor.phone || '-'}</div>
                        <div className="text-xs text-gray-500">{vendor.email || ''}</div>
                      </td>
                      <td className="p-4">{vendor.city || '-'}</td>
                      <td className="p-4">
                        <StatusBadge status={vendor.status} type="vendor" />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/procurement/vendors/${vendor.vendor_id}`}
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={(e) => e.stopPropagation()}
                            title="View"
                          >
                            <Eye size={16} className="text-blue-600" />
                          </Link>
                          <Link
                            href={`/procurement/vendors/${vendor.vendor_id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded"
                            onClick={(e) => e.stopPropagation()}
                            title="Edit"
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
                Page <span className="font-medium text-gray-900">{page}</span> of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={page <= 1}
                >
                  First
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={page >= totalPages}
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
