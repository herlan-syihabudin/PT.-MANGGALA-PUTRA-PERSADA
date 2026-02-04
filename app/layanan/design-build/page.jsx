import Link from "next/link"
import Image from "next/image"

export default function DesignBuildPage() {
  return (
    <section className="bg-white">

      {/* HERO */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Design &amp; Build Construction Services
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Integrated design and build construction services in Indonesia,
              delivering engineering, construction planning, and execution
              under a single responsibility system to ensure efficiency,
              quality, and cost certainty from concept to handover.
            </p>
          </div>

          {/* IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/designbuild-hero.jpg"
              alt="Design and build construction contractor for industrial and commercial projects in Indonesia"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN */}
        <div className="md:col-span-2 space-y-10">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Design &amp; Build Project Approach
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our design &amp; build approach integrates engineering design,
              construction planning, and site execution within one coordinated
              team. This method minimizes interface risks, shortens project
              duration, and ensures consistency between design intent and
              construction output.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Scope of Design &amp; Build Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Concept design and preliminary studies</li>
              <li>Engineering design and technical drawings</li>
              <li>Cost estimation and value engineering</li>
              <li>Construction planning and scheduling</li>
              <li>Integrated civil, structural, MEP, and fit-out execution</li>
              <li>Testing, commissioning, and project handover</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Engineering Coordination &amp; Constructability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All engineering disciplines are coordinated from early stages
              to avoid clashes and constructability issues. Design decisions
              are continuously reviewed to optimize performance, cost, and
              buildability while maintaining compliance with applicable
              standards and regulations.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Cost, Schedule &amp; Risk Control
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Through early contractor involvement and integrated planning,
              project risks are identified and mitigated upfront. This enables
              better cost certainty, realistic scheduling, and efficient
              resource allocation throughout the project lifecycle.
            </p>
          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Suitable Design &amp; Build Projects
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial and manufacturing facilities</li>
              <li>Warehouses and distribution centers</li>
              <li>Commercial and office buildings</li>
              <li>Fit-out and refurbishment projects</li>
              <li>Specialized technical buildings</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">
              Why Choose Our Design &amp; Build Services
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Single point of responsibility</li>
              <li>Integrated engineering and execution team</li>
              <li>Reduced coordination and interface risk</li>
              <li>Optimized cost and project duration</li>
              <li>Clear communication and accountability</li>
            </ul>
          </div>

          <Link
            href="/kontak"
            className="block text-center bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Konsultasi Proyek Design &amp; Build
          </Link>

        </aside>
      </div>
    </section>
  )
}
