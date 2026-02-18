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

interface InquiryData {
  status?: string
  tanggal_masuk?: string
  layanan?: string | null
  customer_name?: string
  nama_pekerjaan?: string
  estimasi_nilai?: string | number
  converted_rab_id?: string
  inquiry_id?: string
}

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

  useEffect(() => {
    if (!inquiry_id) {
      setError(true)
      return
    }

    const load = async () => {
      try {
        const baseUrl = window.location.origin
        const res = await fetch(`${baseUrl}/api/crm/inquiry/${inquiry_id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to fetch")
        
        const json = await res.json()
        console.log("API Response:", json) // LIHAT INI!
        
        setData({
          status: json.status ?? "new",
          tanggal_masuk: json.tanggal_masuk ?? "",
          layanan: json.layanan ?? null,
          customer_name: json.customer_name ?? "",
          nama_pekerjaan: json.nama_pekerjaan ?? "",
          estimasi_nilai: json.estimasi_nilai ?? 0,
          converted_rab_id: json.converted_rab_id,
          inquiry_id: json.inquiry_id || json.id || inquiry_id,
        })
      } catch (err) {
        console.error("Error:", err)
        setError(true)
        toast.error("Gagal memuat data")
      }
    }

    load()
  }, [inquiry_id])

  // Kalau error, tampilkan dengan lebih jelas
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <h2 className="text-lg font-bold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-red-600">Inquiry ID: {inquiry_id}</p>
          <p className="text-sm text-red-500 mt-2">Cek console browser (F12) untuk detail</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Safe getters - prevent any undefined errors
  const safeStatus = data.status || "new"
  const safeTanggalMasuk = data.tanggal_masuk || ""
  const safeLayanan = data.layanan || ""
  const safeCustomerName = data.customer_name || "-"
  const safeNamaPekerjaan = data.nama_pekerjaan || "-"
  
  // Safe number conversion
  const safeEstimasiValue = useMemo(() => {
    try {
      const val = data.estimasi_nilai
      if (!val) return 0
      const num = typeof val === "string" ? parseFloat(val) : val
      return isNaN(num) ? 0 : num
    } catch {
      return 0
    }
  }, [data.estimasi_nilai])

  // Safe pipeline age
  const safePipelineAge = useMemo(() => {
    try {
      if (!safeTanggalMasuk) return 0
      const start = new Date(safeTanggalMasuk).getTime()
      if (isNaN(start)) return 0
      return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
    } catch {
      return 0
    }
  }, [safeTanggalMasuk])

  // Safe conversion probability
  const safeConversionProbability = useMemo(() => {
    const status = safeStatus.toLowerCase()
    const probs: Record<string, number> = {
      new: 20, survey: 40, estimating: 65, sent: 80, won: 100, lost: 0
    }
    return probs[status] ?? 10
  }, [safeStatus])

  // Safe expected revenue
  const safeExpectedRevenue = useMemo(() => {
    return Math.round(safeEstimasiValue * (safeConversionProbability / 100))
  }, [safeEstimasiValue, safeConversionProbability])

  // Safe services array
  const services = useMemo(() => {
    if (!safeLayanan || typeof safeLayanan !== "string") return []
    return safeLayanan.split("|").filter(Boolean)
  }, [safeLayanan])

  const currentStepIndex = useMemo(() => {
    const index = ["new", "survey", "estimating", "sent"].indexOf(safeStatus.toLowerCase())
    return index >= 0 ? index : 0
  }, [safeStatus])

  const heatLevel = useMemo(() => {
    if (safePipelineAge > 10) return "high"
    if (safePipelineAge > 5) return "medium"
    return "normal"
  }, [safePipelineAge])

  const surveyTooLong = useMemo(() => {
    return safeStatus.toLowerCase() === "survey" && safePipelineAge > 5
  }, [safeStatus, safePipelineAge])

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2">
            <ArrowLeft size={14} /> BACK
          </button>
          <h1 className="text-4xl font-extrabold">Inquiry Detail</h1>
        </div>
        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">ID: {inquiry_id}</span>
      </div>

      {/* PROGRESS STEPS */}
      <div className="bg-white border rounded-3xl p-10">
        <div className="flex justify-between">
          {["new", "survey", "estimating", "sent"].map((step, index) => {
            const active = index <= currentStepIndex
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold
                  ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-3 uppercase">{step}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6">
        <KPI icon={<TrendingUp size={18} />} label="Win Probability" value={`${safeConversionProbability}%`} />
        <KPI icon={<Clock size={18} />} label="Pipeline Age" value={`${safePipelineAge} Hari`} heat={heatLevel} />
        <KPI icon={<Activity size={18} />} label="Efficiency" value={safePipelineAge < 7 ? "High" : "Review"} />
        <KPI icon={<DollarSign size={18} />} label="Potential Revenue" value={`Rp ${safeExpectedRevenue.toLocaleString("id-ID")}`} />
      </div>

      {/* SURVEY REMINDER */}
      {surveyTooLong && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-center gap-4">
          <AlertTriangle className="text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Survey terlalu lama ({safePipelineAge} hari)</p>
            <p className="text-sm text-yellow-700">Segera follow up customer.</p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white border rounded-3xl p-10 space-y-8">
          <Info icon={<User size={18} />} label="Customer" value={safeCustomerName} />
          <Info icon={<FileText size={18} />} label="Pekerjaan" value={safeNamaPekerjaan} />
          
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3">Layanan</p>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? (
                services.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-xs">{s}</span>
                ))
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-8">
            <p className="text-xs text-gray-400 mb-2">Estimasi Nilai</p>
            <h2 className="text-3xl font-extrabold text-blue-600">
              Rp {safeEstimasiValue.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            {data.converted_rab_id ? (
              <button onClick={() => router.push(`/admin/estimator/rab/${data.converted_rab_id}`)}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold">
                <CheckCircle className="inline mr-2" size={18} /> View RAB
              </button>
            ) : (
              <button onClick={convertToRAB} disabled={safeStatus !== "estimating" || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40">
                {isUpdating ? "Processing..." : "Convert ke RAB"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple components
function KPI({ icon, label, value, heat = "normal" }: any) {
  const colors = { high: "border-red-300 bg-red-50", medium: "border-yellow-300 bg-yellow-50", normal: "border-gray-200" }
  return (
    <div className={`border rounded-2xl p-6 ${colors[heat]}`}>
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="font-bold text-lg text-gray-900">{value}</p>
        </div>
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
        <p className="font-semibold text-gray-900">{value || "-"}</p>
      </div>
    </div>
  )
}
