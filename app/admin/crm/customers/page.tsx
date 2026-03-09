"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
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
  Download,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical,
  ChevronDown,
  X,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  FileText,
  Star,
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
  last_activity?: string
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
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

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

  // ================= FETCH CUSTOMERS FROM API =================
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

  // Initial load & filter changes
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // ================= FETCH CUSTOMER STATS =================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsError(null)
        const res = await fetch("/api/crm/customers/stats")
        if (!res.ok) throw new Error("Gagal memuat statistik")
        const data = await res.json()
        // setStats(data)
      } catch (e: any) {
        console.error("Failed fetch stats", e)
        setStatsError(e.message)
        toast.error("Gagal memuat statistik customer")
      }
    }
    fetchStats()
  }, [])

  // ================= STATISTICS =================
  const stats = useMemo<CustomerStats>(() => {
    const active = customers.filter(c => c.status === "Active").length
    const inactive = customers.filter(c => c.status !== "Active").length
    const withProjects = customers.filter(c => (c.total_projects || 0) > 0).length
    const totalValue = customers.reduce((sum, c) => sum + (c.total_value || 0), 0)
    const totalInquiries = customers.reduce((sum, c) => sum + (c.total_inquiries || 0), 0)
    
    return {
      total: totalItems,
      active,
      inactive,
      withProjects,
      totalValue,
      avgInquiries: customers.length > 0 ? totalInquiries / customers.length : 0,
    }
  }, [customers, totalItems])

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
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const exportSelected = async () => {
    if (selectedCustomers.length === 0) {
      toast.warning("Pilih customer terlebih dahulu")
      return
    }

    try {
      toast.loading("Menyiapkan export...")
      
      const res = await fetch("/api/crm/customers/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedCustomers }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Export failed")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customers-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(`${selectedCustomers.length} customer berhasil diekspor`)
    } catch (e: any) {
      console.error("Export failed", e)
      toast.error(e.message || "Gagal export data")
    }
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
                  <option value="asc">A → Z / Kecil → Besar</option>
                  <option value="desc">Z → A / Besar → Kecil</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Sama persis seperti kode Anda mulai dari sini... */}
      {/* ... (semua kode view, KPI cards, tables, etc tetap sama) ... */}
      
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

  const progressColor = {
    slate: "bg-slate-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  }

  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : value.toLocaleString('id-ID')

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className={`${colorClasses[color]} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-4">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{formattedValue}</p>
      {percentage !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${progressColor[color]}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(1)}% dari total</p>
        </div>
      )}
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  )
}

// ================= UTILITY FUNCTIONS =================
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}Jt`
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(1)}Rb`
  return `Rp ${value}`
}
