import Link from "next/link"

export default function KonstruksiSipilPage() {
  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 max-w-3xl">
            Civil & Structural Construction
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl">
            Engineering-led civil and structural construction services for
            industrial, commercial, and residential projects, delivered with
            strict quality control, safety compliance, and on-time execution.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
        
        {/* MAIN */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Scope of Work
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our civil and structural construction services cover the execution
              of concrete and structural works in accordance with approved
              drawings, specifications, and engineering standards. We focus on
              structural integrity, constructability, and long-term performance
              of the building.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Key Services
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Site preparation and earthworks</li>
              <li>Foundation systems (shallow & deep foundation)</li>
              <li>Reinforced concrete structures</li>
              <li>Structural framing and slabs</li>
              <li>Structural repair and strengthening</li>
              <li>Compliance with SNI and project specifications</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Engineering & Quality Control
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All works are executed under engineering supervision, supported by
              method statements, inspection and test plans (ITP), and systematic
              quality control procedures to ensure accuracy, safety, and
              durability throughout the project lifecycle.
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">
          <div className="border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Project Types
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial Facilities</li>
              <li>Commercial Buildings</li>
              <li>Residential Developments</li>
              <li>Warehouses & Factories</li>
              <li>Infrastructure Support Structures</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              Why Choose Us
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Engineering-led execution</li>
              <li>Structured project management</li>
              <li>Strict quality & safety control</li>
              <li>Cost and schedule discipline</li>
              <li>Clear reporting and accountability</li>
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
    </section>
  )
}
