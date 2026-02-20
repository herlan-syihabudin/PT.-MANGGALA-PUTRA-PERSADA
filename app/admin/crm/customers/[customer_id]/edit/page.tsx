"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  X, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Globe, 
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle 
} from "lucide-react"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

type CustomerForm = {
  company_name: string
  customer_type: string
  pic_name: string
  pic_position: string
  email: string
  phone: string
  npwp: string
  address: string
  city: string
  province: string
  postal_code: string
  status: string
  notes: string
}

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.customer_id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [originalData, setOriginalData] = useState<CustomerForm | null>(null)

  const [form, setForm] = useState<CustomerForm>({
    company_name: "",
    customer_type: "Owner",
    pic_name: "",
    pic_position: "",
    email: "",
    phone: "",
    npwp: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    status: "Active",
    notes: "",
  })

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/crm/customers/${id}`, {
          cache: "no-store",
        })

        if (!res.ok) {
          if (res.status === 404) {
            setError("Customer tidak ditemukan")
          } else {
            throw new Error()
          }
          return
        }

        const data = await res.json()
setForm(data)
setOriginalData(data)
      } catch {
        setError("Gagal mengambil data customer")
      } finally {
        setFetching(false)
      }
    }

    fetchCustomer()
  }, [id])

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    let value = e.target.value

    // phone hanya angka, max 15 digit
    if (e.target.name === "phone") {
      value = value.replace(/[^0-9]/g, "").slice(0, 15)
    }

    // npwp hanya angka, max 15 digit
    if (e.target.name === "npwp") {
      value = value.replace(/[^0-9]/g, "").slice(0, 15)
    }

    // postal code hanya angka, max 5 digit
    if (e.target.name === "postal_code") {
      value = value.replace(/[^0-9]/g, "").slice(0, 5)
    }

    setForm({
      ...form,
      [e.target.name]: value,
    })
  }

  /* ================= VALIDATE FORM ================= */
  const validateForm = (cleanedForm: CustomerForm): string | null => {
    if (!cleanedForm.company_name.trim()) {
      return "Nama perusahaan wajib diisi"
    }

    if (!cleanedForm.pic_name.trim()) {
      return "Nama PIC wajib diisi"
    }

    if (!cleanedForm.phone.trim()) {
      return "Nomor telepon wajib diisi"
    }

    if (cleanedForm.phone.length < 10) {
      return "Nomor telepon minimal 10 digit"
    }

    if (cleanedForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedForm.email)) {
      return "Format email tidak valid"
    }

    if (cleanedForm.npwp && cleanedForm.npwp.length !== 15) {
      return "NPWP harus 15 digit"
    }

    if (cleanedForm.postal_code && cleanedForm.postal_code.length !== 5) {
      return "Kode pos harus 5 digit"
    }

    return null
  }

  const getChanges = () => {
  if (!originalData) return []

  return Object.keys(form).filter((key) => {
    return form[key as keyof CustomerForm] !==
           originalData[key as keyof CustomerForm]
  })
}
  
  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    // Trim semua string
    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, val]) => [
        key,
        typeof val === "string" ? val.trim() : val,
      ])
    ) as CustomerForm

    // Validasi
    const validationError = validateForm(cleanedForm)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/crm/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedForm),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal update customer")
      }

      toast.success("Customer berhasil diupdate", {
        description: `${cleanedForm.company_name} telah diperbarui`,
      })
      
      router.push(`/admin/crm/customers/${id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Gagal update customer")
    } finally {
      setLoading(false)
    }
  }

  /* ================= LOADING STATE ================= */
  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-300 border-t-slate-800 mx-auto" />
          <p className="text-slate-500">Memuat data customer...</p>
        </div>
      </div>
    )
  }

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/admin/crm/customers/${id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={16} />
            Kembali ke Detail Customer
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Building2 size={28} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Edit Customer</h1>
              <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                {id} • Perbarui informasi customer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  {/* ================= AUDIT BEFORE ================= */}
  {originalData && (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
      <div className="font-semibold text-amber-700 mb-2">
        Data Saat Ini (Before Edit)
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-xs text-amber-700">
        <div>
          <div className="font-medium">Perusahaan</div>
          <div>{originalData.company_name}</div>
        </div>
        <div>
          <div className="font-medium">PIC</div>
          <div>{originalData.pic_name}</div>
        </div>
        <div>
          <div className="font-medium">Telepon</div>
          <div>{originalData.phone}</div>
        </div>
      </div>
    </div>
  )}

  {/* ================= FORM CARD ================= */}
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          
          {/* GRID 2 KOLOM */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input 
              label="Nama Perusahaan" 
              name="company_name" 
              value={form.company_name} 
              onChange={handleChange} 
              icon={<Building2 size={16} />}
              required
              placeholder="PT. Contoh Maju"
            />
            
            <Select 
              label="Jenis Customer" 
              name="customer_type" 
              value={form.customer_type} 
              onChange={handleChange} 
              options={["Owner", "Developer", "Kontraktor", "Vendor", "Konsultan"]} 
              icon={<Briefcase size={16} />}
            />

            <Input 
              label="Nama PIC" 
              name="pic_name" 
              value={form.pic_name} 
              onChange={handleChange} 
              icon={<User size={16} />}
              required
              placeholder="John Doe"
            />
            
            <Input 
              label="Jabatan PIC" 
              name="pic_position" 
              value={form.pic_position} 
              onChange={handleChange} 
              icon={<Briefcase size={16} />}
              placeholder="Direktur"
            />

            <Input 
              label="Email" 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              icon={<Mail size={16} />}
              placeholder="email@company.com"
            />
            
            <Input 
              label="Telepon" 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              icon={<Phone size={16} />}
              required
              placeholder="08123456789"
              maxLength={15}
            />

            <Input 
              label="NPWP" 
              name="npwp" 
              value={form.npwp} 
              onChange={handleChange} 
              icon={<FileText size={16} />}
              placeholder="00.000.000.0-000.000"
              maxLength={15}
            />
            
            <Input 
              label="Kota" 
              name="city" 
              value={form.city} 
              onChange={handleChange} 
              icon={<MapPin size={16} />}
              placeholder="Jakarta"
            />

            <Input 
              label="Provinsi" 
              name="province" 
              value={form.province} 
              onChange={handleChange} 
              icon={<Globe size={16} />}
              placeholder="DKI Jakarta"
            />
            
            <Input 
              label="Kode Pos" 
              name="postal_code" 
              value={form.postal_code} 
              onChange={handleChange} 
              icon={<Hash size={16} />}
              placeholder="12345"
              maxLength={5}
            />

            <Select 
              label="Status" 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              options={["Active", "Inactive"]} 
              icon={form.status === "Active" ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-400" />}
            />
          </div>

          {/* FULL WIDTH TEXTAREA */}
          <div className="mt-6 space-y-4">
            <Textarea 
              label="Alamat Lengkap" 
              name="address" 
              value={form.address} 
              onChange={handleChange} 
              rows={3}
              placeholder="Jl. Contoh No. 123, RT 01 RW 02"
            />
            
            <Textarea 
              label="Catatan Tambahan" 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              rows={3}
              placeholder="Informasi tambahan tentang customer..."
            />
          </div>

          {/* Metadata (read-only) */}
          {form.created_at && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
              <p>Created: {new Date(form.created_at).toLocaleString('id-ID')} by {form.created_by || 'System'}</p>
            </div>
          )}

    {/* ================= AUDIT CHANGES ================= */}
{originalData && getChanges().length > 0 && (
  <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
    <div className="font-semibold text-emerald-700 mb-3 text-sm">
      Perubahan Yang Akan Disimpan
    </div>

    <div className="space-y-2 text-xs">
      {getChanges().map((field) => (
        <div key={field} className="grid grid-cols-3 gap-2">
          <div className="text-slate-600 capitalize">
            {field.replace("_", " ")}
          </div>
          <div className="text-rose-500 line-through">
            {originalData[field as keyof CustomerForm] || "-"}
          </div>
          <div className="text-emerald-600 font-medium">
            {form[field as keyof CustomerForm] || "-"}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
    
          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Customer
                </>
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-50 flex items-center gap-2"
            >
              <X size={16} />
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Input({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  icon,
  required = false,
  placeholder,
  maxLength
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none ${
            icon ? 'pl-9' : ''
          }`}
        />
      </div>
    </div>
  )
}

function Textarea({ label, name, value, onChange, rows = 3, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={rows}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none resize-none"
      />
    </div>
  )
}

function Select({ label, name, value, onChange, options, icon }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none ${
            icon ? 'pl-9' : ''
          }`}
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
