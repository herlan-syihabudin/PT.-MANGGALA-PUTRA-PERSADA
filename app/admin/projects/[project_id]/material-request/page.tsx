// app/admin/projects/[project_id]/material-request/page.tsx
import Link from "next/link"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

// ========== TYPES ==========
type MaterialRequest = {
  id: string
  request_no: string
  project_id: string
  project_name: string
  request_date: string
  requested_by: string
  material_name: string
  qty: number
  unit: string
  remark: string
  status: "Pending" | "Approved" | "Rejected" | "Delivered"
  created_at: string
}

// ========== CONSTANTS ==========
const STATUS_COLORS = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  Approved: { bg: "bg-green-100", text: "text-green-800", label: "Disetujui" },
  Rejected: { bg: "bg-red-100", text: "text-red-800", label: "Ditolak" },
  Delivered: { bg: "bg-blue-100", text: "text-blue-800", label: "Terkirim" }
}

// ========== FETCH ==========
async function fetchMaterialRequests(project_id: string): Promise<MaterialRequest[]> {
  try {

    const host = headers().get("host")
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

    const res = await fetch(
      `${protocol}://${host}/api/projects/${project_id}/material-request`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.error("Failed to fetch material requests")
      return []
    }

    const data = await res.json()
    return data.data || []

  } catch (error) {
    console.error("Error fetching material requests:", error)
    return []
  }
}

// ========== PAGE ==========
export default async function MaterialRequestListPage({
  params
}: {
  params: { project_id: string }
}) {
  const requests = await fetchMaterialRequests(params.project_id)

  // Group by request_no
  const groupedRequests = requests.reduce((acc, req) => {
    if (!acc[req.request_no]) {
      acc[req.request_no] = {
        request_no: req.request_no,
        request_date: req.request_date,
        requested_by: req.requested_by,
        status: req.status,
        items: []
      }
    }
    acc[req.request_no].items.push(req)
    return acc
  }, {} as Record<string, { 
    request_no: string
    request_date: string
    requested_by: string
    status: string
    items: MaterialRequest[] 
  }>)

  const requestList = Object.values(groupedRequests).sort((a, b) => 
    new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
  )

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold">Material Request</h1>
          <p className="text-xs text-gray-500">
            Project ID: {params.project_id.slice(0, 8)}...{params.project_id.slice(-4)}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/projects/${params.project_id}`}
            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-2 border rounded-lg"
          >
            <span>←</span> Kembali
          </Link>

          <Link
            href={`/admin/projects/${params.project_id}/material-request/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Material
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Total Request</p>
          <p className="text-2xl font-semibold mt-1">{requestList.length}</p>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Total Items</p>
          <p className="text-2xl font-semibold mt-1">{requests.length}</p>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase">Pending</p>
          <p className="text-2xl font-semibold mt-1 text-yellow-600">
            {requests.filter(r => r.status === "Pending").length}
          </p>
        </div>
      </div>

      {/* Requests List */}
      {requestList.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Belum ada material request</p>
          <Link
            href={`/admin/projects/${params.project_id}/material-request/new`}
            className="inline-block mt-4 text-blue-600 hover:text-blue-700"
          >
            Buat Request Pertama →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requestList.map((request) => {
            const status = request.status as keyof typeof STATUS_COLORS
            const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.Pending

            return (
              <div key={request.request_no} className="bg-white border rounded-lg overflow-hidden">
                {/* Request Header */}
                <div className="bg-gray-50 px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{request.request_no}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📅 {new Date(request.request_date).toLocaleDateString('id-ID')}</span>
                    <span>👤 {request.requested_by}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {request.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">{item.material_name}</td>
                          <td className="px-4 py-2">{item.qty}</td>
                          <td className="px-4 py-2">{item.unit}</td>
                          <td className="px-4 py-2 text-gray-500">{item.remark || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-2 bg-gray-50 border-t flex justify-end gap-2">
                  <button className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1">
                    Detail
                  </button>
                  {request.status === "Pending" && (
                    <>
                      <button className="text-xs text-green-600 hover:text-green-700 px-2 py-1">
                        ✓ Setujui
                      </button>
                      <button className="text-xs text-red-600 hover:text-red-700 px-2 py-1">
                        ✕ Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
