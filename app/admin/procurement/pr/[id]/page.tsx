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
  RefreshCcw
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

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
  }>
  created_by?: string
  created_at: string
  updated_at: string
}

const ACTION_CONFIG = {
  DRAFT: [
    { key: 'submit', label: 'Submit', icon: Send, color: 'blue' }
  ],
  SUBMITTED: [
    { key: 'approve', label: 'Approve', icon: CheckCircle, color: 'green' },
    { key: 'reject', label: 'Reject', icon: XCircle, color: 'red' }
  ],
  APPROVED: [
    { key: 'create_po', label: 'Create PO', icon: ShoppingCart, color: 'purple' }
  ],
  REJECTED: [],
  ORDERED: []
}

export default function PRDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [pr, setPR] = useState<PR | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  async function fetchPR() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/procurement/pr/${params.id}`)
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

  useEffect(() => {
    fetchPR()
  }, [params.id])

  const total = useMemo(() => {
    if (!pr) return 0
    return pr.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0
  }, [pr])

  const handleAction = async (actionKey: string) => {
    if (!pr || actionLoading) return

    if (actionKey === 'create_po') {
      router.push(`/procurement/po/create?from_pr=${pr.pr_id}`)
      return
    }

    const STATUS_MAP: Record<string, string> = {
      submit: 'SUBMITTED',
      approve: 'APPROVED',
      reject: 'REJECTED'
    }

    const newStatus = STATUS_MAP[actionKey]
    if (!newStatus) return

    setActionLoading(true)

    try {
      const res = await fetch(`/api/procurement/pr/${pr.pr_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status')
      }

      await fetchPR()
    } catch (err: any) {
      alert(err?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error || !pr) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">
          {error || 'PR not found'}
        </div>
        <button
          onClick={() => fetchPR()}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCcw size={16} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                PR {pr.pr_code}
              </h1>
              <StatusBadge status={pr.status} type="pr" />
            </div>
            <p className="text-sm text-gray-500">
              Project: {pr.project_name || pr.project_id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pr.status === 'DRAFT' && (
            <Link
              href={`/procurement/pr/${pr.pr_id}/edit`}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Edit size={16} />
              Edit
            </Link>
          )}

          {ACTION_CONFIG[pr.status]?.map(action => (
            <button
              key={action.key}
              onClick={() => handleAction(action.key)}
              disabled={actionLoading}
              className={`
                flex items-center gap-2 px-4 py-2 text-white rounded-lg
                disabled:opacity-50
                ${action.color === 'blue' && 'bg-blue-600 hover:bg-blue-700'}
                ${action.color === 'green' && 'bg-green-600 hover:bg-green-700'}
                ${action.color === 'red' && 'bg-red-600 hover:bg-red-700'}
                ${action.color === 'purple' && 'bg-purple-600 hover:bg-purple-700'}
              `}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left */}
        <div className="lg:col-span-2 space-y-6">

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Request Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500">Requested By</p>
                <p className="font-medium">{pr.requested_by}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Request Date</p>
                <p className="font-medium">
                  <DateText date={pr.request_date} format="long" />
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Needed By</p>
                <p className="font-medium">
                  {pr.needed_date
                    ? <DateText date={pr.needed_date} format="long" />
                    : '-'}
                </p>
              </div>
            </div>

            {pr.notes && (
              <div className="mt-6">
                <p className="text-xs text-gray-500">Notes</p>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                  {pr.notes}
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Items</h2>

            <div className="overflow-auto">
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
                  {pr.items.map(item => (
                    <tr key={item.pr_item_id} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3">{item.qty}</td>
                      <td className="p-3">{item.unit}</td>
                      <td className="p-3 text-right">
                        {item.estimated_price
                          ? <Money value={item.estimated_price} />
                          : '-'}
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
                    <td className="p-3 text-right">
                      <Money value={total} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              System Info
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Created At</span>
                <p className="font-medium">
                  {new Date(pr.created_at).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <span className="text-gray-500">Updated At</span>
                <p className="font-medium">
                  {new Date(pr.updated_at).toLocaleString('id-ID')}
                </p>
              </div>

              {pr.created_by && (
                <div>
                  <span className="text-gray-500">Created By</span>
                  <p className="font-medium">{pr.created_by}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
