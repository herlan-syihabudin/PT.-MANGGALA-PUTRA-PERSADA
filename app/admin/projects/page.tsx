"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

/* ================= TYPES ================= */

type Project = {
  project_id: string
  project_name: string
  client: string
  lokasi: string
  nilai_kontrak: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  project_type?: "MEP" | "CIVIL" | "STEEL" | "INTERIOR"
  progress?: number
}

/* ================= PAGE ================= */

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string[]>([])

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [bulkStatus, setBulkStatus] = useState("")

  /* ========== FETCH PROJECTS ========== */
  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error)
  }, [])

  /* ========== FILTERED DATA ========== */
  const filteredProjects = projects.filter((p) => {
  const q = search.toLowerCase()

  const matchSearch =
    p.project_name.toLowerCase().includes(q) ||
    p.client.toLowerCase().includes(q)

  const matchStatus = filterStatus ? p.status === filterStatus : true
  const matchType = filterType ? p.project_type === filterType : true

  return matchSearch && matchStatus && matchType
})

  /* ========== KPI COUNT ========== */
  const countType = (type: string) =>
  filteredProjects.filter((p) => p.project_type === type).length

const sumByType = (type: string) =>
  filteredProjects
    .filter((p) => p.project_type === type)
    .reduce((acc, p) => acc + (p.nilai_kontrak || 0), 0)

  /* ========== CHECKBOX HANDLER ========== */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const handleTypeToggle = (type: string) => {
  setFilterType((prev) => (prev === type ? "" : type))
}
  
  const selectAll = () => {
    if (selected.length === filteredProjects.length) {
      setSelected([])
    } else {
      setSelected(filteredProjects.map((p) => p.project_id))
    }
  }

  /* ========== EXPORT CSV ========== */
  const exportCSV = () => {
    const rows = filteredProjects.filter((p) =>
      selected.includes(p.project_id)
    )

    if (rows.length === 0) {
      alert("Pilih minimal 1 project")
      return
    }

    const header = [
      "Project",
      "Customer",
      "Jenis",
      "Lokasi",
      "Nilai Kontrak",
      "Progress",
      "Mulai",
      "Selesai",
      "Status",
    ]

    const data = rows.map((p) => [
      p.project_name,
      p.client,
      p.project_type || "-",
      p.lokasi,
      p.nilai_kontrak,
      `${p.progress ?? 0}%`,
      p.start_date,
      p.end_date,
      p.status,
    ])

    const csv = [header, ...data].map((r) => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "project-list.csv"
    a.click()
  }

  const bulkUpdateStatus = async () => {
  if (!bulkStatus || selected.length === 0) return

  if (!confirm(`Update ${selected.length} project ke status "${bulkStatus}"?`)) {
    return
  }

  try {
    await fetch("/api/projects/bulk-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_ids: selected,
        status: bulkStatus,
      }),
    })

    // refresh data
    fetch("/api/projects", { cache: "no-store" })
      .then((res) => res.json())
      .then(setProjects)

    setSelected([])
    setBulkStatus("")
  } catch (err) {
    alert("Gagal update status")
  }
}
  
  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
  title="All"
  count={filteredProjects.length}
  total={filteredProjects.reduce((a, p) => a + p.nilai_kontrak, 0)}
  active={filterType === ""}
  onClick={() => setFilterType("")}
/>
        
  <KPICard
    title="MEP"
    count={countType("MEP")}
    total={sumByType("MEP")}
    active={filterType === "MEP"}
    onClick={() => handleTypeToggle("MEP")}
  />

  <KPICard
    title="Civil"
    count={countType("CIVIL")}
    total={sumByType("CIVIL")}
    active={filterType === "CIVIL"}
    onClick={() => handleTypeToggle("CIVIL")}
  />

  <KPICard
    title="Steel"
    count={countType("STEEL")}
    total={sumByType("STEEL")}
    active={filterType === "STEEL"}
    onClick={() => handleTypeToggle("STEEL")}
  />

  <KPICard
    title="Interior"
    count={countType("INTERIOR")}
    total={sumByType("INTERIOR")}
    active={filterType === "INTERIOR"}
    onClick={() => handleTypeToggle("INTERIOR")}
  />
</div>

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Project List</h1>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="border px-3 py-2 rounded text-sm"
          >
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="border px-3 py-2 rounded text-sm"
          >
            Print
          </button>

          <Link
            href="/admin/projects/create"
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            + Create Project
          </Link>
        </div>
      </div>

      {/* ================= BULK ACTION BAR ================= */}
{selected.length > 0 && (
  <div className="flex flex-wrap items-center justify-between bg-red-50 border border-red-200 rounded px-4 py-3 gap-3">
    <p className="text-sm text-red-700">
      {selected.length} project dipilih
    </p>

    <div className="flex gap-2 items-center">
      <select
        className="border rounded px-3 py-1 text-sm"
        value={bulkStatus}
        onChange={(e) => setBulkStatus(e.target.value)}
      >
        <option value="">Pilih Status</option>
        <option value="planning">Planning</option>
        <option value="running">Running</option>
        <option value="finish">Finish</option>
      </select>

      <button
        onClick={bulkUpdateStatus}
        disabled={!bulkStatus}
        className="bg-red-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
      >
        Update Status
      </button>

      <button
        onClick={exportCSV}
        className="border px-3 py-1 rounded text-sm bg-white"
      >
        Export CSV
      </button>
    </div>
  </div>
)}
      
      {/* ================= FILTER ================= */}
      <div className="flex flex-wrap gap-3">
        <input
          className="border rounded px-4 py-2 w-full md:w-64"
          placeholder="Cari project / customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Semua Jenis</option>
          <option value="MEP">MEP</option>
          <option value="CIVIL">Civil</option>
          <option value="STEEL">Steel</option>
          <option value="INTERIOR">Interior</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="planning">Planning</option>
          <option value="running">Running</option>
          <option value="finish">Finish</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={
                    filteredProjects.length > 0 &&
                    selected.length === filteredProjects.length
                  }
                />
              </th>
              <th className="p-3">No</th>
              <th className="p-3">Project</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Lokasi</th>
              <th className="p-3">Nilai</th>
              <th className="p-3">Progress</th>
              <th className="p-3">Mulai</th>
              <th className="p-3">Selesai</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={11} className="p-4 text-center text-gray-500">
                  Belum ada project
                </td>
              </tr>
            )}

            {filteredProjects.map((p, i) => (
              <tr key={p.project_id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.project_id)}
                    onChange={() => toggleSelect(p.project_id)}
                  />
                </td>

                <td className="p-3">{i + 1}</td>

                <td className="p-3 font-medium text-red-600 hover:underline">
                  <Link href={`/admin/projects/${p.project_id}`}>
                    {p.project_name}
                  </Link>
                </td>

                <td className="p-3">{p.client}</td>
                <td className="p-3">{p.project_type || "-"}</td>
                <td className="p-3">{p.lokasi || "-"}</td>

                <td className="p-3">
                  Rp {p.nilai_kontrak.toLocaleString("id-ID")}
                </td>

                <td className="p-3">
                  <ProgressBar value={p.progress ?? 0} />
                </td>

                <td className="p-3">{p.start_date}</td>
                <td className="p-3">{p.end_date}</td>

                <td className="p-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function KPICard({
  title,
  count,
  total,
  active,
  onClick,
}: {
  title: string
  count: number
  total: number
  active?: boolean
  onClick?: () => void
}) {

  
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-lg border bg-white px-4 py-3
        transition-all duration-150
        ${active
          ? "border-red-500 ring-1 ring-red-200"
          : "hover:border-gray-400"}
      `}
    >
      <p className="text-[11px] uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-semibold text-gray-900">
        {count} Project
      </p>

      <p className="text-xs text-gray-600 mt-0.5">
        Rp {total.toLocaleString("id-ID")}
      </p>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded h-2">
      <div
        className="bg-green-600 h-2 rounded"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    planning: "bg-yellow-100 text-yellow-700",
    running: "bg-blue-100 text-blue-700",
    finish: "bg-green-100 text-green-700",
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status] || ""}`}>
      {status}
    </span>
  )
}
