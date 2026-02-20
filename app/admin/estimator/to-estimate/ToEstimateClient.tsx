"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
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
  BarChart3
} from "lucide-react"
import { formatIDR } from "@/lib/format"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
}

type EnrichedInquiry = Inquiry & {
  daysOld: number
  dealScore: number
  winProbability: number
  assignedEstimator: string
  riskLevel: "Low" | "Medium" | "High"
  recommendation: string
}

/* ================= MOCK LOAD (sementara) ================= */
const estimatorLoad = [
  { name: "Budi", active: 3 },
  { name: "Andi", active: 5 },
  { name: "Rizky", active: 2 },
]

export default function ToEstimateClient({ data }: { data: Inquiry[] }) {
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"score" | "days" | "value">("score")

  // Enrich data dengan kalkulasi
  const enrichedData = useMemo(() => {
    return data
      .map(i => {
        const daysOld = Math.floor(
          (Date.now() - new Date(i.tanggal_masuk).getTime()) /
          (1000 * 3600 * 24)
        )

        // Deal Score: kombinasi nilai, umur, prioritas
        const valueScore = 
          i.estimasi_nilai > 500000000 ? 40 :
          i.estimasi_nilai > 250000000 ? 30 :
          i.estimasi_nilai > 100000000 ? 25 :
          i.estimasi_nilai > 50000000 ? 20 : 15

        const ageScore = 
          daysOld < 7 ? 30 :
          daysOld < 14 ? 20 :
          daysOld < 21 ? 15 : 10

        const priorityScore = 
          i.prioritas === "high" ? 30 :
          i.prioritas === "medium" ? 20 : 10

        const dealScore = Math.min(100, valueScore + ageScore + priorityScore)

        // Win Probability (weighted)
        const winProbability = 
          dealScore > 85 ? 85 :
          dealScore > 70 ? 70 :
          dealScore > 55 ? 55 :
          dealScore > 40 ? 40 : 30

        // Assign ke estimator dengan beban paling ringan
        const assignedEstimator = [...estimatorLoad]
          .sort((a, b) => a.active - b.active)[0].name

        // Risk Level
        const riskLevel: "Low" | "Medium" | "High" = 
          daysOld > 21 ? "High" :
          winProbability < 40 ? "High" :
          daysOld > 14 ? "Medium" :
          winProbability < 60 ? "Medium" : "Low"

        // AI Recommendation
        let recommendation = "Monitor progress"
        if (riskLevel === "High")
          recommendation = "Segera follow up atau escalate"
        else if (dealScore > 80)
          recommendation = "Prioritaskan untuk closing"
        else if (winProbability < 40)
          recommendation = "Review ulang strategi penawaran"
        else if (daysOld < 7)
          recommendation = "Prospek baru, jadwalkan survey"

        return {
          ...i,
          daysOld,
          dealScore,
          winProbability,
          assignedEstimator,
          riskLevel,
          recommendation
        }
      })
  }, [data])

  // Filter & Sort
  const filtered = useMemo(() => {
    return enrichedData
      .filter(i => {
        const matchSearch = search === "" ||
          i.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          i.nama_pekerjaan?.toLowerCase().includes(search.toLowerCase())

        const matchPriority = priority === "all" ||
          i.prioritas?.toLowerCase() === priority.toLowerCase()

        return matchSearch && matchPriority
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.dealScore - a.dealScore
        if (sortBy === "days") return b.daysOld - a.daysOld
        return b.estimasi_nilai - a.estimasi_nilai
      })
  }, [enrichedData, search, priority, sortBy])

  // Stats
  const totalProjection = filtered.reduce(
    (sum, i) => sum + i.estimasi_nilai * (i.winProbability / 100),
    0
  )

  const highPriority = filtered.filter(i => i.riskLevel === "High").length
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((sum, i) => sum + i.dealScore, 0) / filtered.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
          To Estimate
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {filtered.length} inquiry siap diproses estimator
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Inquiry"
          value={filtered.length}
          icon={<Briefcase size={18} />}
          color="slate"
        />
        <StatCard
          label="High Priority"
          value={highPriority}
          icon={<AlertCircle size={18} />}
          color="rose"
        />
        <StatCard
          label="Avg Deal Score"
          value={`${avgScore}`}
          icon={<TrendingUp size={18} />}
          color="blue"
          suffix="pts"
        />
        <StatCard
          label="Revenue Projection"
          value={formatIDR(totalProjection)}
          icon={<DollarSign size={18} />}
          color="emerald"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari customer atau proyek..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">Semua Prioritas</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 outline-none bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="score">Sort: Deal Score</option>
              <option value="days">Sort: Tertua</option>
              <option value="value">Sort: Nilai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                  <p className="text-slate-400">Tidak ada inquiry pending</p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.inquiry_id} className="hover:bg-slate-50 transition group">
                  <td className="p-4">
                    <div className="font-medium text-slate-800">
                      {item.customer_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.nama_pekerjaan}
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

      {/* AI Recommendation Summary */}
      {filtered.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Zap size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                AI Recommendation
              </p>
              <p className="text-sm text-slate-700">
                Prioritaskan {highPriority} inquiry dengan risk High. 
                Proyeksi revenue {formatIDR(totalProjection)} dari {filtered.length} inquiry.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon, color, suffix = "" }: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: "slate" | "rose" | "blue" | "emerald"
  suffix?: string
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-600",
    rose: "bg-rose-100 text-rose-600",
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-slate-800">
            {value}{suffix && <span className="text-sm text-slate-400 ml-1">{suffix}</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const config = {
    Low: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    Medium: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle },
    High: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: Shield },
  }

  const { color, icon: Icon } = config[risk]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon size={12} />
      {risk}
    </span>
  )
}
