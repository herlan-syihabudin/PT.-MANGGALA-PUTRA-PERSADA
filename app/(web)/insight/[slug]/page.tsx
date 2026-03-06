import { notFound } from "next/navigation"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"
import Link from "next/link"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA (AUTO + SAFE)
========================= */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const insight = insights.find((i) => i.slug === params.slug)

  if (!insight) {
    return {
      title: "Insight Not Found | PT Manggala Putra Persada",
      robots: { index: false },
    }
  }

  const url = `https://mppindo.com/insight/${insight.slug}`

  return {
    title: insight.title,
    description: insight.excerpt,
    keywords: insight.keywords ?? [],
    alternates: { canonical: url },
    openGraph: {
      title: insight.title,
      description: insight.excerpt,
      url,
      type: "article",
      siteName: "PT Manggala Putra Persada",
      publishedTime: insight.publishedAt,
      images: [
        {
          url: "https://mppindo.com/og-image.png",
          width: 1200,
          height: 630,
          alt: insight.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: insight.title,
      description: insight.excerpt,
      images: ["https://mppindo.com/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

/* =========================
   PAGE
========================= */
export default function InsightDetailPage({ params }: Props) {
  const insight = insights.find((i) => i.slug === params.slug)
  if (!insight) return notFound()

  const url = `https://mppindo.com/insight/${insight.slug}`

  return (
    <section className="py-24 bg-white">

      {/* ===== SCHEMA SEO : ARTICLE (AUTO FROM DATA) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": url,
            },
            headline: insight.title,
            description: insight.excerpt,
            articleSection: insight.category,
            datePublished: insight.publishedAt || new Date().toISOString().split('T')[0],
            dateModified: insight.publishedAt || new Date().toISOString().split('T')[0],
            author: {
              "@type": "Organization",
              name: insight.author ?? "PT Manggala Putra Persada",
            },
            publisher: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              logo: {
                "@type": "ImageObject",
                url: "https://mppindo.com/logo-mp.png",
              },
            },
            isPartOf: {
              "@type": "Blog",
              name: "MPP Engineering Insights",
              url: "https://mppindo.com/insight",
            },
            about: (insight.keywords ?? []).map((k) => ({
              "@type": "Thing",
              name: k,
            })),
          }),
        }}
      />

      {/* ===== SCHEMA SEO : BREADCRUMB ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://mppindo.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Insights",
                item: "https://mppindo.com/insight",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: insight.title,
                item: url,
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto px-6">

        {/* CATEGORY */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
          {insight.category}
        </span>

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          {insight.title}
        </h1>

        {/* DATE */}
        <p className="text-sm text-gray-500 mb-10">
          Published on{" "}
          {new Date(insight.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* CONTENT */}
        <article className="prose prose-gray max-w-none">
          {insight.content
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </article>

        {/* ===== AUTO INTERNAL LINKING (LONG-TAIL BOOST) ===== */}
        {insight.relatedServices && insight.relatedServices.length > 0 && (
          <div className="mt-16 p-6 border rounded-xl bg-gray-50">
            <p className="font-semibold text-gray-900 mb-3">
              Related Engineering Services
            </p>
            <ul className="space-y-2 text-sm">
              {insight.relatedServices.map((s, i) => {
                const href =
  typeof s === "string"
    ? s
    : (s as { href?: string }).href || "#"

const label =
  typeof s === "string"
    ? s.replace("/layanan/", "").replace(/-/g, " ")
    : (s as { label?: string }).label || "Lihat layanan"
                
                return (
                  <li key={i}>
                    <Link href={href} className="text-red-600 hover:underline">
                      → {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* BACK */}
        <div className="mt-14">
          <Link
            href="/insight"
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            ← Back to Insights
          </Link>  {/* ✅ FIXED: pakai </Link> */}
        </div>

      </div>
    </section>
  )
}
