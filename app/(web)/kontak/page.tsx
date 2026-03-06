import type { Metadata } from "next"
import KontakForm from "@/components/KontakForm"
import { Building2, Mail, Clock, Shield, Phone } from "lucide-react"  // ✅ SATU BARIS

const PHONE = process.env.NEXT_PUBLIC_PHONE || "02138716203"
const EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@mppindo.com"
const LOCATION = process.env.NEXT_PUBLIC_COMPANY_LOCATION || "Bekasi, Jawa Barat – Indonesia"
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "6281229222463"

export const metadata: Metadata = {
  title: "Kontak Kami | Konsultasi Proyek Konstruksi | MPP Engineering",
  description: "Hubungi PT Manggala Putra Persada untuk konsultasi proyek konstruksi industri, komersial, dan residential. Tim engineering kami siap membantu mewujudkan proyek Anda.",
  keywords: "kontak kontraktor bekasi, konsultasi proyek konstruksi, kontraktor indonesia, konsultasi engineering, tender proyek",
  openGraph: {
  title: "Konsultasi Proyek Konstruksi | MPP Engineering",
  description: "Diskusikan proyek konstruksi Anda dengan tim engineering kami.",
  url: "https://mppindo.com/kontak",
  siteName: "PT Manggala Putra Persada",
  type: "website",
  images: [
    {
      url: "https://mppindo.com/images/og-kontak.jpg",
      width: 1200,
      height: 630,
      alt: "Kontak PT Manggala Putra Persada",
    },
  ],
},
  twitter: {
  card: "summary_large_image",
  title: "Kontak Kami | Konsultasi Proyek Konstruksi",
  description: "Hubungi PT Manggala Putra Persada untuk konsultasi proyek konstruksi.",
  images: ["https://mppindo.com/images/og-kontak.jpg"],
},
  alternates: {
    canonical: "https://mppindo.com/kontak",
  },
}

export default function KontakPage() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* LEFT – INFO */}
        <div>
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Project Inquiry
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Diskusikan 
            <span className="block text-red-600">Proyek Anda</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            PT Manggala Putra Persada menyediakan solusi konstruksi 
            engineering-led untuk proyek industri, komersial, dan residential. 
            Tim kami siap membantu mewujudkan proyek Anda dengan pendekatan 
            terstruktur dan hasil yang pasti.
          </p>

          <div className="mt-10 space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Kantor</p>
                <p className="text-gray-600">{LOCATION}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Telepon</p>
                <a
                  href={`tel:${PHONE}`}
                  className="text-gray-600 hover:text-red-600 transition"
                >
                  {PHONE}
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-gray-600 hover:text-red-600 transition"
                >
                  {EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
    <Phone size={18} className="text-gold" />
  </div>
  <div>
    <p className="font-semibold text-gray-900">WhatsApp</p>
    <a
  href={`https://wa.me/${WA}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-gray-600 hover:text-red-600 transition"
>
  +62 812 2922 2463
</a>
  </div>
</div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Jam Operasional</p>
                <p className="text-gray-600">Senin–Jumat | 08.00 – 17.00 WIB</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <Shield size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Data Anda akan dijaga kerahasiaannya dan hanya digunakan untuk 
                keperluan komunikasi proyek. Tidak akan dibagikan ke pihak ketiga.
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT – FORM */}
        <KontakForm />

        <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "Organization",
"name": "PT Manggala Putra Persada",
"url": "https://mppindo.com",
"logo": "https://mppindo.com/logo-mp.png",
"contactPoint": {
  "@type": "ContactPoint",
  "telephone": PHONE,
  "contactType": "customer service",
  "areaServed": "ID",
  "availableLanguage": ["Indonesian", "English"]
},
"address": {
  "@type": "PostalAddress",
  "addressLocality": "Bekasi",
  "addressRegion": "Jawa Barat",
  "addressCountry": "Indonesia"
}
})
}}
/>
      </div>
    </section>
  )
}
