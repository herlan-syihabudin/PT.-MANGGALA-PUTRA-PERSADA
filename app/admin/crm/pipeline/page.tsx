"use client"

import { useEffect, useState, useMemo } from "react"
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Search,
} from "lucide-react"

type Deal = {
  pipeline_id: string
  customer_id: string
  project_name: string
  stage:
    | "FOLLOW UP"
    | "PENAWARAN"
    | "NEGOSIASI"
    | "DEAL"
    | "ON GOING"
    | "LOST"
  estimated_value: number
  rab_id: string
  proposal_id: string
  created_at: string
  updated_at: string
}

const stageProbability: Record<string, number> = {
  "FOLLOW UP": 0.2,
  PENAWARAN: 0.5,
  NEGOSIASI: 0.7,
  DEAL: 1,
  "ON GOING": 1,
  LOST: 0,
}

const stageColor: Record<string, string> = {
  "FOLLOW UP": "bg-blue-100 text-blue-700",
  PENAWARAN: "bg-orange-100 text-orange-700",
  NEGOSIASI: "bg-yellow-100 text-yellow-700",
  DEAL: "bg-green-100 text-green-700",
  "ON GOING": "bg-purple-100 text-purple-700",
  LOST: "bg-red-100 text-red-700",
}

function getAgingDays(date?: string) {
  if (!date) return 0
  const diff = Date.now() - new Date(date).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

export default function CRMPipelinePage() {
  const [data, setData] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/crm/pipeline")
        const json = await res.json()
        setData(json || [])
      } catch (e) {
        console.error("Gagal ambil data CRM", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter((d) =>
      d.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const stats = useMemo(() => {
    const totalValue = filteredData.reduce(
      (s, d) => s + (d.estimated_value || 0),
      0
    )

    const weightedRevenue = filteredData.reduce(
      (s, d) =>
        s +
        (d.estimated_value || 0) *
          (stageProbability[d.stage] ?? 0),
      0
    )

    const dealCount = filteredData.filter(
      (d) => d.stage === "DEAL"
    ).length

    const conversionRate =
      filteredData.length > 0
        ? (dealCount / filteredData.length) * 100
        : 0

    const getStats = (stage: string) => {
      const items = filteredData.filter((d) => d.stage === stage)
      return {
        count: items.length,
        value: items.reduce(
          (s, d) => s + (d.estimated_value || 0),
          0
        ),
      }
    }

    return {
      followUp: getStats("FOLLOW UP"),
      penawaran: getStats("PENAWARAN"),
      negosiasi: getStats("NEGOSIASI"),
      deal: getStats("DEAL"),
      totalValue,
      weightedRevenue,
      conversionRate,
    }
  }, [filteredData])

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {}

    filteredData.forEach((d) => {
      if (!d.created_at) return

      const month = new Date(d.created_at).toLocaleDateString(
        "id-ID",
        { month: "short", year: "2-digit" }
      )

      map[month] =
        (map[month] || 0) + (d.estimated_value || 0)
    })

    return Object.entries(map)
  }, [filteredData])

  if (loading)
    return (
      <div className="p-10 animate-pulse text-gray-400">
        Loading Pipeline Power...
      </div>
    )

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <BarChart3 className="text-blue-600" />
            Pipeline & Deals
          </h1>
          <p className="text-gray-500">
            Monitoring revenue stream & progress.
          </p>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari project..."
            className="pl-10 pr-4 py-2 border rounded-xl bg-white w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Pipeline"
          value={stats.totalValue}
          icon={<TrendingUp />}
          color="bg-gray-900"
          isCurrency
        />
        <StatCard
          title="Forecast Revenue"
          value={stats.weightedRevenue}
          icon={<TrendingUp />}
          color="bg-purple-600"
          isCurrency
        />
        <StatCard
          title="Closed Deals"
          value={stats.deal.count}
          subValue={stats.deal.value}
          icon={<CheckCircle2 />}
          color="bg-green-600"
        />
        <StatCard
          title="Conversion Rate"
          value={stats.conversionRate.toFixed(1) + "%"}
          icon={<Users />}
          color="bg-blue-600"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl p-6 mb-10">
        <h3 className="font-bold mb-6">Active Deals</h3>

        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-left">Stage</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Aging</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d) => (
              <tr
                key={d.pipeline_id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {d.project_name}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      stageColor[d.stage] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {d.stage}
                  </span>
                </td>
                <td className="p-3 font-semibold">
                  Rp{" "}
                  {(d.estimated_value || 0).toLocaleString(
                    "id-ID"
                  )}
                </td>
                <td className="p-3 text-gray-500">
                  {getAgingDays(d.updated_at)} hari
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MONTHLY */}
      {stats.totalValue > 0 && (
        <div className="bg-white border rounded-2xl p-8">
          <h3 className="font-bold mb-6">
            Monthly Revenue
          </h3>
          <div className="space-y-4">
            {monthlyData.map(([month, value]) => (
              <div key={month}>
                <div className="flex justify-between text-sm font-semibold">
                  <span>{month}</span>
                  <span>
                    Rp {value.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{
                      width: `${
                        (value / stats.totalValue) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function StatCard({
  title,
  value,
  subValue,
  icon,
  color,
  isCurrency = false,
}: any) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <div
        className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-500 uppercase">
        {title}
      </p>
      <h2 className="text-2xl font-black text-gray-900 mt-1">
        {isCurrency
          ? `Rp ${Number(value).toLocaleString("id-ID")}`
          : value}
      </h2>
      {subValue !== undefined && (
        <p className="text-xs text-gray-400 mt-1">
          Potensi: Rp{" "}
          {Number(subValue).toLocaleString("id-ID")}
        </p>
      )}
    </div>
  )
}
