'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  Package,
  Layers,
  FolderTree,
  Plus,
  Grid3x3,
  List,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

/* ================= TYPES ================= */
type LibraryItem = {
  package_id: string
  package_name: string
  category: string
  scope: string
  job_name: string
  unit: string
  material_price?: number
  labour_price?: number
  created_at?: string
}

type LibraryPackage = {
  package_id: string
  package_name: string
  category: string
  items: LibraryItem[]
  created_at?: string
}

type ApiResponse = {
  success: boolean
  data: LibraryPackage[]
  metadata?: {
    total_packages: number
    total_items: number
  }
}

/* ================= COLOR MAP (ANTI DYNAMIC TAILWIND) ================= */
const statColorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' }
} as const

const activityColorMap = {
  category: { bg: 'bg-blue-50', text: 'text-blue-600', icon: FolderTree },
  package: { bg: 'bg-green-50', text: 'text-green-600', icon: Layers },
  item: { bg: 'bg-purple-50', text: 'text-purple-600', icon: Package }
} as const

/* ================= MAIN PAGE ================= */
export default function WorkLibraryPage() {
  const [packages, setPackages] = useState<LibraryPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  // ========== LOAD LIBRARY DATA ==========
  const loadLibrary = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true)
      
      const res = await fetch('/api/estimator/library?status=all')
      const json: ApiResponse = await res.json()

      if (json.success) {
        setPackages(json.data)
        if (showToast) toast.success('Library refreshed')
      } else {
        throw new Error('Failed to load library')
      }
    } catch (err) {
      console.error('Failed load library', err)
      toast.error('Gagal memuat Work Library')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  // ========== DERIVED STATS (useMemo untuk performa) ==========
  const stats = useMemo(() => {
    const totalPackages = packages.length
    
    const totalItems = packages.reduce((acc, pkg) => {
      return acc + (pkg.items?.length || 0)
    }, 0)

    const categories = new Set(packages.map((p) => p.category))
    const totalCategories = categories.size

    // Items used in last 30 days (popularitas - simplified)
    const recentItems = packages.flatMap(pkg => 
      pkg.items?.filter(item => {
        if (!item.created_at) return false
        const itemDate = new Date(item.created_at)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return itemDate > thirtyDaysAgo
      }) || []
    ).length

    return {
      totalPackages,
      totalItems,
      totalCategories,
      recentItems
    }
  }, [packages])

  // ========== RECENT ACTIVITIES (dari data asli) ==========
  const recentActivities = useMemo(() => {
    // Ambil 5 item terbaru dari semua items
    const allItems = packages.flatMap(pkg => 
      (pkg.items || []).map(item => ({
        id: item.package_id + '-' + item.job_name,
        type: 'item' as const,
        name: item.job_name,
        category: item.category,
        packageName: pkg.package_name,
        time: item.created_at || new Date().toISOString(),
        action: 'added'
      }))
    )

    const allPackages = packages.map(pkg => ({
      id: pkg.package_id,
      type: 'package' as const,
      name: pkg.package_name,
      category: pkg.category,
      time: pkg.created_at || new Date().toISOString(),
      action: 'created'
    }))

    const allCategories = Array.from(new Set(packages.map(p => p.category)))
      .map((cat, idx) => ({
        id: `cat-${idx}`,
        type: 'category' as const,
        name: cat,
        time: new Date().toISOString(), // fallback
        action: 'updated'
      }))

    // Gabung semua, sort by time (desc), ambil 5
    return [...allItems, ...allPackages, ...allCategories]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
      .map(item => ({
        ...item,
        // Format relative time
        time: formatRelativeTime(new Date(item.time))
      }))
  }, [packages])

  // ========== POPULAR PACKAGES (paling banyak items) ==========
  const popularPackages = useMemo(() => {
    return [...packages]
      .sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0))
      .slice(0, 4)
      .map(pkg => ({
        package_id: pkg.package_id,
        package_name: pkg.package_name,
        category: pkg.category,
        itemCount: pkg.items?.length || 0
      }))
  }, [packages])

  // ========== HELPER: Format Relative Time ==========
  function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID')
  }

  // ========== STATS CARDS ==========
  const statCards = [
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'blue',
      href: '/admin/estimator/library/category'
    },
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      icon: Layers,
      color: 'green',
      href: '/admin/estimator/library/package'
    },
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'purple',
      href: '/admin/estimator/library/items'
    },
    {
      title: 'Recent Items (30d)',
      value: stats.recentItems,
      icon: Grid3x3,
      color: 'amber',
      href: '/admin/estimator/library/items?filter=recent'
    }
  ]

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="animate-spin" size={24} />
          <p>Loading Work Library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage categories, packages, and work items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => loadLibrary(true)}
            disabled={refreshing}
            className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <Grid3x3 size={18} className={view === 'grid' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 border-l ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <List size={18} className={view === 'list' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
          </div>

          {/* Action Buttons */}
          <Link
            href="/admin/estimator/library/category/new"
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FolderTree size={16} />
            <span className="hidden sm:inline">New Category</span>
          </Link>

          <Link
            href="/admin/estimator/library/package/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Package</span>
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          const color = statColorMap[stat.color as keyof typeof statColorMap]

          return (
            <Link
              key={i}
              href={stat.href}
              className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 ${color.bg} rounded-lg`}>
                  <Icon size={20} className={color.text} />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600 mt-3">
                <span>View all</span>
                <ArrowRight size={12} />
              </div>
            </Link>
          )
        })}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RECENT ACTIVITIES */}
        <div className="lg:col-span-2 bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          
          {recentActivities.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada aktivitas</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const activityData = activityColorMap[activity.type]
                const ActivityIcon = activityData.icon

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b last:border-0"
                  >
                    <div className={`p-2 rounded-lg ${activityData.bg}`}>
                      <ActivityIcon size={16} className={activityData.text} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.name}</span>
                        {' '}
                        <span className="text-gray-500">
                          {activity.type === 'item' && `(in ${activity.packageName})`}
                        </span>
                        {' '}
                        <span className="text-gray-500">{activity.action}</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* POPULAR PACKAGES */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Packages</h2>
          
          {popularPackages.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada package</p>
          ) : (
            <div className="space-y-4">
              {popularPackages.map((pkg, i) => (
                <Link
                  key={pkg.package_id}
                  href={`/admin/estimator/library/package/${pkg.package_id}`}
                  className="flex items-center justify-between pb-3 border-b last:border-0 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div>
                    <p className="text-sm font-medium">{pkg.package_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pkg.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{pkg.itemCount}</p>
                    <p className="text-xs text-gray-400">items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/admin/estimator/library/package"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
          >
            View all packages →
          </Link>
        </div>
      </div>

      {/* GRID/LIST VIEW (UNTUK IMPLEMENTASI NANTI) */}
      {packages.length > 0 && view === 'grid' && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">All Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.slice(0, 6).map((pkg) => (
              <Link
                key={pkg.package_id}
                href={`/admin/estimator/library/package/${pkg.package_id}`}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-medium">{pkg.package_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{pkg.category}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {pkg.items?.length || 0} items
                </p>
              </Link>
            ))}
          </div>
          {packages.length > 6 && (
            <div className="text-center mt-4">
              <Link
                href="/admin/estimator/library/package"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all {packages.length} packages →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
