export default function LayananPage() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION TITLE */}
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Our <span className="text-red-600">Services</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Integrated engineering and construction services to support
            industrial, commercial, and residential projects through
            structured planning and execution.
          </p>
        </div>

        {/* SERVICES LIST */}
        <div className="grid gap-12 md:grid-cols-2">
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Civil & Structural Construction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Execution of civil and structural works with a focus on
              structural strength, stability, and compliance with approved
              drawings, specifications, and engineering standards.
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
              Engineering and installation of integrated MEP systems,
              including electrical, plumbing, HVAC, and fire protection,
              in compliance with safety regulations and technical standards.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Interior & Fit-Out Works
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Interior and fit-out services for offices, residential units,
              and production facilities with attention to space function,
              material quality, and clean finishing results.
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
        <div className="mt-20">
          <a
            href="/contact"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project Requirements
          </a>
        </div>

      </div>
    </section>
  )
}
