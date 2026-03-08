import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Building2, Store, Factory, Monitor, Home } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { fitOutServiceSchema } from "@/lib/schema/fit-out"

export const metadata: Metadata = {
  title: "Interior & Fit-Out Construction Services | PT Manggala Putra Persada",
  description: "Interior dan fit-out contractor untuk kantor, area komersial, dan fasilitas industri di Indonesia. Pekerjaan meliputi partisi, plafon, lantai, finishing interior, serta koordinasi dengan sistem MEP.",
  keywords: "kontraktor interior jakarta, jasa fit out kantor, interior komersial, fit out industrial, partisi gypsum, plafon akustik, lantai vinyl, kontraktor interior indonesia",
  openGraph: {
  title: "Interior & Fit-Out Construction Services | PT Manggala Putra Persada",
  description:
    "Professional interior and fit-out construction services for offices, commercial, and industrial spaces.",
  url: "https://mppindo.com/layanan/fit-out",
  siteName: "PT Manggala Putra Persada",
  type: "website",
  images: [
    {
      url: "https://mppindo.com/images/og-fitout.jpg",
      width: 1200,
      height: 630,
      alt: "Interior & Fit-Out Construction Services",
    },
  ],
},
  twitter: {
  card: "summary_large_image",
  title: "Interior & Fit-Out Construction Services | PT Manggala Putra Persada",
  description:
    "Professional interior and fit-out construction services for offices, commercial, and industrial spaces.",
  images: ["https://mppindo.com/images/og-fitout.jpg"],
},
  alternates: {
    canonical: "https://mppindo.com/layanan/fit-out",
  },
}

export default function FitOutPage() {
  return (
    <section className="bg-white">

      {/* ===== SCHEMA SEO: INTERIOR & FIT-OUT SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(fitOutServiceSchema),
        }}
      />

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <span className="text-gold font-semibold text-sm tracking-wider uppercase mb-2 block">
              Layanan
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Interior & Fit-Out 
              <span className="block text-gold">Construction Services</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
Layanan konstruksi interior dan fit-out untuk kantor,
area komersial, serta fasilitas industri di Indonesia.
Pekerjaan dilakukan berdasarkan gambar kerja dan kebutuhan
fungsi ruang, dengan penggunaan material yang tepat,
koordinasi teknis yang baik, serta hasil finishing
yang rapi dan berkualitas.
</p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
            <Image
              src="/images/insights/interior-fitout-office-indonesia.jpg"
              alt="Pekerjaan interior dan fit out kantor modern di Indonesia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN */}
        <div className="md:col-span-2 space-y-12">

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Interior & Fit-Out Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Pekerjaan interior dan fit-out meliputi pelaksanaan pekerjaan
ruang dalam bangunan berdasarkan layout, gambar teknis,
dan spesifikasi yang telah disetujui. Setiap ruang
dibangun dengan mempertimbangkan fungsi operasional,
kenyamanan pengguna, serta ketahanan material
untuk penggunaan jangka panjang.
</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Key Fit-Out Construction Services
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
"Partisi ruangan (gypsum, kaca, panel)",
"Sistem plafon (gypsum, metal, acoustic ceiling)",
"Pekerjaan lantai (vinyl, tile, epoxy, raised floor)",
"Finishing dinding, coating, dan pengecatan",
"Pembuatan furniture built-in dan joinery",
"Pemasangan lighting interior dan elemen arsitektural",
].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Coordination with MEP & Structural Systems
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Seluruh pekerjaan fit-out dikoordinasikan dengan sistem
MEP dan struktur bangunan untuk memastikan instalasi
pencahayaan, HVAC, instalasi listrik, sistem proteksi
kebakaran, serta peralatan teknis lainnya dapat
terintegrasi dengan baik tanpa mengganggu fungsi
bangunan maupun desain ruang.
</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Quality Control & Finishing Standards
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Kualitas finishing dikontrol melalui proses persetujuan
material, pembuatan mock-up, serta inspeksi pekerjaan
secara berkala di lapangan. Proses ini memastikan
hasil pekerjaan rapi, konsisten, dan sesuai dengan
spesifikasi material serta standar proyek yang telah
ditetapkan.
</p>
          </section>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Typical Fit-Out Applications
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Office and corporate spaces</span>
              </li>
              <li className="flex items-start gap-2">
                <Store size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Commercial and retail areas</span>
              </li>
              <li className="flex items-start gap-2">
                <Factory size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Industrial support buildings</span>
              </li>
              <li className="flex items-start gap-2">
                <Monitor size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Control rooms and technical offices</span>
              </li>
              <li className="flex items-start gap-2">
                <Home size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Residential and apartment units</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-soft">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Why Choose Our Fit-Out Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
"Pendekatan pekerjaan berbasis engineering dan fungsi ruang",
"Detail finishing rapi dan standar kualitas terkontrol",
"Koordinasi pekerjaan dengan sistem MEP",
"Pengendalian jadwal dan pelaksanaan di lapangan",
"Dokumentasi proyek dan proses serah terima yang jelas",
].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl font-semibold 
              hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 
              hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group"
          >
            <span>Konsultasi Proyek Interior & Fit-Out</span>
            <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

        </aside>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <ServiceFAQ
        title="Frequently Asked Questions – Interior & Fit-Out"
        items={faqByService["fit-out"]}
      />

      <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "BreadcrumbList",
"itemListElement": [
{
"@type": "ListItem",
"position": 1,
"name": "Home",
"item": "https://mppindo.com"
},
{
"@type": "ListItem",
"position": 2,
"name": "Layanan",
"item": "https://mppindo.com/layanan"
},
{
"@type": "ListItem",
"position": 3,
"name": "Interior & Fit-Out",
"item": "https://mppindo.com/layanan/fit-out"
}
]
})
}}
/>
      
    </section>
  )
}
