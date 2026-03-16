"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"

// ========== TYPES ==========
type TerminStatus = "Draft" | "Submitted" | "Paid" | "Overdue"

type Termin = {
  project_id: string
  termin_no: number
  description: string
  percent: number
  value: number
  status: TerminStatus
  due_date: string | null
  paid_date: string | null
  created_at: string
}

// ========== CONSTANTS ==========
const STATUS_COLORS: Record<TerminStatus, { bg: string; text: string }> = {
  Draft: { bg: "bg-gray-100", text: "text-gray-800" },
  Submitted: { bg: "bg-blue-100", text: "text-blue-800" },
  Paid: { bg: "bg-green-100", text: "text-green-800" },
  Overdue: { bg: "bg-red-100", text: "text-red-800" },
}

// ========== MAIN COMPONENT ==========
export default function ProjectTerminPage() {
  const router = useRouter()
  const params = useParams()
  const project_id = params.project_id as string

  // States
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [termins, setTermins] = useState<Termin[]>([])
  const [totalPercent, setTotalPercent] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  
  const [form, setForm] = useState({
    termin_no: "",
    description: "",
    percent: "",
    value: "",
    due_date: "",
  })

  const [errors, setErrors] = useState({
    termin_no: "",
    percent: "",
    value: "",
    due_date: "",
  })

  const [touched, setTouched] = useState({
    termin_no: false,
    percent: false,
    value: false,
    due_date: false,
  })

  // ========== FETCH EXISTING TERMINS ==========
  useEffect(() => {
    const fetchTermins = async () => {
      try {
        setFetching(true)
        const res = await fetch(`/api/projects/${project_id}/termin`, {
  cache: "no-store"
})
        
        if (!res.ok) {
          throw new Error("Failed to fetch termins")
        }
        
        const data = await res.json()
        setTermins(data)
        
        // Calculate totals
        const percentSum = data.reduce((sum: number, t: Termin) => sum + t.percent, 0)
        const valueSum = data.reduce((sum: number, t: Termin) => sum + t.value, 0)
        setTotalPercent(percentSum)
        setTotalValue(valueSum)
        
      } catch (err) {
        toast.error("Gagal memuat data termin")
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    fetchTermins()
  }, [project_id])

  // ========== VALIDATION ==========
  const validateField = (name: string, value: string): string => {
    if (name === "termin_no") {
      if (!value) return "Termin number is required"
      const num = Number(value)
      if (isNaN(num) || num < 1) return "Must be a positive number"
      
      // Check for duplicate termin number
      const existing = termins.find(t => t.termin_no === num)
      if (existing) return `Termin #${num} already exists`
      
      return ""
    }
    
    if (name === "percent") {
      if (!value) return "Percent is required"
      const num = Number(value)
      if (isNaN(num) || num < 0) return "Must be a positive number"
      if (num > 100) return "Maximum is 100%"
      
      // Check total percent
      if (totalPercent + num > 100) {
        return `Total percent would exceed 100% (current: ${totalPercent}%)`
      }
      
      return ""
    }
    
    if (name === "value") {
      if (!value) return "Value is required"
      const num = Number(value)
      if (isNaN(num) || num < 0) return "Must be a positive number"
      return ""
    }
    
    if (name === "due_date") {
      if (value && isNaN(Date.parse(value))) {
        return "Invalid date format"
      }
      return ""
    }
    
    return ""
  }

  const validateForm = (): boolean => {
    const newErrors = {
      termin_no: validateField("termin_no", form.termin_no),
      percent: validateField("percent", form.percent),
      value: validateField("value", form.value),
      due_date: validateField("due_date", form.due_date),
    }
    
    setErrors(newErrors)
    
    return !Object.values(newErrors).some(error => error !== "")
  }

  // ========== HANDLERS ==========
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    // For number inputs, prevent negative values
    if (name === "percent" || name === "value" || name === "termin_no") {
      if (value.startsWith("-")) return
    }
    
    setForm(prev => ({ ...prev, [name]: value }))
    
    // Real-time validation if field has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target
    
    // Mark as touched
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Validate
    const error = validateField(name, form[name as keyof typeof form])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      termin_no: true,
      percent: true,
      value: true,
      due_date: true,
    })
    
    // Validate all fields
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }
    
    setLoading(true)

    try {
      const res = await fetch(`/api/projects/${project_id}/termin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          termin_no: Number(form.termin_no),
          description: form.description,
          percent: Number(form.percent),
          value: Number(form.value),
          due_date: form.due_date || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to create termin")
      }

      toast.success(`Termin #${form.termin_no} created successfully!`)
      
      // Small delay to show success message
      setTimeout(() => {
        router.push(`/admin/projects/${project_id}`)
        router.refresh()
      }, 1000)
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat termin")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // ========== LOADING STATE ==========
  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data termin...</p>
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
        }}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Termin Kontrak</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Termin</p>
              <p className="text-2xl font-bold text-gray-900">{termins.length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Progress</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{totalPercent}%</p>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(totalPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Nilai</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>

          {/* Existing Termins List */}
          {termins.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Termin</h2>
              
              <div className="space-y-3">
                {termins.map((termin) => (
                  <div 
                    key={termin.termin_no}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-700">#{termin.termin_no}</span>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">
                          {termin.description || `Termin ${termin.termin_no}`}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{termin.percent}%</span>
                          <span>•</span>
                          <span>{formatCurrency(termin.value)}</span>
                          <span>•</span>
                          <span>Due: {formatDate(termin.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[termin.status].bg} ${STATUS_COLORS[termin.status].text}`}>
                        {termin.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New Termin Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Termin Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termin Ke <span className="text-red-500">*</span>
                </label>
                <input
                  name="termin_no"
                  type="number"
                  min="1"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.termin_no && errors.termin_no ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  value={form.termin_no}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Contoh: 1, 2, 3"
                />
                {touched.termin_no && errors.termin_no && (
                  <p className="mt-1 text-xs text-red-600">{errors.termin_no}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Termin Progress 30% - Pekerjaan Struktur"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persentase (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="percent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${touched.percent && errors.percent ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    value={form.percent}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="0 - 100"
                  />
                  {touched.percent && errors.percent && (
                    <p className="mt-1 text-xs text-red-600">{errors.percent}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="value"
                    type="number"
                    min="0"
                    step="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${touched.value && errors.value ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    value={form.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Contoh: 50000000"
                  />
                  {touched.value && errors.value && (
                    <p className="mt-1 text-xs text-red-600">{errors.value}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jatuh Tempo
                </label>
                <input
                  name="due_date"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${touched.due_date && errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  value={form.due_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.due_date && errors.due_date && (
                  <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>
                )}
              </div>

              {/* Info: Sisa Progress */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Sisa progress yang bisa ditambahkan: <strong>{100 - totalPercent}%</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Tambah Termin</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
            </div>
    </>
  )
}        

