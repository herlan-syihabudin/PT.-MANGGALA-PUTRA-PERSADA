"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

    if (name === "phone") {
      setForm({ ...form, phone: value.replace(/[^0-9]/g, "") })
      return
    }

    setForm({ ...form, [name]: value })
  }

  const validateForm = () => {
    if (!form.company_name.trim() || !form.pic_name.trim() || !form.phone.trim()) {
      toast.error("Nama perusahaan, PIC, dan No. Telepon wajib diisi")
      return false
    }

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Format email tidak valid")
      return false
    }

    if (form.npwp && form.npwp.length < 15) {
      toast.error("NPWP minimal 15 karakter")
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
          phone: form.phone.trim(),
        }),
      })

      if (!res.ok) throw new Error()

      toast.success("Customer berhasil ditambahkan")
      router.push("/admin/crm/customers")
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tambah Customer</h1>
        <p className="text-gray-500 text-sm">
          Master data customer / owner proyek
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6 shadow-sm">

        {/* COMPANY + TYPE */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Nama Perusahaan *" name="company_name" value={form.company_name} onChange={handleChange} />

          <Select
            label="Jenis Customer"
            name="customer_type"
            value={form.customer_type}
            onChange={handleChange}
            options={["Owner", "Developer", "Consultant", "Vendor"]}
          />
        </div>

        {/* PIC */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="PIC / Contact Person *" name="pic_name" value={form.pic_name} onChange={handleChange} />
          <Input label="Jabatan PIC" name="pic_position" value={form.pic_position} onChange={handleChange} />
        </div>

        {/* CONTACT */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="No. Telepon *" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>

        <Input label="NPWP (Untuk Keperluan Pajak)" name="npwp" value={form.npwp} onChange={handleChange} />

        <Textarea label="Alamat Lengkap" name="address" value={form.address} onChange={handleChange} />

        {/* LOCATION */}
        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Kota" name="city" value={form.city} onChange={handleChange} />
          <Input label="Provinsi" name="province" value={form.province} onChange={handleChange} />
          <Input label="Kode Pos" name="postal_code" value={form.postal_code} onChange={handleChange} />
        </div>

        <Textarea label="Catatan Tambahan" name="notes" value={form.notes} onChange={handleChange} />

        {/* ACTION */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Customer"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-2 border rounded text-sm hover:bg-gray-50 transition"
          >
            Batal
          </button>
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
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
      />
    </div>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
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
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-red-500 outline-none"
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
