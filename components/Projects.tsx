import Link from "next/link"

export default function Projects() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Selected Projects
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Representative Projects & Engineering Experience
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            The following projects represent our engineering-driven approach
            and structured execution across industrial, residential, and
            commercial developments.
          </p>
        </div>

        {/* PROJECT GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* PROJECT 1 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Industrial Facility
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Manufacturing Plant Construction
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Scope of work includes civil construction and steel structure
                works for an industrial production facility, executed with
                engineering calculations, quality control, and strict safety
                compliance.
              </p>
            </div>
          </div>

          {/* PROJECT 2 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Residential Development
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Housing Area Development
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Residential construction works delivered through structured
                planning, consistent quality control, and schedule management
                to ensure timely and reliable project completion.
              </p>
            </div>
          </div>

          {/* PROJECT 3 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Engineering & MEP Systems
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Commercial Building MEP Integration
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Integrated mechanical, electrical, and plumbing system
                installation to support building operations with efficiency,
                reliability, and long-term performance.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/proyek"
            className="inline-flex items-center justify-center border border-gray-300 px-8 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  )
}
