'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, RefreshCcw, X } from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import DateText from '@/components/dashboard/procurement/DateText'
import Money from '@/components/dashboard/procurement/Money'

interface GR {
  gr_id: string
  gr_code: string
  po_id: string
  po_code?: string
  vendor_id: string
  vendor_name?: string
  project_id: string
  project_name?: string
  receive_date: string
  delivery_note_no?: string
  status: 'RECEIVED' | 'PARTIAL'
  notes?: string
  total_received_qty: number
  total_amount: number
  created_by: string
  created_at: string
  item_count: number
}

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

export default function GRListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [grs, setGRs] = useState<GR[]>([])
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [poFilter, setPOFilter] = useState<string>('')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)

  const debouncedSearch = useDebouncedValue(search, 350)

  /* ================= PO OPTIONS (FIXED) ================= */

  const poOptions = useMemo(() => {
    const map = new Map<string, string>()
    grs.forEach(g => {
      if (g.po_id && g.po_code) {
        map.set(g.po_id, g.po_code)
      }
    })
    return Array.from(map.entries()) // [po_id, po_code]
  }, [grs])

  /* ================= FETCH ================= */

  async function fetchGRs(opts?: { silent?: boolean }) {
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
      if (poFilter) qs.set('po_id', poFilter)

      const res = await fetch(`/api/procurement/gr?${qs.toString()}`, {
        signal: controller.signal,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load GR')
      }

      setGRs(data.data || [])
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load GR')
      setGRs([])
    } finally {
      setFetching(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchGRs()
  }, [statusFilter, poFilter])

  /* ================= FILTER ================= */

  const filteredGRs = useMemo(() => {
    return grs.filter(gr => {
      const matchesSearch =
        debouncedSearch === '' ||
        gr.gr_code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        gr.po_code?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        gr.delivery_note_no?.toLowerCase().includes(debouncedSearch.toLowerCase())

      return matchesSearch
    })
  }, [grs, debouncedSearch])

  const totalRows = filteredGRs.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  /* ================= PAGE CLAMP FIX ================= */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page])

  const pagedGRs = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredGRs.slice(start, start + pageSize)
  }, [filteredGRs, page, pageSize])

  const hasActiveFilters = search || statusFilter || poFilter

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setPOFilter('')
    setPage(1)
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">{error}</div>
        <button
          onClick={() => fetchGRs()}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Goods Receipt</h1>
          <p className="text-sm text-gray-500">
            Manage incoming goods from vendors
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchGRs({ silent: true })}
            className={cn(
              'px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2',
              fetching && 'opacity-70'
            )}
            disabled={fetching}
          >
            <RefreshCcw size={16} className={cn(fetching && 'animate-spin')} />
            Refresh
          </button>

          <Link
            href="/admin/procurement/gr/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New GR
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap gap-3 items-center">

        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search GR / PO / Delivery Note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={poFilter}
          onChange={(e) => setPOFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">All PO</option>
          {poOptions.map(([id, code]) => (
            <option key={id} value={id}>{code}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white"
        >
          <option value="">All Status</option>
          <option value="RECEIVED">Received</option>
          <option value="PARTIAL">Partial</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => {
            setPage(1)
            setPageSize(Number(e.target.value))
          }}
          className="px-3 py-2 border rounded-lg bg-white"
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
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">GR Code</th>
                <th className="p-4 text-left">PO Code</th>
                <th className="p-4 text-left">Receive Date</th>
                <th className="p-4 text-left">Delivery Note</th>
                <th className="p-4 text-right">Items</th>
                <th className="p-4 text-right">Total Qty</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {pagedGRs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    No Goods Receipt found
                  </td>
                </tr>
              ) : (
                pagedGRs.map((gr) => (
                  <tr
                    key={gr.gr_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/admin/procurement/gr/${gr.gr_id}`)}
                  >
                    <td className="p-4 font-mono font-medium">{gr.gr_code}</td>
                    <td className="p-4 font-mono text-sm">{gr.po_code}</td>
                    <td className="p-4">
                      <DateText date={gr.receive_date} />
                    </td>
                    <td className="p-4">{gr.delivery_note_no || '-'}</td>
                    <td className="p-4 text-right">{gr.item_count}</td>
                    <td className="p-4 text-right font-medium">{gr.total_received_qty}</td>
                    <td className="p-4 text-right font-medium text-green-600">
                      <Money value={gr.total_amount} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={gr.status} type="gr" />
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/procurement/gr/${gr.gr_id}`}
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={16} className="text-blue-600" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRows > 0 && (
          <div className="flex justify-between items-center p-4 border-t bg-white text-sm">
            <div>
              Page {page} of {totalPages} · Showing {pagedGRs.length} of {totalRows}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage(1)} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">First</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
              <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Last</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
