import type { Metadata } from "next"
import InsightClient from "./InsightClient"
import { insights } from "@/lib/insights"

export const metadata: Metadata = {
  title: "Engineering Insights | PT Manggala Putra Persada",
  description:
    "Artikel dan insight engineering dari PT Manggala Putra Persada tentang konstruksi industri dan project management.",
}

const categories = Array.from(new Set(insights.map((i) => i.category)))

const avgReadTime = Math.round(
  insights.reduce((acc, i) => acc + (i.readingTime || 0), 0) / insights.length
)

export default function Page() {
  return (
    <InsightClient
      insights={insights}
      categories={categories}
      avgReadTime={avgReadTime}
    />
  )
}
