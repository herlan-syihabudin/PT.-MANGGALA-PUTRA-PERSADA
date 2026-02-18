"use client"

import { Plus, Trash2 } from "lucide-react"
import { nanoid } from "nanoid"

export interface Item {
  id?: string
  material_id?: string
  description: string
  qty: number
  unit: string
  unit_price?: number
  estimated_price?: number
}

interface ItemsEditorProps {
  items: Item[]
  onChange: (items: Item[]) => void
  type: "pr" | "po"
  readOnly?: boolean
}

export default function ItemsEditor({
  items,
  onChange,
  type,
  readOnly = false,
}: ItemsEditorProps) {
  const safeNumber = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const addItem = () => {
    onChange([
      ...items,
      {
        id: nanoid(),
        description: "",
        qty: 1,
        unit: "",
      },
    ])
  }

  const removeItem = (id?: string) => {
    onChange(items.filter((i) => i.id !== id))
  }

  const updateItem = (id: string | undefined, field: keyof Item, value: any) => {
    onChange(
      items.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "qty" ? safeNumber(value) : value }
          : item
      )
    )
  }

  const calculateSubtotal = (item: Item) => {
    const qty = safeNumber(item.qty)
    const price =
      type === "po"
        ? safeNumber(item.unit_price)
        : safeNumber(item.estimated_price)

    return qty * price
  }

  const total = items.reduce(
    (sum, item) => sum + calculateSubtotal(item),
    0
  )

  if (items.length === 0 && readOnly) {
    return <div className="text-sm text-gray-500">Tidak ada item</div>
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left w-24">Qty</th>
              <th className="p-3 text-left w-20">Unit</th>
              <th className="p-3 text-right w-36">
                {type === "po" ? "Unit Price" : "Est. Price"}
              </th>
              <th className="p-3 text-right w-40">Subtotal</th>
              {!readOnly && <th className="p-3 text-center w-16">Action</th>}
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  {readOnly ? (
                    item.description
                  ) : (
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      placeholder="Item description"
                    />
                  )}
                </td>

                <td className="p-3">
                  {readOnly ? (
                    item.qty
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(item.id, "qty", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1 text-right"
                    />
                  )}
                </td>

                <td className="p-3">
                  {readOnly ? (
                    item.unit
                  ) : (
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, "unit", e.target.value)
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  )}
                </td>

                <td className="p-3 text-right">
                  {readOnly ? (
                    (type === "po"
                      ? item.unit_price
                      : item.estimated_price
                    )?.toLocaleString("id-ID")
                  ) : (
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={
                        type === "po"
                          ? item.unit_price || 0
                          : item.estimated_price || 0
                      }
                      onChange={(e) =>
                        updateItem(
                          item.id,
                          type === "po"
                            ? "unit_price"
                            : "estimated_price",
                          e.target.value
                        )
                      }
                      className="w-full border rounded px-2 py-1 text-right"
                    />
                  )}
                </td>

                <td className="p-3 text-right font-semibold">
                  {calculateSubtotal(item).toLocaleString("id-ID")}
                </td>

                {!readOnly && (
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>

          <tfoot className="bg-gray-50 font-bold border-t">
            <tr>
              <td colSpan={4} className="p-3 text-right">
                Total
              </td>
              <td className="p-3 text-right">
                {total.toLocaleString("id-ID")}
              </td>
              {!readOnly && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
