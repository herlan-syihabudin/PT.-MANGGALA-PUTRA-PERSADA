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

/* ================= KEYBOARD NAVIGATION ================= */

function focusNext(current: HTMLElement) {
  const form = current.closest("form")
  if (!form) return

  const focusable = Array.from(
    form.querySelectorAll<HTMLElement>("input, button")
  ).filter((el) => !el.hasAttribute("disabled"))

  const index = focusable.indexOf(current)
  if (index > -1 && index < focusable.length - 1) {
    focusable[index + 1].focus()
  }
}

export default function AddItemForm({
  rab_id,
  project_id,
  onSuccess,
  onCreated,
}: Props) {
  const itemInputRef = useRef<HTMLInputElement>(null)

  const [scope, setScope] = useState("")
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("")
  const [qty, setQty] = useState<number>(1)
  const [unit, setUnit] = useState("")
  const [material, setMaterial] = useState<number>(0)
  const [labour, setLabour] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)

  const unitPrice = material + labour
  const total = qty * unitPrice

  const isValid = itemName.trim().length > 0

  const handleNumberChange = (val: string, setter: (n: number) => void) => {
    const num = parseFloat(val)
    setter(isNaN(num) ? 0 : num)
  }

  async function handleSubmit() {
    if (!isValid || loading) return

    setLoading(true)

    const res = await fetch("/api/estimator/rab/item/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        project_id,
        scope: scope.trim(),
        item_name: itemName.trim(),
        category: category.trim(),
        qty,
        unit: unit.trim(),
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

    // Reset (scope tetap)
    setItemName("")
    setCategory("")
    setQty(1)
    setUnit("")
    setMaterial(0)
    setLabour(0)

    itemInputRef.current?.focus()

    setSuccessMsg(true)
    setTimeout(() => setSuccessMsg(false), 800)

    onSuccess()
  }

  /* ================= UI ================= */

  return (
    <>
      {/* TITLE */}
      <div className="mb-2">
        <h2 className="text-sm font-semibold">Tambah Item RAB</h2>
        <p className="text-[11px] text-gray-500">
          Enter = pindah field | Ctrl + Enter = tambah item
        </p>
      </div>

      {successMsg && (
        <div className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded mb-2">
          ✔ Item berhasil ditambahkan
        </div>
      )}

      <form
        className="bg-white border rounded-lg p-3 space-y-3 shadow-sm"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault()
            handleSubmit()
          }
        }}
      >
        {/* Scope */}
        <input
          className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="Scope Pekerjaan"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.ctrlKey) {
              e.preventDefault()
              focusNext(e.currentTarget)
            }
          }}
        />

        {/* Item */}
        <input
          ref={itemInputRef}
          className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Nama Item"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.ctrlKey) {
              e.preventDefault()
              focusNext(e.currentTarget)
            }
          }}
        />

       {/* Row 1 */}
<div className="grid grid-cols-3 gap-2">
  <div>
    <label className="text-[10px] text-gray-500">Kategori</label>
    <input
      className="w-full border rounded px-2 py-1 text-sm"
      value={category}
      onChange={(e) => setCategory(e.target.value)}
      placeholder="Kategori"
    />
  </div>

  <div>
    <label className="text-[10px] text-gray-500">Unit</label>
    <input
      className="w-full border rounded px-2 py-1 text-sm"
      value={unit}
      onChange={(e) => setUnit(e.target.value)}
      placeholder="Unit"
    />
  </div>

  <div>
    <label className="text-[10px] text-gray-500">Qty</label>
    <input
      type="number"
      min="0"
      step="any"
      className="w-full border rounded px-2 py-1 text-sm text-right"
      value={qty}
      onChange={(e) => handleNumberChange(e.target.value, setQty)}
    />
  </div>
</div>

{/* Row 2 */}
<div className="grid grid-cols-2 gap-2">
  <div>
    <label className="text-[10px] text-gray-500">Material Price</label>
    <input
      type="number"
      min="0"
      step="any"
      className="w-full border rounded px-2 py-1 text-sm text-right"
      value={material}
      onChange={(e) => handleNumberChange(e.target.value, setMaterial)}
    />
  </div>

  <div>
    <label className="text-[10px] text-gray-500">Labour Price</label>
    <input
      type="number"
      min="0"
      step="any"
      className="w-full border rounded px-2 py-1 text-sm text-right"
      value={labour}
      onChange={(e) => handleNumberChange(e.target.value, setLabour)}
    />
  </div>
</div>

        {/* Summary */}
        <div
          className={`flex justify-between text-xs rounded px-2 py-2 ${
            total > 0 ? "bg-green-50" : "bg-gray-50"
          }`}
        >
          <div>
            Harga Satuan:
            <span className="ml-1 font-semibold text-blue-600">
              Rp {formatRupiah(unitPrice)}
            </span>
          </div>
          <div>
            Total:
            <span className="ml-1 font-semibold text-green-700">
              Rp {formatRupiah(total)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full text-xs py-2 rounded transition ${
            isValid
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Menyimpan..." : "Tambah Item"}
        </button>
      </form>
    </>
  )
}
