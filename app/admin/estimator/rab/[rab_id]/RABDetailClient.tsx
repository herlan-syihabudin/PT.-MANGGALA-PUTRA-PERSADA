"use client"

import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { formatIDR } from "@/lib/format"
import AddItemForm from "./AddItemForm"
import { useDropzone } from "react-dropzone"
import { useRouter } from "next/navigation"
import WorkLibraryButton from "./WorkLibraryButton"
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
  AlertTriangle,
  Download,
  Edit3,
  Plus, Library
} from "lucide-react"
import { toast } from "sonner"

/* ============ TYPES ============ */

export type RabItem = {
  item_id: string
  rab_id: string
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
  inquiry_id?: string   // ✅ TAMBAHKAN INI
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

/* ============ SAFE NUMBER HELPER ============ */
function safeNumber(x: any): number {
  if (x === null || x === undefined || x === "") return 0
  const v = Number(x)
  return Number.isFinite(v) && v >= 0 ? v : 0
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
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
const tb = b.created_at ? new Date(b.created_at).getTime() : 0
return ta - tb
    }),
  }))
}

/* ============ PRINT FUNCTION ============ */
function handlePrint(rab_id: string, data: RabResponse, totalValue: number) {
  const printWindow = window.open("", "_blank", "width=1200,height=800")
  if (!printWindow) return

  const groupedItems = groupByScope(data.items)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RAB - ${rab_id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 40px;
          color: #1e293b;
        }
        .header {
          margin-bottom: 32px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 20px;
        }
        h1 {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        h2 {
          font-size: 14px;
          font-weight: 400;
          color: #64748b;
          margin-top: 4px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: #f1f5f9;
          color: #334155;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
          font-size: 12px;
        }
        th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          text-align: left;
          padding: 12px;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        td {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }
        .scope-header {
          background: #f1f5f9;
          font-weight: 600;
        }
        .text-right { text-align: right; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 24px 0;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
        }
        .summary-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin-top: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>RINCIAN ANGGARAN BIAYA (RAB)</h1>
        <h2>ID: ${rab_id} • ${data.header?.project_name || 'Project'} • ${data.header?.customer_name || 'Customer'}</h2>
        <span class="badge">${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Item</div>
          <div class="summary-value">${data.items.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Material</div>
          <div class="summary-value">${formatIDR(data.items.reduce((sum, i) => sum + safeNumber(i.material_price) * safeNumber(i.qty), 0))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Labour</div>
          <div class="summary-value">${formatIDR(data.items.reduce((sum, i) => sum + safeNumber(i.labour_price) * safeNumber(i.qty), 0))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Nilai</div>
          <div class="summary-value">${formatIDR(totalValue)}</div>
        </div>
      </div>

      ${groupedItems.map(g => `
        <h3 style="margin: 24px 0 12px; font-size: 16px; font-weight: 500;">${g.scope}</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Item Pekerjaan</th>
              <th>Kategori</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Material</th>
              <th>Upah</th>
              <th>Harga Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${g.items.map((it, idx) => {
              const no = String(idx + 1).padStart(3, '0')
              return `
                <tr>
                  <td>${no}</td>
                  <td>${it.item_name}</td>
                  <td>${it.category || '-'}</td>
                  <td class="text-right">${it.qty}</td>
                  <td>${it.unit}</td>
                  <td class="text-right font-mono">${formatIDR(it.material_price)}</td>
                  <td class="text-right font-mono">${formatIDR(it.labour_price)}</td>
                  <td class="text-right font-mono">${formatIDR(it.unit_price)}</td>
                  <td class="text-right font-mono">${formatIDR(it.total_price)}</td>
                </tr>
              `
            }).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc;">
              <td colspan="8" class="text-right" style="font-weight: 600;">SUBTOTAL ${g.scope}</td>
              <td class="text-right font-mono" style="font-weight: 600;">${formatIDR(g.items.reduce((sum, i) => sum + safeNumber(i.total_price), 0))}</td>
            </tr>
          </tfoot>
        </table>
      `).join('')}

      <div class="footer">
        <p>Dokumen ini digenerate secara otomatis dari sistem ERP MPP • ${new Date().toLocaleString('id-ID')}</p>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

/* ============ IMPROVED DEBOUNCE HOOK ============ */
function useDebouncedCommit<T extends (...args: any[]) => void>(fn: T, delay = 600) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
  
  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

/* ============ INLINE EDIT ============ */

function InlineEdit({
  value,
  type = "text",
  onSave,
  disabled,
  validate,
}: {
  value: string | number
  type?: "text" | "number"
  onSave: (val: string) => void
  disabled?: boolean
  validate?: (val: any) => boolean | string
}) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(String(value))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTemp(String(value))
    setError(null)
  }, [value])

  const handleSave = () => {
    if (validate) {
      const result = validate(temp)
      if (result !== true) {
        setError(typeof result === "string" ? result : "Validasi gagal")
        return
      }
    }
    
    setEditing(false)
    setError(null)
    if (temp !== String(value)) {
      onSave(temp)
    }
  }

  if (disabled) return <span className="text-slate-600">{value}</span>

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="group cursor-pointer px-2 py-1 rounded-md hover:bg-slate-100 transition flex items-center gap-1"
      >
        <span className="text-slate-700">{value || "-"}</span>
        <Edit3 size={12} className="opacity-0 group-hover:opacity-50 text-slate-400" />
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        autoFocus
        type={type}
        value={temp}
        onChange={(e) => {
          setTemp(e.target.value)
          setError(null)
        }}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave()
          if (e.key === "Escape") {
            setTemp(String(value))
            setEditing(false)
            setError(null)
          }
        }}
        className={`w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-300 focus:ring-red-200' 
            : 'border-slate-300 focus:border-slate-500 focus:ring-slate-200'
        }`}
        step={type === "number" ? "any" : undefined}
      />
      {error && (
        <div className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}

/* ============ MAIN CLIENT COMPONENT ============ */

export default function RABDetailClient({
  rab_id,
  project_id,
  initialData,
  mode = "edit",
}: Props) {
  const [data, setData] = useState<RabResponse>(initialData)
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [expandAll, setExpandAll] = useState(true)

  const statusNormalized = (data.header?.status || "DRAFT").toUpperCase()
  const lockMode =
    mode === "view" ||
    statusNormalized === "LOCKED" ||
    statusNormalized === "APPROVED"

  const globalItems = useMemo(() => {
    return [...data.items].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
const tb = b.created_at ? new Date(b.created_at).getTime() : 0
return ta - tb
    })
  }, [data.items])

  // Item numbering based on created_at timestamp
  const globalIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    const sorted = [...globalItems].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return ta - tb
    })
    sorted.forEach((it, i) => {
      map.set(it.item_id, i + 1)
    })
    return map
  }, [globalItems])

  const [overheadPct, setOverheadPct] = useState<number>(10)
  const [profitPct, setProfitPct] = useState<number>(10)
  const [openAdd, setOpenAdd] = useState(false)

  const loadingRef = useRef(false)

async function reload() {
  if (loadingRef.current) return
  loadingRef.current = true
  setLoading(true)

  try {
    const res = await fetch(`/api/estimator/rab/${rab_id}`, { cache: "no-store" })

    if (!res.ok) {
      toast.error("Gagal refresh data")
      return
    }

    const raw = await res.json()

    // ✅ PERBAIKI NORMALISASI - pastikan inquiry_id terbaca
    const normalized: RabResponse = {
  rab_id: raw.rab_id,
  inquiry_id: raw.inquiry_id ?? "",   // ✅ TAMBAHKAN INI
  project_id: raw.project_id ?? "",
  header: {
    inquiry_id: raw.inquiry_id ?? "",
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
    toast.success("Data berhasil direfresh")
  } catch {
    toast.error("Gagal refresh data")
  } finally {
    loadingRef.current = false
    setLoading(false)
  }
}

  const totalValue = useMemo(
    () => data.items.reduce((sum, i) => sum + safeNumber(i.total_price), 0),
    [data.items]
  )

  const totalMaterial = useMemo(
    () => data.items.reduce((sum, i) => sum + safeNumber(i.material_price) * safeNumber(i.qty), 0),
    [data.items]
  )

  const totalLabour = useMemo(
    () => data.items.reduce((sum, i) => sum + safeNumber(i.labour_price) * safeNumber(i.qty), 0),
    [data.items]
  )

  const sellTotal = useMemo(() => {
    const factor = 1 + overheadPct / 100 + profitPct / 100
    return Math.round(totalValue * factor)
  }, [totalValue, overheadPct, profitPct])

  const filteredItems = useMemo(() => {
  if (!searchTerm) return data.items

  const q = searchTerm.toLowerCase()

  return data.items.filter((i) =>
    (i.item_name || "").toLowerCase().includes(q) ||
    (i.scope || "").toLowerCase().includes(q) ||
    (i.category || "").toLowerCase().includes(q)
  )
}, [data.items, searchTerm])

  const grouped = useMemo(() => groupByScope(filteredItems), [filteredItems])

  function scopeTotal(items: RabItem[]) {
    return items.reduce((sum, i) => sum + safeNumber(i.total_price), 0)
  }

  async function updateField(item_id: string, patch: Partial<RabItem>) {
    if (lockMode) {
      toast.error("RAB dalam mode terkunci")
      return
    }

    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.item_id !== item_id) return it

        const updated = { ...it, ...patch }

        const unit_price = safeNumber(updated.material_price) + safeNumber(updated.labour_price)
        const total_price = safeNumber(updated.qty) * unit_price

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
    } catch {
      toast.error("Error update, rollback")
      reload()
    } finally {
      setActionLoading(null)
    }
  }

  async function addEmptyRow(afterItem: RabItem) {
  if (lockMode) return

  try {
    const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scope: afterItem.scope || "",
        item_name: "",
        category: "",
        qty: 1,
        unit: "",
        material_price: 0,
        labour_price: 0,
        created_by: "Estimator",
      }),
    })

    if (!res.ok) {
      toast.error("Gagal menambah item")
      return
    }

    const result = await res.json()

    setData((prev) => ({
      ...prev,
      items: [...prev.items, result.item],
    }))

  } catch {
    toast.error("Error tambah item")
  }
}

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

  const router = useRouter()

  async function handleGenerateProposal() {
    console.log("=== DEBUG RAB DATA ===")
  console.log("Full data:", data)
  console.log("Header:", data?.header)
  console.log("inquiry_id in header:", data?.header?.inquiry_id)
  console.log("inquiry_id in root:", data?.inquiry_id)
  console.log("project_id:", project_id)
  console.log("rab_id:", rab_id)

  if (!rab_id) {
    toast.error("RAB ID tidak ditemukan")
    return
  }

  // ambil inquiry id dari header
  const inquiryId =
    data?.header?.inquiry_id ||
    data?.inquiry_id ||
    ""

  if (!inquiryId) {
    toast.error("Inquiry belum terhubung ke CRM")
    return
  }

  if (!confirm("Generate proposal dari RAB ini?")) return

  try {

    const res = await fetch("/api/crm/proposal/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inquiry_id: inquiryId,
        rab_id: rab_id,
        total_value: sellTotal,
        created_by: "Estimator",
      }),
    })

    const result = await res.json()

    if (!res.ok) {

      if (res.status === 409) {
        toast.error(`Proposal sudah ada: ${result.proposal_id}`)

        if (confirm("Buka proposal yang sudah ada?")) {
          router.push(`/admin/crm/proposal/${result.proposal_id}`)
        }

        return
      }

      toast.error(result.error || "Gagal membuat proposal")
      return
    }

    toast.success("Proposal berhasil dibuat")

    router.push(`/admin/crm/proposal/${result.proposal_id}`)

  } catch (err:any) {

    console.error(err)
    toast.error("Terjadi kesalahan saat generate proposal")

  }
}

  // Enhanced Excel validation
  const validateExcelRow = (row: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!row.item_name && !row["item name"] && !row.Item) {
      errors.push(`Baris ${index + 1}: Nama item wajib diisi`)
    }
    
    const qty = Number(row.qty || row.Qty || row.volume || 0)
    if (qty <= 0) {
      errors.push(`Baris ${index + 1}: Quantity harus lebih dari 0`)
    }
    
    const material = Number(row.material_price || row.Material || 0)
    if (material < 0) {
      errors.push(`Baris ${index + 1}: Harga material tidak boleh negatif`)
    }
    
    const labour = Number(row.labour_price || row.Labour || 0)
    if (labour < 0) {
      errors.push(`Baris ${index + 1}: Harga upah tidak boleh negatif`)
    }
    
    return { valid: errors.length === 0, errors }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (lockMode) {
      toast.error("RAB dalam mode terkunci, tidak dapat upload")
      return
    }

    const file = acceptedFiles?.[0]
    if (!file) return

    setBulkLoading(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: "array" })
      const sheetName = wb.SheetNames?.[0]
if (!sheetName) {
  toast.error("File Excel tidak memiliki sheet")
  return
}

const ws = wb.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" }) || []

      // Validate all rows first
      const validationErrors: string[] = []
      rows.forEach((row, idx) => {
        const { valid, errors } = validateExcelRow(row, idx)
        if (!valid) {
          validationErrors.push(...errors)
        }
      })

      if (validationErrors.length > 0) {
        toast.error(`Validasi gagal:\n${validationErrors.slice(0, 3).join('\n')}${validationErrors.length > 3 ? `\n...dan ${validationErrors.length - 3} error lainnya` : ''}`)
        return
      }

      const payloadItems = rows
        .map((r: any) => {
          const item_name = String(r.item_name || r["item name"] || r.Item || "").trim()
          if (!item_name) return null

          const qty = Math.max(1, Number(r.qty || r.Qty || r.volume || 1))
          
          return {
            scope: String(r.scope || r.Scope || "").trim() || "Umum",
            item_name,
            category: String(r.category || r.Kategori || "").trim() || "Umum",
            qty: qty,
            unit: String(r.unit || r.Unit || "").trim() || "Unit",
            material_price: Math.max(0, Number(r.material_price || r.Material || 0)),
            labour_price: Math.max(0, Number(r.labour_price || r.Labour || 0)),
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)

      if (payloadItems.length === 0) {
        toast.error("Tidak ada data valid untuk diupload")
        setBulkLoading(false)
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
      setBulkLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    disabled: lockMode || bulkLoading,
  })

  // ESC key handler for modal
 useEffect(() => {
  if (!openAdd) return

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") setOpenAdd(false)
  }

  window.addEventListener("keydown", handleEsc)

  return () => window.removeEventListener("keydown", handleEsc)
}, [openAdd])
  
  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.items.map((item, idx) => ({
        No: idx + 1,
        Scope: item.scope,
        'Item Pekerjaan': item.item_name,
        Kategori: item.category,
        Qty: item.qty,
        Unit: item.unit,
        Material: item.material_price,
        Upah: item.labour_price,
        'Harga Unit': item.unit_price,
        Total: item.total_price,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "RAB")
    XLSX.writeFile(wb, `RAB_${rab_id}_${new Date().toISOString().slice(0,10)}.xlsx`)
  }
  
  /* ============ UI ============ */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        
        {/* STICKY HEADER */}
<div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

    {/* LEFT */}
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
    <h1 className="text-lg font-semibold text-slate-900">
      RAB Project
    </h1>

    <p className="text-xs text-slate-500">
      {rab_id}
    </p>
  </div>
</div>

</div> {/* ⬅️ INI PENUTUP flex items-center gap-3 */}

{/* ACTION BUTTON */}
<div className="flex flex-wrap gap-2 justify-end">

      <button
  onClick={reload}
  disabled={loading}
  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
>
  {loading ? (
    <div className="animate-spin h-3 w-3 border border-slate-400 border-t-transparent rounded-full" />
  ) : (
    <RefreshCw size={14}/>
  )}
  Reload
</button>

      <button
        onClick={() => handlePrint(rab_id, data, totalValue)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
      >
        <Printer size={14}/>
        Print
      </button>

      <Link
        href={`/admin/estimator/rab/${rab_id}/ve`}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
      >
        <TrendingUp size={14}/>
        VE Options
      </Link>

      <button
  onClick={handleGenerateProposal}
  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
>
  <FileText size={14}/>
  Generate Proposal
</button>

    </div>
  </div>
</div>

        {/* INFO BAR */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

  <div className="bg-white border border-slate-200 rounded-xl p-3">
    <p className="text-[11px] text-slate-500">Project</p>
    <p className="text-sm font-medium text-slate-800">
      {data.header?.project_name}
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-xl p-3">
    <p className="text-[11px] text-slate-500">Customer</p>
    <p className="text-sm font-medium text-slate-800">
      {data.header?.customer_name}
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-xl p-3">
    <p className="text-[11px] text-slate-500">Total Items</p>
    <p className="text-lg font-semibold text-slate-900">
      {data.items.length}
    </p>
  </div>

  <div className="bg-white border border-slate-200 rounded-xl p-3">
    <p className="text-[11px] text-slate-500">Total Value</p>
    <p className="text-lg font-semibold text-slate-900">
      {formatIDR(totalValue)}
    </p>
  </div>

</div>
        
        {/* TOOLBAR ACTION */}
{!lockMode && (
  <div className="flex items-center gap-2">

    <button
      type="button"
      onClick={() => setOpenAdd(true)}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
    >
      <Plus size={16}/>
      Tambah
    </button>

    <WorkLibraryButton
      rab_id={rab_id}
      project_id={project_id}
      onSuccess={reload}
    />

  </div>
)}

        {/* BULK UPLOAD (hanya jika tidak lock) */}
        {!lockMode && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Upload size={16} />
              Bulk Upload Excel
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-4 text-sm cursor-pointer transition ${
                bulkLoading ? "opacity-50 pointer-events-none" : ""
              } ${
                isDragActive
                  ? "border-slate-500 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                {bulkLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-400 border-t-transparent mx-auto mb-2" />
                    <p className="text-slate-600">Memproses file...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-6 w-6 text-slate-400 mb-2" />
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY + PROFIT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
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

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
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

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-slate-500" />
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Profit Panel</h3>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Overhead/Margin</span>
                  <span className={overheadPct === 0 ? "text-amber-600 font-medium" : ""}>
                    {overheadPct}%
                    {overheadPct === 0 && <AlertTriangle size={12} className="inline ml-1" />}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={overheadPct}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setOverheadPct(val)
                    if (val === 0) {
                      toast.warning("Overhead 0%? Yakin?")
                    }
                  }}
                  disabled={lockMode}
                  className="w-full accent-slate-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Profit</span>
                  <span className={profitPct === 0 ? "text-amber-600 font-medium" : ""}>
                    {profitPct}%
                    {profitPct === 0 && <AlertTriangle size={12} className="inline ml-1" />}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={profitPct}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setProfitPct(val)
                    if (val === 0) {
                      toast.warning("Profit 0%? Yakin?")
                    }
                  }}
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
                <summary className="flex items-center justify-between gap-3 p-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition">
                  <div className="font-medium text-slate-800">{g.scope}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{g.items.length} item</span>
                    <ChevronDown size={16} />
                  </div>
                </summary>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-y border-slate-200">
                      <tr>
                        <th className="p-2.5 text-center text-xs font-medium text-slate-500 uppercase">
                          No
                        </th>
                        <th className="p-2.5 text-left text-xs font-medium text-slate-500 uppercase">
                          Item
                        </th>
                        <th className="p-2.5 text-left text-xs font-medium text-slate-500 uppercase">
                          Kategori
                        </th>
                        <th className="p-2.5 text-center text-xs font-medium text-slate-500 uppercase">
                          Qty
                        </th>
                        <th className="p-2.5 text-center text-xs font-medium text-slate-500 uppercase">
                          Unit
                        </th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 uppercase">
                          Material
                        </th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 uppercase">
                          Labour
                        </th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 uppercase">
                          Unit Price
                        </th>
                        <th className="p-2.5 text-right text-xs font-medium text-slate-500 uppercase">
                          Total
                        </th>
                        {!lockMode && (
                          <th className="p-2.5 text-center text-xs font-medium text-slate-500 uppercase">
                            Aksi
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {g.items.map((it, idx) => (
                        <tr key={it.item_id} className="hover:bg-slate-50 transition">
                          {/* NO */}
                          <td className="p-2.5 text-slate-500 font-mono text-center">
                            {pad3(globalIndexMap.get(it.item_id) || idx + 1)}
                          </td>

                          {/* ITEM */}
                          <td className="p-2.5 whitespace-normal">
                            <InlineEdit
                              value={it.item_name}
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => updateField(it.item_id, { item_name: val })}
                              validate={(val) => {
                                if (!val || String(val).trim() === "") {
                                  return "Nama item wajib diisi"
                                }
                                return true
                              }}
                            />
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">
                              {it.item_id.slice(-8)}
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td className="p-2.5">
                            <InlineEdit
                              value={it.category}
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => updateField(it.item_id, { category: val })}
                            />
                          </td>

                          {/* QTY */}
                          <td className="p-2.5 text-center">
                            <InlineEdit
                              value={it.qty}
                              type="number"
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => {
                                const parsed = safeNumber(val)
                                if (parsed <= 0) {
                                  toast.error("Qty harus lebih dari 0")
                                  return
                                }
                                updateField(it.item_id, { qty: parsed })
                              }}
                              validate={(val) => {
                                const num = Number(val)
                                if (num <= 0) return "Qty harus > 0"
                                return true
                              }}
                            />
                          </td>

                          {/* UNIT */}
                          <td className="p-2.5 text-center">
                            <InlineEdit
                              value={it.unit}
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => updateField(it.item_id, { unit: val })}
                              validate={(val) => {
                                if (!val || String(val).trim() === "") {
                                  return "Unit wajib diisi"
                                }
                                return true
                              }}
                            />
                          </td>

                          {/* MATERIAL */}
                          <td className="p-2.5 text-right whitespace-nowrap tabular-nums">
                            <InlineEdit
                              value={it.material_price}
                              type="number"
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => updateField(it.item_id, { material_price: safeNumber(val) })}
                              validate={(val) => {
                                const num = Number(val)
                                if (num < 0) return "Harga tidak boleh negatif"
                                return true
                              }}
                            />
                          </td>

                          {/* LABOUR */}
                          <td className="p-2.5 text-right whitespace-nowrap tabular-nums">
                            <InlineEdit
                              value={it.labour_price}
                              type="number"
                              disabled={lockMode || actionLoading === it.item_id}
                              onSave={(val) => updateField(it.item_id, { labour_price: safeNumber(val) })}
                              validate={(val) => {
                                const num = Number(val)
                                if (num < 0) return "Harga tidak boleh negatif"
                                return true
                              }}
                            />
                          </td>

                          {/* UNIT PRICE (readonly) */}
                          <td className="p-2.5 font-medium text-slate-700 text-right whitespace-nowrap tabular-nums">
                            {formatIDR(safeNumber(it.unit_price))}
                          </td>

                          {/* TOTAL (readonly) */}
                          <td className="p-2.5 font-semibold text-emerald-600 text-right whitespace-nowrap tabular-nums">
                            {formatIDR(safeNumber(it.total_price))}
                          </td>

                          {/* AKSI */}
                          {!lockMode && (
                            <td className="p-2.5">
                              <div className="flex items-center justify-center gap-2">
                                <button
  className="p-1.5 border border-slate-200 rounded-lg hover:bg-emerald-50 transition"
  onClick={() => addEmptyRow(it)}
  title="Tambah item baru"
>
  <Plus size={14} className="text-emerald-600" />
</button>
                                
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
                          className="p-2.5 text-right font-medium text-slate-600"
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

        {/* ADD ITEM SLIDE PANEL - FIXED */}
{openAdd && (
  <div className="fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="flex-1 bg-black/40"
      onClick={() => setOpenAdd(false)}
    />

    {/* Panel - ✅ FIX: className sebagai prop */}
    <div className={`w-[480px] bg-white shadow-2xl h-full p-6 overflow-y-auto transform transition-transform duration-300 ${
      openAdd ? "translate-x-0" : "translate-x-full"
    }`}>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Tambah Item RAB
        </h2>
        <button
          onClick={() => setOpenAdd(false)}
          className="text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

      <AddItemForm
        rab_id={rab_id}
        project_id={project_id}
        onCreated={(newItem: RabItem) => {
          setData((prev) => ({
            ...prev,
            items: [...prev.items, newItem],
          }))
          setOpenAdd(false)
          toast.success("Item berhasil ditambahkan")
        }}
        onSuccess={() => {
          reload()
          setOpenAdd(false)
        }}
      />

    </div>
  </div>
)}
        
        {/* FOOTER */}
        <div className="flex items-center gap-2 p-4 bg-slate-100/50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <Lock size={14} className="text-slate-400" />
          <p>
            <span className="font-medium text-slate-600">Security Note:</span> Modul ini adalah sumber RAB resmi.{" "}
            {lockMode
              ? " RAB dalam mode terkunci (read-only)."
              : " Perubahan akan langsung tersimpan dan direfleksikan ke sistem."}
          </p>
        </div>
      </div>
    </div>
  )
}
