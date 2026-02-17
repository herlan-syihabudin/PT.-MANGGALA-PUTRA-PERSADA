"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  User,
  FileText,
  DollarSign,
  ArrowRight,
  Clock,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

const STEPS = ["new", "survey", "estimating", "sent"]

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()

  const inquiry_id =
    typeof params.inquiry_id === "string"
      ? params.inquiry_id
      : params.inquiry_id?.[0]

  const [data, setData] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!inquiry_id) return

    const load = async () => {
      try {
        const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json)
      } catch {
        setError(true)
      }
    }

    load()
  }, [inquiry_id])

  /* ================= SAFE DERIVED STATE ================= */

  const statusLower = data?.status?.toLowerCase() || "new"

  const currentStepIndex =
    STEPS.indexOf(statusLower) >= 0
      ? STEPS.indexOf(statusLower)
      : 0

  const services = data?.layanan?.split("|") || []

  const pipelineAge = useMemo(() => {
    if (!data?.tanggal_masuk) return 0
    const start = new Date(data.tanggal_masuk).getTime()
    return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
  }, [data?.tanggal_masuk])

  const conversionProbability = {
    new: 20,
    survey: 40,
    estimating: 65,
    sent: 80,
    won: 100,
    lost: 0,
  }[statusLower] ?? 10

  const estimasiValue = Number(data?.estimasi_nilai || 0)

  const valueWeight =
    estimasiValue > 500_000_000
      ? 90
      : estimasiValue > 100_000_000
      ? 50
      : 20

  const finalScore = Math.round(
    conversionProbability * 0.6 + valueWeight * 0.4
  )

  const themeColor = useMemo(() => {
    if (statusLower === "lost") return "red"
    if (conversionProbability > 70) return "green"
    if (conversionProbability > 30) return "blue"
    return "slate"
  }, [conversionProbability, statusLower])

  const expectedRevenue = Math.round(
    estimasiValue * (conversionProbability / 100)
  )

  const heatLevel =
    pipelineAge > 10
      ? "high"
      : pipelineAge > 5
      ? "medium"
      : "normal"

  const surveyTooLong =
    statusLower === "survey" && pipelineAge > 5

  /* ================= CONVERT ================= */

  const convertToRAB = async () => {
    if (!inquiry_id) return

    try {
      setIsUpdating(true)

      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id }),
      })

      const result = await res.json()
      if (!res.ok) throw new Error()

      toast.success("Berhasil convert ke RAB")
      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch {
      toast.error("Gagal convert ke RAB")
    } finally {
      setIsUpdating(false)
    }
  }

  /* ================= EARLY RETURN ================= */

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500 font-semibold">
        Data tidak ditemukan / gagal load
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 animate-pulse">
        Loading inquiry data...
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2"
          >
            <ArrowLeft size={14} /> BACK
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight">
            Inquiry Intelligence Panel
          </h1>
          <p className="text-gray-500 text-sm">
            CRM Performance Monitoring
          </p>
        </div>

        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
          {inquiry_id}
        </span>
      </div>

      {/* STEP PROGRESS */}
      <div className="bg-white border rounded-3xl p-10 relative">
        <div className="flex justify-between relative">
          {STEPS.map((step, index) => {
            const active = index <= currentStepIndex
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <motion.div
                  animate={{ scale: active ? 1 : 0.9 }}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold
                  ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {index + 1}
                </motion.div>
                <span className="text-xs mt-3 uppercase tracking-wide text-gray-500">
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        <motion.div
          animate={{
            width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
          }}
          className="absolute bottom-0 left-0 h-1 bg-blue-600 rounded-full"
        />
      </div>

      {/* KPI GRID */}
      <div className="grid lg:grid-cols-4 gap-6">

        <KPI
          icon={<TrendingUp size={18} />}
          label="Win Probability"
          value={`${conversionProbability}%`}
        />

        <KPI
          icon={<Clock size={18} />}
          label="Pipeline Age"
          value={`${pipelineAge} Hari`}
          heat={heatLevel}
        />

        <KPI
          icon={<Activity size={18} />}
          label="Efficiency Index"
          value={pipelineAge < 7 ? "High" : "Needs Review"}
        />

        <KPI
          icon={<DollarSign size={18} />}
          label="Potential Revenue"
          value={`Rp ${expectedRevenue.toLocaleString("id-ID")}`}
        />
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPI({ icon, label, value, heat }: any) {
  const heatColor =
    heat === "high"
      ? "border-red-300 bg-red-50"
      : heat === "medium"
      ? "border-yellow-300 bg-yellow-50"
      : "border-gray-200 bg-white"

  return (
    <div className={`border rounded-2xl p-6 flex items-center gap-4 ${heatColor}`}>
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold text-lg text-gray-900">{value}</p>
      </div>
    </div>
  )
}
