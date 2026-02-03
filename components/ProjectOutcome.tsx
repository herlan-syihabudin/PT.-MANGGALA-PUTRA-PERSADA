export function ProjectOutcome() {
  return (
    <section className="relative py-28 bg-white overflow-hidden">
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <span className="inline-block mb-4 text-sm font-semibold text-gold">
            Project Outcomes
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Measurable Results Delivered Through Structured Execution
          </h2>

          {/* GOLD DIVIDER */}
          <div className="mt-5 h-[3px] w-16 bg-gold rounded-full" />

          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            Our project outcomes reflect the value delivered to clients beyond
            physical construction work. Each project is executed to minimize
            risk, maintain cost and schedule certainty, and ensure operational
            readiness.
          </p>
        </div>

        {/* OUTCOME CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-3">
              Schedule Certainty
            </h3>
            <p className="text-gray-700">
              Projects are delivered in line with approved schedules, enabling
              clients to plan equipment installation, commissioning, and
              operations without delay.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition border-t-4 border-gold">
            <h3 className="font-bold text-gray-900 mb-3">
              Reduced Execution Risk
            </h3>
            <p className="text-gray-700">
              Engineering coordination and structured execution minimize
              rework, design conflicts, and on-site adjustments during
              construction.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-3">
              Operational Readiness
            </h3>
            <p className="text-gray-700">
              Completed structures and systems are handed over in a condition
              ready for operation, testing, and long-term use.
            </p>
          </div>

        </div>

        {/* FOOTNOTE */}
        <div className="mt-14 max-w-3xl text-sm text-gray-500">
          Project outcomes may vary depending on project scope, site conditions,
          and client requirements. Outcomes presented reflect structured
          execution approaches applied by PT Manggala Putra Persada.
        </div>

      </div>
    </section>
  )
}
