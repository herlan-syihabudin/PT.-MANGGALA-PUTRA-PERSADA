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
import ProjectCard from "@/components/ProjectCard"

type Props = {
  params: Promise<{
    slug: string
  }>
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mppindo.com"

/* =========================
   SEO METADATA PER PROJECT
========================= */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
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
          url: project.images[0],
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
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
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

        {/* ===== BREADCRUMB ===== */}
        <div className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <Link href="/proyek" className="hover:text-gold transition">Proyek</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">{project.title}</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full border border-red-200">
                {project.category}
              </span>

              {/* Share Button */}
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: project.title,
                      text: project.description,
                      url: window.location.href,
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert("Link copied to clipboard!")
                  }
                }}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition"
              >
                <Share2 size={18} />
                <span className="text-sm hidden sm:inline">Bagikan</span>
              </button>
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

            {/* Download PDF Button */}
            {project.pdfUrl && (
              <a
                href={project.pdfUrl}
                download
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <Download size={18} />
                <span>Download Project PDF</span>
              </a>
            )}
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
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Project Gallery
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.slice(1).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group">
                  <Image
                    src={img}
                    alt={`${project.title} - Construction progress photo ${i + 2}`}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== RELATED PROJECTS ===== */}
        {projects.filter(p => p.category === project.category && p.slug !== project.slug).length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Proyek Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {projects
                .filter(p => p.category === project.category && p.slug !== project.slug)
                .slice(0, 3)
                .map(related => (
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
          >
            <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to All Projects
          </Link>

          <div className="mt-8">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Konsultasi Proyek Serupa
              <ChevronRight size={18} />
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
            "image": project.images[0],
            "author": {
              "@type": "Organization",
              "name": "PT Manggala Putra Persada"
            },
            "publisher": {
              "@type": "Organization",
              "name": "PT Manggala Putra Persada"
            },
            "datePublished": project.completionDate,
            "keywords": project.scope?.join(", "),
          })
        }}
      />
    </article>
  )
}
