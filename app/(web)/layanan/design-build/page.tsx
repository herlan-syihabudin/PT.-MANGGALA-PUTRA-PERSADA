import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Building2, Warehouse, Building, PaintBucket, Microscope } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { designBuildServiceSchema } from "@/lib/schema/design-build"

export const metadata: Metadata = {
  title: "Design & Build Contractor Indonesia | PT Manggala Putra Persada",
  description: "Integrated design and build construction services in Indonesia. Single responsibility system for industrial & commercial projects. Engineering, planning, and execution under one roof.",
  keywords: "design build kontraktor, jasa konstruksi design build, kontraktor industrial indonesia, epc contractor, engineering procurement construction",
  openGraph: {
  title: "Design & Build Contractor Indonesia | PT Manggala Putra Persada",
  description: "Integrated design and build construction services for industrial and commercial projects.",
  url: "https://mppindo.com/layanan/design-build",
  siteName: "PT Manggala Putra Persada",
  type: "website",
  images: [
    {
      url: "https://mppindo.com/images/og-design-build.jpg",
      width: 1200,
      height: 630,
      alt: "Design & Build Construction Services",
    },
  ],
},
  twitter: {
  card: "summary_large_image",
  title: "Design & Build Construction Services | PT Manggala Putra Persada",
  description: "Integrated design and build construction services in Indonesia.",
  images: ["https://mppindo.com/images/og-design-build.jpg"],
},
  alternates: {
  canonical: "https://mppindo.com/layanan/design-build",
},
}

export default function DesignBuildPage() {
  return (
    <section className="bg-white">

      {/* ===== SCHEMA SEO: DESIGN & BUILD SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(designBuildServiceSchema),
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
              Design & Build 
              <span className="block text-gold">Construction Services</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
Layanan konstruksi Design & Build yang mengintegrasikan
perencanaan engineering, perencanaan konstruksi, dan
pelaksanaan proyek dalam satu sistem tanggung jawab.

Pendekatan ini membantu menjaga koordinasi antar disiplin,
mengurangi potensi perubahan desain di lapangan, serta
memastikan pelaksanaan proyek berjalan lebih efisien
dari tahap perencanaan hingga serah terima pekerjaan.
</p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
            <Image
  src="/images/insights/design-build-construction-site.jpg"
  alt="Design build contractor industrial construction project Indonesia"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover hover:scale-105 transition-transform duration-700"
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
              Design & Build Project Approach
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Pendekatan Design & Build memungkinkan proses perencanaan
engineering dan pelaksanaan konstruksi dilakukan secara
terintegrasi dalam satu tim.

Dengan sistem ini, koordinasi antara perencana, engineer,
dan tim pelaksana dapat dilakukan sejak tahap awal proyek
sehingga meminimalkan risiko perubahan desain saat
pelaksanaan konstruksi.
</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Scope of Design & Build Services
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "Concept design and preliminary studies",
                "Engineering design and technical drawings",
                "Cost estimation and value engineering",
                "Construction planning and scheduling",
                "Integrated civil, structural, MEP, and fit-out execution",
                "Testing, commissioning, and project handover",
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
              Engineering Coordination & Constructability
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Koordinasi antar disiplin engineering dilakukan sejak tahap
awal perencanaan untuk memastikan desain dapat dilaksanakan
dengan baik di lapangan.

Setiap keputusan desain ditinjau dari aspek teknis,
metode pelaksanaan, serta efisiensi biaya agar proses
konstruksi dapat berjalan lebih efektif dan sesuai
dengan standar teknis yang berlaku.
</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Cost, Schedule & Risk Control
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
Dalam proyek konstruksi, pengendalian biaya, jadwal,
dan risiko menjadi bagian penting dari proses pelaksanaan.

Melalui perencanaan yang matang serta koordinasi sejak
tahap awal proyek, potensi risiko teknis dapat diidentifikasi
lebih awal sehingga jadwal pekerjaan dan penggunaan sumber
daya dapat dikelola secara lebih efektif.
</p>
          </section>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Suitable Design & Build Projects
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Industrial and manufacturing facilities</span>
              </li>
              <li className="flex items-start gap-2">
                <Warehouse size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Warehouses and distribution centers</span>
              </li>
              <li className="flex items-start gap-2">
                <Building size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Commercial and office buildings</span>
              </li>
              <li className="flex items-start gap-2">
                <PaintBucket size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Fit-out and refurbishment projects</span>
              </li>
              <li className="flex items-start gap-2">
                <Microscope size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Specialized technical buildings</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-soft">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Why Choose Our Design & Build Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Single point of responsibility",
                "Koordinasi engineering dan tim pelaksana terintegrasi",
                "Mengurangi risiko perubahan desain saat konstruksi",
                "Pengendalian biaya dan durasi proyek lebih optimal",
                "Koordinasi proyek lebih jelas dan terstruktur",
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
            <span>Diskusikan Proyek Anda</span>
            <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

        </aside>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <ServiceFAQ
        title="Frequently Asked Questions – Design & Build Construction"
        items={faqByService["design-build"]}
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
"name": "Design & Build",
"item": "https://mppindo.com/layanan/design-build"
}
]
})
}}
/>
      
    </section>
  )
}
