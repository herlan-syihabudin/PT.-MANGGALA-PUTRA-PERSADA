import { MessageCircle } from "lucide-react"

export default function WhatsAppFloat() {
  // Fallback untuk keamanan
  const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281229222463"
  
  const message = encodeURIComponent(
    "Halo PT Manggala Putra Persada, saya ingin konsultasi proyek konstruksi"
  )

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Konsultasi Proyek via WhatsApp"
      title="Konsultasi Gratis via WhatsApp"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="hidden sm:inline">Konsultasi Gratis</span>
    </a>
  )
}
