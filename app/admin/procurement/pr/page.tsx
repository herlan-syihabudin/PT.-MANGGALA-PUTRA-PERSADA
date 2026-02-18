'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
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
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  ArrowUpDown
} from 'lucide-react'
import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

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

type SortField = 'pr_code' | 'request_date' | 'total' | 'status'

export default function PRListPage() {
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  // Data states
  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>()

  // Filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [projectFilter, setProjectFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Sort states
  const [sortBy, setSortBy] = useState<SortField>('request_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination states
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  // Selection states
  const [selectedPRs, setSelectedPRs] = useState<string[]>([])

  // Projects list for filter
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])

  async function fetchPRs() {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setRefreshing(true)
      setError(null)

      const params = new URLSearchParams({
        include_items: 'true',
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      })

      if (statusFilter) params.append('status', statusFilter)
      if (projectFilter) params.append('project_id', projectFilter)
      if (dateRange.start) params.append('start_date', dateRange.start)
      if (dateRange.end) params.append('end_date', dateRange.end)
      if (search) params.append('search', search)

      const res = await fetch(`/api/procurement/pr?${params}`, {
        signal: controller.signal
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load PRs')
      }

      setPRs(data.data || [])
      setTotal(data.total || data.data?.length || 0)
      setLastUpdated(new Date())
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Failed to load PRs')
      setPRs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch projects for filter
  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data.map((p: any) => ({ 
          id: p.project_id, 
          name: p.project_name 
        })))
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchPRs()
    return () => abortRef.current?.abort()
  }, [page, limit, sortBy, sortOrder, statusFilter, projectFilter, dateRange, search])

  const computedPRs = useMemo(() => {
    return prs.map(pr => ({
      ...pr,
      total: pr.items?.reduce(
        (sum, item) => sum + (item.subtotal || 0),
        0
      ) || 0
    }))
  }, [prs])

  // Stats
  const stats = useMemo(() => ({
    total: prs.length,
    draft: prs.filter(p => p.status === 'DRAFT').length,
    submitted: prs.filter(p => p.status === 'SUBMITTED').length,
    approved: prs.filter(p => p.status === 'APPROVED').length,
    totalValue: prs.reduce((sum, p) => sum + (p.total || 0), 0)
  }), [prs])

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedPRs(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPRs.length === computedPRs.length) {
      setSelectedPRs([])
    } else {
      setSelectedPRs(computedPRs.map(p => p.pr_id))
    }
  }

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Export
  const exportToCSV = () => {
    const data = computedPRs.map(pr => ({
      'PR Number': pr.pr_code,
      'Project': pr.project_name || pr.project_id,
      'Requested By': pr.requested_by,
      'Request Date': pr.request_date,
      'Need By': pr.needed_date || '-',
      'Total': pr.total,
      'Status': pr.status,
      'Items': pr.items?.length || 0
    }))

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pr-list-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Clear filters
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setProjectFilter('')
    setDateRange({ start: '', end: '' })
    setPage(1)
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
          onClick={() => fetchPRs()}
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
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${
              showFilters ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <Filter size={16} />
            Filters
            {(statusFilter || projectFilter || dateRange.start) && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={exportToCSV}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            title="Export to CSV"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => fetchPRs()}
            disabled={refreshing}
            className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <Link
            href="/admin/procurement/pr/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New PR
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total PR" 
          value={stats.total} 
          color="blue"
          icon={FileText}
        />
        <StatCard 
          label="Draft" 
          value={stats.draft} 
          color="gray"
          subtitle={`${((stats.draft / stats.total) * 100 || 0).toFixed(0)}%`}
        />
        <StatCard 
          label="Submitted" 
          value={stats.submitted} 
          color="yellow"
          subtitle="Menunggu approval"
        />
        <StatCard 
          label="Approved" 
          value={stats.approved} 
          color="green"
          subtitle="Siap PO"
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="PR code / requester..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedPRs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Check size={18} className="text-blue-600" />
            <span className="font-medium">{selectedPRs.length} PR selected</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
              Approve Selected
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              Reject Selected
            </button>
            <button
              onClick={() => setSelectedPRs([])}
              className="px-3 py-1.5 border border-blue-200 rounded-lg text-sm hover:bg-blue-100"
            >
              Clear
            </button>
          </div>
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
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('pr_code')}
                >
                  <div className="flex items-center gap-1">
                    PR Number
                    {sortBy === 'pr_code' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Project</th>
                <th className="p-4 text-left">Requester</th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('request_date')}
                >
                  <div className="flex items-center gap-1">
                    Request Date
                    {sortBy === 'request_date' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="p-4 text-left">Need By</th>
                <th 
                  className="p-4 text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total
                    {sortBy === 'total' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th 
                  className="p-4 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {computedPRs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12">
                    <div className="text-center space-y-4">
                      <FileText className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="text-gray-500 font-medium">No Purchase Request found</p>
                      {search && (
                        <p className="text-sm text-gray-400">
                          No results for "{search}". Try different keywords.
                        </p>
                      )}
                      <Link
                        href="/admin/procurement/pr/create"
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
                    onClick={() => router.push(`/procurement/pr/${pr.pr_id}`)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedPRs.includes(pr.pr_id)}
                        onChange={() => toggleSelect(pr.pr_id)}
                      />
                    </td>

                    <td className="p-4 font-mono font-medium">
                      {pr.pr_code}
                    </td>

                    <td className="p-4">
                      {pr.project_name || pr.project_id}
                    </td>

                    <td className="p-4">
                      {pr.requested_by}
                    </td>

                    <td className="p-4">
                      <DateText date={pr.request_date} />
                    </td>

                    <td className="p-4">
                      {pr.needed_date ? (
                        <DateText date={pr.needed_date} />
                      ) : (
                        '-'
                      )}
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
                          href={`/procurement/pr/${pr.pr_id}`}
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
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
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded">
                  {page}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
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

// Stat Card Component
function StatCard({ 
  label, 
  value, 
  color = 'blue',
  icon: Icon,
  subtitle 
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
