'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  totalItems: number
  totalPackages: number
  color: keyof typeof colorMap
  subcategories?: Category[]
}

/* ================= SAFE COLOR MAP ================= */

const colorMap = {
  blue: 'text-blue-500',
  cyan: 'text-cyan-500',
  green: 'text-green-500',
  emerald: 'text-emerald-500',
  purple: 'text-purple-500',
  violet: 'text-violet-500'
} as const

export default function CategoryPage() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])

  const categories: Category[] = [
    {
      id: '1',
      name: 'Struktur',
      description: 'Pekerjaan struktur bangunan',
      totalItems: 45,
      totalPackages: 12,
      color: 'blue',
      subcategories: [
        {
          id: '1-1',
          name: 'Pondasi',
          description: 'Pekerjaan pondasi',
          totalItems: 15,
          totalPackages: 4,
          color: 'cyan'
        },
        {
          id: '1-2',
          name: 'Kolom & Balok',
          description: 'Pekerjaan kolom dan balok',
          totalItems: 18,
          totalPackages: 5,
          color: 'cyan'
        }
      ]
    },
    {
      id: '2',
      name: 'Finishing',
      description: 'Pekerjaan finishing',
      totalItems: 78,
      totalPackages: 23,
      color: 'green',
      subcategories: [
        {
          id: '2-1',
          name: 'Dinding',
          description: 'Pekerjaan dinding',
          totalItems: 25,
          totalPackages: 8,
          color: 'emerald'
        },
        {
          id: '2-2',
          name: 'Lantai',
          description: 'Pekerjaan lantai',
          totalItems: 22,
          totalPackages: 7,
          color: 'emerald'
        }
      ]
    }
  ]

  /* ================= EXPAND TOGGLE ================= */

  const toggleExpand = (id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  /* ================= RECURSIVE SEARCH ================= */

  const filterCategories = (cats: Category[]): Category[] => {
    return cats
      .map(cat => {
        const matchSelf =
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.description.toLowerCase().includes(search.toLowerCase())

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
  }

  const filteredCategories = useMemo(() => {
    if (!search) return categories
    return filterCategories(categories)
  }, [search])

  /* ================= CATEGORY ROW ================= */

  const CategoryRow = ({ cat, level = 0 }: { cat: Category; level?: number }) => {
    const hasChildren = cat.subcategories && cat.subcategories.length > 0
    const isExpanded = expanded.includes(cat.id)

    return (
      <>
        <tr className="border-b hover:bg-gray-50 hover:border-blue-300 transition">
          <td className="p-4">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight
                    size={16}
                    className={`transform transition ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>
              )}

              <FolderTree
                size={18}
                className={colorMap[cat.color]}
              />

              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </div>
            </div>
          </td>

          <td className="p-4 text-center">{cat.totalItems}</td>
          <td className="p-4 text-center">{cat.totalPackages}</td>

          <td className="p-4">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/estimator/library/category/${cat.id}/edit`}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Edit size={16} className="text-gray-600" />
              </Link>

              <button className="p-2 hover:bg-gray-100 rounded text-red-500">
                <Trash2 size={16} />
              </button>
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
  }

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Category Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Organize work items into hierarchical categories
          </p>
        </div>

        <Link
          href="/admin/estimator/library/category/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          New Category
        </Link>
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
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-medium text-gray-600">
                Category
              </th>
              <th className="p-4 text-center text-sm font-medium text-gray-600">
                Total Items
              </th>
              <th className="p-4 text-center text-sm font-medium text-gray-600">
                Total Packages
              </th>
              <th className="p-4 text-right text-sm font-medium text-gray-600">
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

    </div>
  )
}
