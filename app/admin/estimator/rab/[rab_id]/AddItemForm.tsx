"use client"

import { useRef, useState } from "react"

type Props = {
  rab_id: string
  project_id: string
  onSuccess: () => void
  onCreated?: (item: any) => void
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

export default function AddItemForm({ rab_id, project_id, onSuccess, onCreated }: Props) {
  const itemInputRef = useRef<HTMLInputElement>(null)

  const [scope, setScope] = useState("")
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("")
  const [qty, setQty] = useState<number>(0)
  const [unit, setUnit] = useState("")
  const [material, setMaterial] = useState<number>(0)
  const [labour, setLabour] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  const unitPrice = material + labour
  const total = qty * unitPrice

  const handleNumberChange = (val: string, setter: (n: number) => void) => {
    const num = parseFloat(val)
    setter(isNaN(num) ? 0 : num)
  }

  async function handleSubmit() {
    if (!itemName.trim()) {
      alert("Nama item wajib diisi")
      return
    }
    if (!rab_id) {
      alert("rab_id kosong")
      return
    }
    if (!project_id) {
      alert("project_id kosong (cek header RAB dulu)")
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
      const t = await res.text()
      alert("Gagal tambah item: " + t)
      return
    }

    const json = await res.json()
    if (json?.item) onCreated?.(json.item)

    // Reset kecuali scope
    setItemName("")
    setCategory("")
    setQty(0)
    setUnit("")
    setMaterial(0)
    setLabour(0)

    itemInputRef.current?.focus()

    setSuccessMsg(true)
    setTimeout(() => setSuccessMsg(false), 1200)

    onSuccess()
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Tambah Item RAB</h2>
        <p className="text-xs text-gray-500">Isi detail pekerjaan yang akan dimasukkan ke dalam RAB</p>
      </div>

      {successMsg && (
        <div className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded">
          ✔ Item berhasil ditambahkan
        </div>
      )}

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Scope Pekerjaan</label>
            <input
              className="border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="Contoh: Pekerjaan Elektrikal"
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Nama Item</label>
            <input
              ref={itemInputRef}
              className="border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Contoh: Pengadaan Trafo 400kVA"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Kategori</label>
            <input
              className="border px-3 py-2 text-sm rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Material / Jasa / dll"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Unit</label>
            <input
              className="border px-3 py-2 text-sm rounded"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="m2, m3, ls, unit"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Qty</label>
            <input
              type="number"
              min="0"
              step="any"
              className="border px-3 py-2 text-sm rounded"
              value={qty === 0 ? "" : qty}
              onChange={(e) => handleNumberChange(e.target.value, setQty)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Material Price</label>
            <input
              type="number"
              min="0"
              step="any"
              className="border px-3 py-2 text-sm rounded"
              value={material === 0 ? "" : material}
              onChange={(e) => handleNumberChange(e.target.value, setMaterial)}
            />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-[10px] uppercase text-gray-400 font-bold">Labour Price</label>
            <input
              type="number"
              min="0"
              step="any"
              className="border px-3 py-2 text-sm rounded"
              value={labour === 0 ? "" : labour}
              onChange={(e) => handleNumberChange(e.target.value, setLabour)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
          <div>
            Harga Satuan: <b className="ml-1 text-blue-600">Rp {formatRupiah(unitPrice)}</b>
          </div>
          <div>
            Total: <b className="ml-1 text-green-600 text-base">Rp {formatRupiah(total)}</b>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition"
        >
          {loading ? "Menyimpan..." : "Tambah Item"}
        </button>
      </div>
    </div>
  )
}
