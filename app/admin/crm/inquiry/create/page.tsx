"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Customer = {
  customer_id: string
  company_name: string
}

type Employee = {
  employee_id: string
  nama_lengkap: string
}

const SERVICE_OPTIONS = [
  "Civil & Structure",
  "Steel Structure",
  "Mechanical",
  "Electrical",
  "Plumbing",
  "Interior",
  "Maintenance",
  "Design Only",
]

export default function CreateInquiryPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  const [estimasiDisplay, setEstimasiDisplay] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    nama_pekerjaan: "",
    estimasi_nilai: 0,
    sumber: "",
    assigned_to: "",
    prioritas: "normal",
    lokasi: "",
    catatan: "",
    tanggal_masuk: new Date().toISOString().slice(0, 10),
    estimasi_deal_date: "",
  })

  /* LOAD DATA */
  useEffect(() => {
    const loadData = async () => {
      const [custRes, empRes] = await Promise.all([
        fetch("/api/crm/customers", { cache: "no-store" }),
        fetch("/api/hr/employee", { cache: "no-store" }),
      ])

      setCustomers(custRes.ok ? await custRes.json() : [])
      setEmployees(empRes.ok ? await empRes.json() : [])
    }

    loadData()
  }, [])

  /* FORMAT RUPIAH */
  function handleEstimasiChange(value: string) {
    const raw = value.replace(/\D/g, "")
    setEstimasiDisplay(
      new Intl.NumberFormat("id-ID").format(Number(raw))
    )
    setForm(prev => ({
      ...prev,
      estimasi_nilai: Number(raw),
    }))
  }

  /* TOGGLE SERVICE */
  function toggleService(service: string) {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  /* SUBMIT */
  async function handleSubmit() {
    if (loading) return

    if (!form.customer_id || !form.nama_pekerjaan) {
      toast.error("Customer & Nama Pekerjaan wajib diisi")
      return
    }

    if (selectedServices.length === 0) {
      toast.error("Pilih minimal 1 jenis pekerjaan")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/crm/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimasi_nilai: Number(form.estimasi_nilai || 0),
          layanan: selectedServices.join("|"),
          status: "new",
        }),
      })

      if (!res.ok) throw new Error()

      toast.success("Inquiry berhasil dibuat")
      router.push("/admin/crm/inquiry")

    } catch {
      toast.error("Gagal menyimpan inquiry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Tambah Inquiry Baru
          </h1>
          <p className="text-gray-500">
            Input prospek proyek untuk tim estimasi.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="text-sm font-bold text-gray-400 hover:text-gray-600"
        >
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* INFORMASI PROYEK */}
          <div className="bg-white border rounded-3xl p-8 shadow-sm space-y-6">

            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xs font-black uppercase tracking-widest">
                Informasi Proyek
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* CUSTOMER */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Customer *
                </label>
                <select
                  className="w-full mt-2 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.customer_id}
                  onChange={(e) => {
                    const selected = customers.find(
                      c => c.customer_id === e.target.value
                    )
                    setForm({
                      ...form,
                      customer_id: e.target.value,
                      customer_name: selected?.company_name || ""
                    })
                  }}
                >
                  <option value="">-- Pilih Customer --</option>
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAMA PEKERJAAN */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Nama Pekerjaan *
                </label>
                <input
                  className="w-full mt-2 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Renovasi Kantor Pusat"
                  value={form.nama_pekerjaan}
                  onChange={(e) =>
                    setForm({ ...form, nama_pekerjaan: e.target.value })
                  }
                />
              </div>
            </div>

            {/* SERVICES */}
            <div className="pt-4 border-t">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Jenis Layanan *
              </label>

              <div className="flex flex-wrap gap-3 mt-3">
                {SERVICE_OPTIONS.map(service => {
                  const active = selectedServices.includes(service)
                  return (
                    <label
                      key={service}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition border ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleService(service)}
                        className="hidden"
                      />
                      {service}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CATATAN */}
          <div className="bg-white border rounded-3xl p-8 shadow-sm">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Catatan
            </label>
            <textarea
              className="w-full mt-3 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              rows={4}
              placeholder="Tambahkan detail lokasi atau instruksi..."
              value={form.catatan}
              onChange={(e) =>
                setForm({ ...form, catatan: e.target.value })
              }
            />
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* ESTIMASI CARD */}
          <div className="bg-[#0f172a] rounded-3xl p-8 text-white shadow-xl space-y-6">
            <div>
              <label className="text-xs text-blue-400 uppercase tracking-widest font-bold">
                Estimasi Nilai (IDR)
              </label>
              <input
                className="w-full mt-3 bg-white/10 rounded-xl px-4 py-4 text-xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
                value={estimasiDisplay}
                onChange={(e) =>
                  handleEstimasiChange(e.target.value)
                }
                placeholder="0"
              />
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="text-xs text-blue-400 uppercase tracking-widest font-bold">
                Assigned Estimator
              </label>
              <select
                className="w-full mt-3 bg-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.assigned_to}
                onChange={(e) =>
                  setForm({ ...form, assigned_to: e.target.value })
                }
              >
                <option value="" className="text-black">
                  -- Pilih Staff --
                </option>
                {employees.map((emp) => (
                  <option
                    key={emp.employee_id}
                    value={emp.employee_id}
                    className="text-black"
                  >
                    {emp.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTION */}
          <div className="bg-blue-50 border rounded-3xl p-8 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              Status Inquiry
            </p>

            <div className="flex items-center gap-3 text-blue-900">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-black">NEW PROSPECT</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : "SIMPAN INQUIRY"}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
