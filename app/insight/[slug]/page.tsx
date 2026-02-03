import { notFound } from "next/navigation"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA
========================= */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const insight = insights.find((i) => i.slug === params.slug)

  if (!insight) {
    return { title: "Insight Not Found | PT Manggala Putra Persada" }
  }

  return {
    title: `${insight.title} | PT Manggala Putra Persada`,
    description: insight.excerpt,
    openGraph: {
      title: insight.title,
      description: insight.excerpt,
      type: "article",
    },
  }
}

/* =========================
   PAGE
========================= */
export default function InsightDetailPage({ params }: Props) {
  const insight = insights.find((i) => i.slug === params.slug)

  if (!insight) return notFound()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* META */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
          {insight.category}
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          {insight.title}
        </h1>

        <p className="text-sm text-gray-500 mb-10">
          Published on {new Date(insight.publishedAt).toLocaleDateString()}
        </p>

        {/* CONTENT */}
        <article className="prose prose-gray max-w-none">
          {insight.content.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {/* BACK */}
        <div className="mt-14">
          <a
            href="/insight"
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            ← Back to Insights
          </a>
        </div>

      </div>
    </section>
  )
}
