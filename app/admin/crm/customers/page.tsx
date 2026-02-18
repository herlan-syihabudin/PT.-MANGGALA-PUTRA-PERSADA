"use client"

import { useEffect, useState, useMemo } from "react"
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

export const dynamic = "force-dynamic"

type Customer = {
  customer_id: string
  company_name: string
  customer_type?: string
  pic_name: string
  phone: string
  email?: string
  city?: string
  status: string
  created_at?: string
  updated_at?: string
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

/* ==============================
   CUSTOMER LIST PAGE
================================ */
export default function CustomerListPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof Customer>("company_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "grid" | "compact">("table")
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // ================= FETCH CUSTOMERS =================
  const fetchCustomers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const res = await fetch("/api/crm/customers", { cache: "no-store" })
      const data = await res.json()
      
      // Enhance data with mock stats (nanti diganti sama API real)
      const enhanced = (data || []).map((c: Customer) => ({
        ...c,
        total_inquiries: Math.floor(Math.random() * 10),
        total_projects: Math.floor(Math.random() * 5),
        total_value: Math.floor(Math.random() * 1000000000),
        last_activity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }))
      
      setCustomers(enhanced)
    } catch (e) {
      console.error("Failed fetch customers", e)
    } finally {
      setLoading(false)
      if (showRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  // ================= STATISTICS =================
  const stats = useMemo<CustomerStats>(() => {
    const active = customers.filter(c => c.status === "Active").length
    const inactive = customers.filter(c => c.status !== "Active").length
    const withProjects = customers.filter(c => (c.total_projects || 0) > 0).length
    const totalValue = customers.reduce((sum, c) => sum + (c.total_value || 0), 0)
    const totalInquiries = customers.reduce((sum, c) => sum + (c.total_inquiries || 0), 0)
    
    return {
      total: customers.length,
      active,
      inactive,
      withProjects,
      totalValue,
      avgInquiries: customers.length > 0 ? totalInquiries / customers.length : 0,
    }
  }, [customers])

  // ================= FILTERS & SORT =================
  const filtered = useMemo(() => {
    return customers
      .filter((c) => {
        // Search filter
        if (!search) return true
        const term = search.toLowerCase()
        return (
          c.company_name?.toLowerCase().includes(term) ||
          c.pic_name?.toLowerCase().includes(term) ||
          c.phone?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.city?.toLowerCase().includes(term)
        )
      })
      .filter((c) => {
        // Status filter
        if (filterStatus === "all") return true
        if (filterStatus === "active") return c.status === "Active"
        if (filterStatus === "inactive") return c.status !== "Active"
        return c.status === filterStatus
      })
      .filter((c) => {
        // Type filter
        if (filterType === "all") return true
        return c.customer_type === filterType
      })
      .sort((a, b) => {
        let aVal = a[sortBy]
        let bVal = b[sortBy]
        
        // Handle undefined values
        if (aVal === undefined) aVal = ""
        if (bVal === undefined) bVal = ""
        
        // Special handling for numbers
        if (sortBy === "total_inquiries" || sortBy === "total_projects" || sortBy === "total_value") {
          aVal = aVal || 0
          bVal = bVal || 0
          return sortOrder === "asc" 
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number)
        }
        
        // String comparison
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [customers, search, filterStatus, filterType, sortBy, sortOrder])

  // ================= PAGINATION =================
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, page, rowsPerPage])

  const totalPages = Math.ceil(filtered.length / rowsPerPage)

  // ================= SELECTION HANDLERS =================
  const toggleSelectAll = () => {
    if (selectedCustomers.length === paginated.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(paginated.map(c => c.customer_id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(i => i !== id))
    } else {
      setSelectedCustomers([...selectedCustomers, id])
    }
  }

  const exportSelected = () => {
    const selected = customers.filter(c => selectedCustomers.includes(c.customer_id))
    console.log("Export:", selected)
    // Implement export logic
    alert(`Export ${selected.length} customers`)
  }

  // ================= RENDER =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto" />
          <p className="text-gray-400">Loading customer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Building2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Customer Management</h1>
                <p className="text-red-100 text-sm mt-1">
                  Master data customer & owner proyek
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari perusahaan / PIC / telepon..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition ${
                  showFilters ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
                }`}
              >
                <Filter size={20} />
              </button>

              {/* Refresh */}
              <button
                onClick={() => fetchCustomers(true)}
                disabled={refreshing}
                className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition disabled:opacity-50"
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
              </button>

              {/* Add Customer */}
              <Link
                href="/admin/crm/customers/create"
                className="px-4 py-2.5 bg-white text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition flex items-center gap-2"
              >
                <Plus size={18} />
                Tambah Customer
              </Link>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Tipe Customer</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Semua Tipe</option>
                  <option value="company">Perusahaan</option>
                  <option value="individual">Individual</option>
                  <option value="government">Pemerintah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Urutkan</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof Customer)}
                >
                  <option value="company_name">Nama Perusahaan</option>
                  <option value="pic_name">PIC Name</option>
                  <option value="city">Kota</option>
                  <option value="status">Status</option>
                  <option value="total_inquiries">Total Inquiry</option>
                  <option value="total_projects">Total Project</option>
                  <option value="total_value">Total Value</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-red-200 mb-2">Arah Urutan</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="asc">A → Z / Kecil → Besar</option>
                  <option value="desc">Z → A / Besar → Kecil</option>
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
            icon={<Users className="text-red-600" />}
            color="red"
            trend={+5.2}
          />
          <KpiCard
            title="Active Customer"
            value={stats.active}
            icon={<CheckCircle className="text-green-600" />}
            color="green"
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
            icon={<TrendingUp className="text-purple-600" />}
            color="purple"
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
            <div className="flex items-center gap-2">
              <button
                onClick={exportSelected}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Export Selected
              </button>
              <button
                onClick={() => setSelectedCustomers([])}
                className="p-1.5 hover:bg-blue-200 rounded-lg transition"
              >
                <X size={16} className="text-blue-600" />
              </button>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'table' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'grid' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'compact' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Compact View
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Rows:</span>
            <select
              className="border rounded px-2 py-1"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* CONTENT - MAINTAIN ORIGINAL TABLE STRUCTURE */}
        {viewMode === 'table' && (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedCustomers.length === paginated.length && paginated.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Perusahaan</th>
                    <th className="p-3 text-left">PIC</th>
                    <th className="p-3 text-left">Telepon</th>
                    <th className="p-3 text-left">Kota</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Inquiry</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Total Value</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-gray-400">
                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Data customer tidak ditemukan</p>
                        {search && (
                          <p className="text-sm mt-2">
                            Tidak ada hasil untuk "{search}"
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c) => (
                      <tr
                        key={c.customer_id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedCustomers.includes(c.customer_id)}
                            onChange={() => toggleSelect(c.customer_id)}
                          />
                        </td>
                        <td className="p-3 font-medium">
                          <Link
                            href={`/admin/crm/customers/${c.customer_id}`}
                            className="text-red-600 hover:underline flex items-center gap-2"
                          >
                            <Building2 size={14} />
                            {c.company_name}
                          </Link>
                          {c.email && (
                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Mail size={12} />
                              {c.email}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-gray-400" />
                            {c.pic_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" />
                            {c.phone}
                          </div>
                        </td>
                        <td className="p-3">
                          {c.city ? (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              {c.city}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{c.total_inquiries || 0}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium">{c.total_projects || 0}</span>
                        </td>
                        <td className="p-3 font-semibold text-green-600">
                          {formatCurrency(c.total_value || 0)}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/crm/customers/${c.customer_id}`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition group"
                              title="Detail"
                            >
                              <Eye size={16} className="text-gray-500 group-hover:text-blue-600" />
                            </Link>
                            <Link
                              href={`/admin/crm/customers/${c.customer_id}/edit`}
                              className="p-2 hover:bg-gray-100 rounded-lg transition group"
                              title="Edit"
                            >
                              <Edit size={16} className="text-gray-500 group-hover:text-green-600" />
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
            {paginated.map((c) => (
              <div
                key={c.customer_id}
                className="bg-white border rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
                onClick={() => router.push(`/admin/crm/customers/${c.customer_id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Building2 className="text-red-600" size={24} />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1">{c.company_name}</h3>
                <p className="text-sm text-gray-500 mb-4">{c.customer_type || "Company"}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span>{c.pic_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.city && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{c.city}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Inquiry</p>
                    <p className="font-bold">{c.total_inquiries || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Project</p>
                    <p className="font-bold">{c.total_projects || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Value</p>
                    <p className="font-bold text-green-600 text-sm">
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
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="divide-y">
              {paginated.map((c) => (
                <div
                  key={c.customer_id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/crm/customers/${c.customer_id}`)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedCustomers.includes(c.customer_id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelect(c.customer_id)
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {c.company_name}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            c.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
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
                      <div className="text-sm font-semibold text-green-600">
                        {formatCompactCurrency(c.total_value || 0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {c.total_inquiries || 0} inquiries
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 rotate-[-90deg]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between bg-white border rounded-xl p-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span> -{" "}
              <span className="font-medium">
                {Math.min(page * rowsPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> customers
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
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
                          ? "bg-red-600 text-white"
                          : "hover:bg-gray-50"
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
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
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
  trend,
  format = 'number'
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  subtitle?: string
  percentage?: number
  trend?: number
  format?: 'number' | 'currency'
}) {
  const colorClasses = {
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : value.toLocaleString('id-ID')

  const progressColor = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
}

  return (
    <div className="bg-white border rounded-xl p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-xl`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-4">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{formattedValue}</p>
      {percentage !== undefined && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
  className={`h-1.5 rounded-full ${progressColor[color]}`}
  style={{ width: `${percentage}%` }}
/>
          </div>
          <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% dari total</p>
        </div>
      )}
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
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
