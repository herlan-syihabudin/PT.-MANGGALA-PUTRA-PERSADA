"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Library, Search, PlusCircle, X, Loader2 } from "lucide-react"

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
  const [items, setItems] = useState<WorkLibraryItem[]>([])
  const [search, setSearch] = useState("")

  // Load library ketika modal dibuka
  useEffect(() => {
    if (!open) return

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/estimator/library", { cache: "no-store" })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Gagal load Work Library")
        }

        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : json
        setItems(data)
      } catch (e: any) {
        console.error(e)
        toast.error(e.message || "Gagal load Work Library")
      } finally {
        setLoading(false)
      }
    }

    load()
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

  async function handleUse(item: WorkLibraryItem) {
    try {
      setLoading(true)

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

      toast.success(`"${item.job_name}" ditambahkan ke RAB`)
      onSuccess()
      setOpen(false)
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Gagal ambil dari Work Library")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm bg-white hover:bg-slate-50 transition"
      >
        <Library size={16} className="text-slate-600" />
        <span>Ambil dari Work Library</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Library size={16} className="text-slate-600" />
                  Work Library
                </h2>
                <p className="text-[11px] text-slate-400">
                  Pilih pekerjaan standar untuk dimasukkan ke RAB
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari job name / code / scope / kategori..."
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto">
              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  Tidak ada data Work Library
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Code</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Job</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Scope</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase whitespace-nowrap">Material</th>
                      <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase whitespace-nowrap">Labour</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((it) => (
                      <tr key={it.job_id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                          {it.job_code}
                        </td>
                        <td className="px-4 py-2 text-slate-800">
                          <div className="text-[11px] font-medium">{it.job_name}</div>
                          <div className="text-[10px] text-slate-400">{it.kategori}</div>
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-500">
                          {it.scope}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-slate-500">
                          {it.unit}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-right text-slate-700">
                          {it.material_price?.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2 text-[11px] text-right text-slate-700">
                          {it.labour_price?.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleUse(it)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-white disabled:opacity-50"
                          >
                            {loading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <PlusCircle size={12} />
                            )}
                            Pakai
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
