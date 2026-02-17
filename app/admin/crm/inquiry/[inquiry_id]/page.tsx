"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  User,
  FileText,
  DollarSign,
  ArrowRight,
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

  const currentStepIndex =
    STEPS.indexOf(data.status?.toLowerCase()) ?? 0

  const services = data.layanan ? data.layanan.split("|") : []

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
            Inquiry Overview
          </h1>
          <p className="text-gray-500 text-sm">
            Real-time monitoring pipeline
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
                  initial={{ scale: 0.8 }}
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
          initial={{ width: 0 }}
          animate={{
            width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
          }}
          className="absolute bottom-0 left-0 h-1 bg-blue-600 rounded-full"
        />
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* LEFT PANEL */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-10 space-y-8">

          <Info
            icon={<User size={18} />}
            label="Customer"
            value={data.customer_name}
          />

          <Info
            icon={<FileText size={18} />}
            label="Nama Pekerjaan"
            value={data.nama_pekerjaan}
          />

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-3">
              Layanan
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 rounded-lg text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL */}
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

/* ================= INFO ================= */
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
