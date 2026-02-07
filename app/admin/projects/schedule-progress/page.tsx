"use client"

import { useEffect, useState } from "react"

type ScopeProgress = {
  mep: number
  civil: number
  steel: number
  interior: number
  overall: number
}

type ProjectProgress = {
  project_id: string
  project_name: string
  start_date: string
  end_date: string
  status: string
  updated_at: string | null
  progress: ScopeProgress
}

/* ==============================
   HELPER: HITUNG STUCK
   Stuck = updated_at >= 7 hari & progress < 100 & status != finish
================================ */
function isStuck(p: ProjectProgress): boolean {
  if (!p.updated_at) return false
  if (p.status === "finish") return false
  if (p.progress.overall >= 100) return false

  const last = new Date(p.updated_at).getTime()
  if (Number.isNaN(last)) return false

  const now = Date.now()
  const diffDays = (now - last) / (1000 * 60 * 60 * 24)

  return diffDays >= 7
}

export default function ScheduleProgressPage() {
  const [data, setData] = useState<ProjectProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/projects/progress", {
          cache: "no-store",
        })

        if (!res.ok) {
          const text = await res.text()
          console.error("API ERROR:", text)
          setError("Gagal mengambil data progress")
          setData([])
          return
        }

        const json = await res.json()

        if (!Array.isArray(json)) {
          console.error("INVALID RESPONSE:", json)
          setData([])
          return
        }

        setData(json)
      } catch (err) {
        console.error("FETCH ERROR:", err)
        setError("Terjadi kesalahan server")
        setData([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleChange = (
    projectId: string,
    key: "mep" | "civil" | "steel" | "interior",
    value: number
  ) => {
    setData((prev) =>
      prev.map((p) =>
        p.project_id === projectId
          ? {
              ...p,
              progress: {
                ...p.progress,
                [key]: value,
                // overall auto dihitung ulang
                overall: Math.round(
                  key === "mep"
                    ? (value +
                        p.progress.civil +
                        p.progress.steel +
                        p.progress.interior) /
                        4
                    : key === "civil"
                    ? (p.progress.mep +
                        value +
                        p.progress.steel +
                        p.progress.interior) /
                        4
                    : key === "steel"
                    ? (p.progress.mep +
                        p.progress.civil +
                        value +
                        p.progress.interior) /
                        4
                    : (p.progress.mep +
                        p.progress.civil +
                        p.progress.steel +
                        value) /
                        4
                ),
              },
            }
          : p
      )
    )
  }

  const saveProgress = async (p: ProjectProgress) => {
    try {
      setSavingId(p.project_id)

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
    } catch (err) {
      console.error("SAVE PROGRESS ERROR:", err)
      alert("Gagal menyimpan progress")
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return (
      <div className="p-6 text-red-600 font-medium">
        {error}
      </div>
    )
  }

  // ================= KPI SUMMARY =================
  const totalProject = data.length
  const avgOverall =
    totalProject > 0
      ? Math.round(
          data.reduce(
            (sum, p) => sum + (p.progress?.overall ?? 0),
            0
          ) / totalProject
        )
      : 0

  const stuckCount = data.filter(isStuck).length

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Schedule &amp; Progress
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Project" value={totalProject} />
        <KPICard
          title="Rata-rata Progress"
          value={`${avgOverall}%`}
        />
        <KPICard
          title="Project Stuck (≥7 hari)"
          value={stuckCount}
          highlight={stuckCount > 0}
        />
      </div>

      {data.length === 0 ? (
        <div className="text-gray-500">
          Belum ada data progress
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((p) => {
            const stuck = isStuck(p)

            return (
              <div
                key={p.project_id}
                className="bg-white border rounded p-5 space-y-4"
              >
                {/* HEADER PROJECT */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {p.project_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.start_date} &rarr; {p.end_date || "-"}
                    </p>
                    {p.updated_at && (
                      <p className="text-xs text-gray-400">
                        Last update:{" "}
                        {p.updated_at.slice(0, 10)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                      Status: {p.status || "-"}
                    </span>
                    {stuck && (
                      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                        Stuck
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      Total {p.progress.overall}%
                    </span>
                  </div>
                </div>

                {/* SLIDERS */}
                <div className="grid md:grid-cols-2 gap-4">
                  <ProgressSlider
                    label="MEP"
                    value={p.progress.mep}
                    onChange={(v) =>
                      handleChange(
                        p.project_id,
                        "mep",
                        v
                      )
                    }
                  />
                  <ProgressSlider
                    label="Civil"
                    value={p.progress.civil}
                    onChange={(v) =>
                      handleChange(
                        p.project_id,
                        "civil",
                        v
                      )
                    }
                  />
                  <ProgressSlider
                    label="Steel"
                    value={p.progress.steel}
                    onChange={(v) =>
                      handleChange(
                        p.project_id,
                        "steel",
                        v
                      )
                    }
                  />
                  <ProgressSlider
                    label="Interior"
                    value={p.progress.interior}
                    onChange={(v) =>
                      handleChange(
                        p.project_id,
                        "interior",
                        v
                      )
                    }
                  />
                </div>

                <button
                  onClick={() => saveProgress(p)}
                  disabled={savingId === p.project_id}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
                >
                  {savingId === p.project_id
                    ? "Menyimpan..."
                    : "Simpan Progress"}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ==============================
   SMALL COMPONENTS
================================ */

function KPICard({
  title,
  value,
  highlight,
}: {
  title: string
  value: number | string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded border bg-white p-4 ${
        highlight ? "border-red-400" : "border-gray-200"
      }`}
    >
      <p className="text-xs text-gray-500 mb-1">
        {title}
      </p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}

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
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
