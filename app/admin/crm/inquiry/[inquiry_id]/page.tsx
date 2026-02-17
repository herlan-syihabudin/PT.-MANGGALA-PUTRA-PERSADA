"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"

const STEPS = ["new", "survey", "estimating", "sent"]

export default function InquiryDetailPage() {
  const params = useParams()
  const inquiry_id =
    typeof params.inquiry_id === "string" ? params.inquiry_id : params.inquiry_id?.[0]

  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      if (!inquiry_id) return
      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, { cache: "no-store" })
      if (res.ok) setData(await res.json())
    }
    load()
  }, [inquiry_id])

  /* ================= UPDATE FUNCTION ================= */
  const updateInquiry = async (updates: any) => {
    try {
      if (!inquiry_id) return
      setIsUpdating(true)

      const res = await fetch(`/api/crm/inquiry/${inquiry_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error()

      toast.success("Status berhasil diperbarui")

      setData((prev: any) => ({
        ...prev,
        ...updates,
      }))
    } catch {
      toast.error("Gagal memperbarui data")
    } finally {
      setIsUpdating(false)
    }
  }

  /* ================= CONVERT TO RAB ================= */
  const convertToRAB = async () => {
    try {
      if (!inquiry_id) return
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

  if (!data)
    return (
      <div className="flex items-center justify-center h-96 text-gray-400 font-medium animate-pulse">
        Loading inquiry data...
      </div>
    )

  const currentStepIndex = STEPS.indexOf(data.status?.toLowerCase())
const safeIndex = currentStepIndex < 0 ? 0 : currentStepIndex
  const services = data.layanan ? data.layanan.split("|") : []

  /* ================= BUTTON HELPER ================= */
  const getButtonText = (text: string) => (isUpdating ? "Processing..." : text)

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-2 hover:gap-3 transition-all"
          >
            <ArrowLeft size={14} /> KEMBALI KE LIST
          </button>

          <h1 className="text-4xl font-extrabold tracking-tight">Detail Inquiry</h1>
          <p className="text-gray-500 text-sm">Monitoring peluang proyek secara real-time</p>
        </div>

        <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500">
          ID: {inquiry_id}
        </span>
      </div>

      {/* STEPPER */}
      <div className="bg-white border rounded-[2rem] p-10 shadow-soft relative">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-blue-600 -translate-y-1/2 z-0 transition-all duration-700"
          style={{
            width: `${(safeIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex
            const isCurrent = index === currentStepIndex

            return (
              <div key={step} className="flex flex-col items-center w-full">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full border-4 transition-all duration-500
                    ${isCompleted ? "bg-blue-600 border-white text-white" : ""}
                    ${isCurrent ? "bg-white border-blue-600 text-blue-600 scale-110 shadow-md" : ""}
                    ${index > currentStepIndex ? "bg-white border-gray-200 text-gray-400" : ""}
                  `}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>

                <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${isCurrent ? "text-blue-600" : "text-gray-400"}`}>
                  {step}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 bg-white border rounded-[2rem] p-10 shadow-soft space-y-10">
          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <Info label="Customer" value={data.customer_name} />
            <Info
              label="Status"
              value={
                <span
                  className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase
                    ${data.status === "won" ? "bg-green-100 text-green-700" : data.status === "lost" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}
                  `}
                >
                  {data.status}
                </span>
              }
            />
            <Info label="Nama Pekerjaan" value={data.nama_pekerjaan} />
            <Info
              label="Tanggal Masuk"
              value={
                data.tanggal_masuk
                  ? new Date(data.tanggal_masuk).toLocaleDateString("id-ID", { dateStyle: "long" })
                  : "-"
              }
            />
          </div>

          {/* SERVICES */}
          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Jenis Layanan</p>
            <div className="flex flex-wrap gap-2">
              {services.map((service: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* QUICK STATUS ACTION */}
          {data.status !== "won" && data.status !== "lost" && (
            <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-4">
              <div className="w-full mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Update Progress Proyek</p>
              </div>

              {data.status === "new" && (
                <button
                  disabled={isUpdating}
                  onClick={() => updateInquiry({ status: "survey" })}
                  className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  {getButtonText("Mulai Survey Lapangan")}
                </button>
              )}

              {data.status === "survey" && (
                <button
                  disabled={isUpdating}
                  onClick={() => updateInquiry({ status: "estimating" })}
                  className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  {getButtonText("Kirim ke Estimator")}
                </button>
              )}

              <button
                disabled={isUpdating}
          
                className="px-6 py-3 bg-green-600 text-white rounded-2xl text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {getButtonText("Project WON / Deal")}
              </button>

              <button
                disabled={isUpdating}
                onClick={() => updateInquiry({ status: "lost" })}
                className="px-6 py-3 bg-white text-red-400 border border-red-100 rounded-2xl text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {getButtonText("Gagal / Lost")}
              </button>
            </div>
          )}

          {data.status === "won" && (
            <div className="pt-8 border-t border-gray-100">
              <div className="bg-green-50 border border-green-100 p-6 rounded-[1.5rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <Check size={24} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">Project Secured!</h4>
                  <p className="text-sm text-green-700">Inquiry ini berhasil dimenangkan dan siap lanjut ke tahap RAB.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* ESTIMASI CARD */}
          <div className="bg-white border rounded-[2rem] p-10 shadow-soft">
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
    Estimasi Nilai (IDR)
  </p>

  <h2 className="text-4xl font-black mt-3 text-blue-600 tracking-tight">
    Rp {Number(data.estimasi_nilai || 0).toLocaleString("id-ID")}
  </h2>

  <p className="text-xs text-gray-400 mt-2">
    Perkiraan nilai proyek saat ini
  </p>
</div>

          {/* ACTION CARD */}
          <div className="bg-white border rounded-[2rem] p-8 shadow-soft space-y-4">
            <button
              onClick={convertToRAB}
              disabled={data.status !== "estimating" || isUpdating}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30 disabled:grayscale"
            >
              {isUpdating ? "Processing..." : "Convert ke RAB"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  )
}
