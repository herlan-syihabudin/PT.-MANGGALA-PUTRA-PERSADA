import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PT Manggala Putra Persada | Engineering & Structured Construction",
  description:
    "PT Manggala Putra Persada adalah perusahaan engineering dan konstruksi dengan pendekatan terstruktur untuk proyek industri dan perumahan, berfokus pada mutu, keselamatan kerja, dan ketepatan pelaksanaan.",
  openGraph: {
    title: "PT Manggala Putra Persada",
    description:
      "Engineering & Structured Construction untuk proyek industri dan perumahan.",
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
  twitter: {
    card: "summary_large_image",
    title: "PT Manggala Putra Persada",
    description:
      "Engineering & Structured Construction untuk proyek industri dan perumahan.",
    images: ["/og-image.png"],
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
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
