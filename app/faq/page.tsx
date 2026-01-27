import type { Metadata } from "next"
import FAQ from "@/components/FAQ"

export const metadata: Metadata = {
  title: "FAQ Konstruksi & Engineering | PT Manggala Putra Persada",
  description:
    "Pertanyaan yang sering diajukan seputar jasa konstruksi dan engineering PT Manggala Putra Persada, meliputi jenis proyek, standar kerja, sistem pelaporan, dan proses kerja sama.",
  keywords: [
    "FAQ kontraktor",
    "jasa konstruksi",
    "engineering dan konstruksi",
    "pertanyaan kontraktor",
    "PT Manggala Putra Persada",
  ],
  openGraph: {
    title: "Frequently Asked Questions | PT Manggala Putra Persada",
    description:
      "Informasi dan pertanyaan umum terkait layanan konstruksi dan engineering PT Manggala Putra Persada.",
    url: "https://pt-manggala-putra-persada.vercel.app/faq",
    siteName: "PT Manggala Putra Persada",
    type: "article",
  },
}

export default function FAQPage() {
  return (
    <main>
      <FAQ />
    </main>
  )
}
