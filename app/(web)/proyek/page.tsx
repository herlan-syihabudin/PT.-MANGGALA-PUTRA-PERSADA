import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"  // ⬅️ TAMBAHIN ArrowRight
import type { Metadata } from "next"
import ProjectCard from "@/components/ProjectCard"
import ProjectFilters from "@/components/ProjectFilters"
import { projects, getCategories } from "@/lib/projects"

export const metadata: Metadata = {
  title: "Portofolio Proyek Industri & Komersial | PT Manggala Putra Persada",
  description: "Jelajahi portofolio proyek konstruksi industri, manufaktur, pergudangan, dan komersial MPP Engineering yang telah selesai di seluruh Indonesia dengan pendekatan engineering-led.",
  // ... metadata lainnya tetap sama
}

const categories = ["All", ...getCategories()]

export default function ProyekPage() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* BREADCRUMB */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">Proyek</span>
        </div>

        {/* HEADER */}
        <div className="max-w-3xl">
          <span className="text-gold font-semibold text-sm tracking-wider uppercase mb-2 block">
  Portofolio Proyek
</span>

<h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
  Proyek Industri & Komersial
  <span className="block text-gold text-2xl md:text-3xl mt-2">
    Dengan Pendekatan & Eksekusi Konstruksi Terstruktur
  </span>
</h1>

<p className="text-lg text-gray-600">
  Berbagai proyek konstruksi industri, manufaktur, pergudangan, dan fasilitas komersial
  yang kami kerjakan di berbagai wilayah Indonesia dengan pendekatan engineering
  yang terencana dan pelaksanaan konstruksi yang terkontrol.
</p>
        </div>

        {/* FILTERS */}
        <div className="mt-12">
          <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse mb-8" />}>
            <ProjectFilters categories={categories} />
          </Suspense>
        </div>

        {/* AUTHORITY STATS */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-20">
  <Stat label="Jenis Proyek" value="Industrial & Warehouse" />
<Stat label="Pendekatan Proyek" value="Engineering Led" />
<Stat label="Metode Pelaksanaan" value="Design & Build" />
<Stat label="Wilayah Layanan" value="Indonesia" />
</div>

        {/* ===== 🌟 LINK KE HALAMAN TAHAPAN - TARO SINI ===== */}
        <div className="mb-16 bg-gradient-to-r from-gold/5 to-transparent rounded-2xl p-8 border border-gold/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Ingin Mengetahui Proses Pelaksanaan Proyek Kami?
              </h2>
              <p className="text-gray-600">
                Tahapan perencanaan & pelaksanaan konstruksi
yang matang di setiap proyek.
              </p>
            </div>
            <Link
              href="/proyek/tahapan"
              className="inline-flex items-center gap-3 bg-white text-gold px-6 py-3 rounded-xl font-semibold border-2 border-gold/20 hover:bg-gold hover:text-white hover:border-gold transition-all group whitespace-nowrap shadow-sm"
            >
              <span>Lihat Tahapan Proyek</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* PROJECT GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>

        {/* NO RESULTS STATE */}
        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">Tidak ada proyek dengan kategori ini.</p>
            <Link href="/proyek" className="text-gold hover:underline">
              Lihat semua proyek
            </Link>
          </div>
        )}

        {/* SCHEMA MARKUP */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Portofolio Proyek MPP Engineering",
              "numberOfItems": projects.length,
              "itemListElement": projects.map((project, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://mppindo.com/proyek/${project.slug}`,
                "name": project.title,
              }))
            })
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://mppindo.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Proyek",
                  "item": "https://mppindo.com/proyek"
                }
              ]
            })
          }}
        />

      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-gold/30 transition-all hover:-translate-y-1">
      <div className="text-3xl font-black text-gold mb-2">{value}</div>
      <p className="text-sm font-semibold text-gray-900">{label}</p>
    </div>
  )
}
