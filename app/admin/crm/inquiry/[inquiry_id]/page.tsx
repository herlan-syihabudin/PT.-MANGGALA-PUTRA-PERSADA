"use client"

import { useEffect, useState } from "react"
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
  converted_project_id?: string
}

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()

  const inquiry_id =
    typeof params.inquiry_id === "string"
      ? params.inquiry_id
      : params.inquiry_id?.[0] || ""

  const [data, setData] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  /* ================= LOAD DATA FROM API ================= */

  useEffect(() => {
    if (!inquiry_id) return

    const load = async () => {
      try {
        setLoading(true)

        const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error()

        const json = await res.json()
        setData(json)
      } catch {
        toast.error("Gagal load detail inquiry")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [inquiry_id])

  /* ================= CONVERT TO RAB ================= */

  const convertToRAB = async () => {
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

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        Loading detail inquiry...
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

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2"
          >
            <ArrowLeft size={14} /> BACK
          </button>

          <h1 className="text-3xl font-bold">
            Detail Inquiry
          </h1>
        </div>

        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full">
          {data.inquiry_id}
        </span>
      </div>

      {/* CUSTOMER CARD */}
      <Card title="Customer Information">
        <Info label="Customer ID" value={data.customer_id} />
        <Info label="Customer Name" value={data.customer_name} />
        <Info label="Lokasi Project" value={data.lokasi} />
      </Card>

      {/* PROJECT CARD */}
      <Card title="Project Information">
        <Info label="Nama Pekerjaan" value={data.nama_pekerjaan} />
        <Info label="Jenis Layanan" value={data.layanan} />
        <Info label="Sumber Lead" value={data.sumber} />
        <Info label="Prioritas" value={data.prioritas} />
        <Info label="Assigned To" value={data.assigned_to} />
        <Info label="Status" value={data.status} />
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

      {/* NOTES */}
      {data.catatan && (
        <Card title="Catatan">
          <p className="text-gray-600 whitespace-pre-wrap">
            {data.catatan}
          </p>
        </Card>
      )}

      {/* CONVERT SECTION */}
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
            onClick={convertToRAB}
            disabled={data.status !== "estimating" || isUpdating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-40"
          >
            {isUpdating ? "Processing..." : "Convert ke RAB"}
          </button>
        )}
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

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
      <p className="font-medium text-gray-800">
        {value || "-"}
      </p>
    </div>
  )
}
