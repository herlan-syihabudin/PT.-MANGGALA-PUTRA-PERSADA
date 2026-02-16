import Link from "next/link"
import Image from "next/image"
import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"

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
              "https://pt-manggala-putra-persada.vercel.app/layanan/struktur-baja#service",
            name: "Steel Structure Engineering & Construction Services",
            description:
              "Engineering-led steel structure fabrication and erection services in Indonesia for industrial, warehouse, and commercial projects.",
            provider: {
              "@type": "Organization",
              name: "PT Manggala Putra Persada",
              url: "https://pt-manggala-putra-persada.vercel.app",
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
              "https://pt-manggala-putra-persada.vercel.app/layanan/struktur-baja",
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
              Engineering-led steel structure services for industrial,
              commercial, and warehouse projects, covering fabrication,
              erection, and quality-controlled execution in Indonesia.
            </p>
          </div>

          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/steel-hero.jpg"
              alt="Steel structure contractor for industrial building construction in Indonesia"
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
        <div className="md:col-span-2 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Structure Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our steel structure services include engineering detailing,
              fabrication, surface treatment, and on-site erection in
              accordance with approved drawings, SNI standards, and
              international engineering practices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Fabrication & Erection Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Structural steel shop drawings</li>
              <li>Fabrication of H-Beam, WF, Plate</li>
              <li>Blasting & coating systems</li>
              <li>Steel erection & alignment</li>
              <li>Bolting & welding works</li>
              <li>As-built documentation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Safety & Quality Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All steel works are executed under strict HSE implementation,
              lifting plans, work-at-height procedures, and inspection
              processes to ensure safety, durability, and structural
              reliability.
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

      {/* ===== FAQ SCHEMA (RICH RESULT) ===== */}
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
            })),
          }),
        }}
      />
    </section>
  )
}
