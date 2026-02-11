"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

export const dynamic = "force-dynamic"

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.customer_id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [form, setForm] = useState<any>({
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
        const res = await fetch(`/api/crm/customers/${id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error()

        const data = await res.json()
        setForm(data)
      } catch {
        toast.error("Gagal mengambil data customer")
      } finally {
        setFetching(false)
      }
    }

    fetchCustomer()
  }, [id])

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    let value = e.target.value

    // phone hanya angka
    if (e.target.name === "phone") {
      value = value.replace(/[^0-9]/g, "")
    }

    setForm({
      ...form,
      [e.target.name]: value,
    })
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    // trim semua string
    const cleanedForm = Object.fromEntries(
      Object.entries(form).map(([key, val]) => [
        key,
        typeof val === "string" ? val.trim() : val,
      ])
    )

    if (!cleanedForm.company_name || !cleanedForm.pic_name || !cleanedForm.phone) {
      toast.error("Nama perusahaan, PIC, dan telepon wajib diisi")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/crm/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedForm),
      })

      if (!res.ok) throw new Error()

      toast.success("Customer berhasil diupdate")
      router.push(`/admin/crm/customers/${id}`)
    } catch {
      toast.error("Gagal update customer")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="p-6">Memuat data...</div>
  }

  return (
    <div className="p-6 max-w-6xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Edit Customer</h1>
        <p className="text-gray-500 text-sm">{id}</p>
      </div>

      <div className="bg-white border rounded p-6 shadow-sm">

        {/* GRID 2 KOLOM */}
        <div className="grid md:grid-cols-2 gap-6">

          <Input label="Nama Perusahaan" name="company_name" value={form.company_name} onChange={handleChange} />
          <Select label="Jenis Customer" name="customer_type" value={form.customer_type} onChange={handleChange} options={["Owner","Developer","Kontraktor","Vendor"]} />

          <Input label="PIC" name="pic_name" value={form.pic_name} onChange={handleChange} />
          <Input label="Jabatan PIC" name="pic_position" value={form.pic_position} onChange={handleChange} />

          <Input label="Email" name="email" value={form.email} onChange={handleChange} />
          <Input label="Telepon" name="phone" value={form.phone} onChange={handleChange} />

          <Input label="NPWP" name="npwp" value={form.npwp} onChange={handleChange} />
          <Input label="Kota" name="city" value={form.city} onChange={handleChange} />

          <Input label="Provinsi" name="province" value={form.province} onChange={handleChange} />
          <Input label="Kode Pos" name="postal_code" value={form.postal_code} onChange={handleChange} />

          <Select label="Status" name="status" value={form.status} onChange={handleChange} options={["Active","Inactive"]} />

        </div>

        {/* FULL WIDTH TEXTAREA */}
        <div className="mt-6 space-y-4">
          <Textarea label="Alamat" name="address" value={form.address} onChange={handleChange} />
          <Textarea label="Catatan" name="notes" value={form.notes} onChange={handleChange} />
        </div>

        {/* ACTION */}
        <div className="flex gap-3 pt-6 border-t mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Update Customer"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  )
}

/* ================= COMPONENTS ================= */

function Input({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      />
    </div>
  )
}

function Textarea({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        name={name}
        rows={3}
        value={value || ""}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      />
    </div>
  )
}

function Select({ label, name, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 mt-1"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
