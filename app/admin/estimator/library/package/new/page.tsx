'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save,
  Layers,
  FolderTree,
  FileText,
  Plus,
  X,
  GripVertical,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PackageItem {
  id: string
  jobId: string
  jobName: string
  category: string
  unit: string
  coefficient: number
  isCustom?: boolean
}

export default function NewPackagePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    type: 'standard' as 'standard' | 'premium' | 'economy',
    status: 'draft' as 'draft' | 'active' | 'archived',
    notes: ''
  })

  // Items in package
  const [items, setItems] = useState<PackageItem[]>([
    {
      id: '1',
      jobId: 'JOB-031',
      jobName: 'Pasang bata ringan dinding',
      category: 'Dinding',
      unit: 'm2',
      coefficient: 12.5
    },
    {
      id: '2',
      jobId: 'JOB-032',
      jobName: 'Plester + aci dinding',
      category: 'Dinding',
      unit: 'm2',
      coefficient: 25.0
    }
  ])

  const [showJobPicker, setShowJobPicker] = useState(false)
  const [searchJob, setSearchJob] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value) return 'Package name is required'
        if (value.length < 3) return 'Minimal 3 characters'
        return null
      case 'category':
        if (!value) return 'Category is required'
        return null
      default:
        return null
    }
  }

  const errors = {
    name: validateField('name', form.name),
    category: validateField('category', form.category)
  }

  const isValid = Boolean(
  form.name &&
  form.category &&
  !errors.name &&
  !errors.category
)

  // Available jobs (mock data)
  const availableJobs = [
    { id: 'JOB-031', name: 'Pasang bata ringan dinding', category: 'Dinding', unit: 'm2' },
    { id: 'JOB-032', name: 'Plester + aci dinding', category: 'Dinding', unit: 'm2' },
    { id: 'JOB-033', name: 'Keramik dinding 30x60', category: 'Dinding', unit: 'm2' },
    { id: 'JOB-045', name: 'Keramik lantai 30x30', category: 'Lantai', unit: 'm2' },
    { id: 'JOB-060', name: 'Pemasangan kloset duduk', category: 'Sanitair', unit: 'unit' },
    { id: 'JOB-074', name: 'Titik lampu', category: 'Elektrikal', unit: 'titik' }
  ]

  const categories = ['Dinding', 'Lantai', 'Plafon', 'Sanitair', 'Elektrikal', 'Plumbing']

  const filteredJobs = availableJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchJob.toLowerCase()) ||
                         job.id.toLowerCase().includes(searchJob.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addItemToPackage = (job: typeof availableJobs[0]) => {
  // Prevent duplicate
  if (items.some(i => i.jobId === job.id)) {
    return
  }

  const newItem: PackageItem = {
    id: crypto.randomUUID(),
    jobId: job.id,
    jobName: job.name,
    category: job.category,
    unit: job.unit,
    coefficient: 1
  }

  setItems(prev => [...prev, newItem])
  setShowJobPicker(false)
  setSearchJob('')
}

  const removeItem = (id: string) => {
  setItems(prev => prev.filter(item => item.id !== id))
}

  const updateCoefficient = (id: string, value: number) => {
  if (isNaN(value)) return

  setItems(prev =>
    prev.map(item =>
      item.id === id ? { ...item, coefficient: value } : item
    )
  )
}

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!isValid) {
    setTouched({ name: true, category: true })
    return
  }

  setSaving(true)
  setError(null)

  try {
    const payload = {
      ...form,
      items
    }

    // TODO: Replace with real API
    await new Promise(resolve => setTimeout(resolve, 1200))

    setSuccess(true)

    setTimeout(() => {
      router.push('/admin/estimator/library/package')
    }, 1200)

  } catch (err: any) {
    setError(err?.message || 'Unexpected error')
  } finally {
    setSaving(false)
  }
}

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
  }

  // Calculate totals
  const totalItems = items.length
  const estimatedTotal = items.reduce(
  (sum, item) => sum + (Number(item.coefficient) || 0),
  0
)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/estimator/library/package"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Packages
          </Link>
          
          <h1 className="text-2xl font-bold">Create New Package</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a reusable work package from job items
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Package created successfully!</p>
              <p className="text-sm text-green-700">Redirecting to packages list...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to create package</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Package Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Layers size={18} className="text-blue-600" />
                  Package Information
                </h2>

                <div className="space-y-4">
                  {/* Package Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
  type="text"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  onBlur={() => handleBlur('name')}
  className={`
    w-full px-4 py-2 border rounded-lg
    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${touched.name && errors.name ? 'border-red-500 bg-red-50' : ''}
  `}
  placeholder="e.g. Paket Dinding Standard Rumah Tipe 36"
  disabled={saving || success}
/>
                    {touched.name && errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this package..."
                      disabled={saving || success}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      onBlur={() => handleBlur('category')}
                      className={`
                        w-full px-4 py-2 border rounded-lg bg-white
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${touched.category && errors.category ? 'border-red-500 bg-red-50' : ''}
                      `}
                      disabled={saving || success}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {touched.category && errors.category && (
                      <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                    )}
                  </div>

                  {/* Package Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Package Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['standard', 'premium', 'economy'] as const).map((type) => (
                        <label
                          key={type}
                          className={`
                            flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer
                            ${form.type === type 
                              ? 'bg-blue-50 border-blue-300 text-blue-700' 
                              : 'hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={form.type === type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as typeof type })}
                            className="sr-only"
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving || success}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Total Items</span>
                    <span className="font-semibold">{totalItems} items</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Estimated Total</span>
                    <span className="font-semibold">{estimatedTotal.toFixed(2)} unit</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-semibold">
                      {new Set(items.map(i => i.category)).size}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white border rounded-xl p-6">
                <label className="block text-sm font-medium mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Add internal notes about this package..."
                  disabled={saving || success}
                />
              </div>
            </div>

            {/* Right Column - Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Card */}
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      Package Items ({items.length})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowJobPicker(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Layers size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No items in this package yet</p>
                      <button
                        type="button"
                        onClick={() => setShowJobPicker(true)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Add your first item
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 group"
                        >
                          <div className="cursor-move text-gray-400 mt-2">
                            <GripVertical size={16} />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                              <p className="font-medium text-sm">{item.jobName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{item.jobId}</span>
                                <span>•</span>
                                <span>{item.category}</span>
                              </div>
                            </div>
                            
                            <div className="col-span-3">
                              <label className="text-xs text-gray-500 block">Unit</label>
                              <p className="text-sm">{item.unit}</p>
                            </div>
                            
                            <div className="col-span-3">
                              <label className="text-xs text-gray-500 block">Koefisien</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.coefficient}
                                onChange={(e) => updateCoefficient(item.id, parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            
                            <div className="col-span-1 flex justify-end gap-1">
                              <button
                                type="button"
                                className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                              >
                                <Edit size={14} className="text-gray-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-1 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition"
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="text-xl font-bold mt-1">{items.length}</p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-xs text-gray-500">Categories</p>
                  <p className="text-xl font-bold mt-1">
                    {new Set(items.map(i => i.category)).size}
                  </p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <p className="text-xs text-gray-500">Est. Volume</p>
                  <p className="text-xl font-bold mt-1">
                    {estimatedTotal.toFixed(1)} unit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/estimator/library/package"
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || success || !isValid}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating Package...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Package
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Job Picker Modal */}
      {showJobPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Items to Package</h3>
              <button
                onClick={() => setShowJobPicker(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchJob}
                  onChange={(e) => setSearchJob(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => addItemToPackage(job)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition flex items-start justify-between group"
                  >
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{job.id}</span>
                        <span>•</span>
                        <span>{job.category}</span>
                        <span>•</span>
                        <span>{job.unit}</span>
                      </div>
                    </div>
                    <Plus size={18} className="text-gray-400 group-hover:text-blue-600 mt-1" />
                  </button>
                ))}

                {filteredJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No jobs found
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowJobPicker(false)}
                className="px-4 py-2 border rounded-lg hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
