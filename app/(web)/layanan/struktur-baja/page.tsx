import Link from "next/link"
import Image from "next/image"
import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Steel Structure & Construction | PT Manggala Putra Persada",
  description:
"Jasa konstruksi struktur baja untuk proyek pabrik, gudang, dan bangunan komersial di Indonesia. Pekerjaan meliputi fabrikasi baja, erection struktur, pengelasan, dan pemasangan sesuai standar konstruksi.",
  keywords:
    "kontraktor struktur baja, steel structure contractor, fabrikasi baja, erection baja, konstruksi baja industri, gudang baja, pipe rack steel",
  openGraph: {
    title: "Steel Structure & Construction | PT Manggala Putra Persada",
    description:
      "Engineering-led steel structure fabrication and erection services for industrial and commercial projects.",
    url: "https://mppindo.com/layanan/struktur-baja",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [
      {
        url: "https://mppindo.com/images/og-struktur-baja.jpg",
        width: 1200,
        height: 630,
        alt: "Steel Structure Engineering & Construction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Structure Engineering & Construction | PT Manggala Putra Persada",
    description:
      "Engineering-led steel structure fabrication and erection services for industrial and commercial projects.",
    images: ["https://mppindo.com/images/og-struktur-baja.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/layanan/struktur-baja",
  },
}

export default function StrukturBajaPage() {
  const faqs = faqByService["struktur-baja"]

  return (
    <section className="bg-white">
      
      {/* ===== SCHEMA SEO: STEEL STRUCTURE SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id":
              "https://mppindo.com/layanan/struktur-baja#service",
            name: "Steel Structure Engineering & Construction Services",
            description:
              "Engineering-led steel structure fabrication and erection services in Indonesia for industrial, warehouse, and commercial projects.",
            provider: {
  "@type": "Organization",
  name: "PT Manggala Putra Persada",
  alternateName: "MPP Engineering",
  url: "https://mppindo.com",
  logo: "https://mppindo.com/logo-mp.png",
},
            areaServed: {
              "@type": "Country",
              name: "Indonesia",
            },
            serviceType: [
              "Steel Structure Contractor",
              "Structural Steel Fabrication",
              "Steel Erection Services",
              "Industrial Steel Construction",
            ],
            url:
              "https://mppindo.com/layanan/struktur-baja",
          }),
        }}
      />

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Steel Structure Engineering & Construction
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Layanan konstruksi struktur baja untuk proyek industri,
gudang, dan bangunan komersial di Indonesia.

Pekerjaan meliputi fabrikasi baja, erection struktur,
serta instalasi elemen baja sesuai gambar kerja,
spesifikasi teknis, dan standar konstruksi yang berlaku.
            </p>
          </div>

          <div className="relative h-80 rounded-xl overflow-hidden mt-6">
<Image
src="/images/insights/steel-structure-erection.jpg"
alt="Pemasangan struktur baja pada proyek konstruksi industri"
fill
className="object-cover"
/>
</div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Structure Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pekerjaan struktur baja meliputi proses detailing
engineering, fabrikasi material baja, perlakuan
permukaan (surface treatment), hingga pemasangan
struktur baja di lokasi proyek sesuai gambar kerja
dan spesifikasi teknis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Fabrication & Erection Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Pembuatan shop drawing struktur baja</li>
<li>Fabrikasi profil baja (WF, H-Beam, Plate)</li>
<li>Pemasangan dan alignment struktur baja</li>
<li>Pekerjaan baut struktur dan pengelasan</li>
<li>Dokumentasi as-built drawing</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Safety & Quality Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Seluruh pekerjaan struktur baja dilaksanakan dengan
memperhatikan prosedur keselamatan kerja, metode
pengangkatan (lifting plan), serta prosedur kerja
di ketinggian.

Pemeriksaan kualitas pekerjaan dilakukan secara
berkala untuk memastikan struktur terpasang dengan
baik, aman, dan sesuai spesifikasi proyek.
            </p>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Typical Applications
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial factories</li>
              <li>Warehouses & logistics centers</li>
              <li>Steel canopies & platforms</li>
              <li>Pipe racks & supporting structures</li>
              <li>Commercial buildings</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek Struktur Baja
          </Link>
        </aside>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <ServiceFAQ items={faqs} />

      <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "FAQPage",
mainEntity: faqs.map((item) => ({
  "@type": "Question",
  name: item.question,
  acceptedAnswer: {
    "@type": "Answer",
    text: item.answer,
  },
}))
})
}}
/>

      {/* ===== BREADCRUMB SCHEMA ===== */}
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://mppindo.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Layanan",
          item: "https://mppindo.com/layanan",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Struktur Baja",
          item: "https://mppindo.com/layanan/struktur-baja",
        },
      ],
    }),
  }}
/>
    </section>
  )
}
