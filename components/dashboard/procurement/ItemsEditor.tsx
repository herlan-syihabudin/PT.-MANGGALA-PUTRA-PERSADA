"use client"

import { Plus, Trash2, AlertCircle } from "lucide-react"
import { nanoid } from "nanoid"
import { useState } from "react"
import { formatIDR } from "@/lib/format"

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
  showMaterialSelect?: boolean
  materials?: Array<{ id: string; name: string; unit: string; price: number }>
  currency?: 'IDR' | 'USD'
  maxItems?: number
  minItems?: number
}

const UNITS = ['pcs', 'unit', 'set', 'box', 'kg', 'meter', 'liter', 'dus', 'sak', 'roll', 'buah', 'lembar']

export default function ItemsEditor({
  items,
  onChange,
  type,
  readOnly = false,
  showMaterialSelect = false,
  materials = [],
  currency = 'IDR',
  maxItems = 100,
  minItems = 1,
}: ItemsEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const safeNumber = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const validateItem = (item: Item, index: number): string[] => {
    const itemErrors: string[] = []
    
    if (!item.description?.trim()) itemErrors.push('Description required')
    if (!item.qty || item.qty <= 0) itemErrors.push('Qty must be > 0')
    if (!item.unit?.trim()) itemErrors.push('Unit required')
    
    const price = type === 'po' ? item.unit_price : item.estimated_price
    if (price !== undefined && price < 0) itemErrors.push('Price cannot be negative')
    
    return itemErrors
  }

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    items.forEach((item, idx) => {
      const itemErrors = validateItem(item, idx)
      if (itemErrors.length > 0) {
        newErrors[item.id || idx.toString()] = itemErrors.join(', ')
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addItem = () => {
    if (items.length >= maxItems) {
      alert(`Maximum ${maxItems} items allowed`)
      return
    }
    
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
    if (items.length <= minItems) {
      alert(`Minimum ${minItems} item required`)
      return
    }
    
    if (confirm('Hapus item ini?')) {
      onChange(items.filter((i) => i.id !== id))
      // Clear error for removed item
      if (id) {
        const newErrors = { ...errors }
        delete newErrors[id]
        setErrors(newErrors)
      }
    }
  }

  const updateItem = (id: string | undefined, field: keyof Item, value: any) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item
        
        let newValue = value
        
        // Validate numeric fields
        if (field === 'qty' || field === 'unit_price' || field === 'estimated_price') {
          const num = Number(value)
          if (isNaN(num)) return item
          if (num < 0) return item
          if (field === 'qty' && num > 1_000_000) {
            alert('Quantity too large (max 1,000,000)')
            return item
          }
          if ((field === 'unit_price' || field === 'estimated_price') && num > 1_000_000_000) {
            alert('Price too large (max 1,000,000,000)')
            return item
          }
          newValue = num
        }
        
        const updatedItem = { ...item, [field]: newValue }
        
        // Auto-calculate for material selection
        if (field === 'material_id' && showMaterialSelect) {
          const material = materials.find(m => m.id === value)
          if (material) {
            updatedItem.description = material.name
            updatedItem.unit = material.unit
            if (type === 'po') {
              updatedItem.unit_price = material.price
            }
          }
        }
        
        // Clear error for this item
        if (errors[item.id || '']) {
          const newErrors = { ...errors }
          delete newErrors[item.id || '']
          setErrors(newErrors)
        }
        
        return updatedItem
      })
    )
  }

  const calculateSubtotal = (item: Item) => {
    const qty = safeNumber(item.qty)
    const price = type === "po"
      ? safeNumber(item.unit_price)
      : safeNumber(item.estimated_price)

    return qty * price
  }

  const total = items.reduce((sum, item) => sum + calculateSubtotal(item), 0)

  if (items.length === 0 && readOnly) {
    return <div className="text-sm text-gray-500">Tidak ada item</div>
  }

  const priceField = type === "po" ? "unit_price" : "estimated_price"
  const priceLabel = type === "po" ? "Unit Price" : "Est. Price"

  return (
    <div className="space-y-4">
      {/* Header */}
      {!readOnly && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Items</h3>
            <span className="text-xs text-gray-500">
              {items.length} / {maxItems}
            </span>
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={items.length >= maxItems}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      )}

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-600">
            <p className="font-medium">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-xs mt-1">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left w-24">Qty</th>
              <th className="p-3 text-left w-20">Unit</th>
              <th className="p-3 text-right w-36">{priceLabel}</th>
              <th className="p-3 text-right w-40">Subtotal</th>
              {!readOnly && <th className="p-3 text-center w-16">Action</th>}
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const itemError = errors[item.id || '']
              const hasError = !!itemError
              
              return (
                <tr 
                  key={item.id} 
                  className={`border-t ${hasError ? 'bg-red-50' : ''}`}
                >
                  <td className="p-3">
                    {readOnly ? (
                      item.description
                    ) : showMaterialSelect ? (
                      <select
                        value={item.material_id || ''}
                        onChange={(e) => updateItem(item.id, 'material_id', e.target.value)}
                        className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">Pilih material</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} - {formatIDR(m.price, { compact: true })}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-300' : ''
                        }`}
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
                        onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-300' : ''
                        }`}
                      />
                    )}
                  </td>

                  <td className="p-3">
                    {readOnly ? (
                      item.unit
                    ) : (
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        className={`w-full border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">Unit</option>
                        {UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    {readOnly ? (
                      formatIDR(type === "po" ? item.unit_price : item.estimated_price)
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={type === "po" ? item.unit_price || 0 : item.estimated_price || 0}
                        onChange={(e) => updateItem(item.id, priceField, e.target.value)}
                        className={`w-full border rounded px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 ${
                          hasError ? 'border-red-300' : ''
                        }`}
                      />
                    )}
                  </td>

                  <td className="p-3 text-right font-semibold">
                    {formatIDR(calculateSubtotal(item))}
                  </td>

                  {!readOnly && (
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= minItems}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title={items.length <= minItems ? 'Minimum items required' : 'Remove item'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>

          <tfoot className="bg-gray-50 font-bold border-t">
            <tr>
              <td colSpan={4} className="p-3 text-right">
                Total
              </td>
              <td className="p-3 text-right">
                {formatIDR(total)}
              </td>
              {!readOnly && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="text-xs text-gray-500 flex justify-between items-center">
          <span>
            {items.length} item(s) • Total: {formatIDR(total)}
          </span>
          {!readOnly && (
            <span className="text-gray-400">
              {items.length < minItems ? `Minimum ${minItems} item required` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
