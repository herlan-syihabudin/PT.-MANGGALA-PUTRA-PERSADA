"use client"

import Link from "next/link"
import Image from "next/image"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"
import { Calendar, Clock, Eye, ArrowRight, Search } from "lucide-react"
import { useState, useMemo } from "react"

export const metadata: Metadata = {
  title: "Engineering Insights | PT Manggala Putra Persada",
  description: "Artikel dan insight engineering dari PT Manggala Putra Persada tentang konstruksi industri, struktur baja, MEP, dan manajemen proyek.",
  alternates: { canonical: "https://mppindo.com/insight" },
  openGraph: {
    title: "Engineering Insights | PT Manggala Putra Persada",
    description: "Artikel engineering, konstruksi, dan manajemen proyek dari tim PT Manggala Putra Persada.",
    url: "https://mppindo.com/insight",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [{
      url: "https://mppindo.com/og-insight.jpg",
      width: 1200,
      height: 630,
      alt: "Engineering Insights PT Manggala Putra Persada",
    }],
  },
}

// Hitung statistik
const categories = Array.from(new Set(insights.map(i => i.category)))
const totalViews = insights.reduce((acc, i) => acc + (i.views || 0), 0)
const avgReadTime = Math.round(insights.reduce((acc, i) => acc + (i.readingTime || 0), 0) / insights.length)

export default function InsightPage() {
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
  }, [search, selectedCategory])

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* ===== HEADER DENGAN STATS ===== */}
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

        {/* ===== FILTER & SEARCH ===== */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search insights..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                selectedCategory === "All"
                  ? "bg-red-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ===== FEATURED INSIGHT (ARTIKEL TERBARU) ===== */}
        {insights.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Featured Insight
            </h2>
            
            <Link
              href={`/insight/${insights[0].slug}`}
              className="group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="grid md:grid-cols-2">
                {/* GAMBAR */}
                <div className="relative h-[300px] md:h-full bg-gray-100">
                  <Image
                    src={insights[0].featuredImage || "/images/insight-placeholder.jpg"}
                    alt={insights[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
                
                {/* KONTEN */}
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                      {insights[0].category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(insights[0].publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    {insights[0].readingTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {insights[0].readingTime} min
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition">
                    {insights[0].title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {insights[0].excerpt}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <span className="text-sm font-semibold text-red-600 group-hover:underline">
                      Read full article
                    </span>
                    <ArrowRight size={16} className="text-red-600 group-hover:translate-x-2 transition" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ===== INSIGHT GRID ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Latest Articles
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({filteredInsights.length} articles)
            </span>
          </h2>

          {filteredInsights.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
              <p className="text-gray-500">No articles found matching your criteria.</p>
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-4 text-red-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInsights.map((insight) => (
                <Link
                  key={insight.slug}
                  href={`/insight/${insight.slug}`}
                  className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  {/* GAMBAR */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <Image
                      src={insight.featuredImage || "/images/insight-placeholder.jpg"}
                      alt={insight.title}
                      fill
                      className="object-cover group-hover:scale-110 transition duration-700"
                    />
                    
                    {/* CATEGORY BADGE DI ATAS GAMBAR */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        {insight.category}
                      </span>
                    </div>
                    
                    {/* META INFO OVERLAY */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      {insight.readingTime && (
                        <span className="px-2 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-full flex items-center gap-1">
                          <Clock size={12} />
                          {insight.readingTime} min
                        </span>
                      )}
                      {insight.views && (
                        <span className="px-2 py-1 bg-black/60 backdrop-blur text-white text-xs rounded-full flex items-center gap-1">
                          <Eye size={12} />
                          {insight.views}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KONTEN */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar size={12} />
                      {new Date(insight.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-red-600 transition line-clamp-2">
                      {insight.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {insight.excerpt}
                    </p>
                    
                    <div className="flex items-center text-sm font-semibold text-red-600 group-hover:underline">
                      Read Insight
                      <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===== POPULAR TOPICS / KEYWORDS ===== */}
        <div className="mb-16">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Topics</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(insights.flatMap(i => i.keywords || []))).slice(0, 10).map((kw, i) => (
              <button
                key={i}
                onClick={() => setSearch(kw)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-red-600 hover:text-red-600 transition"
              >
                #{kw.replace(/\s+/g, '')}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CTA PREMIUM ===== */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Engineering Perspective on Your Project?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discuss your project requirements with our engineering and construction team.
          </p>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
          >
            Discuss Your Project
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* ===== SCHEMA BLOG ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "Engineering Insights",
              "url": "https://mppindo.com/insight",
              "description": metadata.description,
              "blogPost": insights.map((i) => ({
                "@type": "BlogPosting",
                "headline": i.title,
                "url": `https://mppindo.com/insight/${i.slug}`,
                "datePublished": i.publishedAt,
                "description": i.excerpt,
                "image": i.featuredImage || "https://mppindo.com/og-image.png",
              }))
            })
          }}
        />
      </div>
    </section>
  )
}
