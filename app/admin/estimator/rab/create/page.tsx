"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
}

export default function CreateRABProjectPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiryId, setInquiryId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/crm/inquiry?status=estimating", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setInquiries(Array.isArray(data) ? data : []))
      .catch(() => setInquiries([]))
  }, [])

  async function handleSubmit() {
    if (!inquiryId) return alert("Pilih inquiry dulu")

    setLoading(true)
    try {
      const res = await fetch("/api/estimator/rab/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id: inquiryId, created_by: "Estimator" }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data?.message || "Gagal membuat RAB")
        return
      }

      router.push(`/admin/estimator/rab/${data.rab_id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Buat RAB dari Inquiry</h1>
        <p className="text-sm text-gray-500">
          Inquiry yang sudah masuk tahap Estimating
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500">Inquiry</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={inquiryId}
            onChange={(e) => setInquiryId(e.target.value)}
          >
            <option value="">-- Pilih Inquiry Estimating --</option>
            {inquiries.map((i) => (
              <option key={i.inquiry_id} value={i.inquiry_id}>
                {i.nama_pekerjaan} – {i.customer_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-xs rounded"
          >
            {loading ? "Menyimpan..." : "Buat RAB"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border text-xs rounded"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
