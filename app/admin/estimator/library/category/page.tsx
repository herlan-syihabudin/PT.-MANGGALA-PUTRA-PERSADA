'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FolderTree,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

/* ================= TYPES ================= */
interface Category {
  id: string
  name: string
  description: string
  totalItems: number
  totalPackages: number
  color: keyof typeof colorMap
  subcategories?: Category[]
  parent_id?: string | null
  created_at?: string
  updated_at?: string
}

interface Package {
  id: string
  name: string
  category: string
  status: string
  created_at: string
  items: any[]
  itemCount: number
}

interface ApiResponse {
  success: boolean
  data: Package[]
  metadata: {
    total_packages: number
    total_items: number
  }
  error?: string
}

/* ================= SAFE COLOR MAP ================= */
const colorMap = {
  blue: 'text-blue-500',
  cyan: 'text-cyan-500',
  green: 'text-green-500',
  emerald: 'text-emerald-500',
  purple: 'text-purple-500',
  violet: 'text-violet-500',
  amber: 'text-amber-500',
  rose: 'text-rose-500',
  indigo: 'text-indigo-500'
} as const

const colorList = Object.keys(colorMap) as Array<keyof typeof colorMap>

// Helper untuk mendapatkan warna konsisten berdasarkan nama
const getColorFromName = (name: string): keyof typeof colorMap => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % colorList.length
  return colorList[index]
}

/* ================= MAIN PAGE ================= */
export default function CategoryPage() {
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ========== FETCH PACKAGES & TRANSFORM TO CATEGORIES ==========
  const fetchCategories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch('/api/estimator/library?status=active', {
        cache: 'no-store'
      })
      const json: ApiResponse = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch packages')
      }

      // Transform packages into categories
      const categoryMap = new Map<string, Category>()

      json.data.forEach((pkg: Package) => {
        const categoryName = pkg.category || 'Uncategorized'
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            description: `Category: ${categoryName}`,
            totalItems: 0,
            totalPackages: 0,
            color: getColorFromName(categoryName),
            subcategories: [],
            created_at: pkg.created_at
          })
        }

        const cat = categoryMap.get(categoryName)!
        cat.totalPackages += 1
        cat.totalItems += pkg.itemCount || 0
        
        // Update latest updated_at
        if (pkg.created_at && (!cat.updated_at || pkg.created_at > cat.updated_at)) {
          cat.updated_at = pkg.created_at
        }
      })

      // Convert to array and sort
      const rootCategories = Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      setCategories(rootCategories)
      
      if (showRefresh) {
        toast.success('Categories refreshed')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Gagal memuat data kategori')
      toast.error('Gagal memuat data kategori')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ========== DELETE CATEGORY ==========
  const handleDelete = useCallback(async (id: string, name: string) => {
    // Karena kategori adalah derived data, kita tidak bisa delete langsung
    // Tapi kita bisa memberi informasi ke user
    toast.info(`Category "${name}" cannot be deleted directly. Delete packages in this category instead.`)
    
    // Redirect ke package page dengan filter category
    router.push(`/admin/estimator/library/package?category=${encodeURIComponent(name)}`)
  }, [router])

  // ========== RECURSIVE SEARCH ==========
  const filterCategories = useCallback((cats: Category[]): Category[] => {
    if (!search.trim()) return cats

    const searchLower = search.toLowerCase()

    return cats
      .map(cat => {
        const matchSelf =
          cat.name.toLowerCase().includes(searchLower) ||
          (cat.description || '').toLowerCase().includes(searchLower)

        const filteredChildren = cat.subcategories
          ? filterCategories(cat.subcategories)
          : []

        if (matchSelf || filteredChildren.length > 0) {
          return {
            ...cat,
            subcategories: filteredChildren
          }
        }

        return null
      })
      .filter(Boolean) as Category[]
  }, [search])

  const filteredCategories = useMemo(() => {
    return filterCategories(categories)
  }, [categories, filterCategories])

  // ========== EXPAND TOGGLE ==========
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }, [])

  // ========== EXPAND ALL / COLLAPSE ALL ==========
  const expandAll = useCallback(() => {
    const getAllIds = (cats: Category[]): string[] => {
      return cats.reduce<string[]>((acc, cat) => {
        acc.push(cat.id)
        if (cat.subcategories) {
          acc.push(...getAllIds(cat.subcategories))
        }
        return acc
      }, [])
    }
    setExpanded(getAllIds(categories))
  }, [categories])

  const collapseAll = useCallback(() => {
    setExpanded([])
  }, [])

  // ========== VIEW PACKAGES IN CATEGORY ==========
  const viewPackages = useCallback((categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/admin/estimator/library/package?category=${encodeURIComponent(categoryName)}`)
  }, [router])

  // ========== CATEGORY ROW COMPONENT ==========
  const CategoryRow = useCallback(({ cat, level = 0 }: { cat: Category; level?: number }) => {
    const hasChildren = cat.subcategories && cat.subcategories.length > 0
    const isExpanded = expanded.includes(cat.id)
    const isDeleting = deletingId === cat.id

    return (
      <>
        <tr className={`border-b hover:bg-gray-50 hover:border-blue-300 transition ${isDeleting ? 'opacity-50' : ''}`}>
          <td className="p-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isDeleting}
                >
                  <ChevronRight
                    size={16}
                    className={`transform transition ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              ) : (
                <div className="w-6" />
              )}

              <FolderTree
                size={18}
                className={colorMap[cat.color] || 'text-gray-500'}
              />

              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                )}
                {cat.updated_at && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Updated {new Date(cat.updated_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="p-4 text-center font-medium">{cat.totalItems || 0}</td>
          <td className="p-4 text-center font-medium">{cat.totalPackages || 0}</td>

          <td className="p-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => viewPackages(cat.name, e)}
                className="p-2 hover:bg-blue-50 rounded transition"
                title="View packages in this category"
              >
                <FolderTree size={16} className="text-blue-600" />
              </button>
              
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={isDeleting}
                className={`p-2 hover:bg-red-50 rounded transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="View packages to delete"
              >
                {isDeleting ? (
                  <RefreshCw size={16} className="animate-spin text-red-500" />
                ) : (
                  <Trash2 size={16} className="text-red-500" />
                )}
              </button>
            </div>
          </td>
        </tr>

        {hasChildren && isExpanded && cat.subcategories?.map((sub) => (
          <CategoryRow key={sub.id} cat={sub} level={level + 1} />
        ))}
      </>
    )
  }, [expanded, toggleExpand, handleDelete, deletingId, viewPackages])

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCategories(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ========== STATS ==========
  const totalCategories = categories.length
  const totalItems = categories.reduce((acc, cat) => acc + cat.totalItems, 0)
  const totalPackages = categories.reduce((acc, cat) => acc + cat.totalPackages, 0)

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Category Manager</h1>
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Categories derived from packages • {totalCategories} total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Collapse All
          </button>

          <Link
            href="/admin/estimator/library/package/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            New Package
          </Link>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">📁 Categories are automatically generated from package categories</p>
        <p className="text-xs text-blue-600">
          To manage categories, edit the packages in each category. Click the folder icon to view all packages in a category.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Categories</p>
          <p className="text-2xl font-bold mt-1">{totalCategories}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Packages</p>
          <p className="text-2xl font-bold mt-1">{totalPackages}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-2xl font-bold mt-1">{totalItems}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-2">
            Found {filteredCategories.length} categories
          </p>
        )}
      </div>

      {/* TABLE */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <FolderTree className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Try adjusting your search' : 'Create a package to see categories'}
          </p>
          {!search && (
            <Link
              href="/admin/estimator/library/package/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Package
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">Items</th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">Packages</th>
                <th className="p-4 text-right text-sm font-medium text-gray-600 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}  items: any[]
  itemCount: number
}

interface ApiResponse {
  success: boolean
  data: Package[]
  metadata: {
    total_packages: number
    total_items: number
  }
  error?: string
}

/* ================= SAFE COLOR MAP ================= */
const colorMap = {
  blue: 'text-blue-500',
  cyan: 'text-cyan-500',
  green: 'text-green-500',
  emerald: 'text-emerald-500',
  purple: 'text-purple-500',
  violet: 'text-violet-500',
  amber: 'text-amber-500',
  rose: 'text-rose-500',
  indigo: 'text-indigo-500'
} as const

const colorList = Object.keys(colorMap) as Array<keyof typeof colorMap>

// Helper untuk mendapatkan warna konsisten berdasarkan nama
const getColorFromName = (name: string): keyof typeof colorMap => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % colorList.length
  return colorList[index]
}

/* ================= MAIN PAGE ================= */
export default function CategoryPage() {
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])
  

  // ========== FETCH PACKAGES & TRANSFORM TO CATEGORIES ==========
  const fetchCategories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch('/api/estimator/library?status=active', {
        cache: 'no-store'
      })
      const json: ApiResponse = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch packages')
      }

      // Transform packages into categories
      const categoryMap = new Map<string, Category>()

      json.data.forEach((pkg: Package) => {
        const categoryName = pkg.category || 'Uncategorized'
        
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            description: `Category: ${categoryName}`,
            totalItems: 0,
            totalPackages: 0,
            color: getColorFromName(categoryName),
            subcategories: [],
            created_at: pkg.created_at
          })
        }

        const cat = categoryMap.get(categoryName)!
        cat.totalPackages += 1
        cat.totalItems += pkg.itemCount || 0
        
        // Update latest updated_at
        if (pkg.created_at && (!cat.updated_at || pkg.created_at > cat.updated_at)) {
          cat.updated_at = pkg.created_at
        }
      })

      // Convert to array and sort
      const rootCategories = Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      setCategories(rootCategories)
      
      if (showRefresh) {
        toast.success('Categories refreshed')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Gagal memuat data kategori')
      toast.error('Gagal memuat data kategori')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ========== DELETE CATEGORY ==========
  const handleDelete = useCallback(async (id: string, name: string) => {
    // Karena kategori adalah derived data, kita tidak bisa delete langsung
    // Tapi kita bisa memberi informasi ke user
    toast.info(`Category "${name}" cannot be deleted directly. Delete packages in this category instead.`)
    
    // Redirect ke package page dengan filter category
    router.push(`/admin/estimator/library/package?category=${encodeURIComponent(name)}`)
  }, [router])

  // ========== RECURSIVE SEARCH ==========
  const filterCategories = useCallback((cats: Category[]): Category[] => {
    if (!search.trim()) return cats

    const searchLower = search.toLowerCase()

    return cats
      .map(cat => {
        const matchSelf =
          cat.name.toLowerCase().includes(searchLower) ||
          (cat.description || '').toLowerCase().includes(searchLower)

        const filteredChildren = cat.subcategories
          ? filterCategories(cat.subcategories)
          : []

        if (matchSelf || filteredChildren.length > 0) {
          return {
            ...cat,
            subcategories: filteredChildren
          }
        }

        return null
      })
      .filter(Boolean) as Category[]
  }, [search])

  const filteredCategories = useMemo(() => {
    return filterCategories(categories)
  }, [categories, filterCategories])

  // ========== EXPAND TOGGLE ==========
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }, [])

  // ========== EXPAND ALL / COLLAPSE ALL ==========
  const expandAll = useCallback(() => {
    const getAllIds = (cats: Category[]): string[] => {
      return cats.reduce<string[]>((acc, cat) => {
        acc.push(cat.id)
        if (cat.subcategories) {
          acc.push(...getAllIds(cat.subcategories))
        }
        return acc
      }, [])
    }
    setExpanded(getAllIds(categories))
  }, [categories])

  const collapseAll = useCallback(() => {
    setExpanded([])
  }, [])

  // ========== VIEW PACKAGES IN CATEGORY ==========
  const viewPackages = useCallback((categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/admin/estimator/library/package?category=${encodeURIComponent(categoryName)}`)
  }, [router])

  // ========== CATEGORY ROW COMPONENT ==========
 const CategoryRow = useCallback(
  ({ cat, level = 0 }: { cat: Category; level?: number }) => {
    const hasChildren = cat.subcategories && cat.subcategories.length > 0
    const isExpanded = expanded.includes(cat.id)
    const isDeleting = deletingId === cat.id

    return (
      <>
        <tr
          className={`border-b hover:bg-gray-50 hover:border-blue-300 transition ${
            isDeleting ? 'opacity-50' : ''
          }`}
        >
          <td className="p-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight
                    size={16}
                    className={`transform transition ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              ) : (
                <div className="w-6" />
              )}

              <FolderTree
                size={18}
                className={colorMap[cat.color] || 'text-gray-500'}
              />

              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>

                {cat.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {cat.description}
                  </p>
                )}

                {cat.updated_at && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Updated{' '}
                    {new Date(cat.updated_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="p-4 text-center font-medium">
            {cat.totalItems || 0}
          </td>

          <td className="p-4 text-center font-medium">
            {cat.totalPackages || 0}
          </td>

          <td className="p-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={(e) => viewPackages(cat.name, e)}
                className="p-2 hover:bg-blue-50 rounded transition"
                title="View packages"
              >
                <FolderTree size={16} className="text-blue-600" />
              </button>

              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={isDeleting}
                className={`p-2 hover:bg-red-50 rounded transition ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="View packages to delete"
              >
                {isDeleting ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin text-red-500"
                  />
                ) : (
                  <Trash2 size={16} className="text-red-500" />
                )}
              </button>
            </div>
          </td>
        </tr>

        {hasChildren &&
          isExpanded &&
          cat.subcategories?.map((sub) => (
            <CategoryRow key={sub.id} cat={sub} level={level + 1} />
          ))}
      </>
    )
  },
  [expanded, toggleExpand, handleDelete, deletingId, viewPackages]
)

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCategories(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ========== STATS ==========
  const totalCategories = categories.length
  const totalItems = categories.reduce((acc, cat) => acc + cat.totalItems, 0)
  const totalPackages = categories.reduce((acc, cat) => acc + cat.totalPackages, 0)

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Category Manager</h1>
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Categories derived from packages • {totalCategories} total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Collapse All
          </button>

          <Link
            href="/admin/estimator/library/package/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            New Package
          </Link>
        </div>
      </div>

      {/* INFO CARD */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">📁 Categories are automatically generated from package categories</p>
        <p className="text-xs text-blue-600">
          To manage categories, edit the packages in each category. Click the folder icon to view all packages in a category.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Categories</p>
          <p className="text-2xl font-bold mt-1">{totalCategories}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Packages</p>
          <p className="text-2xl font-bold mt-1">{totalPackages}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-2xl font-bold mt-1">{totalItems}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-2">
            Found {filteredCategories.length} categories
          </p>
        )}
      </div>

      {/* TABLE */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <FolderTree className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Try adjusting your search' : 'Create a package to see categories'}
          </p>
          {!search && (
            <Link
              href="/admin/estimator/library/package/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Package
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">
                  Category
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">
                  Items
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">
                  Packages
                </th>
                <th className="p-4 text-right text-sm font-medium text-gray-600 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

/* ================= SAFE COLOR MAP ================= */
const colorMap = {
  blue: 'text-blue-500',
  cyan: 'text-cyan-500',
  green: 'text-green-500',
  emerald: 'text-emerald-500',
  purple: 'text-purple-500',
  violet: 'text-violet-500',
  amber: 'text-amber-500',
  rose: 'text-rose-500',
  indigo: 'text-indigo-500'
} as const

const colorList = Object.keys(colorMap) as Array<keyof typeof colorMap>

/* ================= MAIN PAGE ================= */
export default function CategoryPage() {
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])

  // ========== FETCH CATEGORIES FROM API ==========
  const fetchCategories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch('/api/estimator/library?status=active', {
  cache: 'no-store'
})
      const json: CategoryResponse = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch categories')
      }

      const categoryMap = new Map<string, Category>()

json.data.forEach((pkg: any) => {
  const category = (pkg.category || 'General').trim()

  if (!categoryMap.has(category)) {
    categoryMap.set(category, {
      id: category.toLowerCase().replace(/\s+/g, '-'),
      name: category,
      description: `Category ${category}`,
      totalItems: 0,
      totalPackages: 0,
      color: colorList[Math.floor(Math.random() * colorList.length)],
      subcategories: []
    })
  }

  const cat = categoryMap.get(category)!

  cat.totalPackages += 1

  if (pkg.items && Array.isArray(pkg.items)) {
    cat.totalItems += pkg.items.length
  }
})

const rootCategories = Array.from(categoryMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name)
)


      // Sort by name
      const sortByName = (a: Category, b: Category) => a.name.localeCompare(b.name)
      rootCategories.sort(sortByName)
      rootCategories.forEach(cat => {
        if (cat.subcategories) {
          cat.subcategories.sort(sortByName)
        }
      })

      setCategories(rootCategories)
      
      if (showRefresh) {
        toast.success('Categories refreshed')
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Gagal memuat data kategori')
      toast.error('Gagal memuat data kategori')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])


  // ========== RECURSIVE SEARCH ==========
  const filterCategories = useCallback((cats: Category[]): Category[] => {
    if (!search.trim()) return cats

    const searchLower = search.toLowerCase()

    return cats
      .map(cat => {
        const matchSelf =
          cat.name.toLowerCase().includes(searchLower) ||
          (cat.description || '').toLowerCase().includes(searchLower)

        const filteredChildren = cat.subcategories
          ? filterCategories(cat.subcategories)
          : []

        if (matchSelf || filteredChildren.length > 0) {
          return {
            ...cat,
            subcategories: filteredChildren
          }
        }

        return null
      })
      .filter(Boolean) as Category[]
  }, [search])

  const filteredCategories = useMemo(() => {
    return filterCategories(categories)
  }, [categories, filterCategories])

  // ========== EXPAND TOGGLE ==========
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }, [])

  // ========== EXPAND ALL / COLLAPSE ALL ==========
  const expandAll = useCallback(() => {
    const getAllIds = (cats: Category[]): string[] => {
      return cats.reduce<string[]>((acc, cat) => {
        acc.push(cat.id)
        if (cat.subcategories) {
          acc.push(...getAllIds(cat.subcategories))
        }
        return acc
      }, [])
    }
    setExpanded(getAllIds(categories))
  }, [categories])

  const collapseAll = useCallback(() => {
    setExpanded([])
  }, [])

  // ========== CATEGORY ROW COMPONENT ==========
  const CategoryRow = useCallback(({ cat, level = 0 }: { cat: Category; level?: number }) => {
    const hasChildren = cat.subcategories && cat.subcategories.length > 0
    const isExpanded = expanded.includes(cat.id)

    return (
      <>
        <tr className={`border-b hover:bg-gray-50 hover:border-blue-300 transition ${isDeleting ? 'opacity-50' : ''}`}>
          <td className="p-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isDeleting}
                >
                  <ChevronRight
                    size={16}
                    className={`transform transition ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              ) : (
                <div className="w-6" /> // Spacer for alignment
              )}

              <FolderTree
                size={18}
                className={colorMap[cat.color] || 'text-gray-500'}
              />

              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                )}
                {cat.created_at && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Updated {new Date(cat.updated_at || cat.created_at).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="p-4 text-center font-medium">{cat.totalItems || 0}</td>
          <td className="p-4 text-center font-medium">{cat.totalPackages || 0}</td>

          <td className="p-4">
            <div className="flex items-center justify-end gap-2">
              
            </div>
          </td>
        </tr>

        {hasChildren &&
          isExpanded &&
          cat.subcategories?.map(sub => (
            <CategoryRow key={sub.id} cat={sub} level={level + 1} />
          ))}
      </>
    )
 }, [expanded, toggleExpand, deletingId])

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  // ========== ERROR STATE ==========
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCategories(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ========== STATS ==========
  const totalCategories = useMemo(() => {
    const count = (cats: Category[]): number => {
      return cats.reduce((acc, cat) => {
        acc += 1
        if (cat.subcategories) {
          acc += count(cat.subcategories)
        }
        return acc
      }, 0)
    }
    return count(categories)
  }, [categories])

  const totalItems = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc += cat.totalItems || 0
      if (cat.subcategories) {
        acc += cat.subcategories.reduce((sum, sub) => sum + (sub.totalItems || 0), 0)
      }
      return acc
    }, 0)
  }, [categories])

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Category Manager</h1>
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Organize work items into hierarchical categories • {totalCategories} total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Categories</p>
          <p className="text-2xl font-bold mt-1">{totalCategories}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-2xl font-bold mt-1">{totalItems}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-500">Top Level</p>
          <p className="text-2xl font-bold mt-1">{categories.length}</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border rounded-xl p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        {search && (
          <p className="text-xs text-gray-400 mt-2">
            Found {filteredCategories.reduce((acc, cat) => {
              acc += 1
              if (cat.subcategories) {
                acc += cat.subcategories.length
              }
              return acc
            }, 0)} categories
          </p>
        )}
      </div>

      {/* TABLE */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <FolderTree className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Try adjusting your search' : 'Get started by creating your first category'}
          </p>
          {!search && (
            <Link
              href="/admin/estimator/library/category/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Category
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">
                  Category
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">
                  Items
                </th>
                <th className="p-4 text-center text-sm font-medium text-gray-600 w-24">
                  Packages
                </th>
                <th className="p-4 text-right text-sm font-medium text-gray-600 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
