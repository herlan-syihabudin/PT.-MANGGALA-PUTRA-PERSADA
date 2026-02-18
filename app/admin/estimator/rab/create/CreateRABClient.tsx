"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai?: number
}

export default function CreateRABProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromInquiry = searchParams.get('from')
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiryId, setInquiryId] = useState(fromInquiry || "")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/estimator/inquiry/pending", {
          cache: "no-store",
        })
        const data = await res.json()
        setInquiries(Array.isArray(data) ? data : [])
      } catch {
        setInquiries([])
      } finally {
        setFetching(false)
      }
    }

    load()
  }, [])

  const selectedInquiry = inquiries.find(i => i.inquiry_id === inquiryId)
  
  const filteredInquiries = inquiries.filter(i => 
    i.nama_pekerjaan.toLowerCase().includes(search.toLowerCase()) ||
    i.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit() {
    if (!inquiryId) return alert("Pilih inquiry dulu")

    setLoading(true)
    try {
      const res = await fetch("/api/estimator/rab/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          created_by: "Estimator",
        }),
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold">Buat RAB dari Inquiry</h1>
          <p className="text-sm text-gray-500">
            Pilih inquiry dengan status Estimating
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white border rounded-xl p-6 space-y-6">

        {fetching ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-400 mt-2">Memuat inquiry...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Tidak ada inquiry estimating tersedia</p>
            <button
              onClick={() => router.push("/admin/estimator/to-estimate")}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Lihat halaman To Estimate
            </button>
          </div>
        ) : (
          <>
            {/* SEARCH */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Cari Inquiry
              </label>
              <input
                type="text"
                placeholder="Ketik nama pekerjaan atau customer..."
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* SELECT INQUIRY */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Pilih Inquiry ({filteredInquiries.length} tersedia)
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={inquiryId}
                onChange={(e) => setInquiryId(e.target.value)}
                size={4}
              >
                <option value="">-- Pilih Inquiry --</option>
                {filteredInquiries.map((i) => (
                  <option key={i.inquiry_id} value={i.inquiry_id}>
                    {i.nama_pekerjaan} – {i.customer_name}
                  </option>
                ))}
              </select>
            </div>

            {/* SELECTED INQUIRY DETAIL */}
            {selectedInquiry && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <p className="text-xs text-blue-700 font-semibold">INQUIRY TERPILIH</p>
                <p className="font-medium">{selectedInquiry.nama_pekerjaan}</p>
                <p className="text-sm text-gray-600">{selectedInquiry.customer_name}</p>
                {selectedInquiry.estimasi_nilai && (
                  <p className="text-sm font-bold text-blue-600">
                    Estimasi: Rp {selectedInquiry.estimasi_nilai.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={loading || !inquiryId}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Menyimpan..." : "Buat RAB"}
              </button>

              <button
                onClick={() => router.back()}
                className="px-6 py-2 border text-sm rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
