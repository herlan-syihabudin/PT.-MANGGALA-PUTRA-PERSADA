// app/admin/projects/[project_id]/rab/page.tsx
import Link from "next/link"
import { Metadata } from "next"
import { headers } from "next/headers"
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

type ApiResponse = {
  success: boolean
  data?: RabResponse
  error?: string
}

/* ================= METADATA ================= */
export async function generateMetadata({ 
  params 
}: { 
  params: { project_id: string } 
}): Promise<Metadata> {
  return {
    title: `RAB Project ${params.project_id.slice(0, 8)}`,
    description: "Rencana Anggaran Biaya Project"
  }
}

/* ================= UTILS ================= */
function getProjectRABStatus(items: RabItem[]): string {
  if (items.length === 0) return "Draft"
  if (items.every(i => i.status === "Approved")) return "Approved"
  if (items.some(i => i.status === "Locked")) return "Locked"
  return "Draft"
}

function calculateScopeSummary(items: RabItem[]) {
  return items.reduce((acc, item) => {
    if (!acc[item.scope]) {
      acc[item.scope] = { total: 0, count: 0 }
    }
    acc[item.scope].total += item.total_price
    acc[item.scope].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)
}

/* ================= FETCH ================= */
async function fetchRAB(project_id: string): Promise<RabResponse> {
  const fallbackResponse = {
    summary: { total_items: 0, total_value: 0 },
    items: [],
  }

  try {
    // Get base URL from headers (reliable in server components)
    const headersList = headers()
    const host = headersList.get('host')
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    const res = await fetch(`${baseUrl}/api/projects/${project_id}/rab`, {
      cache: "no-store",
      // Add timeout
      signal: AbortSignal.timeout(5000)
    })

    if (!res.ok) {
      console.error(`RAB fetch failed: ${res.status} for project ${project_id}`)
      return fallbackResponse
    }

    const json = await res.json() as ApiResponse
    
    // Handle new API response format
    if (!json.success) {
      console.error("API returned error:", json.error)
      return fallbackResponse
    }
    
    return json.data || fallbackResponse
    
  } catch (error) {
    console.error("Failed to fetch RAB:", error)
    return fallbackResponse
  }
}

/* ================= PAGE ================= */
export default async function ProjectRABPage({
  params,
}: {
  params: { project_id: string }
}) {
  const data = await fetchRAB(params.project_id)
  const status = getProjectRABStatus(data.items)
  const scopeSummary = calculateScopeSummary(data.items)

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl font-semibold">Rencana Anggaran Biaya</h1>
          <p className="text-xs text-gray-500 font-mono">
            Project: {params.project_id.slice(0, 8)}...{params.project_id.slice(-4)}
          </p>
        </div>

        <Link
          href={`/admin/projects/${params.project_id}`}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <span>←</span> Kembali ke Project
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard label="Total Item">
          <span className="text-2xl font-semibold">{data.summary.total_items}</span>
        </InfoCard>

        <InfoCard label="Total Nilai RAB" highlight>
          <span className="text-2xl font-semibold">{formatIDR(data.summary.total_value)}</span>
        </InfoCard>

        <InfoCard label="Status">
          <StatusBadge status={status} size="lg" />
        </InfoCard>

        <InfoCard label="Last Updated">
          <span className="text-sm text-gray-600">
            {new Date().toLocaleDateString('id-ID')}
          </span>
        </InfoCard>
      </div>

      {/* SCOPE SUMMARY (if items exist) */}
      {data.items.length > 0 && Object.keys(scopeSummary).length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ringkasan per Scope</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(scopeSummary).map(([scope, stats]) => (
              <div key={scope} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-gray-600 uppercase">{scope}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.count} items</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {formatIDR(stats.total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      <Tabs />

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Belum ada data RAB</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((i, index) => (
                  <tr key={`${i.rab_id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{i.scope}</td>
                    <td className="px-4 py-2 text-sm font-medium">{i.item_name}</td>
                    <td className="px-4 py-2 text-sm">{i.category}</td>
                    <td className="px-4 py-2 text-sm">{i.volume}</td>
                    <td className="px-4 py-2 text-sm">{i.unit}</td>
                    <td className="px-4 py-2 text-sm">
                      {formatIDR(i.unit_price)}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {formatIDR(i.total_price)}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={i.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer with Total */}
            {data.items.length > 0 && (
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-sm font-medium text-right">
                    Total Nilai RAB
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">
                    {formatIDR(data.summary.total_value)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Read-only mode:</strong> Data RAB hanya dapat dilihat oleh Project Management. 
          Perubahan hanya dapat dilakukan oleh Estimator melalui menu RAB.
        </span>
      </div>
    </div>
  )
}

/* ================= UI COMPONENTS ================= */
function InfoCard({ 
  label, 
  children, 
  highlight 
}: { 
  label: string
  children: React.ReactNode
  highlight?: boolean 
}) {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className={`${highlight ? "text-red-600" : "text-gray-900"}`}>
        {children}
      </div>
    </div>
  )
}

function Tabs() {
  return (
    <div className="border-b">
      <div className="flex gap-6">
        <button className="px-1 py-2 border-b-2 border-blue-600 text-sm font-medium text-blue-600">
          RAB Detail
        </button>
        <button
          className="px-1 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center gap-1"
          title="Akan muncul setelah procurement aktif"
        >
          Status Pengadaan
          <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">Coming soon</span>
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "lg" }) {
  const styles: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Approved: "bg-green-100 text-green-700",
    Locked: "bg-red-100 text-red-700",
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px]",
    lg: "px-3 py-1 text-sm"
  }

  return (
    <span
      className={`inline-block rounded font-medium ${sizeClasses[size]} ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}
