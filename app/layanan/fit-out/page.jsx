import Link from "next/link"
import Image from "next/image"

export default function FitOutPage() {
  return (
    <section className="bg-white">
      {/* ===== SCHEMA SEO: INTERIOR & FIT-OUT SERVICE ===== */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://pt-manggala-putra-persada.vercel.app/layanan/fit-out#service",
      name: "Interior & Fit-Out Construction Services",
      description:
        "Engineering-oriented interior and fit-out construction services in Indonesia for offices, commercial spaces, and industrial facilities, focusing on functionality, durability, and high-quality finishing.",
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
        "Interior Fit-Out Contractor",
        "Office Interior Construction",
        "Commercial Interior Fit-Out",
        "Industrial Fit-Out Services",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Interior & Fit-Out Scope of Work",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Partition, Ceiling & Flooring Works",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Wall Finishing, Coating & Painting",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Joinery & Built-In Furniture",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Interior Lighting & Architectural Elements",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "MEP & Structural Coordination for Fit-Out",
            },
          },
        ],
      },
      url: "https://pt-manggala-putra-persada.vercel.app/layanan/fit-out",
    }),
  }}
/>

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Interior & Fit-Out Construction Services
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Engineering-oriented interior and fit-out construction services
              for offices, commercial spaces, and industrial facilities in
              Indonesia, delivered with functional planning, durable materials,
              and high-quality finishing.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/fitout-hero.jpg"
              alt="Interior and fit out contractor for office, commercial, and industrial facilities in Indonesia"
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
              Interior & Fit-Out Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our interior and fit-out services cover the execution of internal
              building works based on approved layouts, technical drawings, and
              functional requirements. Each space is constructed to support
              operational efficiency, user comfort, and long-term durability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Key Fit-Out Construction Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Partition systems (gypsum, glass, panel)</li>
              <li>Ceiling systems (gypsum, metal, acoustic)</li>
              <li>Flooring works (vinyl, tile, epoxy, raised floor)</li>
              <li>Wall finishes, coating, and painting works</li>
              <li>Custom joinery and built-in furniture</li>
              <li>Interior lighting and architectural elements</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Coordination with MEP & Structural Systems
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All fit-out works are closely coordinated with MEP and structural
              systems to ensure seamless integration of lighting, HVAC,
              electrical outlets, fire protection, and technical equipment
              without compromising design intent or building functionality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Quality Control & Finishing Standards
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Finishing quality is controlled through material approval,
              mock-ups, and systematic inspections. This process ensures clean
              detailing, consistency, and compliance with approved samples,
              specifications, and project standards.
            </p>
          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Typical Fit-Out Applications
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Office and corporate spaces</li>
              <li>Commercial and retail areas</li>
              <li>Industrial support buildings</li>
              <li>Control rooms and technical offices</li>
              <li>Residential and apartment units</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              Why Choose Our Fit-Out Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Engineering-oriented and functional approach</li>
              <li>Clean detailing and high finishing quality</li>
              <li>Integrated coordination with MEP systems</li>
              <li>Controlled schedule and site execution</li>
              <li>Clear documentation and project handover</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek Interior & Fit-Out
          </Link>

        </aside>
      </div>
    </section>
  )
}
