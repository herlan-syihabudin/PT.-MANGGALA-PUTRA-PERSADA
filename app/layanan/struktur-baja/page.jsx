import Link from "next/link"

export default function StrukturBajaPage() {
  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 max-w-3xl">
            Steel Structure Engineering & Construction
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl">
            Engineering-led steel structure solutions for industrial,
            commercial, and warehouse projects, delivered with precise
            fabrication, controlled erection, and strict quality assurance.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN CONTENT */}
        <div className="md:col-span-2 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our steel structure services cover the complete process from
              engineering detailing, material fabrication, surface treatment,
              to on-site erection. All works are executed in accordance with
              approved drawings, specifications, and applicable engineering
              standards to ensure structural safety and durability.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Key Services
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Structural steel design coordination & shop drawings</li>
              <li>Fabrication of steel members (H-Beam, WF, I-Beam, Plate)</li>
              <li>Surface treatment (blasting & painting / coating system)</li>
              <li>Steel erection and alignment on site</li>
              <li>Bolt tightening and welding works</li>
              <li>Dimensional control and as-built documentation</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Engineering & Quality Assurance
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Steel works are carried out under engineering supervision,
              supported by method statements, inspection and test plans (ITP),
              material traceability, and erection procedures. This ensures
              dimensional accuracy, load performance, and compliance with
              structural design requirements.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Safety & Execution Control
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All fabrication and erection activities are performed with strict
              HSE implementation, including lifting plans, work-at-height
              procedures, and site coordination to minimize risk and ensure
              safe project execution.
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">
          <div className="border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Typical Applications
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Factories & Industrial Buildings</li>
              <li>Warehouses & Distribution Centers</li>
              <li>Steel Canopies & Platforms</li>
              <li>Pipe Racks & Supporting Structures</li>
              <li>Commercial & Utility Buildings</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              Why Our Steel Structure
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Engineering-led detailing & execution</li>
              <li>Controlled fabrication & erection process</li>
              <li>Strict quality & dimensional control</li>
              <li>Clear documentation & reporting</li>
              <li>Focus on safety, schedule, and cost efficiency</li>
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
    </section>
  )
}
