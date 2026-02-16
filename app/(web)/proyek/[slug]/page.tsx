import { notFound } from "next/navigation"
import { projects } from "@/lib/projects"
import Image from "next/image"
import type { Metadata } from "next"

type Props = {
  params: { slug: string }
}

/* =========================
   SEO METADATA PER PROJECT
========================= */
export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) {
    return {
      title: "Project Not Found | PT Manggala Putra Persada",
    }
  }

  return {
    title: `${project.title} | PT Manggala Putra Persada`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      images: [project.images[0]], // ⬅️ OG pakai foto utama
    },
  }
}

/* =========================
   PROJECT DETAIL PAGE
========================= */
export default function ProjectDetailPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) return notFound()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* HERO IMAGE */}
        <div className="mb-12 overflow-hidden rounded-2xl">
          <Image
            src={project.images[0]}
            alt={project.title}
            width={1200}
            height={600}
            className="w-full h-[420px] object-cover"
            priority
          />
        </div>

        {/* META */}
        <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
          {project.category}
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
          {project.title}
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-10">
          {project.description}
        </p>

        {/* DETAILS */}
        <div className="grid md:grid-cols-2 gap-10 border-t pt-10 mb-16">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Scope of Work
            </h3>
            <p className="text-gray-700">
              {project.scope}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Execution Approach
            </h3>
            <p className="text-gray-700">
              The project was executed through structured planning,
              engineering coordination, and controlled site execution
              to ensure quality, safety, and schedule compliance.
            </p>
          </div>
        </div>

        {/* PROJECT GALLERY */}
        {project.images.length > 1 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Project Gallery
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {project.images.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={`${project.title} ${i + 1}`}
                  width={600}
                  height={400}
                  className="rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* BACK LINK */}
        <div>
          <a
            href="/proyek"
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            ← Back to Projects
          </a>
        </div>

      </div>
    </section>
  )
}
