"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle,
  User,
  FileText,
  DollarSign,
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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!inquiry_id) {
      setError(true)
      return
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Failed to fetch")

        const json = await res.json()

        setData({
          status: json.status ?? "new",
          tanggal_masuk: json.tanggal_masuk ?? "",
          layanan: json.layanan ?? null,
          customer_name: json.customer_name ?? "",
          nama_pekerjaan: json.nama_pekerjaan ?? "",
          estimasi_nilai: json.estimasi_nilai ?? 0,
          converted_rab_id: json.converted_rab_id,
          inquiry_id: json.inquiry_id || inquiry_id,
        })
      } catch (err) {
        console.error("Error:", err)
        setError(true)
        toast.error("Gagal memuat data")
      }
    }

    load()
  }, [inquiry_id])

  /* ================= CONVERT TO RAB ================= */
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

      if (!res.ok) throw new Error(result.message)

      toast.success("Berhasil convert ke RAB")
      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch (err) {
      console.error("Convert error:", err)
      toast.error("Gagal convert ke RAB")
    } finally {
      setIsUpdating(false)
    }
  }

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
          <h2 className="text-lg font-bold text-red-700 mb-2">
            Error Loading Data
          </h2>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  /* ================= SAFE DATA ================= */
  const safeStatus = data.status || "new"
  const safeTanggalMasuk = data.tanggal_masuk || ""
  const safeCustomerName = data.customer_name || "-"
  const safeNamaPekerjaan = data.nama_pekerjaan || "-"
  const safeLayanan = data.layanan || ""

  const estimasiValue = useMemo(() => {
    const val = data.estimasi_nilai
    if (!val) return 0
    const num = typeof val === "string" ? parseFloat(val) : val
    return isNaN(num) ? 0 : num
  }, [data.estimasi_nilai])

  const pipelineAge = useMemo(() => {
    if (!safeTanggalMasuk) return 0
    const start = new Date(safeTanggalMasuk).getTime()
    if (isNaN(start)) return 0
    return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
  }, [safeTanggalMasuk])

  const conversionProbability = useMemo(() => {
    const map: Record<string, number> = {
      new: 20,
      survey: 40,
      estimating: 65,
      sent: 80,
      won: 100,
      lost: 0,
    }
    return map[safeStatus.toLowerCase()] ?? 10
  }, [safeStatus])

  const expectedRevenue = Math.round(
    estimasiValue * (conversionProbability / 100)
  )

  const services = useMemo(() => {
    if (!safeLayanan || typeof safeLayanan !== "string") return []
    return safeLayanan.split("|").filter(Boolean)
  }, [safeLayanan])

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2"
          >
            <ArrowLeft size={14} /> BACK
          </button>
          <h1 className="text-4xl font-extrabold">Inquiry Detail</h1>
        </div>
        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
          ID: {inquiry_id}
        </span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-6">
        <KPI icon={<TrendingUp size={18} />} label="Win Probability" value={`${conversionProbability}%`} />
        <KPI icon={<Clock size={18} />} label="Pipeline Age" value={`${pipelineAge} Hari`} />
        <KPI icon={<Activity size={18} />} label="Efficiency" value={pipelineAge < 7 ? "High" : "Review"} />
        <KPI icon={<DollarSign size={18} />} label="Potential Revenue" value={`Rp ${expectedRevenue.toLocaleString("id-ID")}`} />
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white border rounded-3xl p-10 space-y-8">
          <Info icon={<User size={18} />} label="Customer" value={safeCustomerName} />
          <Info icon={<FileText size={18} />} label="Pekerjaan" value={safeNamaPekerjaan} />

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3">Layanan</p>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? (
                services.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-xs">
                    {s}
                  </span>
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
              Rp {estimasiValue.toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            {data.converted_rab_id ? (
              <button
                onClick={() => router.push(`/admin/estimator/rab/${data.converted_rab_id}`)}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold"
              >
                <CheckCircle className="inline mr-2" size={18} />
                View RAB
              </button>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={safeStatus !== "estimating" || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-40"
              >
                {isUpdating ? "Processing..." : "Convert ke RAB"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPI({ icon, label, value }: any) {
  return (
    <div className="border rounded-2xl p-6">
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
