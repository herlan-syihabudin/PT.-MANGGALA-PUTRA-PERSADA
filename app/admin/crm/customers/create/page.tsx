"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

type FormState = {
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
  notes: string
}

export default function CreateCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormState>({
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
    notes: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Phone: hanya angka, max 15 digit
    if (name === "phone") {
      const digits = value.replace(/[^0-9]/g, "")
      if (digits.length <= 15) {
        setForm({ ...form, phone: digits })
      }
      return
    }

    setForm({ ...form, [name]: value })
  }

  const validateForm = () => {
    if (!form.company_name.trim()) {
      toast.error("Nama perusahaan wajib diisi")
      return false
    }

    if (!form.pic_name.trim()) {
      toast.error("Nama PIC wajib diisi")
      return false
    }

    if (!form.phone.trim()) {
      toast.error("Nomor telepon wajib diisi")
      return false
    }

    if (form.phone.length < 10 || form.phone.length > 15) {
      toast.error("Nomor telepon harus 10-15 digit")
      return false
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Format email tidak valid")
      return false
    }

    if (form.npwp && form.npwp.replace(/\D/g, '').length !== 15) {
      toast.error("NPWP harus 15 digit")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const res = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          company_name: form.company_name.trim(),
          pic_name: form.pic_name.trim(),
          email: form.email.trim(),
          phone: form.phone,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal menyimpan")
      }

      toast.success("Customer berhasil ditambahkan")
      router.push("/admin/crm/customers")
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - Premium Industrial */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white border-b border-slate-600/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Building2 size={28} className="text-slate-300" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight">Tambah Customer</h1>
              <p className="text-slate-300 text-sm mt-1 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                Master data customer & owner proyek
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm hover:shadow-md transition-shadow">
          {/* COMPANY + TYPE */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="Nama Perusahaan *" 
              name="company_name" 
              value={form.company_name} 
              onChange={handleChange} 
              disabled={loading}
            />

            <Select
              label="Jenis Customer"
              name="customer_type"
              value={form.customer_type}
              onChange={handleChange}
              options={["Owner", "Developer", "Consultant", "Vendor"]}
              disabled={loading}
            />
          </div>

          {/* PIC */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="PIC / Contact Person *" 
              name="pic_name" 
              value={form.pic_name} 
              onChange={handleChange} 
              disabled={loading}
            />
            <Input 
              label="Jabatan PIC" 
              name="pic_position" 
              value={form.pic_position} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>

          {/* CONTACT */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="Email" 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              disabled={loading}
            />
            <Input 
              label="No. Telepon *" 
              name="phone" 
              type="tel" 
              value={form.phone} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="08123456789"
            />
          </div>

          <Input 
            label="NPWP (15 digit)" 
            name="npwp" 
            value={form.npwp} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="00.000.000.0-000.000"
          />

          <Textarea 
            label="Alamat Lengkap" 
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            disabled={loading}
          />

          {/* LOCATION */}
          <div className="grid md:grid-cols-3 gap-4">
            <Input 
              label="Kota" 
              name="city" 
              value={form.city} 
              onChange={handleChange} 
              disabled={loading}
            />
            <Input 
              label="Provinsi" 
              name="province" 
              value={form.province} 
              onChange={handleChange} 
              disabled={loading}
            />
            <Input 
              label="Kode Pos" 
              name="postal_code" 
              value={form.postal_code} 
              onChange={handleChange} 
              disabled={loading}
            />
          </div>

          <Textarea 
            label="Catatan Tambahan" 
            name="notes" 
            value={form.notes} 
            onChange={handleChange} 
            disabled={loading}
          />

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
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
                "Simpan Customer"
              )}
            </button>

            <button
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition disabled:opacity-50"
            >
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
  disabled = false,
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange,
  disabled = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
      />
    </div>
  )
}

function Select({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}
