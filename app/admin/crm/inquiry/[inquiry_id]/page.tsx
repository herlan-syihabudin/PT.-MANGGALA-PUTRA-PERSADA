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

  /* ================= DERIVED DATA ================= */

const currentStepIndex =
  STEPS.indexOf(data.status?.toLowerCase()) >= 0
    ? STEPS.indexOf(data.status?.toLowerCase())
    : 0

const services = data.layanan ? data.layanan.split("|") : []

// Pipeline Age
const pipelineAge = useMemo(() => {
  if (!data.tanggal_masuk) return 0
  const start = new Date(data.tanggal_masuk).getTime()
  const now = Date.now()
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
}, [data.tanggal_masuk])

// ================= CONVERSION PROBABILITY =================
const conversionProbability = {
  new: 20,
  survey: 40,
  estimating: 65,
  sent: 80,
  won: 100,
  lost: 0,
}[data.status] ?? 10

// ================= VALUE WEIGHT =================
const estimasiValue = Number(data.estimasi_nilai || 0)

const valueWeight =
  estimasiValue > 500_000_000
    ? 90
    : estimasiValue > 100_000_000
    ? 50
    : 20

// ================= FINAL SCORE =================
const finalScore = Math.round(
  conversionProbability * 0.6 + valueWeight * 0.4
)

  // ================= THEME COLOR =================
const themeColor = useMemo(() => {
  if (data.status === "lost") return "red"
  if (conversionProbability > 70) return "green"
  if (conversionProbability > 30) return "blue"
  return "slate"
}, [conversionProbability, data.status])

// ================= EXPECTED REVENUE =================
const expectedRevenue = Math.round(
  estimasiValue * (conversionProbability / 100)
)
  
// ================= HEAT LEVEL =================
const heatLevel =
  pipelineAge > 10
    ? "high"
    : pipelineAge > 5
    ? "medium"
    : "normal"

// ================= SURVEY TOO LONG =================
const surveyTooLong =
  data.status === "survey" && pipelineAge > 5
  
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

      <div className="grid lg:grid-cols-4 gap-6">

  {/* WIN PROBABILITY */}
  <KPI 
    icon={<TrendingUp size={18} />} 
    label="Win Probability" 
    value={
      <div className="w-full">
        <p
          className={
            themeColor === "green"
              ? "text-green-600 font-bold"
              : themeColor === "red"
              ? "text-red-600 font-bold"
              : "text-blue-600 font-bold"
          }
        >
          {conversionProbability}%
        </p>

        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${conversionProbability}%` }}
            transition={{ duration: 0.6 }}
            className={
              themeColor === "green"
                ? "h-full bg-green-500"
                : themeColor === "red"
                ? "h-full bg-red-500"
                : "h-full bg-blue-500"
            }
          />
        </div>
      </div>
    } 
  />

  {/* PIPELINE AGE */}
  <KPI 
    icon={<Clock size={18} />} 
    label="Pipeline Age" 
    value={`${pipelineAge} Hari`} 
    heat={heatLevel}
  />

  {/* EFFICIENCY INDEX */}
  <KPI 
    icon={<Activity size={18} />} 
    label="Efficiency Index" 
    value={
      pipelineAge < 7
        ? <span className="text-green-600 font-semibold">High</span>
        : <span className="text-yellow-600 font-semibold">Needs Review</span>
    } 
  />

  {/* POTENTIAL REVENUE */}
  <KPI 
    icon={<DollarSign size={18} />} 
    label="Potential Revenue" 
    value={`Rp ${expectedRevenue.toLocaleString("id-ID")}`} 
  />

</div>

      {/* AUTO REMINDER */}
      {surveyTooLong && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-center gap-4">
          <AlertTriangle className="text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">
              Survey terlalu lama
            </p>
            <p className="text-sm text-yellow-700">
              Inquiry sudah {pipelineAge} hari di pipeline.
              Segera follow up customer.
            </p>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-10 space-y-8">

          <Info icon={<User size={18} />} label="Customer" value={data.customer_name} />

          <Info icon={<FileText size={18} />} label="Nama Pekerjaan" value={data.nama_pekerjaan} />

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3">
              Layanan
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* TIMELINE MOCK */}
          <div className="pt-8 border-t">
            <p className="text-xs font-semibold text-gray-400 mb-4">
              Activity Timeline
            </p>

            <div className="space-y-4 text-sm">
              <TimelineItem text="Inquiry dibuat" />
              <TimelineItem text="Survey dijadwalkan" />
              <TimelineItem text="Masuk ke tahap estimating" />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white border rounded-3xl p-8">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Estimasi Nilai
            </p>
            <h2 className="text-3xl font-extrabold text-blue-600">
              Rp {Number(data.estimasi_nilai || 0).toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            {data.converted_rab_id ? (
              <button
                onClick={() =>
                  router.push(`/admin/estimator/rab/${data.converted_rab_id}`)
                }
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                View RAB Project
              </button>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={data.status !== "estimating" || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isUpdating ? "Processing..." : "Convert ke RAB"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>

        </div>
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

function Info({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-blue-600">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function TimelineItem({ text }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-blue-600 rounded-full" />
      <span>{text}</span>
    </div>
  )
}
