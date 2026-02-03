export function WhyChooseUs() {
  return (
    <section className="relative py-28 bg-gray-50 overflow-hidden">
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <span className="inline-block mb-4 text-sm font-semibold text-gold">
            Why Choose Us
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Structured, Engineering-Led Project Execution
          </h2>

          {/* GOLD DIVIDER */}
          <div className="mt-5 h-[3px] w-16 bg-gold rounded-full" />

          <p className="mt-6 text-lg text-gray-700 leading-relaxed">
            PT Manggala Putra Persada delivers construction projects through
            disciplined engineering coordination, structured planning, and
            accountable project governance to ensure predictable outcomes in
            cost, quality, and schedule.
          </p>
        </div>

        {/* TRUST CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-3">
              Engineering-Led Execution
            </h3>
            <p className="text-gray-700">
              All works are executed based on approved drawings, coordinated
              engineering reviews, and continuous technical supervision to
              minimize execution risk and rework.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition border-t-4 border-gold">
            <h3 className="font-bold text-gray-900 mb-3">
              Cost & Schedule Discipline
            </h3>
            <p className="text-gray-700">
              Structured planning, progress monitoring, and transparent
              reporting are applied to maintain control over project budget,
              cash flow, and delivery milestones.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-lg transition">
            <h3 className="font-bold text-gray-900 mb-3">
              Quality & HSE Control
            </h3>
            <p className="text-gray-700">
              Quality assurance systems and health & safety procedures are
              implemented consistently throughout the project lifecycle to
              protect people, assets, and long-term performance.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
