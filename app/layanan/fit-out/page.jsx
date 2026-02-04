import Link from "next/link"
import Image from "next/image"

export default function FitOutPage() {
  return (
    <section className="bg-white">

      {/* ======================
          HERO SECTION
      ====================== */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Interior & Fit-Out Construction
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Professional interior and fit-out services for offices, commercial
              spaces, and industrial facilities, executed with a focus on
              functionality, durability, and high-quality finishing.
            </p>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/fitout-hero.jpg"
              alt="Interior & Fit-Out Construction"
              fill
              priority
              className="object-cover"
            />
          </div>

        </div>
      </div>

      {/* ======================
          CONTENT SECTION
      ====================== */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN CONTENT */}
        <div className="md:col-span-2 space-y-10">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our interior and fit-out services cover the execution of internal
              building works based on approved layouts, specifications, and
              functional requirements. We ensure that every space is built to
              support operational efficiency, comfort, and long-term use.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Key Fit-Out Works
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Partition systems (gypsum, glass, panel)</li>
              <li>Ceiling systems (gypsum, metal, acoustic)</li>
              <li>Flooring works (vinyl, tile, epoxy, raised floor)</li>
              <li>Wall finishes & painting works</li>
              <li>Custom joinery & built-in furniture</li>
              <li>Interior lighting & architectural elements</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Coordination with MEP & Structure
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All fit-out works are closely coordinated with MEP and structural
              systems to ensure seamless integration of lighting, HVAC,
              electrical outlets, and fire protection elements without
              compromising design intent or functionality.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Quality & Finishing Control
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Finishing quality is controlled through material approval,
              mock-ups, and systematic inspections to achieve clean detailing,
              consistency, and compliance with approved samples and project
              standards.
            </p>
          </div>

        </div>

        {/* ======================
            SIDEBAR
        ====================== */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Typical Applications
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Office & Corporate Spaces</li>
              <li>Commercial & Retail Areas</li>
              <li>Industrial Support Buildings</li>
              <li>Control Rooms & Technical Offices</li>
              <li>Residential & Apartment Units</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              Why Our Fit-Out Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Functional & engineering-oriented approach</li>
              <li>Clean detailing & finishing quality</li>
              <li>Coordination with MEP & building systems</li>
              <li>Controlled schedule & site execution</li>
              <li>Clear documentation & handover</li>
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
