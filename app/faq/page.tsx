import type { Metadata } from "next"
import FAQ from "@/components/FAQ"
import { faqItems } from "@/lib/faq"

export const metadata: Metadata = {
  title: "FAQ Konstruksi & Engineering | PT Manggala Putra Persada",
  description:
    "FAQ seputar jasa konstruksi dan engineering PT Manggala Putra Persada, meliputi proyek industri, struktur baja, MEP, design & build, quality control, dan sistem kerja.",
  keywords: [
    "FAQ kontraktor",
    "jasa konstruksi industri",
    "engineering dan konstruksi",
    "struktur baja indonesia",
    "kontraktor MEP",
    "design and build indonesia",
    "PT Manggala Putra Persada",
  ],
  alternates: {
    canonical: "https://pt-manggala-putra-persada.vercel.app/faq",
  },
  openGraph: {
    title: "FAQ Konstruksi & Engineering | PT Manggala Putra Persada",
    description:
      "Pertanyaan umum tentang layanan konstruksi dan engineering PT Manggala Putra Persada.",
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
    <main>
      {/* ===== FAQ SCHEMA (RICH RESULT GOOGLE) ===== */}
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

      <FAQ items={faqItems} />
    </main>
  )
}
