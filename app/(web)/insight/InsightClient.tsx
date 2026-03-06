"use client"

import { useState } from "react"

export default function InsightClient({ insights, categories, avgReadTime }: any) {
  const [search, setSearch] = useState("")

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold mb-6">
        Engineering Insights
      </h1>

      <p className="text-gray-600 mb-10">
        Articles: {insights.length} | Categories: {categories.length} | Avg Read: {avgReadTime} min
      </p>
    </div>
  )
}
