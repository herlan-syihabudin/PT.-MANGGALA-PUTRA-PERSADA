// app/admin/projects/[project_id]/material-request/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"

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
  approved_by?: string
  approved_at?: string
}

type RequestGroup = {
  request_no: string
  request_date: string
  requested_by: string
  status: string
  items: MaterialRequest[]
}

// ========== CONSTANTS ==========
const STATUS_COLORS = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
  Approved: { bg: "bg-green-100", text: "text-green-800", label: "Disetujui" },
  Rejected: { bg: "bg-red-100", text: "text-red-800", label: "Ditolak" },
  Delivered: { bg: "bg-blue-100", text: "text-blue-800", label: "Terkirim" }
}

// ========== MAIN COMPONENT ==========
export default function MaterialRequestListPage() {
  const params = useParams()
  const project_id = params.project_id as string

  // States
  const [requests, setRequests] = useState<MaterialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  // Load user name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("mr_user_name") || ""
    setUserName(savedName)
  }, [])

  // Fetch data
  useEffect(() => {
    fetchRequests()
  }, [project_id])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/projects/${project_id}/material-request`)
      const data = await res.json()
      setRequests(data.data || [])
    } catch (error) {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

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
  }, {} as Record<string, RequestGroup>)

  const requestList = Object.values(groupedRequests).sort((a, b) => 
    new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
  )

  // Handle Approve/Reject
  const handleStatusUpdate = async (
    requestNo: string, 
    newStatus: "Approved" | "Rejected"
  ) => {
    // Cek apakah user sudah set nama
    if (!userName.trim()) {
      const name = prompt(
        "Masukkan nama Anda untuk konfirmasi tindakan ini:",
        localStorage.getItem("mr_user_name") || ""
      )
      
      if (!name || !name.trim()) {
        toast.error("Nama harus diisi")
        return
      }
      
      localStorage.setItem("mr_user_name", name)
      setUserName(name)
    }

    // Konfirmasi tindakan
    const action = newStatus === "Approved" ? "menyetujui" : "menolak"
    if (!confirm(`Yakin akan ${action} request ${requestNo}?`)) {
      return
    }

    setProcessingId(requestNo)

    try {
      // Cari semua items dengan request_no ini
      const itemsToUpdate = requests.filter(r => r.request_no === requestNo)
      
      // Update status untuk setiap item (gunakan PATCH dengan ID)
      const updatePromises = itemsToUpdate.map(item => 
        fetch(`/api/projects/${project_id}/material-request?id=${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            approved_by: userName || localStorage.getItem("mr_user_name"),
            approved_at: new Date().toISOString()
          })
        })
      )

      await Promise.all(updatePromises)
      
      toast.success(
        <div>
          <p className="font-medium">Request {newStatus === "Approved" ? "Disetujui" : "Ditolak"}!</p>
          <p className="text-xs opacity-90">Oleh: {userName}</p>
        </div>
      )

      // Refresh data
      await fetchRequests()

    } catch (error) {
      toast.error(`Gagal ${newStatus === "Approved" ? "menyetujui" : "menolak"} request`)
    } finally {
      setProcessingId(null)
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="space-y-6 p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">Material Request</h1>
            <p className="text-xs text-gray-500">
              Project ID: {project_id.slice(0, 8)}...{project_id.slice(-4)}
            </p>
            {userName && (
              <p className="text-xs text-green-600 mt-1">
                Login sebagai: {userName}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/projects/${project_id}`}
              className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-2 border rounded-lg"
            >
              <span>←</span> Kembali
            </Link>

            <Link
              href={`/admin/projects/${project_id}/material-request/new`}
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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

          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Disetujui</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {requests.filter(r => r.status === "Approved").length}
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
              href={`/admin/projects/${project_id}/material-request/new`}
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
              const isPending = request.status === "Pending"
              const isProcessing = processingId === request.request_no

              // Cari informasi approval (ambil dari item pertama)
              const approvedBy = request.items[0]?.approved_by
              const approvedAt = request.items[0]?.approved_at

              return (
                <div key={request.request_no} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Request Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium">{request.request_no}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 {formatDate(request.request_date)}</span>
                      <span>👤 {request.requested_by}</span>
                    </div>
                  </div>

                  {/* Approval Info (if any) */}
{!isPending && approvedBy && (
  <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-500 flex items-center gap-2">
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>

    <span>
      {status === "Approved" ? "Disetujui" : "Ditolak"} oleh:{" "}
      <span className="font-medium text-gray-700">
        {approvedBy}
      </span>
    </span>

    {approvedAt && (
      <>
        <span>•</span>
        <span>
          {new Date(approvedAt).toLocaleString("id-ID")}
        </span>
      </>
    )}
  </div>
)}

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
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{item.material_name}</td>
                            <td className="px-4 py-2 font-medium">{item.qty}</td>
                            <td className="px-4 py-2 text-gray-600">{item.unit}</td>
                            <td className="px-4 py-2 text-gray-500">{item.remark || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-2 bg-gray-50 border-t flex justify-end gap-2">
                    <Link
                      href={`/admin/projects/${project_id}/material-request/${request.request_no}`}
                      className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      Detail
                    </Link>
                    
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(request.request_no, "Approved")}
                          disabled={isProcessing}
                          className="text-xs text-green-600 hover:text-green-700 px-2 py-1 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isProcessing ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          Setujui
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate(request.request_no, "Rejected")}
                          disabled={isProcessing}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isProcessing ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-red-600 border-r-transparent"></div>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* User Info Note */}
        {!userName && requestList.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong>Info:</strong> Saat menyetujui/menolak request, Anda akan diminta memasukkan nama untuk verifikasi.
              Nama akan disimpan di browser untuk penggunaan selanjutnya.
            </span>
          </div>
        )}
      </div>
    </>
  )
}
