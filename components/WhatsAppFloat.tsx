import Image from "next/image"

export default function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-700 transition"
      aria-label="WhatsApp Project Inquiry"
    >
      <Image
        src="/icons/whatsapp.svg"
        alt="WhatsApp"
        width={22}
        height={22}
      />
      <span className="hidden sm:inline font-semibold">
        Project Inquiry
      </span>
    </a>
  )
}
