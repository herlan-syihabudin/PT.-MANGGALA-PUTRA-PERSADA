'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import ProjectSelect from '@/components/dashboard/procurement/ProjectSelect'
import ItemsEditor, { Item } from '@/components/dashboard/procurement/ItemsEditor'
import Money from '@/components/dashboard/procurement/Money'

export default function CreatePRPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    pr_code: '',
    project_id: '',
    requested_by: '',
    request_date: new Date().toISOString().split('T')[0],
    needed_date: '',
    notes: '',
    items: [] as Item[],
  })

  // 🔥 COMPUTED TOTAL
  const total = useMemo(() => {
    return form.items.reduce((sum, item) => {
      return sum + (item.qty || 0) * (item.estimated_price || 0)
    }, 0)
  }, [form.items])

  // 🔥 VALIDATION
  const isValid =
    form.pr_code &&
    form.project_id &&
    form.requested_by &&
    form.items.length > 0 &&
    total > 0 &&
    (!form.needed_date || form.needed_date >= form.request_date)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/procurement/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create PR')
      }

      router.push(`/procurement/pr/${data.data.pr_id}`)
    } catch (err: any) {
      setError(err?.message || 'Failed to create PR')
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold">Create Purchase Request</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormInput
              label="PR Code *"
              value={form.pr_code}
              onChange={(v) => setForm({ ...form, pr_code: v })}
              placeholder="PR-2025-001"
            />

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

            <FormInput
              label="Requested By *"
              value={form.requested_by}
              onChange={(v) =>
                setForm({ ...form, requested_by: v })
              }
            />

            <FormInput
              label="Request Date *"
              type="date"
              value={form.request_date}
              onChange={(v) =>
                setForm({ ...form, request_date: v })
              }
            />

            <FormInput
              label="Need By Date"
              type="date"
              value={form.needed_date}
              onChange={(v) =>
                setForm({ ...form, needed_date: v })
              }
              error={
                form.needed_date &&
                form.needed_date < form.request_date
                  ? 'Need date cannot be before request date'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border rounded-xl p-6">
          <ItemsEditor
            items={form.items}
            onChange={(items) =>
              setForm({ ...form, items })
            }
            type="pr"
          />

          {/* 🔥 TOTAL PREVIEW */}
          <div className="mt-6 text-right">
            <div className="text-sm text-gray-500">
              Estimated Total
            </div>
            <div className="text-xl font-bold">
              <Money value={total} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border rounded-xl p-6">
          <label className="block text-sm font-medium mb-1">
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

        {/* Submit */}
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
            {loading ? 'Creating...' : 'Create PR'}
          </button>
        </div>
      </form>
    </div>
  )
}

// 🔥 Reusable Input
function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  error?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full border rounded-lg px-3 py-2
          ${error ? 'border-red-500' : ''}
        `}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
