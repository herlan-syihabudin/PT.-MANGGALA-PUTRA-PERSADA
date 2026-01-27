export default function AboutSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        
        {/* LEFT */}
        <div>
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            About Us
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering-Driven Construction with a Structured Approach
          </h1>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            PT Manggala Putra Persada is an engineering and construction company
            in Indonesia delivering projects through disciplined planning,
            measurable execution, and consistent quality control.
          </p>

          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            We believe that reliable construction outcomes are achieved through
            strong engineering fundamentals, clear systems of work, and
            technical discipline to support long-term performance and
            sustainability.
          </p>
        </div>

        {/* RIGHT */}
        <div className="grid gap-6">
          <div className="border border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-2">Vision</h3>
            <p className="text-gray-600">
              To become a trusted engineering and construction partner by
              delivering structured, precise, and accountable project
              execution.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-2">Mission</h3>
            <ul className="text-gray-600 space-y-2 list-disc list-inside">
              <li>Deliver engineering-based construction solutions</li>
              <li>Maintain strict quality, safety, and schedule control</li>
              <li>Build long-term trust through professional work systems</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
