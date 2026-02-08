"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ProjectTerminPage() {
  const router = useRouter()
  const params = useParams()
  const project_id = params.project_id as string

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    termin_no: "",
    description: "",
    percent: "",
    value: "",
    due_date: "",
  })

  function updateField(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(
      `/api/projects/${project_id}/termin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termin_no: Number(form.termin_no),
          description: form.description,
          percent: Number(form.percent),
          value: Number(form.value),
          due_date: form.due_date,
        }),
      }
    )

    setLoading(false)

    if (res.ok) {
      router.push(`/admin/projects/${project_id}`)
      router.refresh()
    } else {
      const err = await res.json()
      alert(err.message || "Gagal membuat termin")
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-lg font-semibold">Tambah Termin Kontrak</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="text-xs text-gray-500">Termin Ke</label>
          <input
            name="termin_no"
            type="number"
            required
            className="input"
            value={form.termin_no}
            onChange={updateField}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Deskripsi</label>
          <textarea
            name="description"
            className="input"
            placeholder="Termin Progress 30%"
            value={form.description}
            onChange={updateField}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Persentase (%)</label>
            <input
              name="percent"
              type="number"
              required
              className="input"
              value={form.percent}
              onChange={updateField}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Nilai (Rp)</label>
            <input
              name="value"
              type="number"
              required
              className="input"
              value={form.value}
              onChange={updateField}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500">Jatuh Tempo</label>
          <input
            name="due_date"
            type="date"
            className="input"
            value={form.due_date}
            onChange={updateField}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded"
          >
            {loading ? "Menyimpan..." : "Simpan Termin"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-sm rounded"
          >
            Batal
          </button>
        </div>

      </form>
    </div>
  )
}
