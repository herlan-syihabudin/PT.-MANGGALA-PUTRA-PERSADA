import Link from "next/link"

export default function ProyekPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-gray-900">
          Representative <span className="text-red-600">Projects</span>
        </h1>

        {/* INTRO */}
        <p className="text-lg text-gray-700 mb-14 max-w-3xl leading-relaxed">
          PT Manggala Putra Persada delivers engineering and construction
          projects through a structured execution approach, focusing on
          quality standards, safety compliance, and reliable project delivery
          across industrial, residential, and commercial sectors.
        </p>

        {/* PROJECT CATEGORIES */}
        <div className="grid md:grid-cols-3 gap-10 text-gray-700">
          
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Industrial Projects
            </h2>
            <p>
              Construction works for industrial facilities such as factories,
              warehouses, and supporting infrastructure, executed with
              structural strength considerations and operational efficiency
              in mind.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Residential Developments
            </h2>
            <p>
              Residential construction and housing developments delivered
              through disciplined planning, consistent quality control,
              and schedule management to ensure timely project completion.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Engineering, MEP & Interior Works
            </h2>
            <p>
              Engineering, mechanical, electrical, plumbing, and interior
              works for commercial and residential buildings to support
              building functionality, comfort, and safety.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20">
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project Scope
          </Link>
        </div>

      </div>
    </section>
  )
}
