import { projects } from "@/lib/projects"
import ProjectCard from "@/components/ProjectCard"

export default function ProyekPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* PAGE HEADER */}
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Representative <span className="text-red-600">Projects</span>
          </h1>
          <p className="mt-5 text-lg text-gray-700">
            Engineering and construction projects delivered through a
            structured execution approach, focusing on quality, safety,
            and long-term performance.
          </p>
        </div>

        {/* PROJECT GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

      </div>
    </section>
  )
}
