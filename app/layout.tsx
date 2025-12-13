import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import WhatsAppFloat from "@/components/WhatsAppFloat"

export const metadata = {
  title: "PT Manggala Putra Persada | General Contractor",
  description: "Kontraktor sipil, baja, MEP, dan interior untuk pabrik & perumahan",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-gray-900">
        <Navbar />
        {children}
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  )
}
