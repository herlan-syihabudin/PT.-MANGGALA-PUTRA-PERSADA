"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddRabItemPage({
  params,
}: {
  params: { project_id: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    scope: "",
    item_name: "",
    category: "",
    volume: "",
    unit: "",
    material_price: "",
    labour_price: "",
  })

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.item_name || !form.volume) {
      alert("Item dan volume wajib diisi")
      return
    }

    setLoading(true)

    const res = await fetch("/api/estimator/rab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id: `RAB-${params.project_id}`, // boleh simple dulu
        project_id: params.project_id,
        scope: form.scope,
        item_name: form.item_name,
        category: form.category,
        volume: Number(form.volume),
        unit: form.unit,
        material_price: Number(form.material_price || 0),
        labour_price: Number(form.labour_price || 0),
        created_by: "Estimator",
      }),
    })

    setLoading(false)

    if (!res.ok) {
      alert("Gagal menambah item RAB")
      return
    }

    router.push(`/admin/projects/${params.project_id}/rab`)
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Tambah Item RAB</h1>
        <p className="text-xs text-gray-500">
          Project ID: {params.project_id}
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <Input label="Scope" name="scope" onChange={onChange} />
        <Input label="Item" name="item_name" onChange={onChange} />
        <Input label="Kategori" name="category" onChange={onChange} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Volume" name="volume" type="number" onChange={onChange} />
          <Input label="Unit" name="unit" onChange={onChange} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Harga Material"
            name="material_price"
            type="number"
            onChange={onChange}
          />
          <Input
            label="Harga Upah"
            name="labour_price"
            type="number"
            onChange={onChange}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-xs rounded"
          >
            {loading ? "Menyimpan..." : "Simpan Item"}
          </button>

          <button
            onClick={() => router.back()}
            className="px-4 py-2 border text-xs rounded"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({
  label,
  name,
  type = "text",
  onChange,
}: {
  label: string
  name: string
  type?: string
  onChange: any
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  )
}
