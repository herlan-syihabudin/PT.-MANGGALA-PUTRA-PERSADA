'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'

import VendorSelect from '@/components/dashboard/procurement/VendorSelect'
import ProjectSelect from '@/components/dashboard/procurement/ProjectSelect'
import ItemsEditor, { Item } from '@/components/dashboard/procurement/ItemsEditor'
import Money from '@/components/dashboard/procurement/Money'

export default function CreatePOPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    po_code: '',
    vendor_id: '',
    project_id: '',
    pr_id: '',
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    notes: '',
    items: [] as Item[],
  })

  /* ================= COMPUTED ================= */

  const total = useMemo(() => {
  return form.items.reduce((sum, item) => {
    return sum + (item.qty || 0) * (item.estimated_price || 0)
  }, 0)
}, [form.items])

  const isValid =
    form.po_code.trim() !== '' &&
    form.vendor_id !== '' &&
    form.project_id !== '' &&
    form.items.length > 0

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/procurement/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          total_amount: total,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create PO')
      }

      router.push(`/procurement/po/${data.data.po_id}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to create PO')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          Create Purchase Order
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                PO Code *
              </label>
              <input
                type="text"
                value={form.po_code}
                onChange={(e) =>
                  setForm({ ...form, po_code: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="PO-2026-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Vendor *
              </label>
              <VendorSelect
                value={form.vendor_id}
                onChange={(id) =>
                  setForm({ ...form, vendor_id: id })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Project *
              </label>
              <ProjectSelect
                value={form.project_id}
                onChange={(id) =>
                  setForm({ ...form, project_id: id })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Order Date *
              </label>
              <input
                type="date"
                value={form.order_date}
                onChange={(e) =>
                  setForm({ ...form, order_date: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                value={form.delivery_date}
                onChange={(e) =>
                  setForm({ ...form, delivery_date: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <ItemsEditor
            items={form.items}
            onChange={(items) =>
              setForm({ ...form, items })
            }
            type="po"
          />

          {/* Total */}
          <div className="mt-6 border-t pt-4 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Total Amount
              </div>
              <div className="text-xl font-bold">
                <Money value={total} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium mb-2">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Additional information..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid || loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Creating...' : 'Create PO'}
          </button>
        </div>
      </form>
    </div>
  )
}
