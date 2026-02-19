'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  XCircle
} from 'lucide-react'

import Money from '@/components/dashboard/procurement/Money'

export default function CreateMaterialPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    material_code: '',
    material_name: '',
    category: '',
    unit: '',
    default_price: '',
    min_stock: '',
    location: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [checkingCode, setCheckingCode] = useState(false)
  const [codeExists, setCodeExists] = useState(false)

  // Validation functions
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'material_code':
        if (!value) return 'Material code is required'
        if (value.length < 3) return 'Minimal 3 karakter'
        if (codeExists) return 'Material code already exists'
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

  // Check duplicate material code
  const checkMaterialCode = async (code: string) => {
    if (code.length < 3) {
      setCodeExists(false)
      return
    }

    setCheckingCode(true)
    try {
      const res = await fetch(`/api/procurement/materials?search=${code}`)
      const data = await res.json()
      
      if (data.success) {
        const exists = data.data.some(
          (m: any) => m.material_code.toLowerCase() === code.toLowerCase()
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
  const handleCodeChange = (code: string) => {
    setForm({ ...form, material_code: code })
    setTouched({ ...touched, material_code: true })
    
    const timer = setTimeout(() => {
      checkMaterialCode(code)
    }, 500)

    return () => clearTimeout(timer)
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
    !codeExists

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

    setLoading(true)
    setError(null)

    try {
      const payload = {
        ...form,
        default_price: form.default_price ? Number(form.default_price) : undefined,
        min_stock: form.min_stock ? Number(form.min_stock) : undefined,
      }

      const res = await fetch('/api/procurement/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create material')
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/admin/procurement/materials/${data.data.material_id}`)
      }, 1500)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/procurement/materials"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Materials
          </Link>
          
          <h1 className="text-2xl font-bold">Create New Material</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new material/item to the master list
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Material created successfully!</p>
              <p className="text-sm text-green-700">Redirecting to material details...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to create material</p>
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
                    disabled={loading || success}
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
                  disabled={loading || success}
                />
                {touched.material_name && errors.material_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.material_name}</p>
                )}
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
                  disabled={loading || success}
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  onBlur={() => handleBlur('unit')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.unit && errors.unit ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="kg, pcs, m3"
                  disabled={loading || success}
                />
                {touched.unit && errors.unit && (
                  <p className="text-xs text-red-600 mt-1">{errors.unit}</p>
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
                  disabled={loading || success}
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
                  disabled={loading || success}
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
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ACTIVE"
                  checked={form.status === 'ACTIVE'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' })}
                  className="w-4 h-4 text-blue-600"
                  disabled={loading || success}
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
                  disabled={loading || success}
                />
                <span className="text-sm">Inactive</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 bg-gray-50 border-t flex items-center justify-end gap-3">
            <Link
              href="/admin/procurement/materials"
              className="px-4 py-2 border rounded-lg hover:bg-white transition"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={loading || success || !isValid}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Material
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {Object.values(touched).some(Boolean) && !isValid && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-700 font-medium mb-2">Please fix the following:</p>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {!form.material_code && <li>Material code is required</li>}
                {form.material_code && codeExists && <li>Material code already exists</li>}
                {!form.material_name && <li>Material name is required</li>}
                {!form.unit && <li>Unit is required</li>}
                {form.default_price && Number(form.default_price) < 0 && <li>Price cannot be negative</li>}
                {form.min_stock && Number(form.min_stock) < 0 && <li>Min stock cannot be negative</li>}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
