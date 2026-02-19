'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, RefreshCcw, Save, Trash2 } from 'lucide-react'

interface GRItem {
  gr_item_id: string
  material_id: string
  description: string
  qty_ordered: number
  qty_received: number
  unit: string
  unit_price: number
  subtotal: number
}

interface GRDetail {
  gr_id: string
  gr_code: string
  po_id: string
  vendor_id: string
  project_id: string
  receive_date: string
  delivery_note_no: string
  status: string
  notes: string
  total_received_qty: number
  total_amount: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  items: GRItem[]
}

export default function GRDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<GRDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchDetail() {
    try {
      setLoading(true)
      const res = await fetch(`/api/procurement/gr/${id}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load GR')
      }

      setData(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [])

  async function handleSave() {
    if (!data) return

    try {
      setSaving(true)
      const res = await fetch(`/api/procurement/gr/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gr_code: data.gr_code,
          receive_date: data.receive_date,
          delivery_note_no: data.delivery_note_no,
          notes: data.notes,
          status: data.status,
          updated_by: 'ADMIN',
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Update failed')
      }

      alert('GR Updated')
      fetchDetail()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this GR?')) return

    const res = await fetch(`/api/procurement/gr/${id}`, {
      method: 'DELETE',
    })

    const json = await res.json()

    if (json.success) {
      router.push('/admin/procurement/gr')
    } else {
      alert(json.error)
    }
  }

  if (loading) {
    return <div className="p-8 animate-pulse">Loading...</div>
  }

  if (error || !data) {
    return <div className="p-8 text-red-600">{error || 'GR not found'}</div>
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={fetchDetail}
            className="px-3 py-2 border rounded-lg"
          >
            <RefreshCcw size={16} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white border rounded-xl p-6 grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-gray-500">GR Code</label>
          <input
            value={data.gr_code}
            onChange={(e) => setData({ ...data, gr_code: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Receive Date</label>
          <input
            type="date"
            value={data.receive_date?.substring(0, 10)}
            onChange={(e) => setData({ ...data, receive_date: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Delivery Note</label>
          <input
            value={data.delivery_note_no}
            onChange={(e) => setData({ ...data, delivery_note_no: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Status</label>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="RECEIVED">RECEIVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-500">Notes</label>
          <textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">Material</th>
              <th className="p-4 text-right">Ordered</th>
              <th className="p-4 text-right">Received</th>
              <th className="p-4 text-right">Unit Price</th>
              <th className="p-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.gr_item_id} className="border-b">
                <td className="p-4">{item.description}</td>
                <td className="p-4 text-right">{item.qty_ordered}</td>
                <td className="p-4 text-right">{item.qty_received}</td>
                <td className="p-4 text-right">
                  {item.unit_price.toLocaleString()}
                </td>
                <td className="p-4 text-right font-medium">
                  {item.subtotal.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white border rounded-xl p-6 flex justify-end">
        <div className="space-y-2 text-right">
          <div>
            <span className="text-gray-500">Total Qty:</span>{' '}
            <strong>{data.total_received_qty}</strong>
          </div>
          <div>
            <span className="text-gray-500">Total Amount:</span>{' '}
            <strong>{data.total_amount.toLocaleString()}</strong>
          </div>
        </div>
      </div>

    </div>
  )
}
