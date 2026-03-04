"use client"

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Library, Search, PlusCircle, X, Loader2, Check } from "lucide-react"


// ============ TYPES SESUAI API BARU ============
type WorkLibraryItem = {
  package_id: string
  package_name: string
  category: string
  scope: string
  job_name: string
  unit: string
  material_price?: number
  labour_price?: number
}

type WorkLibraryPackage = {
  package_id: string
  package_name: string
  category: string
  items: WorkLibraryItem[]
}

type RabItem = {
  item_name?: string
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
  const [packages, setPackages] = useState<WorkLibraryPackage[]>([])
  const [search, setSearch] = useState("")

  const [existingItems, setExistingItems] = useState<Set<string>>(new Set())
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  
  const abortRef = useRef<AbortController | null>(null)
  const existingAbortRef = useRef<AbortController | null>(null)

 const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
  if (open) {
    setSearch("")
    setDebouncedSearch("")
  }
}, [open])

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search)
  }, 300)

  return () => clearTimeout(timer)
}, [search])

  // Reset expanded packages when searching
  useEffect(() => {
    if (debouncedSearch.trim()) {
      setExpandedPackages(new Set())
    }
  }, [debouncedSearch])

  // Load existing items di RAB
  useEffect(() => {
    if (!open) return

    existingAbortRef.current?.abort()
    existingAbortRef.current = new AbortController()

    const loadExisting = async () => {
      try {
        const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
          signal: existingAbortRef.current?.signal
        })
        if (res.ok) {
          const data = await res.json()
          const names = new Set(
            Array.isArray(data) 
              ? data.map((item: RabItem) => item.item_name?.toLowerCase?.() || "")
              : []
          )
          setExistingItems(names)
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return
        console.error("Failed to load existing items:", error)
      }
    }

    loadExisting()

    return () => {
      existingAbortRef.current?.abort()
    }
  }, [open, rab_id])

  // Load library ketika modal dibuka
  useEffect(() => {
    if (!open) return

    // Cancel previous request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/estimator/library", { 
          cache: "no-store",
          signal: abortRef.current?.signal 
        })
        
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || "Gagal load Work Library")
        }

        const json = await res.json()
        
        // API returns { success: true, data: packages[] }
        if (json.success && Array.isArray(json.data)) {
          setPackages(json.data)
          // Auto expand first package
          if (json.data.length > 0 && !debouncedSearch.trim()) {
            setExpandedPackages(new Set([json.data[0].package_id]))
          }
        } else {
          throw new Error("Format data tidak sesuai")
        }
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

  // Format price helper
  const formatPrice = useCallback((price?: number): string => {
    if (price === undefined || price === null) return '0'
    return price.toLocaleString('id-ID')
  }, [])

  const allItems = useMemo(
  () => packages.flatMap(pkg => pkg.items),
  [packages]
)

  // Filter items berdasarkan search (pakai debouncedSearch)
  const filteredItems = useMemo(() => {
  if (!debouncedSearch.trim()) return []

  const q = debouncedSearch.toLowerCase()

  return allItems.filter((it) =>
    it.job_name.toLowerCase().includes(q) ||
    it.package_name.toLowerCase().includes(q) ||
    it.category.toLowerCase().includes(q) ||
    (it.scope || "").toLowerCase().includes(q)
  )
}, [allItems, debouncedSearch])

  const isSearchActive = debouncedSearch.trim().length > 0

  // Toggle package expand
  const togglePackage = useCallback((packageId: string) => {
    setExpandedPackages(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(packageId)) {
        newExpanded.delete(packageId)
      } else {
        newExpanded.add(packageId)
      }
      return newExpanded
    })
  }, [])

  const isItemExists = useCallback((jobName: string) => {
    return existingItems.has(jobName.toLowerCase())
  }, [existingItems])

  async function addPackageItems(pkg: WorkLibraryPackage) {
    // Filter items yang belum ada di RAB
    const itemsToAdd = pkg.items.filter(item => !isItemExists(item.job_name))
    
    if (itemsToAdd.length === 0) {
      toast.info(`Semua item dari "${pkg.package_name}" sudah ada di RAB`)
      return
    }

    setAddingId(pkg.package_id)
    
    try {
      let successCount = 0
      
      // Add items one by one
      for (const item of itemsToAdd) {
        const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id,
            scope: item.scope || "",
            item_name: item.job_name,
            category: item.category || "",
            qty: 1,
            unit: item.unit || "",
            material_price: item.material_price ?? 0,
            labour_price: item.labour_price ?? 0,
            created_by: "Estimator",
          }),
        })

        if (res.ok) {
          successCount++
          // Add to existing items
          setExistingItems(prev => new Set(prev).add(item.job_name.toLowerCase()))
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} item dari "${pkg.package_name}" ditambahkan`)
        onSuccess()
      }
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Gagal menambah package")
    } finally {
      setAddingId(null)
    }
  }

  async function addSingleItem(item: WorkLibraryItem) {
    if (isItemExists(item.job_name)) {
      toast.info(`"${item.job_name}" sudah ada di RAB`)
      return
    }

    const uniqueId = `${item.package_id}-${item.job_name}`
    setAddingId(uniqueId)
    
    try {
      const res = await fetch(`/api/estimator/rab/${rab_id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id,
          scope: item.scope || "",
          item_name: item.job_name,
          category: item.category || "",
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
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Library size={18} className="text-slate-600" />
                  Work Library
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih package atau item standar untuk dimasukkan ke RAB
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
                  placeholder="Cari package / item / kategori..."
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>{packages.length} packages • {packages.reduce((acc, pkg) => acc + pkg.items.length, 0)} total items</span>
                {isSearchActive && <span>{filteredItems.length} item ditemukan</span>}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">
              {loading && packages.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat library...
                </div>
              ) : isSearchActive ? (
                // Search Results - Flat List
                <div className="space-y-2">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      Tidak ada item yang cocok dengan pencarian
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const exists = isItemExists(item.job_name)
                      const uniqueId = `${item.package_id}-${item.job_name}`
                      const isAdding = addingId === uniqueId

                      return (
                        <div key={uniqueId} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:bg-slate-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-800">{item.job_name}</span>
                              <span className="text-xs text-slate-400">{item.package_name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>{item.scope}</span>
                              <span>•</span>
                              <span>{item.unit}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* Price Display */}
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Material</div>
                              <div className="text-sm font-medium">{formatPrice(item.material_price)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-slate-500">Labour</div>
                              <div className="text-sm font-medium">{formatPrice(item.labour_price)}</div>
                            </div>
                            <div className="w-24 text-center">
                              {exists ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs">
                                  <Check size={12} />
                                  Ada
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isAdding}
                                  onClick={() => addSingleItem(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white disabled:opacity-50"
                                >
                                  {isAdding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <PlusCircle size={12} />
                                  )}
                                  Tambah
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              ) : (
                // Package View
                <div className="space-y-4">
                  {packages.map((pkg) => {
                    const isExpanded = expandedPackages.has(pkg.package_id)
                    const packageItems = pkg.items
                    const existingCount = packageItems.reduce(
  (acc, item) => acc + (isItemExists(item.job_name) ? 1 : 0),
  0
)
                    const isAdding = addingId === pkg.package_id

                    return (
                      <div key={pkg.package_id} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Package Header */}
                        <div 
                          className="flex items-center justify-between p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
                          onClick={() => togglePackage(pkg.package_id)}
                        >
                          <div>
                            <h3 className="font-semibold text-slate-800">{pkg.package_name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {pkg.category} • {packageItems.length} item
                              {existingCount > 0 && (
                                <span className="ml-2 text-emerald-600">
                                  ({existingCount} sudah ada)
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                addPackageItems(pkg)
                              }}
                              disabled={isAdding || existingCount === packageItems.length}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white disabled:opacity-50"
                            >
                              {isAdding ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <PlusCircle size={12} />
                              )}
                              Tambah Package
                            </button>
                            <button className="p-1">
                              {isExpanded ? '▼' : '▶'}
                            </button>
                          </div>
                        </div>

                        {/* Package Items */}
                        {isExpanded && (
                          <div className="p-4 space-y-2 bg-white">
                            {packageItems.map((item) => {
                              const exists = isItemExists(item.job_name)
                              const uniqueId = `${item.package_id}-${item.job_name}`
                              
                              return (
                                <div key={uniqueId} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                  <div className="flex-1">
                                    <span className="text-sm text-slate-700">{item.job_name}</span>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                      <span>{item.scope}</span>
                                      <span>•</span>
                                      <span>{item.unit}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    {/* Price Display */}
                                    <div className="text-right">
                                      <div className="text-xs text-slate-400">Material</div>
                                      <div className="text-sm">{formatPrice(item.material_price)}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-slate-400">Labour</div>
                                      <div className="text-sm">{formatPrice(item.labour_price)}</div>
                                    </div>
                                    <div className="w-24 text-center">
                                      {exists ? (
                                        <span className="text-emerald-600 text-xs">✓ Ada</span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => addSingleItem(item)}
                                          className="text-slate-400 hover:text-slate-600"
                                        >
                                          <PlusCircle size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
              Klik "Tambah Package" untuk menambahkan semua item sekaligus • Quantity default = 1 (bisa diedit nanti)
            </div>
          </div>
        </div>
      )}
    </>
  )
}
