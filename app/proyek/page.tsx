import Link from "next/link"
import ProjectCard from "@/components/ProjectCard"
import { projects } from "@/lib/projects"

export default function ProyekPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-gray-900">
          Representative <span className="text-red-600">Projects</span>
        </h1>

        {/* INTRO */}
        <p className="text-lg text-gray-700 mb-14 max-w-3xl leading-relaxed">
          PT Manggala Putra Persada delivers engineering and construction
          projects through a structured execution approach, focusing on
          quality standards, safety compliance, and reliable project delivery
          across industrial, residential, and commercial sectors.
        </p>

        {/* PROJECT GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/kontak"
            className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Discuss Your Project Scope
          </Link>
        </div>

      </div>
    </section>
  )
}
