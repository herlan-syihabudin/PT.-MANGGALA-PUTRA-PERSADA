'use client'

import { useState } from 'react'
import { Grid3x3, LayoutList, ArrowUpDown } from 'lucide-react'

type Props = {
  categories: string[]
}

export default function ProjectFilters({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded-lg transition ${
            viewMode === 'grid'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Grid3x3 size={18} />
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`p-2 rounded-lg transition ${
            viewMode === 'list'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <LayoutList size={18} />
        </button>

        <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <ArrowUpDown size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}
