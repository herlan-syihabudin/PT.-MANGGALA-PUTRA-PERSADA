import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"

export const metadata = {
  title: "PT Manggala Putra Persada | General Contractor & MEP",
  description:
    "PT Manggala Putra Persada adalah perusahaan general contractor & MEP untuk proyek pabrik dan perumahan.",
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
