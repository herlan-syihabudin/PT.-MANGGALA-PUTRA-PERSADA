"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
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

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!inquiry_id) return

    const load = async () => {
      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        cache: "no-store",
      })

      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    }

    load()
  }, [inquiry_id])

  /* ================= UPDATE ================= */
  const updateInquiry = async (updates: any) => {
    if (!inquiry_id) return

    try {
      setIsUpdating(true)

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error()

      setData((prev: any) => ({
        ...prev,
        ...updates,
      }))

      toast.success("Status berhasil diperbarui")
    } catch {
      toast.error("Gagal memperbarui data")
    } finally {
      setIsUpdating(false)
    }
  }

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

  /* ================= LOADING ================= */
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 font-medium animate-pulse">
        Loading inquiry data...
      </div>
    )
  }

  /* ================= DERIVED ================= */
  const currentStepIndex = STEPS.indexOf(
    data.status?.toLowerCase?.() || "new"
  )
  const safeIndex = currentStepIndex < 0 ? 0 : currentStepIndex
  const services = data.layanan ? data.layanan.split("|") : []

  const getButtonText = (text: string) =>
    isUpdating ? "Processing..." : text

  /* ================= UI ================= */
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2"
          >
            <ArrowLeft size={14} /> KEMBALI KE LIST
          </button>

          <h1 className="text-4xl font-extrabold">
            Detail Inquiry
          </h1>
          <p className="text-gray-500 text-sm">
            Monitoring peluang proyek secara real-time
          </p>
        </div>

        <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">
          ID: {inquiry_id}
        </span>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-10 space-y-6">
          <Info label="Customer" value={data.customer_name} />
          <Info label="Nama Pekerjaan" value={data.nama_pekerjaan} />

          <div className="pt-6 border-t">
            <p className="text-xs font-bold text-gray-400 mb-2">
              Jenis Layanan
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 rounded-lg text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-8">
            <p className="text-xs text-gray-400">
              Estimasi Nilai (IDR)
            </p>
            <h2 className="text-3xl font-bold text-blue-600">
              Rp {Number(data.estimasi_nilai || 0).toLocaleString("id-ID")}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-6">
            {data.converted_rab_id ? (
              <div className="text-green-600 text-sm font-semibold text-center">
                ✔ Sudah dikonversi ke RAB Project
              </div>
            ) : (
              <button
                onClick={convertToRAB}
                disabled={data.status !== "estimating" || isUpdating}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-40"
              >
                {getButtonText("Convert ke RAB")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= INFO COMPONENT ================= */
function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="font-semibold">{value}</div>
    </div>
  )
}
