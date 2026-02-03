import Link from "next/link"

export default function MEPPage() {
  return (
    <section className="bg-white">
      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 max-w-3xl">
            Mechanical, Electrical & Plumbing (MEP) Systems
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl">
            Integrated MEP engineering and installation services for industrial,
            commercial, and building projects, delivered with coordinated
            design, reliable execution, and full compliance with safety and
            technical standards.
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
              Our MEP services cover the engineering coordination, installation,
              testing, and commissioning of building systems. All systems are
              designed and executed to ensure functionality, safety, energy
              efficiency, and long-term operational reliability.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Mechanical Systems
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>HVAC systems (split, VRV/VRF, chilled water)</li>
              <li>Ventilation & exhaust systems</li>
              <li>Industrial air handling systems</li>
              <li>Equipment installation & mechanical piping</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Electrical Systems
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Medium & low voltage electrical installation</li>
              <li>Main distribution panel & sub-panel systems</li>
              <li>Lighting systems & power outlets</li>
              <li>Grounding & lightning protection systems</li>
              <li>Backup power systems (genset & UPS)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Plumbing & Fire Protection
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Clean water & wastewater systems</li>
              <li>Storm water drainage systems</li>
              <li>Fire hydrant & sprinkler systems</li>
              <li>Fire pump & water storage systems</li>
              <li>Testing & commissioning of fire systems</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Engineering Coordination & Commissioning
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All MEP works are coordinated with architectural and structural
              elements to avoid clashes and ensure constructability. Systems
              are tested and commissioned prior to handover to verify
              performance and compliance with project requirements.
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
              <li>Industrial Facilities & Factories</li>
              <li>Commercial Buildings & Offices</li>
              <li>Warehouses & Distribution Centers</li>
              <li>Residential & Mixed-Use Buildings</li>
              <li>Utility & Support Buildings</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              Why Our MEP Services
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Integrated engineering coordination</li>
              <li>Compliance with safety & technical standards</li>
              <li>Structured testing & commissioning</li>
              <li>Energy-efficient system approach</li>
              <li>Clear documentation & handover</li>
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
    </section>
  )
}
