'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save,
  FolderTree,
  Layers,
  AlertCircle,
  CheckCircle,
  RefreshCcw
} from 'lucide-react'

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    parentCategory: '',
    color: 'blue',
    icon: 'folder',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  })

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [originalData, setOriginalData] = useState<any>(null)

  // Available parent categories (mock data)
  const parentCategories = [
    { id: '1', name: 'Struktur', level: 0 },
    { id: '2', name: 'Finishing', level: 0 },
    { id: '3', name: 'MEP', level: 0 },
    { id: '4', name: 'Struktur > Pondasi', level: 1 },
    { id: '5', name: 'Struktur > Kolom & Balok', level: 1 },
    { id: '6', name: 'Finishing > Dinding', level: 1 },
    { id: '7', name: 'Finishing > Lantai', level: 1 },
    { id: '8', name: 'Finishing > Plafon', level: 1 },
    { id: '9', name: 'MEP > Elektrikal', level: 1 },
    { id: '10', name: 'MEP > Plumbing', level: 1 }
  ]

  // Color options
  const colorOptions = [
    { value: 'blue', label: 'Blue', bg: 'bg-blue-500', light: 'bg-blue-100 text-blue-700' },
    { value: 'green', label: 'Green', bg: 'bg-green-500', light: 'bg-green-100 text-green-700' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-500', light: 'bg-purple-100 text-purple-700' },
    { value: 'amber', label: 'Amber', bg: 'bg-amber-500', light: 'bg-amber-100 text-amber-700' },
    { value: 'red', label: 'Red', bg: 'bg-red-500', light: 'bg-red-100 text-red-700' },
    { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', light: 'bg-indigo-100 text-indigo-700' },
    { value: 'pink', label: 'Pink', bg: 'bg-pink-500', light: 'bg-pink-100 text-pink-700' },
    { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-500', light: 'bg-cyan-100 text-cyan-700' }
  ]

  // Icon options
  const iconOptions = [
    { value: 'folder', label: 'Folder', icon: '📁' },
    { value: 'layers', label: 'Layers', icon: '📚' },
    { value: 'box', label: 'Box', icon: '📦' },
    { value: 'grid', label: 'Grid', icon: '🔲' },
    { value: 'tag', label: 'Tag', icon: '🏷️' },
    { value: 'star', label: 'Star', icon: '⭐' },
    { value: 'heart', label: 'Heart', icon: '❤️' },
    { value: 'flag', label: 'Flag', icon: '🚩' }
  ]

  // Fetch category data
  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  async function fetchCategory() {
    try {
      setLoading(true)
      setFetchError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data - in real app, fetch from API
      const mockData = {
        id: categoryId,
        name: 'Dinding',
        code: 'DINDING_01',
        description: 'Semua pekerjaan yang berkaitan dengan dinding, termasuk pasangan bata, plesteran, dan finishing dinding.',
        parentCategory: '6', // Finishing > Dinding
        color: 'blue',
        icon: 'folder',
        status: 'active' as const,
        notes: 'Kategori ini digunakan untuk semua pekerjaan dinding interior dan eksterior.'
      }

      setForm({
        name: mockData.name,
        code: mockData.code,
        description: mockData.description,
        parentCategory: mockData.parentCategory,
        color: mockData.color,
        icon: mockData.icon,
        status: mockData.status,
        notes: mockData.notes || ''
      })

      setOriginalData(mockData)

    } catch (err: any) {
      console.error('Fetch error:', err)
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value) return 'Category name is required'
        if (value.length < 3) return 'Minimal 3 characters'
        if (value.length > 50) return 'Maximum 50 characters'
        return null
      case 'code':
        if (value && !/^[A-Z0-9_-]+$/.test(value)) {
          return 'Code must be uppercase letters, numbers, underscore or hyphen'
        }
        return null
      default:
        return null
    }
  }

  const errors = {
    name: validateField('name', form.name),
    code: validateField('code', form.code)
  }

  const hasChanges = originalData ? 
    Object.keys(form).some(key => 
      form[key as keyof typeof form] !== originalData[key as keyof typeof originalData]
    ) : false

  const isValid = !errors.name && form.name && hasChanges

  // Auto-generate code from name
  const generateCode = () => {
    if (!form.name) return
    
    const code = form.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    
    setForm(prev => ({ ...prev, code }))
    setTouched(prev => ({ ...prev, code: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setTouched({ name: true })
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess(true)
      setTimeout(() => {
        router.push(`/admin/estimator/library/category/${categoryId}`)
      }, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
            <div className="h-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white border rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{fetchError}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={fetchCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCcw size={16} className="inline mr-2" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/admin/estimator/library/category/${categoryId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Category Details
          </Link>
          
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update category information
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Category updated successfully!</p>
              <p className="text-sm text-green-700">Redirecting to category details...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to update category</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Note:</span> Fields marked with * are required
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FolderTree size={18} className="text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Category Name <span className="text-red-500">*</span>
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
                      ${touched.name && !errors.name && form.name ? 'border-green-500 bg-green-50' : ''}
                    `}
                    placeholder="e.g., Dinding, Lantai, Plumbing"
                    maxLength={50}
                    disabled={saving || success}
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Category Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Category Code
                    <span className="text-xs text-gray-400 ml-2">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      onBlur={() => handleBlur('code')}
                      className={`
                        flex-1 px-4 py-2 border rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${touched.code && errors.code ? 'border-red-500 bg-red-50' : ''}
                        ${touched.code && !errors.code && form.code ? 'border-green-500 bg-green-50' : ''}
                      `}
                      placeholder="DINDING_01"
                      maxLength={20}
                      disabled={saving || success}
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
                      disabled={!form.name || saving || success}
                    >
                      Generate
                    </button>
                  </div>
                  {touched.code && errors.code && (
                    <p className="text-xs text-red-600 mt-1">{errors.code}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Use uppercase letters, numbers, underscore (_) or hyphen (-)
                  </p>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what items belong in this category..."
                    disabled={saving || success}
                  />
                </div>
              </div>
            </div>

            {/* Hierarchy */}
            <div className="pt-4 border-t">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                Category Hierarchy
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Parent Category
                  <span className="text-xs text-gray-400 ml-2">(optional)</span>
                </label>
                <select
                  value={form.parentCategory}
                  onChange={(e) => setForm({ ...form, parentCategory: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={saving || success}
                >
                  <option value="">None (Root Category)</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.level)}{cat.level > 0 && '└ '}{cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Change parent category to reorganize hierarchy
                </p>
              </div>
            </div>

            {/* Visual Settings */}
            <div className="pt-4 border-t">
              <h2 className="text-lg font-semibold mb-4">Visual Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setForm({ ...form, color: color.value })}
                        className={`
                          p-2 rounded-lg border-2 transition-all
                          ${form.color === color.value 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-transparent hover:border-gray-300'
                          }
                        `}
                      >
                        <div className={`w-full h-8 ${color.bg} rounded-md mb-1`} />
                        <span className="text-xs">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setForm({ ...form, icon: icon.value })}
                        className={`
                          p-2 rounded-lg border-2 transition-all text-center
                          ${form.icon === icon.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="text-xl mb-1 block">{icon.icon}</span>
                        <span className="text-xs">{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="pt-4 border-t">
              <h2 className="text-lg font-semibold mb-4">Additional Settings</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="active"
                        checked={form.status === 'active'}
                        onChange={(e) => setForm({ ...form, status: e.target.value as 'active' })}
                        className="w-4 h-4 text-blue-600"
                        disabled={saving || success}
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="inactive"
                        checked={form.status === 'inactive'}
                        onChange={(e) => setForm({ ...form, status: e.target.value as 'inactive' })}
                        className="w-4 h-4 text-blue-600"
                        disabled={saving || success}
                      />
                      <span className="text-sm">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preview
                  </label>
                  <div className={`
                    p-3 rounded-lg border flex items-center gap-3
                    ${colorOptions.find(c => c.value === form.color)?.light || 'bg-gray-100'}
                  `}>
                    <span className="text-xl">
                      {iconOptions.find(i => i.value === form.icon)?.icon || '📁'}
                    </span>
                    <div>
                      <p className="font-medium">{form.name || 'Category Name'}</p>
                      <p className="text-xs opacity-75">{form.code || 'CODE'}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Internal Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any internal notes about this category..."
                    disabled={saving || success}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t flex items-center justify-end gap-3">
            <Link
              href={`/admin/estimator/library/category/${categoryId}`}
              className="px-6 py-2 border rounded-lg hover:bg-white transition"
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {Object.values(touched).some(Boolean) && !isValid && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-700 font-medium mb-2">Please fix the following:</p>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {!form.name && <li>Category name is required</li>}
                {form.name && errors.name && <li>{errors.name}</li>}
                {form.code && errors.code && <li>{errors.code}</li>}
                {!hasChanges && <li>No changes detected</li>}
              </ul>
            </div>
          )}
        </form>

        {/* Danger Zone */}
        <div className="mt-8 border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete this category</p>
                <p className="text-sm text-gray-500 mt-1">
                  Once deleted, this category cannot be recovered. Items in this category will be uncategorized.
                </p>
              </div>
              <Link
                href={`/admin/estimator/library/category/${categoryId}/delete`}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Category
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
