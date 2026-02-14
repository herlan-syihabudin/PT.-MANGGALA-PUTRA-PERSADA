
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

async function fetchRAB(rab_id: string): Promise<RabResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/estimator/rab?rab_id=${rab_id}`,
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

export default async function EstimatorRABDetail({
  params,
}: {
  params: { rab_id: string }
}) {
  const data = await fetchRAB(params.rab_id)

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            RAB Project – Estimator
          </h1>
          <p className="text-xs text-gray-500">
  RAB ID: {params.rab_id}
</p>
        </div>

        <Link
          href="/admin/estimator/rab"
          className="text-xs text-gray-600"
        >
          ← Kembali ke List RAB
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

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
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
                <th key={h} className="p-3 text-left">
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
                  className="p-6 text-center text-gray-500"
                >
                  Belum ada item RAB
                </td>
              </tr>
            ) : (
              data.items.map((i) => (
                <tr key={i.rab_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{i.scope}</td>
                  <td className="p-3">{i.item_name}</td>
                  <td className="p-3">{i.category}</td>
                  <td className="p-3">{i.volume}</td>
                  <td className="p-3">{i.unit}</td>
                  <td className="p-3">
                    {formatIDR(i.unit_price)}
                  </td>
                  <td className="p-3 font-medium">
                    {formatIDR(i.total_price)}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        🔐 Modul ini adalah sumber RAB resmi. 
        Project Management membaca dari sini.
      </p>
    </div>
  )
}

/* ================= UI ================= */

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
    <div className="bg-white border rounded-lg p-4">
      <p className="text-[11px] text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-1 ${highlight ? "text-red-600 font-semibold" : ""}`}>
        {children}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase()

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
