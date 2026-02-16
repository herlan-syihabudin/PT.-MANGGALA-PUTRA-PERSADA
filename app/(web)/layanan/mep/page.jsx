import Link from "next/link"
import Image from "next/image"

export default function MEPPage() {
  return (
    <section className="bg-white">
      {/* ===== SCHEMA SEO: MEP ENGINEERING SERVICE ===== */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": "https://pt-manggala-putra-persada.vercel.app/layanan/mep#service",
      name: "Mechanical, Electrical & Plumbing (MEP) Engineering Services",
      description:
        "Professional Mechanical, Electrical, and Plumbing (MEP) engineering and installation services in Indonesia for industrial, commercial, and building projects, delivered with coordinated design, safe execution, and full compliance with technical standards.",
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
        "MEP Engineering Contractor",
        "Mechanical Electrical Plumbing Contractor",
        "HVAC Engineering Services",
        "Fire Protection System Contractor",
        "Building Services Engineering",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "MEP Engineering Services Scope",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "HVAC Systems (Split, VRV/VRF, Chilled Water)",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Electrical Power Distribution & Lighting Systems",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Plumbing & Sanitary Systems",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Fire Protection Systems (Hydrant & Sprinkler)",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Testing, Commissioning & System Handover",
            },
          },
        ],
      },
      url: "https://pt-manggala-putra-persada.vercel.app/layanan/mep",
    }),
  }}
/>

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Mechanical, Electrical & Plumbing (MEP) Engineering
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Professional MEP engineering and installation services for
              industrial, commercial, and building projects in Indonesia,
              delivered with coordinated design, safe execution, and
              full compliance with technical standards.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/mep-hero.jpg"
              alt="Mechanical Electrical Plumbing MEP contractor for industrial and commercial buildings in Indonesia"
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
              MEP Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our Mechanical, Electrical, and Plumbing services include
              engineering coordination, installation, testing, and
              commissioning of building systems to ensure safety,
              functionality, energy efficiency, and long-term reliability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Mechanical Systems (HVAC & Piping)
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>HVAC systems (Split, VRV / VRF, Chilled Water)</li>
              <li>Ventilation and exhaust systems</li>
              <li>Industrial air handling units (AHU)</li>
              <li>Mechanical equipment installation & piping</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Electrical Systems
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Medium & low voltage electrical installation</li>
              <li>Main distribution panel & sub-distribution panels</li>
              <li>Lighting systems & power outlets</li>
              <li>Grounding & lightning protection</li>
              <li>Backup power systems (genset & UPS)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Plumbing & Fire Protection Systems
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Clean water & wastewater systems</li>
              <li>Storm water drainage systems</li>
              <li>Fire hydrant & sprinkler systems</li>
              <li>Fire pump and water storage systems</li>
              <li>Testing & commissioning of fire systems</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Engineering Coordination & Commissioning
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All MEP works are closely coordinated with architectural and
              structural elements to avoid clashes and ensure smooth
              installation. Systems are tested and commissioned before
              handover to verify performance and compliance with project
              requirements.
            </p>
          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Typical Applications
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial plants & factories</li>
              <li>Commercial buildings & offices</li>
              <li>Warehouses & logistics centers</li>
              <li>Residential & mixed-use buildings</li>
              <li>Utility & support facilities</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek MEP
          </Link>

        </aside>
      </div>

      {/* ======================
    FAQ SECTION (MEP)
====================== */}
<section className="bg-gray-50 border-t py-24">
  {/* ===== SCHEMA SEO: FAQPage (MEP SERVICE) ===== */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Apa saja ruang lingkup pekerjaan MEP yang ditangani?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Ruang lingkup pekerjaan MEP meliputi sistem HVAC, instalasi listrik tegangan rendah dan menengah, plumbing dan sanitasi, fire protection system, serta testing dan commissioning sistem bangunan.",
            },
          },
          {
            "@type": "Question",
            name: "Apakah PT Manggala Putra Persada menangani proyek MEP industri?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Ya. Kami berpengalaman menangani proyek MEP untuk fasilitas industri seperti pabrik, gudang, dan bangunan utilitas dengan pendekatan engineering-led dan standar keselamatan kerja.",
            },
          },
          {
            "@type": "Question",
            name: "Apakah pekerjaan MEP dikoordinasikan dengan struktur dan arsitektur?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Seluruh pekerjaan MEP dikoordinasikan dengan tim struktur dan arsitektur untuk menghindari clash, memastikan kelayakan instalasi, dan menjaga fungsi bangunan secara menyeluruh.",
            },
          },
          {
            "@type": "Question",
            name: "Apakah tersedia proses testing dan commissioning sistem MEP?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Ya. Setiap sistem MEP melalui proses testing dan commissioning sebelum serah terima untuk memastikan performa, keamanan, dan kesesuaian dengan spesifikasi teknis.",
            },
          },
          {
            "@type": "Question",
            name: "Apakah PT Manggala Putra Persada mengikuti standar dan regulasi MEP?",
            acceptedAnswer: {
              "@type": "Answer",
              text:
                "Pekerjaan MEP dilaksanakan sesuai standar teknis yang berlaku, termasuk SNI, regulasi keselamatan kerja (K3), serta standar industri terkait sistem mekanikal dan elektrikal.",
            },
          },
        ],
      }),
    }}
  />

  <div className="max-w-5xl mx-auto px-6">
    <h2 className="text-3xl font-extrabold text-gray-900 mb-10">
      Frequently Asked Questions – MEP Engineering
    </h2>

    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Apa saja ruang lingkup pekerjaan MEP yang ditangani?
        </h3>
        <p className="text-gray-700">
          Ruang lingkup pekerjaan MEP meliputi sistem HVAC, instalasi listrik
          tegangan rendah dan menengah, plumbing dan sanitasi, fire protection
          system, serta testing dan commissioning sistem bangunan.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Apakah PT Manggala Putra Persada menangani proyek MEP industri?
        </h3>
        <p className="text-gray-700">
          Ya. Kami berpengalaman menangani proyek MEP untuk fasilitas industri
          seperti pabrik, gudang, dan bangunan utilitas dengan pendekatan
          engineering-led dan standar keselamatan kerja.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Apakah pekerjaan MEP dikoordinasikan dengan struktur dan arsitektur?
        </h3>
        <p className="text-gray-700">
          Seluruh pekerjaan MEP dikoordinasikan dengan tim struktur dan
          arsitektur untuk menghindari clash, memastikan kelayakan instalasi,
          dan menjaga fungsi bangunan secara menyeluruh.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Apakah tersedia proses testing dan commissioning sistem MEP?
        </h3>
        <p className="text-gray-700">
          Ya. Setiap sistem MEP melalui proses testing dan commissioning sebelum
          serah terima untuk memastikan performa, keamanan, dan kesesuaian
          dengan spesifikasi teknis.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          Apakah PT Manggala Putra Persada mengikuti standar dan regulasi MEP?
        </h3>
        <p className="text-gray-700">
          Pekerjaan MEP dilaksanakan sesuai standar teknis yang berlaku,
          termasuk SNI, regulasi keselamatan kerja (K3), serta standar industri
          terkait sistem mekanikal dan elektrikal.
        </p>
      </div>
    </div>
  </div>
</section>
    </section>
  )
}
