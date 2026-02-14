"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Project = {
  project_id: string
  project_name: string
}

export default function CreateRABProjectPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= LOAD ACTIVE PROJECT ================= */

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        // Filter active project di frontend (lebih aman)
        const active = data.filter(
          (p: any) => p.status?.toLowerCase() === "active"
        )
        setProjects(active)
      })
      .catch(() => setProjects([]))
  }, [])

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!projectId) {
      alert("Pilih project dulu")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/estimator/rab/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          created_by: "Estimator",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "Gagal membuat RAB")
        setLoading(false)
        return
      }

      // ✅ Redirect pakai rab_id (ini yang benar)
      router.push(`/admin/estimator/rab/${data.rab_id}`)

    } catch (err) {
      alert("Terjadi kesalahan sistem")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">
          Buat RAB Project
        </h1>
        <p className="text-sm text-gray-500">
          Membuat RAB resmi oleh Estimator
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-lg p-4 space-y-4">

        <div>
          <label className="text-xs text-gray-500">
            Project
          </label>

          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">-- Pilih Project Active --</option>

            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        {/* ACTION */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-xs rounded"
          >
            {loading ? "Menyimpan..." : "Buat RAB"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border text-xs rounded"
          >
            Batal
          </button>
        </div>

      </div>

    </div>
  )
}
