// app/admin/estimator/rab/page.tsx

import Link from "next/link"
import { formatIDR } from "@/lib/format"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type RabProject = {
  project_id: string
  project_name: string
  total_items: number
  total_value: number
  status: string
}

/* ================= FETCH ================= */

async function fetchRABList(): Promise<RabProject[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${base}/api/estimator/rab/projects`, {
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

/* ================= PAGE ================= */

export default async function RABPage() {
  const projects = await fetchRABList()

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">RAB Project</h1>
        <p className="text-sm text-gray-500">
          Workspace Estimator – sumber RAB resmi untuk Project Management
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Project",
                "Total Item",
                "Total Nilai RAB",
                "Status",
                "Aksi",
              ].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  Belum ada RAB project
                </td>
              </tr>
            ) : (
              projects.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{p.project_name}</p>
                    <p className="text-xs text-gray-500">
                      {p.project_id}
                    </p>
                  </td>

                  <td className="p-3">{p.total_items}</td>

                  <td className="p-3 font-medium">
                    {formatIDR(p.total_value)}
                  </td>

                  <td className="p-3">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/admin/projects/${p.project_id}/rab`}
                      className="text-blue-600 text-xs"
                    >
                      Buka RAB →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        🔒 Data RAB dikontrol penuh oleh Estimator.
        Project Management hanya membaca hasil final.
      </p>
    </div>
  )
}

/* ================= UI ================= */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Approved: "bg-green-100 text-green-700",
    Locked: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Draft"}
    </span>
  )
}
