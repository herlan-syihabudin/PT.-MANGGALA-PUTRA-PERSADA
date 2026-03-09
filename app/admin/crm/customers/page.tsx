"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  ChevronDown,
  X,
  CheckCircle,
  Users,
  Briefcase,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

// ================= TYPES =================
type Customer = {
  customer_id: string
  company_name: string
  customer_type?: string
  pic_name: string
  pic_position?: string
  email?: string
  phone: string
  npwp?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  status: string
  notes?: string
  created_at?: string
  created_by?: string
  total_inquiries?: number
  total_projects?: number
  total_value?: number
}

type CustomerStats = {
  total: number
  active: number
  inactive: number
  withProjects: number
  totalValue: number
  avgInquiries: number
}

type ApiResponse = {
  data: Customer[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ================= CONSTANTS =================
const CUSTOMER_TYPES = [
  { value: "all", label: "Semua Tipe" },
  { value: "company", label: "Perusahaan" },
  { value: "individual", label: "Individual" },
  { value: "government", label: "Pemerintah" },
] as const

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
] as const

const SORT_OPTIONS = [
  { value: "company_name", label: "Nama Perusahaan" },
  { value: "pic_name", label: "PIC Name" },
  { value: "city", label: "Kota" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Tanggal Dibuat" },
] as const

// ================= CUSTOM HOOK: DEBOUNCE =================
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ================= MAIN COMPONENT =================
export default function CustomerListPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    withProjects: 0,
    totalValue: 0,
    avgInquiries: 0,
  })

  // Filter states
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 500)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof Customer>("company_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  
  // UI states
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid" | "compact">("table")
  
  // Pagination
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterType !== "all" && { type: filterType }),
        sortBy: sortBy.toString(),
        sortOrder,
      })

      const res = await fetch(`/api/crm/customers?${params}`, {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Gagal mengambil data")
      }

      const response: ApiResponse = await res.json()
      
      setCustomers(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalItems(response.pagination.total)

      if (response.pagination.page > response.pagination.totalPages) {
        setPage(1)
      }

    } catch (e: any) {
      console.error("Failed fetch customers", e)
      setError(e.message || "Terjadi kesalahan")
      toast.error(e.message || "Gagal memuat data customer")
    } finally {
      setLoading(false)
      if (showRefresh) setRefreshing(false)
    }
  }, [page, rowsPerPage, debouncedSearch, filterStatus, filterType, sortBy, sortOrder])

  // ================= FETCH STATS =================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsError(null)
        const res = await fetch("/api/crm/customers/stats")
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.message || "Gagal memuat statistik")
        }
        
        const data = await res.json()
        setStats(data)
      } catch (e: any) {
        console.error("Failed fetch stats", e)
        setStatsError(e.message)
        toast.error("Gagal memuat statistik customer")
      }
    }
    
    fetchStats()
  }, [])

  // Initial load
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // ================= SELECTION HANDLERS =================
  const toggleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.customer_id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Loading customer data...</p>
        </div>
      </div>
    )
  }

  // ================= ERROR STATE =================
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => fetchCustomers()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white sticky top-0 z-10 border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <Building2 size={28} className="text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Customer Management</h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Master data customer & owner proyek
                </p>
                {statsError && (
                  <p className="text-xs text-amber-300 mt-1">{statsError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari perusahaan / PIC / telepon..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition ${
                  showFilters ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                } border border-white/10`}
              >
                <Filter size={20} className="text-slate-300" />
              </button>

              {/* Refresh */}
              <button
                onClick={() => fetchCustomers(true)}
                disabled={refreshing}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition disabled:opacity-50 border border-white/10"
              >
                <RefreshCw size={20} className={`text-slate-300 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              {/* Add Customer */}
              <Link
                href="/admin/crm/customers/create"
                className="px-4 py-2.5 bg-white text-slate-800 rounded-xl font-medium text-sm hover:bg-slate-100 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Customer
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setPage(1)
                  }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Tipe Customer</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value)
                    setPage(1)
                  }}
                >
                  {CUSTOMER_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Urutkan</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as keyof Customer)
                    setPage(1)
                  }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Arah Urutan</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc")
                    setPage(1)
                  }}
                >
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Customer"
            value={stats.total}
            icon={<Users className="text-slate-600" />}
            color="slate"
          />
          <KpiCard
            title="Active Customer"
            value={stats.active}
            icon={<CheckCircle className="text-emerald-600" />}
            color="emerald"
            subtitle={`${stats.inactive} inactive`}
          />
          <KpiCard
            title="With Projects"
            value={stats.withProjects}
            icon={<Briefcase className="text-blue-600" />}
            color="blue"
            percentage={stats.total > 0 ? (stats.withProjects / stats.total) * 100 : 0}
          />
          <KpiCard
            title="Total Value"
            value={stats.totalValue}
            icon={<TrendingUp className="text-amber-600" />}
            color="amber"
            format="currency"
          />
        </div>

        {/* Selection Bar */}
        {selectedCustomers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-blue-600" size={20} />
              <span className="text-sm text-blue-700">
                {selectedCustomers.length} customer selected
              </span>
            </div>
            <button
              onClick={() => setSelectedCustomers([])}
              className="p-1.5 hover:bg-blue-200 rounded-lg transition"
            >
              <X size={16} className="text-blue-600" />
            </button>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'table' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'grid' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'compact' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Compact View
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Rows:</span>
            <select
              className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setPage(1)
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={selectedCustomers.length === customers.length && customers.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perusahaan</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">PIC</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Telepon</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kota</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inquiry</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
                    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
                    <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-slate-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Data customer tidak ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr
                        key={c.customer_id}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => router.push(`/admin/crm/customers/${c.customer_id}`)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selectedCustomers.includes(c.customer_id)}
                            onChange={() => toggleSelect(c.customer_id)}
                          />
                        </td>
                        <td className="p-3 font-medium">
                          <Link
                            href={`/admin/crm/customers/${c.customer_id}`}
                            className="text-slate-800 hover:text-blue-600 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Building2 size={14} className="text-slate-400" />
                            {c.company_name}
                          </Link>
                          {c.email && (
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <Mail size={12} />
                              {c.email}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-slate-600">
                            <User size={14} className="text-slate-400" />
                            {c.pic_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Phone size={14} className="text-slate-400" />
                            {c.phone}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">
                          {c.city ? (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-slate-400" />
                              {c.city}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700">{c.total_inquiries || 0}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700">{c.total_projects || 0}</span>
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">
                          {formatCurrency(c.total_value || 0)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/admin/crm/customers/${c.customer_id}`}
                              className="p-2 hover:bg-slate-100 rounded-lg transition group"
                              title="Detail"
                            >
                              <Eye size={16} className="text-slate-400 group-hover:text-blue-600" />
                            </Link>
                            <Link
                              href={`/admin/crm/customers/${c.customer_id}/edit`}
                              className="p-2 hover:bg-slate-100 rounded-lg transition group"
                              title="Edit"
                            >
                              <Edit size={16} className="text-slate-400 group-hover:text-emerald-600" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((c) => (
              <div
                key={c.customer_id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/admin/crm/customers/${c.customer_id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <Building2 className="text-slate-600" size={24} />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-800 mb-1">{c.company_name}</h3>
                <p className="text-sm text-slate-500 mb-4">{c.customer_type || "Company"}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User size={14} className="text-slate-400" />
                    <span>{c.pic_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{c.city}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Inquiry</p>
                    <p className="font-bold text-slate-700">{c.total_inquiries || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Project</p>
                    <p className="font-bold text-slate-700">{c.total_projects || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Value</p>
                    <p className="font-bold text-emerald-600 text-sm">
                      {formatCompactCurrency(c.total_value || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact View */}
        {viewMode === 'compact' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
                <div
                  key={c.customer_id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/admin/crm/customers/${c.customer_id}`)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={selectedCustomers.includes(c.customer_id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelect(c.customer_id)
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {c.company_name}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            c.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {c.pic_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {c.phone}
                        </span>
                        {c.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {c.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatCompactCurrency(c.total_value || 0)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {c.total_inquiries || 0} inquiries
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-slate-400 rotate-[-90deg]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * rowsPerPage + 1}</span> -{" "}
              <span className="font-medium text-slate-700">
                {Math.min(page * rowsPerPage, totalItems)}
              </span>{" "}
              of <span className="font-medium text-slate-700">{totalItems}</span> customers
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = page
                if (page <= 3) pageNum = i + 1
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = page - 2 + i

                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm ${
                        page === pageNum
                          ? "bg-slate-800 text-white"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                }
                return null
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ================= KPI CARD COMPONENT =================
function KpiCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  percentage,
  format = 'number'
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: 'slate' | 'emerald' | 'blue' | 'amber'
  subtitle?: string
  percentage?: number
  format?: 'number' | 'currency'
}) {

  const colorClasses = {
    slate: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="text-2xl font-bold text-slate-800 mt-1">
        {format === 'currency'
          ? formatCurrency(value)
          : value.toLocaleString()}
      </p>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}

      {percentage !== undefined && (
        <p className="text-xs text-slate-400 mt-1">
          {percentage.toFixed(1)}%
        </p>
      )}
    </div>
  )
}
