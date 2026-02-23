import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Metadata } from "next"

import ProjectCard from "@/components/ProjectCard"
import ProjectFilters from "@/components/ProjectFilters"
import { projects, getCategories } from "@/lib/projects"

export const metadata: Metadata = {
  title: "Portofolio Proyek Industri & Komersial | PT Manggala Putra Persada",
  description: "Jelajahi portofolio proyek konstruksi industri, manufaktur, pergudangan, dan komersial MPP Engineering yang telah selesai di seluruh Indonesia dengan pendekatan engineering-led.",
  openGraph: {
    title: "100+ Proyek Industri & Komersial | MPP Engineering",
    description: "Lihat portofolio proyek konstruksi engineering-led kami di berbagai sektor industri.",
    images: ["/images/og-projects.jpg"],
  },
}

const categories = ["All", ...getCategories()] // Dinamis dari data

export default function ProyekPage() {
  return (
    <section 
      id="proyek-kami"
      className="py-24 bg-gradient-to-b from-white to-gray-50"
      aria-labelledby="projects-heading"
    >
      <div className="max-w-7xl mx-auto px-4">

        {/* ===== BREADCRUMB ===== */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">Proyek</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase mb-2 block">
            Portfolio
          </span>
          
          <h1 
            id="projects-heading"
            className="text-4xl md:text-5xl font-black mb-6 leading-tight"
          >
            100+ Industrial & Commercial Projects
            <span className="block text-gold text-2xl md:text-3xl mt-2">
              Delivered with Engineering-Led Execution
            </span>
          </h1>

          <p className="text-lg text-gray-600">
            Engineering-led construction projects delivered across industrial,
            manufacturing, warehousing, and commercial sectors in Indonesia.
          </p>
        </div>

        {/* ===== FILTERS ===== */}
        <div className="mt-12">
          <Suspense
            fallback={
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />
            }
          >
            <ProjectFilters categories={categories} />
          </Suspense>
        </div>

        {/* ===== AUTHORITY STATS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-20">
          <Stat label="Projects Delivered" value="100+" />
          <Stat label="Industrial Clients" value="50+" />
          <Stat label="Years Experience" value="15+" />
          <Stat label="Provinces Covered" value="12+" />
        </div>

        {/* ===== PROJECT GRID ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

        {/* ===== NO RESULTS STATE ===== */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">Tidak ada proyek dengan kategori ini.</p>
            <Link 
              href="/proyek" 
              className="text-gold hover:underline"
            >
              Lihat semua proyek
            </Link>
          </div>
        )}

        {/* ===== SCHEMA MARKUP (SEO) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Portofolio Proyek MPP Engineering",
              "description": "Daftar proyek konstruksi industri dan komersial",
              "numberOfItems": projects.length,
              "itemListElement": projects.map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://mpp-engineering.com/proyek/${project.slug}`,
                "name": project.title,
                "image": project.image,
              }))
            })
          }}
        />

      </div>
    </section>
  )
}

/* ================= STAT COMPONENT ================= */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-gold/30 transition-all hover:-translate-y-1">
      <div className="text-3xl font-black text-gold mb-2">{value}</div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
    </div>
  )
}
