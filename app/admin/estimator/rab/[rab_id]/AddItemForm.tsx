"use client"

import { useState } from "react"

type Props = {
  rab_id: string
  project_id: string
  onSuccess: () => void
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default function AddItemForm({ rab_id, project_id, onSuccess }: Props) {
  const [scope, setScope] = useState("")
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("")
  const [qty, setQty] = useState(0)
  const [unit, setUnit] = useState("")
  const [material, setMaterial] = useState(0)
  const [labour, setLabour] = useState(0)
  const [loading, setLoading] = useState(false)

  const unitPrice = material + labour
  const total = qty * unitPrice

  async function handleSubmit() {
    if (!itemName) {
      alert("Item name wajib diisi")
      return
    }

    setLoading(true)

    const res = await fetch("/api/estimator/rab/item/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        project_id,
        scope,
        item_name: itemName,
        category,
        qty,
        unit,
        material_price: material,
        labour_price: labour,
        created_by: "Estimator",
      }),
    })

    setLoading(false)

    if (!res.ok) {
      alert("Gagal tambah item")
      return
    }

    // reset form
    setScope("")
    setItemName("")
    setCategory("")
    setQty(0)
    setUnit("")
    setMaterial(0)
    setLabour(0)

    onSuccess()
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <h2 className="text-sm font-semibold">Tambah Item RAB</h2>

      <div className="grid grid-cols-2 gap-3">

        <input
          placeholder="Scope (contoh: Pekerjaan Tanah)"
          className="border px-3 py-2 text-sm rounded col-span-2"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        />

        <input
          placeholder="Nama Item"
          className="border px-3 py-2 text-sm rounded col-span-2"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <input
          placeholder="Kategori"
          className="border px-3 py-2 text-sm rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          placeholder="Unit (m2, m3, ls)"
          className="border px-3 py-2 text-sm rounded"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <input
          type="number"
          placeholder="Qty"
          className="border px-3 py-2 text-sm rounded"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Material Price"
          className="border px-3 py-2 text-sm rounded"
          value={material}
          onChange={(e) => setMaterial(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Labour Price"
          className="border px-3 py-2 text-sm rounded"
          value={labour}
          onChange={(e) => setLabour(Number(e.target.value))}
        />

      </div>

      {/* LIVE CALCULATION */}
      <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
        <div>Harga Satuan: <b>Rp {formatRupiah(unitPrice)}</b></div>
        <div>Total: <b>Rp {formatRupiah(total)}</b></div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white text-xs rounded"
      >
        {loading ? "Menyimpan..." : "Tambah Item"}
      </button>
    </div>
  )
}
