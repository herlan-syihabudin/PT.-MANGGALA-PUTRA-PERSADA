"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: number
  tanggal_masuk: string
  prioritas?: string
}

/* ================= MOCK ESTIMATOR LOAD ================= */
// nanti bisa ambil dari API real workload
const estimatorLoad = [
  { name: "Budi", active: 3 },
  { name: "Andi", active: 5 },
  { name: "Rizky", active: 2 },
]

export default function ToEstimateClient({ data }: { data: Inquiry[] }) {
  const [search, setSearch] = useState("")
  const [priority, setPriority] = useState("all")

  const filtered = useMemo(() => {
    return data
      .filter(i => {
        const matchSearch =
          i.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          i.nama_pekerjaan?.toLowerCase().includes(search.toLowerCase())

        const matchPriority =
          priority === "all" ||
          i.prioritas?.toLowerCase() === priority

        return matchSearch && matchPriority
      })
      .map(i => {
        const daysOld = Math.floor(
          (Date.now() - new Date(i.tanggal_masuk).getTime()) /
          (1000 * 3600 * 24)
        )

        const dealScore = Math.round(
          (i.estimasi_nilai > 500000000 ? 40 :
           i.estimasi_nilai > 100000000 ? 30 : 15) +
          (daysOld < 7 ? 30 :
           daysOld < 14 ? 20 : 10) +
          (i.prioritas === "high" ? 30 :
           i.prioritas === "medium" ? 20 : 10)
        )

        const winProbability =
          dealScore > 80 ? 80 :
          dealScore > 60 ? 60 :
          40

        /* 🔥 AUTO ASSIGN (load paling kecil) */
        const assignedEstimator =
          estimatorLoad.sort((a, b) => a.active - b.active)[0].name

        /* 🔥 RISK LOGIC */
        const riskLevel =
          daysOld > 14 ? "High" :
          winProbability < 50 ? "Medium" :
          "Low"

        /* 🔥 AI RECOMMENDATION */
        let recommendation = "Monitor"
        if (riskLevel === "High")
          recommendation = "Escalate segera atau follow up urgent"
        else if (dealScore > 80)
          recommendation = "Prioritaskan closing"
        else if (winProbability < 50)
          recommendation = "Review strategy pricing"

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
      .sort((a, b) => b.dealScore - a.dealScore)
  }, [data, search, priority])

  /* 🔥 TOTAL PROJECTION */
  const totalProjection = filtered.reduce(
    (sum, i) => sum + i.estimasi_nilai * (i.winProbability / 100),
    0
  )

  const getValueClass = (value: number) => {
    if (value > 500000000) return "text-green-600 font-bold"
    if (value > 100000000) return "text-blue-600 font-semibold"
    return "text-gray-600"
  }

  const getRiskColor = (risk: string) => {
    if (risk === "High") return "bg-red-100 text-red-700"
    if (risk === "Medium") return "bg-yellow-100 text-yellow-700"
    return "bg-green-100 text-green-700"
  }

  return (
    <div className="space-y-6">

      {/* 🔥 HEADER SUMMARY */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Revenue Projection</p>
            <p className="text-2xl font-bold">
              {formatIDR(totalProjection)}
            </p>
          </div>
          <div className="text-right text-sm">
            <p>Total Inquiry: {filtered.length}</p>
            <p>High Risk: {filtered.filter(i => i.riskLevel === "High").length}</p>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Cari client atau proyek..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm flex-1"
        />

        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">Semua Prioritas</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-right">Estimasi</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4 text-center">Risk</th>
              <th className="p-4 text-center">AI Assign</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map(i => (
              <tr key={i.inquiry_id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="font-semibold">{i.customer_name}</div>
                  <div className="text-xs text-gray-500">
                    {i.nama_pekerjaan}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    💡 {i.recommendation}
                  </div>
                </td>

                <td className={`p-4 text-right ${getValueClass(i.estimasi_nilai)}`}>
                  {formatIDR(i.estimasi_nilai)}
                </td>

                <td className="p-4 text-center">
                  <span className="px-2 py-1 text-xs bg-gray-100 rounded-full font-semibold">
                    {i.dealScore}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getRiskColor(i.riskLevel)}`}>
                    {i.riskLevel}
                  </span>
                </td>

                <td className="p-4 text-center text-xs font-semibold text-purple-600">
                  {i.assignedEstimator}
                </td>

                <td className="p-4 text-center">
                  <Link
                    href={`/admin/estimator/rab/create?from=${i.inquiry_id}`}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition"
                  >
                    Buat RAB
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
