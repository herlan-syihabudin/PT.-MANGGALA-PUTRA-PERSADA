"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Search, Building2, FileText, DollarSign, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

type Inquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
  estimasi_nilai?: number
}

export default function CreateRABProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromInquiry = searchParams.get('inquiry_id')
  
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
        
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`)
        }
        
        const data = await res.json()
        setInquiries(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error loading inquiries:", error)
        toast.error("Gagal memuat daftar inquiry")
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
    if (!inquiryId) {
      toast.error("Pilih inquiry terlebih dahulu")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiry_id: inquiryId,
          created_by: "Estimator",
        }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = { message: "Terjadi kesalahan server" }
      }

      if (!res.ok) {
        toast.error(data?.message || "Gagal membuat RAB")
        return
      }

      toast.success("RAB berhasil dibuat")
      router.push(`/admin/estimator/rab/${data.rab_id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating RAB:", error)
      toast.error("Gagal membuat RAB")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <FileText size={24} className="text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
                Buat RAB dari Inquiry
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Pilih inquiry dengan status Estimating untuk dibuat RAB
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">

          {fetching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-800 mx-auto" />
              <p className="text-sm text-slate-400 mt-4">Memuat daftar inquiry...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Tidak Ada Inquiry Pending</p>
              <p className="text-sm text-slate-400 mt-1">
                Semua inquiry sudah diproses atau tidak ada yang berstatus Estimating
              </p>
              <button
                onClick={() => router.push("/admin/estimator/to-estimate")}
                className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                Lihat halaman To Estimate
                <ArrowLeft size={14} className="rotate-180" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Cari Inquiry
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Ketik nama pekerjaan atau customer..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Inquiry List */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Pilih Inquiry ({filteredInquiries.length} tersedia)
                </label>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredInquiries.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">
                      Tidak ada inquiry yang cocok
                    </div>
                  ) : (
                    filteredInquiries.map((i) => (
                      <div
                        key={i.inquiry_id}
                        onClick={() => setInquiryId(i.inquiry_id)}
                        className={`p-3 cursor-pointer border-b last:border-b-0 transition ${
                          inquiryId === i.inquiry_id
                            ? 'bg-slate-100'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Building2 size={16} className="text-slate-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-slate-800">
                              {i.nama_pekerjaan}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {i.customer_name}
                            </div>
                          </div>
                          {i.estimasi_nilai && (
                            <div className="text-xs font-medium text-emerald-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(i.estimasi_nilai)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Inquiry Detail */}
              {selectedInquiry && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                      INQUIRY TERPILIH
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800">
                      {selectedInquiry.nama_pekerjaan}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedInquiry.customer_name}
                    </p>
                    {selectedInquiry.estimasi_nilai && (
                      <p className="text-sm font-semibold text-emerald-600">
                        Estimasi: {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(selectedInquiry.estimasi_nilai)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !inquiryId}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Buat RAB
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.back()}
                  disabled={loading}
                  className="px-6 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
