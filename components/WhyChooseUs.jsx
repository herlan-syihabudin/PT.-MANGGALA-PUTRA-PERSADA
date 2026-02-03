export function WhyChooseUs() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="max-w-3xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Why Choose Us
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            A Structured Engineering-Led Execution
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            We execute projects through disciplined engineering coordination,
            structured planning, and accountable project management to ensure
            predictable outcomes in cost, quality, and schedule.
          </p>
        </div>

        {/* TRUST CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Engineering-Led Execution
            </h3>
            <p className="text-gray-600">
              All works are executed based on approved drawings, engineering
              coordination, and technical supervision to minimize execution
              risk.
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Cost & Schedule Discipline
            </h3>
            <p className="text-gray-600">
              Structured planning, monitoring, and reporting are applied to
              maintain control over project budget and delivery timeline.
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-3">
              Quality & HSE Control
            </h3>
            <p className="text-gray-600">
              Quality assurance and health & safety procedures are implemented
              consistently throughout the project lifecycle.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
