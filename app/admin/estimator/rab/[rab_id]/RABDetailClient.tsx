"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"
import AddItemForm from "./AddItemForm"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"
import { Copy, Trash2, ChevronDown, Upload, Printer } from "lucide-react"

/* ================= TYPES ================= */

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
  created_at?: string
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

/* ================= HELPERS ================= */

const n = (x: any) => (Number.isFinite(Number(x)) ? Number(x) : 0)
const pad3 = (i: number) => String(i).padStart(3, "0")

function groupByScope(items: RabItem[]) {
  const map = new Map<string, RabItem[]>()
  for (const it of items) {
    const key = (it.scope || "Tanpa Scope").trim() || "Tanpa Scope"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(it)
  }

  return Array.from(map.keys())
    .sort((a, b) => a.localeCompare(b))
    .map((scope) => ({
      scope,
      items: map.get(scope)!,
    }))
}

/* ================= COMPONENT ================= */

export default function RABDetailClient({
  rab_id,
  project_id,
  initialData,
}: Props) {
  const [data, setData] = useState<RabResponse>(initialData)
  const [loading, setLoading] = useState(false)
  const [overheadPct, setOverheadPct] = useState(10)
  const [profitPct, setProfitPct] = useState(10)

  const isLocked = data.header?.status === "LOCKED"

  async function reload() {
    setLoading(true)
    const res = await fetch(`/api/estimator/rab?rab_id=${rab_id}`, {
      cache: "no-store",
    })
    if (res.ok) {
      const json = await res.json()
      setData(json)
    }
    setLoading(false)
  }

  /* ================= SUMMARY ================= */

  const totalValue = useMemo(
    () => data.items.reduce((s, i) => s + n(i.total_price), 0),
    [data.items]
  )

  const totalMaterial = useMemo(
    () => data.items.reduce((s, i) => s + n(i.material_price) * n(i.qty), 0),
    [data.items]
  )

  const totalLabour = useMemo(
    () => data.items.reduce((s, i) => s + n(i.labour_price) * n(i.qty), 0),
    [data.items]
  )

  const sellTotal = useMemo(() => {
    const factor = 1 + overheadPct / 100 + profitPct / 100
    return Math.round(totalValue * factor)
  }, [totalValue, overheadPct, profitPct])

  const grouped = useMemo(() => groupByScope(data.items), [data.items])

  /* ================= CRUD ================= */

  async function updateField(item_id: string, patch: Partial<RabItem>) {
    await fetch("/api/estimator/rab/item/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rab_id, item_id, patch }),
    })
    reload()
  }

  async function copyItem(item: RabItem) {
    await fetch("/api/estimator/rab/item/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rab_id,
        project_id,
        ...item,
        item_name: item.item_name + " (Copy)",
      }),
    })
    reload()
  }

  async function deleteItem(item: RabItem) {
    if (!confirm("Hapus item?")) return
    await fetch("/api/estimator/rab/item/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rab_id, item_id: item.item_id }),
    })
    reload()
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">RAB Project – Estimator</h1>
          <p className="text-xs text-gray-500">RAB ID: {rab_id}</p>
          <p className="text-xs text-gray-500">Project ID: {project_id}</p>
          <p className="text-xs">
            Status:{" "}
            <span
              className={
                isLocked ? "text-red-600 font-semibold" : "text-blue-600"
              }
            >
              {data.header?.status || "DRAFT"}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={reload}
            className="px-3 py-2 text-xs border rounded"
          >
            Refresh
          </button>

          <Link
            href="/admin/estimator/rab"
            className="text-xs text-gray-600"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border p-4 rounded">
          <div className="text-xs uppercase text-gray-500">
            Total Nilai RAB
          </div>
          <div className="text-lg font-semibold text-green-700">
            {formatIDR(totalValue)}
          </div>
        </div>

        <div className="bg-white border p-4 rounded">
          <div className="text-xs uppercase text-gray-500">
            Cost Breakdown
          </div>
          <div className="text-sm">
            Material: {formatIDR(totalMaterial)}
          </div>
          <div className="text-sm">
            Labour: {formatIDR(totalLabour)}
          </div>
        </div>

        <div className="bg-white border p-4 rounded">
          <div className="text-xs uppercase text-gray-500">
            Estimasi Harga Jual
          </div>
          <div className="text-lg font-semibold text-blue-700">
            {formatIDR(sellTotal)}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {grouped.map((g) => (
        <div key={g.scope} className="bg-white border rounded">
          <div className="p-4 font-semibold bg-gray-50">{g.scope}</div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">No</th>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {g.items.map((it, idx) => (
                <tr key={it.item_id} className="border-b">
                  <td className="p-3">{pad3(idx + 1)}</td>
                  <td className="p-3">{it.item_name}</td>
                  <td className="p-3">{it.qty}</td>
                  <td className="p-3">{it.unit}</td>
                  <td className="p-3 font-semibold text-green-700">
                    {formatIDR(it.total_price)}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => copyItem(it)}
                      className="text-xs border px-2 py-1 rounded"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteItem(it)}
                      className="text-xs border px-2 py-1 rounded text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <p className="text-xs text-gray-400">
        🔐 Modul ini adalah sumber RAB resmi.
      </p>
    </div>
  )
}
