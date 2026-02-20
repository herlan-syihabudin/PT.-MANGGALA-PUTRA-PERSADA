"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { debounce } from "lodash"
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
}

// Map untuk Tailwind classes (fix dynamic class issue)
const SERVICE_COLORS = {
  civil: "bg-blue-500",
  steel: "bg-indigo-500",
  mechanical: "bg-amber-500",
  electrical: "bg-yellow-500",
  plumbing: "bg-cyan-500",
  interior: "bg-purple-500",
  maintenance: "bg-orange-500",
  design: "bg-emerald-500",
} as const

const SERVICE_HOVER_COLORS = {
  civil: "hover:bg-blue-600",
  steel: "hover:bg-indigo-600",
  mechanical: "hover:bg-amber-600",
  electrical: "hover:bg-yellow-600",
  plumbing: "hover:bg-cyan-600",
  interior: "hover:bg-purple-600",
  maintenance: "hover:bg-orange-600",
  design: "hover:bg-emerald-600",
} as const

const SERVICE_SHADOW_COLORS = {
  civil: "shadow-blue-200",
  steel: "shadow-indigo-200",
  mechanical: "shadow-amber-200",
  electrical: "shadow-yellow-200",
  plumbing: "shadow-cyan-200",
  interior: "shadow-purple-200",
  maintenance: "shadow-orange-200",
  design: "shadow-emerald-200",
} as const

const PRIORITY_COLORS = {
  normal: "bg-gray-500",
  high: "bg-rose-500",
  urgent: "bg-red-500",
} as const

const PRIORITY_BG_LIGHT = {
  normal: "bg-gray-50",
  high: "bg-rose-50",
  urgent: "bg-red-50",
} as const

const PRIORITY_TEXT = {
  normal: "text-gray-600",
  high: "text-rose-600",
  urgent: "text-red-600",
} as const

const PRIORITY_HOVER = {
  normal: "hover:bg-gray-100",
  high: "hover:bg-rose-100",
  urgent: "hover:bg-red-100",
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

// Type guards
const isCustomer = (data: any): data is Customer => {
  return data && typeof data.customer_id === 'string'
}

const isEmployee = (data: any): data is Employee => {
  return data && typeof data.employee_id === 'string'
}

// Sanitize input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>{}]/g, '').trim()
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
  const user = {
    id: "current-user-id",
    email: "user@company.com"
  }

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
          fetch("/api/hr/employee?active=true", { 
            signal: controller.signal,
            next: { revalidate: 300 }
          }),
        ])

        clearTimeout(timeoutId)

        if (custRes.ok) {
  const result = await custRes.json()
  const customerArray = Array.isArray(result.data) ? result.data : []
  setCustomers(customerArray)
} else {
  console.error("Failed to fetch customers:", custRes.status)
}

if (empRes.ok) {
  const result = await empRes.json()
  const employeeArray = Array.isArray(result.data) ? result.data : []
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

  /* ========== DEBOUNCED SEARCH ========== */
  const debouncedSearch = useMemo(
    () => debounce((value: string, callback: (results: Customer[]) => void) => {
      const filtered = customers.filter(c => 
        c.company_name.toLowerCase().includes(value.toLowerCase()) ||
        c.email?.toLowerCase().includes(value.toLowerCase())
      )
      callback(filtered)
    }, 300),
    [customers]
  )

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

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

      const requestId = `inq-${uuidv4()}`

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

  /* ========== LOADING STATE ========== */
  if (initialLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded-lg mt-2 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-3xl p-8 shadow-sm h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-3xl p-8 h-64 animate-pulse" />
            <div className="bg-blue-50 border rounded-3xl p-8 h-40 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  /* ========== ERROR STATE ========== */
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-red-600 font-bold">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  // Get assigned employee name for display
  const assignedEmployee = employees.find(e => e.employee_id === form.assigned_to)

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">

      {/* HEADER with Glass Effect */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10 py-6 px-8 -mx-8 border-b">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tambah Inquiry Baru
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            Input prospek proyek untuk tim estimasi
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="group relative px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all duration-300"
        >
          <span className="relative z-10">Kembali</span>
          <div className="absolute inset-0 bg-gray-100 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE - Main Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* INFORMASI PROYEK - Premium Card */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                Informasi Proyek
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* CUSTOMER - Enhanced Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Customer <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <select
                    className="w-full bg-gray-50/50 border-2 border-gray-100 group-hover:border-blue-200 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none appearance-none"
                    value={form.customer_id}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                  >
                    <option value="" className="text-gray-400">-- Pilih Customer --</option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id} className="py-2">
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* NAMA PEKERJAAN */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  Nama Pekerjaan <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none"
                  placeholder="Contoh: Renovasi Gedung Utama"
                  value={form.nama_pekerjaan}
                  onChange={(e) => setForm({ ...form, nama_pekerjaan: sanitizeInput(e.target.value) })}
                />
              </div>

              {/* SUMBER */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Sumber Inquiry
                </label>
                <input
                  className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none"
                  placeholder="Website / Tender / Referensi / Repeat"
                  value={form.sumber}
                  onChange={(e) => setForm({ ...form, sumber: sanitizeInput(e.target.value) })}
                />
              </div>

              {/* LOKASI */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Lokasi Proyek
                </label>
                <input
                  className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none"
                  placeholder="Contoh: Jakarta Selatan"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: sanitizeInput(e.target.value) })}
                />
              </div>
            </div>

            {/* PRIORITY */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                Prioritas Proyek
              </label>
              <div className="flex gap-3">
                {PRIORITY_OPTIONS.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setForm({ ...form, prioritas: priority.value as "normal" | "high" | "urgent" })}
                    className={`group relative flex-1 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      form.prioritas === priority.value
                        ? `${PRIORITY_COLORS[priority.value]} text-white shadow-lg scale-105`
                        : `${PRIORITY_BG_LIGHT[priority.value]} ${PRIORITY_TEXT[priority.value]} ${PRIORITY_HOVER[priority.value]}`
                    }`}
                  >
                    {priority.label}
                    {form.prioritas === priority.value && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 ${PRIORITY_COLORS[priority.value]} rounded-full border-2 border-white animate-ping`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* SERVICES - Enhanced Grid */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Jenis Layanan <span className="text-red-400">*</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_OPTIONS.map(service => {
                  const active = selectedServices.includes(service.id)
                  const colorKey = service.id as keyof typeof SERVICE_COLORS
                  
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`group relative px-4 py-4 rounded-2xl text-xs font-bold transition-all duration-300 ${
                        active
                          ? `${SERVICE_COLORS[colorKey]} text-white shadow-lg ${SERVICE_SHADOW_COLORS[colorKey]} scale-105`
                          : 'bg-gray-50/50 text-gray-600 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className="relative z-10">{service.label}</span>
                      {active && (
                        <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected Count Badge */}
              {selectedServices.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-full font-bold">
                    {selectedServices.length} layanan dipilih
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* CATATAN - Premium Card */}
          <div className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                Catatan Tambahan
              </h2>
            </div>

            <textarea
              className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none resize-none"
              rows={5}
              placeholder="Tambahkan catatan spesifikasi, persyaratan, atau informasi penting lainnya..."
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: sanitizeInput(e.target.value) })}
            />
          </div>
        </div>

        {/* RIGHT SIDE - Premium Cards */}
        <div className="space-y-6">

          {/* ESTIMASI - Dark Premium Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl shadow-slate-900/50 border border-slate-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-900 font-bold text-lg">
                3
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">
                Estimasi Nilai
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase font-bold text-blue-400/70 mb-2 block">
                  Nilai Proyek (IDR)
                </label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-xl font-bold">
                    Rp
                  </span>
                  <input
                    className="w-full bg-white/10 border-2 border-slate-700 group-hover:border-blue-500/50 rounded-2xl pl-14 pr-5 py-5 text-2xl font-black text-white placeholder-white/20 transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
                    value={estimasiDisplay}
                    onChange={(e) => handleEstimasiChange(e.target.value)}
                    placeholder="0"
                  />
                </div>
                {form.estimasi_nilai > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">
                      {formatRupiah(form.estimasi_nilai)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-blue-400/70 mb-2 block">
                  Assigned Estimator
                </label>
                <div className="relative group">
                  <select
                    className="w-full bg-white/10 border-2 border-slate-700 group-hover:border-blue-500/50 rounded-2xl px-5 py-4 text-sm font-bold text-white transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none appearance-none"
                    value={form.assigned_to}
                    onChange={(e) => handleEmployeeSelect(e.target.value)}
                  >
                    <option value="" className="text-slate-900">-- Pilih Staff --</option>
                    {employees.map((emp) => (
                      <option
                        key={emp.employee_id}
                        value={emp.employee_id}
                        className="text-slate-900"
                      >
                        {emp.nama_lengkap}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-400/50 group-hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">Pipeline Impact</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {form.estimasi_nilai ? 'Medium' : 'None'}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-white/40">Est. Komisi</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {form.estimasi_nilai ? formatRupiah(form.estimasi_nilai * 0.05) : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION - Premium Card */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 shadow-xl border border-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-700">
                Finalisasi
              </h2>
            </div>

            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <div className="absolute -inset-1 bg-blue-500 rounded-full animate-ping opacity-50" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Status Inquiry
                  </div>
                  <div className="font-black text-slate-800 text-lg">
                    NEW PROSPECT
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold">{form.customer_name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pekerjaan:</span>
                  <span className="font-bold">{form.nama_pekerjaan || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Layanan:</span>
                  <span className="font-bold">{selectedServices.length} item</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimator:</span>
                  <span className="font-bold">{assignedEmployee?.nama_lengkap || '-'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Total Value:</span>
                  <span className="font-black text-blue-600">
                    {formatRupiah(form.estimasi_nilai)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full mt-6 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <div className="relative px-8 py-5 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <span>SIMPAN INQUIRY</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>

              {/* Help Text */}
              <p className="text-xs text-center text-gray-400 mt-4">
                Dengan menyimpan, Anda menyetujui data akan masuk ke pipeline marketing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
