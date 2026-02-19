import Link from "next/link"
import { Suspense } from "react"
import { 
  HardHat, 
  ChevronRight,
  Filter,
  Grid3x3,
  LayoutList,
  ArrowUpDown
} from "lucide-react"
import ProjectCard from "@/components/ProjectCard"
import { projects } from "@/lib/projects"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Projects | Engineering & Construction Portfolio | PT Manggala Putra Persada",
  description: "Explore our portfolio of industrial, commercial, and residential construction projects. Steel structure, civil works, MEP installation, and design-build projects completed across Indonesia.",
  keywords: [
    "construction projects indonesia",
    "industrial construction portfolio",
    "steel structure projects",
    "civil engineering projects",
    "mep installation examples",
    "design build portfolio",
    "kontraktor proyek industri",
    "portofolio konstruksi baja",
  ],
  openGraph: {
    title: "Our Construction Projects | PT Manggala Putra Persada",
    description: "View our portfolio of engineering-led construction projects across Indonesia. Industrial plants, commercial buildings, and residential developments.",
    url: "https://pt-manggala-putra-persada.vercel.app/proyek",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [
      {
        url: "/og-projects.jpg",
        width: 1200,
        height: 630,
        alt: "PT Manggala Putra Persada Construction Projects Portfolio"
      }
    ],
  },
}

// Category filter options
const categories = ["All", "Industrial", "Commercial", "Residential", "Infrastructure"]

export default function ProyekPage() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== HEADER SECTION ===== */}
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
            <HardHat size={16} className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">Project Portfolio</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Representative <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Projects</span>
          </h1>

          {/* Decorative line */}
          <div className="flex gap-2 mt-6">
            <div className="w-20 h-1 bg-red-600 rounded-full" />
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Intro */}
          <p className="mt-8 text-lg text-gray-700 leading-relaxed max-w-3xl">
            PT Manggala Putra Persada delivers engineering and construction
            projects through a structured execution approach, focusing on
            quality standards, safety compliance, and reliable project delivery
            across industrial, residential, and commercial sectors.
          </p>
        </div>

        {/* ===== STATS HIGHLIGHTS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <p className="text-3xl font-black text-red-600">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-900 mt-2">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* ===== FILTER & VIEW TOGGLES (Client Component) ===== */}
        <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />}>
          <ProjectFilters categories={categories} />
        </Suspense>

        {/* ===== PROJECT GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

        {/* ===== LOAD MORE BUTTON (if pagination needed) ===== */}
        {projects.length > 6 && (
          <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition">
              Load More Projects
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ===== CTA SECTION ===== */}
        <div className="mt-32 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl -z-10" />
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/20 rounded-full blur-2xl" />
          
          <div className="relative px-8 py-16 md:px-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
              Let's discuss how our engineering-led approach can deliver your next project with certainty and quality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/kontak"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
              >
                Discuss Your Project Scope
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/layanan"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                View Our Services
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-red-200">
              <span>✓ Free Consultation</span>
              <span>✓ Detailed Proposal</span>
              <span>✓ Quality Guarantee</span>
            </div>
          </div>
        </div>

        {/* ===== TESTIMONIAL SNIPPET ===== */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-5 h-5 fill-gold" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Trusted by 50+ industrial partners across Indonesia
          </p>
        </div>

      </div>
    </section>
  )
}

// Stats data
const stats = [
  { value: "100+", label: "Projects Completed", description: "Since 2010" },
  { value: "50+", label: "Industrial Clients", description: "Nationwide" },
  { value: "14+", label: "Years Experience", description: "Engineering excellence" },
  { value: "100%", label: "Safety Record", description: "Zero LTI" },
]

// Client component for filters (separate file)
// @/components/ProjectFilters.tsx
