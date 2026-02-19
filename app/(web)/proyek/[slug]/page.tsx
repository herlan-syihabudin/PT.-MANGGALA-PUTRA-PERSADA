import { notFound } from "next/navigation"
import { projects, type Project } from "@/lib/projects"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  Calendar,
  MapPin,
  HardHat,
  Clock,
  Award,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react"

type Props = {
  params: {
    slug: string
  }
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
      robots: { index: false },
    }
  }

  return {
    title: `${project.title} | Construction Project | PT Manggala Putra Persada`,
    description: project.description,
    keywords: [
      project.category.toLowerCase(),
      project.location || "construction project",
      "industrial construction",
      "engineering project indonesia",
      project.scope?.join(", ").toLowerCase() || "construction work",
    ].filter(Boolean),

    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      publishedTime: project.completionDate,
      authors: ["PT Manggala Putra Persada"],
      images: [
        {
          url: project.images[0],
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },

    alternates: {
      canonical: `https://pt-manggala-putra-persada.vercel.app/proyek/${project.slug}`,
    },
  }
}

/* =========================
   PROJECT DETAIL PAGE
========================= */
export default function ProjectDetailPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug)
  if (!project) return notFound()

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <article className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== HEADER ===== */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          <div>
            <span className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full border border-red-200">
              {project.category}
            </span>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mt-6 mb-6">
              {project.title}
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {project.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-white border border-gray-200 rounded-xl mb-8">
              {project.location && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <MapPin size={14} /> Location
                  </div>
                  <p className="font-semibold text-gray-900">{project.location}</p>
                </div>
              )}

              {project.completionDate && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Calendar size={14} /> Completed
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(project.completionDate)}
                  </p>
                </div>
              )}

              {project.duration && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Clock size={14} /> Duration
                  </div>
                  <p className="font-semibold text-gray-900">{project.duration}</p>
                </div>
              )}

              {project.client && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <HardHat size={14} /> Client
                  </div>
                  <p className="font-semibold text-gray-900">{project.client}</p>
                </div>
              )}
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={project.images[0]}
              alt={project.title}
              width={800}
              height={600}
              className="w-full h-[450px] object-cover"
              priority
            />
          </div>
        </div>

        {/* ===== SCOPE ===== */}
        {project.scope && project.scope.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Scope of Work
            </h2>
            <ul className="space-y-3">
              {project.scope.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== GALLERY ===== */}
        {project.images.length > 1 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Project Gallery
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.slice(1).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${project.title} - Image ${i + 2}`}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== BACK LINK ===== */}
        <div className="mt-16 text-center">
          <Link
            href="/proyek"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition group"
          >
            <ChevronRight size={16} className="rotate-180" />
            Back to All Projects
          </Link>
        </div>

      </div>
    </article>
  )
}
