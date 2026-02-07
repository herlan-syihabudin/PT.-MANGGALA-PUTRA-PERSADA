"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/* ==============================
   TYPE
================================ */
type Customer = {
  customer_id: string
  company_name: string
  city?: string
  province?: string
}

function generateProjectCode() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(100 + Math.random() * 900)
  return `PRJ-${y}${m}${d}-${rand}`
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])

  const [projectCode] = useState(generateProjectCode())

  const [form, setForm] = useState({
    project_name: "",
    customer_id: "",
    lokasi: "",
    nilai_kontrak: "",
    start_date: "",
    end_date: "",
    status: "planning",
  })

  /* ==============================
     LOAD CUSTOMER MASTER
  ================================ */
  useEffect(() => {
    fetch("/api/customers", { cache: "no-store" })
      .then((res) => res.json())
      .then(setCustomers)
      .catch(console.error)
  }, [])

  /* ==============================
     HANDLER
  ================================ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const customer_id = e.target.value
    const selected = customers.find(
      (c) => c.customer_id === customer_id
    )

    setForm({
      ...form,
      customer_id,
      lokasi: selected
        ? `${selected.city ?? ""}${selected.city && selected.province ? ", " : ""}${selected.province ?? ""}`
        : "",
    })
  }

  /* ==============================
     SUBMIT
  ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_code: projectCode,
        project_name: form.project_name,
        customer_id: form.customer_id,
        lokasi: form.lokasi,
        nilai_kontrak: Number(form.nilai_kontrak),
        start_date: form.start_date,
        end_date: form.end_date,
        status: form.status,
      }),
    })

    setLoading(false)

    if (res.ok) {
      router.push("/admin/projects")
    } else {
      alert("Gagal menyimpan project")
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Project</h1>
        <div className="text-sm text-gray-600 mt-1">
          Project Code:{" "}
          <span className="font-mono font-semibold text-gray-900">
            {projectCode}
          </span>
        </div>
      </div>

      {/* ===== FORM ===== */}
      <div className="bg-white border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* PROJECT NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Project
            </label>
            <input
              name="project_name"
              value={form.project_name}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>

          {/* CUSTOMER */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Customer / Owner
            </label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleCustomerChange}
              className="w-full border rounded px-4 py-2"
              required
            >
              <option value="">Pilih Customer</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* LOKASI (AUTO) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Lokasi Project
            </label>
            <input
              value={form.lokasi}
              readOnly
              className="w-full border rounded px-4 py-2 bg-gray-50"
            />
          </div>

          {/* NILAI */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Nilai Kontrak (Rp)
            </label>
            <input
              type="number"
              name="nilai_kontrak"
              value={form.nilai_kontrak}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>

          {/* DATE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                className="w-full border rounded px-4 py-2"
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Status Project
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2"
            >
              <option value="planning">Planning</option>
              <option value="running">Running</option>
              <option value="finish">Finish</option>
            </select>
          </div>

          {/* SUBMIT */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded"
            >
              {loading ? "Menyimpan..." : "Simpan Project"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
