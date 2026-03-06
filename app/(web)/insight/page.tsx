"use client"

import Link from "next/link"
import { insights } from "@/lib/insights"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Engineering Insights | PT Manggala Putra Persada",
  description:
    "Artikel dan insight engineering dari PT Manggala Putra Persada tentang konstruksi industri, struktur baja, MEP, dan manajemen proyek.",
  alternates: {
    canonical: "https://mppindo.com/insight",
  },
  openGraph: {
    title: "Engineering Insights | PT Manggala Putra Persada",
    description:
      "Artikel engineering, konstruksi, dan manajemen proyek dari tim PT Manggala Putra Persada.",
    url: "https://mppindo.com/insight",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [
      {
        url: "https://mppindo.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Engineering Insights PT Manggala Putra Persada",
      },
    ],
  },
}

export default function InsightPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering <span className="text-red-600">Insights</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Practical insights and technical perspectives from PT Manggala Putra
            Persada, covering engineering, construction execution, project
            management, and industry best practices.
          </p>
        </div>

        {/* INSIGHT LIST */}
        <div className="grid md:grid-cols-3 gap-10 mb-24">
          {insights.map((insight) => (
            <div
              key={insight.slug}
              className="border rounded-2xl p-8 flex flex-col hover:shadow-xl hover:-translate-y-1 transition"
            >
              <span className="text-sm font-semibold text-red-600 mb-2">
                {insight.category}
              </span>

              <h2 className="font-bold text-gray-900 mb-3 text-lg">
                {insight.title}
              </h2>

              <p className="text-gray-600 mb-6">
                {insight.excerpt}
              </p>

              <Link
                href={`/insight/${insight.slug}`}
                className="mt-auto text-sm font-semibold text-red-600 hover:underline"
              >
                Read Insight →
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border-t pt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for Engineering Perspective on Your Project?
          </h3>
          <p className="text-gray-700 mb-8">
            Discuss your project requirements with our engineering and
            construction team.
          </p>

          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project
          </Link>
        </div>

        <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "Blog",
"name": "Engineering Insights",
"url": "https://mppindo.com/insight",
"blogPost": insights.map((i) => ({
"@type": "BlogPosting",
"headline": i.title,
"url": `https://mppindo.com/insight/${i.slug}`,
"datePublished": i.publishedAt,
}))
})
}}
/>
        
      </div>
    </section>
  )
}
