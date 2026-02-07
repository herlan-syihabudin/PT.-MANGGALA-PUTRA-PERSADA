"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

export default function CreateCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.company_name || !form.pic_name || !form.phone) {
      alert("Nama perusahaan, PIC, dan No. Telepon wajib diisi")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        throw new Error("Gagal menyimpan customer")
      }

      router.push("/admin/crm/clients")
      router.refresh()
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan customer")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Tambah Customer</h1>
        <p className="text-gray-500 text-sm">
          Master data customer / owner proyek
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded p-6 space-y-4">
        <Input label="Nama Perusahaan" name="company_name" value={form.company_name} onChange={handleChange} />
        <Input label="Jenis Customer" name="customer_type" value={form.customer_type} onChange={handleChange} />
        <Input label="PIC / Contact Person" name="pic_name" value={form.pic_name} onChange={handleChange} />
        <Input label="Jabatan PIC" name="pic_position" value={form.pic_position} onChange={handleChange} />
        <Input label="Email" name="email" value={form.email} onChange={handleChange} />
        <Input label="No. Telepon" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="NPWP" name="npwp" value={form.npwp} onChange={handleChange} />
        <Input label="Kota" name="city" value={form.city} onChange={handleChange} />
        <Input label="Provinsi" name="province" value={form.province} onChange={handleChange} />
        <Input label="Kode Pos" name="postal_code" value={form.postal_code} onChange={handleChange} />

        <div>
          <label className="text-sm font-medium">Alamat</label>
          <textarea
            name="address"
            rows={3}
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Catatan</label>
          <textarea
            name="notes"
            rows={2}
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Customer"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ==============================
   REUSABLE INPUT
================================ */
function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: any
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      />
    </div>
  )
}
