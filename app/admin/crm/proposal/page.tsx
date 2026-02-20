"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  Download,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  RefreshCw,
  Eye,
  MoreHorizontal,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  ArrowRight,
  DownloadCloud,
  Mail,
  Printer,
  Edit,
} from "lucide-react"
import { toast } from "sonner"
import { formatIDR } from "@/lib/format"

/* ================= TYPES ================= */
type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  total_value: number
  status: string
  created_at: string
}

type ApiResponse = {
  data: Proposal[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/* ================= STATUS CONFIG ================= */
const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string; borderColor: string; icon: JSX.Element }
> = {
  DRAFT: {
    label: "Draft",
    color: "slate",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: <Clock size={12} />,
  },
  SENT: {
    label: "Sent",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: <Send size={12} />,
  },
  APPROVED: {
    label: "Approved",
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: <CheckCircle size={12} />,
  },
  REJECTED: {
    label: "Rejected",
    color: "rose",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: <XCircle size={12} />,
  },
  EXPIRED: {
    label: "Expired",
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: <AlertCircle size={12} />,
  },
}

/* ================= COMPONENT ================= */
export default function ProposalPage() {
  const router = useRouter()
  const [data, setData] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "value" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  /* ================= FETCH DATA ================= */
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const res = await fetch(`/api/crm/proposal?${params}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Gagal mengambil data")
      }

      const response: ApiResponse = await res.json()
      setData(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalItems(response.pagination.total)

    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Gagal memuat data proposal")
    } finally {
      setLoading(false)
      if (showRefresh) setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, limit, statusFilter, searchTerm])

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const sent = data.filter((p) => p.status === "SENT")
    const approved = data.filter((p) => p.status === "APPROVED")
    const draft = data.filter((p) => p.status === "DRAFT")
    
    return {
      totalPending: sent.reduce((s, p) => s + p.total_value, 0),
      countApproved: approved.length,
      totalValue: data.reduce((s, p) => s + p.total_value, 0),
      countDraft: draft.length,
      countSent: sent.length,
    }
  }, [data])

  /* ================= SORTING ================= */
  const sortedData = useMemo(() => {
    const sorted = [...data]
    
    if (sortBy === "date") {
      sorted.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB
      })
    } else if (sortBy === "value") {
      sorted.sort((a, b) => {
        return sortOrder === "desc" 
          ? b.total_value - a.total_value 
          : a.total_value - b.total_value
      })
    } else if (sortBy === "status") {
      const statusOrder = ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED"]
      sorted.sort((a, b) => {
        const orderA = statusOrder.indexOf(a.status)
        const orderB = statusOrder.indexOf(b.status)
        return sortOrder === "desc" ? orderB - orderA : orderA - orderB
      })
    }
    
    return sorted
  }, [data, sortBy, sortOrder])

  /* ================= HANDLERS ================= */
  const handleExport = async (proposalId: string) => {
    toast.success(`Export proposal ${proposalId} (simulasi)`)
  }

  const handleSendEmail = async (proposalId: string) => {
    toast.success(`Email untuk ${proposalId} akan dikirim`)
  }

  const handleCreate = () => {
    router.push("/admin/crm/proposal/create")
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Loading proposals...</p>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <FileText size={28} className="text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">
                  Proposal Management
                </h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Kelola penawaran harga dan kontrak client
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari proposal ID..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
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
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition disabled:opacity-50 border border-white/10"
              >
                <RefreshCw size={20} className={`text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-emerald-200"
              >
                <Plus size={18} />
                Create Proposal
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="date">Tanggal</option>
                  <option value="value">Nilai</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort Order</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">Terbaru / Terbesar</option>
                  <option value="asc">Terlama / Terkecil</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Rows</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  <option value={10}>10 per halaman</option>
                  <option value={20}>20 per halaman</option>
                  <option value={50}>50 per halaman</option>
                  <option value={100}>100 per halaman</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Proposal"
            value={totalItems}
            icon={<FileText size={18} />}
            color="slate"
          />
          <StatCard
            label="Draft"
            value={stats.countDraft}
            icon={<Clock size={18} />}
            color="slate"
          />
          <StatCard
            label="Sent / Pending"
            value={stats.countSent}
            icon={<Send size={18} />}
            color="blue"
            subtitle={`Rp ${(stats.totalPending / 1000000).toFixed(1)} Jt`}
          />
          <StatCard
            label="Approved"
            value={stats.countApproved}
            icon={<CheckCircle size={18} />}
            color="emerald"
          />
        </div>

        {/* Value Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValueCard
            label="Total Value Pipeline"
            value={stats.totalValue}
            icon={<DollarSign size={18} />}
            color="blue"
          />
          <ValueCard
            label="Awaiting Approval"
            value={stats.totalPending}
            icon={<TrendingUp size={18} />}
            color="amber"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proposal</th>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline</th>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RAB</th>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-400">No proposals found</p>
                      {searchTerm && (
                        <p className="text-sm text-slate-400 mt-2">
                          Tidak ada hasil untuk "{searchTerm}"
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((p) => {
                    const status = statusConfig[p.status] || statusConfig.DRAFT
                    
                    return (
                      <tr
                        key={p.proposal_id}
                        className="hover:bg-slate-50 transition cursor-pointer"
                        onClick={() => router.push(`/admin/crm/proposal/${p.proposal_id}`)}
                      >
                        {/* Proposal ID */}
                        <td className="p-4">
                          <Link
                            href={`/admin/crm/proposal/${p.proposal_id}`}
                            className="font-medium text-slate-800 hover:text-blue-600 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {p.proposal_id}
                            <ExternalLink size={12} className="opacity-50" />
                          </Link>
                        </td>

                        {/* Pipeline */}
                        <td className="p-4">
                          <Link
                            href={`/admin/crm/pipeline/${p.pipeline_id}`}
                            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowRight size={10} className="rotate-[-45deg]" />
                            {p.pipeline_id}
                          </Link>
                        </td>

                        {/* RAB */}
                        <td className="p-4">
                          <Link
                            href={`/admin/estimator/rab/${p.rab_id}`}
                            className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Package size={10} />
                            {p.rab_id}
                          </Link>
                        </td>

                        {/* Value */}
                        <td className="p-4 font-semibold text-slate-800">
                          {formatIDR(p.total_value)}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="p-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(p.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleExport(p.proposal_id)
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition group"
                              title="Download PDF"
                            >
                              <DownloadCloud size={16} className="text-slate-400 group-hover:text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendEmail(p.proposal_id)
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition group"
                              title="Send Email"
                            >
                              <Mail size={16} className="text-slate-400 group-hover:text-emerald-600" />
                            </button>
                            <Link
                              href={`/admin/crm/proposal/${p.proposal_id}`}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition group"
                              title="View Details"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Eye size={16} className="text-slate-400 group-hover:text-blue-600" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> -{" "}
                <span className="font-medium">{Math.min(page * limit, totalItems)}</span> of{" "}
                <span className="font-medium">{totalItems}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-xs disabled:opacity-50 hover:bg-slate-100 transition"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-slate-200 rounded-lg text-xs disabled:opacity-50 hover:bg-slate-100 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon, color, subtitle }: {
  label: string
  value: number
  icon: React.ReactNode
  color: "slate" | "blue" | "emerald" | "amber"
  subtitle?: string
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function ValueCard({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: "blue" | "amber"
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  }

  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="text-xl font-bold">{formatIDR(value)}</p>
    </div>
  )
}
