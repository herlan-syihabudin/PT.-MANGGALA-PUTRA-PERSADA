import { notFound } from "next/navigation"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"
import InsightClient from "./InsightClient"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA (ONLY IN SERVER COMPONENT)
========================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const insight = insights.find((i) => i.slug === params.slug)

  if (!insight) {
    return {
      title: "Insight Not Found | PT Manggala Putra Persada",
      robots: { index: false },
    }
  }

  const url = `https://mppindo.com/insight/${insight.slug}`

  return {
    title: insight.metaTitle || `${insight.title} | PT Manggala Putra Persada`,
    description: insight.metaDescription || insight.excerpt,
    keywords: insight.keywords ?? [],
    alternates: { canonical: url },
    openGraph: {
      title: insight.metaTitle || insight.title,
      description: insight.metaDescription || insight.excerpt,
      url,
      type: "article",
      siteName: "PT Manggala Putra Persada",
      publishedTime: insight.publishedAt,
      images: insight.ogImage ? [
        {
          url: insight.ogImage,
          width: 1200,
          height: 630,
          alt: insight.title,
        },
      ] : insight.featuredImage ? [
        {
          url: insight.featuredImage,
          width: 1200,
          height: 630,
          alt: insight.title,
        },
      ] : [
        {
          url: "https://mppindo.com/og-image.png",
          width: 1200,
          height: 630,
          alt: insight.title,
        },
      ],
    },
    twitter: {
      card: insight.twitterCard || "summary_large_image",
      title: insight.metaTitle || insight.title,
      description: insight.metaDescription || insight.excerpt,
      images: [
        insight.ogImage || insight.featuredImage || "https://mppindo.com/og-image.png"
      ],
    },
    robots: {
      index: !insight.noIndex,
      follow: !insight.noFollow,
    },
  }
}

/* =========================
   PAGE - SERVER COMPONENT
   Just pass data to client component
========================= */
export default function Page({ params }: Props) {
  const insight = insights.find((i) => i.slug === params.slug)
  if (!insight) return notFound()

  return <InsightClient insight={insight} />
}
