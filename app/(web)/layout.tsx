
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default:
      "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    template: "%s | PT Manggala Putra Persada",
  },
  description:
    "PT Manggala Putra Persada (MPP Engineering) is an engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP systems, and design & build services for industrial and commercial projects.",
  keywords: [
    "engineering contractor indonesia",
    "construction contractor indonesia",
    "steel structure contractor indonesia",
    "mep contractor indonesia",
    "civil contractor indonesia",
    "design and build contractor indonesia",
    "industrial construction indonesia",
  ],
  authors: [{ name: "PT Manggala Putra Persada" }],
  metadataBase: new URL("https://pt-manggala-putra-persada.vercel.app"),
  openGraph: {
    title:
      "Engineering-Led Construction Contractor Indonesia | PT Manggala Putra Persada",
    description:
      "Engineering-led construction services covering steel structure, civil, MEP, and design & build for industrial and commercial projects in Indonesia.",
    url: "https://pt-manggala-putra-persada.vercel.app",
    siteName: "PT Manggala Putra Persada",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada Engineering & Construction",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">

        {/* ===== SCHEMA SEO (ORGANIZATION) ===== */}
        <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://pt-manggala-putra-persada.vercel.app/#organization",
          name: "PT Manggala Putra Persada",
          alternateName: "MPP Engineering",
          url: "https://pt-manggala-putra-persada.vercel.app",
          logo: "https://pt-manggala-putra-persada.vercel.app/logo-mp.png",
          description:
            "PT Manggala Putra Persada (MPP Engineering) is an engineering-led construction contractor in Indonesia specializing in steel structure, civil works, MEP systems, and design & build services for industrial and commercial projects.",
          sameAs: [],
        },
        {
          "@type": "LocalBusiness",
          "@id": "https://pt-manggala-putra-persada.vercel.app/#localbusiness",
          name: "PT Manggala Putra Persada",
          image: "https://pt-manggala-putra-persada.vercel.app/logo-mp.png",
          url: "https://pt-manggala-putra-persada.vercel.app",
          telephone: "+62-812-9739-6612",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Bekasi",
            addressRegion: "West Java",
            addressCountry: "ID",
          },
          areaServed: {
            "@type": "Country",
            name: "Indonesia",
          },
          priceRange: "$$",
          openingHours: "Mo-Fr 08:00-17:00",
        },
        {
          "@type": "WebSite",
          "@id": "https://pt-manggala-putra-persada.vercel.app/#website",
          url: "https://pt-manggala-putra-persada.vercel.app",
          name: "PT Manggala Putra Persada",
          publisher: {
            "@id": "https://pt-manggala-putra-persada.vercel.app/#organization",
          },
          inLanguage: "en-ID",
        },
      ],
    }),
  }}
/>

        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
