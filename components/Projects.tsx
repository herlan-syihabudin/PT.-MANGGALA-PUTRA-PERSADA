import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"
import { projects } from "@/lib/projects"

export default function Projects() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Selected Projects
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Representative Projects & Engineering Experience
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Selected engineering and construction projects delivered with a
            structured execution approach.
          </p>
        </div>

        {/* GRID (AMBIL 3 AJA) */}
        <div className="grid md:grid-cols-3 gap-10">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
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
