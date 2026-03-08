import { notFound } from "next/navigation"
import { projects, type Project } from "@/lib/projects"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Download,
  CheckCircle,
  FileText,
  Share2,
  Building2,
  Wrench
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
    keywords: `${project.category}, industrial construction, engineering indonesia`,

    openGraph: {
      title: project.title,
      description: project.description,
      type: "website",
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

  // Cek apakah ada stats untuk ditampilkan
  const hasStats = project.location || project.completionDate || project.duration || project.client

  return (
    <article className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* ===== HERO SECTION WITH COVER IMAGE ===== */}
      {project.images?.[0] && (
        <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          {/* BREADCRUMB DI ATAS HERO */}
          <div className="absolute top-8 left-0 right-0 max-w-7xl mx-auto px-6 z-10">
            <nav className="flex items-center gap-2 text-sm text-white/80" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <ChevronRight size={14} className="text-white/60" aria-hidden="true" />
              <Link href="/proyek" className="hover:text-white transition">Proyek</Link>
              <ChevronRight size={14} className="text-white/60" aria-hidden="true" />
              <span className="text-white font-medium truncate">{project.title}</span>
            </nav>
          </div>
          
          {/* PROJECT INFO DI ATAS HERO */}
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-6 pb-16 z-10">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-4 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-full">
                {project.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white max-w-4xl leading-tight">
              {project.title}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mt-4 max-w-3xl">
              {project.description}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* ===== PROJECT STATS CARDS ===== */}
        {hasStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {project.location && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <MapPin size={20} className="text-gold mb-2" aria-hidden="true" />
                <p className="text-xs text-gray-500">Lokasi</p>
                <p className="font-semibold text-gray-900 text-sm">{project.location}</p>
              </div>
            )}
            
            {project.completionDate && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Calendar size={20} className="text-gold mb-2" aria-hidden="true" />
                <p className="text-xs text-gray-500">Selesai</p>
                <p className="font-semibold text-gray-900 text-sm">{formatDate(project.completionDate)}</p>
              </div>
            )}
            
            {project.duration && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Clock size={20} className="text-gold mb-2" aria-hidden="true" />
                <p className="text-xs text-gray-500">Durasi</p>
                <p className="font-semibold text-gray-900 text-sm">{project.duration}</p>
              </div>
            )}
            
            {project.client && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Building2 size={20} className="text-gold mb-2" aria-hidden="true" />
                <p className="text-xs text-gray-500">Klien</p>
                <p className="font-semibold text-gray-900 text-sm">{project.client}</p>
              </div>
            )}
          </div>
        )}

        {/* ===== MAIN CONTENT GRID ===== */}
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* ===== LEFT CONTENT - DETAIL TEKNIS ===== */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* SCOPES OF WORK */}
            {project.scope && project.scope.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Wrench size={24} className="text-gold" aria-hidden="true" />
                  Lingkup Pekerjaan
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.scope.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===== RIGHT SIDEBAR ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              
              {/* QUICK ACTIONS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gold rounded-full" aria-hidden="true" />
                  Informasi Proyek
                </h3>

                {/* DOWNLOAD BUTTONS */}
                {project.pdfUrl && (
                  <div className="mt-6 space-y-3">
                    <a
                      href={project.pdfUrl}
                      download
                      className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
                      aria-label={`Download PDF untuk ${project.title}`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-gold" aria-hidden="true" />
                        <span className="text-sm font-medium">Download PDF</span>
                      </div>
                      <Download size={16} className="text-gray-400 group-hover:text-gold transition" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>

              {/* SHARE BUTTONS */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Bagikan Proyek</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${BASE_URL}/proyek/${project.slug}`)
                      alert('Link disalin!')
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    title="Salin link"
                    aria-label="Salin link proyek"
                  >
                    <Share2 size={16} aria-hidden="true" />
                  </button>
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${BASE_URL}/proyek/${project.slug}`)}&text=${encodeURIComponent(project.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                    title="Bagikan di Twitter"
                    aria-label="Bagikan proyek di Twitter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${BASE_URL}/proyek/${project.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                    title="Bagikan di LinkedIn"
                    aria-label="Bagikan proyek di LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.204 0 22.225 0z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== GALLERY ===== */}
        {project.images?.length > 1 && (
          <section className="mt-20" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" aria-hidden="true" />
              Dokumentasi Proyek
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.slice(1).map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group aspect-square">
                  <Image
                    src={img}
                    alt={`${project.title} - Foto ${i + 2}`}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Lihat Foto</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== RELATED PROJECTS ===== */}
        {relatedProjects.length > 0 && (
          <section className="mt-20" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded-full" aria-hidden="true" />
              Proyek Terkait
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedProjects.map(related => (
                <ProjectCard key={related.slug} {...related} />
              ))}
            </div>
          </section>
        )}

        {/* ===== CTA SECTION ===== */}
        <div className="mt-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Tertarik dengan proyek serupa?</h3>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Diskusikan kebutuhan proyek Anda dengan tim engineering kami. Gratis konsultasi awal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
              aria-label="Konsultasi proyek dengan tim kami"
            >
              Konsultasi Sekarang
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/proyek"
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition border border-white/30"
              aria-label="Lihat proyek lainnya"
            >
              Lihat Proyek Lainnya
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
            "@type": "ConstructionProject",
            "name": project.title,
            "description": project.description,
            "location": {
              "@type": "Place",
              "name": project.location || "Indonesia"
            },
            "image": project.images?.[0]
              ? `${BASE_URL}${project.images[0]}`
              : `${BASE_URL}/images/project-placeholder.jpg`,
            ...(project.startDate && { "startDate": project.startDate }),
            "endDate": project.completionDate,
            "contractor": {
              "@type": "Organization",
              "name": "PT Manggala Putra Persada",
              "url": BASE_URL
            },
            ...(project.client && {
              "client": {
                "@type": "Organization",
                "name": project.client
              }
            }),
            "keywords": [
              project.category,
              ...(project.scope || [])
            ].join(", "),
          })
        }}
      />
    </article>
  )
}
