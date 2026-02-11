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

  /* HANDLE CHECKBOX */
  function toggleService(service: string) {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  /* SUBMIT */
  async function handleSubmit() {
    if (!form.customer_id || !form.nama_pekerjaan) {
      toast.error("Customer & Nama Pekerjaan wajib diisi")
      return
    }

    if (selectedServices.length === 0) {
      toast.error("Pilih minimal 1 jenis pekerjaan")
      return
    }

    setLoading(true)

    const res = await fetch("/api/crm/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        layanan: selectedServices.join("|"),
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

      <h1 className="text-2xl font-bold">Tambah Inquiry</h1>

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

        {/* JENIS PEKERJAAN */}
        <div>
          <label className="text-xs text-gray-500">
            Jenis Pekerjaan *
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {SERVICE_OPTIONS.map(service => (
              <label
                key={service}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        {/* ESTIMASI NILAI */}
        <div>
          <label className="text-xs text-gray-500">
            Estimasi Nilai (Rp)
          </label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={estimasiDisplay}
            onChange={(e) =>
              handleEstimasiChange(e.target.value)
            }
          />
        </div>

        {/* ASSIGNED */}
        <div>
          <label className="text-xs text-gray-500">
            Assigned To
          </label>
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg"
        >
          {loading ? "Menyimpan..." : "Simpan Inquiry"}
        </button>

      </div>
    </div>
  )
}
