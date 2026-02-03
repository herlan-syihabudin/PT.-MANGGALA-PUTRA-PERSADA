import Link from "next/link"

export default function LayananPage() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* SECTION TITLE */}
        <div className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering & <span className="text-red-600">Construction Services</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Integrated engineering-led construction services for industrial,
            commercial, and residential projects, delivered through structured
            planning, execution, and quality control.
          </p>
        </div>

        {/* SERVICE OVERVIEW CARDS */}
        <div className="grid gap-6 md:grid-cols-3 mb-20">
          {[
            {
              title: "Civil & Structural",
              desc: "Concrete works, foundations, and structural construction.",
              link: "/layanan/konstruksi-sipil",
            },
            {
              title: "Steel Structure",
              desc: "Fabrication and erection of industrial steel structures.",
              link: "/layanan/struktur-baja",
            },
            {
              title: "MEP Systems",
              desc: "Mechanical, Electrical, Plumbing, HVAC & Fire Protection.",
              link: "/layanan/mep",
            },
            {
              title: "Interior & Fit-Out",
              desc: "Functional interior construction and finishing works.",
              link: "/layanan/fit-out",
            },
            {
              title: "Design & Build",
              desc: "Integrated engineering, construction, and execution.",
              link: "/layanan/design-build",
            },
            {
              title: "Renovation & Maintenance",
              desc: "Building renovation and asset maintenance services.",
              link: "/layanan/renovation",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.link}
              className="group border rounded-xl p-6 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {item.desc}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-red-600">
                View Details →
              </span>
            </Link>
          ))}
        </div>

        {/* DETAILED SERVICES */}
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Civil & Structural Construction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Execution of civil and structural works with a focus on structural
              strength, stability, and compliance with approved drawings,
              specifications, and engineering standards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Steel Structure Engineering
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Fabrication and erection of steel structures for factories,
              warehouses, and industrial facilities with precise engineering
              calculations and measurable quality control.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              MEP Systems (Mechanical, Electrical & Plumbing)
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Engineering and installation of integrated MEP systems, including
              electrical, plumbing, HVAC, and fire protection, in compliance
              with safety regulations and technical standards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Interior & Fit-Out Works
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Interior and fit-out services for offices, residential units, and
              production facilities with attention to space function, material
              quality, and clean finishing results.
            </p>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Renovation & Maintenance
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              Renovation and maintenance services for buildings and supporting
              systems to maintain performance, safety, and asset lifespan
              through structured maintenance planning.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24">
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project Requirements
          </Link>
        </div>

      </div>
    </section>
  )
}
