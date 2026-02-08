"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type ScopeProgress = {
  project_id: string
  mep: number
  civil: number
  steel: number
  interior: number
}

export default function ProjectProgressPage({
  params,
}: {
  params: { project_id: string }
}) {
  const router = useRouter()
  const { project_id } = params

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ScopeProgress>({
    project_id,
    mep: 0,
    civil: 0,
    steel: 0,
    interior: 0,
  })

  /* ================= FETCH EXISTING PROGRESS ================= */
  useEffect(() => {
    fetch(`/api/projects/${project_id}/progress`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data) setForm(data)
      })
      .finally(() => setLoading(false))
  }, [project_id])

  const update = (key: keyof ScopeProgress, value: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, value)),
    }))
  }

  const save = async () => {
    setSaving(true)
    await fetch(`/api/projects/${project_id}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    router.push(`/admin/projects/${project_id}`)
  }

  if (loading) return <div className="p-6 text-sm">Loading...</div>

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-lg font-semibold">Update Progress</h1>

      {["mep", "civil", "steel", "interior"].map((k) => (
        <div key={k} className="space-y-1">
          <label className="text-xs uppercase text-gray-500">
            {k}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={form[k as keyof ScopeProgress] as number}
              onChange={(e) =>
                update(k as keyof ScopeProgress, Number(e.target.value))
              }
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={form[k as keyof ScopeProgress] as number}
              onChange={(e) =>
                update(k as keyof ScopeProgress, Number(e.target.value))
              }
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <span className="text-xs">%</span>
          </div>
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded text-sm"
        >
          Batal
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : "Simpan Progress"}
        </button>
      </div>
    </div>
  )
}
