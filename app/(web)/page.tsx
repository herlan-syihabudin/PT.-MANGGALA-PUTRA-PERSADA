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
  title: "Kontraktor Konstruksi Engineering Indonesia | PT Manggala Putra Persada",

  description:
    "PT Manggala Putra Persada menyediakan layanan konstruksi struktur baja, pekerjaan sipil, instalasi Mechanical Electrical Plumbing (MEP), serta design & build untuk proyek industri dan komersial di Indonesia.",

  // Keywords untuk search engine
  keywords: [
    "kontraktor konstruksi indonesia",
    "kontraktor struktur baja",
    "konstruksi sipil indonesia",
    "instalasi MEP",
    "design build konstruksi",
    "kontraktor pabrik",
    "jasa konstruksi baja",
    "kontraktor industri",
    "PT Manggala Putra Persada",
    "MPP Engineering"
  ],

  // Author
  authors: [{ name: "PT Manggala Putra Persada", url: "https://mppindo.com" }],

  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: "Kontraktor Konstruksi Engineering Indonesia",
    description:
      "Layanan konstruksi struktur baja, pekerjaan sipil, instalasi MEP, serta design & build untuk proyek industri dan komersial.",
    url: "https://mppindo.com",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "https://mppindo.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Kontraktor Konstruksi Engineering",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Kontraktor Konstruksi Engineering Indonesia",
    description:
      "Konstruksi struktur baja, pekerjaan sipil, instalasi MEP, dan design & build.",
    images: ["https://mppindo.com/og-image.jpg"],
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Canonical URL
  alternates: {
    canonical: "https://mppindo.com",
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
