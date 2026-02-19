'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Send, 
  CheckCircle, 
  Truck, 
  XCircle,
  RefreshCcw,
  AlertCircle,
  FileText,
  Package,
  Calendar,
  Building2,
  User,
  Clock,
  Download,
  Printer,
  MoreVertical,
  ChevronDown,
  Save
} from 'lucide-react'

import StatusBadge from '@/components/dashboard/procurement/StatusBadge'
import Money from '@/components/dashboard/procurement/Money'
import DateText from '@/components/dashboard/procurement/DateText'

interface POItem {
  po_item_id: string
  description: string
  qty: number
  unit: string
  unit_price: number
  subtotal: number
  material_id?: string
}

interface PO {
  po_id: string
  po_code: string
  vendor_id: string
  vendor_name?: string
  project_id: string
  project_name?: string
  pr_id?: string
  pr_code?: string
  order_date: string
  delivery_date?: string
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'DELIVERED' | 'CLOSED'
  notes?: string
  total_amount: number
  version: number
  items: POItem[]
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

export default function PODetailPage() {
  const params = useParams()
  const router = useRouter()
  const po_id = params.id as string

  const [po, setPO] = useState<PO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedItems, setEditedItems] = useState<POItem[]>([])
  const [editedNotes, setEditedNotes] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch vendor & project details
  const [vendor, setVendor] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [grList, setGRList] = useState<any[]>([])

  useEffect(() => {
    fetchPO()
  }, [po_id])

  async function fetchPO() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/procurement/po/${po_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load PO')
      }

      setPO(data.data)
      setEditedItems(data.data.items || [])
      setEditedNotes(data.data.notes || '')

      // Fetch vendor details
      if (data.data.vendor_id) {
        fetchVendor(data.data.vendor_id)
      }

      // Fetch project details
      if (data.data.project_id) {
        fetchProject(data.data.project_id)
      }

      // Fetch GR list for this PO
      fetchGRList(data.data.po_id)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchVendor(vendor_id: string) {
    try {
      const res = await fetch(`/api/procurement/vendors/${vendor_id}`)
      const data = await res.json()
      if (data.success) {
        setVendor(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch vendor:', err)
    }
  }

  async function fetchProject(project_id: string) {
    try {
      const res = await fetch(`/api/projects/${project_id}`)
      const data = await res.json()
      setProject(data)
    } catch (err) {
      console.error('Failed to fetch project:', err)
    }
  }

  async function fetchGRList(po_id: string) {
    try {
      const res = await fetch(`/api/procurement/gr?po_id=${po_id}`)
      const data = await res.json()
      if (data.success) {
        setGRList(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch GRs:', err)
    }
  }

  async function handleStatusAction(newStatus: PO['status']) {
    if (!po) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/procurement/po/${po_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          if_match_version: po.version,
          updated_by: 'SYSTEM'
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status')
      }

      await fetchPO()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSaveItems() {
    if (!po) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/procurement/po/${po_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: editedItems,
          notes: editedNotes,
          if_match_version: po.version,
          updated_by: 'SYSTEM'
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update PO')
      }

      setEditMode(false)
      await fetchPO()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/procurement/po/${po_id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete PO')
      }

      router.push('/admin/procurement/po')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const getAvailableActions = () => {
    if (!po) return []

    switch (po.status) {
      case 'DRAFT':
        return [
          { label: 'Send to Vendor', action: 'SENT', icon: Send, className: 'bg-blue-600 hover:bg-blue-700' }
        ]
      case 'SENT':
        return [
          { label: 'Confirm', action: 'CONFIRMED', icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700' },
          { label: 'Cancel', action: 'DRAFT', icon: XCircle, className: 'bg-gray-600 hover:bg-gray-700' }
        ]
      case 'CONFIRMED':
        return [
          { label: 'Mark Delivered', action: 'DELIVERED', icon: Truck, className: 'bg-purple-600 hover:bg-purple-700' }
        ]
      case 'DELIVERED':
        return [
          { label: 'Close PO', action: 'CLOSED', icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700' }
        ]
      default:
        return []
    }
  }

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...editedItems]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate subtotal
    if (field === 'qty' || field === 'unit_price') {
      const qty = field === 'qty' ? value : newItems[index].qty
      const price = field === 'unit_price' ? value : newItems[index].unit_price
      newItems[index].subtotal = qty * price
    }
    
    setEditedItems(newItems)
  }

  const addItem = () => {
    setEditedItems([
      ...editedItems,
      {
        po_item_id: `temp-${Date.now()}`,
        description: '',
        qty: 1,
        unit: 'pcs',
        unit_price: 0,
        subtotal: 0
      }
    ])
  }

  const removeItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index))
  }

  const calculateTotal = (items: POItem[]) => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !po) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-600 font-medium">{error || 'PO not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    )
  }

  const actions = getAvailableActions()
  const canEdit = po.status === 'DRAFT' && !editMode
  const hasGR = grList.length > 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

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
              <h1 className="text-2xl font-bold">PO {po.po_code}</h1>
              <StatusBadge status={po.status} type="po" />
              {po.version > 1 && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  v{po.version}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Created {po.created_at ? new Date(po.created_at).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Actions based on status */}
          {actions.map(action => (
            <button
              key={action.action}
              onClick={() => handleStatusAction(action.action as PO['status'])}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${action.className}`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}

          {/* Edit button (only DRAFT) */}
          {canEdit && !hasGR && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Edit size={16} />
              Edit
            </button>
          )}

          {/* Save button (edit mode) */}
          {editMode && (
            <>
              <button
                onClick={handleSaveItems}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false)
                  setEditedItems(po.items)
                  setEditedNotes(po.notes || '')
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}

          {/* Delete button (only DRAFT, no GR) */}
          {po.status === 'DRAFT' && !hasGR && !editMode && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={fetchPO}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Warning if has GR */}
      {hasGR && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-yellow-800">Goods Receipt exists</p>
            <p className="text-sm text-yellow-700">
              This PO has {grList.length} Goods Receipt(s). Items cannot be modified.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* PO Details Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Purchase Order Details</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <DetailItem
                icon={Building2}
                label="Vendor"
                value={vendor?.vendor_name || po.vendor_id}
                subValue={vendor?.vendor_code}
              />
              <DetailItem
                icon={Package}
                label="Project"
                value={project?.project_name || po.project_id}
                subValue={project?.lokasi}
              />
              <DetailItem
                icon={FileText}
                label="PR Reference"
                value={po.pr_id ? (
                  <Link 
                    href={`/procurement/pr/${po.pr_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {po.pr_code || po.pr_id}
                  </Link>
                ) : '-'}
              />
              <DetailItem
                icon={Calendar}
                label="Order Date"
                value={<DateText date={po.order_date} format="long" />}
              />
              {po.delivery_date && (
                <DetailItem
                  icon={Truck}
                  label="Delivery Date"
                  value={<DateText date={po.delivery_date} format="long" />}
                />
              )}
            </div>

            {/* Notes */}
            {editMode ? (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            ) : po.notes ? (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm">{po.notes}</p>
              </div>
            ) : null}
          </div>

          {/* Items Card */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Items</h2>
              {editMode && (
                <button
                  onClick={addItem}
                  className="text-sm text-blue-600 hover:underline"
                >
                  + Add Item
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Qty</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                    {editMode && <th className="p-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {(editMode ? editedItems : po.items).map((item, index) => (
                    <tr key={item.po_item_id} className="border-t">
                      <td className="p-3">
                        {editMode ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full border rounded px-2 py-1"
                            required
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="p-3">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value))}
                            className="w-20 border rounded px-2 py-1"
                            required
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="p-3">
                        {editMode ? (
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-16 border rounded px-2 py-1"
                            required
                          />
                        ) : (
                          item.unit
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {editMode ? (
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                            className="w-32 border rounded px-2 py-1 text-right"
                            required
                          />
                        ) : (
                          <Money value={item.unit_price} />
                        )}
                      </td>
                      <td className="p-3 text-right font-medium">
                        <Money value={item.subtotal} />
                      </td>
                      {editMode && (
                        <td className="p-3 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={4} className="p-3 text-right">Total</td>
                    <td className="p-3 text-right">
                      <Money value={calculateTotal(editMode ? editedItems : po.items)} />
                    </td>
                    {editMode && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* GR List */}
          {grList.length > 0 && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Goods Receipts</h2>
              <div className="space-y-3">
                {grList.map((gr: any) => (
                  <Link
                    key={gr.gr_id}
                    href={`/procurement/gr/${gr.gr_id}`}
                    className="block p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{gr.gr_code}</p>
                        <p className="text-xs text-gray-500">
                          Received: <DateText date={gr.received_date} />
                        </p>
                      </div>
                      <StatusBadge status="RECEIVED" type="gr" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">

          {/* Summary Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Items</span>
                <span className="font-bold">{po.items.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-lg">
                  <Money value={po.total_amount} />
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Version</span>
                <span className="font-mono text-sm">v{po.version}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                icon={Calendar}
                label="Created"
                value={po.created_at}
                user={po.created_by}
              />
              {po.updated_at && po.updated_at !== po.created_at && (
                <TimelineItem
                  icon={Clock}
                  label="Last Updated"
                  value={po.updated_at}
                  user={po.updated_by}
                />
              )}
              {po.status === 'SENT' && (
                <TimelineItem
                  icon={Send}
                  label="Sent to Vendor"
                  value={po.updated_at}
                />
              )}
              {po.status === 'CONFIRMED' && (
                <TimelineItem
                  icon={CheckCircle}
                  label="Confirmed"
                  value={po.updated_at}
                />
              )}
              {po.status === 'DELIVERED' && (
                <TimelineItem
                  icon={Truck}
                  label="Delivered"
                  value={po.updated_at}
                />
              )}
              {po.status === 'CLOSED' && (
                <TimelineItem
                  icon={CheckCircle}
                  label="Closed"
                  value={po.updated_at}
                />
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Printer size={16} />
                Print PO
              </button>
              <button
                onClick={() => {
                  // Implement export
                  alert('Export feature coming soon')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete PO</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete PO {po.po_code}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function DetailItem({ icon: Icon, label, value, subValue }: any) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <div className="font-medium">{value}</div>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
      </div>
    </div>
  )
}

function TimelineItem({ icon: Icon, label, value, user }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-gray-100 rounded-lg">
        <Icon size={14} className="text-gray-600" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {value && (
          <p className="text-xs text-gray-600">
            <DateText date={value} format="long" />
          </p>
        )}
        {user && <p className="text-xs text-gray-400">by {user}</p>}
      </div>
    </div>
  )
}
