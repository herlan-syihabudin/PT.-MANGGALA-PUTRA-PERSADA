import { notFound } from "next/navigation"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA (TOP TIER)
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

  const url = `https://pt-manggala-putra-persada.vercel.app/insight/${insight.slug}`

  return {
    title: insight.title,
    description: insight.excerpt,
    keywords: [
      "engineering construction",
      "industrial construction",
      "engineering contractor indonesia",
      insight.category.toLowerCase(),
    ],
    alternates: { canonical: url },
    openGraph: {
      title: insight.title,
      description: insight.excerpt,
      url,
      siteName: "PT Manggala Putra Persada",
      type: "article",
      publishedTime: insight.publishedAt,
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

  const url = `https://pt-manggala-putra-persada.vercel.app/insight/${insight.slug}`

  return (
    <section className="py-24 bg-white">
      {/* ===== SCHEMA SEO : ARTICLE ===== */}
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
            datePublished: insight.publishedAt,
            dateModified: insight.publishedAt,
            author: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
            },
            publisher: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              logo: {
                "@type": "ImageObject",
                url: "https://pt-manggala-putra-persada.vercel.app/logo-mp.png",
              },
            },
          }),
        }}
      />
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
          item: "https://pt-manggala-putra-persada.vercel.app",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Insights",
          item: "https://pt-manggala-putra-persada.vercel.app/insight",
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

        {/* CTA INTERNAL LINK (SEO BOOST) */}
        <div className="mt-16 p-6 border rounded-xl bg-gray-50">
          <p className="font-semibold text-gray-900 mb-2">
            Need an engineering-led construction partner?
          </p>
          <p className="text-gray-600 mb-4">
            Explore our professional construction services for industrial and
            commercial projects in Indonesia.
          </p>
          <a
            href="/layanan"
            className="inline-block text-sm font-semibold text-red-600 hover:underline"
          >
            View Our Services →
          </a>
        </div>

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
