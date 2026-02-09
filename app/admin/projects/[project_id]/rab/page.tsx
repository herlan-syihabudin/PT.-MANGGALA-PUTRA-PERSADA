import { formatIDR } from "@/lib/format"
import Link from "next/link"

export const dynamic = "force-dynamic"

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

async function fetchRAB(project_id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(
    `${base}/api/estimator/rab?project_id=${project_id}`,
    { cache: "no-store" }
  )
  return res.json()
}

export default async function ProjectRABPage({
  params,
}: {
  params: { project_id: string }
}) {
  const data = await fetchRAB(params.project_id)

  return (
    <div className="p-6 space-y-6">

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
          className="text-xs text-blue-600"
        >
          ← Kembali ke Project
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card label="Total Item">
          {data.summary.total_items}
        </Card>

        <Card label="Total Nilai RAB" highlight>
          {formatIDR(data.summary.total_value)}
        </Card>

        <Card label="Status">
          Draft / Estimator
        </Card>
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
                "Harga",
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
            {data.items.map((i: RabItem, idx: number) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{i.scope}</td>
                <td className="p-2">{i.item_name}</td>
                <td className="p-2">{i.category}</td>
                <td className="p-2">{i.volume}</td>
                <td className="p-2">{i.unit}</td>
                <td className="p-2">{formatIDR(i.unit_price)}</td>
                <td className="p-2 font-medium">
                  {formatIDR(i.total_price)}
                </td>
                <td className="p-2">
                  <StatusBadge status={i.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        🔒 Data RAB hanya dapat diubah oleh Estimator
      </p>
    </div>
  )
}
