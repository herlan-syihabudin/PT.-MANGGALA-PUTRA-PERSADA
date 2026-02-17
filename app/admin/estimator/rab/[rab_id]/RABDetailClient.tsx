"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"
import AddItemForm from "./AddItemForm"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { Copy, Trash2, ChevronDown, Upload } from "lucide-react"

type RabItem = {
  item_id: string
  rab_id: string
  project_id: string
  scope: string
  item_name: string
  category: string
  qty: number
  unit: string
  material_price: number
  labour_price: number
  unit_price: number
  total_price: number
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

type RabResponse = {
  rab_id?: string
  project_id: string
  header?: any
  summary: { total_items: number; total_value: number }
  items: RabItem[]
}

type Props = {
  rab_id: string
  project_id: string
  initialData: RabResponse
}

/* ================= helpers ================= */

function n(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}

function pad3(i: number) {
  return String(i).padStart(3, "0")
}

function groupByScope(items: RabItem[]) {
  const map = new Map<string, RabItem[]>()
  for (const it of items) {
    const key = (it.scope || "Tanpa Scope").trim() || "Tanpa Scope"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(it)
  }
  // stable order: scope A-Z, items by created_at then item_name
  const scopes = Array.from(map.keys()).sort((a, b) => a.localeCompare(b))
  return scopes.map((scope) => ({
    scope,
    items: (map.get(scope) || []).slice().sort((a, b) => {
      const ta = a.created_at || ""
      const tb = b.created_at || ""
      if (ta !== tb) return ta.localeCompare(tb)
      return (a.item_name || "").localeCompare(b.item_name || "")
    }),
  }))
}

function handlePrint() {
  const printContent = document.getElementById("print-area")
  if (!printContent) return

  const win = window.open("", "", "width=1000,height=800")
  if (!win) return

  win.document.write(`
    <html>
      <head>
        <title>RAB Proposal</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
          }

          h2 {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }

          th, td {
            border: 1px solid #ccc;
            padding: 6px;
          }

          th {
            background: #f3f3f3;
          }

          input {
            border: none;
          }

          button {
            display: none;
          }

          summary {
            display: none;
          }

          details {
            display: block;
          }

          .right {
            text-align: right;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <h2>RINCIAN ANGGARAN BIAYA</h2>
        ${printContent.innerHTML}
      </body>
    </html>
  `)

  win.document.close()
  win.print()
}

/* ================= inline editor ================= */

function useDebouncedCommit<T extends (...args: any[]) => void>(fn: T, delay = 600) {
  const [timer, setTimer] = useState<any>(null)
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    const t = setTimeout(() => fn(...args), delay)
    setTimer(t)
  }
}

export default function RABDetailClient({ rab_id, project_id, initialData }: Props) {
  const [data, setData] = useState<RabResponse>(initialData)
  const [loading, setLoading] = useState(false)

  // ===== ENTERPRISE STATES =====
const [searchTerm, setSearchTerm] = useState("")
const [expandAll, setExpandAll] = useState(true)
const [lockMode, setLockMode] = useState<boolean>(data.header?.status === "LOCKED")

// global numbering
const globalItems = useMemo(() => {
  return [...data.items].sort((a, b) => {
    const ta = a.created_at || ""
    const tb = b.created_at || ""
    return ta.localeCompare(tb)
  })
}, [data.items])

const globalIndexMap = useMemo(() => {
  const map = new Map<string, number>()
  globalItems.forEach((it, i) => {
    map.set(it.item_id, i + 1)
  })
  return map
}, [globalItems])

  // profit panel
  const [overheadPct, setOverheadPct] = useState<number>(10)
  const [profitPct, setProfitPct] = useState<number>(10)

  async function reload() {
    setLoading(true)
    const res = await fetch(`/api/estimator/rab?rab_id=${rab_id}`, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setLoading(false)
  }

  // ✅ realtime sum (front) — tetap ada backend recalculation juga
  const totalValue = useMemo(
    () => data.items.reduce((sum, i) => sum + n(i.total_price), 0),
    [data.items]
  )

  const totalMaterial = useMemo(
    () => data.items.reduce((sum, i) => sum + n(i.material_price) * n(i.qty), 0),
    [data.items]
  )

  const totalLabour = useMemo(
    () => data.items.reduce((sum, i) => sum + n(i.labour_price) * n(i.qty), 0),
    [data.items]
  )

  const sellTotal = useMemo(() => {
    const factor = 1 + overheadPct / 100 + profitPct / 100
    return Math.round(totalValue * factor)
  }, [totalValue, overheadPct, profitPct])

  const filteredItems = useMemo(() => {
  if (!searchTerm) return data.items
  return data.items.filter(
    (i) =>
      i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [data.items, searchTerm])

const grouped = useMemo(() => groupByScope(filteredItems), [filteredItems])
  function scopeTotal(items: RabItem[]) {
  return items.reduce((sum, i) => sum + n(i.total_price), 0)
}

  /* ================= CRUD ================= */

  async function updateField(item_id: string, patch: Partial<RabItem>) {
    // optimistic update
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.item_id === item_id ? { ...it, ...patch } : it)),
    }))

    await fetch("/api/estimator/rab/item/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        item_id,
        patch,
      }),
    })

    // refresh to normalize numbers + totals from backend
    reload()
  }

  const debouncedUpdate = useDebouncedCommit(updateField, 650)

  async function copyItem(item: RabItem) {
    setLoading(true)
    const res = await fetch("/api/estimator/rab/item/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        project_id,
        scope: item.scope,
        item_name: `${item.item_name} (Copy)`,
        category: item.category,
        qty: item.qty,
        unit: item.unit,
        material_price: item.material_price,
        labour_price: item.labour_price,
        created_by: "Estimator",
      }),
    })
    setLoading(false)
    if (!res.ok) {
      alert("Gagal copy item")
      return
    }
    reload()
  }

  async function deleteItem(item: RabItem) {
    const ok = confirm(`Hapus item?\n\n${item.item_name}`)
    if (!ok) return

    setLoading(true)
    const res = await fetch("/api/estimator/rab/item/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rab_id, item_id: item.item_id }),
    })
    setLoading(false)

    if (!res.ok) {
      alert("Gagal hapus item")
      return
    }
    reload()
  }

  /* ================= Bulk Upload Excel ================= */

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0]
    if (!file) return

    try {
      setLoading(true)
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" })

      // Expect columns (header) in Excel:
      // scope, item_name, category, qty, unit, material_price, labour_price
      const payloadItems = rows
        .map((r: any) => ({
          scope: String(r.scope || r.Scope || "").trim(),
          item_name: String(r.item_name || r["item name"] || r.Item || "").trim(),
          category: String(r.category || r.Kategori || "").trim(),
          qty: n(r.qty || r.Qty || r.volume || 0),
          unit: String(r.unit || r.Unit || "").trim(),
          material_price: n(r.material_price || r.Material || 0),
          labour_price: n(r.labour_price || r.Labour || 0),
        }))
        .filter((x: any) => x.item_name)

      if (payloadItems.length === 0) {
        alert("File kosong / header tidak sesuai. Minimal ada kolom item_name.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/estimator/rab/item/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rab_id,
          project_id,
          created_by: "Estimator",
          items: payloadItems,
        }),
      })

      setLoading(false)

      if (!res.ok) {
        const t = await res.text()
        alert("Gagal bulk upload: " + t)
        return
      }

      reload()
    } catch (e: any) {
      setLoading(false)
      alert("Gagal baca Excel: " + (e?.message || "unknown error"))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  })

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="text-xl font-semibold">RAB Project – Estimator</h1>
          <p className="text-xs text-gray-500">RAB ID: {rab_id}</p>
          <p className="text-xs text-gray-500">Project ID: {project_id || "-"}</p>
        </div>

        <div className="flex items-center gap-3">
  <button
    onClick={reload}
    className="text-xs px-3 py-2 border rounded hover:bg-gray-50"
    disabled={loading}
  >
    {loading ? "Refreshing..." : "Refresh"}
  </button>

  <button
    onClick={handlePrint}
    className="text-xs px-3 py-2 border rounded hover:bg-gray-50"
  >
    Print
  </button>

  <Link href="/admin/estimator/rab" className="text-xs text-gray-600">
    ← Kembali
  </Link>
</div>
      </div>

      {/* ADD ITEM */}
      <AddItemForm
        rab_id={rab_id}
        project_id={project_id}
        onCreated={(newItem) => {
          // optimistic append
          setData((prev) => ({ ...prev, items: [...prev.items, newItem] }))
        }}
        onSuccess={reload}
      />

      {/* BULK UPLOAD */}
      <div className="space-y-2">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Upload size={16} /> Bulk Upload Excel
        </div>

        <div
          {...getRootProps()}
          className={`border rounded-lg p-4 text-sm cursor-pointer bg-white ${
            isDragActive ? "border-blue-500" : "border-gray-200"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <div>Drop file Excel di sini…</div>
          ) : (
            <div className="text-gray-600">
              Drag & drop file <b>.xlsx</b> atau klik untuk pilih file. <br />
              Header Excel yang disarankan: <code>scope, item_name, category, qty, unit, material_price, labour_price</code>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY + PROFIT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide">RAB Summary</div>
          <div className="text-sm">
            Total Item: <b>{data.items.length}</b>
          </div>
          <div className="text-sm">
            Total Nilai RAB: <b className="text-green-700">{formatIDR(totalValue)}</b>
          </div>
          <div className="text-xs text-gray-500">
            (Realtime dari item. Backend juga recalculation biar aman.)
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Cost Breakdown</div>
          <div className="text-sm">
            Total Material: <b>{formatIDR(totalMaterial)}</b>
          </div>
          <div className="text-sm">
            Total Labour: <b>{formatIDR(totalLabour)}</b>
          </div>
          <div className="text-xs text-gray-500">
            (Material/Labour dihitung: price × qty)
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Profit Panel</div>

          <div className="space-y-1">
            <div className="text-xs text-gray-600">Overhead / Margin (%)</div>
            <input
              type="range"
              min={0}
              max={50}
              value={overheadPct}
              onChange={(e) => setOverheadPct(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-700">{overheadPct}%</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-gray-600">Profit (%)</div>
            <input
              type="range"
              min={0}
              max={50}
              value={profitPct}
              onChange={(e) => setProfitPct(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-700">{profitPct}%</div>
          </div>

          <div className="text-sm">
            Estimasi Harga Jual:{" "}
            <b className="text-blue-700">{formatIDR(sellTotal)}</b>
          </div>
        </div>
      </div>

      {/* ENTERPRISE CONTROL PANEL */}
<div className="bg-white border rounded-lg p-4 flex items-center justify-between gap-4 sticky top-0 z-10">
  <div className="flex items-center gap-3">
    <input
      placeholder="Search item / scope..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="border rounded px-3 py-1 text-sm"
    />

    <button
      onClick={() => setExpandAll(!expandAll)}
      className="text-xs px-3 py-1 border rounded"
    >
      {expandAll ? "Collapse All" : "Expand All"}
    </button>
  </div>

  <div className="text-sm font-semibold">
    GRAND TOTAL:{" "}
    <span className="text-green-700">
      {formatIDR(totalValue)}
    </span>
  </div>
</div>
      
      {/* ACCORDION BY SCOPE */}
<div id="print-area" className="space-y-3">
        <div className="text-sm font-semibold">Item RAB (Grouped by Scope)</div>

        {grouped.length === 0 ? (
          <div className="bg-white border rounded-lg p-6 text-center text-sm text-gray-500">
            Belum ada item RAB
          </div>
        ) : (
          grouped.map((g) => (
            <details
  key={g.scope}
  className="bg-white border rounded-lg overflow-hidden"
  open={expandAll}
>
              <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none bg-gray-50">
                <div className="font-semibold text-sm">{g.scope}</div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{g.items.length} item</span>
                  <ChevronDown size={16} />
                </div>
              </summary>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr className="border-b">
                      <th className="p-3 text-left w-[70px]">No</th>
                      <th className="p-3 text-left min-w-[320px]">Item</th>
                      <th className="p-3 text-left w-[120px]">Kategori</th>
                      <th className="p-3 text-left w-[90px]">Qty</th>
                      <th className="p-3 text-left w-[90px]">Unit</th>
                      <th className="p-3 text-left w-[140px]">Material</th>
                      <th className="p-3 text-left w-[140px]">Labour</th>
                      <th className="p-3 text-left w-[140px]">Unit Price</th>
                      <th className="p-3 text-left w-[160px]">Total</th>
                      <th className="p-3 text-left w-[120px]">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {g.items.map((it, idx) => (
                      <tr key={it.item_id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-500">
  {pad3(globalIndexMap.get(it.item_id) || idx + 1)}
</td>

                        {/* item_name */}
                        <td className="p-3">
                          <input
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.item_name}
                            onBlur={(e) => updateField(it.item_id, { item_name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                ;(e.target as HTMLInputElement).blur()
                              }
                            }}
                          />
                          <div className="text-[11px] text-gray-500 mt-1">ID: {it.item_id}</div>
                        </td>

                        {/* category */}
                        <td className="p-3">
                          <input
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.category}
                            onBlur={(e) => updateField(it.item_id, { category: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          />
                        </td>

                        {/* qty */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.qty}
                            onChange={(e) => debouncedUpdate(it.item_id, { qty: n(e.target.value) })}
                            onBlur={(e) => updateField(it.item_id, { qty: n(e.target.value) })}
                          />
                        </td>

                        {/* unit */}
                        <td className="p-3">
                          <input
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.unit}
                            onBlur={(e) => updateField(it.item_id, { unit: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          />
                        </td>

                        {/* material_price */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.material_price}
                            onChange={(e) => debouncedUpdate(it.item_id, { material_price: n(e.target.value) })}
                            onBlur={(e) => updateField(it.item_id, { material_price: n(e.target.value) })}
                          />
                        </td>

                        {/* labour_price */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="w-full border rounded px-2 py-1"
                            defaultValue={it.labour_price}
                            onChange={(e) => debouncedUpdate(it.item_id, { labour_price: n(e.target.value) })}
                            onBlur={(e) => updateField(it.item_id, { labour_price: n(e.target.value) })}
                          />
                        </td>

                        <td className="p-3">{formatIDR(n(it.unit_price))}</td>
                        <td className="p-3 font-semibold text-green-700">{formatIDR(n(it.total_price))}</td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50 flex items-center gap-1"
                              onClick={() => copyItem(it)}
                              disabled={loading}
                            >
                              <Copy size={14} /> Copy
                            </button>
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-red-50 text-red-600 flex items-center gap-1"
                              onClick={() => deleteItem(it)}
                              disabled={loading}
                            >
                              <Trash2 size={14} /> Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
  <tr className="bg-gray-100 font-semibold">
    <td colSpan={8} className="p-3 text-right">
      SUBTOTAL {g.scope}
    </td>
    <td className="p-3 text-green-700">
      {formatIDR(scopeTotal(g.items))}
    </td>
    <td />
  </tr>
</tfoot>
                  
                </table>
              </div>
            </details>
          ))
        )}
      </div>

      
      
      <p className="text-xs text-gray-400">
        🔐 Modul ini adalah sumber RAB resmi. Project Management membaca dari sini.
      </p>
    </div>
  )
}
