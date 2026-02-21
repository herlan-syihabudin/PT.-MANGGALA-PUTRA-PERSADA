'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  FolderTree,
  Layers,
  Package,
  Calendar,
  Clock,
  RefreshCcw,
  AlertCircle,
  Trash2,
  ChevronRight,
  Eye,
  BarChart3,
  Users,
  FileText,
  Tag,
  MoreVertical
} from 'lucide-react'

interface Category {
  id: string
  name: string
  code: string
  description: string
  parentCategory?: {
    id: string
    name: string
  }
  color: string
  icon: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  stats: {
    totalItems: number
    totalPackages: number
    activeItems: number
    usedInEstimations: number
  }
}

interface SubCategory {
  id: string
  name: string
  code: string
  totalItems: number
  status: 'active' | 'inactive'
}

interface RecentItem {
  id: string
  name: string
  type: 'job' | 'package'
  code: string
  updatedAt: string
  updatedBy: string
}

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'packages' | 'activity'>('overview')

  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  async function fetchCategory() {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data
      const mockCategory: Category = {
        id: categoryId,
        name: 'Dinding',
        code: 'DINDING_01',
        description: 'Semua pekerjaan yang berkaitan dengan dinding, termasuk pasangan bata, plesteran, dan finishing dinding.',
        parentCategory: {
          id: 'cat_2',
          name: 'Finishing'
        },
        color: 'blue',
        icon: '📁',
        status: 'active',
        createdAt: '2026-02-15T10:30:00Z',
        updatedAt: '2026-02-20T14:20:00Z',
        createdBy: 'Andi Estimator',
        updatedBy: 'Budi Admin',
        stats: {
          totalItems: 24,
          totalPackages: 8,
          activeItems: 22,
          usedInEstimations: 156
        }
      }

      const mockSubCategories: SubCategory[] = [
        { id: 'sub_1', name: 'Pasangan Bata', code: 'PAS_BATA', totalItems: 8, status: 'active' },
        { id: 'sub_2', name: 'Plesteran', code: 'PLESTER', totalItems: 6, status: 'active' },
        { id: 'sub_3', name: 'Acian', code: 'ACIAN', totalItems: 4, status: 'active' },
        { id: 'sub_4', name: 'Cat Dinding', code: 'CAT_DIND', totalItems: 6, status: 'inactive' }
      ]

      const mockRecentItems: RecentItem[] = [
        { id: 'job_1', name: 'Pasang bata ringan', type: 'job', code: 'JOB-031', updatedAt: '2026-02-20T14:20:00Z', updatedBy: 'Budi' },
        { id: 'job_2', name: 'Plester + aci dinding', type: 'job', code: 'JOB-032', updatedAt: '2026-02-20T10:15:00Z', updatedBy: 'Andi' },
        { id: 'pkg_1', name: 'Paket Dinding Kamar Mandi', type: 'package', code: 'PKG-023', updatedAt: '2026-02-19T16:30:00Z', updatedBy: 'Cici' },
        { id: 'job_3', name: 'Keramik dinding 30x60', type: 'job', code: 'JOB-033', updatedAt: '2026-02-19T09:45:00Z', updatedBy: 'Andi' },
        { id: 'pkg_2', name: 'Paket Dinding Dapur', type: 'package', code: 'PKG-024', updatedAt: '2026-02-18T11:20:00Z', updatedBy: 'Budi' }
      ]

      setCategory(mockCategory)
      setSubCategories(mockSubCategories)
      setRecentItems(mockRecentItems)

    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      router.push('/admin/estimator/library/category')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-gray-100 text-gray-700'
  }

  const getIconForType = (type: string) => {
    switch(type) {
      case 'job': return <Package size={14} className="text-blue-500" />
      case 'package': return <Layers size={14} className="text-green-500" />
      default: return <FileText size={14} className="text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <p className="text-red-600 font-medium">{error || 'Category not found'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-xl
                ${category.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  category.color === 'green' ? 'bg-green-100 text-green-700' :
                  category.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'}
              `}>
                {category.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{category.name}</h1>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(category.status)}`}>
                    {category.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Code: {category.code} • ID: {category.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/estimator/library/category/${categoryId}/edit`}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Edit size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={fetchCategory}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw size={16} className={actionLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/estimator/library/category" className="hover:text-gray-700">
          Categories
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-700">{category.name}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Items</p>
              <p className="text-2xl font-bold mt-1">{category.stats.totalItems}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">
            {category.stats.activeItems} active
          </p>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Packages</p>
              <p className="text-2xl font-bold mt-1">{category.stats.totalPackages}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Layers size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Sub Categories</p>
              <p className="text-2xl font-bold mt-1">{subCategories.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FolderTree size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500">Used in Estimations</p>
              <p className="text-2xl font-bold mt-1">{category.stats.usedInEstimations}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <BarChart3 size={20} className="text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {(['overview', 'items', 'packages', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-3 px-1 text-sm font-medium capitalize transition-colors relative
                ${activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700">{category.description}</p>
              </div>

              {/* Sub Categories */}
              <div className="bg-white border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Sub Categories</h2>
                  <Link
                    href={`/admin/estimator/library/category/new?parent=${categoryId}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Sub Category
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {subCategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/admin/estimator/library/category/${sub.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FolderTree size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium">{sub.name}</p>
                          <p className="text-xs text-gray-500">{sub.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{sub.totalItems} items</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Hierarchy */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Hierarchy</h2>
                <div className="space-y-3">
                  {category.parentCategory && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FolderTree size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Parent Category</p>
                        <Link 
                          href={`/admin/estimator/library/category/${category.parentCategory.id}`}
                          className="text-sm font-medium hover:text-blue-600"
                        >
                          {category.parentCategory.name}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-sm ${category.color === 'blue' ? 'bg-blue-200' : ''}`}>
                      {category.icon}
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Current Category</p>
                      <p className="text-sm font-medium">{category.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Calendar size={14} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-gray-600">{formatDate(category.createdAt)}</p>
                      <p className="text-xs text-gray-400">by {category.createdBy}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Clock size={14} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-gray-600">{formatDate(category.updatedAt)}</p>
                      <p className="text-xs text-gray-400">by {category.updatedBy}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Items in this Category</h2>
            <p className="text-gray-500">List of jobs/items will appear here...</p>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Packages using this Category</h2>
            <p className="text-gray-500">List of packages will appear here...</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.name}</p>
                      <span className="text-xs text-gray-400">{item.code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>Updated {formatDate(item.updatedAt)}</span>
                      <span>•</span>
                      <span>by {item.updatedBy}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/estimator/library/${item.type}/${item.id}`}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Eye size={14} className="text-gray-400" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Category</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{category.name}</span>? 
              This will affect {category.stats.totalItems} items and {category.stats.totalPackages} packages.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
