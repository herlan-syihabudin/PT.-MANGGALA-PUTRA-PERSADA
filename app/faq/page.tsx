import type { Metadata } from "next"
import FAQ from "@/components/FAQ"
import { faqItems } from "@/lib/faq"

export const metadata: Metadata = {
  title: "FAQ Konstruksi & Engineering | PT Manggala Putra Persada",
  description:
    "Pertanyaan yang sering diajukan seputar jasa konstruksi dan engineering PT Manggala Putra Persada, meliputi jenis proyek, standar kerja, sistem pelaporan, dan proses kerja sama.",
  keywords: [
    "FAQ kontraktor",
    "jasa konstruksi",
    "engineering dan konstruksi",
    "pertanyaan kontraktor",
    "kontraktor industri indonesia",
    "kontraktor struktur baja",
    "kontraktor MEP",
  ],
  alternates: {
    canonical: "https://pt-manggala-putra-persada.vercel.app/faq",
  },
  openGraph: {
    title: "FAQ Konstruksi & Engineering | PT Manggala Putra Persada",
    description:
      "Jawaban lengkap seputar layanan konstruksi, engineering, struktur baja, MEP, dan sistem kerja PT Manggala Putra Persada.",
    url: "https://pt-manggala-putra-persada.vercel.app/faq",
    siteName: "PT Manggala Putra Persada",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FAQPage() {
  return (
    <main className="py-24 bg-white">

      {/* ===== SCHEMA SEO : FAQ PAGE (AUTO) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

      {/* ===== PAGE CONTENT ===== */}
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
          Frequently Asked Questions
        </h1>

        <p className="text-lg text-gray-600 mb-14 max-w-3xl">
          Temukan jawaban atas pertanyaan umum seputar layanan konstruksi dan
          engineering kami, mulai dari jenis proyek, sistem kerja, hingga
          standar kualitas dan pelaporan.
        </p>

        <FAQ items={faqItems} />
      </div>
    </main>
  )
}
