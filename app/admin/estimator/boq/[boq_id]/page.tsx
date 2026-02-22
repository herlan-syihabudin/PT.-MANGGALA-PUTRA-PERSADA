'use client'

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  Edit3,
  FileText,
  Lock,
  LockOpen,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  AlertCircle
} from "lucide-react"

// ================= TYPES =================
type BoqStatus = "DRAFT" | "LOCKED" | "APPROVED" | "REJECTED" | "ARCHIVED"

type BoqHeader = {
  boq_id: string
  project_id: string
  project_name: string
  customer_name: string
  status: BoqStatus
  total_items: number
  total_value: number
  created_at: string
  updated_at: string
  created_by: string
}

type BoqItem = {
  item_id: string
  line_no: number
  description: string
  category: string
  volume: number
  unit: string
  unit_price: number
}

// ================= HELPERS =================
function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0)
}

function generateTempId() {
  return `tmp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function validateVolume(value: number): number {
  if (isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 999999) return 999999
  return value
}

function validatePrice(value: number): number {
  if (isNaN(value)) return 0
  if (value < 0) return 0
  if (value > 999999999) return 999999999
  return value
}

// ================= PAGE =================
export default function BoqDetailPage() {
  const params = useParams()
  const router = useRouter()
  const boqId = params?.boq_id as string

  const [header, setHeader] = useState<BoqHeader | null>(null)
  const [items, setItems] = useState<BoqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const lockMode = useMemo(
    () => header && header.status !== "DRAFT",
    [header]
  )

  // ================= UNSAVED CHANGES WARNING =================
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsaved])

  // ================= KEYBOARD SHORTCUTS =================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!lockMode && hasUnsaved) {
          handleSave()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lockMode, hasUnsaved, handleSave])

  // ================= LOAD DATA =================
  async function loadData() {
    if (!boqId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/estimator/boq/${boqId}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch BOQ: ${res.status}`)
      }
      const json = await res.json() as { header: BoqHeader; items: BoqItem[] }

      const sortedItems = (json.items || []).sort((a, b) => a.line_no - b.line_no)

      setHeader(json.header)
      setItems(sortedItems)
      setHasUnsaved(false)
    } catch (err: any) {
      console.error("Error load BOQ detail:", err)
      setError("Gagal memuat data BOQ")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [boqId])

  // ================= INLINE ITEM HANDLER =================
  const updateItem = useCallback((itemId: string, patch: Partial<BoqItem>) => {
    setItems((prev) =>
      prev.map((it) =>
        it.item_id === itemId ? { ...it, ...patch } : it
      )
    )
    setHasUnsaved(true)
  }, [])

  const addRow = useCallback(() => {
    if (!header) return

    const maxLine =
      items.length > 0 ? Math.max(...items.map((it) => it.line_no || 0)) : 0

    const newItem: BoqItem = {
      item_id: generateTempId(),
      line_no: maxLine + 1,
      description: "",
      category: "",
      volume: 0,
      unit: "",
      unit_price: 0,
    }

    setItems((prev) => [...prev, newItem])
    setHasUnsaved(true)
  }, [header, items])

  const removeRow = useCallback((itemId: string) => {
    if (!confirm("Hapus baris ini dari BOQ?")) return
    setItems((prev) => prev.filter((it) => it.item_id !== itemId))
    setHasUnsaved(true)
  }, [])

  // ================= TOTALS =================
  const totals = useMemo(() => {
    const total_items = items.length
    const total_value = items.reduce(
      (sum, it) => sum + (validateVolume(it.volume) * validatePrice(it.unit_price)),
      0
    )
    const total_volume = items.reduce((sum, it) => sum + validateVolume(it.volume), 0)

    return { total_items, total_value, total_volume }
  }, [items])

  // ================= SAVE =================
  const handleSave = useCallback(async () => {
    if (!header) return
    setSaving(true)
    setError(null)

    try {
      const payload = {
        header: {
          ...header,
          total_items: totals.total_items,
          total_value: totals.total_value,
        },
        items: items.map(item => ({
          ...item,
          volume: validateVolume(item.volume),
          unit_price: validatePrice(item.unit_price)
        })),
      }

      const res = await fetch(`/api/estimator/boq/${header.boq_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Failed to save BOQ: ${res.status}`)
      }

      await loadData()
      setHasUnsaved(false)
    } catch (err) {
      console.error("Save BOQ error:", err)
      setError("Gagal menyimpan perubahan")
    } finally {
      setSaving(false)
    }
  }, [header, items, totals])

  // ================= LOCK =================
  const handleToggleLock = useCallback(async () => {
    if (!header) return
    if (!lockMode) {
      const ok = confirm(
        "Setelah di-lock, BOQ tidak bisa di-edit (kecuali oleh admin). Lanjut lock?"
      )
      if (!ok) return
    }

    try {
      setSaving(true)
      setError(null)

      const res = await fetch(
        `/api/estimator/boq/${header.boq_id}/lock`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lock: !lockMode,
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to toggle lock")
      }

      await loadData()
    } catch (err) {
      console.error("Lock BOQ error:", err)
      setError("Gagal mengubah status lock")
    } finally {
      setSaving(false)
    }
  }, [header, lockMode])

  // ================= RENDER LOADING =================
  if (loading && !header) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-500">
          <RefreshCw className="animate-spin" size={18} />
          <span>Loading BOQ...</span>
        </div>
      </div>
    )
  }

  // ================= RENDER ERROR =================
  if (error && !header) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-red-200 text-red-600 px-6 py-4 rounded-lg shadow-sm flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    )
  }

  if (!header) return null

  const statusColor: Record<BoqStatus, string> = {
    DRAFT: "bg-amber-100 text-amber-700",
    LOCKED: "bg-slate-200 text-slate-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-purple-100 text-purple-700",
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="p-2 bg-slate-100 rounded-xl">
              <FileText size={20} className="text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-light text-slate-900">
                  BOQ Detail
                </h1>
                <span
                  className={
                    "px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wide " +
                    statusColor[header.status]
                  }
                >
                  {header.status}
                </span>
                {hasUnsaved && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse" />
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {header.boq_id} • {header.project_name} •{" "}
                <span className="font-medium">{header.customer_name}</span>
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex flex-wrap gap-2 justify-end">
            <div className="hidden sm:block text-right mr-3">
              <p className="text-[11px] text-slate-500">
                Total Value (live)
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {formatIDR(totals.total_value)}
              </p>
            </div>

            <button
              onClick={loadData}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              disabled={saving}
            >
              <RefreshCw
                size={14}
                className={saving ? "animate-spin" : ""}
              />
              Reload
            </button>

            {!lockMode && (
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsaved}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}

            <button
              onClick={handleToggleLock}
              disabled={saving}
              className={
                "inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border " +
                (lockMode
                  ? "border-amber-600 text-amber-700 bg-amber-50 hover:bg-amber-100"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100")
              }
            >
              {lockMode ? (
                <>
                  <Lock size={14} /> Locked
                </>
              ) : (
                <>
                  <LockOpen size={14} /> Lock BOQ
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* INFO BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] text-slate-500">Project</p>
            <p className="text-sm font-medium text-slate-800">
              {header.project_name}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {header.project_id}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] text-slate-500">Customer</p>
            <p className="text-sm font-medium text-slate-800">
              {header.customer_name}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] text-slate-500">Total Items</p>
            <p className="text-xl font-light text-slate-900">
              {totals.total_items}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3">
            <p className="text-[11px] text-slate-500">Total Value</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatIDR(totals.total_value)}
            </p>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ITEMS TABLE */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* table header actions */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <Edit3 size={16} className="text-slate-500" />
              <p className="text-xs text-slate-600">
                Inline BOQ Editor • Klik kolom untuk edit
              </p>
            </div>

            {!lockMode && (
              <button
                onClick={addRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                <Plus size={14} />
                Add Row
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-14 px-3 py-2 text-left text-[11px] uppercase text-slate-500">
                    No
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] uppercase text-slate-500">
                    Description
                  </th>
                  <th className="w-40 px-3 py-2 text-left text-[11px] uppercase text-slate-500">
                    Category
                  </th>
                  <th className="w-24 px-3 py-2 text-right text-[11px] uppercase text-slate-500">
                    Volume
                  </th>
                  <th className="w-24 px-3 py-2 text-left text-[11px] uppercase text-slate-500">
                    Unit
                  </th>
                  <th className="w-36 px-3 py-2 text-right text-[11px] uppercase text-slate-500">
                    Unit Price
                  </th>
                  <th className="w-40 px-3 py-2 text-right text-[11px] uppercase text-slate-500">
                    Subtotal
                  </th>
                  <th className="w-16 px-3 py-2 text-center text-[11px] uppercase text-slate-500">
                    {/* actions */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const subtotal = validateVolume(item.volume) * validatePrice(item.unit_price)

                  return (
                    <tr
                      key={item.item_id}
                      className={
                        "border-b border-slate-100 hover:bg-slate-50 " +
                        (idx % 2 === 0 ? "bg-white" : "bg-slate-50/40")
                      }
                    >
                      {/* No */}
                      <td className="px-3 py-2 align-top text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Description */}
                      <td className="px-3 py-2 align-top">
                        <textarea
                          disabled={lockMode}
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.item_id, {
                              description: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full resize-none rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100"
                          placeholder="Uraian pekerjaan..."
                        />
                      </td>

                      {/* Category */}
                      <td className="px-3 py-2 align-top">
                        <input
                          disabled={lockMode}
                          value={item.category}
                          onChange={(e) =>
                            updateItem(item.item_id, {
                              category: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100"
                          placeholder="Kategori"
                        />
                      </td>

                      {/* Volume */}
                      <td className="px-3 py-2 align-top text-right">
                        <input
                          disabled={lockMode}
                          type="number"
                          step="0.0001"
                          min="0"
                          max="999999"
                          value={item.volume ?? ""}
                          onChange={(e) =>
                            updateItem(item.item_id, {
                              volume: validateVolume(Number(e.target.value || 0)),
                            })
                          }
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100"
                          placeholder="0"
                        />
                      </td>

                      {/* Unit */}
                      <td className="px-3 py-2 align-top">
                        <input
                          disabled={lockMode}
                          value={item.unit}
                          onChange={(e) =>
                            updateItem(item.item_id, {
                              unit: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100"
                          placeholder="m2, m3, ls"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="px-3 py-2 align-top text-right">
                        <input
                          disabled={lockMode}
                          type="number"
                          step="100"
                          min="0"
                          max="999999999"
                          value={item.unit_price ?? ""}
                          onChange={(e) =>
                            updateItem(item.item_id, {
                              unit_price: validatePrice(Number(e.target.value || 0)),
                            })
                          }
                          className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 disabled:bg-slate-100"
                          placeholder="0"
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="px-3 py-2 align-top text-right font-mono text-slate-700">
                        {formatIDR(subtotal)}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2 align-top text-center">
                        {!lockMode && (
                          <button
                            onClick={() => removeRow(item.item_id)}
                            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-red-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-slate-400 text-xs"
                    >
                      Belum ada item BOQ.{" "}
                      {!lockMode && (
                        <button
                          onClick={addRow}
                          className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                        >
                          Tambah baris pertama
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>

              {/* FOOTER TOTAL */}
              <tfoot>
                <tr className="bg-slate-100 border-t border-slate-200">
                  <td colSpan={4} className="px-3 py-3 text-[11px] text-slate-500">
                    {totals.total_items} item • Total volume:{" "}
                    <span className="font-semibold">
                      {totals.total_volume.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td colSpan={2} className="px-3 py-3 text-right text-[11px] text-slate-500">
                    TOTAL
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-900">
                    {formatIDR(totals.total_value)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BOTTOM INFO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            <p>
              Created by <span className="font-medium">{header.created_by}</span>{" "}
              at{" "}
              {new Date(header.created_at).toLocaleString("id-ID")}
            </p>
            {header.updated_at && (
              <p>
                Last update:{" "}
                {new Date(header.updated_at).toLocaleString("id-ID")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Check size={12} className="text-emerald-500" />
            <span>Changes are only saved after you click “Save”.</span>
            {hasUnsaved && (
              <span className="text-amber-600">(Ctrl+S to save)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
