import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "PT Manggala Putra Persada | Engineering & Structured Construction",
  description:
    "PT Manggala Putra Persada adalah perusahaan engineering dan konstruksi dengan pendekatan terstruktur untuk proyek industri dan perumahan, berfokus pada mutu, keselamatan kerja, dan ketepatan pelaksanaan.",
  keywords: [
    "engineering construction",
    "konstruksi industri",
    "kontraktor pabrik",
    "konstruksi baja",
    "MEP",
    "kontraktor Bekasi",
  ],
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
