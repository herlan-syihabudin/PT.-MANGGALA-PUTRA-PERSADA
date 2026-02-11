// app/admin/projects/[project_id]/rab/page.tsx

import Link from "next/link"
import { formatIDR } from "@/lib/format"

export const dynamic = "force-dynamic"

/* ================= TYPES ================= */

type RabItem = {
  rab_id: string
  scope: string
  item_name: string
  category: string
  volume: number
  unit: string
  unit_price: number
  total_price: number
  status: string
}

type RabResponse = {
  summary: {
    total_items: number
    total_value: number
  }
  items: RabItem[]
}

/* ================= FETCH ================= */

async function fetchRAB(project_id: string): Promise<RabResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(
    `${base}/api/project/rab?project_id=${project_id}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    return {
      summary: { total_items: 0, total_value: 0 },
      items: [],
    }
  }

  return res.json()
}

/* ================= PAGE ================= */

export default async function ProjectRABPage({
  params,
}: {
  params: { project_id: string }
}) {
  const data = await fetchRAB(params.project_id)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">RAB Project</h1>
          <p className="text-xs text-gray-500">
            Project ID: {params.project_id}
          </p>
        </div>

        <Link
          href={`/admin/projects/${params.project_id}`}
          className="text-xs text-gray-600"
        >
          ← Kembali ke Project
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard label="Total Item">
          {data.summary.total_items}
        </InfoCard>

        <InfoCard label="Total Nilai RAB" highlight>
          {formatIDR(data.summary.total_value)}
        </InfoCard>

        <InfoCard label="Status">
          {data.items[0]?.status || "Draft"}
        </InfoCard>
      </div>

      {/* TABS */}
      <Tabs />

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Scope",
                "Item",
                "Kategori",
                "Volume",
                "Unit",
                "Harga Satuan",
                "Total",
                "Status",
              ].map((h) => (
                <th key={h} className="p-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="p-4 text-center text-gray-500"
                >
                  Belum ada data RAB
                </td>
              </tr>
            ) : (
              data.items.map((i) => (
                <tr key={i.rab_id} className="border-t">
                  <td className="p-2">{i.scope}</td>
                  <td className="p-2">{i.item_name}</td>
                  <td className="p-2">{i.category}</td>
                  <td className="p-2">{i.volume}</td>
                  <td className="p-2">{i.unit}</td>
                  <td className="p-2">
                    {formatIDR(i.unit_price)}
                  </td>
                  <td className="p-2 font-medium">
                    {formatIDR(i.total_price)}
                  </td>
                  <td className="p-2">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        🔒 Data RAB bersifat <b>read-only</b> untuk Project Management.
        Perubahan hanya dapat dilakukan oleh Estimator.
      </p>
    </div>
  )
}

/* ================= UI COMPONENTS ================= */

function InfoCard({
  label,
  children,
  highlight,
}: {
  label: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-1 ${highlight ? "text-red-600 font-semibold" : ""}`}>
        {children}
      </p>
    </div>
  )
}

function Tabs() {
  return (
    <div className="flex gap-6 border-b text-sm">
      <button className="pb-2 border-b-2 border-blue-600 font-medium">
        RAB Detail
      </button>
      <button
        className="pb-2 text-gray-400 cursor-not-allowed"
        title="Akan muncul setelah procurement aktif"
      >
        Status Pengadaan
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Approved: "bg-green-100 text-green-700",
    Locked: "bg-red-100 text-red-700",
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}
