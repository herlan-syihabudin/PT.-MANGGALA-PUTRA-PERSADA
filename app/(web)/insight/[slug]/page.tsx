import { notFound } from "next/navigation"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  ChevronRight,
  ArrowLeft,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Eye
} from "lucide-react"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA (AUTO + SAFE)
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
    title: insight.metaTitle || `${insight.title} | MPP Engineering`,
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
   PAGE
========================= */
export default function InsightDetailPage({ params }: Props) {
  const insight = insights.find((i) => i.slug === params.slug)
  if (!insight) return notFound()

  const url = `https://mppindo.com/insight/${insight.slug}`
  
  // Format konten dengan paragraf
  const paragraphs = (insight.content ?? "").trim().split("\n").filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* ===== HERO SECTION DENGAN IMAGE ===== */}
      {insight.featuredImage && (
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <Image
  src={insight.featuredImage}
  alt={insight.title}
  fill
  priority
  sizes="100vw"
  className="object-cover"
/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* BREADCRUMB DI ATAS GAMBAR */}
          <div className="absolute top-8 left-0 right-0 max-w-7xl mx-auto px-6 z-10">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={14} />
              <Link href="/insight" className="hover:text-white transition">Insights</Link>
              <ChevronRight size={14} />
              <span className="text-white font-medium truncate">{insight.title}</span>
            </div>
          </div>
          
          {/* TITLE DI ATAS GAMBAR */}
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-16 z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                {insight.category}
              </span>
              {insight.readingTime && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  {insight.readingTime} min read
                </span>
              )}
              {insight.views && (
                <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-xs rounded-full flex items-center gap-1">
                  <Eye size={12} />
                  {insight.views.toLocaleString()} views
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl leading-tight">
              {insight.title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-white/80">
              <span className="flex items-center gap-1 text-sm">
                <Calendar size={14} />
                {new Date(insight.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {insight.author && (
                <span className="flex items-center gap-1 text-sm">
                  <User size={14} />
                  {insight.author}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* ===== SIDEBAR KIRI (TABLE OF CONTENTS + SHARE) ===== */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-32 space-y-8">
              
              {/* TABLE OF CONTENTS */}
              {insight.tableOfContents && insight.tableOfContents.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gold rounded-full" />
                    In This Article
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {insight.tableOfContents.map((item) => (
                      <li key={item.id}>
                        <a 
                          href={`#${item.id}`}
                          className="text-gray-600 hover:text-red-600 transition flex items-start gap-2"
                          style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                        >
                          <span className="w-1 h-1 bg-gray-300 rounded-full mt-2" />
                          <span className={item.level === 2 ? "font-medium" : ""}>
                            {item.title}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* SHARE BUTTONS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4">Share This Insight</h4>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
                    <MessageCircle size={18} />
                  </button>
                  <button className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                    <Bookmark size={18} />
                  </button>
                  <button className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <ThumbsUp size={18} />
                  </button>
                </div>
              </div>
              
              {/* KEYWORDS */}
              {insight.keywords && insight.keywords.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        #{kw.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===== CONTENT UTAMA ===== */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            
            {/* CATEGORY & META (HANYA JIKA TIDAK ADA FEATURED IMAGE) */}
            {!insight.featuredImage && (
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                    {insight.category}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(insight.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {insight.readingTime && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      {insight.readingTime} min read
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {insight.title}
                </h1>
              </div>
            )}

            {/* BREADCRUMB (HANYA JIKA TIDAK ADA FEATURED IMAGE) */}
            {!insight.featuredImage && (
              <div className="mb-8 text-sm text-gray-500">
                <Link href="/" className="hover:text-red-600 transition">Home</Link>
                <ChevronRight size={14} className="inline mx-2" />
                <Link href="/insight" className="hover:text-red-600 transition">Insights</Link>
                <ChevronRight size={14} className="inline mx-2" />
                <span className="text-gray-900 font-medium">{insight.title}</span>
              </div>
            )}

            {/* IMAGE GALLERY (JIKA ADA MULTIPLE IMAGES) */}
            {insight.images && insight.images.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {insight.images.map((img, i) => (
                    <div key={i} className="relative h-40 rounded-xl overflow-hidden group">
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENT DENGAN STYLING BAGUS */}
            <article className="prose prose-lg prose-gray max-w-none">
              {paragraphs.map((p, i) => (
  <p
    key={i}
    className={i === 0 ? "text-xl text-gray-700 font-medium leading-relaxed" : ""}
  >
    {p}
  </p>
))}
            </article>

            {/* FAQ SECTION (RICH SNIPPETS) */}
            {insight.faqs && insight.faqs.length > 0 && (
              <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gold rounded-full" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-6">
                  {insight.faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RELATED INSIGHTS */}
            {insight.relatedInsights && insight.relatedInsights.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gold rounded-full" />
                  Related Insights
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {insight.relatedInsights.slice(0, 3).map((slug, i) => {
                    const related = insights.find(ins => ins.slug === slug.replace('/insight/', ''))
                    if (!related) return null
                    return (
                      <Link
                        key={i}
                        href={slug}
                        className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition hover:-translate-y-1"
                      >
                        <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition line-clamp-2">
                          {related.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {related.excerpt}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* RELATED SERVICES */}
            {insight.relatedServices && insight.relatedServices.length > 0 && (
              <div className="mt-12 p-8 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Need Engineering Support?</h3>
                <p className="mb-6 opacity-90">
                  Our team specializes in the services mentioned in this article.
                </p>
                <div className="flex flex-wrap gap-3">
                  {insight.relatedServices.slice(0, 3).map((s, i) => {
                    const label = typeof s === 'string' 
                      ? s.replace("/layanan/", "").replace(/-/g, " ")
                      : "Learn more"
                    return (
                      <Link
                        key={i}
                        href={typeof s === 'string' ? s : '/kontak'}
                        className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition text-sm font-medium"
                      >
                        {label}
                      </Link>
                    )
                  })}
                  <Link
                    href="/kontak"
                    className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition text-sm font-medium ml-auto flex items-center gap-1"
                  >
                    Consult Our Engineers
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* AUTHOR BIO */}
            {insight.author && (
              <div className="mt-12 flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Written by {insight.author}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Engineering insights from the team at PT Manggala Putra Persada, 
                    delivering structured construction solutions for industrial and commercial projects.
                  </p>
                </div>
              </div>
            )}

            {/* BACK BUTTON */}
            <div className="mt-16 flex justify-between items-center">
              <Link
                href="/insight"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
                Back to all insights
              </Link>
              
              <button className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 transition">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SCHEMA SEO : ARTICLE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            headline: insight.title,
            description: insight.excerpt,
            wordCount: insight.wordCount,
timeRequired: insight.readingTime ? `PT${insight.readingTime}M` : undefined,
            articleSection: insight.category,
            datePublished: insight.publishedAt,
            dateModified: insight.lastUpdated || insight.publishedAt,
            author: { "@type": "Organization", name: insight.author ?? "PT Manggala Putra Persada" },
            publisher: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              logo: { "@type": "ImageObject", url: "https://mppindo.com/logo-mp.png" },
            },
            image: insight.featuredImage || "https://mppindo.com/og-image.png",
            keywords: insight.keywords?.join(", "),
          }),
        }}
      />

      {/* ===== SCHEMA SEO : FAQ (JIKA ADA) ===== */}
      {insight.faqs && insight.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": insight.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            }),
          }}
        />
      )}

      {/* ===== SCHEMA SEO : BREADCRUMB ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://mppindo.com" },
              { "@type": "ListItem", position: 2, name: "Insights", item: "https://mppindo.com/insight" },
              { "@type": "ListItem", position: 3, name: insight.title, item: url },
            ],
          }),
        }}
      />
    </div>
  )
}
