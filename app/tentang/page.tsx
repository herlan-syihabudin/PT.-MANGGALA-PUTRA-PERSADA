import type { Metadata } from "next"
import AboutSection from "@/components/AboutSection"

export const metadata: Metadata = {
  title: "About Us | PT Manggala Putra Persada",
  description:
    "Company profile of PT Manggala Putra Persada, an engineering and construction company delivering projects through structured planning, technical discipline, and professional execution.",
  keywords: [
    "engineering contractor",
    "construction company Indonesia",
    "jasa konstruksi",
    "engineering dan konstruksi",
    "PT Manggala Putra Persada",
  ],
  openGraph: {
    title: "About PT Manggala Putra Persada",
    description:
      "Learn more about PT Manggala Putra Persada, an engineering-led construction company delivering structured and reliable project execution.",
    url: "https://pt-manggala-putra-persada.vercel.app/tentang",
    siteName: "PT Manggala Putra Persada",
    type: "article",
  },
}

export default function TentangPage() {
  return (
    <main>
      <AboutSection />
    </main>
  )
}
