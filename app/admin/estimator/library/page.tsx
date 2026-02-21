'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Layers,
  FolderTree,
  Plus,
  Grid3x3,
  List,
  ArrowRight
} from 'lucide-react'

/* ================= COLOR MAP (ANTI DYNAMIC TAILWIND) ================= */

const statColorMap = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600'
  }
} as const

const activityColorMap = {
  category: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: FolderTree
  },
  package: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: Layers
  },
  item: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: Package
  }
} as const

export default function WorkLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const stats = [
    {
      title: 'Total Categories',
      value: '24',
      icon: FolderTree,
      color: 'blue',
      href: '/admin/estimator/library/category'
    },
    {
      title: 'Total Packages',
      value: '156',
      icon: Layers,
      color: 'green',
      href: '/admin/estimator/library/package'
    },
    {
      title: 'Total Items',
      value: '1.248',
      icon: Package,
      color: 'purple',
      href: '/admin/estimator/library/items'
    },
    {
      title: 'Active Templates',
      value: '89',
      icon: Grid3x3,
      color: 'amber',
      href: '/admin/estimator/library/templates'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'category',
      name: 'Kamar Mandi',
      action: 'updated',
      user: 'Andi',
      time: '2 menit lalu'
    },
    {
      id: 2,
      type: 'package',
      name: 'Paket Kamar Tidur Utama',
      action: 'created',
      user: 'Budi',
      time: '15 menit lalu'
    },
    {
      id: 3,
      type: 'item',
      name: 'Pasang Keramik 60x60',
      action: 'price updated',
      user: 'Cici',
      time: '1 jam lalu'
    }
  ]

  const popularPackages = [
    { name: 'Paket Kamar Mandi 3x4', used: 45, category: 'Wet Area' },
    { name: 'Paket Dapur Minimalis', used: 38, category: 'Dry Area' },
    { name: 'Paket Ruang Tamu Mewah', used: 32, category: 'Interior' },
    { name: 'Paket Pondasi Rumah', used: 28, category: 'Structure' }
  ]

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

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
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
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const activityData =
                activityColorMap[activity.type as keyof typeof activityColorMap]
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
                      <span className="font-medium">{activity.name}</span>{' '}
                      <span className="text-gray-500">{activity.action}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>by {activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* POPULAR PACKAGES */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Packages</h2>
          <div className="space-y-4">
            {popularPackages.map((pkg, i) => (
              <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{pkg.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pkg.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{pkg.used}</p>
                  <p className="text-xs text-gray-400">used</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/estimator/library/package"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
          >
            View all packages →
          </Link>
        </div>
      </div>
    </div>
  )
}
