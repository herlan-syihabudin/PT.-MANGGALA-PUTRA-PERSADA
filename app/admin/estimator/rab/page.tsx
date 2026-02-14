import Link from "next/link"
import { formatIDR } from "@/lib/format"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type RabProject = {
  rab_id: string
  project_id: string
  project_name: string | null
  customer_name?: string | null
  total_items: number | null
  total_value: number | null
  status: string | null
}

type PendingInquiry = {
  inquiry_id: string
  customer_name: string
  nama_pekerjaan: string
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

async function fetchPendingInquiry(): Promise<PendingInquiry[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${base}/api/estimator/inquiry/pending`, {
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

/* ================= PAGE ================= */

export default async function RABPage() {
  const [rawProjects, pending] = await Promise.all([
    fetchRABList(),
    fetchPendingInquiry(),
  ])

  const projects = (rawProjects ?? []).sort((a, b) => {
    const statusA = (a.status || "").toLowerCase()
    const statusB = (b.status || "").toLowerCase()

    if (statusA === "draft" && statusB !== "draft") return -1
    if (statusB === "draft" && statusA !== "draft") return 1
    return 0
  })

  return (
    <div className="p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            RAB Project
          </h1>
          <p className="text-sm text-gray-500">
            Workspace Estimator – sumber RAB resmi untuk Project Management
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* 🔔 TO ESTIMATE */}
          <Link
            href="/admin/estimator/to-estimate"
            className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition shadow-sm border
              ${
                pending.length > 0
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }
            `}
          >
            🔔 To Estimate

            {pending.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </Link>

          {/* CREATE BUTTON */}
          <Link
            href="/admin/estimator/rab/create"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-md active:scale-95"
          >
            + Buat RAB Project
          </Link>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="p-4">Project Info</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total Nilai</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  Belum ada RAB project
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr
                  key={p.rab_id}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  {/* PROJECT INFO */}
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">
                      {p.project_name || "Tanpa Nama Project"}
                    </div>

                    {p.customer_name && (
                      <div className="text-xs text-gray-500">
                        {p.customer_name}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 font-mono uppercase">
                      {p.project_id}
                    </div>
                  </td>

                  {/* ITEMS */}
                  <td className="p-4 text-gray-600">
                    <span className="font-medium">
                      {p.total_items ?? 0}
                    </span>{" "}
                    <span className="text-xs">Baris</span>
                  </td>

                  {/* VALUE */}
                  <td className="p-4 font-bold text-blue-700">
                    {formatIDR(p.total_value ?? 0)}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <StatusBadge status={p.status || "Draft"} />
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/estimator/rab/${p.rab_id}`}
                      className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-md text-[11px] font-bold text-gray-700 hover:bg-gray-50 group-hover:border-blue-400 group-hover:text-blue-600 transition-all"
                    >
                      Buka RAB
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= SECURITY NOTE ================= */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-dashed">
        <span className="text-lg">🔒</span>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          <b>Security Note:</b> Data RAB dikontrol penuh oleh Estimator.
          Project Management hanya memiliki akses baca (Read-Only).
        </p>
      </div>
    </div>
  )
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    approved: "bg-green-100 text-green-700",
    locked: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[normalized] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}
