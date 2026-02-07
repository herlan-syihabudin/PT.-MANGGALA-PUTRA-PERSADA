"use client"

import { useEffect, useState } from "react"

type Project = {
  project_id: string
  project_name: string
  status: string
  progress: {
    mep: number
    civil: number
    steel: number
    interior: number
    overall: number
  }
}

export default function ScheduleProgressPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/projects/progress", { cache: "no-store" })
      .then((res) => res.json())
      .then(setProjects)
  }, [])

  const updateProgress = async (p: Project) => {
    setSaving(p.project_id)

    await fetch(`/api/projects/progress/${p.project_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mep: p.progress.mep,
        civil: p.progress.civil,
        steel: p.progress.steel,
        interior: p.progress.interior,
      }),
    })

    setSaving(null)
  }

  const setValue = (
    pid: string,
    key: "mep" | "civil" | "steel" | "interior",
    value: number
  ) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.project_id === pid
          ? {
              ...p,
              progress: { ...p.progress, [key]: value },
            }
          : p
      )
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Schedule & Progress</h1>

      {projects.map((p) => (
        <div
          key={p.project_id}
          className="bg-white border rounded p-5 space-y-4"
        >
          <div className="font-semibold">
            {p.project_name}
          </div>

          {(["mep", "civil", "steel", "interior"] as const).map(
            (k) => (
              <ProgressSlider
                key={k}
                label={k.toUpperCase()}
                value={p.progress[k]}
                onChange={(v) =>
                  setValue(p.project_id, k, v)
                }
              />
            )
          )}

          <button
            onClick={() => updateProgress(p)}
            disabled={saving === p.project_id}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {saving === p.project_id
              ? "Menyimpan..."
              : "Simpan Progress"}
          </button>
        </div>
      ))}
    </div>
  )
}

/* ==============================
   SLIDER COMPONENT
================================ */
function ProgressSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full"
      />
    </div>
  )
}
