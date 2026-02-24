import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Building2, Store, Factory, Monitor, Home } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { fitOutServiceSchema } from "@/lib/schema/fit-out"

export const metadata: Metadata = {
  title: "Interior & Fit-Out Construction Services | MPP Engineering",
  description: "Engineering-oriented interior and fit-out construction services in Indonesia for offices, commercial spaces, and industrial facilities. Quality finishing, MEP coordination, and durable materials.",
  keywords: "kontraktor interior jakarta, jasa fit out kantor, interior komersial, fit out industrial, partisi gypsum, plafon akustik, lantai vinyl, kontraktor interior indonesia",
  openGraph: {
    title: "Interior & Fit-Out Construction Services | MPP Engineering",
    description: "Professional interior and fit-out construction services for offices, commercial, and industrial spaces.",
    images: ["/images/og-fitout.jpg"],
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
              Engineering-oriented interior and fit-out construction services
              for offices, commercial spaces, and industrial facilities in
              Indonesia, delivered with functional planning, durable materials,
              and high-quality finishing.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
            <Image
              src="/projects/fitout-hero.jpg"
              alt="Interior and fit out contractor for office, commercial, and industrial facilities in Indonesia"
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
              Interior & Fit-Out Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Our interior and fit-out services cover the execution of internal
              building works based on approved layouts, technical drawings, and
              functional requirements. Each space is constructed to support
              operational efficiency, user comfort, and long-term durability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Key Fit-Out Construction Services
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "Partition systems (gypsum, glass, panel)",
                "Ceiling systems (gypsum, metal, acoustic)",
                "Flooring works (vinyl, tile, epoxy, raised floor)",
                "Wall finishes, coating, and painting works",
                "Custom joinery and built-in furniture",
                "Interior lighting and architectural elements",
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
              All fit-out works are closely coordinated with MEP and structural
              systems to ensure seamless integration of lighting, HVAC,
              electrical outlets, fire protection, and technical equipment
              without compromising design intent or building functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Quality Control & Finishing Standards
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Finishing quality is controlled through material approval,
              mock-ups, and systematic inspections. This process ensures clean
              detailing, consistency, and compliance with approved samples,
              specifications, and project standards.
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
                "Engineering-oriented and functional approach",
                "Clean detailing and high finishing quality",
                "Integrated coordination with MEP systems",
                "Controlled schedule and site execution",
                "Clear documentation and project handover",
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

    </section>
  )
}
