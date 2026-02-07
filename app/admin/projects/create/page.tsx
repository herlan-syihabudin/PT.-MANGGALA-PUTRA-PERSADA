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
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="project_name"
          placeholder="Nama Project"
          value={form.project_name}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />

        <input
          name="client"
          placeholder="Client / Owner"
          value={form.client}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />

        <input
          name="lokasi"
          placeholder="Lokasi Project"
          value={form.lokasi}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />

        <input
          type="number"
          name="nilai_kontrak"
          placeholder="Nilai Kontrak (Rp)"
          value={form.nilai_kontrak}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            required
          />
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded"
        >
          {loading ? "Menyimpan..." : "Simpan Project"}
        </button>
      </form>
    </div>
  )
}
