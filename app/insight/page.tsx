import Link from "next/link"

export default function InsightPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering <span className="text-red-600">Insights</span>
          </h1>
          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Practical insights and technical perspectives from PT Manggala Putra
            Persada, covering engineering, construction execution, project
            management, and industry best practices.
          </p>
        </div>

        {/* INSIGHT CATEGORIES */}
        <div className="grid md:grid-cols-3 gap-10 mb-24">
          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Construction Execution
            </h3>
            <p className="text-gray-600">
              Articles discussing structured construction execution, site
              coordination, quality control, and safety implementation.
            </p>
          </div>

          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Engineering & Design
            </h3>
            <p className="text-gray-600">
              Insights related to structural engineering, MEP coordination,
              constructability review, and engineering-led decision making.
            </p>
          </div>

          <div className="border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Project Management
            </h3>
            <p className="text-gray-600">
              Topics covering planning, scheduling, cost control, risk
              management, and professional project governance.
            </p>
          </div>
        </div>

        {/* FEATURED INSIGHTS */}
        <div className="mb-24">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-10">
            Featured <span className="text-red-600">Insights</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* CARD */}
            <div className="border rounded-2xl p-8 flex flex-col">
              <span className="text-sm font-semibold text-red-600 mb-2">
                Construction Execution
              </span>
              <h3 className="font-bold text-gray-900 mb-3">
                Why Structured Execution Matters in Industrial Projects
              </h3>
              <p className="text-gray-600 mb-6">
                Understanding how structured planning and engineering
                coordination reduce execution risks in industrial construction
                projects.
              </p>
              <Link
                href="#"
                className="mt-auto text-sm font-semibold text-red-600 hover:underline"
              >
                Read Insight →
              </Link>
            </div>

            <div className="border rounded-2xl p-8 flex flex-col">
              <span className="text-sm font-semibold text-red-600 mb-2">
                Engineering & Design
              </span>
              <h3 className="font-bold text-gray-900 mb-3">
                The Role of Engineering Coordination in Design & Build
              </h3>
              <p className="text-gray-600 mb-6">
                How early engineering coordination improves constructability,
                cost efficiency, and schedule certainty.
              </p>
              <Link
                href="#"
                className="mt-auto text-sm font-semibold text-red-600 hover:underline"
              >
                Read Insight →
              </Link>
            </div>

            <div className="border rounded-2xl p-8 flex flex-col">
              <span className="text-sm font-semibold text-red-600 mb-2">
                Project Management
              </span>
              <h3 className="font-bold text-gray-900 mb-3">
                Managing Cost & Schedule Risks in Construction Projects
              </h3>
              <p className="text-gray-600 mb-6">
                Key approaches to maintaining cost and schedule discipline
                through professional project management systems.
              </p>
              <Link
                href="#"
                className="mt-auto text-sm font-semibold text-red-600 hover:underline"
              >
                Read Insight →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t pt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for Engineering Perspective on Your Project?
          </h3>
          <p className="text-gray-700 mb-8">
            Discuss your project requirements with our engineering and
            construction team.
          </p>

          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project
          </Link>
        </div>

      </div>
    </section>
  )
}
