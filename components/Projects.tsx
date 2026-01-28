import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"

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
          <ProjectCard
            image="/projects/civil.jpg"
            category="Industrial Facility"
            title="Manufacturing Plant Construction"
            description="Civil and structural works for industrial production facilities, executed with engineering calculations, quality control, and strict safety compliance."
          />

          <ProjectCard
            image="/projects/steel.jpg"
            category="Steel Structure"
            title="Steel Structure Engineering"
            description="Fabrication and erection of steel structures for factories and warehouses with high precision and controlled quality."
          />

          <ProjectCard
            image="/projects/mep.jpg"
            category="MEP Systems"
            title="Commercial Building MEP Integration"
            description="Integrated mechanical, electrical, and plumbing systems to ensure efficient, reliable, and long-term building performance."
          />
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
