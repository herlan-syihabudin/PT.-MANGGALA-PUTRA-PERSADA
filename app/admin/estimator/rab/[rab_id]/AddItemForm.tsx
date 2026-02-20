"use client"

import { useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { PlusCircle, X, CheckCircle } from "lucide-react"

type Item = {
  item_id: string
  item_name: string
  qty: number
  unit: string
  material_price: number
  labour_price: number
  total_price: number
}

type Props = {
  rab_id: string
  project_id: string
  onSuccess: () => void
  onCreated?: (item: Item) => void
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

/* ================= KEYBOARD NAVIGATION ================= */
function focusNext(current: HTMLElement) {
  const form = current.closest("form")
  if (!form) return

  const focusable = Array.from(
    form.querySelectorAll<HTMLElement>("input, button, select, textarea")
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1)

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
  const [existingItems, setExistingItems] = useState<Item[]>([])

  // Fetch existing items untuk cek duplikat
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`/api/estimator/rab/${rab_id}/items`)
        if (res.ok) {
          const data = await res.json()
          setExistingItems(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Failed to fetch existing items:", error)
      }
    }
    fetchItems()
  }, [rab_id])

  const unitPrice = material + labour
  const total = qty * unitPrice

  const isValid = itemName.trim().length > 0 && qty > 0

  const handleNumberChange = (val: string, setter: (n: number) => void) => {
    const num = parseFloat(val)
    setter(isNaN(num) || num < 0 ? 0 : num)
  }

  const resetForm = () => {
    setItemName("")
    setCategory("")
    setQty(1)
    setUnit("")
    setMaterial(0)
    setLabour(0)
    // Scope tidak di-reset karena bisa sama untuk beberapa item
  }

  async function handleSubmit() {
    if (!isValid || loading) return

    // Cek duplikat
    const duplicate = existingItems.find(
  i =>
    i.item_name.trim().toLowerCase() === itemName.trim().toLowerCase() &&
    (i.scope || "").trim().toLowerCase() === scope.trim().toLowerCase()
)
    if (duplicate) {
      toast.error(`Item "${itemName}" sudah ada dalam RAB ini`)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal menambah item")
      }

      if (data.item) {
        onCreated?.(data.item)
        // Update existing items list
        setExistingItems(prev => [...prev, data.item])
      }

      resetForm()
      itemInputRef.current?.focus()

      setSuccessMsg(true)
      setTimeout(() => setSuccessMsg(false), 1500)

      onSuccess()
      toast.success("Item berhasil ditambahkan")
    } catch (error: any) {
      toast.error(error.message || "Gagal menambah item")
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
            <PlusCircle size={16} className="text-slate-500" />
            Tambah Item RAB
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px]">Enter</kbd> = next field •{' '}
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px]">Ctrl+Enter</kbd> = submit
          </p>
        </div>
        {successMsg && (
          <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <CheckCircle size={12} />
            <span>Tersimpan</span>
          </div>
        )}
      </div>

      <form
        className="space-y-3"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault()
            handleSubmit()
          }
        }}
      >
        {/* Scope */}
        <div>
          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
            Scope Pekerjaan
          </label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="Contoh: Pekerjaan Struktur"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.ctrlKey) {
                e.preventDefault()
                focusNext(e.currentTarget)
              }
            }}
          />
        </div>

        {/* Item Name */}
        <div>
          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
            Nama Item <span className="text-rose-500">*</span>
          </label>
          <input
            ref={itemInputRef}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Contoh: Beton K-300"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.ctrlKey) {
                e.preventDefault()
                focusNext(e.currentTarget)
              }
            }}
          />
        </div>

        {/* Row 1 - Kategori, Unit, Qty */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
              Kategori
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Material"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
              Unit
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="m³"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
              Qty <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={qty}
              onChange={(e) => handleNumberChange(e.target.value, setQty)}
            />
          </div>
        </div>

        {/* Row 2 - Material & Labour */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
              Material Price (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={material}
              onChange={(e) => handleNumberChange(e.target.value, setMaterial)}
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1 block">
              Labour Price (Rp)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-right focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={labour}
              onChange={(e) => handleNumberChange(e.target.value, setLabour)}
            />
          </div>
        </div>

        {/* Summary */}
        <div className={`flex justify-between items-center text-xs rounded-lg px-3 py-2 ${
          total > 0 ? 'bg-slate-50 border border-slate-200' : 'bg-slate-50/50'
        }`}>
          <div>
            <span className="text-slate-500">Harga Satuan:</span>
            <span className="ml-2 font-semibold text-slate-800">
              Rp {formatRupiah(unitPrice)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Total:</span>
            <span className="ml-2 font-semibold text-emerald-600">
              Rp {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
            isValid && !loading
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Menyimpan...
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              Tambah Item
            </>
          )}
        </button>
      </form>
    </div>
  )
}
