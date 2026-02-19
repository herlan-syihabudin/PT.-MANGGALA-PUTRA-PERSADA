'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Eye,
  RefreshCcw,
  FileText,
  Download,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

/** ================== CONFIG ================== */
// 🔥 SATU PINTU ROUTE (biar ga 404 lagi)
const BASE_PATH = '/procurement/pr' // ganti ke '/admin/procurement/pr' kalau struktur kamu admin-based
const CREATE_PATH = `${BASE_PATH}/create`

type SortField = 'pr_code' | 'request_date' | 'total' | 'status'
type SortOrder = 'asc' | 'desc'

interface PRItem {
  pr_item_id: string
  description: string
  qty: number
  unit: string
  estimated_price?: number
  subtotal?: number
}

interface PR {
  pr_id: string
  pr_code: string
  project_id: string
  project_name?: string
  requested_by: string
  request_date: string
  needed_date?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ORDERED'
  items: PRItem[]
}

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ')
}

export default function PRListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 450)

  const [statusFilter, setStatusFilter] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  })

  // Sort + pagination
  const [sortBy, setSortBy] = useState<SortField>('request_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  // Selection
  const [selectedPRs, setSelectedPRs] = useState<string[]>([])

  // Projects filter list
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])

  const fetchPRs = async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setError(null)
      setRefreshing(true)

      const params = new URLSearchParams({
        include_items: 'true',
        page: String(page),
        limit: String(limit),
        sort_by: sortBy,
        sort_order: sortOrder,
      })

      if (statusFilter) params.append('status', statusFilter)
      if (projectFilter) params.append('project_id', projectFilter)
      if (dateRange.start) params.append('start_date', dateRange.start)
      if (dateRange.end) params.append('end_date', dateRange.end)
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim())

      const res = await fetch(`/api/procurement/pr?${params.toString()}`, {
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Failed to load PRs (${res.status})`)
      }

      setPRs(data.data || [])
      setTotal(data.total ?? data.data?.length ?? 0)
      setLastUpdated(new Date())
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load PRs')
      setPRs([])
      setTotal(0)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load projects (filter dropdown)
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.data
        if (!Array.isArray(arr)) return
        setProjects(
          arr.map((p: any) => ({
            id: p.project_id,
            name: p.project_name,
          }))
        )
      })
      .catch(() => {
        // kalau endpoint projects beda, minimal list tetap jalan tanpa dropdown
        setProjects([])
      })
  }, [])

  useEffect(() => {
    fetchPRs()
    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder, statusFilter, projectFilter, dateRange.start, dateRange.end, debouncedSearch])

  const computedPRs = useMemo(() => {
    return prs.map((pr) => ({
      ...pr,
      total:
        pr.items?.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0) || 0,
    }))
  }, [prs])

  const stats = useMemo(() => {
    const totalCount = computedPRs.length
    const draft = computedPRs.filter((p) => p.status === 'DRAFT').length
    const submitted = computedPRs.filter((p) => p.status === 'SUBMITTED').length
    const approved = computedPRs.filter((p) => p.status === 'APPROVED').length
    const totalValue = computedPRs.reduce((sum, p) => sum + (p.total || 0), 0)
    return { total: totalCount, draft, submitted, approved, totalValue }
  }, [computedPRs])

  const toggleSelect = (id: string) => {
    setSelectedPRs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (computedPRs.length === 0) return
    setSelectedPRs((prev) => (prev.length === computedPRs.length ? [] : computedPRs.map((p) => p.pr_id)))
  }

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setProjectFilter('')
    setDateRange({ start: '', end: '' })
    setPage(1)
  }

  const exportToCSV = () => {
    if (computedPRs.length === 0) return

    const rows = computedPRs.map((pr) => ({
      PR_Number: pr.pr_code,
      Project: pr.project_name || pr.project_id,
      Requested_By: pr.requested_by,
      Request_Date: pr.request_date,
      Need_By: pr.needed_date || '-',
      Total: pr.total,
      Status: pr.status,
      Items: pr.items?.length || 0,
    }))

    const headers = Object.keys(rows[0]).join(',')
    const body = rows.map((r) => Object.values(r).join(',')).join('\n')
    const csv = `${headers}\n${body}`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pr-list-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">{error}</div>
        <button
          onClick={fetchPRs}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchase Requests</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Total: {stats.total} PR</span>
            <span>•</span>
            <span>Value: <Money value={stats.totalValue} /></span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString('id-ID')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cx(
              'px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2',
              showFilters && 'bg-blue-50 border-blue-200'
            )}
          >
            <Filter size={16} />
            Filters
            {(statusFilter || projectFilter || dateRange.start || dateRange.end || search.trim()) && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={exportToCSV}
            disabled={computedPRs.length === 0}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Export to CSV"
          >
            <Download size={16} />
          </button>

          <button
            onClick={fetchPRs}
            disabled={refreshing}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <Link
            href={CREATE_PATH}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New PR
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total PR" value={stats.total} color="blue" icon={FileText} />
        <StatCard
          label="Draft"
          value={stats.draft}
          color="gray"
          subtitle={`${((stats.draft / (stats.total || 1)) * 100).toFixed(0)}%`}
        />
        <StatCard label="Submitted" value={stats.submitted} color="yellow" subtitle="Menunggu approval" />
        <StatCard label="Approved" value={stats.approved} color="green" subtitle="Siap PO" />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="PR code / requester..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ORDERED">Ordered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange((d) => ({ ...d, start: e.target.value }))
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange((d) => ({ ...d, end: e.target.value }))
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk action */}
      {selectedPRs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-blue-600" />
            <span className="font-medium">{selectedPRs.length} PR selected</span>
          </div>
          <button
            onClick={() => setSelectedPRs([])}
            className="px-3 py-1.5 border border-blue-200 rounded-lg text-sm hover:bg-blue-100"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedPRs.length === computedPRs.length && computedPRs.length > 0}
                  />
                </th>

                <SortableTH
                  label="PR Number"
                  active={sortBy === 'pr_code'}
                  order={sortOrder}
                  onClick={() => handleSort('pr_code')}
                />

                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Requester</th>

                <SortableTH
                  label="Request Date"
                  active={sortBy === 'request_date'}
                  order={sortOrder}
                  onClick={() => handleSort('request_date')}
                />

                <th className="p-4 text-left">Need By</th>

                <SortableTH
                  label="Total"
                  align="right"
                  active={sortBy === 'total'}
                  order={sortOrder}
                  onClick={() => handleSort('total')}
                />

                <SortableTH
                  label="Status"
                  active={sortBy === 'status'}
                  order={sortOrder}
                  onClick={() => handleSort('status')}
                />

                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {computedPRs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12">
                    <div className="text-center space-y-3">
                      <FileText className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="text-gray-500 font-medium">No Purchase Request found</p>
                      <Link
                        href={CREATE_PATH}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={16} />
                        Create First PR
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                computedPRs.map((pr) => (
                  <tr
                    key={pr.pr_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`${BASE_PATH}/${pr.pr_id}`)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedPRs.includes(pr.pr_id)}
                        onChange={() => toggleSelect(pr.pr_id)}
                      />
                    </td>

                    <td className="p-4 font-mono font-medium">{pr.pr_code}</td>
                    <td className="p-4">{pr.project_name || pr.project_id}</td>
                    <td className="p-4">{pr.requested_by}</td>
                    <td className="p-4">
                      <DateText date={pr.request_date} />
                    </td>
                    <td className="p-4">
                      {pr.needed_date ? <DateText date={pr.needed_date} /> : '-'}
                    </td>
                    <td className="p-4 text-right font-medium">
                      <Money value={pr.total} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={pr.status} type="pr" />
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {pr.items?.length || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Link
                          href={`${BASE_PATH}/${pr.pr_id}`}
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                          title="View"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {computedPRs.length > 0 && (
          <div className="border-t px-4 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} PRs
            </div>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>

              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">{page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** ================== UI SMALL PARTS ================== */
function SortableTH({
  label,
  active,
  order,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  order: 'asc' | 'desc'
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={cx(
        'p-4 cursor-pointer hover:bg-gray-100 select-none',
        align === 'right' ? 'text-right' : 'text-left'
      )}
      onClick={onClick}
    >
      <div className={cx('flex items-center gap-1', align === 'right' && 'justify-end')}>
        {label}
        {active && (order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </div>
    </th>
  )
}

function StatCard({
  label,
  value,
  color = 'blue',
  icon: Icon,
  subtitle,
}: {
  label: string
  value: number
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  icon?: any
  subtitle?: string
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  }

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{label}</p>
        {Icon && <Icon size={16} />}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  )
}
