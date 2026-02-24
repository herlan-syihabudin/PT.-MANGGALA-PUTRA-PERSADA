import { MessageCircle } from "lucide-react"

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20konsultasi%20proyek%20konstruksi"
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Konsultasi Proyek via WhatsApp"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">Konsultasi Gratis</span>
    </a>
  )
}
