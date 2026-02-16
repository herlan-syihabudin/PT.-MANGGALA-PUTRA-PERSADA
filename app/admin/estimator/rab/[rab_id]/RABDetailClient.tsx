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

  const grouped = useMemo(() => groupByScope(data.items), [data.items])

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
  <div className="p-4 h-[calc(100vh-140px)] flex flex-col gap-4">

    {/* HEADER */}
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-lg font-semibold">RAB Project – Estimator</h1>
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

        <Link href="/admin/estimator/rab" className="text-xs text-gray-600">
          ← Kembali
        </Link>
      </div>
    </div>

    {/* SPLIT SCREEN */}
    <div className="flex flex-1 gap-4 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-[420px] flex flex-col gap-4 overflow-y-auto pr-2">

        <AddItemForm
          rab_id={rab_id}
          project_id={project_id}
          onCreated={(newItem) => {
            setData((prev) => ({ ...prev, items: [...prev.items, newItem] }))
          }}
          onSuccess={reload}
        />

        {/* SUMMARY */}
        <div className="bg-white border rounded-lg p-4 text-sm space-y-2">
          <div>Total Item: <b>{data.items.length}</b></div>
          <div>Total RAB: <b className="text-green-700">{formatIDR(totalValue)}</b></div>
          <div>Material: {formatIDR(totalMaterial)}</div>
          <div>Labour: {formatIDR(totalLabour)}</div>
          <div className="pt-2 border-t">
            Estimasi Jual: <b className="text-blue-700">{formatIDR(sellTotal)}</b>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL */}
<div className="flex-1 bg-white border rounded-lg flex flex-col overflow-hidden">

  <div className="px-4 py-3 border-b text-sm font-semibold bg-gray-50">
    RAB Detail (BOQ View)
  </div>

  <div className="flex-1 overflow-y-auto">

    {grouped.length === 0 ? (
      <div className="p-6 text-center text-sm text-gray-500">
        Belum ada item RAB
      </div>
    ) : (
      grouped.map((g) => {

        const scopeMaterial = g.items.reduce(
          (sum, i) => sum + n(i.material_price) * n(i.qty),
          0
        )

        const scopeLabour = g.items.reduce(
          (sum, i) => sum + n(i.labour_price) * n(i.qty),
          0
        )

        const scopeTotal = g.items.reduce(
          (sum, i) => sum + n(i.total_price),
          0
        )

        return (
          <div key={g.scope} className="border-b">

            {/* SCOPE HEADER */}
            <div className="px-4 py-2 bg-gray-100 font-semibold text-sm">
              {g.scope}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-xs uppercase">
                  <tr>
                    <th className="border px-2 py-2 w-[50px]">No</th>
                    <th className="border px-2 py-2 text-left">Keterangan</th>
                    <th className="border px-2 py-2 w-[80px]">Qty</th>
                    <th className="border px-2 py-2 w-[80px]">Unit</th>
                    <th className="border px-2 py-2 w-[130px]">Material</th>
                    <th className="border px-2 py-2 w-[150px]">Total Material</th>
                    <th className="border px-2 py-2 w-[130px]">Jasa</th>
                    <th className="border px-2 py-2 w-[150px]">Total Jasa</th>
                    <th className="border px-2 py-2 w-[160px]">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {g.items.map((it, idx) => (
                    <tr key={it.item_id} className="hover:bg-gray-50">
                      <td className="border px-2 py-2 text-center">
                        {pad3(idx + 1)}
                      </td>

                      <td className="border px-2 py-2">
                        <div className="font-medium">
                          {it.item_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {it.category}
                        </div>
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {it.qty}
                      </td>

                      <td className="border px-2 py-2 text-center">
                        {it.unit}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatIDR(n(it.material_price))}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatIDR(n(it.material_price) * n(it.qty))}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatIDR(n(it.labour_price))}
                      </td>

                      <td className="border px-2 py-2 text-right">
                        {formatIDR(n(it.labour_price) * n(it.qty))}
                      </td>

                      <td className="border px-2 py-2 text-right font-semibold text-green-700">
                        {formatIDR(n(it.total_price))}
                      </td>
                    </tr>
                  ))}

                  {/* SUBTOTAL PER SCOPE */}
                  <tr className="bg-gray-100 font-semibold">
                    <td colSpan={5} className="border px-2 py-2 text-right">
                      Subtotal {g.scope}
                    </td>

                    <td className="border px-2 py-2 text-right">
                      {formatIDR(scopeMaterial)}
                    </td>

                    <td className="border px-2 py-2"></td>

                    <td className="border px-2 py-2 text-right">
                      {formatIDR(scopeLabour)}
                    </td>

                    <td className="border px-2 py-2 text-right text-green-700">
                      {formatIDR(scopeTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })
    )}

    {/* GRAND TOTAL */}
    <div className="bg-gray-200 px-4 py-3 text-right font-bold text-lg">
      GRAND TOTAL :{" "}
      <span className="text-green-800">
        {formatIDR(totalValue)}
      </span>
    </div>

  </div>
</div>

    </div>

    <p className="text-xs text-gray-400">
      🔐 Modul ini adalah sumber RAB resmi. Project Management membaca dari sini.
    </p>

    </div>
)
}
