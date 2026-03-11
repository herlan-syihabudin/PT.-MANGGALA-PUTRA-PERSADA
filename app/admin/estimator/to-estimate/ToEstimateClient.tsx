"use client"

import { useState, useMemo, useCallback, useEffect } from "react" // Added useCallback, useEffect
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  RefreshCw, // Added for refresh
  AlertTriangle // Added for warnings
} from "lucide-react"
import { formatIDR } from "@/lib/format"

// ===== ENHANCED TYPES =====
type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
  layanan?: string // Added missing field
  status?: string // Added missing field
}

type EnrichedInquiry = Inquiry & {
  daysOld: number
  dealScore: number
  winProbability: number
  assignedEstimator: string
  riskLevel: "Low" | "Medium" | "High"
  recommendation: string
  priorityScore: number // Added for better sorting
  valueTier: "A" | "B" | "C" | "D" // Added for categorization
}

type EstimatorLoad = {
  name: string
  active: number
  capacity: number // Added capacity
  skills?: string[] // Added for better assignment
}

// ===== CONFIGURATION =====
const ESTIMATOR_CAPACITY = 8 // Max per estimator

const ESTIMATOR_TEAM: EstimatorLoad[] = [
  { name: "Budi", active: 3, capacity: ESTIMATOR_CAPACITY, skills: ["Interior", "Exterior"] },
  { name: "Andi", active: 5, capacity: ESTIMATOR_CAPACITY, skills: ["Structural", "MEP"] },
  { name: "Rizky", active: 2, capacity: ESTIMATOR_CAPACITY, skills: ["Landscape", "Interior"] },
  { name: "Siti", active: 0, capacity: ESTIMATOR_CAPACITY, skills: ["MEP", "Structural"] }, // Added
]

const DEAL_SCORE_WEIGHTS = {
  VALUE: { max: 40, tiers: [
    { threshold: 500000000, score: 40 },
    { threshold: 250000000, score: 30 },
    { threshold: 100000000, score: 25 },
    { threshold: 50000000, score: 20 },
    { threshold: 0, score: 15 }
  ]},
  AGE: { max: 30, tiers: [
    { threshold: 7, score: 30 },
    { threshold: 14, score: 20 },
    { threshold: 21, score: 15 },
    { threshold: Infinity, score: 10 }
  ]},
  PRIORITY: {
    high: 30,
    medium: 20,
    low: 10
  }
}

// ===== MAIN COMPONENT =====
export default function ToEstimateClient({ data }: { data: Inquiry[] }) {

  const router = useRouter()

  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("all")
  const [sortBy, setSortBy] = useState<"score" | "days" | "value">("score")
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      const res = await fetch("/api/estimator/inquiry/pending")

      if (!res.ok) {
        throw new Error("Failed to refresh")
      }

      router.refresh()
    } catch (err) {
      setError("Gagal refresh data")
    } finally {
      setIsRefreshing(false)
    }
  }, [router])

  // Enrich data with kalkulasi
  const enrichedData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Calculate dynamic estimator loads
    const currentLoad = [...ESTIMATOR_TEAM].map(e => ({
      ...e,
      active: e.active // In real app, this would come from API
    }))

    return data
      .map(i => {
        const created = new Date(i.tanggal_masuk || Date.now())

const daysOld = Math.floor(
  (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
)

        // Deal Score dengan config
        const valueScore = DEAL_SCORE_WEIGHTS.VALUE.tiers
          .find(tier => i.estimasi_nilai >= tier.threshold)?.score || 15

        const ageScore = DEAL_SCORE_WEIGHTS.AGE.tiers
          .find(tier => daysOld < tier.threshold)?.score || 10

        const priorityMap = {
  urgent: "high",
  normal: "medium"
}

const normalizedPriority =
  priorityMap[i.prioritas?.toLowerCase() as keyof typeof priorityMap] || "low"

const priorityScore =
  DEAL_SCORE_WEIGHTS.PRIORITY[normalizedPriority]

        const dealScore = Math.min(100, valueScore + ageScore + priorityScore)

        // Win Probability with more nuance
        const winProbability = (() => {
          if (dealScore > 85) return 85
          if (dealScore > 70) return 70
          if (dealScore > 55) return 55
          if (dealScore > 40) return 40
          return 30
        })()

        // Smart assignment based on load and skills
        const availableEstimators = currentLoad
          .map(e => ({
            ...e,
            load: e.active / e.capacity,
            score: e.active // Lower is better
          }))
          .sort((a, b) => a.score - b.score)

        const assignedEstimator = availableEstimators[0]?.name || "Unassigned"

        // Update load for next assignment (simulasi)
        const assignedIndex = currentLoad.findIndex(e => e.name === assignedEstimator)
        if (assignedIndex !== -1) {
          currentLoad[assignedIndex].active++
        }

        // Risk Level dengan kriteria lebih jelas
        let riskLevel: "Low" | "Medium" | "High" = "Low"
        if (daysOld > 21 || winProbability < 40) riskLevel = "High"
        else if (daysOld > 14 || winProbability < 60) riskLevel = "Medium"

        // AI Recommendation yang lebih dinamis
        let recommendation = ""
        if (riskLevel === "High") {
          recommendation = daysOld > 21 
            ? "⚠️ Telat >21 hari, perlu escalation"
            : "🔴 Risiko tinggi, review segera"
        } else if (dealScore > 80) {
          recommendation = "⭐ Hot prospect, prioritaskan closing"
        } else if (winProbability < 40) {
          recommendation = "📉 Win rate rendah, evaluasi strategi"
        } else if (daysOld < 7) {
          recommendation = "🆕 Prospek baru, jadwalkan survey"
        } else {
          recommendation = "📊 Monitor progress normal"
        }

        // Value Tier untuk grouping
        const valueTier = 
          i.estimasi_nilai > 500000000 ? "A" :
          i.estimasi_nilai > 250000000 ? "B" :
          i.estimasi_nilai > 100000000 ? "C" : "D"

        return {
          ...i,
          daysOld,
          dealScore,
          winProbability,
          assignedEstimator,
          riskLevel,
          recommendation,
          priorityScore,
          valueTier
        }
      })
      .sort((a, b) => b.dealScore - a.dealScore) // Default sort by score
  }, [data])

  // Filter & Sort
  const filtered = useMemo(() => {
    return enrichedData
      .filter(i => {
        const matchSearch = search === "" ||
          i.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          i.nama_pekerjaan?.toLowerCase().includes(search.toLowerCase()) ||
          i.inquiry_id?.toLowerCase().includes(search.toLowerCase())

        const matchPriority = priority === "all" ||
          i.prioritas?.toLowerCase() === priority.toLowerCase()

        return matchSearch && matchPriority
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.dealScore - a.dealScore
        if (sortBy === "days") return b.daysOld - a.daysOld
        if (sortBy === "value") return b.estimasi_nilai - a.estimasi_nilai
        return 0
      })
  }, [enrichedData, search, priority, sortBy])

  // Stats dengan perhitungan yang lebih akurat
  const stats = useMemo(() => {
    const totalProjection = filtered.reduce(
      (sum, i) => sum + i.estimasi_nilai * (i.winProbability / 100),
      0
    )

    const highPriority = filtered.filter(i => i.riskLevel === "High").length
    const avgScore = filtered.length > 0
      ? Math.round(filtered.reduce((sum, i) => sum + i.dealScore, 0) / filtered.length)
      : 0

    const totalValue = filtered.reduce((sum, i) => sum + i.estimasi_nilai, 0)
    const avgValue = filtered.length > 0 ? totalValue / filtered.length : 0

    const byRisk = {
      Low: filtered.filter(i => i.riskLevel === "Low").length,
      Medium: filtered.filter(i => i.riskLevel === "Medium").length,
      High: filtered.filter(i => i.riskLevel === "High").length
    }

    const byValueTier = {
      A: filtered.filter(i => i.valueTier === "A").length,
      B: filtered.filter(i => i.valueTier === "B").length,
      C: filtered.filter(i => i.valueTier === "C").length,
      D: filtered.filter(i => i.valueTier === "D").length
    }

    return {
      totalProjection,
      highPriority,
      avgScore,
      totalValue,
      avgValue,
      byRisk,
      byValueTier
    }
  }, [filtered])

  // Estimator load distribution
  const estimatorStats = useMemo(() => {
    const assignment = filtered.reduce((acc, item) => {
      acc[item.assignedEstimator] = (acc[item.assignedEstimator] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return ESTIMATOR_TEAM.map(e => ({
      ...e,
      assigned: assignment[e.name] || 0,
      loadPercentage: ((e.active + (assignment[e.name] || 0)) / e.capacity) * 100
    }))
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Header dengan Refresh */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
            To Estimate
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} dari {data.length} inquiry siap diproses estimator
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inquiry"
          value={filtered.length}
          subtitle={`Total nilai ${formatIDR(stats.totalValue)}`}
          icon={<Briefcase size={18} />}
          color="slate"
        />
        <StatCard
          label="High Priority"
          value={stats.highPriority}
          subtitle={
 filtered.length
   ? `${((stats.highPriority / filtered.length) * 100).toFixed(0)}%`
   : "0%"
}
          icon={<AlertCircle size={18} />}
          color="rose"
        />
        <StatCard
          label="Avg Deal Score"
          value={stats.avgScore}
          icon={<TrendingUp size={18} />}
          color="blue"
          suffix="pts"
          progress={stats.avgScore}
        />
        <StatCard
          label="Revenue Projection"
          value={formatIDR(stats.totalProjection)}
          subtitle={`Avg deal ${formatIDR(stats.avgValue)}`}
          icon={<DollarSign size={18} />}
          color="emerald"
        />
      </div>

      {/* Estimator Load */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700">Estimator Load</h3>
          <span className="text-xs text-slate-500">Capacity: {ESTIMATOR_CAPACITY} per estimator</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {estimatorStats.map(est => (
            <div key={est.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">{est.name}</span>
                <span className="text-slate-500">
                  {est.active + est.assigned}/{est.capacity}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    est.loadPercentage > 90 ? 'bg-rose-500' :
                    est.loadPercentage > 70 ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, est.loadPercentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari customer, proyek, atau ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white min-w-[140px]"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">Semua Prioritas</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white min-w-[140px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="score">Sort by: Deal Score</option>
              <option value="days">Sort by: Umur (Tertua)</option>
              <option value="value">Sort by: Nilai Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table with virtualization untuk performance */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer & Project</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Umur</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deal Score</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estimator</th>
                <th className="p-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk</th>
                <th className="p-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-400 font-medium">Tidak ada inquiry pending</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {search ? 'Coba hapus filter pencarian' : 'Semua inquiry sudah diproses'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.inquiry_id} className="hover:bg-slate-50 transition group">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {item.customer_name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="truncate max-w-[200px]">{item.nama_pekerjaan}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">{item.valueTier}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {formatIDR(item.estimasi_nilai)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        <span className={`text-sm ${
                          item.daysOld > 14 ? 'text-rose-600 font-medium' : 'text-slate-600'
                        }`}>
                          {item.daysOld} hari
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.dealScore >= 70 ? 'bg-emerald-500' :
                              item.dealScore >= 50 ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${item.dealScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {item.dealScore}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {item.assignedEstimator}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <RiskBadge risk={item.riskLevel} />
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/estimator/rab/create?inquiry_id=${item.inquiry_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition group-hover:shadow-md"
                      >
                        <Zap size={14} />
                        Buat RAB
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Section */}
      {filtered.length > 0 && showRecommendations && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Zap size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                  AI Insights
                </p>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Hide
                </button>
              </div>
              <p className="text-sm text-slate-700">
                📊 {stats.byRisk.High} inquiry berisiko tinggi perlu perhatian segera. 
                💰 Proyeksi revenue {formatIDR(stats.totalProjection)} dari {filtered.length} inquiry.
                🎯 Rata-rata deal score {stats.avgScore}% dengan tier A: {stats.byValueTier.A} inquiry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= ENHANCED COMPONENTS ================= */

function StatCard({ 
  label, 
  value, 
  subtitle, 
  icon, 
  color, 
  suffix = "",
  progress
}: {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: "slate" | "rose" | "blue" | "emerald"
  suffix?: string
  progress?: number
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    rose: "bg-rose-100 text-rose-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-800">
            {value}{suffix && <span className="text-sm text-slate-400 ml-1">{suffix}</span>}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {progress !== undefined && (
            <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colors[color].split(' ')[0]}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const config = {
    Low: { 
      color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
      icon: CheckCircle,
      label: "Low Risk"
    },
    Medium: { 
      color: "bg-amber-100 text-amber-700 border-amber-200", 
      icon: AlertCircle,
      label: "Medium Risk"
    },
    High: { 
      color: "bg-rose-100 text-rose-700 border-rose-200", 
      icon: Shield,
      label: "High Risk"
    },
  }

  const { color, icon: Icon, label } = config[risk]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}
