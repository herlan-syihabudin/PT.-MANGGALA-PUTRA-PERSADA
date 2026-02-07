"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    project_name: "",
    client: "",
    lokasi: "",
    nilai_kontrak: "",
    start_date: "",
    end_date: "",
    status: "planning",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    {/* ================= HEADER INFO ================= */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold">Create Project</h1>
      <p className="text-sm text-gray-600 mt-1">
        Form ini digunakan untuk membuat <b>Project Master</b> yang akan menjadi
        dasar seluruh proses ERP (Estimator, Engineering, Finance, dan Project Management).
      </p>
    </div>

    {/* ================= FORM CONTAINER ================= */}
    <div className="bg-white border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Nama Project */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nama Project
          </label>
          <input
            name="project_name"
            placeholder="Contoh: Pembangunan Gudang Cikarang"
            value={form.project_name}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Client / Owner
          </label>
          <input
            name="client"
            placeholder="Nama perusahaan atau pemilik project"
            value={form.client}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Lokasi Project
          </label>
          <input
            name="lokasi"
            placeholder="Contoh: Cikarang, Bekasi"
            value={form.lokasi}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
          />
        </div>

        {/* Nilai Kontrak */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nilai Kontrak (Rp)
          </label>
          <input
            type="number"
            name="nilai_kontrak"
            placeholder="Contoh: 2500000000"
            value={form.nilai_kontrak}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>

        {/* Tanggal */}
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

        {/* Status */}
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

        {/* ACTION */}
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
