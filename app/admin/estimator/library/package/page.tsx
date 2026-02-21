'use client'

import { useState, useMemo } from 'react'
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
  BarChart3
} from 'lucide-react'

interface Package {
  id: string
  name: string
  description: string
  category: string
  items: number
  usageCount: number
  lastUsed: string
  estimatedCost: number
  status: 'active' | 'draft' | 'archived'
}

export default function PackagePage() {
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const packages: Package[] = [
    {
      id: '1',
      name: 'Paket Kamar Mandi 3x4',
      description: 'Complete bathroom package with standard spec',
      category: 'Wet Area',
      items: 24,
      usageCount: 45,
      lastUsed: '2026-02-20',
      estimatedCost: 45000000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Paket Dapur Minimalis',
      description: 'Modern kitchen with island',
      category: 'Dry Area',
      items: 32,
      usageCount: 38,
      lastUsed: '2026-02-19',
      estimatedCost: 65000000,
      status: 'active'
    },
    {
      id: '3',
      name: 'Paket Ruang Tamu Mewah',
      description: 'Luxury living room with high-end finish',
      category: 'Interior',
      items: 28,
      usageCount: 32,
      lastUsed: '2026-02-18',
      estimatedCost: 85000000,
      status: 'active'
    },
    {
      id: '4',
      name: 'Paket Pondasi Rumah',
      description: 'Standard foundation package',
      category: 'Structure',
      items: 18,
      usageCount: 28,
      lastUsed: '2026-02-15',
      estimatedCost: 125000000,
      status: 'draft'
    }
  ]

  const categories = ['Wet Area', 'Dry Area', 'Interior', 'Structure', 'Exterior']

  /* ================= FILTER LOGIC ================= */

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchSearch =
        pkg.name.toLowerCase().includes(search.toLowerCase()) ||
        pkg.description.toLowerCase().includes(search.toLowerCase())

      const matchCategory =
        categoryFilter === 'all' || pkg.category === categoryFilter

      const matchStatus =
        statusFilter === 'all' || pkg.status === statusFilter

      return matchSearch && matchCategory && matchStatus
    })
  }, [packages, search, categoryFilter, statusFilter])

  /* ================= STATUS COLOR ================= */

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value)

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Package Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage reusable work packages
          </p>
        </div>

        <Link
          href="/admin/estimator/library/package/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Package
        </Link>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* PACKAGES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white border rounded-xl p-6 hover:shadow-md hover:border-blue-400 transition cursor-pointer"
            onClick={() => router.push(`/admin/estimator/library/package/${pkg.id}`)}
          >

            {/* HEADER */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Layers size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{pkg.description}</p>
                </div>
              </div>

              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                {pkg.status}
              </span>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <FolderTree size={14} className="text-gray-400" />
                {pkg.category}
              </div>

              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-gray-400" />
                {pkg.items} items
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                Used {pkg.usageCount}x
              </div>

              <div>
                <span className="text-gray-400 text-xs">Last: </span>
                {new Date(pkg.lastUsed).toLocaleDateString('id-ID')}
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
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Copy package')
                  }}
                >
                  <Copy size={16} className="text-gray-600" />
                </button>

                <Link
                  href={`/admin/estimator/library/package/${pkg.id}/edit`}
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit size={16} className="text-gray-600" />
                </Link>

                <Link
                  href={`/admin/estimator/library/package/${pkg.id}`}
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye size={16} className="text-blue-600" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No packages found.
        </div>
      )}

    </div>
  )
}
