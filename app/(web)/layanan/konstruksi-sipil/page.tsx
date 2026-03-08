import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Mountain, Layers, Hammer, Building2, Warehouse, Home } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { civilServiceSchema } from "@/lib/schema/konstruksi-sipil"

export const metadata: Metadata = {
  title: "Civil & Structural Construction Engineering | MPP Engineering",
  description: "Jasa konstruksi sipil dan struktur untuk proyek industri, gudang, pabrik, dan bangunan komersial di Indonesia. Pekerjaan meliputi pekerjaan tanah, pondasi, beton bertulang, dan struktur bangunan sesuai standar konstruksi.",
  keywords: "kontraktor sipil, konstruksi struktur, jasa pondasi, beton bertulang, konstruksi pabrik, civil contractor indonesia, earthworks, foundation contractor",
  openGraph: {
  title: "Civil & Structural Construction Engineering | PT Manggala Putra Persada",
  description:
    "Professional civil and structural construction services for industrial and commercial projects.",
  url: "https://mppindo.com/layanan/konstruksi-sipil",
  siteName: "PT Manggala Putra Persada",
  type: "website",
  images: [
    {
      url: "https://mppindo.com/images/og-civil.jpg",
      width: 1200,
      height: 630,
      alt: "Civil & Structural Construction Engineering",
    },
  ],
},
  twitter: {
  card: "summary_large_image",
  title: "Civil & Structural Construction Engineering | PT Manggala Putra Persada",
  description:
    "Professional civil and structural construction services for industrial and commercial projects.",
  images: ["https://mppindo.com/images/og-civil.jpg"],
},
  alternates: {
    canonical: "https://mppindo.com/layanan/konstruksi-sipil",
  },
}

export default function KonstruksiSipilPage() {
  return (
    <section className="bg-white">

      {/* ===== SCHEMA SEO: CIVIL & STRUCTURAL CONSTRUCTION SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(civilServiceSchema),
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
              Civil & Structural 
              <span className="block text-gold">Construction Engineering</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Layanan konstruksi sipil dan struktur untuk proyek industri,
komersial, dan bangunan lainnya di Indonesia. 

Pekerjaan meliputi pekerjaan tanah, pondasi, struktur beton
bertulang, hingga pekerjaan struktur bangunan yang dilaksanakan
sesuai gambar kerja, spesifikasi teknis, serta standar konstruksi
yang berlaku.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-80 rounded-xl overflow-hidden mt-6">
<Image
src="/images/insights/civil-structure-construction.jpg"
alt="Pekerjaan struktur beton bertulang pada proyek konstruksi"
fill
className="object-cover"
/>
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
              Civil & Structural Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Pekerjaan konstruksi sipil dan struktur mencakup pelaksanaan
pondasi, struktur beton bertulang, serta elemen struktur bangunan
lainnya berdasarkan gambar kerja, spesifikasi teknis, dan standar
engineering yang berlaku.

Setiap pekerjaan dilaksanakan dengan memperhatikan kualitas
struktur, metode pelaksanaan di lapangan, serta ketahanan
bangunan untuk penggunaan jangka panjang.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Key Civil & Structural Services
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
"Pekerjaan persiapan lahan dan pekerjaan tanah",
"Pekerjaan pondasi (pondasi dangkal dan pondasi dalam)",
"Pekerjaan struktur beton bertulang",
"Pekerjaan kolom, balok, slab, dan retaining wall",
"Pekerjaan perkuatan dan perbaikan struktur",
"Pekerjaan konstruksi sesuai standar SNI dan spesifikasi proyek"
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
              Engineering Supervision & Quality Control
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Seluruh pekerjaan sipil dan struktur dilaksanakan dengan
pengawasan teknis serta prosedur quality control yang jelas.

Dokumen seperti metode kerja, inspection & test plan (ITP),
serta pemeriksaan kualitas pekerjaan dilakukan secara
berkala untuk memastikan hasil pekerjaan sesuai dengan
gambar kerja dan spesifikasi proyek.
            </p>
          </section>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Typical Project Types
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Fasilitas industri dan pabrik</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Bangunan komersial</span>
              </li>
              <li className="flex items-start gap-2">
                <Home size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Perumahan dan hunian</span>
              </li>
              <li className="flex items-start gap-2">
                <Warehouse size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Gudang dan pusat logistik</span>
              </li>
              <li className="flex items-start gap-2">
                <Mountain size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Struktur pendukung infrastruktur</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-soft">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Why Choose Our Civil Construction
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
"Pelaksanaan pekerjaan berbasis engineering",
"Perencanaan metode kerja yang jelas",
"Pengendalian kualitas dan keselamatan kerja",
"Pengendalian biaya dan jadwal pekerjaan",
"Pelaporan progres pekerjaan secara terstruktur"
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
            <span>Konsultasi Proyek Sipil</span>
            <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

        </aside>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <ServiceFAQ
        title="FAQ Konstruksi Sipil & Struktur"
        items={faqByService["konstruksi-sipil"]}
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
"name": "Konstruksi Sipil",
"item": "https://mppindo.com/layanan/konstruksi-sipil"
}
]
})
}}
/>

    </section>
  )
}
