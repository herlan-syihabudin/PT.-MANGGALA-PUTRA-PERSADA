import type { Metadata } from "next"

// Components
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import Projects from "@/components/Projects"
import Partners from "@/components/Partners"
import FAQ from "@/components/FAQ"
import CTA from "@/components/CTA"
import { WhyChooseUs } from "@/components/WhyChooseUs"
import { ProjectOutcome } from "@/components/ProjectOutcome"

export const metadata: Metadata = {
  // Basic SEO
  title: "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
  description: "PT Manggala Putra Persada (MPP Engineering) delivers integrated construction solutions: steel structure, civil works, MEP installation, and design-build services for industrial & commercial projects across Indonesia.",
  
  // Keywords untuk search engine
  keywords: [
    "kontraktor indonesia",
    "construction contractor indonesia",
    "steel structure contractor",
    "civil engineering indonesia",
    "MEP installation",
    "design build indonesia",
    "kontraktor pabrik",
    "jasa konstruksi baja",
    "PT Manggala Putra Persada",
    "MPP Engineering"
  ].join(", "),
  
  // Author
  authors: [{ name: "PT Manggala Putra Persada", url: "https://mpp-engineering.com" }],
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: "Engineering-Led Construction Contractor Indonesia",
    description: "Steel Structure, Civil Engineering, MEP Installation & Design-Build Services",
    url: "https://mpp-engineering.com",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Engineering Construction",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Engineering-Led Construction Contractor Indonesia",
    description: "Steel Structure, Civil Engineering, MEP Installation & Design-Build Services",
    images: ["/og-image.jpg"],
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  alternates: {
    canonical: "https://mpp-engineering.com",
    languages: {
      'id-ID': 'https://mpp-engineering.com/id',
      'en-US': 'https://mpp-engineering.com/en',
    },
  },
  
  // Verification (isi dengan token lu)
  verification: {
    google: "google-site-verification-token",
    yandex: "yandex-verification-token",
    yahoo: "yahoo-verification-token",
  },
  
  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Manifest
  manifest: "/site.webmanifest",
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* ===== HERO SECTION ===== */}
      {/* H1 tag is inside Hero component for SEO */}
      <Hero />

      {/* ===== WHY CHOOSE US ===== */}
      {/* Trust building & differentiators */}
      <WhyChooseUs />

      {/* ===== PROJECT OUTCOME ===== */}
      {/* Key results & statistics */}
      <ProjectOutcome />

      {/* ===== SERVICES ===== */}
      {/* Core offerings */}
      <Services />

      {/* ===== PROJECTS ===== */}
      {/* Social proof & portfolio */}
      <Projects />

      {/* ===== PARTNERS ===== */}
      {/* Trust signals from clients/brands */}
      <Partners />

      {/* ===== FAQ ===== */}
      {/* Address objections & questions */}
      <FAQ />

      {/* ===== CTA ===== */}
      {/* Final conversion push */}
      <CTA />
    </main>
  )
}
