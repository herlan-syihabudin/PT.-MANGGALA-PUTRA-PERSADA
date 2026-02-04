import Link from "next/link"
import Image from "next/image"

export default function DesignBuildPage() {
  return (
    <section className="bg-white">

      {/* ======================
          HERO SECTION
      ====================== */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT: TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Design &amp; Build Services
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl">
              Integrated design and construction services delivered under a
              single responsibility system, ensuring coordinated engineering,
              controlled execution, and efficient project delivery from concept
              to handover.
            </p>
          </div>

          {/* RIGHT: IMAGE */}
          <div className="relative h-[240px] md:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
            <Image
              src="/projects/designbuild-hero.jpg"
              alt="Design & Build Services"
              fill
              priority
              className="object-cover"
            />
          </div>

        </div>
      </div>

      {/* ======================
          CONTENT SECTION
      ====================== */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">

        {/* MAIN CONTENT */}
        <div className="md:col-span-2 space-y-10">

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Design &amp; Build Approach
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our design &amp; build approach integrates engineering design,
              construction planning, and site execution under one coordinated
              team. This method minimizes interface risk, shortens project
              duration, and ensures consistency between design intent and
              construction output.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Scope of Services
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Concept design &amp; preliminary studies</li>
              <li>Engineering design &amp; technical drawings</li>
              <li>Cost estimation &amp; value engineering</li>
              <li>Construction planning &amp; scheduling</li>
              <li>Integrated civil, structural, MEP, and fit-out execution</li>
              <li>Testing, commissioning &amp; project handover</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Engineering Coordination
            </h3>
            <p className="text-gray-700 leading-relaxed">
              All design disciplines are coordinated from the early stage to
              avoid clashes and constructability issues. Engineering decisions
              are continuously reviewed to optimize performance, cost, and
              buildability while maintaining compliance with applicable
              standards and regulations.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cost, Schedule &amp; Risk Control
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Through early contractor involvement and integrated planning,
              project risks are identified and mitigated upfront. This enables
              better cost certainty, realistic scheduling, and efficient
              resource allocation throughout the project lifecycle.
            </p>
          </div>

        </div>

        {/* ======================
            SIDEBAR
        ====================== */}
        <aside className="space-y-8">

          <div className="border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Suitable Project Types
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Industrial &amp; Manufacturing Facilities</li>
              <li>Warehouses &amp; Distribution Centers</li>
              <li>Commercial &amp; Office Buildings</li>
              <li>Fit-Out &amp; Refurbishment Projects</li>
              <li>Specialized Technical Buildings</li>
            </ul>
          </div>

          <div className="border rounded-xl p-6 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              Why Design &amp; Build with Us
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>Single point of responsibility</li>
              <li>Integrated engineering &amp; execution team</li>
              <li>Reduced coordination &amp; interface risk</li>
              <li>Optimized cost and project duration</li>
              <li>Clear communication &amp; accountability</li>
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
