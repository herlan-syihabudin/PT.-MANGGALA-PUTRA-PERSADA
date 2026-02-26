'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save,
  FolderTree,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Plus,
  X,
  Hash,
  GitBranch
} from 'lucide-react'
import { toast } from 'sonner'

// ============ TYPES ============
type Category = {
  category_id: string
  name: string
  code: string
  description: string | null
  parent_id: string | null
  level: number
  path: string
  color: string
  icon: string
  status: 'active' | 'inactive'
  notes: string | null
  created_at: string
}

type ParentCategory = {
  category_id: string
  name: string
  level: number
  path: string
}

// ============ HELPERS ============
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateCode(name: string): string {
  return name
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// ============ MAIN COMPONENT ============
export default function NewCategoryPage() {
  const router = useRouter()

  // States
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([])
  const [loadingParents, setLoadingParents] = useState(true)

  // Form state
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    parent_id: '',
    color: 'blue',
    icon: 'folder',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  })

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [codeExists, setCodeExists] = useState(false)
  const [checkingCode, setCheckingCode] = useState(false)

  // ============ FETCH PARENT CATEGORIES ============
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await fetch('/api/estimator/library/categories?parentOnly=true&status=active')
        if (!res.ok) throw new Error('Failed to fetch parent categories')
        const data = await res.json()
        setParentCategories(data.categories || [])
      } catch (err) {
        console.error('Error fetching parents:', err)
        toast.error('Gagal memuat daftar kategori induk')
      } finally {
        setLoadingParents(false)
      }
    }

    fetchParents()
  }, [])

  // ============ CHECK CODE EXISTENCE ============
  useEffect(() => {
    const checkCode = async () => {
      if (!form.code || form.code.length < 2) {
        setCodeExists(false)
        return
      }

      setCheckingCode(true)
      try {
        const res = await fetch(`/api/estimator/library/categories/check-code?code=${encodeURIComponent(form.code)}`)
        const data = await res.json()
        setCodeExists(data.exists)
      } catch (err) {
        console.error('Error checking code:', err)
      } finally {
        setCheckingCode(false)
      }
    }

    const timeout = setTimeout(checkCode, 500)
    return () => clearTimeout(timeout)
  }, [form.code])

  // ============ VALIDATION ============
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value) return 'Category name is required'
        if (value.length < 3) return 'Minimal 3 characters'
        if (value.length > 50) return 'Maximum 50 characters'
        return null
      case 'code':
        if (!value) return null // Code is optional
        if (value.length < 2) return 'Minimal 2 characters'
        if (value.length > 20) return 'Maximum 20 characters'
        if (!/^[A-Z0-9_-]+$/.test(value)) {
          return 'Code must be uppercase letters, numbers, underscore or hyphen'
        }
        if (codeExists) return 'Code already exists'
        return null
      default:
        return null
    }
  }

  const errors = {
    name: validateField('name', form.name),
    code: validateField('code', form.code)
  }

  const isValid = Boolean(
    form.name &&
    !errors.name &&
    !errors.code &&
    !codeExists
  )

  // ============ AUTO GENERATE SLUG & CODE ============
  useEffect(() => {
    if (form.name && !touched.code) {
      setForm(prev => ({
        ...prev,
        code: generateCode(form.name)
      }))
    }
  }, [form.name, touched.code])

  // ============ HANDLE GENERATE CODE ============
  const handleGenerateCode = () => {
    if (!form.name) {
      toast.error('Please enter category name first')
      return
    }
    const newCode = generateCode(form.name)
    setForm(prev => ({ ...prev, code: newCode }))
    setTouched(prev => ({ ...prev, code: true }))
  }

  // ============ HANDLE SUBMIT ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setTouched(prev => ({ ...prev, name: true, code: true }))
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Hitung level dan path berdasarkan parent_id
      let level = 0
      let path = ''
      
      if (form.parent_id) {
        const parent = parentCategories.find(p => p.category_id === form.parent_id)
        if (parent) {
          level = parent.level + 1
          path = parent.path ? `${parent.path}/${form.code || generateSlug(form.name)}` : form.code || generateSlug(form.name)
        }
      } else {
        path = form.code || generateSlug(form.name)
      }

      const payload = {
        name: form.name,
        code: form.code || generateCode(form.name),
        slug: generateSlug(form.name),
        description: form.description || null,
        parent_id: form.parent_id || null,
        level,
        path,
        color: form.color,
        icon: form.icon,
        status: form.status,
        notes: form.notes || null
      }

      console.log('Submitting category:', payload)

      const res = await fetch('/api/estimator/library/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create category')
      }

      const result = await res.json()
      
      toast.success('Category created successfully!')
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/admin/estimator/library/category')
        router.refresh()
      }, 1500)

    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ============ UI ============
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

  const selectedParent = parentCategories.find(p => p.category_id === form.parent_id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/estimator/library/category"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Categories
          </Link>
          
          <h1 className="text-2xl font-bold">Create New Category</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new category to organize your work items
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Category created successfully!</p>
              <p className="text-sm text-green-700">Redirecting to categories list...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to create category</p>
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
                  <p className="text-xs text-gray-400 mt-1">
                    Slug: <span className="font-mono">{generateSlug(form.name) || '-'}</span>
                  </p>
                </div>

                {/* Category Code */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Category Code
                    <span className="text-xs text-gray-400 ml-2">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        onBlur={() => handleBlur('code')}
                        className={`
                          w-full px-4 py-2 border rounded-lg pr-10
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          ${touched.code && (errors.code || codeExists) ? 'border-red-500 bg-red-50' : ''}
                          ${touched.code && !errors.code && !codeExists && form.code ? 'border-green-500 bg-green-50' : ''}
                        `}
                        placeholder="DINDING_01"
                        maxLength={20}
                        disabled={saving || success}
                      />
                      {checkingCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                        </div>
                      )}
                      {!checkingCode && form.code && touched.code && !errors.code && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {codeExists ? (
                            <X size={16} className="text-red-500" />
                          ) : (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap"
                      disabled={!form.name || saving || success}
                    >
                      Generate
                    </button>
                  </div>
                  {touched.code && errors.code && (
                    <p className="text-xs text-red-600 mt-1">{errors.code}</p>
                  )}
                  {touched.code && !errors.code && codeExists && (
                    <p className="text-xs text-red-600 mt-1">Code already exists, please use another</p>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parent Category
                    <span className="text-xs text-gray-400 ml-2">(optional)</span>
                  </label>
                  {loadingParents ? (
                    <div className="flex items-center gap-2 p-4 border rounded-lg bg-gray-50">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                      <span className="text-sm text-gray-500">Loading parent categories...</span>
                    </div>
                  ) : (
                    <select
                      value={form.parent_id}
                      onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving || success}
                    >
                      <option value="">None (Root Category)</option>
                      {parentCategories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {'  '.repeat(cat.level)}{cat.level > 0 && '└ '}{cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Leave empty to create a top-level category
                  </p>
                </div>

                {/* Hierarchy Preview */}
                {selectedParent && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-xs font-medium text-blue-700 mb-2 flex items-center gap-1">
                      <GitBranch size={12} />
                      Hierarchy Preview
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">Level:</span>
                        <span className="font-mono">{selectedParent.level + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">Path:</span>
                        <span className="font-mono text-xs">
                          {selectedParent.path ? `${selectedParent.path}/` : ''}{form.code || generateSlug(form.name) || '[slug]'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
              href="/admin/estimator/library/category"
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
                  Creating Category...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Category
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
                {errors.code && <li>{errors.code}</li>}
                {!errors.code && codeExists && <li>Code already exists, please use another</li>}
              </ul>
            </div>
          )}
        </form>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Tips for organizing categories
          </h3>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Create top-level categories for major divisions (Struktur, Finishing, MEP)</li>
            <li>Use subcategories for specific areas (Dinding, Lantai, Plumbing)</li>
            <li>Consistent naming helps with search and filtering</li>
            <li>Assign colors to make categories visually distinct</li>
            <li>Inactive categories won't appear in job/item selection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper functions untuk handleBlur
const handleBlur = (field: string) => {
  setTouched(prev => ({ ...prev, [field]: true }))
}
