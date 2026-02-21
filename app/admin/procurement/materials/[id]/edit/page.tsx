'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Package, 
  Tag, 
  Box,
  DollarSign,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Type,
  Info,
  RefreshCcw
} from 'lucide-react'

interface Material {
  material_id: string
  material_code: string
  material_name: string
  spesifikasi?: string
  category?: string
  material_type?: string
  unit: string
  default_price?: number
  last_price?: number
  min_stock?: number
  location?: string
  status: 'ACTIVE' | 'INACTIVE'
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  keterangan?: string
}

export default function EditMaterialPage() {
  const router = useRouter()
  const params = useParams()
  const material_id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    material_code: '',
    material_name: '',
    spesifikasi: '',
    category: '',
    material_type: '',
    unit: '',
    default_price: '',
    min_stock: '',
    location: '',
    keterangan: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [checkingCode, setCheckingCode] = useState(false)
  const [codeExists, setCodeExists] = useState(false)
  const [originalCode, setOriginalCode] = useState('')

  // Validation functions
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'material_code':
        if (!value) return 'Material code is required'
        if (value.length < 3) return 'Minimal 3 karakter'
        if (codeExists && value !== originalCode) return 'Material code already exists'
        return null
      case 'material_name':
        if (!value) return 'Material name is required'
        if (value.length < 3) return 'Minimal 3 karakter'
        return null
      case 'unit':
        if (!value) return 'Unit is required'
        return null
      case 'default_price':
        if (value && Number(value) < 0) return 'Price cannot be negative'
        return null
      case 'min_stock':
        if (value && Number(value) < 0) return 'Min stock cannot be negative'
        return null
      default:
        return null
    }
  }

  // Fetch material data
  useEffect(() => {
    fetchMaterial()
  }, [material_id])

  async function fetchMaterial() {
    try {
      setLoading(true)
      setFetchError(null)

      const res = await fetch(`/api/procurement/materials/${material_id}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load material')
      }

      const material = data.data
      
      // Set form dengan data yang ada
      setForm({
        material_code: material.material_code || '',
        material_name: material.material_name || '',
        spesifikasi: material.spesifikasi || '',
        category: material.category || '',
        material_type: material.material_type || '',
        unit: material.unit || '',
        default_price: material.default_price?.toString() || '',
        min_stock: material.min_stock?.toString() || '',
        location: material.location || '',
        keterangan: material.keterangan || '',
        status: material.status,
      })

      setOriginalCode(material.material_code)

    } catch (err: any) {
      console.error('Fetch error:', err)
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Check duplicate material code
  const checkMaterialCode = async (code: string) => {
    if (code.length < 3 || code === originalCode) {
      setCodeExists(false)
      return
    }

    setCheckingCode(true)
    try {
      const res = await fetch(`/api/procurement/materials?search=${code}`)
      const data = await res.json()
      
      if (data.success) {
        const exists = data.data.some(
          (m: any) => m.material_code?.toLowerCase() === code.toLowerCase()
        )
        setCodeExists(exists)
      }
    } catch (err) {
      console.error('Failed to check material code:', err)
    } finally {
      setCheckingCode(false)
    }
  }

  // Debounced code check
  const codeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCodeChange = (code: string) => {
    setForm({ ...form, material_code: code })
    setTouched({ ...touched, material_code: true })

    if (codeTimer.current) {
      clearTimeout(codeTimer.current)
    }

    codeTimer.current = setTimeout(() => {
      checkMaterialCode(code)
    }, 500)
  }

  // Form validation
  const errors = {
    material_code: validateField('material_code', form.material_code),
    material_name: validateField('material_name', form.material_name),
    unit: validateField('unit', form.unit),
    default_price: validateField('default_price', form.default_price),
    min_stock: validateField('min_stock', form.min_stock),
  }

  const hasErrors = Object.values(errors).some(err => err !== null)
  const isValid = !hasErrors && 
    form.material_code && 
    form.material_name && 
    form.unit && 
    !(codeExists && form.material_code !== originalCode)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      setTouched({
        material_code: true,
        material_name: true,
        unit: true,
        default_price: true,
        min_stock: true,
      })
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        material_code: form.material_code,
        material_name: form.material_name,
        spesifikasi: form.spesifikasi || undefined,
        category: form.category || undefined,
        material_type: form.material_type || undefined,
        unit: form.unit,
        default_price: form.default_price !== '' ? Number(form.default_price) : undefined,
        min_stock: form.min_stock !== '' ? Number(form.min_stock) : undefined,
        location: form.location || undefined,
        keterangan: form.keterangan || undefined,
        status: form.status,
        updated_by: 'SYSTEM',
      }

      const res = await fetch(`/api/procurement/materials/${material_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update material')
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/admin/procurement/materials/${material_id}`)
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
                onClick={fetchMaterial}
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
            href={`/admin/procurement/materials/${material_id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Material Details
          </Link>
          
          <h1 className="text-2xl font-bold">Edit Material</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update material information
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Material updated successfully!</p>
              <p className="text-sm text-green-700">Redirecting to material details...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to update material</p>
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

          {/* Basic Information */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Material Code */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Material Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.material_code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onBlur={() => handleBlur('material_code')}
                    className={`
                      w-full px-4 py-2 border rounded-lg pr-10
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${touched.material_code && errors.material_code ? 'border-red-500 bg-red-50' : ''}
                      ${touched.material_code && !errors.material_code && form.material_code ? 'border-green-500 bg-green-50' : ''}
                    `}
                    placeholder="MAT-001"
                    maxLength={20}
                    disabled={saving || success}
                  />
                  {touched.material_code && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingCode ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      ) : errors.material_code ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : form.material_code && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.material_code && errors.material_code && (
                  <p className="text-xs text-red-600 mt-1">{errors.material_code}</p>
                )}
                {touched.material_code && !errors.material_code && form.material_code && !codeExists && (
                  <p className="text-xs text-green-600 mt-1">✓ Material code available</p>
                )}
              </div>

              {/* Material Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.material_name}
                  onChange={(e) => setForm({ ...form, material_name: e.target.value })}
                  onBlur={() => handleBlur('material_name')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.material_name && errors.material_name ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="Semen 50kg"
                  disabled={saving || success}
                />
                {touched.material_name && errors.material_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.material_name}</p>
                )}
              </div>

              {/* Spesifikasi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <FileText size={14} className="inline mr-1 text-gray-400" />
                  Spesifikasi
                </label>
                <textarea
                  value={form.spesifikasi}
                  onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Technical specifications, dimensions, etc."
                  disabled={saving || success}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tag size={14} className="inline mr-1 text-gray-400" />
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Building Materials"
                  disabled={saving || success}
                />
              </div>

              {/* Material Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Type size={14} className="inline mr-1 text-gray-400" />
                  Material Type
                </label>
                <input
                  type="text"
                  value={form.material_type}
                  onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Raw Material, Finished Good, etc."
                  disabled={saving || success}
                />
              </div>

              {/* Unit */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    onBlur={() => handleBlur('unit')}
                    className={`
                      w-full px-4 py-2 border rounded-lg bg-white appearance-none
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${touched.unit && errors.unit ? 'border-red-500 bg-red-50' : ''}
                      ${touched.unit && !errors.unit && form.unit ? 'border-green-500 bg-green-50' : ''}
                    `}
                    disabled={saving || success}
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="m">Meter (m)</option>
                    <option value="m2">Meter Persegi (m²)</option>
                    <option value="m3">Meter Kubik (m³)</option>
                    <option value="liter">Liter (liter)</option>
                    <option value="roll">Roll (roll)</option>
                    <option value="sak">Sak (sak)</option>
                    <option value="set">Set (set)</option>
                    <option value="box">Box (box)</option>
                    <option value="unit">Unit (unit)</option>
                    <option value="buah">Buah (buah)</option>
                    <option value="lembar">Lembar (lembar)</option>
                    <option value="batang">Batang (batang)</option>
                    <option value="dus">Dus (dus)</option>
                  </select>

                  {/* Ikon validasi */}
                  {touched.unit && !errors.unit && form.unit && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                  )}
                  
                  {/* Ikon error */}
                  {touched.unit && errors.unit && (
                    <div className="absolute right-8 top-1/2 -translate-y-1/2">
                      <XCircle size={16} className="text-red-500" />
                    </div>
                  )}

                  {/* Arrow dropdown */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {touched.unit && errors.unit && (
                  <p className="text-xs text-red-600 mt-1">{errors.unit}</p>
                )}
                
                {touched.unit && !errors.unit && form.unit && (
                  <p className="text-xs text-green-600 mt-1">✓ Unit selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-600" />
              Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Default Price */}
              <div>
                <label className="block text-sm font-medium mb-1">Default Price</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={form.default_price}
                  onChange={(e) => setForm({ ...form, default_price: e.target.value })}
                  onBlur={() => handleBlur('default_price')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.default_price && errors.default_price ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="0"
                  disabled={saving || success}
                />
                {touched.default_price && errors.default_price && (
                  <p className="text-xs text-red-600 mt-1">{errors.default_price}</p>
                )}
              </div>

              {/* Min Stock */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Box size={14} className="inline mr-1 text-gray-400" />
                  Minimum Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.min_stock}
                  onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
                  onBlur={() => handleBlur('min_stock')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.min_stock && errors.min_stock ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="10"
                  disabled={saving || success}
                />
                {touched.min_stock && errors.min_stock && (
                  <p className="text-xs text-red-600 mt-1">{errors.min_stock}</p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <MapPin size={14} className="inline mr-1 text-gray-400" />
                  Storage Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Warehouse A - Rack 3"
                  disabled={saving || success}
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              Additional Information
            </h2>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium mb-1">Keterangan</label>
              <textarea
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes or remarks"
                disabled={saving || success}
              />
            </div>
          </div>

          {/* Status */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ACTIVE"
                  checked={form.status === 'ACTIVE'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' })}
                  className="w-4 h-4 text-blue-600"
                  disabled={saving || success}
                />
                <span className="text-sm">Active</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="INACTIVE"
                  checked={form.status === 'INACTIVE'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'INACTIVE' })}
                  className="w-4 h-4 text-blue-600"
                  disabled={saving || success}
                />
                <span className="text-sm">Inactive</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t flex items-center justify-end gap-3">
            <Link
              href={`/admin/procurement/materials/${material_id}`}
              className="px-4 py-2 border rounded-lg hover:bg-white transition"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
