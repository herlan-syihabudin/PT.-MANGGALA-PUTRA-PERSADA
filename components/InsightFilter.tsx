"use client"

import { useState, useMemo } from "react"
import { insights } from "@/lib/insights"

export default function InsightFilter() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const matchesSearch =
        search === "" ||
        insight.title.toLowerCase().includes(search.toLowerCase()) ||
        insight.excerpt.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === "All" ||
        insight.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory])

  return (
    <div>
      {/* search + filter + grid logic disini */}
    </div>
  )
}
