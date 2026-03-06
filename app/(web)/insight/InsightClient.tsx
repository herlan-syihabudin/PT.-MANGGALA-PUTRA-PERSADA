// app/(web)/insight/InsightClient.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Eye, ArrowRight, Search } from "lucide-react"
import { useState, useMemo } from "react"

interface InsightClientProps {
  insights: any[]
  categories: string[]
  avgReadTime: number
}

export default function InsightClient({ insights, categories, avgReadTime }: InsightClientProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Filter insights
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesSearch = search === "" || 
        insight.title.toLowerCase().includes(search.toLowerCase()) ||
        insight.excerpt.toLowerCase().includes(search.toLowerCase())
      
      const matchesCategory = selectedCategory === "All" || insight.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory, insights])

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER DENGAN STATS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
              Knowledge Base
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Engineering <span className="text-red-600">Insights</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Practical insights and technical perspectives from our engineering team.
            </p>
          </div>

          {/* STATS CARDS */}
          <div className="flex gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center min-w-[100px] shadow-sm">
              <div className="text-2xl font-bold text-red-600">{insights.length}</div>
              <div className="text-xs text-gray-500">Articles</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center min-w-[100px] shadow-sm">
              <div className="text-2xl font-bold text-red-600">{categories.length}</div>
              <div className="text-xs text-gray-500">Categories</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center min-w-[100px] shadow-sm">
              <div className="text-2xl font-bold text-red-600">{avgReadTime}</div>
              <div className="text-xs text-gray-500">Min Read</div>
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH - copy dari kode lo sebelumnya */}
        {/* ... sisanya sama persis kaya HTML lo yang tadi ... */}
        {/* tinggal paste semua JSX dari return lo di sini */}

      </div>
    </section>
  )
}
