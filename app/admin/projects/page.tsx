"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<string[]>([])

  /* ==============================
     FETCH PROJECT LIST
  ================================ */
  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error)
  }, [])

  /* ==============================
     SELECT HANDLER
  ================================ */
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selected.length === projects.length) {
      setSelected([])
    } else {
      setSelected(projects.map((p) => p.project_id))
    }
  }

  /* ==============================
     EXPORT CSV
  ================================ */
  const exportCSV = () => {
    const rows = projects.filter((p) =>
      selected.includes(p.project_id)
    )

    if (rows.length === 0) {
      alert("Pilih minimal 1 project")
      return
    }

    const header = [
      "Project",
      "Client",
      "Lokasi",
      "Nilai Kontrak",
      "Mulai",
      "Selesai",
      "Status",
    ]

    const data = rows.map((p) => [
      p.project_name,
      p.client,
      p.lokasi,
      p.nilai_kontrak,
      p.start_date,
      p.end_date,
      p.status,
    ])

    const csv =
      [header, ...data].map((r) => r.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "project-list.csv"
    a.click()
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
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

      {/* TABLE */}
      <div className="bg-white rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={
                    projects.length > 0 &&
                    selected.length === projects.length
                  }
                />
              </th>
              <th className="p-3">Project</th>
              <th className="p-3">Client</th>
              <th className="p-3">Lokasi</th>
              <th className="p-3">Nilai Kontrak</th>
              <th className="p-3">Mulai</th>
              <th className="p-3">Selesai</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-4 text-center text-gray-500"
                >
                  Belum ada project
                </td>
              </tr>
            )}

            {projects.map((p) => (
              <tr key={p.project_id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.project_id)}
                    onChange={() => toggleSelect(p.project_id)}
                  />
                </td>

                <td className="p-3 font-medium text-red-600 hover:underline">
                  <Link href={`/admin/projects/${p.project_id}`}>
                    {p.project_name}
                  </Link>
                </td>

                <td className="p-3">{p.client}</td>
                <td className="p-3">{p.lokasi || "-"}</td>
                <td className="p-3">
                  Rp {p.nilai_kontrak.toLocaleString("id-ID")}
                </td>
                <td className="p-3">{p.start_date}</td>
                <td className="p-3">{p.end_date}</td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
