import { notFound } from "next/navigation"
import { projects } from "@/lib/projects"

type Props = {
  params: { slug: string }
}

export default function ProjectDetailPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) return notFound()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* IMAGE */}
        <div className="mb-12 overflow-hidden rounded-2xl">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* CONTENT */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
          {project.category}
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
          {project.title}
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
          {project.description}
        </p>

      </div>
    </section>
  )
}
