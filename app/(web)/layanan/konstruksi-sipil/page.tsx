import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Mountain, Layers, Hammer, Building2, Warehouse, Home } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { civilServiceSchema } from "@/lib/schema/konstruksi-sipil"

export const metadata: Metadata = {
  title: "Civil & Structural Construction Engineering | MPP Engineering",
  description: "Engineering-led civil and structural construction services in Indonesia. Reinforced concrete, foundations, and structural systems for industrial & commercial projects with strict quality control.",
  keywords: "kontraktor sipil, konstruksi struktur, jasa pondasi, beton bertulang, konstruksi pabrik, civil contractor indonesia, earthworks, foundation contractor",
  openGraph: {
    title: "Civil & Structural Construction Engineering | MPP Engineering",
    description: "Professional civil and structural construction services for industrial and commercial projects.",
    images: ["/images/og-civil.jpg"],
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
              Engineering-led civil and structural construction services for
              industrial, commercial, and residential projects in Indonesia,
              delivered with strict quality control, safety compliance, and
              disciplined project execution.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
            <Image
              src="/projects/civil-hero.jpg"
              alt="Civil and structural construction contractor for industrial and commercial buildings in Indonesia"
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
              Civil & Structural Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Our civil and structural construction services cover the execution
              of reinforced concrete and structural works in accordance with
              approved drawings, specifications, and engineering standards.
              We focus on structural integrity, constructability, and long-term
              performance of each building and facility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Key Civil & Structural Services
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "Site preparation, earthworks, and excavation",
                "Foundation systems (shallow & deep foundations)",
                "Reinforced concrete structures",
                "Structural framing, slabs, and retaining walls",
                "Structural repair, strengthening, and retrofit works",
                "Compliance with SNI and project technical specifications",
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
              All civil and structural works are executed under engineering
              supervision and supported by method statements, inspection and
              test plans (ITP), and systematic quality control procedures.
              This ensures dimensional accuracy, structural safety, and
              durability throughout the project lifecycle.
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
                <span>Industrial facilities & factories</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Commercial buildings</span>
              </li>
              <li className="flex items-start gap-2">
                <Home size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Residential developments</span>
              </li>
              <li className="flex items-start gap-2">
                <Warehouse size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Warehouses & logistics centers</span>
              </li>
              <li className="flex items-start gap-2">
                <Mountain size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Infrastructure support structures</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-soft">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Why Choose Our Civil Construction
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Engineering-led execution",
                "Structured project management",
                "Strict quality & HSE control",
                "Cost and schedule discipline",
                "Clear reporting & accountability",
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

    </section>
  )
}
