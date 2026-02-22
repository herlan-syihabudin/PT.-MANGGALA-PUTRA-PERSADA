// ===================== FITUR LENGKAP YANG HARUS DITAMBAH =====================

'use client'

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Copy,
  Archive,
  Download,
  Trash2
} from "lucide-react"

type BoqHeader = {
  boq_id: string
  project_id: string
  project_name: string
  customer_name: string
  status: 'DRAFT' | 'LOCKED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'
  total_items: number
  total_value: number
  created_at: string
  updated_at: string
  created_by: string
}

type SortKey = 'boq_id' | 'project_name' | 'customer_name' | 'status' | 'total_items' | 'total_value' | 'created_at'
type SortDir = 'asc' | 'desc'

export default function BoqListPage() {
  const router = useRouter()
  const [data, setData] = useState<BoqHeader[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search & Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch data
  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/estimator/boq")
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json || [])
      setSelectedIds([])
      setSelectAll(false)
    } catch (err) {
      console.error("Error load BOQ list:", err)
      setError('Gagal memuat data BOQ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter, Search, Sort Logic
  const filteredData = useMemo(() => {
    let result = [...data]

    // Search filter
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(item => 
        item.boq_id.toLowerCase().includes(s) ||
        item.project_name.toLowerCase().includes(s) ||
        item.customer_name.toLowerCase().includes(s)
      )
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(item => item.status === statusFilter)
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      result = result.filter(item => new Date(item.created_at).getTime() >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime()
      result = result.filter(item => new Date(item.created_at).getTime() <= to)
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case 'boq_id':
          comparison = a.boq_id.localeCompare(b.boq_id)
          break
        case 'project_name':
          comparison = a.project_name.localeCompare(b.project_name)
          break
        case 'customer_name':
          comparison = a.customer_name.localeCompare(b.customer_name)
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'total_items':
          comparison = a.total_items - b.total_items
          break
        case 'total_value':
          comparison = (a.total_value || 0) - (b.total_value || 0)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return sortDir === 'asc' ? comparison : -comparison
    })

    return result
  }, [data, search, statusFilter, dateFrom, dateTo, sortKey, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([])
    } else {
      setSelectedIds(paginatedData.map(item => item.boq_id))
    }
    setSelectAll(!selectAll)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} BOQ?`)) return
    
    try {
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/estimator/boq/${id}`, { method: 'DELETE' })
      ))
      await loadData()
      setSelectedIds([])
      setSelectAll(false)
    } catch (err) {
      console.error('Bulk delete error:', err)
    }
  }

  // Single delete
  const handleDelete = async (id: string) => {
    setShowDeleteConfirm(true)
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/estimator/boq/${deleteId}`, { method: 'DELETE' })
      await loadData()
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setShowDeleteConfirm(false)
      setDeleteId(null)
    }
  }

  // Export
  const handleExport = () => {
    const csv = [
      ['BOQ ID', 'Project', 'Customer', 'Status', 'Items', 'Value', 'Created At'],
      ...filteredData.map(item => [
        item.boq_id,
        item.project_name,
        item.customer_name,
        item.status,
        item.total_items.toString(),
        item.total_value?.toString() || '0',
        new Date(item.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `boq-list-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Clear filters
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const hasActiveFilters = search || statusFilter || dateFrom || dateTo

  // Get sort indicator
  const getSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown size={14} className="text-slate-300" />
    return sortDir === 'asc' ? '↑' : '↓'
  }

  // Status badge colors
  const statusColors = {
    DRAFT: 'bg-amber-100 text-amber-600',
    LOCKED: 'bg-slate-200 text-slate-600',
    APPROVED: 'bg-emerald-100 text-emerald-600',
    REJECTED: 'bg-red-100 text-red-600',
    ARCHIVED: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-xl">
              <FileText className="text-slate-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-light text-slate-800">
                BOQ List
              </h1>
              <p className="text-xs text-slate-500">
                Daftar Bill of Quantity Project • {filteredData.length} total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search BOQ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              onClick={loadData}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <Link
              href="/admin/estimator/boq/new"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New BOQ</span>
            </Link>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="LOCKED">Locked</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Date From */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm w-36 focus:outline-none"
                placeholder="From"
              />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
              <Calendar size={14} className="text-slate-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm w-36 focus:outline-none"
                placeholder="To"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <X size={14} />
                Clear
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
            >
              <Download size={14} />
              Export
            </button>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="text-xs text-slate-500">
              Active filters: {search && `Search: "${search}"`} 
              {statusFilter && ` • Status: ${statusFilter}`}
              {dateFrom && ` • From: ${new Date(dateFrom).toLocaleDateString('id-ID')}`}
              {dateTo && ` • To: ${new Date(dateTo).toLocaleDateString('id-ID')}`}
            </div>
          )}
        </div>

        {/* BULK ACTIONS */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-800 text-white rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm">{selectedIds.length} item(s) selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 rounded-lg text-sm hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 bg-slate-600 rounded-lg text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                  <th className="p-3 text-left text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('boq_id')}>
                    <div className="flex items-center gap-1">
                      BOQ ID {getSortIndicator('boq_id')}
                    </div>
                  </th>
                  <th className="p-3 text-left text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('project_name')}>
                    <div className="flex items-center gap-1">
                      Project {getSortIndicator('project_name')}
                    </div>
                  </th>
                  <th className="p-3 text-left text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('customer_name')}>
                    <div className="flex items-center gap-1">
                      Customer {getSortIndicator('customer_name')}
                    </div>
                  </th>
                  <th className="p-3 text-center text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('total_items')}>
                    <div className="flex items-center gap-1 justify-center">
                      Items {getSortIndicator('total_items')}
                    </div>
                  </th>
                  <th className="p-3 text-right text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('total_value')}>
                    <div className="flex items-center gap-1 justify-end">
                      Value {getSortIndicator('total_value')}
                    </div>
                  </th>
                  <th className="p-3 text-center text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('status')}>
                    <div className="flex items-center gap-1 justify-center">
                      Status {getSortIndicator('status')}
                    </div>
                  </th>
                  <th className="p-3 text-center text-xs uppercase text-slate-500 cursor-pointer hover:text-slate-700"
                      onClick={() => setSortKey('created_at')}>
                    <div className="flex items-center gap-1 justify-center">
                      Created {getSortIndicator('created_at')}
                    </div>
                  </th>
                  <th className="p-3 text-center text-xs uppercase text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin" />
                        Loading...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      {hasActiveFilters ? (
                        <div>
                          <p>Tidak ada BOQ yang sesuai filter</p>
                          <button
                            onClick={clearFilters}
                            className="mt-2 text-slate-600 underline"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        'Belum ada BOQ'
                      )}
                    </td>
                  </tr>
                )}

                {paginatedData.map((boq) => (
                  <tr
                    key={boq.boq_id}
                    className="hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => router.push(`/admin/estimator/boq/${boq.boq_id}`)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(boq.boq_id)}
                        onChange={() => toggleSelect(boq.boq_id)}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {boq.boq_id}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {boq.project_name}
                    </td>
                    <td className="p-3 text-slate-600">
                      {boq.customer_name}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {boq.total_items}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(boq.total_value || 0)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-lg ${statusColors[boq.status] || 'bg-slate-100 text-slate-600'}`}>
                        {boq.status}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500 text-xs">
                      {new Date(boq.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/estimator/boq/${boq.boq_id}`}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          title="View"
                        >
                          <Eye size={16} className="text-slate-600" />
                        </Link>
                        <Link
                          href={`/admin/estimator/boq/${boq.boq_id}/edit`}
                          className="p-1.5 hover:bg-slate-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={16} className="text-slate-600" />
                        </Link>
                        <button
                          onClick={() => handleDelete(boq.boq_id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="border border-slate-200 rounded-lg px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="px-4 py-2 text-sm">
                Page {page} of {totalPages || 1}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs uppercase text-slate-500 mb-2">Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-light">{data.length}</p>
              <p className="text-xs text-slate-500">Total BOQ</p>
            </div>
            <div>
              <p className="text-2xl font-light">
                {data.filter(b => b.status === 'DRAFT').length}
              </p>
              <p className="text-xs text-slate-500">Draft</p>
            </div>
            <div>
              <p className="text-2xl font-light">
                {data.filter(b => b.status === 'APPROVED').length}
              </p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-light">
                {data.reduce((sum, b) => sum + (b.total_items || 0), 0)}
              </p>
              <p className="text-xs text-slate-500">Total Items</p>
            </div>
          </div>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete this BOQ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
