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
  Flame,
  Thermometer,
  AlertTriangle,
  Shield,
  Rocket,
  Bell,
  BarChart,
  TrendingDown,
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
  last_activity?: string
  status?: string
  probability: number
  aging_days: number
  assigned_to?: string
  assigned_name?: string
  priority_score?: number
  risk_level?: "low" | "medium" | "high"
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
  hotDeals: number
  warmDeals: number
  coldDeals: number
  atRiskDeals: number
}

type RevenueDriver = {
  name: string
  value: number
  percentage: number
}

type FollowUpTask = {
  deal_id: string
  project_name: string
  customer_name: string
  days_since_contact: number
  priority: "high" | "medium" | "low"
  suggested_action: string
}

// ================= CONSTANTS =================
const AGING_THRESHOLDS = {
  warning: 14,
  critical: 30,
}

const BAR_COLOR: Record<string, string> = {
  slate: "bg-slate-600",
  blue: "bg-blue-600",
  amber: "bg-amber-600",
  emerald: "bg-emerald-600",
  rose: "bg-rose-600",
  red: "bg-red-600",
  orange: "bg-orange-600",
  purple: "bg-purple-600",
}

const TEMPERATURE_CONFIG = {
  hot: { threshold: 70, color: "rose", bgColor: "bg-rose-100", textColor: "text-rose-700", icon: Flame },
  warm: { threshold: 40, color: "amber", bgColor: "bg-amber-100", textColor: "text-amber-700", icon: Thermometer },
  cold: { threshold: 0, color: "slate", bgColor: "bg-slate-100", textColor: "text-slate-700", icon: Thermometer },
}

// ================= STAGE CONFIG =================
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

// ================= HELPER FUNCTIONS =================
function getStageFromInquiry(i: any): Deal['stage'] {
  if (i.status === "lost") return "LOST"
  if (i.proposal_status === "approved") return "DEAL"
  if (i.proposal_status === "sent") return "NEGOSIASI"
  if (i.converted_rab_id) return "PENAWARAN"
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

function getDealTemperature(probability: number, aging_days: number, stage: string): "hot" | "warm" | "cold" {
  if (stage === "LOST") return "cold"
  if (stage === "DEAL") return "hot"
  
  let score = probability * 100
  
  // Aging reduces temperature
  if (aging_days > 30) score *= 0.5
  else if (aging_days > 14) score *= 0.7
  
  if (score >= 70) return "hot"
  if (score >= 40) return "warm"
  return "cold"
}

function getRiskLevel(deal: Deal): "low" | "medium" | "high" {
  if (deal.stage === "LOST") return "high"
  if (deal.stage === "DEAL") return "low"
  
  let riskScore = 0
  
  // Aging risk
  if (deal.aging_days > 30) riskScore += 40
  else if (deal.aging_days > 14) riskScore += 20
  
  // Probability risk
  if (deal.probability < 0.3) riskScore += 30
  else if (deal.probability < 0.5) riskScore += 15
  
  // Value risk (high value deals need more attention)
  if (deal.final_value > 1_000_000_000) riskScore += 20
  else if (deal.final_value > 500_000_000) riskScore += 10
  
  if (riskScore >= 50) return "high"
  if (riskScore >= 25) return "medium"
  return "low"
}

function getPriorityScore(deal: Deal): number {
  let score = deal.probability * 100 * (deal.final_value / 1_000_000_000)
  
  // Boost for aging deals that need attention
  if (deal.aging_days > 14 && deal.aging_days < 30) score *= 1.2
  if (deal.aging_days > 30) score *= 1.5 // Urgent
  
  return Math.min(100, Math.round(score))
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
  const [temperatureFilter, setTemperatureFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof Deal>("priority_score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "chart" | "board">("board")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"pipeline" | "intelligence" | "risks">("pipeline")

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/crm/pipeline?summary=true")
        const json = await res.json()

        const mapped = (json.data || []).map((i: any) => {
          const stage = getStageFromInquiry(i)
          const proposalValue = i.proposal_value || 0
          const estimatedValue = i.estimasi_nilai || 0
          const finalValue = proposalValue > 0 ? proposalValue : estimatedValue
          const aging_days = getAgingDays(i.updated_at || i.created_at || i.tanggal_masuk)
          const probability = STAGE_CONFIG[stage]?.probability || 0
          
          const deal = {
            pipeline_id: i.inquiry_id,
            inquiry_id: i.inquiry_id,
            customer_id: i.customer_id,
            customer_name: i.customer_name || "-",
            project_name:
              i.project_name ||
              i.nama_pekerjaan ||
              `${i.customer_name} Project` ||
              i.inquiry_id,
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
            last_activity: i.last_activity_at || i.updated_at || i.created_at || i.tanggal_masuk,
            status: i.status,
            probability,
            aging_days,
            assigned_to: i.assigned_to,
            assigned_name: i.assigned_name,
          }
          
          return {
            ...deal,
            priority_score: getPriorityScore(deal),
            risk_level: getRiskLevel(deal),
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
        if (stageFilter === "all") return true
        if (stageFilter === "active") return d.stage !== "LOST"
        return d.stage === stageFilter
      })
      .filter((d) => {
        if (temperatureFilter === "all") return true
        const temp = getDealTemperature(d.probability, d.aging_days, d.stage)
        return temp === temperatureFilter
      })
      .sort((a, b) => {
        const aVal = a[sortBy] ?? 0
const bVal = b[sortBy] ?? 0
        
        if (sortBy === "final_value" || sortBy === "estimated_value" || sortBy === "priority_score") {
          return sortOrder === "asc" 
            ? (Number(aVal) - Number(bVal))
            : (Number(bVal) - Number(aVal))
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
  }, [data, searchTerm, stageFilter, temperatureFilter, sortBy, sortOrder])

  // ================= INTELLIGENCE & ANALYTICS =================
  const stats = useMemo<Stats>(() => {
    const activeDeals = filteredData.filter(d => d.stage !== "LOST")
    
    const totalPipeline = activeDeals.reduce((s, d) => s + d.final_value, 0)
    const weightedRevenue = filteredData.reduce((s, d) => s + (d.final_value * d.probability), 0)

    const dealCount = filteredData.filter(d => d.stage === "DEAL").length
    const dealValue = filteredData.filter(d => d.stage === "DEAL").reduce((s, d) => s + d.final_value, 0)
    const wonProjects = filteredData.filter(d => d.project_id).length

    const totalClosed = filteredData.filter(d => d.stage === "DEAL" || d.stage === "LOST").length
    const conversionRate = totalClosed > 0 ? (dealCount / totalClosed) * 100 : 0

    const avgDealSize = dealCount > 0 ? dealValue / dealCount : 0
    const pipelineHealth = totalPipeline > 0 ? (weightedRevenue / totalPipeline) * 100 : 0

    const agingBreach = filteredData.filter(d => 
      d.stage !== "DEAL" && d.stage !== "LOST" && d.aging_days > AGING_THRESHOLDS.warning
    ).length

    // Temperature counts
    const hotDeals = filteredData.filter(d => getDealTemperature(d.probability, d.aging_days, d.stage) === "hot").length
    const warmDeals = filteredData.filter(d => getDealTemperature(d.probability, d.aging_days, d.stage) === "warm").length
    const coldDeals = filteredData.filter(d => getDealTemperature(d.probability, d.aging_days, d.stage) === "cold").length
    
    // Risk counts
    const atRiskDeals = filteredData.filter(d => d.risk_level === "high").length

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
      hotDeals,
      warmDeals,
      coldDeals,
      atRiskDeals,
    }
  }, [filteredData])

  // ================= REVENUE DRIVERS =================
  const revenueDrivers = useMemo<RevenueDriver[]>(() => {
    const drivers: Record<string, number> = {}
    
    filteredData.forEach(d => {
      if (d.stage !== "LOST") {
        drivers[d.customer_name] = (drivers[d.customer_name] || 0) + d.final_value
      }
    })
    
    return Object.entries(drivers)
      .map(([name, value]) => ({
        name,
        value,
        percentage: stats.totalPipeline > 0
 ? (value / stats.totalPipeline) * 100
 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [filteredData, stats.totalPipeline])

  // ================= FOLLOW-UP INTELLIGENCE =================
  const followUpTasks = useMemo<FollowUpTask[]>(() => {
    return filteredData
      .filter(d => d.stage !== "DEAL" && d.stage !== "LOST")
      .map(d => {
        const daysSinceContact = getAgingDays(d.last_activity || d.updated_at)
        let priority: "high" | "medium" | "low" = "low"
        let suggested_action = "Monitor progress"
        
        if (daysSinceContact > 14) {
          priority = "high"
          suggested_action = "Follow up segera! Deal sudah tidak ada kontak >14 hari"
        } else if (daysSinceContact > 7) {
          priority = "medium"
          suggested_action = "Jadwalkan follow up dalam minggu ini"
        }
        
        if (d.probability > 0.7 && daysSinceContact > 5) {
          priority = "high"
          suggested_action = "Hot deal! Segera follow up untuk closing"
        }
        
        return {
          deal_id: d.pipeline_id,
          project_name: d.project_name,
          customer_name: d.customer_name,
          days_since_contact: daysSinceContact,
          priority,
          suggested_action,
        }
      })
      .filter(t => t.priority !== "low")
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 }
        return priorityWeight[b.priority] - priorityWeight[a.priority]
      })
  }, [filteredData])

  // ================= PIPELINE RISK DETECTOR =================
  const riskAnalysis = useMemo(() => {
    const atRiskDeals = filteredData.filter(d => d.risk_level === "high")
    const highValueAtRisk = atRiskDeals.reduce((sum, d) => sum + d.final_value, 0)
    
    // Prediksi revenue bulan depan
    const currentMonthRevenue = filteredData
      .filter(d => new Date(d.created_at).getMonth() === new Date().getMonth())
      .reduce((sum, d) => sum + (d.stage === "DEAL" ? d.final_value : 0), 0)
    
    const nextMonthPotential = filteredData
      .filter(d => d.probability > 0.5 && d.stage !== "DEAL" && d.stage !== "LOST")
      .reduce((sum, d) => sum + (d.final_value * d.probability), 0)
    
    const revenueDrop = nextMonthPotential < currentMonthRevenue * 0.7
    
    const riskAlerts: {
 type:string
 message:string
 severity:"high"|"medium"
}[] = []
    
    if (atRiskDeals.length > 0) {
      riskAlerts.push({
        type: "warning",
        message: `${atRiskDeals.length} deal berisiko tinggi dengan total nilai ${formatCurrency(highValueAtRisk)}`,
        severity: "high"
      })
    }
    
    if (stats.totalPipeline < 10_000_000_000) {
      riskAlerts.push({
        type: "warning",
        message: "Pipeline terlalu kecil untuk target bulan depan",
        severity: "medium"
      })
    }
    
    if (revenueDrop) {
      riskAlerts.push({
        type: "danger",
        message: "Potensi revenue drop bulan depan. Perlu aksi segera!",
        severity: "high"
      })
    }
    
    return {
      atRiskCount: atRiskDeals.length,
      atRiskValue: highValueAtRisk,
      nextMonthPotential,
      currentMonthRevenue,
      revenueDrop,
      alerts: riskAlerts,
    }
  }, [filteredData, stats.totalPipeline])

  // ================= EXPORT FUNCTION =================
  const exportToCSV = () => {
    const headers = ['Project', 'Customer', 'Stage', 'Value', 'Probability', 'Aging', 'Risk Level', 'Priority Score']
    const csvData = filteredData.map(d => {
      const temp = getDealTemperature(d.probability, d.aging_days, d.stage)
      return [
        d.project_name,
        d.customer_name,
        d.stage,
        d.final_value,
        `${Math.round(d.probability * 100)}%`,
        `${d.aging_days} hari`,
        d.risk_level,
        d.priority_score || 0,
      ]
    })
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pipeline-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const stageDistribution = useMemo(() => {
  const dist: Record<string,{count:number,value:number}> = {}

  Object.keys(STAGE_CONFIG).forEach(stage=>{
    dist[stage]={count:0,value:0}
  })

  filteredData.forEach(d=>{
  if(!dist[d.stage]) return
  dist[d.stage].count++

  if(d.stage !== "LOST"){
    dist[d.stage].value += d.final_value
  }
})

  return dist
},[filteredData])

  const monthlyData = useMemo(() => {
  const months:Record<string,{value:number,count:number}>={}

  filteredData.forEach(d=>{
    const date=new Date(d.created_at)
    const key=date.toLocaleString("id-ID",{month:"short",year:"numeric"})

    if(!months[key]) months[key]={value:0,count:0}

    if(d.stage==="DEAL"){
      months[key].value+=d.final_value
      months[key].count++
    }
  })

  return Object.entries(months)
    .map(([month,data])=>({
      month,
      value:data.value,
      count:data.count
    }))
    .sort((a,b)=>{
      return new Date(a.month).getTime() - new Date(b.month).getTime()
    })

},[filteredData])

  const agingAnalysis = useMemo(() => {
  const result = {
    normal: { count: 0, value: 0 },
    warning: { count: 0, value: 0 },
    critical: { count: 0, value: 0 },
  }

  filteredData.forEach((d) => {
    if (d.stage === "LOST") return

    const status = getAgingStatus(d.aging_days)
    result[status].count++
    result[status].value += d.final_value
  })

  return result
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white sticky top-0 z-10 border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <BarChart3 size={28} className="text-slate-300" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Pipeline Intelligence</h1>
                <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  AI-powered sales analytics & risk detection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
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

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl transition ${
                  showFilters ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                } border border-white/10`}
              >
                <Filter size={20} className="text-slate-300" />
              </button>

              <button
                onClick={exportToCSV}
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
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
                <label className="block text-xs font-medium text-slate-300 mb-2">Temperature</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={temperatureFilter}
                  onChange={(e) => setTemperatureFilter(e.target.value)}
                >
                  <option value="all">Semua</option>
                  <option value="hot">Hot Deals</option>
                  <option value="warm">Warm Deals</option>
                  <option value="cold">Cold Deals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof Deal)}
                >
                  <option value="priority_score">AI Priority</option>
                  <option value="updated_at">Last Updated</option>
                  <option value="final_value">Value</option>
                  <option value="probability">Probability</option>
                  <option value="aging_days">Aging</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Sort Order</label>
                <select
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'pipeline', label: 'Pipeline', icon: BarChart3 },
              { id: 'intelligence', label: 'AI Intelligence', icon: Zap },
              { id: 'risks', label: 'Risk Detector', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id 
                      ? 'border-slate-800 text-slate-800' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Cards */}
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
            title="Hot Deals"
            value={stats.hotDeals}
            icon={<Flame />}
            color="rose"
            format="number"
            subtitle={`${stats.warmDeals} warm, ${stats.coldDeals} cold`}
          />
          <KpiCard
            title="At Risk"
            value={stats.atRiskDeals}
            icon={<AlertTriangle />}
            color="amber"
            format="number"
            subtitle={`${formatCompactCurrency(riskAnalysis.atRiskValue)} value at risk`}
          />
        </div>

        {/* Risk Alerts */}
        {riskAnalysis.alerts.length > 0 && (
          <div className="space-y-3">
            {riskAnalysis.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 flex items-start gap-3 shadow-sm ${
                  alert.severity === 'high' 
                    ? 'bg-rose-50 border border-rose-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                {alert.severity === 'high' ? (
                  <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    alert.severity === 'high' ? 'text-rose-800' : 'text-amber-800'
                  }`}>
                    Pipeline Risk Detected
                  </h3>
                  <p className={`text-sm ${
                    alert.severity === 'high' ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'pipeline' && (
          <>
            {viewMode === 'table' && (
              <TableView 
                data={filteredData}
                onRowClick={(deal) => router.push(`/admin/crm/pipeline/${deal.pipeline_id}`)}
              />
            )}

            {viewMode === 'kanban' && (
              <KanbanView 
                stages={STAGE_CONFIG}
                distribution={stageDistribution}
                data={filteredData}
                onDealClick={(deal) => router.push(`/admin/crm/pipeline/${deal.pipeline_id}`)}
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

            {viewMode === 'board' && (
              <HotDealsBoard 
                data={filteredData}
                onDealClick={(deal) => router.push(`/admin/crm/pipeline/${deal.pipeline_id}`)}
              />
            )}

            {/* View Mode Selector */}
            <div className="flex justify-end gap-2">
              {[
                { id: 'board', label: '🔥 Hot Board', icon: Flame },
                { id: 'table', label: 'Table', icon: FileText },
                { id: 'kanban', label: 'Kanban', icon: Briefcase },
                { id: 'chart', label: 'Analytics', icon: PieChart }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    viewMode === mode.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <mode.icon size={16} />
                  {mode.label}
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === 'intelligence' && (
          <IntelligenceDashboard
            stats={stats}
            revenueDrivers={revenueDrivers}
            followUpTasks={followUpTasks}
          />
        )}

        {activeTab === 'risks' && (
          <RiskDashboard
            data={filteredData}
            riskAnalysis={riskAnalysis}
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
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-slate-400" />
            <span className="text-slate-400 text-xs">
              AI updated: {new Date().toLocaleTimeString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================= HOT DEALS BOARD =================
function HotDealsBoard({ data, onDealClick }: { data: Deal[]; onDealClick: (deal: Deal) => void }) {
  const hotDeals = data
    .filter(d => {
      const temp = getDealTemperature(d.probability, d.aging_days, d.stage)
      return temp === "hot" && d.stage !== "DEAL"
    })
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))

  if (hotDeals.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <Flame size={48} className="mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Hot Deals</h3>
        <p className="text-sm text-slate-500">
          Semua deal dalam suhu normal. Pantau terus untuk peluang baru.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Flame size={20} className="text-rose-500" />
          Hot Deals Board ({hotDeals.length})
        </h2>
        <span className="text-sm text-slate-500">Prioritas berdasarkan AI scoring</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotDeals.map((deal) => (
          <div
            key={deal.pipeline_id}
            className="bg-white border border-rose-200 rounded-xl p-5 hover:shadow-lg cursor-pointer transition-all hover:scale-105"
            onClick={() => onDealClick(deal)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Flame size={18} className="text-rose-600" />
              </div>
              <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
                Priority {deal.priority_score}
              </span>
            </div>

            <h3 className="font-semibold text-slate-800 mb-1">{deal.project_name}</h3>
            <p className="text-sm text-slate-500 mb-3">{deal.customer_name}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Value</span>
                <span className="font-semibold text-slate-800">{formatCompactCurrency(deal.final_value)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Probability</span>
                <span className="font-medium text-emerald-600">{Math.round(deal.probability * 100)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Aging</span>
                <span className={`font-medium ${
                  deal.aging_days > 7 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {deal.aging_days} hari
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-amber-500" />
                <span className="text-xs text-slate-600">
                  {deal.probability > 0.8 
                    ? 'Closing soon! Follow up intensif'
                    : 'High potential deal'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ================= INTELLIGENCE DASHBOARD =================
function IntelligenceDashboard({ 
  stats, 
  revenueDrivers,
  followUpTasks 
}: { 
  stats: Stats
  revenueDrivers: RevenueDriver[]
  followUpTasks: FollowUpTask[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Drivers */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-600" />
            Top Revenue Drivers
          </h3>
          
          <div className="space-y-4">
            {revenueDrivers.map((driver, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{driver.name}</span>
                  <span className="font-semibold text-slate-800">{formatCompactCurrency(driver.value)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    style={{ width: `${driver.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {driver.percentage.toFixed(1)}% of total pipeline
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Intelligence */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell size={18} className="text-amber-600" />
            Follow-up Intelligence
          </h3>

          {followUpTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Tidak ada follow-up yang diperlukan saat ini
            </p>
          ) : (
            <div className="space-y-3">
              {followUpTasks.slice(0, 5).map((task) => (
                <div key={task.deal_id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`p-1.5 rounded-full ${
                    task.priority === 'high' ? 'bg-rose-100' : 'bg-amber-100'
                  }`}>
                    {task.priority === 'high' ? (
                      <AlertCircle size={14} className="text-rose-600" />
                    ) : (
                      <Clock size={14} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{task.project_name}</p>
                    <p className="text-xs text-slate-500">{task.customer_name}</p>
                    <p className="text-xs text-amber-600 mt-1">{task.suggested_action}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {task.days_since_contact} hari
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-amber-400" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-300 mb-1">Pipeline Health</p>
              <p className="text-2xl font-bold">{stats.pipelineHealth.toFixed(1)}%</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${stats.pipelineHealth}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-sm text-slate-300 mb-2">AI Recommendation</p>
              <p className="text-sm text-slate-100">
                {stats.pipelineHealth < 50 
                  ? 'Pipeline health rendah. Fokus pada deal dengan probability tinggi.'
                  : stats.agingBreach > 3
                  ? `${stats.agingBreach} deal aging perlu follow-up segera.`
                  : 'Pipeline sehat. Pertahankan momentum.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-400">Hot Deals</p>
                <p className="text-lg font-semibold">{stats.hotDeals}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">At Risk</p>
                <p className="text-lg font-semibold text-rose-400">{stats.atRiskDeals}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target size={18} className="text-slate-600" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Avg Deal Size</span>
              <span className="font-medium text-slate-800">{formatCompactCurrency(stats.avgDealSize)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Conversion Rate</span>
              <span className="font-medium text-emerald-600">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Active Deals</span>
              <span className="font-medium text-slate-800">{stats.activeDeals}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Won Projects</span>
              <span className="font-medium text-slate-800">{stats.wonProjects}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================= RISK DASHBOARD =================
function RiskDashboard({ 
  data, 
  riskAnalysis 
}: { 
  data: Deal[]
  riskAnalysis: any
}) {
  const highRiskDeals = data.filter(d => d.risk_level === "high")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Risk Metrics */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-rose-600" />
            High Risk Deals
          </h3>

          {highRiskDeals.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Tidak ada deal dengan risiko tinggi
            </p>
          ) : (
            <div className="space-y-3">
              {highRiskDeals.map((deal) => (
                <div key={deal.pipeline_id} className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-800">{deal.project_name}</h4>
                    <span className="px-2 py-1 bg-rose-200 text-rose-800 text-xs rounded-full">
                      {deal.risk_level}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{deal.customer_name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Value</span>
                      <p className="font-medium text-slate-800">{formatCompactCurrency(deal.final_value)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Aging</span>
                      <p className="font-medium text-amber-600">{deal.aging_days} hari</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Prob.</span>
                      <p className="font-medium text-rose-600">{Math.round(deal.probability * 100)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4">Risk Summary</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <p className="text-sm text-rose-600">Value at Risk</p>
              <p className="text-2xl font-bold text-rose-700">
                {formatCompactCurrency(riskAnalysis.atRiskValue)}
              </p>
              <p className="text-xs text-rose-500 mt-1">
                {riskAnalysis.atRiskCount} deals berisiko tinggi
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-600">Next Month Forecast</p>
              <p className="text-2xl font-bold text-amber-700">
                {formatCompactCurrency(riskAnalysis.nextMonthPotential)}
              </p>
              <p className="text-xs text-amber-500 mt-1">
                {riskAnalysis.revenueDrop ? '⚠️ Potensi drop' : 'Stabil'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-600">Risk Factors</p>
              <ul className="mt-2 space-y-2">
                <li className="text-xs text-slate-500 flex items-center gap-2">
  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
  Aging &gt; 30 hari: {data.filter(d => d.aging_days > 30).length} deals
</li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Probabilitas rendah: {data.filter(d => d.probability < 0.3).length} deals
                </li>
                <li className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Tidak ada aktivitas: {data.filter(d => d.aging_days > 7).length} deals
                </li>
              </ul>
            </div>
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
              <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Temp</th>
              <th className="p-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Probability</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aging</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
              <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center text-slate-400">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              data.map((deal) => {
                const agingStatus = getAgingStatus(deal.aging_days)
                const stage = STAGE_CONFIG[deal.stage]
                const temperature = getDealTemperature(deal.probability, deal.aging_days, deal.stage)
                const TempIcon = temperature === 'hot' ? Flame : Thermometer

                return (
                  <tr
                    key={deal.pipeline_id}
                    className={`hover:bg-slate-50 cursor-pointer transition ${
                      deal.risk_level === 'high' ? 'bg-rose-50/30' :
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
                    <td className="p-4">
                      <div className={`flex items-center gap-1 ${
                        temperature === 'hot' ? 'text-rose-600' :
                        temperature === 'warm' ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        <TempIcon size={14} />
                        <span className="text-xs font-medium capitalize">{temperature}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-800">
                      {formatCompactCurrency(deal.final_value)}
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
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        deal.risk_level === 'high' ? 'bg-rose-100 text-rose-700' :
                        deal.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {deal.risk_level}
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
                stageData.map((deal) => {
                  const temperature = getDealTemperature(deal.probability, deal.aging_days, deal.stage)
                  const TempIcon = temperature === 'hot' ? Flame : temperature === 'warm' ? Thermometer : null

                  return (
                    <div
                      key={deal.pipeline_id}
                      className={`p-3 bg-white border rounded-lg hover:shadow-sm cursor-pointer transition ${
                        temperature === 'hot' ? 'border-rose-200' :
                        temperature === 'warm' ? 'border-amber-200' : 'border-slate-200'
                      }`}
                      onClick={() => onDealClick(deal)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm text-slate-800">{deal.project_name}</p>
                        {TempIcon && (
                          <TempIcon size={14} className={
                            temperature === 'hot' ? 'text-rose-500' : 'text-amber-500'
                          } />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{deal.customer_name}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-semibold text-slate-800">
                          {formatCompactCurrency(deal.final_value)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          deal.risk_level === 'high' ? 'bg-rose-100 text-rose-700' :
                          deal.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {deal.aging_days}hari
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
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
  monthlyData: { month: string; value: number; count: number }[]
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
                    <span className="font-semibold text-slate-800">
                      {formatCompactCurrency(data.value)}
                    </span>
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
            <p className="text-xs text-slate-500 mt-1">
              {formatCompactCurrency(agingAnalysis.normal.value)}
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">Warning (&gt;14 hari)</p>
            <p className="text-xl font-bold text-amber-700">{agingAnalysis.warning.count}</p>
            <p className="text-xs text-amber-600 mt-1">
              {formatCompactCurrency(agingAnalysis.warning.value)}
            </p>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm text-rose-700">Critical (&gt;30 hari)</p>
            <p className="text-xl font-bold text-rose-700">{agingAnalysis.critical.count}</p>
            <p className="text-xs text-rose-600 mt-1">
              {formatCompactCurrency(agingAnalysis.critical.value)}
            </p>
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
            {(() => {
              const maxValue = Math.max(...monthlyData.map((d) => d.value), 0)

              return monthlyData.map((item) => {
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
              })
            })()}
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
    rose: 'bg-rose-100 text-rose-600',
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

