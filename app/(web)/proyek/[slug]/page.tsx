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
  ChevronRight,
  Download,
} from "lucide-react"
import ProjectCard from "@/components/ProjectCard"

type Props = {
  params: {
    slug: string
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mppindo.com"

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

/* =========================
   SEO METADATA PER PROJECT
========================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  const project = projects.find((p) => p.slug === slug)

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
      project.scope?.join(", ")?.toLowerCase() || "construction work",
    ].filter(Boolean),

    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      publishedTime: project.completionDate,
      authors: ["PT Manggala Putra Persada"],
      images: [
        {
          url: project.images?.[0] || `${BASE_URL}/images/project-placeholder.jpg`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },

    alternates: {
      canonical: `${BASE_URL}/proyek/${project.slug}`,
    },
  }
}

/* =========================
   PROJECT DETAIL PAGE
========================= */
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return notFound()

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    })
  }

  const relatedProjects = projects
    .filter(p => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3)

  return (
    <article className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== BREADCRUMB ===== */}
        <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap">
            <li className="flex items-center">
              <Link href="/" className="hover:text-gold transition">Home</Link>
              <ChevronRight size={14} className="mx-2" aria-hidden="true" />
            </li>
            <li className="flex items-center">
              <Link href="/proyek" className="hover:text-gold transition">Proyek</Link>
              <ChevronRight size={14} className="mx-2" aria-hidden="true" />
            </li>
            <li className="font-medium text-gray-900 truncate max-w-[200px] md:max-w-none">
              {project.title}
            </li>
          </ol>
        </nav>

        {/* ===== HEADER ===== */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full border border-red-200">
                {project.category}
              </span>
            </div>

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
                    <MapPin size={14} aria-hidden="true" /> Location
                  </div>
                  <p className="font-semibold text-gray-900">{project.location}</p>
                </div>
              )}

              {project.completionDate && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Calendar size={14} aria-hidden="true" /> Completed
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatDate(project.completionDate)}
                  </p>
                </div>
              )}

              {project.duration && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Clock size={14} aria-hidden="true" /> Duration
                  </div>
                  <p className="font-semibold text-gray-900">{project.duration}</p>
                </div>
              )}

              {project.client && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <HardHat size={14} aria-hidden="true" /> Client
                  </div>
                  <p className="font-semibold text-gray-900">{project.client}</p>
                </div>
              )}
            </div>

            {/* Download PDF Button */}
            {project.pdfUrl && (
              <a
                href={project.pdfUrl}
                download
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                aria-label={`Download PDF for ${project.title}`}
              >
                <Download size={18} aria-hidden="true" />
                <span>Download Project PDF</span>
              </a>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={project.images?.[0] || "/images/project-placeholder.jpg"}
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
          <section className="mb-16" aria-labelledby="scope-heading">
            <h2 id="scope-heading" className="text-2xl font-bold text-gray-900 mb-6">
              Scope of Work
            </h2>
            <ul className="space-y-3">
              {project.scope.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ===== GALLERY ===== */}
        {project.images?.length > 1 && (
          <section className="mb-16" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-2xl font-bold text-gray-900 mb-6">
              Project Gallery
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.slice(1).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group aspect-square">
                  <Image
                    src={img}
                    alt={`${project.title} - Construction progress photo ${i + 2}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== RELATED PROJECTS ===== */}
        {relatedProjects.length > 0 && (
          <section className="mt-24" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold text-gray-900 mb-8">
              Proyek Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProjects.map(related => (
                <ProjectCard key={related.slug} {...related} />
              ))}
            </div>
          </section>
        )}

        {/* ===== CTA ===== */}
        <div className="mt-16 text-center">
          <Link
            href="/proyek"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition group mb-4"
            aria-label="Back to all projects"
          >
            <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
            Back to All Projects
          </Link>

          <div className="mt-8">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Konsultasi Proyek Serupa
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>

      {/* ===== SCHEMA MARKUP ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": project.title,
  "description": project.description,
  "image": project.images?.[0]
  ? `${BASE_URL}${project.images[0]}`
  : `${BASE_URL}/images/project-placeholder.jpg`
  "author": {
    "@type": "Organization",
    "name": "PT Manggala Putra Persada",
    "url": BASE_URL,
  },
  "publisher": {
    "@type": "Organization",
    "name": "PT Manggala Putra Persada",
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE_URL}/images/logo-mpp.png`,
    },
  },
  "datePublished": project.completionDate,
  "keywords": [
  project.category,
  ...(project.scope || [])
].join(", ")
})
        }}
      />
    </article>
  )
}
