"use client"

import { useEffect, useState, useMemo } from "react"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  Clock,
  DollarSign,
  PieChart,
  Target,
  Zap,
  RefreshCw,
  ChevronDown,
  Eye,
  Briefcase,
  ClipboardCheck,
  FileCheck,
  Handshake,
  Wrench,
  XCircle,
} from "lucide-react"

// ================= TYPES =================
type Deal = {
  pipeline_id: string
  inquiry_id: string
  customer_id: string
  customer_name: string
  project_name: string
  stage: "FOLLOW UP" | "PENAWARAN" | "NEGOSIASI" | "DEAL" | "LOST"
  estimated_value: number
  proposal_value?: number
  final_value: number
  rab_id: string
  proposal_id: string
  proposal_status?: "draft" | "sent" | "approved" | "rejected"
  project_id?: string
  created_at: string
  updated_at: string
  status?: string
  probability: number
  aging_days: number
}

type StageConfig = {
  label: string
  probability: number
  color: string
  bgColor: string
  textColor: string
  borderColor: string
  icon: any
  description: string
}

type Stats = {
  totalPipeline: number
  forecastRevenue: number
  weightedRevenue: number
  dealCount: number
  dealValue: number
  conversionRate: number
  avgDealSize: number
  pipelineHealth: number
  agingBreach: number
  activeDeals: number
  wonProjects: number
}

// ================= CONFIG =================
const STAGE_CONFIG: Record<string, StageConfig> = {
  "FOLLOW UP": {
    label: "Follow Up",
    probability: 0.2,
    color: "slate",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    icon: Users,
    description: "Initial contact & qualification"
  },
  PENAWARAN: {
    label: "Penawaran",
    probability: 0.5,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: FileText,
    description: "RAB & proposal sent"
  },
  NEGOSIASI: {
    label: "Negosiasi",
    probability: 0.7,
    color: "amber",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: Handshake,
    description: "Commercial discussion"
  },
  DEAL: {
    label: "Deal",
    probability: 1.0,
    color: "emerald",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: CheckCircle2,
    description: "Contract signed - ready for project"
  },
  LOST: {
    label: "Lost",
    probability: 0.0,
    color: "rose",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    icon: XCircle,
    description: "Deal lost / cancelled"
  },
}

// ON GOING dihapus dari pipeline, pindah ke project management
const AGING_THRESHOLDS = {
  warning: 14,
  critical: 30,
}

// ================= HELPER FUNCTIONS =================
function getStageFromInquiry(i: any): Deal['stage'] {
  // Lost check first
  if (i.status === "lost") return "LOST"
  
  // Deal = proposal approved
  if (i.proposal_status === "approved") return "DEAL"
  
  // Negosiasi = proposal sent
  if (i.proposal_status === "sent") return "NEGOSIASI"
  
  // Penawaran = RAB exists
  if (i.converted_rab_id) return "PENAWARAN"
  
  // Default = Follow Up
  return "FOLLOW UP"
}

function getAgingDays(date?: string): number {
  if (!date) return 0
  const diff = Date.now() - new Date(date).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function getAgingStatus(days: number): 'normal' | 'warning' | 'critical' {
  if (days > AGING_THRESHOLDS.critical) return 'critical'
  if (days > AGING_THRESHOLDS.warning) return 'warning'
  return 'normal'
}

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

// ================= MAIN COMPONENT =================
export default function CRMPipelinePage() {
  const router = useRouter()
  const [data, setData] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof Deal>("updated_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "chart">("table")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/crm/inquiry?limit=2000")
        const json = await res.json()

        const mapped = (json.data || []).map((i: any) => {
          const stage = getStageFromInquiry(i)
          // Proposal value > inquiry value jika ada
          const proposalValue = i.proposal_value || 0
          const estimatedValue = i.estimasi_nilai || 0
          const finalValue = proposalValue > 0 ? proposalValue : estimatedValue
          
          return {
            pipeline_id: i.inquiry_id,
            inquiry_id: i.inquiry_id,
            customer_id: i.customer_id,
            customer_name: i.customer_name || "-",
            project_name: i.nama_pekerjaan || "Untitled Project",
            stage,
            estimated_value: estimatedValue,
            proposal_value: proposalValue,
            final_value: finalValue,
            rab_id: i.converted_rab_id || "",
            proposal_id: i.converted_proposal_id || "",
            proposal_status: i.proposal_status,
            project_id: i.converted_project_id || "",
            created_at: i.created_at || i.tanggal_masuk || new Date().toISOString(),
            updated_at: i.updated_at || i.created_at || i.tanggal_masuk || new Date().toISOString(),
            status: i.status,
            probability: STAGE_CONFIG[stage]?.probability || 0,
            aging_days: getAgingDays(i.updated_at || i.created_at || i.tanggal_masuk),
          }
        })

        setData(mapped)
      } catch (e) {
        console.error("Gagal ambil data CRM", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // ================= FILTERS & SORT =================
  const filteredData = useMemo(() => {
    return data
      .filter((d) => {
        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase()
          return (
            d.project_name.toLowerCase().includes(term) ||
            d.customer_name.toLowerCase().includes(term) ||
            d.inquiry_id.toLowerCase().includes(term)
          )
        }
        return true
      })
      .filter((d) => {
        // Stage filter
        if (stageFilter === "all") return true
        if (stageFilter === "active") return d.stage !== "LOST"
        return d.stage === stageFilter
      })
      .filter((d) => {
        // Date range filter
        if (dateRange.start && new Date(d.updated_at) < new Date(dateRange.start)) return false
        if (dateRange.end && new Date(d.updated_at) > new Date(dateRange.end)) return false
        return true
      })
      .sort((a, b) => {
        const aVal = a[sortBy] || ""
        const bVal = b[sortBy] || ""
        
        if (sortBy === "final_value" || sortBy === "estimated_value") {
          return sortOrder === "asc" 
            ? (a.final_value - b.final_value)
            : (b.final_value - a.final_value)
        }
        
        if (sortBy === "aging_days") {
          return sortOrder === "asc"
            ? a.aging_days - b.aging_days
            : b.aging_days - a.aging_days
        }
        
        if (sortBy === "updated_at" || sortBy === "created_at") {
          return sortOrder === "asc"
            ? new Date(aVal).getTime() - new Date(bVal).getTime()
            : new Date(bVal).getTime() - new Date(aVal).getTime()
        }
        
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortOrder === "asc" ? comparison : -comparison
      })
  }, [data, searchTerm, stageFilter, sortBy, sortOrder, dateRange])

  // ================= STATISTICS =================
  const stats = useMemo<Stats>(() => {
    const activeDeals = filteredData.filter(d => d.stage !== "LOST")
    const totalPipeline = filteredData
  .filter(d => d.stage !== "LOST")
  .reduce((s, d) => s + d.final_value, 0)
    
    const weightedRevenue = filteredData.reduce(
      (s, d) => s + (d.final_value * d.probability), 0
    )

    const dealCount = filteredData.filter(d => d.stage === "DEAL").length
    const dealValue = filteredData
      .filter(d => d.stage === "DEAL")
      .reduce((s, d) => s + d.final_value, 0)

    const wonProjects = filteredData.filter(d => d.project_id).length

    const totalClosed = filteredData.filter(d => 
  d.stage === "DEAL" || d.stage === "LOST"
).length

const conversionRate = totalClosed > 0
  ? (dealCount / totalClosed) * 100
  : 0

    const avgDealSize = dealCount > 0 ? dealValue / dealCount : 0
    const pipelineHealth = totalPipeline > 0 
      ? (weightedRevenue / totalPipeline) * 100 
      : 0

    const agingBreach = filteredData.filter(d => 
      d.stage !== "DEAL" && 
      d.stage !== "LOST" &&
      d.aging_days > AGING_THRESHOLDS.warning
    ).length

    return {
      totalPipeline,
      forecastRevenue: weightedRevenue,
      weightedRevenue,
      dealCount,
      dealValue,
      conversionRate,
      avgDealSize,
      pipelineHealth,
      agingBreach,
      activeDeals: activeDeals.length,
      wonProjects,
    }
  }, [filteredData])

  // ================= STAGE DISTRIBUTION =================
  const stageDistribution = useMemo(() => {
    const stages: Record<string, { count: number; value: number }> = {}
    
    Object.keys(STAGE_CONFIG).forEach(stage => {
      stages[stage] = { count: 0, value: 0 }
    })

    filteredData.forEach(d => {
      if (stages[d.stage]) {
        stages[d.stage].count++
        stages[d.stage].value += d.final_value
      }
    })

    return stages
  }, [filteredData])

  // ================= MONTHLY DATA =================
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; value: number; count: number }> = {}

    filteredData.forEach((d) => {
      if (!d.created_at) return

      const date = new Date(d.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" })

      if (!map[monthKey]) {
        map[monthKey] = { month: monthLabel, value: 0, count: 0 }
      }

      map[monthKey].value += d.final_value
      map[monthKey].count++
    })

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => v)
  }, [filteredData])

  // ================= AGING ANALYSIS =================
  const agingAnalysis = useMemo(() => {
    const aging: Record<string, { count: number; value: number }> = {
      normal: { count: 0, value: 0 },
      warning: { count: 0, value: 0 },
      critical: { count: 0, value: 0 },
    }

    filteredData.forEach(d => {
      if (d.stage === "DEAL" || d.stage === "LOST") return
      
      const status = getAgingStatus(d.aging_days)
      
      aging[status].count++
      aging[status].value += d.final_value
    })

    return aging
  }, [filteredData])

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Loading Pipeline Intelligence...</p>
        </div>
      </div>
    )
  }

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white sticky top-0 z-10 border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <BarChart3 size={28} className="text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Pipeline & Deals</h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  Real-time revenue tracking and sales intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari project atau customer..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

              {/* Export Button */}
              <button
                onClick={() => {
                  // Implement export to Excel
                  alert("Export feature coming soon!")
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10"
              >
                <Download size={20} className="text-slate-300" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Stage</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-white/20"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="all">Semua Stage</option>
                  <option value="active">Active Only</option>
                  <option value="FOLLOW UP">Follow Up</option>
                  <option value="PENAWARAN">Penawaran</option>
                  <option value="NEGOSIASI">Negosiasi</option>
                  <option value="DEAL">Deal</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof Deal)}
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Created Date</option>
                  <option value="final_value">Value</option>
                  <option value="aging_days">Aging</option>
                  <option value="project_name">Project Name</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort Order</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">View Mode</label>
                <div className="flex gap-2">
                  {[
                    { id: 'table', label: 'Table', icon: FileText },
                    { id: 'kanban', label: 'Kanban', icon: Briefcase },
                    { id: 'chart', label: 'Analytics', icon: PieChart }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as any)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition flex items-center justify-center gap-1 ${
                        viewMode === mode.id
                          ? 'bg-white text-slate-800'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <mode.icon size={14} />
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards - Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Pipeline"
            value={stats.totalPipeline}
            icon={<DollarSign />}
            color="slate"
            format="currency"
            subtitle={`${stats.activeDeals} active deals`}
          />
          <KpiCard
            title="Forecast Revenue"
            value={stats.forecastRevenue}
            icon={<Target />}
            color="blue"
            format="currency"
            subtitle={`${stats.pipelineHealth.toFixed(1)}% weighted`}
          />
          <KpiCard
            title="Closed Deals"
            value={stats.dealCount}
            icon={<CheckCircle2 />}
            color="emerald"
            subtitle={`${stats.wonProjects} projects active`}
          />
          <KpiCard
            title="Conversion Rate"
            value={stats.conversionRate}
            icon={<TrendingUp />}
            color="amber"
            format="percentage"
            subtitle={`Avg: ${formatCompactCurrency(stats.avgDealSize)}`}
          />
        </div>

        {/* Aging Alert */}
        {stats.agingBreach > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-800">Aging Pipeline Alert</h3>
              <p className="text-sm text-amber-700">
                Terdapat {stats.agingBreach} deal yang sudah lebih dari {AGING_THRESHOLDS.warning} hari tanpa progress.
                Segera lakukan follow up.
              </p>
            </div>
          </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'table' && (
          <TableView 
            data={filteredData}
            onRowClick={(deal) => router.push(`/admin/crm/inquiry/${deal.inquiry_id}`)}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView 
            stages={STAGE_CONFIG}
            distribution={stageDistribution}
            data={filteredData}
            onDealClick={(deal) => router.push(`/admin/crm/inquiry/${deal.inquiry_id}`)}
          />
        )}

        {viewMode === 'chart' && (
          <AnalyticsView 
            stats={stats}
            stageDistribution={stageDistribution}
            monthlyData={monthlyData}
            agingAnalysis={agingAnalysis}
          />
        )}

        {/* Summary Footer */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap justify-between items-center text-sm shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-500">Showing {filteredData.length} deals</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Active: {filteredData.filter(d => d.stage !== 'LOST').length}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Lost: {filteredData.filter(d => d.stage === 'LOST').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-slate-400" />
            <span className="text-slate-400 text-xs">
              Last updated: {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================= TABLE VIEW =================
function TableView({ data, onRowClick }: { data: Deal[]; onRowClick: (deal: Deal) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Project</th>
              <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stage</th>
              <th className="p-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Probability</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aging</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((deal) => {
                const agingStatus = getAgingStatus(deal.aging_days)
                const stage = STAGE_CONFIG[deal.stage]

                return (
                  <tr
                    key={deal.pipeline_id}
                    className={`hover:bg-slate-50 cursor-pointer transition ${
                      agingStatus === 'critical' ? 'bg-rose-50/30' :
                      agingStatus === 'warning' ? 'bg-amber-50/30' : ''
                    }`}
                    onClick={() => onRowClick(deal)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{deal.project_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{deal.inquiry_id}</div>
                    </td>
                    <td className="p-4 text-slate-600">{deal.customer_name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage.bgColor} ${stage.textColor} border ${stage.borderColor}`}>
                        {stage.label}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-800">
                      {formatCompactCurrency(deal.final_value)}
                      {deal.proposal_value && deal.proposal_value > deal.estimated_value && (
                        <div className="text-xs text-emerald-600 font-normal mt-0.5">
                          ↑ from {formatCompactCurrency(deal.estimated_value)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              deal.probability >= 0.7 ? 'bg-emerald-500' :
                              deal.probability >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${deal.probability * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {Math.round(deal.probability * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        agingStatus === 'critical' ? 'bg-rose-100 text-rose-700' :
                        agingStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {deal.aging_days} hari
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRowClick(deal)
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Eye size={16} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================= KANBAN VIEW =================
function KanbanView({ 
  stages, 
  distribution, 
  data,
  onDealClick 
}: { 
  stages: Record<string, StageConfig>
  distribution: Record<string, { count: number; value: number }>
  data: Deal[]
  onDealClick: (deal: Deal) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Object.entries(stages).map(([stageKey, config]) => {
        const stageData = data.filter(d => d.stage === stageKey)
        const stageStats = distribution[stageKey] || { count: 0, value: 0 }
        const Icon = config.icon

        return (
          <div key={stageKey} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className={`p-4 ${config.bgColor} border-b ${config.borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={config.textColor} />
                  <h3 className={`font-semibold ${config.textColor}`}>{config.label}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/80 ${config.textColor}`}>
                  {stageStats.count}
                </span>
              </div>
              <p className={`text-sm font-bold mt-2 ${config.textColor}`}>
                {formatCompactCurrency(stageStats.value)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{config.description}</p>
            </div>

            <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto bg-slate-50/50">
              {stageData.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No deals</p>
              ) : (
                stageData.map((deal) => (
                  <div
                    key={deal.pipeline_id}
                    className="p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm cursor-pointer transition"
                    onClick={() => onDealClick(deal)}
                  >
                    <p className="font-medium text-sm text-slate-800">{deal.project_name}</p>
                    <p className="text-xs text-slate-500 mt-1">{deal.customer_name}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs font-semibold text-slate-800">
                        {formatCompactCurrency(deal.final_value)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        getAgingStatus(deal.aging_days) === 'critical'
                          ? 'bg-rose-100 text-rose-700'
                          : getAgingStatus(deal.aging_days) === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deal.aging_days}hari
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const BAR_COLOR: Record<string, string> = {
  slate: "bg-slate-600",
  blue: "bg-blue-600",
  amber: "bg-amber-600",
  emerald: "bg-emerald-600",
  rose: "bg-rose-600",
}

// ================= ANALYTICS VIEW =================
function AnalyticsView({ 
  stats, 
  stageDistribution, 
  monthlyData,
  agingAnalysis 
}: { 
  stats: Stats
  stageDistribution: Record<string, { count: number; value: number }>
  monthlyData: Array<{ month: string; value: number; count: number }>
  agingAnalysis: Record<string, { count: number; value: number }>
}) {
  return (
    <div className="space-y-6">
      {/* Stage Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-slate-600" />
          Stage Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
              const data = stageDistribution[stage] || { count: 0, value: 0 }
              const percentage = stats.totalPipeline > 0 
                ? (data.value / stats.totalPipeline) * 100 
                : 0

              return (
                <div key={stage}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${config.textColor}`}>{config.label}</span>
                    <span className="font-semibold text-slate-800">{formatCompactCurrency(data.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${BAR_COLOR[config.color as keyof typeof BAR_COLOR]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{data.count} deals</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Pipeline Health</p>
              <p className="text-2xl font-bold text-slate-800">{stats.pipelineHealth.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">Weighted vs Total</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-800">{stats.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 mt-1">{stats.dealCount} deals closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-amber-600" />
          Aging Analysis
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600">Normal</p>
            <p className="text-xl font-bold text-slate-800">{agingAnalysis.normal.count}</p>
            <p className="text-xs text-slate-500 mt-1">{formatCompactCurrency(agingAnalysis.normal.value)}</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">Warning (&gt;14h)</p>
            <p className="text-xl font-bold text-amber-700">{agingAnalysis.warning.count}</p>
            <p className="text-xs text-amber-600 mt-1">{formatCompactCurrency(agingAnalysis.warning.value)}</p>
          </div>
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm text-rose-700">Critical (&gt;30h)</p>
            <p className="text-xl font-bold text-rose-700">{agingAnalysis.critical.count}</p>
            <p className="text-xs text-rose-600 mt-1">{formatCompactCurrency(agingAnalysis.critical.value)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-slate-600" />
            Monthly Revenue Trend
          </h3>
          <div className="space-y-4">
            {monthlyData.map((item) => {
              const maxValue = Math.max(...monthlyData.map(d => d.value))
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0

              return (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-600">{item.month}</span>
                    <span className="text-slate-800 font-semibold">
                      {formatCompactCurrency(item.value)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-slate-600 to-slate-500 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.count} deals
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ================= KPI CARD =================
function KpiCard({ 
  title, 
  value, 
  icon, 
  color, 
  format = 'currency',
  subtitle
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  format?: 'currency' | 'number' | 'percentage'
  subtitle?: string
}) {
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  const formattedValue = format === 'currency' 
    ? formatCurrency(value)
    : format === 'percentage'
    ? `${value.toFixed(1)}%`
    : value.toLocaleString('id-ID')

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-4">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{formattedValue}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  )
}
