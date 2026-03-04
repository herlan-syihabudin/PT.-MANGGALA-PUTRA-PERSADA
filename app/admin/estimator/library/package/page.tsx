'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Layers,
  Plus,
  Search,
  Edit,
  Copy,
  Eye,
  FolderTree,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

/* ================= TYPES ================= */
interface PackageItem {
  job_name: string
  unit: string
  material_price: number
  labour_price: number
}

interface Package {
  id: string
  name: string
  category: string
  status: 'active' | 'draft' | 'archived'
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
  notes: string
  items: PackageItem[]
  itemCount: number
  estimatedCost: number
  description?: string
  usageCount?: number
  lastUsed?: string
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

/* ================= MAIN PAGE ================= */
export default function PackagePage() {
  const router = useRouter()

  // State untuk data dan UI
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State untuk filter
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // ========== FETCH DATA FROM API ==========
  const fetchPackages = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch('/api/estimator/library/package', {
  cache: 'no-store'
})
      const json: ApiResponse = await res.json()

      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch packages')
      }

      setPackages(json.data)
      
      if (showRefresh) {
        // Optional: show success toast
        console.log('Packages refreshed')
      }
    } catch (err: any) {
      console.error('Error fetching packages:', err)
      setError(err.message || 'Gagal memuat data package')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // ========== DERIVED DATA ==========
  const categories = useMemo(() => {
    const cats = new Set(packages.map(pkg => pkg.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [packages])

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchSearch = 
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        (pkg.notes || '').toLowerCase().includes(search.toLowerCase())

      const matchCategory = 
        categoryFilter === 'all' || pkg.category === categoryFilter

      const matchStatus = 
        statusFilter === 'all' || pkg.status === statusFilter

      return matchSearch && matchCategory && matchStatus
    })
  }, [packages, search, categoryFilter, statusFilter])

  // ========== STATUS COLOR ==========
  const getStatusColor = (status: Package['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-yellow-100 text-yellow-700'
      case 'archived':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // ========== FORMATTERS ==========
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0)
  }, [])

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }, [])

  // ========== HANDLERS ==========
  const handleCopy = useCallback(async (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // TODO: Implement copy package
    alert(`Copy package: ${pkg.name}`)
  }, [])

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading packages...</p>
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
            onClick={() => fetchPackages(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Package Manager</h1>
            <button
              onClick={() => fetchPackages(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable work packages • {packages.length} total
          </p>
        </div>

        <Link
          href="/admin/estimator/library/package/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          New Package
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* FILTER SUMMARY */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>
            Showing {filteredPackages.length} of {packages.length} packages
          </span>
          {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('')
                setCategoryFilter('all')
                setStatusFilter('all')
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* PACKAGES GRID */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Layers className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No packages found</h3>
          <p className="text-gray-500 mb-6">
            {packages.length === 0 
              ? 'Get started by creating your first package'
              : 'Try adjusting your filters'}
          </p>
          {packages.length === 0 && (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border rounded-xl p-6 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => router.push(`/admin/estimator/library/package/${pkg.id}`)}
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Layers size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                      {pkg.notes || 'No description'}
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(pkg.status)}`}>
                  {pkg.status}
                </span>
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FolderTree size={14} className="text-gray-400" />
                  <span className="truncate">{pkg.category}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart3 size={14} className="text-gray-400" />
                  {pkg.itemCount} items
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  Updated {formatDate(pkg.updated_at)}
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400">Est. Cost</span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Estimated Cost</p>
                  <p className="font-bold text-blue-600">
                    {formatCurrency(pkg.estimatedCost)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded transition"
                    onClick={(e) => handleCopy(pkg, e)}
                    title="Copy package"
                  >
                    <Copy size={16} className="text-gray-600" />
                  </button>

                  <Link
                    href={`/admin/estimator/library/package/${pkg.id}/edit`}
                    className="p-2 hover:bg-gray-100 rounded transition"
                    onClick={(e) => e.stopPropagation()}
                    title="Edit package"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </Link>

                  <Link
                    href={`/admin/estimator/library/package/${pkg.id}`}
                    className="p-2 hover:bg-gray-100 rounded transition"
                    onClick={(e) => e.stopPropagation()}
                    title="View details"
                  >
                    <Eye size={16} className="text-blue-600" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}  

