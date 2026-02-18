"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface InquiryDetail {
  inquiry_id: string
  tanggal_masuk: string
  customer_id: string
  customer_name: string
  nama_pekerjaan: string
  layanan: string
  estimasi_nilai: number | null
  sumber: string
  assigned_to: string
  status: string
  prioritas: string
  lokasi: string
  catatan: string
  converted_rab_id?: string
}

const STEPS = ["new", "survey", "estimating", "sent", "won"]

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()

  const inquiry_id =
    typeof params.inquiry_id === "string"
      ? params.inquiry_id
      : params.inquiry_id?.[0] || ""

  const [data, setData] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

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
        toast.error("Gagal load detail")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [inquiry_id])

  /* ================= DERIVED ================= */

  const pipelineAge = useMemo(() => {
    if (!data?.tanggal_masuk) return 0
    const date = new Date(data.tanggal_masuk)
    if (isNaN(date.getTime())) return 0
    return Math.floor((Date.now() - date.getTime()) / 86400000)
  }, [data?.tanggal_masuk])

  const currentStep = STEPS.indexOf(data?.status || "new")

  const statusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700"
      case "survey":
        return "bg-yellow-100 text-yellow-700"
      case "estimating":
        return "bg-purple-100 text-purple-700"
      case "sent":
        return "bg-indigo-100 text-indigo-700"
      case "won":
        return "bg-green-100 text-green-700"
      case "lost":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  /* ================= QUICK EDIT STATUS ================= */

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true)

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error()

      setData(prev => prev ? { ...prev, status: newStatus } : prev)
      toast.success("Status diperbarui")
    } catch {
      toast.error("Gagal update status")
    } finally {
      setUpdating(false)
    }
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        Loading inquiry...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-96 flex items-center justify-center text-red-500">
        Data tidak ditemukan
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2"
          >
            <ArrowLeft size={14} /> BACK
          </button>

          <h1 className="text-3xl font-bold">Inquiry Detail</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(data.status)}`}>
            {data.status.toUpperCase()}
          </span>

          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
            {data.inquiry_id}
          </span>
        </div>
      </div>

      {/* 🔥 AGING WARNING */}
      {pipelineAge > 7 && data.status !== "won" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          ⚠ Inquiry sudah {pipelineAge} hari di pipeline. Perlu follow up.
        </div>
      )}

      {/* 🔥 TIMELINE */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold
                ${i <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {i + 1}
              </div>
              <p className="text-xs mt-2 capitalize">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK EDIT STATUS */}
      <div className="bg-white border rounded-xl p-6">
        <p className="text-sm font-medium mb-4">Update Status</p>
        <div className="flex gap-3 flex-wrap">
          {STEPS.map(step => (
            <button
              key={step}
              disabled={updating}
              onClick={() => updateStatus(step)}
              className="px-4 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMER CARD */}
      <Card title="Customer Information">
        <Info label="Customer Name" value={data.customer_name} />
        <Info label="Lokasi" value={data.lokasi} />
      </Card>

      {/* PROJECT */}
      <Card title="Project">
        <Info label="Nama Pekerjaan" value={data.nama_pekerjaan} />
        <Info label="Layanan" value={data.layanan} />
        <Info label="Assigned To" value={data.assigned_to} />
      </Card>

      {/* FINANCIAL */}
      <Card title="Financial">
        <p className="text-2xl font-bold text-blue-600">
          {data.estimasi_nilai
            ? new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(data.estimasi_nilai)
            : "-"}
        </p>
      </Card>

      {/* CONVERT */}
      <div className="bg-white border rounded-xl p-6 text-center">
        {data.converted_rab_id ? (
          <button
            onClick={() =>
              router.push(`/admin/estimator/rab/${data.converted_rab_id}`)
            }
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold"
          >
            <CheckCircle className="inline mr-2" size={18} />
            View RAB
          </button>
        ) : (
          <button
            disabled={data.status !== "estimating"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-40"
          >
            Convert ke RAB
          </button>
        )}
      </div>
    </div>
  )
}

function Card({ title, children }: any) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-lg">{title}</h2>
      {children}
    </div>
  )
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  )
}
