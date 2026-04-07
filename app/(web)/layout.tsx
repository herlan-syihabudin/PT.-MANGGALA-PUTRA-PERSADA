import { Inter } from "next/font/google"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import Script from "next/script"
import type { Metadata } from "next"

import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const siteConfig = {
  name: "PT Manggala Putra Persada",
  shortName: "MPP Engineering",
  url: "https://mppindo.com",
  logo: "/logo-mp.png",
  phone: "+62-812-2922-2463",
  email: "info@mppindo.com",
  address: {
    locality: "Bekasi",
    region: "West Java",
    country: "ID",
  },
  socials: {
    linkedin: "https://linkedin.com/company/mpp-engineering",
    instagram: "https://instagram.com/mppengineering",
  },
}

const siteDescription =
  "PT Manggala Putra Persada (MPP Engineering) is an engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP systems, and design & build services for industrial and commercial projects."

export const metadata: Metadata = {
  title: {
    default: "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    template: "%s | PT Manggala Putra Persada",
  },
  description: siteDescription,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    description: siteDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "id_ID",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada - Engineering & Construction Contractor Indonesia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering-Led Construction Contractor Indonesia",
    description: "Steel structure, civil, MEP, and design & build services for industrial projects",
    images: ["/twitter-image.png"],
    creator: "@mppengineering",
    site: "@mppengineering",
  },
}

function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url: siteConfig.url,
        logo: `${siteConfig.url}${siteConfig.logo}`,
        description: siteDescription,
        sameAs: Object.values(siteConfig.socials),
        email: siteConfig.email,
        telephone: siteConfig.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteConfig.address.locality,
          addressRegion: siteConfig.address.region,
          addressCountry: siteConfig.address.country,
        },
      },
    ],
  }
}

export default function WebLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} bg-white text-gray-900 antialiased font-sans`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
        strategy="beforeInteractive"
      />

      <Navbar />

      <main id="main-content" className="min-h-screen">
        {children}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
