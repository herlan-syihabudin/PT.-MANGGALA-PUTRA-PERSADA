import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PT Manggala Putra Persada | Engineering & Structured Construction",
  description:
    "PT Manggala Putra Persada adalah perusahaan engineering dan konstruksi dengan pendekatan terstruktur untuk proyek industri dan perumahan.",
  openGraph: {
    title: "PT Manggala Putra Persada",
    description: "Engineering & Structured Construction",
    url: "https://pt-manggala-putra-persada.vercel.app",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-900 antialiased">
        {/* SCHEMA SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              url: "https://pt-manggala-putra-persada.vercel.app",
              logo: "https://pt-manggala-putra-persada.vercel.app/logo-mp.png",
              description:
                "Perusahaan engineering dan konstruksi dengan pendekatan terstruktur untuk proyek industri dan perumahan.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bekasi",
                addressRegion: "Jawa Barat",
                addressCountry: "ID",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+62-812-9739-6612",
                contactType: "customer service",
              },
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
