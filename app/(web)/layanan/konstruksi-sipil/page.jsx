import Link from "next/link"
import Image from "next/image"
import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"

export default function KonstruksiSipilPage() {
  return (
    <section className="bg-white">
      {/* ===== SCHEMA SEO: CIVIL & STRUCTURAL CONSTRUCTION SERVICE ===== */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://pt-manggala-putra-persada.vercel.app/layanan/konstruksi-sipil#service",
      name: "Civil & Structural Construction Engineering Services",
      description:
        "Engineering-led civil and structural construction services in Indonesia covering reinforced concrete works, foundations, and structural systems for industrial, commercial, and residential projects with strict quality and safety control.",
      provider: {
        "@type": "Organization",
        name: "PT Manggala Putra Persada",
        alternateName: "MPP Engineering",
        url: "https://pt-manggala-putra-persada.vercel.app",
      },
      areaServed: {
        "@type": "Country",
        name: "Indonesia",
      },
      serviceType: [
        "Civil Construction Contractor",
        "Structural Construction Contractor",
        "Reinforced Concrete Works",
        "Foundation Construction Services",
        "Industrial Civil Construction",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Civil & Structural Construction Scope",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Site Preparation, Earthworks & Excavation",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Shallow & Deep Foundation Systems",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Reinforced Concrete Structures",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Structural Framing, Slabs & Retaining Walls",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Structural Repair, Strengthening & Retrofit",
            },
          },
        ],
      },
      url: "https://pt-manggala-putra-persada.vercel.app/layanan/konstruksi-sipil",
    }),
  }}
/>

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Civil & Structural Construction Engineering
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Engineering-led civil and structural construction services for
              industrial, commercial, and residential projects in Indonesia,
              delivered with strict quality control, safety compliance, and
              disciplined project execution.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/civil-hero.jpg"
              alt="Civil and structural construction contractor for industrial and commercial buildings in Indonesia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN */}
        <div className="md:col-span-2 space-y-10">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Civil & Structural Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our civil and structural construction services cover the execution
              of reinforced concrete and structural works in accordance with
              approved drawings, specifications, and engineering standards.
              We focus on structural integrity, constructability, and long-term
              performance of each building and facility.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Key Civil & Structural Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Site preparation, earthworks, and excavation</li>
              <li>Foundation systems (shallow & deep foundations)</li>
              <li>Reinforced concrete structures</li>
              <li>Structural framing, slabs, and retaining walls</li>
              <li>Structural repair, strengthening, and retrofit works</li>
              <li>Compliance with SNI and project technical specifications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Engineering Supervision & Quality Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All civil and structural works are executed under engineering
              supervision and supported by method statements, inspection and
              test plans (ITP), and systematic quality control procedures.
              This ensures dimensional accuracy, structural safety, and
              durability throughout the project lifecycle.
            </p>
          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Typical Project Types
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial facilities & factories</li>
              <li>Commercial buildings</li>
              <li>Residential developments</li>
              <li>Warehouses & logistics centers</li>
              <li>Infrastructure support structures</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              Why Choose Our Civil Construction
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Engineering-led execution</li>
              <li>Structured project management</li>
              <li>Strict quality & HSE control</li>
              <li>Cost and schedule discipline</li>
              <li>Clear reporting & accountability</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek Sipil
          </Link>

        </aside>
      </div>

          {/* ===== FAQ CIVIL & STRUCTURAL (SEO + UX) ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqByService["konstruksi-sipil"].map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <ServiceFAQ
        title="FAQ Konstruksi Sipil & Struktur"
        items={faqByService["konstruksi-sipil"]}
      />
    </section>
  )
}
