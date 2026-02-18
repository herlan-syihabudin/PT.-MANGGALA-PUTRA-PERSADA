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

/* ================= MOCK LOAD ================= */
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

        const assignedEstimator =
          [...estimatorLoad].sort((a, b) => a.active - b.active)[0].name

        const riskLevel =
          daysOld > 14 ? "High" :
          winProbability < 50 ? "Medium" :
          "Low"

        let recommendation = "Monitor"
        if (riskLevel === "High")
          recommendation = "Escalate segera"
        else if (dealScore > 80)
          recommendation = "Prioritaskan closing"
        else if (winProbability < 50)
          recommendation = "Review strategy"

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

  const totalProjection = filtered.reduce(
    (sum, i) => sum + i.estimasi_nilai * (i.winProbability / 100),
    0
  )

  return (
    <div>
      <div className="bg-blue-600 text-white p-4 rounded-lg">
        Revenue Projection: {formatIDR(totalProjection)}
      </div>

      {/* table disini */}
    </div>
  )
}
