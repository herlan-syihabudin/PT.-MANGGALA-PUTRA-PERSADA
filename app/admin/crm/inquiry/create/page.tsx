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

export default function CreateInquiryPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)

  const [estimasiDisplay, setEstimasiDisplay] = useState("")

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

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    fetch("/api/customer").then(r => r.json()).then(setCustomers)
    fetch("/api/hr/employee").then(r => r.json()).then(setEmployees)
  }, [])

  /* ===== FORMAT RUPIAH ===== */
  function formatRupiah(value: string) {
    const number = value.replace(/\D/g, "")
    const formatted = new Intl.NumberFormat("id-ID").format(Number(number))
    return formatted
  }

  function handleEstimasiChange(value: string) {
    const raw = value.replace(/\D/g, "")
    setEstimasiDisplay(formatRupiah(value))
    setForm({ ...form, estimasi_nilai: Number(raw) })
  }

  /* ===== SUBMIT ===== */
  async function handleSubmit() {
    if (!form.customer_id || !form.nama_pekerjaan) {
      toast.error("Customer & Nama Pekerjaan wajib diisi")
      return
    }

    setLoading(true)

    const res = await fetch("/api/marketing/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        status: "new",
      }),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error("Gagal menyimpan inquiry")
      return
    }

    toast.success("Inquiry berhasil dibuat")

    setTimeout(() => {
      router.push("/admin/crm/inquiry")
    }, 800)
  }

  return (
    <div className="max-w-4xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Tambah Inquiry</h1>
        <p className="text-sm text-gray-500">
          Entry lead baru untuk proses estimasi & proposal
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-5">

        {/* CUSTOMER */}
        <div>
          <label className="text-xs text-gray-500">Customer *</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.customer_id}
            onChange={(e) => {
              const selected = customers.find(
                (c) => c.customer_id === e.target.value
              )
              setForm({
                ...form,
                customer_id: e.target.value,
                customer_name: selected?.company_name || "",
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
          <label className="text-xs text-gray-500">Nama Pekerjaan *</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.nama_pekerjaan}
            onChange={(e) =>
              setForm({ ...form, nama_pekerjaan: e.target.value })
            }
          />
        </div>

        {/* ESTIMASI NILAI */}
        <div>
          <label className="text-xs text-gray-500">Estimasi Nilai (Rp)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={estimasiDisplay}
            onChange={(e) => handleEstimasiChange(e.target.value)}
            placeholder="100.000.000"
          />
        </div>

        {/* TANGGAL MASUK */}
        <div>
          <label className="text-xs text-gray-500">Tanggal Masuk</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.tanggal_masuk}
            onChange={(e) =>
              setForm({ ...form, tanggal_masuk: e.target.value })
            }
          />
        </div>

        {/* ESTIMASI DEAL */}
        <div>
          <label className="text-xs text-gray-500">Estimasi Deal Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.estimasi_deal_date}
            onChange={(e) =>
              setForm({ ...form, estimasi_deal_date: e.target.value })
            }
          />
        </div>

        {/* ASSIGNED */}
        <div>
          <label className="text-xs text-gray-500">Assigned To</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={form.assigned_to}
            onChange={(e) =>
              setForm({ ...form, assigned_to: e.target.value })
            }
          >
            <option value="">-- Pilih Sales / Estimator --</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.nama_lengkap}>
                {emp.nama_lengkap}
              </option>
            ))}
          </select>
        </div>

        {/* CATATAN */}
        <div>
          <label className="text-xs text-gray-500">Catatan</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            value={form.catatan}
            onChange={(e) =>
              setForm({ ...form, catatan: e.target.value })
            }
          />
        </div>

        {/* ACTION */}
        <div className="flex gap-3 pt-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg"
          >
            {loading ? "Menyimpan..." : "Simpan Inquiry"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-5 py-2 border text-sm rounded-lg"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  )
}
