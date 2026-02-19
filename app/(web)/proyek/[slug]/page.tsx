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
  Printer
} from "lucide-react"

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

/* =========================
   SEO METADATA PER PROJECT (ENHANCED)
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
      project.scope?.toLowerCase() || "construction work",
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

    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [project.images[0]],
    },

    alternates: {
      canonical: `https://pt-manggala-putra-persada.vercel.app/proyek/${project.slug}`,
    },
  }
}

/* =========================
   PROJECT DETAIL PAGE (ENHANCED)
========================= */
export default function ProjectDetailPage({ params }: Props) {
  const project = projects.find((p) => p.slug === params.slug)

  if (!project) return notFound()

  // Format tanggal (jika ada)
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <article className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== BREADCRUMB ===== */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link href="/proyek" className="hover:text-red-600 transition">Projects</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{project.title}</span>
        </nav>

        {/* ===== HEADER SECTION ===== */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          
          {/* LEFT: Project Info */}
          <div>
            {/* Category & Featured Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full border border-red-200">
                {project.category}
              </span>
              {project.featured && (
                <span className="flex items-center gap-1 px-4 py-1.5 text-sm font-semibold text-gold bg-gold/10 rounded-full border border-gold/20">
                  <Award size={14} />
                  Featured Project
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-6">
              {project.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {project.description}
            </p>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6 bg-white border border-gray-200 rounded-xl mb-8">
              {project.location && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <MapPin size={14} />
                    Location
                  </div>
                  <p className="font-semibold text-gray-900">{project.location}</p>
                </div>
              )}
              
              {project.completionDate && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Calendar size={14} />
                    Completed
                  </div>
                  <p className="font-semibold text-gray-900">{formatDate(project.completionDate)}</p>
                </div>
              )}
              
              {project.duration && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <Clock size={14} />
                    Duration
                  </div>
                  <p className="font-semibold text-gray-900">{project.duration}</p>
                </div>
              )}
              
              {project.client && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    <HardHat size={14} />
                    Client
                  </div>
                  <p className="font-semibold text-gray-900">{project.client}</p>
                </div>
              )}
              
              {project.value && (
                <div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                    Value
                  </div>
                  <p className="font-semibold text-green-600">{project.value}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
              >
                Discuss Similar Project
                <ChevronRight size={16} />
              </Link>
              <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                <Download size={16} />
                Download Case Study
              </button>
            </div>
          </div>

          {/* RIGHT: Hero Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={project.images[0]}
              alt={project.title}
              width={800}
              height={600}
              className="w-full h-[450px] object-cover"
              priority
            />
            
            {/* Image Overlay Stats */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-gray-300">Quality Pass</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-300">Safety Issues</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">On Time</p>
                  <p className="text-xs text-gray-300">Delivery</p>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition">
              <Share2 size={18} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* ===== DETAILS SECTION ===== */}
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          
          {/* Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Scope of Work */}
            {project.scope && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600 rounded-full" />
                  Scope of Work
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {project.scope}
                </p>
              </section>
            )}

            {/* Execution Approach */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                Execution Approach
              </h2>
              <p className="text-gray-700 leading-relaxed">
                The project was executed through structured planning,
                engineering coordination, and controlled site execution
                to ensure quality, safety, and schedule compliance.
              </p>
            </section>

            {/* Key Achievements */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                Key Achievements
              </h2>
              <ul className="space-y-3">
                {achievements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded-full mt-1">
                      <Award size={12} className="text-green-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Project Team */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Team</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900">Project Manager</p>
                    <p className="text-sm text-gray-500">Ir. Budi Santoso</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900">Site Engineer</p>
                    <p className="text-sm text-gray-500">Ahmad Hidayat, ST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900">QA/QC Inspector</p>
                    <p className="text-sm text-gray-500">Dwi Cahyono</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Projects */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Projects</h3>
              <div className="space-y-4">
                {getRelatedProjects(project, projects).map((related) => (
                  <Link
                    key={related.slug}
                    href={`/proyek/${related.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src={related.images[0]}
                        alt={related.title}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-500">{related.category}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-red-600" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Download Brochure */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">Need More Details?</h3>
              <p className="text-sm text-red-100 mb-4">
                Download our company profile and project portfolio.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                <Download size={16} />
                Download Brochure
              </button>
            </div>
          </div>
        </div>

        {/* ===== PROJECT GALLERY ===== */}
        {project.images.length > 1 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              Project Gallery
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {project.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative group rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => {/* Open lightbox */}}
                >
                  <Image
                    src={img}
                    alt={`${project.title} - Image ${i + 2}`}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48 group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm">View Larger</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== CTA SECTION ===== */}
        <div className="bg-gray-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Your Project with MPP Engineering</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Let's discuss how our engineering-led approach can deliver your next project with certainty and quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Discuss Your Project
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/proyek"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              View More Projects
            </Link>
          </div>
        </div>

        {/* ===== BACK LINK ===== */}
        <div className="mt-12 text-center">
          <Link
            href="/proyek"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition group"
          >
            <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition" />
            Back to All Projects
          </Link>
        </div>

      </div>
    </article>
  )
}

// Helper function untuk related projects
function getRelatedProjects(current: Project, allProjects: Project[]): Project[] {
  return allProjects
    .filter(p => p.slug !== current.slug && p.category === current.category)
    .slice(0, 3)
}

// Sample achievements (bisa dari data project)
const achievements = [
  "Completed 2 weeks ahead of schedule",
  "Zero safety incidents throughout construction",
  "Implemented value engineering saving 15% in costs",
  "Successfully passed all quality inspections",
]
