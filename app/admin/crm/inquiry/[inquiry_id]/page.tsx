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

// Definisikan tipe data
interface InquiryData {
  status: string
  tanggal_masuk: string
  layanan: string | null
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai: string | number
  converted_rab_id?: string
  inquiry_id?: string
}

interface KPIProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  heat?: "high" | "medium" | "normal"
}

interface InfoProps {
  icon: React.ReactNode
  label: string
  value: string | number | null | undefined
}

interface TimelineItemProps {
  text: string
}

const STEPS = ["new", "survey", "estimating", "sent"]

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()

  const inquiry_id =
    typeof params.inquiry_id === "string"
      ? params.inquiry_id
      : params.inquiry_id?.[0] || ""

  const [data, setData] = useState<InquiryData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(false)

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!inquiry_id) {
      setError(true)
      return
    }

    const load = async () => {
      try {
        const baseUrl = window.location.origin

        const res = await fetch(
          `${baseUrl}/api/crm/inquiry/${inquiry_id}`,
          {
            cache: "no-store",
          }
        )

        if (!res.ok) throw new Error("Failed to fetch")
        
        const json = await res.json()
        console.log("API Response:", json) // Untuk debugging
        
        setData({
          status: json.status ?? "new",
          tanggal_masuk: json.tanggal_masuk ?? "",
          layanan: json.layanan ?? null,
          customer_name: json.customer_name ?? "",
          nama_pekerjaan: json.nama_pekerjaan ?? "",
          estimasi_nilai: json.estimasi_nilai ?? 0,
          converted_rab_id: json.converted_rab_id,
          inquiry_id: json.inquiry_id, // ✅ FIX: ganti dari id ke inquiry_id
        })
      } catch (err) {
        console.error("Error loading inquiry:", err)
        setError(true)
        toast.error("Gagal memuat data inquiry")
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
      if (!res.ok) throw new Error(result.message || "Conversion failed")

      toast.success("Berhasil convert ke RAB")
      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch (err) {
      console.error("Conversion error:", err)
      toast.error("Gagal convert ke RAB")
    } finally {
      setIsUpdating(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-semibold">
            Data tidak ditemukan / gagal load
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400 animate-pulse">
            Loading inquiry data...
          </p>
        </div>
      </div>
    )
  }

  /* ================= DERIVED DATA ================= */
  const currentStepIndex = useMemo(() => {
    const index = STEPS.indexOf(data.status?.toLowerCase())
    return index >= 0 ? index : 0
  }, [data.status])

  const services = useMemo(() => {
    if (!data.layanan) return []
    if (typeof data.layanan !== "string") return []
    return data.layanan.split("|").filter(Boolean)
  }, [data.layanan])

  // Pipeline Age dengan validasi
  const pipelineAge = useMemo(() => {
    if (!data.tanggal_masuk) return 0
    
    try {
      const start = new Date(data.tanggal_masuk).getTime()
      if (isNaN(start)) return 0
      
      const now = Date.now()
      return Math.floor((now - start) / (1000 * 60 * 60 * 24))
    } catch {
      return 0
    }
  }, [data.tanggal_masuk])

  // Conversion Probability dengan validasi
  const conversionProbability = useMemo(() => {
    const status = data.status?.toLowerCase()
    
    const probabilities: Record<string, number> = {
      new: 20,
      survey: 40,
      estimating: 65,
      sent: 80,
      won: 100,
      lost: 0,
    }
    
    return probabilities[status] ?? 10
  }, [data.status])

  // Estimasi Value dengan validasi
  const estimasiValue = useMemo(() => {
    const value = data.estimasi_nilai
    if (!value) return 0
    
    const numValue = typeof value === "string" ? parseFloat(value) : value
    return isNaN(numValue) ? 0 : numValue
  }, [data.estimasi_nilai])

  // Value Weight
  const valueWeight = useMemo(() => {
    if (estimasiValue > 500_000_000) return 90
    if (estimasiValue > 100_000_000) return 50
    return 20
  }, [estimasiValue])

  // Theme Color
  const themeColor = useMemo(() => {
    if (data.status?.toLowerCase() === "lost") return "red"
    if (conversionProbability > 70) return "green"
    if (conversionProbability > 30) return "blue"
    return "slate"
  }, [conversionProbability, data.status])

  // Expected Revenue
  const expectedRevenue = useMemo(() => {
    return Math.round(estimasiValue * (conversionProbability / 100))
  }, [estimasiValue, conversionProbability])

  // Heat Level
  const heatLevel = useMemo<"high" | "medium" | "normal">(() => {
    if (pipelineAge > 10) return "high"
    if (pipelineAge > 5) return "medium"
    return "normal"
  }, [pipelineAge])

  // Survey Too Long
  const surveyTooLong = useMemo(() => {
    return data.status?.toLowerCase() === "survey" && pipelineAge > 5
  }, [data.status, pipelineAge])

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={14} /> BACK
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Inquiry Intelligence Panel
          </h1>
          <p className="text-gray-500 text-sm">
            CRM Performance Monitoring
          </p>
        </div>

        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-mono">
          ID: {inquiry_id}
        </span>
      </div>

      {/* STEP PROGRESS */}
      <div className="bg-white border rounded-3xl p-6 sm:p-10 relative">
        <div className="flex justify-between relative">
          {STEPS.map((step, index) => {
            const active = index <= currentStepIndex
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <motion.div
                  animate={{ scale: active ? 1 : 0.9 }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-xs font-bold
                    ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {index + 1}
                </motion.div>

                <span className="text-[10px] sm:text-xs mt-3 uppercase tracking-wide text-gray-500">
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
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 h-1 bg-blue-600 rounded-full"
        />
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

        <KPI
          icon={<Clock size={18} />}
          label="Pipeline Age"
          value={`${pipelineAge} Hari`}
          heat={heatLevel}
        />

        <KPI
          icon={<Activity size={18} />}
          label="Efficiency Index"
          value={
            pipelineAge < 7 ? (
              <span className="text-green-600 font-semibold">High</span>
            ) : (
              <span className="text-yellow-600 font-semibold">Needs Review</span>
            )
          }
        />

        <KPI
          icon={<DollarSign size={18} />}
          label="Potential Revenue"
          value={`Rp ${expectedRevenue.toLocaleString("id-ID")}`}
        />
      </div>

      {/* AUTO REMINDER */}
      {surveyTooLong && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6 flex items-start sm:items-center gap-4"
        >
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1 sm:mt-0" />
          <div>
            <p className="font-semibold text-yellow-800">
              Survey terlalu lama
            </p>
            <p className="text-sm text-yellow-700">
              Inquiry sudah {pipelineAge} hari di pipeline. Segera follow up customer.
            </p>
          </div>
        </motion.div>
      )}

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-6 sm:p-10 space-y-8">
          <Info icon={<User size={18} />} label="Customer" value={data.customer_name} />

          <Info icon={<FileText size={18} />} label="Nama Pekerjaan" value={data.nama_pekerjaan} />

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3">
              Layanan
            </p>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? (
                services.map((s: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-100 rounded-lg text-xs"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada layanan</span>
              )}
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

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6 sm:p-8">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Estimasi Nilai
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 break-all">
              Rp {estimasiValue.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            {data.converted_rab_id ? (
              <button
                onClick={() =>
                  router.push(`/admin/estimator/rab/${data.converted_rab_id}`)
                }
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={18} />
                View RAB Project
              </button>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={data.status?.toLowerCase() !== "estimating" || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Convert ke RAB
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
            
            {data.status?.toLowerCase() !== "estimating" && !data.converted_rab_id && (
              <p className="text-xs text-gray-400 text-center mt-3">
                Status harus &quot;estimating&quot; untuk convert ke RAB
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */
function KPI({ icon, label, value, heat = "normal" }: KPIProps) {
  const heatColor = {
    high: "border-red-300 bg-red-50",
    medium: "border-yellow-300 bg-yellow-50",
    normal: "border-gray-200 bg-white",
  }[heat]

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 flex items-center gap-4 ${heatColor}`}>
      <div className="text-blue-600 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <div className="font-bold text-lg text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function Info({ icon, label, value }: InfoProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-blue-600 flex-shrink-0 mt-1">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <div className="font-semibold text-gray-900 break-words">
          {value || "-"}
        </div>
      </div>
    </div>
  )
}

function TimelineItem({ text }: TimelineItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
      <span className="text-gray-700">{text}</span>
    </div>
  )
}
