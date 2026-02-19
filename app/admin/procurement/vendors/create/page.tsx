'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function CreateVendorPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    vendor_code: '',
    vendor_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    bank_name: '',
    bank_account: '',
    npwp: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [checkingCode, setCheckingCode] = useState(false)
  const [codeExists, setCodeExists] = useState(false)

  // Validation functions
  const isValidEmail = (email: string) => {
    if (!email) return true // optional
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'vendor_code':
        if (!value) return 'Vendor code is required'
        if (value.length < 3) return 'Minimal 3 karakter'
        if (codeExists) return 'Vendor code already exists'
        return null
      case 'vendor_name':
        if (!value) return 'Vendor name is required'
        if (value.length < 3) return 'Minimal 3 karakter'
        return null
      case 'email':
        if (value && !isValidEmail(value)) return 'Invalid email format'
        return null
      case 'phone':
        if (value && !/^[0-9+\-\s]+$/.test(value)) return 'Invalid phone format'
        return null
      default:
        return null
    }
  }

  // Check duplicate vendor code
  const checkVendorCode = async (code: string) => {
    if (code.length < 3) {
      setCodeExists(false)
      return
    }

    setCheckingCode(true)
    try {
      const res = await fetch(`/api/procurement/vendors?search=${code}`)
      const data = await res.json()
      
      if (data.success) {
        const exists = data.data.some(
          (v: any) => v.vendor_code.toLowerCase() === code.toLowerCase()
        )
        setCodeExists(exists)
      }
    } catch (err) {
      console.error('Failed to check vendor code:', err)
    } finally {
      setCheckingCode(false)
    }
  }

  // Debounced code check
  const handleCodeChange = (code: string) => {
    setForm({ ...form, vendor_code: code })
    setTouched({ ...touched, vendor_code: true })
    
    const timer = setTimeout(() => {
      checkVendorCode(code)
    }, 500)

    return () => clearTimeout(timer)
  }

  // Form validation
  const errors = {
    vendor_code: validateField('vendor_code', form.vendor_code),
    vendor_name: validateField('vendor_name', form.vendor_name),
    email: validateField('email', form.email),
    phone: validateField('phone', form.phone),
  }

  const hasErrors = Object.values(errors).some(err => err !== null)
  const isTouched = Object.values(touched).some(t => t)
  const isValid = !hasErrors && 
    form.vendor_code && 
    form.vendor_name && 
    !codeExists

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid) {
      // Mark all fields as touched to show errors
      setTouched({
        vendor_code: true,
        vendor_name: true,
        email: true,
        phone: true,
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/procurement/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create vendor')
      }

      setSuccess(true)
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/admin/procurement/vendors/${data.data.vendor_id}`)
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
            href="/admin/procurement/vendors"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Vendors
          </Link>
          
          <h1 className="text-2xl font-bold">Create New Vendor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new supplier/vendor to the system
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-green-800">Vendor created successfully!</p>
              <p className="text-sm text-green-700">Redirecting to vendor details...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-800">Failed to create vendor</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          
          {/* Required Fields Notice */}
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Note:</span> Fields marked with * are required
            </p>
          </div>

          {/* Basic Information */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Vendor Code */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Vendor Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.vendor_code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onBlur={() => handleBlur('vendor_code')}
                    className={`
                      w-full px-4 py-2 border rounded-lg pr-10
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${touched.vendor_code && errors.vendor_code ? 'border-red-500 bg-red-50' : ''}
                      ${touched.vendor_code && !errors.vendor_code && form.vendor_code ? 'border-green-500 bg-green-50' : ''}
                    `}
                    placeholder="VEN-001"
                    maxLength={20}
                    disabled={loading || success}
                  />
                  {touched.vendor_code && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {checkingCode ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      ) : errors.vendor_code ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : form.vendor_code && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {touched.vendor_code && errors.vendor_code && (
                  <p className="text-xs text-red-600 mt-1">{errors.vendor_code}</p>
                )}
                {touched.vendor_code && !errors.vendor_code && form.vendor_code && !codeExists && (
                  <p className="text-xs text-green-600 mt-1">✓ Vendor code available</p>
                )}
              </div>

              {/* Vendor Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.vendor_name}
                  onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                  onBlur={() => handleBlur('vendor_name')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.vendor_name && errors.vendor_name ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="PT Supplier Maju"
                  disabled={loading || success}
                />
                {touched.vendor_name && errors.vendor_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.vendor_name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone size={14} className="inline mr-1 text-gray-400" />
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  onBlur={() => handleBlur('phone')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.phone && errors.phone ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="021-555-1234"
                  disabled={loading || success}
                />
                {touched.phone && errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Mail size={14} className="inline mr-1 text-gray-400" />
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onBlur={() => handleBlur('email')}
                  className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.email && errors.email ? 'border-red-500 bg-red-50' : ''}
                  `}
                  placeholder="contact@supplier.com"
                  disabled={loading || success}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" />
              Address Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jl. Sudirman No. 123"
                  disabled={loading || success}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jakarta"
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>

          {/* Bank & Tax Information */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-blue-600" />
              Bank & Tax Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="BCA"
                  disabled={loading || success}
                />
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium mb-1">Account Number</label>
                <input
                  type="text"
                  value={form.bank_account}
                  onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234567890"
                  disabled={loading || success}
                />
              </div>

              {/* NPWP */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  <FileText size={14} className="inline mr-1 text-gray-400" />
                  NPWP
                </label>
                <input
                  type="text"
                  value={form.npwp}
                  onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="01.234.567.8-123.000"
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
              href="/admin/procurement/vendors"
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
                  Create Vendor
                </>
              )}
            </button>
          </div>

          {/* Validation Summary */}
          {isTouched && !isValid && (
            <div className="p-4 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-700 font-medium mb-2">Please fix the following:</p>
              <ul className="text-xs text-red-600 list-disc list-inside">
                {!form.vendor_code && <li>Vendor code is required</li>}
                {form.vendor_code && codeExists && <li>Vendor code already exists</li>}
                {!form.vendor_name && <li>Vendor name is required</li>}
                {form.email && !isValidEmail(form.email) && <li>Invalid email format</li>}
                {form.phone && !/^[0-9+\-\s]+$/.test(form.phone) && <li>Invalid phone format</li>}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
