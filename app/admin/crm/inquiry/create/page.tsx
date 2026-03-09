"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

type Customer = {
  customer_id: string
  company_name: string
  email: string | null
  phone: string | null
}

type Employee = {
  employee_id: string
  nama_lengkap: string
  email: string | null
  department: string | null
  jabatan?: string // Tambahkan field jabatan
}

// Map untuk Tailwind classes - CLEAN FLAT COLORS
const SERVICE_COLORS = {
  civil: "bg-blue-600",
  steel: "bg-indigo-600",
  mechanical: "bg-amber-600",
  electrical: "bg-yellow-600",
  plumbing: "bg-cyan-600",
  interior: "bg-purple-600",
  maintenance: "bg-orange-600",
  design: "bg-emerald-600",
} as const

const SERVICE_BG_LIGHT = {
  civil: "bg-blue-50",
  steel: "bg-indigo-50",
  mechanical: "bg-amber-50",
  electrical: "bg-yellow-50",
  plumbing: "bg-cyan-50",
  interior: "bg-purple-50",
  maintenance: "bg-orange-50",
  design: "bg-emerald-50",
} as const

const PRIORITY_COLORS = {
  normal: "bg-gray-600",
  high: "bg-rose-600",
  urgent: "bg-red-600",
} as const

const PRIORITY_BG_LIGHT = {
  normal: "bg-gray-50",
  high: "bg-rose-50",
  urgent: "bg-red-50",
} as const

const PRIORITY_TEXT = {
  normal: "text-gray-700",
  high: "text-rose-700",
  urgent: "text-red-700",
} as const

const SERVICE_OPTIONS = [
  { id: "civil", label: "Civil & Structure", color: "blue" },
  { id: "steel", label: "Steel Structure", color: "indigo" },
  { id: "mechanical", label: "Mechanical", color: "amber" },
  { id: "electrical", label: "Electrical", color: "yellow" },
  { id: "plumbing", label: "Plumbing", color: "cyan" },
  { id: "interior", label: "Interior", color: "purple" },
  { id: "maintenance", label: "Maintenance", color: "orange" },
  { id: "design", label: "Design Only", color: "emerald" },
] as const

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const

const ESTIMATION_COMMISSION_RATE = 0.05 // 5%

// Sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/[{}]/g, "")
    .trim()
}

// Generate ID dengan fallback
const generateRequestId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return uuidv4()
}

export default function CreateInquiryPage() {
  const router = useRouter()

  // State Management
  const [customers, setCustomers] = useState<Customer[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null)

  // Form State
  const [estimasiDisplay, setEstimasiDisplay] = useState("")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    nama_pekerjaan: "",
    estimasi_nilai: 0,
    sumber: "",
    assigned_to: "",
    prioritas: "normal" as "normal" | "high" | "urgent",
    lokasi: "",
    catatan: "",
    tanggal_masuk: new Date().toISOString().slice(0, 10),
  })

  // Mock auth - ganti dengan auth context real
  const user = useMemo(() => ({
  id: "current-user-id",
  email: "user@company.com"
}), [])

  /* ========== LOAD DATA with Caching ========== */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Abort previous request if any
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        const controller = new AbortController()
        abortControllerRef.current = controller

        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const [custRes, empRes] = await Promise.all([
          fetch("/api/crm/customers?active=true", { 
            signal: controller.signal,
            next: { revalidate: 300 }
          }),
          fetch("/api/hr/employees?active_only=true", {
            signal: controller.signal,
            next: { revalidate: 300 }
          }),
        ])

        clearTimeout(timeoutId)

        if (custRes.ok) {
          const result = await custRes.json()
          // FIX: Handle berbagai format response
          const customerArray = Array.isArray(result) ? result 
            : Array.isArray(result.data) ? result.data 
            : []
          setCustomers(customerArray)
        } else {
          console.error("Failed to fetch customers:", custRes.status)
        }

        if (empRes.ok) {
          const result = await empRes.json()
          // FIX: Handle berbagai format response
          const employeeArray = Array.isArray(result) ? result 
            : Array.isArray(result.data) ? result.data 
            : []
          setEmployees(employeeArray)
        } else {
          console.error("Failed to fetch employees:", empRes.status)
        }

        setFetchError(null)
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log("Request aborted")
        } else {
          console.error("Failed to load data:", error)
          setFetchError("Gagal memuat data referensi")
        }
      } finally {
        setInitialLoading(false)
        abortControllerRef.current = null
      }
    }

    loadData()

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])


  /* ========== FORMAT RUPIAH ========== */
  const formatRupiah = useCallback((value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  const handleEstimasiChange = useCallback((value: string) => {
    const raw = value.replace(/\D/g, "")
    const numValue = Number(raw)
    
    setEstimasiDisplay(
      new Intl.NumberFormat("id-ID").format(numValue)
    )
    
    setForm(prev => ({
      ...prev,
      estimasi_nilai: numValue,
    }))
  }, [])

  /* ========== TOGGLE SERVICE ========== */
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => {
      const newSelection = prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
      return newSelection
    })
  }, [])

  /* ========== HANDLE CUSTOMER SELECT ========== */
  const handleCustomerSelect = useCallback((customerId: string) => {
    const selected = customers.find(c => c.customer_id === customerId)
    if (selected) {
      setForm(prev => ({
        ...prev,
        customer_id: customerId,
        customer_name: selected.company_name || "",
        customer_email: selected.email || "",
        customer_phone: selected.phone || "",
      }))
    }
  }, [customers])

  /* ========== HANDLE EMPLOYEE SELECT ========== */
  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setForm(prev => ({
      ...prev,
      assigned_to: employeeId,
    }))
  }, [])

  /* ========== VALIDATION ========== */
  const validateForm = useCallback(() => {
    if (!form.customer_id) {
      toast.error("Customer wajib dipilih")
      return false
    }

    if (!form.nama_pekerjaan?.trim()) {
      toast.error("Nama Pekerjaan wajib diisi")
      return false
    }

    if (selectedServices.length === 0) {
      toast.error("Pilih minimal 1 jenis layanan")
      return false
    }

    if (form.estimasi_nilai && form.estimasi_nilai < 1000000) {
      if (!confirm("Estimasi nilai di bawah Rp 1.000.000. Lanjutkan?")) {
        return false
      }
    }

    if (form.estimasi_nilai > 1000000000000) {
      toast.error("Estimasi nilai terlalu besar")
      return false
    }

    return true
  }, [form.customer_id, form.nama_pekerjaan, form.estimasi_nilai, selectedServices.length])

  /* ========== SUBMIT ========== */
  const handleSubmit = useCallback(async () => {
    if (loading) return
    
    if (!validateForm()) return

    try {
      setLoading(true)

      const payload = {
        customer_id: form.customer_id,
        customer_name: sanitizeInput(form.customer_name),
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        nama_pekerjaan: sanitizeInput(form.nama_pekerjaan),
        estimasi_nilai: form.estimasi_nilai || 0,
        sumber: sanitizeInput(form.sumber),
        assigned_to: form.assigned_to,
        prioritas: form.prioritas,
        lokasi: sanitizeInput(form.lokasi),
        catatan: sanitizeInput(form.catatan),
        tanggal_masuk: form.tanggal_masuk,
        layanan: selectedServices.join("|"),
        status: "new",
        created_by: user?.id || user?.email || "system",
        created_at: new Date().toISOString(),
      }

      const requestId = generateRequestId()

      const res = await fetch("/api/crm/inquiry", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Anda tidak punya akses")
        } else if (res.status === 422) {
          throw new Error(`Data tidak valid: ${JSON.stringify(data.errors)}`)
        } else if (res.status === 409) {
          throw new Error("Data sudah ada, coba lagi")
        } else {
          throw new Error(data.message || "Gagal menyimpan inquiry")
        }
      }

      toast.success("Inquiry berhasil dibuat", {
        description: `ID: ${data.inquiry_id}`,
        duration: 5000,
      })

      // Redirect
      setTimeout(() => {
        router.push("/admin/crm/inquiry")
      }, 1000)

    } catch (error: any) {
      console.error("Submit error:", error)
      toast.error("Gagal menyimpan inquiry", {
        description: error.message || "Terjadi kesalahan",
      })
    } finally {
      setLoading(false)
    }
  }, [form, selectedServices, loading, validateForm, router, user])

  /* ========== FILTER ESTIMATOR ========== */
  const estimatorList = useMemo(() => {
    return employees.filter((emp) => {
      const dept = emp.department?.toLowerCase() || ""
      const jab = emp.jabatan?.toLowerCase() || ""

      return (
        dept === "engineering" ||
        jab.includes("estimator") ||
        jab.includes("estimasi")
      )
    })
  }, [employees])
  
  // Get assigned employee name for display
  const assignedEmployee = estimatorList.find(e => e.employee_id === form.assigned_to)

  /* ========== LOADING STATE ========== */
  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-xl p-8 h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-8 h-64 animate-pulse" />
            <div className="bg-gray-50 border rounded-xl p-8 h-40 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  /* ========== ERROR STATE ========== */
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-medium">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* HEADER - Clean */}
      <div className="flex items-center justify-between bg-white border-b py-4 px-6 -mx-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Inquiry Baru
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Input prospek proyek untuk tim estimasi
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE - Main Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* INFORMASI PROYEK - Clean Card */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                1
              </div>
              <h2 className="text-sm font-medium text-gray-700">
                Informasi Proyek
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* CUSTOMER */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={form.customer_id}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                >
                  <option value="" className="text-gray-400">-- Pilih Customer --</option>
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAMA PEKERJAAN */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  Nama Pekerjaan <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Renovasi Gedung Utama"
                  value={form.nama_pekerjaan}
                  onChange={(e) => setForm({ ...form, nama_pekerjaan: sanitizeInput(e.target.value) })}
                />
              </div>

              {/* SUMBER */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  Sumber Inquiry
                </label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Website / Tender / Referensi / Repeat"
                  value={form.sumber}
                  onChange={(e) => setForm({ ...form, sumber: sanitizeInput(e.target.value) })}
                />
              </div>

              {/* LOKASI */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-500">
                  Lokasi Proyek
                </label>
                <input
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Jakarta Selatan"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: sanitizeInput(e.target.value) })}
                />
              </div>
            </div>

            {/* PRIORITY - Clean */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-3">
                Prioritas Proyek
              </label>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setForm({ ...form, prioritas: priority.value as "normal" | "high" | "urgent" })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      form.prioritas === priority.value
                        ? `${PRIORITY_COLORS[priority.value as keyof typeof PRIORITY_COLORS]} text-white`
                        : `${PRIORITY_BG_LIGHT[priority.value as keyof typeof PRIORITY_BG_LIGHT]} ${
                            PRIORITY_TEXT[priority.value as keyof typeof PRIORITY_TEXT]
                          } hover:bg-gray-100`
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SERVICES - Clean Grid */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-3">
                Jenis Layanan <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SERVICE_OPTIONS.map((service) => {
                  const active = selectedServices.includes(service.id)
                  const colorKey = service.id as keyof typeof SERVICE_COLORS
                  const bgLightKey = service.id as keyof typeof SERVICE_BG_LIGHT
                  
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`px-4 py-3 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? `${SERVICE_COLORS[colorKey]} text-white`
                          : `${SERVICE_BG_LIGHT[bgLightKey]} text-gray-700 hover:bg-gray-200`
                      }`}
                    >
                      {service.label}
                    </button>
                  )
                })}
              </div>

              {/* Selected Count Badge - Clean */}
              {selectedServices.length > 0 && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {selectedServices.length} layanan dipilih
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CATATAN - Clean Card */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                2
              </div>
              <h2 className="text-sm font-medium text-gray-700">
                Catatan Tambahan
              </h2>
            </div>

            <textarea
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              rows={5}
              placeholder="Tambahkan catatan spesifikasi, persyaratan, atau informasi penting lainnya..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: sanitizeInput(e.target.value) })}
            />
          </div>
        </div>

        {/* RIGHT SIDE - Clean Cards */}
        <div className="space-y-6">

          {/* ESTIMASI - Dark Clean Card */}
          <div className="bg-gray-900 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                3
              </div>
              <h2 className="text-sm font-medium text-blue-400">
                Estimasi Nilai
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Nilai Proyek (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    Rp
                  </span>
                  <input
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-lg font-medium text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={estimasiDisplay}
                    onChange={(e) => handleEstimasiChange(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {form.estimasi_nilai > 0 && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-gray-800 text-blue-400 rounded text-xs">
                      {formatRupiah(form.estimasi_nilai)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Assigned Estimator
                </label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={form.assigned_to}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                >
                  <option value="" className="text-gray-400">-- Pilih Staff --</option>
                  {estimatorList.map((emp) => (
                    <option
                      key={emp.employee_id}
                      value={emp.employee_id}
                      className="text-gray-900"
                    >
                      {emp.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Stats - Clean */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Pipeline Impact</div>
                  <div className="text-sm font-medium text-white mt-1">
                    {form.estimasi_nilai ? 'Medium' : 'None'}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-400">Est. Komisi</div>
                  <div className="text-sm font-medium text-white mt-1">
                    {form.estimasi_nilai 
                      ? formatRupiah(form.estimasi_nilai * ESTIMATION_COMMISSION_RATE) 
                      : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION - Clean Card */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                4
              </div>
              <h2 className="text-sm font-medium text-gray-700">
                Finalisasi
              </h2>
            </div>

            <div className="space-y-4">
              {/* Status Badge - Clean */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Status Inquiry
                  </div>
                  <div className="font-medium text-gray-900">
                    NEW PROSPECT
                  </div>
                </div>
              </div>

              {/* Summary Card - Clean */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium text-gray-900">{form.customer_name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pekerjaan:</span>
                  <span className="font-medium text-gray-900">{form.nama_pekerjaan || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Layanan:</span>
                  <span className="font-medium text-gray-900">{selectedServices.length} item</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimator:</span>
                  <span className="font-medium text-gray-900">{assignedEmployee?.nama_lengkap || '-'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Total Value:</span>
                  <span className="font-medium text-blue-600">
                    {formatRupiah(form.estimasi_nilai)}
                  </span>
                </div>
              </div>

              {/* Submit Button - Clean */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  <span>Simpan Inquiry</span>
                )}
              </button>

              {/* Help Text - Clean */}
              <p className="text-xs text-center text-gray-400">
                Dengan menyimpan, data akan masuk ke pipeline marketing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
