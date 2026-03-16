// app/admin/projects/[project_id]/material-request/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"

// ========== TYPES ==========
type MaterialItem = {
  id: string
  material_name: string
  qty: number | ""
  unit: string
  remark: string
}

type FormData = {
  project_name: string
  requested_by: string
  items: MaterialItem[]
}

// ========== CONSTANTS ==========
const UNITS = [
  "pcs", "unit", "set", "box", "dus", "sak", 
  "kg", "gram", "ton", "meter", "cm", "liter",
  "batang", "lembar", "roll", "galon"
]

// ========== MAIN COMPONENT ==========
export default function NewMaterialRequestPage() {
  const router = useRouter()
  const params = useParams()
  const project_id = params.project_id as string

  // States
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState<FormData>({
    project_name: "",
    requested_by: "",
    items: [
      {
        id: crypto.randomUUID(),
        material_name: "",
        qty: "",
        unit: "pcs",
        remark: ""
      }
    ]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // ========== FETCH PROJECT DATA ==========
  useEffect(() => {
  const fetchProject = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/projects/${project_id}`)
      if (res.ok) {
        const project = await res.json()
        setForm(prev => ({
          ...prev,
          project_name: project.name || ""
        }))
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
    } finally {
      setLoading(false)
    }
  }

  fetchProject()
}, [project_id])

  // ========== VALIDATION ==========
  const validateField = (name: string, value: any): string => {
    if (name === "project_name") {
      if (!value) return "Project name is required"
      if (value.length > 200) return "Project name too long"
      return ""
    }

    if (name === "requested_by") {
      if (!value) return "Requested by is required"
      if (value.length > 100) return "Name too long"
      return ""
    }

    if (name.includes("material_name")) {
      if (!value) return "Material name is required"
      if (value.length > 200) return "Material name too long"
      return ""
    }

    if (name.includes("qty")) {
      if (value === "") return "Quantity is required"
      const num = Number(value)
      if (isNaN(num) || num <= 0) return "Must be a positive number"
      if (num > 1000000) return "Quantity too large (max 1,000,000)"
      return ""
    }

    if (name.includes("unit")) {
      if (!value) return "Unit is required"
      return ""
    }

    return ""
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate main fields
    newErrors.project_name = validateField("project_name", form.project_name)
    newErrors.requested_by = validateField("requested_by", form.requested_by)

    // Validate items
    form.items.forEach((item, index) => {
      newErrors[`items.${index}.material_name`] = validateField(
        "material_name", 
        item.material_name
      )
      newErrors[`items.${index}.qty`] = validateField(
        "qty", 
        item.qty
      )
      newErrors[`items.${index}.unit`] = validateField(
        "unit", 
        item.unit
      )
    })

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  // ========== HANDLERS ==========
  const handleMainFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleItemChange = (
    index: number,
    field: keyof MaterialItem,
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))

    const fieldName = `items.${index}.${field}`
    if (touched[fieldName]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }

  const handleBlur = (
    name: string,
    value: any,
    fieldType: string
  ) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(fieldType, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          material_name: "",
          qty: "",
          unit: "pcs",
          remark: ""
        }
      ]
    }))
  }

  const removeItem = (index: number) => {
    if (form.items.length <= 1) {
      toast.error("Minimal 1 item harus diisi")
      return
    }

    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))

    // Clean up errors for removed item
    const newErrors = { ...errors }
    ;["material_name", "qty", "unit", "remark"].forEach(field => {
      delete newErrors[`items.${index}.${field}`]
    })
    setErrors(newErrors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {
      project_name: true,
      requested_by: true
    }
    form.items.forEach((_, index) => {
      allTouched[`items.${index}.material_name`] = true
      allTouched[`items.${index}.qty`] = true
      allTouched[`items.${index}.unit`] = true
    })
    setTouched(allTouched)

    // Validate form
    if (!validateForm()) {
      toast.error("Mohon lengkapi semua field dengan benar")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/projects/${project_id}/material-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id,
          project_name: form.project_name,
          requested_by: form.requested_by,
          items: form.items.map(item => ({
            material_name: item.material_name,
            qty: Number(item.qty),
            unit: item.unit,
            remark: item.remark || undefined
          }))
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create request")
      }

      toast.success(
        <div>
          <p className="font-medium">Material Request Created!</p>
          <p className="text-xs opacity-90">No: {data.data.request_no}</p>
        </div>,
        { duration: 5000 }
      )

      // Redirect after success
      setTimeout(() => {
        router.push(`/admin/projects/${project_id}/material-request`)
        router.refresh()
      }, 1500)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat request")
    } finally {
      setSubmitting(false)
    }
  }

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data project...</p>
        </div>
      </div>
    )
  }

  // ========== RENDER ==========
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            icon: '✅',
          },
          error: {
            duration: 4000,
            icon: '❌',
          },
        }}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Material Request</h1>
              <p className="text-sm text-gray-500">Buat permintaan material baru</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Project Info Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Informasi Project
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project ID (readonly) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      value={project_id}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 text-sm"
                    />
                  </div>

                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Project <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="project_name"
                      value={form.project_name}
                      onChange={handleMainFieldChange}
                      onBlur={(e) => handleBlur("project_name", e.target.value, "project_name")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${touched.project_name && errors.project_name 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'}`}
                      placeholder="Nama project..."
                    />
                    {touched.project_name && errors.project_name && (
                      <p className="mt-1 text-xs text-red-600">{errors.project_name}</p>
                    )}
                  </div>

                  {/* Requested By */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diminta Oleh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="requested_by"
                      value={form.requested_by}
                      onChange={handleMainFieldChange}
                      onBlur={(e) => handleBlur("requested_by", e.target.value, "requested_by")}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${touched.requested_by && errors.requested_by 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'}`}
                      placeholder="Nama peminta..."
                    />
                    {touched.requested_by && errors.requested_by && (
                      <p className="mt-1 text-xs text-red-600">{errors.requested_by}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Daftar Material
                  </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Item
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative"
                    >
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Hapus item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        {/* Material Name */}
                        <div className="md:col-span-5">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Nama Material <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.material_name}
                            onChange={(e) => handleItemChange(index, "material_name", e.target.value)}
                            onBlur={(e) => handleBlur(
                              `items.${index}.material_name`,
                              e.target.value,
                              "material_name"
                            )}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                              ${touched[`items.${index}.material_name`] && errors[`items.${index}.material_name`]
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'}`}
                            placeholder="Nama material..."
                          />
                          {touched[`items.${index}.material_name`] && errors[`items.${index}.material_name`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.material_name`]}</p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Qty <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                            onBlur={(e) => handleBlur(
                              `items.${index}.qty`,
                              e.target.value,
                              "qty"
                            )}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                              ${touched[`items.${index}.qty`] && errors[`items.${index}.qty`]
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'}`}
                            placeholder="0"
                          />
                          {touched[`items.${index}.qty`] && errors[`items.${index}.qty`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.qty`]}</p>
                          )}
                        </div>

                        {/* Unit */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                            onBlur={(e) => handleBlur(
                              `items.${index}.unit`,
                              e.target.value,
                              "unit"
                            )}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                              ${touched[`items.${index}.unit`] && errors[`items.${index}.unit`]
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'}`}
                          >
                            {UNITS.map(unit => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                          {touched[`items.${index}.unit`] && errors[`items.${index}.unit`] && (
                            <p className="mt-1 text-xs text-red-600">{errors[`items.${index}.unit`]}</p>
                          )}
                        </div>

                        {/* Remark */}
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Keterangan
                          </label>
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(e) => handleItemChange(index, "remark", e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Items Summary */}
                {form.items.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Ringkasan:</span>
                      <span>{form.items.length} item(s)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      <span>Membuat Request...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Buat Material Request</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>

          {/* Info Note */}
          <div className="mt-4 text-xs text-gray-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Field dengan tanda <span className="text-red-500">*</span> wajib diisi</span>
          </div>
        </div>
      </div>
    </>
  )
}
