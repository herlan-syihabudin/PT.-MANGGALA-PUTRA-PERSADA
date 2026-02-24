import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Factory, Building2, Warehouse, Home, Zap, Droplets, Wind } from "lucide-react"
import type { Metadata } from "next"

import ServiceFAQ from "@/components/ServiceFAQ"
import { faqByService } from "@/lib/faq-layanan"
import { mepServiceSchema } from "@/lib/schema/mep"

export const metadata: Metadata = {
  title: "MEP Engineering Services | Mechanical Electrical Plumbing | MPP Engineering",
  description: "Professional Mechanical, Electrical, and Plumbing (MEP) engineering and installation services in Indonesia for industrial & commercial projects. HVAC, electrical distribution, plumbing, fire protection, and commissioning.",
  keywords: "kontraktor MEP, mechanical electrical plumbing, instalasi listrik industri, HVAC contractor, fire protection system, plumbing system, MEP engineering indonesia",
  openGraph: {
    title: "MEP Engineering Services | Mechanical Electrical Plumbing",
    description: "Professional MEP engineering and installation services for industrial and commercial projects.",
    images: ["/images/og-mep.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/layanan/mep",
  },
}

export default function MEPPage() {
  return (
    <section className="bg-white">

      {/* ===== SCHEMA SEO: MEP ENGINEERING SERVICE ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mepServiceSchema),
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
              Mechanical, Electrical & Plumbing
              <span className="block text-gold">(MEP) Engineering</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Professional MEP engineering and installation services for
              industrial, commercial, and building projects in Indonesia,
              delivered with coordinated design, safe execution, and
              full compliance with technical standards.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
            <Image
              src="/projects/mep-hero.jpg"
              alt="Mechanical Electrical Plumbing MEP contractor for industrial and commercial buildings in Indonesia"
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
              MEP Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              Our Mechanical, Electrical, and Plumbing services include
              engineering coordination, installation, testing, and
              commissioning of building systems to ensure safety,
              functionality, energy efficiency, and long-term reliability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" />
              Mechanical Systems (HVAC & Piping)
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "HVAC systems (Split, VRV / VRF, Chilled Water)",
                "Ventilation and exhaust systems",
                "Industrial air handling units (AHU)",
                "Mechanical equipment installation & piping",
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
              Electrical Systems
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "Medium & low voltage electrical installation",
                "Main distribution panel & sub-distribution panels",
                "Lighting systems & power outlets",
                "Grounding & lightning protection",
                "Backup power systems (genset & UPS)",
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
              Plumbing & Fire Protection Systems
            </h2>
            <ul className="space-y-2 text-gray-700 pl-4">
              {[
                "Clean water & wastewater systems",
                "Storm water drainage systems",
                "Fire hydrant & sprinkler systems",
                "Fire pump and water storage systems",
                "Testing & commissioning of fire systems",
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
              Engineering Coordination & Commissioning
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">
              All MEP works are closely coordinated with architectural and
              structural elements to avoid clashes and ensure smooth
              installation. Systems are tested and commissioned before
              handover to verify performance and compliance with project
              requirements.
            </p>
          </section>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border border-gray-200 rounded-2xl p-6 shadow-soft hover:shadow-md transition">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Typical Applications
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Factory size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Industrial plants & factories</span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Commercial buildings & offices</span>
              </li>
              <li className="flex items-start gap-2">
                <Warehouse size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Warehouses & logistics centers</span>
              </li>
              <li className="flex items-start gap-2">
                <Home size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Residential & mixed-use buildings</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Utility & support facilities</span>
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-soft">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Why Choose Our MEP Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Integrated engineering coordination",
                "Experienced MEP engineering team",
                "Strict quality & safety standards",
                "Testing & commissioning included",
                "Full compliance with SNI & regulations",
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
            <span>Konsultasi Proyek MEP</span>
            <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

        </aside>
      </div>

      {/* ===== FAQ SECTION ===== */}
      <ServiceFAQ
        title="Frequently Asked Questions – MEP Engineering"
        items={faqByService["mep"]}
      />

    </section>
  )
}
