"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  X,
  Search,
  ChevronDown,
} from "lucide-react"

/* ==============================
   TYPE
================================ */
type Customer = {
  customer_id: string
  company_name: string
  pic_name?: string
  email?: string
  phone?: string
  city?: string
  province?: string
  address?: string
}

type ProjectType = "MEP" | "CIVIL" | "STEEL" | "INTERIOR" | "OTHER"
type ProjectStatus = "planning" | "running" | "finish" | "hold" | "cancelled"

/* ==============================
   CONFIG
================================ */
const PROJECT_TYPE_CONFIG = {
  MEP: { label: "MEP (Mechanical Electrical Plumbing)", color: "bg-purple-100 text-purple-700" },
  CIVIL: { label: "Civil & Struktur", color: "bg-blue-100 text-blue-700" },
  STEEL: { label: "Steel Structure", color: "bg-gray-100 text-gray-700" },
  INTERIOR: { label: "Interior & Finishing", color: "bg-green-100 text-green-700" },
  OTHER: { label: "Lainnya", color: "bg-gray-100 text-gray-700" },
}

const STATUS_CONFIG = {
  planning: { label: "Planning", color: "bg-yellow-100 text-yellow-700" },
  running: { label: "Running", color: "bg-blue-100 text-blue-700" },
  finish: { label: "Finish", color: "bg-green-100 text-green-700" },
  hold: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
}

/* ==============================
   HELPER
================================ */
function generateProjectCode() {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(100 + Math.random() * 900)
  return `PRJ-${y}${m}${d}-${rand}`
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number(value.replace(/\D/g, "")) : value
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/* ==============================
   MAIN COMPONENT
================================ */
export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchCustomer, setSearchCustomer] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [projectCode] = useState(generateProjectCode())

  const [form, setForm] = useState({
    project_name: "",
    customer_id: "",
    project_type: "" as ProjectType | "",
    lokasi: "",
    nilai_kontrak: "",
    start_date: "",
    end_date: "",
    status: "planning" as ProjectStatus,
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  /* ==============================
     LOAD CUSTOMER MASTER
  ================================ */
  useEffect(() => {
  fetch("/api/crm/customers", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {

      const list = Array.isArray(data) ? data : data.data || []

      if (!Array.isArray(list)) {
        console.error("Customer data invalid", data)
        return
      }

      setCustomers(list)
      setFilteredCustomers(list)
    })
    .catch((err) => {
      console.error(err)
      toast.error("Gagal memuat data customer")
    })
}, [])

  /* ==============================
     FILTER CUSTOMER
  ================================ */
  useEffect(() => {
    if (searchCustomer) {
      const keyword = searchCustomer.toLowerCase()
      setFilteredCustomers(
        customers.filter(
          (c) =>
            c.company_name.toLowerCase().includes(keyword) ||
            c.email?.toLowerCase().includes(keyword) ||
            c.phone?.includes(keyword)
        )
      )
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchCustomer, customers])

  /* ==============================
     HANDLER
  ================================ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setForm({
      ...form,
      customer_id: customer.customer_id,
      lokasi: customer.address 
        ? customer.address
        : [customer.city, customer.province].filter(Boolean).join(", "),
    })
    setSearchCustomer(customer.company_name)
    setShowCustomerDropdown(false)
  }

  const handleClearCustomer = () => {
    setSelectedCustomer(null)
    setForm({ ...form, customer_id: "", lokasi: "" })
    setSearchCustomer("")
  }

  const handleNilaiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    setForm({ ...form, nilai_kontrak: raw })
  }

  /* ==============================
     VALIDATION
  ================================ */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!form.project_name.trim()) {
      newErrors.project_name = "Nama project wajib diisi"
    }

    if (!form.customer_id) {
      newErrors.customer_id = "Customer wajib dipilih"
    }

    if (!form.project_type) {
      newErrors.project_type = "Jenis pekerjaan wajib dipilih"
    }

    if (!form.nilai_kontrak || Number(form.nilai_kontrak) <= 0) {
      newErrors.nilai_kontrak = "Nilai kontrak harus lebih dari 0"
    }

    if (!form.start_date) {
      newErrors.start_date = "Tanggal mulai wajib diisi"
    }

    if (form.start_date && form.end_date && new Date(form.start_date) > new Date(form.end_date)) {
      newErrors.end_date = "Tanggal selesai harus setelah tanggal mulai"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /* ==============================
     SUBMIT
  ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Mohon lengkapi data dengan benar")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_code: projectCode,
          project_name: form.project_name,
          customer_id: form.customer_id,
          project_type: form.project_type,
          lokasi: form.lokasi,
          nilai_kontrak: Number(form.nilai_kontrak),
          start_date: form.start_date,
          end_date: form.end_date || null,
          status: form.status,
          description: form.description || "",
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Project berhasil dibuat")
        router.push("/admin/projects")
      } else {
        toast.error(data.error || "Gagal menyimpan project")
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     RENDER
  ================================ */
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} />
            Kembali ke Projects
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-500 mt-1">Isi informasi project baru</p>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-500">Project Code</span>
              <div className="font-mono font-semibold text-gray-900">{projectCode}</div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            
            {/* FORM BODY */}
            <div className="p-8 space-y-6">
              
              {/* Nama Project */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nama Project <span className="text-red-500">*</span>
                </label>
                <input
                  name="project_name"
                  value={form.project_name}
                  onChange={handleChange}
                  placeholder="Contoh: Gedung Kantor 5 Lantai"
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.project_name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.project_name && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.project_name}
                  </p>
                )}
              </div>

              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Customer / Owner <span className="text-red-500">*</span>
                </label>
                
                {selectedCustomer ? (
                  <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedCustomer.company_name}</p>
                        <p className="text-xs text-gray-500">
  {[selectedCustomer.email, selectedCustomer.phone]
    .filter(Boolean)
    .join(" • ")}
</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearCustomer}
                      className="p-1 hover:bg-gray-200 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
  type="text"
  placeholder="Cari customer..."
  className="w-full border rounded-lg pl-10 pr-4 py-2.5"
  value={searchCustomer}
  onChange={(e) => setSearchCustomer(e.target.value)}
  onFocus={() => setShowCustomerDropdown(true)}
  onBlur={() => {
    setTimeout(() => setShowCustomerDropdown(false), 150)
  }}
/>
                    </div>

                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCustomers.map((customer) => (
                          <button
                            key={customer.customer_id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Building2 size={16} className="text-gray-400" />
                            <div>
                              <span className="font-medium">{customer.company_name}</span>
                              {customer.city && (
                                <span className="text-xs text-gray-500 ml-2">{customer.city}</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {errors.customer_id && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.customer_id}
                  </p>
                )}
              </div>

              {/* Project Type & Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Jenis Pekerjaan */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Jenis Pekerjaan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="project_type"
                    value={form.project_type}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-2.5 ${
                      errors.project_type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Pilih Jenis Pekerjaan</option>
                    {Object.entries(PROJECT_TYPE_CONFIG).map(([value, config]) => (
                      <option key={value} value={value}>{config.label}</option>
                    ))}
                  </select>
                  {errors.project_type && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.project_type}
                    </p>
                  )}
                </div>

                {/* Lokasi */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Lokasi Project
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={form.lokasi}
                      readOnly
                      placeholder="Lokasi akan otomatis terisi"
                      className="w-full border rounded-lg pl-10 pr-4 py-2.5 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Nilai Kontrak */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nilai Kontrak <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formatCurrency(form.nilai_kontrak || 0).replace("Rp 0", "")}
                    onChange={handleNilaiChange}
                    placeholder="0"
                    className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${
                      errors.nilai_kontrak ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.nilai_kontrak && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.nilai_kontrak}
                  </p>
                )}
              </div>

              {/* Tanggal Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${
                        errors.start_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Selesai
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={`w-full border rounded-lg pl-10 pr-4 py-2.5 ${
                        errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status Project
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                >
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi / Catatan
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tambahkan deskripsi atau catatan project..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                />
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="border-t px-8 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <Link
                href="/admin/projects"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
