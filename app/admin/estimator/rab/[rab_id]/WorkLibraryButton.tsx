"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { Library, Search, PlusCircle, X, Loader2, Check } from "lucide-react"

type WorkLibraryItem = {
  job_id: string
  job_code: string
  job_name: string
  scope: string
  kategori: string
  unit: string
  material_price: number
  labour_price: number
}

type Props = {
  rab_id: string
  project_id: string
  onSuccess: () => void
}

export default function WorkLibraryButton({ rab_id, project_id, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [items, setItems] = useState<WorkLibraryItem[]>([])
  const [search, setSearch] = useState("")
  const [existingItems, setExistingItems] = useState<Set<string>>(new Set())
  
  const abortRef = useRef<AbortController | null>(null)

  // Load existing items di RAB
  useEffect(() => {
    if (!open) return

    const loadExisting = async () => {
      try {
        const res = await fetch(`/api/estimator/rab/${rab_id}/items`)
        if (res.ok) {
          const data = await res.json()
          const names = new Set(
            Array.isArray(data) 
              ? data.map((item: any) => item.item_name.toLowerCase())
              : []
          )
          setExistingItems(names)
        }
      } catch (error) {
        console.error("Failed to load existing items:", error)
      }
    }

    loadExisting()
  }, [open, rab_id])

  // Load library ketika modal dibuka
  useEffect(() => {
    if (!open) return

    const load = async () => {
      // Cancel previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      try {
        setLoading(true)
        const res = await fetch("/api/estimator/library", { 
          cache: "no-store",
          signal: abortRef.current.signal 
        })
        
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Gagal load Work Library")
        }

        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : json
        setItems(data)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        console.error(e)
        toast.error(e.message || "Gagal load Work Library")
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => {
      abortRef.current?.abort()
    }
  }, [open])

  const filtered = items.filter((it) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      it.job_name.toLowerCase().includes(q) ||
      (it.job_code || "").toLowerCase().includes(q) ||
      (it.scope || "").toLowerCase().includes(q) ||
      (it.kategori || "").toLowerCase().includes(q)
    )
  })

  const isItemExists = (item: WorkLibraryItem) => {
    return existingItems.has(item.job_name.toLowerCase())
  }

  async function handleUse(item: WorkLibraryItem) {
    if (isItemExists(item)) {
      toast.info(`"${item.job_name}" sudah ada di RAB`)
      return
    }

    setAddingId(item.job_id)
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id,
          scope: item.scope || "",
          item_name: item.job_name,
          category: item.kategori || "",
          qty: 1,
          unit: item.unit || "",
          material_price: item.material_price ?? 0,
          labour_price: item.labour_price ?? 0,
          created_by: "Estimator",
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || "Gagal menambah item dari library")
      }

      // Update existing items
      setExistingItems(prev => new Set(prev).add(item.job_name.toLowerCase()))

      toast.success(`"${item.job_name}" ditambahkan ke RAB`)
      onSuccess()
      
      // Auto close setelah sukses (opsional)
      setTimeout(() => setOpen(false), 500)
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Gagal ambil dari Work Library")
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition group"
      >
        <div className="flex items-center gap-2">
          <Library size={18} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Pilih dari Library</span>
        </div>
        <PlusCircle size={16} className="text-slate-400 group-hover:text-slate-600" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Library size={18} className="text-slate-600" />
                  Work Library
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih pekerjaan standar untuk dimasukkan ke RAB
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari job name / code / scope / kategori..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div className="text-xs text-slate-400 mt-2">
                {filtered.length} item ditemukan
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat library...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  {search ? "Tidak ada item yang cocok" : "Work Library kosong"}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Job Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Scope</th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Material</th>
                      <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Labour</th>
                      <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((it) => {
                      const exists = isItemExists(it)
                      const isAdding = addingId === it.job_id

                      return (
                        <tr key={it.job_id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {it.job_code}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-800">{it.job_name}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {it.scope || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            {it.kategori || "-"}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-slate-600">
                            {it.unit || "-"}
                          </td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-700">
                            {it.material_price?.toLocaleString("id-ID") || "0"}
                          </td>
                          <td className="px-4 py-3 text-right text-xs tabular-nums text-slate-700">
                            {it.labour_price?.toLocaleString("id-ID") || "0"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {exists ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs">
                                <Check size={12} />
                                Sudah Ada
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isAdding}
                                onClick={() => handleUse(it)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                              >
                                {isAdding ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Menambah...
                                  </>
                                ) : (
                                  <>
                                    <PlusCircle size={12} />
                                    Pakai
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
              Klik "Pakai" untuk menambahkan item ke RAB dengan quantity = 1 (bisa diedit nanti)
            </div>
          </div>
        </div>
      )}
    </>
  )
}
