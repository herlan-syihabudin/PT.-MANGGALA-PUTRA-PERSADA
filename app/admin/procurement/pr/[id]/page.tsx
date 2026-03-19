'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  ShoppingCart,
  RefreshCcw,
  AlertCircle,
  Loader2,
  FileText,
  History,
  MessageSquare,
  Clock
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

// ========== TYPES ==========
interface PR {
  pr_id: string
  pr_code: string
  project_id: string
  project_name?: string
  requested_by: string
  request_date: string
  needed_date?: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ORDERED'
  notes?: string
  items: Array<{
    pr_item_id: string
    description: string
    qty: number
    unit: string
    estimated_price?: number
    subtotal?: number
    material_id?: string
  }>
  created_by?: string
  created_at: string
  updated_at: string
  // 🔥 MR Source info
  source_mr?: {
    request_no: string
    request_date: string
  }
}

interface AuditLog {
  id: string
  action: string
  performed_by: string
  performed_at: string
  notes?: string
}

// ========== CONSTANTS ==========
const ACTION_CONFIG = {
  DRAFT: [
    { key: 'submit', label: 'Submit', icon: Send, color: 'blue', confirmMessage: 'Submit this PR for approval?' }
  ],
  SUBMITTED: [
    { key: 'approve', label: 'Approve', icon: CheckCircle, color: 'green', confirmMessage: 'Approve this PR?' },
    { key: 'reject', label: 'Reject', icon: XCircle, color: 'red', confirmMessage: 'Reject this PR?' }
  ],
  APPROVED: [
    { key: 'create_po', label: 'Create PO', icon: ShoppingCart, color: 'purple', confirmMessage: 'Create Purchase Order from this PR?' }
  ],
  REJECTED: [],
  ORDERED: []
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED'],
  APPROVED: ['ORDERED'],
  REJECTED: [],
  ORDERED: []
}

// ========== MAIN COMPONENT ==========
export default function PRDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [pr, setPR] = useState<PR | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showAuditModal, setShowAuditModal] = useState(false)

  // ===== FETCH PR =====
  async function fetchPR() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/procurement/pr/${params.id}?include_items=true`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load PR')
      }

      setPR(data.data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load PR')
      setPR(null)
    } finally {
      setLoading(false)
    }
  }

  // ===== FETCH AUDIT LOGS =====
  async function fetchAuditLogs() {
    if (!pr?.pr_id) return
    
    try {
      setLoadingAudit(true)
      const res = await fetch(`/api/procurement/pr/${pr.pr_id}/audit`)
      const data = await res.json()
      
      if (data.success) {
        setAuditLogs(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoadingAudit(false)
    }
  }

  useEffect(() => {
    fetchPR()
  }, [params.id])

  useEffect(() => {
    if (pr?.pr_id) {
      fetchAuditLogs()
    }
  }, [pr?.pr_id])

  // ===== COMPUTED =====
  const total = useMemo(() => {
    if (!pr) return 0
    return pr.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0
  }, [pr])

  const canTransition = (targetStatus: string): boolean => {
    if (!pr) return false
    return STATUS_TRANSITIONS[pr.status]?.includes(targetStatus) || false
  }

  // ===== ACTION HANDLER =====
  const handleAction = async (actionKey: string) => {
    if (!pr || actionLoading) return

    const action = ACTION_CONFIG[pr.status]?.find(a => a.key === actionKey)
    if (!action) return

    // 🔥 CONFIRMATION DIALOG
    if (action.confirmMessage && !confirm(action.confirmMessage)) {
      return
    }

    // 🔥 SPECIAL HANDLING FOR REJECT
    if (actionKey === 'reject') {
      setShowRejectModal(true)
      return
    }

    // 🔥 SPECIAL HANDLING FOR CREATE PO
    if (actionKey === 'create_po') {
      router.push(`/procurement/po/create?from_pr=${pr.pr_id}`)
      return
    }

    await executeAction(actionKey)
  }

  // 🔥 REJECT WITH REASON
  const handleRejectWithReason = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setShowRejectModal(false)
    await executeAction('reject', rejectReason)
    setRejectReason('')
  }

  // 🔥 EXECUTE ACTION
  const executeAction = async (actionKey: string, reason?: string) => {
    if (!pr) return

    const STATUS_MAP: Record<string, string> = {
      submit: 'SUBMITTED',
      approve: 'APPROVED',
      reject: 'REJECTED'
    }

    const newStatus = STATUS_MAP[actionKey]
    if (!newStatus) return

    // 🔥 VALIDATE TRANSITION
    if (!canTransition(newStatus)) {
      alert(`Cannot transition from ${pr.status} to ${newStatus}`)
      return
    }

    setActionLoading(actionKey)

    try {
      const res = await fetch(`/api/procurement/pr/${pr.pr_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: reason ? `Rejected: ${reason}` : undefined
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status')
      }

      // 🔥 SUCCESS TOAST (bisa diganti dengan toast library)
      alert(`✅ PR ${actionKey} successful`)

      await fetchPR()
      await fetchAuditLogs()
      
    } catch (err: any) {
      alert(`❌ ${err?.message || 'Action failed'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading PR details...</p>
        </div>
      </div>
    )
  }

  // ===== ERROR STATE =====
  if (error || !pr) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load PR
          </h2>
          <p className="text-sm text-gray-600 mb-6">{error || 'PR not found'}</p>
          <button
            onClick={fetchPR}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 🔥 REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <XCircle size={18} className="text-red-600" />
                Reject PR {pr.pr_code}
              </h3>
            </div>
            
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please provide a reason..."
                autoFocus
              />
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle size={16} />
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 AUDIT MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <History size={18} />
                Audit Trail
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XCircle size={18} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-auto">
              {loadingAudit ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No audit logs found</p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{log.performed_by}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(log.performed_at).toLocaleString('id-ID')}
                      </div>
                      {log.notes && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">
                      PR {pr.pr_code}
                    </h1>
                    <StatusBadge status={pr.status} type="pr" size="md" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Project: {pr.project_name || pr.project_id}</span>
                    <span>•</span>
                    <span>Requested by: {pr.requested_by}</span>
                    <span>•</span>
                    <span>
                      <Clock size={14} className="inline mr-1" />
                      <DateText date={pr.created_at} format="short" />
                    </span>
                  </div>

                  {/* 🔥 MR Source Info */}
                  {pr.source_mr && (
                    <div className="mt-2 text-xs bg-blue-50 text-blue-700 inline-flex items-center gap-2 px-3 py-1 rounded-full">
                      <FileText size={12} />
                      <span>From MR: {pr.source_mr.request_no}</span>
                      <span>•</span>
                      <span>{new Date(pr.source_mr.request_date).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAuditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History size={16} />
                  History
                </button>

                {pr.status === 'DRAFT' && (
                  <Link
                    href={`/procurement/pr/${pr.pr_id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                )}

                {ACTION_CONFIG[pr.status]?.map(action => (
                  <button
                    key={action.key}
                    onClick={() => handleAction(action.key)}
                    disabled={actionLoading === action.key}
                    className={`
                      flex items-center gap-2 px-4 py-2 text-white rounded-lg
                      transition-colors relative min-w-[100px] justify-center
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${action.color === 'blue' && 'bg-blue-600 hover:bg-blue-700'}
                      ${action.color === 'green' && 'bg-green-600 hover:bg-green-700'}
                      ${action.color === 'red' && 'bg-red-600 hover:bg-red-700'}
                      ${action.color === 'purple' && 'bg-purple-600 hover:bg-purple-700'}
                    `}
                  >
                    {actionLoading === action.key ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <action.icon size={16} />
                        {action.label}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">

              {/* Request Information */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-gray-500" />
                  Request Information
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Requested By</p>
                    <p className="font-medium text-lg">{pr.requested_by}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Request Date</p>
                    <p className="font-medium">
                      <DateText date={pr.request_date} format="long" />
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Needed By</p>
                    <p className="font-medium">
                      {pr.needed_date
                        ? <DateText date={pr.needed_date} format="long" />
                        : <span className="text-gray-400">Not specified</span>}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Value</p>
                    <p className="font-medium text-xl text-blue-600">
                      <Money value={total} />
                    </p>
                  </div>
                </div>

                {pr.notes && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm border border-gray-200">
                      <MessageSquare size={16} className="inline mr-2 text-gray-400" />
                      {pr.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Items</h2>

                <div className="overflow-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-left">Qty</th>
                        <th className="p-3 text-left">Unit</th>
                        <th className="p-3 text-right">Est. Price</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pr.items.map((item, index) => (
                        <tr key={item.pr_item_id} className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <span className="font-medium">{item.description}</span>
                              {item.material_id && (
                                <span className="ml-2 text-xs text-gray-400">
                                  ID: {item.material_id.slice(0, 8)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-medium">{item.qty}</td>
                          <td className="p-3 text-gray-600">{item.unit}</td>
                          <td className="p-3 text-right">
                            {item.estimated_price
                              ? <Money value={item.estimated_price} />
                              : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="p-3 text-right font-medium">
                            <Money value={item.subtotal || 0} />
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={4} className="p-3 text-right">Total</td>
                        <td className="p-3 text-right text-blue-600">
                          <Money value={total} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Items Summary */}
                <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
                  <span>{pr.items.length} item(s)</span>
                  <span>Last updated: <DateText date={pr.updated_at} format="short" /></span>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* System Info */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">System Info</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Created At</span>
                    <span className="font-medium">
                      {new Date(pr.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Created Time</span>
                    <span className="font-medium">
                      {new Date(pr.created_at).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="font-medium">
                      <DateText date={pr.updated_at} format="relative" />
                    </span>
                  </div>
                  {pr.created_by && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Created By</span>
                      <span className="font-medium">{pr.created_by}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Status Timeline</h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-gray-500">
                        <DateText date={pr.created_at} format="relative" />
                      </p>
                    </div>
                  </div>

                  {pr.status !== 'DRAFT' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-xs text-gray-500">Status: {pr.status}</p>
                      </div>
                    </div>
                  )}

                  {pr.status === 'APPROVED' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-600">Ready for PO</p>
                        <p className="text-xs text-gray-500">Can create Purchase Order</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                
                <div className="space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    🖨️ Print PR
                  </button>
                  
                  <button
                    onClick={() => {/* TODO: Download PDF */}}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    📥 Download PDF
                  </button>
                  
                  <button
                    onClick={() => {/* TODO: Share */}}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    📧 Share via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
