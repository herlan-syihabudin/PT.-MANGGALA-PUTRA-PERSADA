"use client"

import { useMemo, useState } from "react"
import { useEffect } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"
import AddItemForm from "./AddItemForm"
import { useDropzone } from "react-dropzone"
import WorkLibraryButton from "./WorkLibraryButton"
import VEClient from "./VEClient"
import * as XLSX from "xlsx"
import { 
  Copy, 
  Trash2, 
  ChevronDown, 
  Upload,
  Search,
  RefreshCw,
  Printer,
  ArrowLeft,
  Package,
  Wrench,
  TrendingUp,
  FileText,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react"
import { toast } from "sonner"

export default function VEPage({
  params,
}: {
  params: { rab_id: string }
}) {
  const { rab_id } = params

  return <VEClient rab_id={rab_id} />
}

// ✅ FIX: Export type biar bisa dipake di page.tsx
export type RabItem = {
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

export type RabResponse = {
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
  mode?: "view" | "edit"
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

function handlePrint(rab_id: string) {
  const printContent = document.getElementById("print-area")
  if (!printContent) return

  const win = window.open("", "", "width=1000,height=800")
  if (!win) return

  win.document.write(`
    <html>
      <head>
        <title>RAB - Rincian Anggaran Biaya</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; padding: 40px; background: white; }
          h1 { font-size: 24px; font-weight: 300; margin-bottom: 8px; color: #1e293b; }
          h2 { font-size: 18px; font-weight: 500; margin-bottom: 24px; color: #475569; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 12px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; color: #1e293b; }
          .scope-header { background: #f1f5f9; font-weight: 600; }
          .text-right { text-align: right; }
          .font-semibold { font-weight: 600; }
          .text-emerald-600 { color: #059669; }
          .mt-8 { margin-top: 32px; }
          .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>RINCIAN ANGGARAN BIAYA (RAB)</h1>
        <h2>ID: ${rab_id}</h2>
        ${printContent.innerHTML}
        <div class="footer">Dokumen ini digenerate secara otomatis dari sistem ERP</div>
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

function InlineEdit({
  value,
  type = "text",
  onSave,
  disabled,
}: {
  value: string | number
  type?: "text" | "number"
  onSave: (val: string) => void
  disabled?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(String(value))

  // ✅ WAJIB supaya sync dengan backend reload
  useEffect(() => {
    setTemp(String(value))
  }, [value])

  const handleSave = () => {
    setEditing(false)
    if (temp !== String(value)) {
      onSave(temp)
    }
  }

  if (disabled) {
    return <span>{value}</span>
  }

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="cursor-pointer px-2 py-1 rounded hover:bg-slate-100 transition"
      >
        {value || "-"}
      </div>
    )
  }

  return (
    <input
      autoFocus
      type={type}
      value={temp}
      onChange={(e) => setTemp(e.target.value)}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSave()
      }}
      className="border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-400 rounded px-2 py-1 w-full text-sm outline-none"
    />
  )
}

export default function RABDetailClient({ 
  rab_id, 
  project_id, 
  initialData,
  mode = "edit"
}: Props) {
  
  const [data, setData] = useState<RabResponse>(initialData)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ===== ENTERPRISE STATES =====
const [searchTerm, setSearchTerm] = useState("")
const [expandAll, setExpandAll] = useState(true)
const isViewMode = mode === "view"

const [lockMode, setLockMode] = useState<boolean>(
  isViewMode ||
  data.header?.status === "LOCKED" ||
  data.header?.status === "Approved"
)

// ✅ baru useEffect di bawahnya
useEffect(() => {
  setLockMode(
    mode === "view" ||
    data.header?.status === "LOCKED" ||
    data.header?.status === "Approved"
  )
}, [mode, data.header?.status])

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
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}`, { cache: "no-store" })

      if (!res.ok) {
        toast.error("Gagal refresh data")
        return
      }

      const raw = await res.json()

      const normalized: RabResponse = {
        rab_id: raw.rab_id,
        project_id: raw.project_id ?? "",
        header: {
          status: raw.status,
          created_by: raw.created_by,
          created_at: raw.created_at,
          customer_name: raw.customer_name,
          project_name: raw.project_name,
        },
        summary: {
          total_items: raw.total_items ?? raw.items?.length ?? 0,
          total_value: raw.total_value ?? 0,
        },
        items: raw.items ?? [],
      }

      setData(normalized)
      setLockMode(
  mode === "view" ||
  normalized.header?.status === "LOCKED" ||
  normalized.header?.status === "Approved"
)

      toast.success("Data berhasil direfresh")
    } catch {
      toast.error("Gagal refresh data")
    } finally {
      setLoading(false)
    }
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
      (i.item_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.scope || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [data.items, searchTerm])

  const grouped = useMemo(() => groupByScope(filteredItems), [filteredItems])
  
  function scopeTotal(items: RabItem[]) {
    return items.reduce((sum, i) => sum + n(i.total_price), 0)
  }

  /* ================= CRUD ================= */

  async function updateField(item_id: string, patch: Partial<RabItem>) {
  if (lockMode) {
    toast.error("RAB dalam mode terkunci")
    return
  }

  // optimistic update
  setData((prev) => ({
  ...prev,
  items: prev.items.map((it) => {
    if (it.item_id !== item_id) return it

    const updated = { ...it, ...patch }

    const unit_price =
      n(updated.material_price) + n(updated.labour_price)

    const total_price =
      n(updated.qty) * unit_price

    return {
      ...updated,
      unit_price,
      total_price,
    }
  }),
}))

  setActionLoading(item_id)

  try {
    const res = await fetch(`/api/estimator/rab/${rab_id}/items/${item_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })

    if (!res.ok) {
      toast.error("Gagal update, rollback")
      reload()
      return
    }

    // ✅ TIDAK reload lagi
  } catch {
    toast.error("Error update, rollback")
    reload()
  } finally {
    setActionLoading(null)
  }
}

  const debouncedUpdate = useDebouncedCommit(updateField, 650)

  async function copyItem(item: RabItem) {
    if (lockMode) {
      toast.error("RAB dalam mode terkunci, tidak dapat menyalin")
      return
    }

    setCopyingId(item.item_id)
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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

      if (!res.ok) {
        const error = await res.text()
        toast.error(`Gagal copy: ${error}`)
        return
      }

      toast.success("Item berhasil disalin")
      reload()
    } catch {
      toast.error("Gagal menyalin item")
    } finally {
      setCopyingId(null)
    }
  }

  async function deleteItem(item: RabItem) {
    if (lockMode) {
      toast.error("RAB dalam mode terkunci, tidak dapat menghapus")
      return
    }

    if (!confirm(`Yakin ingin menghapus item "${item.item_name}"?`)) return

    setDeletingId(item.item_id)
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/items/${item.item_id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.text()
        toast.error(`Gagal hapus: ${error}`)
        return
      }

      toast.success("Item berhasil dihapus")
      reload()
    } catch {
      toast.error("Gagal menghapus item")
    } finally {
      setDeletingId(null)
    }
  }

  /* ================= Bulk Upload Excel ================= */

  const onDrop = async (acceptedFiles: File[]) => {
    if (lockMode) {
      toast.error("RAB dalam mode terkunci, tidak dapat upload")
      return
    }

    const file = acceptedFiles?.[0]
    if (!file) return

    setLoading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" })

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
        toast.error("File kosong / header tidak sesuai")
        setLoading(false)
        return
      }

      const res = await fetch(`/api/estimator/rab/${rab_id}/items/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id,
          created_by: "Estimator",
          items: payloadItems,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        toast.error(`Gagal upload: ${error}`)
        return
      }

      toast.success(`${payloadItems.length} item berhasil diupload`)
      reload()
    } catch (e: any) {
      toast.error(`Gagal baca Excel: ${e?.message || "unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: lockMode,
  })

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <FileText size={24} className="text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-slate-800">
                RAB Project
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                RAB ID: {rab_id} • Project ID: {project_id || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
  {lockMode ? (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs">
      <Lock size={14} />
      <span>Terkunci</span>
    </div>
  ) : (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-xs">
      <Unlock size={14} />
      <span>Dapat Diedit</span>
    </div>
  )}

  <button
    onClick={reload}
    disabled={loading}
    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
    title="Refresh"
  >
    <RefreshCw
      size={16}
      className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
    />
  </button>

  <button
    onClick={() => handlePrint(rab_id)}
    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
    title="Print"
  >
    <Printer size={16} className="text-slate-500" />
  </button>

  {/* 🔥 Tombol ke Value Engineering */}
  <Link
    href={`/admin/estimator/rab/${rab_id}/ve`}
    className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800 transition"
  >
    <TrendingUp size={14} />
    VE Options
  </Link>

  <Link
    href="/admin/estimator/rab"
    className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition"
  >
    <ArrowLeft size={14} />
    Kembali
  </Link>
</div>
        </div>

        {/* TOOLBAR INPUT (Manual + Library) */}
{!lockMode && (
  <div className="flex flex-col lg:flex-row gap-4 items-start">
    
    {/* FORM MANUAL */}
    <div className="flex-1 w-full">
      <AddItemForm
        rab_id={rab_id}
        project_id={project_id}
        onCreated={(newItem: RabItem) => {
          setData((prev) => ({ 
            ...prev, 
            items: [...prev.items, newItem] 
          }))
          toast.success("Item berhasil ditambahkan")
        }}
        onSuccess={reload}
      />
    </div>

    {/* WORK LIBRARY BUTTON */}
    <div className="w-full lg:w-[260px] flex flex-col gap-2">
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        Work Library
      </p>
      <WorkLibraryButton
        rab_id={rab_id}
        project_id={project_id}
        onSuccess={reload}
      />
      <p className="text-[10px] text-slate-400">
        Tarik pekerjaan standar supaya tidak input manual.
      </p>
    </div>

  </div>
)}

        {/* BULK UPLOAD (hanya jika tidak lock) */}
        {!lockMode && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Upload size={16} />
              Bulk Upload Excel
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-sm cursor-pointer transition ${
                isDragActive
                  ? 'border-slate-500 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                {isDragActive ? (
                  <p className="text-slate-600">Drop file di sini...</p>
                ) : (
                  <>
                    <p className="text-slate-600">
                      Drag & drop file <span className="font-semibold">.xlsx</span> atau klik untuk pilih
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Format: scope, item_name, category, qty, unit, material_price, labour_price
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY + PROFIT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-slate-500" />
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">RAB Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Item:</span>
                <span className="font-medium text-slate-800">{data.items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Nilai RAB:</span>
                <span className="font-semibold text-emerald-600">{formatIDR(totalValue)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wrench size={16} className="text-slate-500" />
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cost Breakdown</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Material:</span>
                <span className="font-medium text-slate-800">{formatIDR(totalMaterial)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Labour:</span>
                <span className="font-medium text-slate-800">{formatIDR(totalLabour)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-slate-500" />
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Profit Panel</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Overhead/Margin</span>
                  <span>{overheadPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={overheadPct}
                  onChange={(e) => setOverheadPct(Number(e.target.value))}
                  disabled={lockMode}
                  className="w-full accent-slate-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Profit</span>
                  <span>{profitPct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={profitPct}
                  onChange={(e) => setProfitPct(Number(e.target.value))}
                  disabled={lockMode}
                  className="w-full accent-slate-600"
                />
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                <span className="text-slate-500">Estimasi Harga Jual:</span>
                <span className="font-semibold text-blue-600">{formatIDR(sellTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ENTERPRISE CONTROL PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                placeholder="Cari item / scope..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              />
            </div>

            <button
              onClick={() => setExpandAll(!expandAll)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              {expandAll ? <EyeOff size={16} /> : <Eye size={16} />}
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">GRAND TOTAL:</span>
            <span className="text-lg font-bold text-emerald-600">{formatIDR(totalValue)}</span>
          </div>
        </div>

        {/* ACCORDION BY SCOPE */}
        <div id="print-area" className="space-y-4">
          {grouped.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Belum ada item RAB</p>
              {!lockMode && (
                <p className="text-sm text-slate-400 mt-2">
                  Gunakan form di atas untuk menambah item
                </p>
              )}
            </div>
          ) : (
            grouped.map((g) => (
              <details
                key={g.scope}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                open={expandAll}
              >
                <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition">
                  <div className="font-medium text-slate-800">{g.scope}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{g.items.length} item</span>
                    <ChevronDown size={16} />
                  </div>
                </summary>

                <div className="w-full">
                  <table className="w-full text-sm table-auto">
                    <thead className="bg-slate-50 border-y border-slate-200">
  <tr>
    <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
      No
    </th>

    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">
      Item
    </th>

    <th className="p-3 text-left text-xs font-medium text-slate-500 uppercase">
      Kategori
    </th>

    <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
      Qty
    </th>

    <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
      Unit
    </th>

    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
      Material
    </th>

    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
      Labour
    </th>

    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
      Unit Price
    </th>

    <th className="p-3 text-right text-xs font-medium text-slate-500 uppercase">
      Total
    </th>

    {!lockMode && (
      <th className="p-3 text-center text-xs font-medium text-slate-500 uppercase">
        Aksi
      </th>
    )}
  </tr>
</thead>

                    <tbody className="divide-y divide-slate-100">
  {g.items.map((it, idx) => (
    <tr key={it.item_id} className="hover:bg-slate-50 transition">
      
      {/* NO */}
      <td className="p-3 text-slate-500 font-mono text-center">
        {pad3(globalIndexMap.get(it.item_id) || idx + 1)}
      </td>

      {/* ITEM */}
      <td className="p-3 whitespace-normal">
        <InlineEdit
  value={it.item_name}
  disabled={lockMode || actionLoading === it.item_id}
  onSave={(val) =>
    updateField(it.item_id, { item_name: val })
  }
/>
        <div className="text-[10px] text-slate-400 mt-1 font-mono">
          {it.item_id.slice(-8)}
        </div>
      </td>

      {/* CATEGORY */}
      <td className="p-3">
        <InlineEdit
          value={it.category}
          disabled={lockMode || actionLoading === it.item_id}
          onSave={(val) =>
            updateField(it.item_id, { category: val })
          }
        />
      </td>

      {/* QTY */}
      <td className="p-3 text-center">
        <InlineEdit
  value={it.qty}
  type="number"
  disabled={lockMode || actionLoading === it.item_id}
  onSave={(val) => {
    const parsed = n(val)
    if (!Number.isFinite(parsed) || parsed <= 0) {
  toast.error("Qty harus lebih dari 0")
  return
}
    updateField(it.item_id, { qty: parsed })
  }}
/>
      </td>

      {/* UNIT */}
      <td className="p-3 text-center">
        <InlineEdit
          value={it.unit}
          disabled={lockMode || actionLoading === it.item_id}
          onSave={(val) =>
            updateField(it.item_id, { unit: val })
          }
        />
      </td>

      {/* MATERIAL */}
      <td className="p-3 text-right whitespace-nowrap tabular-nums">
        <InlineEdit
          value={it.material_price}
          type="number"
          disabled={lockMode || actionLoading === it.item_id}
          onSave={(val) =>
            updateField(it.item_id, { material_price: n(val) })
          }
        />
      </td>

      {/* LABOUR */}
      <td className="p-3 text-right whitespace-nowrap tabular-nums">
        <InlineEdit
          value={it.labour_price}
          type="number"
          disabled={lockMode || actionLoading === it.item_id}
          onSave={(val) =>
            updateField(it.item_id, { labour_price: n(val) })
          }
        />
      </td>

      {/* UNIT PRICE (readonly) */}
      <td className="p-3 font-medium text-slate-700 text-right whitespace-nowrap tabular-nums">
        {formatIDR(n(it.unit_price))}
      </td>

      {/* TOTAL (readonly) */}
      <td className="p-3 font-semibold text-emerald-600 text-right whitespace-nowrap tabular-nums">
        {formatIDR(n(it.total_price))}
      </td>

      {/* AKSI */}
      {!lockMode && (
        <td className="p-3">
          <div className="flex items-center justify-center gap-2">
            <button
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
              onClick={() => copyItem(it)}
              disabled={copyingId === it.item_id || actionLoading !== null}
              title="Copy item"
            >
              {copyingId === it.item_id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
              ) : (
                <Copy size={14} className="text-slate-500" />
              )}
            </button>

            <button
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-rose-50 transition disabled:opacity-50"
              onClick={() => deleteItem(it)}
              disabled={deletingId === it.item_id || actionLoading !== null}
              title="Hapus item"
            >
              {deletingId === it.item_id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-400 border-t-transparent" />
              ) : (
                <Trash2 size={14} className="text-rose-500" />
              )}
            </button>
          </div>
        </td>
      )}
    </tr>
  ))}
</tbody>

                    <tfoot className="bg-slate-50 border-t border-slate-200">
  <tr>
    <td
      colSpan={lockMode ? 8 : 9}
      className="p-3 text-right font-medium text-slate-600"
    >
      SUBTOTAL {g.scope}
    </td>

    <td className="p-3 text-right font-bold text-emerald-600">
      {formatIDR(scopeTotal(g.items))}
    </td>

    {!lockMode && <td />}
  </tr>
</tfoot>
                  </table>
                </div>
              </details>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-2 p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <Lock size={14} className="text-slate-400" />
          <p>
            <span className="font-medium text-slate-600">Security Note:</span> Modul ini adalah sumber RAB resmi. 
            {lockMode 
              ? " RAB dalam mode terkunci (read-only)."
              : " Perubahan akan langsung tersimpan dan direfleksikan ke sistem."}
          </p>
        </div>

      </div>
    </div>
  )
}
