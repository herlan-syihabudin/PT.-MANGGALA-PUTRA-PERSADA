import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Cara Kerja & Standar Proyek | PT Manggala Putra Persada",
  description:
    "Penjelasan cara kerja dan standar pelaksanaan proyek PT Manggala Putra Persada, mulai dari konsultasi, perencanaan teknis, pelaksanaan terstruktur, hingga serah terima pekerjaan.",
  keywords: [
    "cara kerja kontraktor",
    "standar proyek konstruksi",
    "proses kerja kontraktor",
    "manajemen proyek konstruksi",
    "engineering dan konstruksi",
    "PT Manggala Putra Persada",
  ],

  alternates: {
  canonical: "https://mppindo.com/cara-kerja",
},
  
  openGraph: {
    title: "Cara Kerja & Standar Proyek",
    description:
      "Tahapan kerja dan standar pelaksanaan proyek konstruksi dan engineering PT Manggala Putra Persada.",
    url: "https://mppindo.com/cara-kerja",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "https://mppindo.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cara Kerja & Standar Proyek PT Manggala Putra Persada",
      },
    ],
    locale: "id_ID",
    type: "article",
  },
}

export default function CaraKerjaPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* BREADCRUMB */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">Cara Kerja</span>
        </div>

        {/* HEADER */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Proses & Standar
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Cara Kerja & <span className="text-red-600">Standar Proyek</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Halaman ini menjelaskan cara kerja kontraktor dan standar pelaksanaan
            proyek yang diterapkan oleh PT Manggala Putra Persada dalam setiap
            pekerjaan konstruksi dan engineering.
          </p>

          {/* TAMBAHAN SEO */}
          <p className="text-gray-600 mt-4 leading-relaxed">
            Setiap proyek yang kami kerjakan mengikuti tahapan manajemen proyek
            yang terstruktur mulai dari konsultasi awal, perencanaan teknis,
            pengendalian mutu, hingga pelaksanaan pekerjaan di lapangan.
            Pendekatan ini memastikan proyek berjalan efisien, aman, dan
            sesuai dengan spesifikasi teknis yang telah disepakati.
          </p>
        </div>

        {/* TAHAPAN CARDS */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gold rounded-full" />
          Tahapan Pekerjaan
        </h2>
        
        <div className="grid md:grid-cols-5 gap-4 mb-16">
          {tahapan.map((t, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition group">
              <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <span className="font-bold">{t.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* STANDAR CARDS */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-gold rounded-full" />
          Standar Pelaksanaan
        </h2>

        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {standarList.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gold/30 transition">
              <span className="text-2xl mb-2 block">{s.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20 hover:shadow-xl"
          >
            Konsultasikan Proyek Anda
            <ChevronRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  )
}

// Data
const tahapan = [
  { step: "01", title: "Konsultasi", desc: "Diskusi awal dan survey lokasi proyek." },
  { step: "02", title: "Perencanaan", desc: "Penyusunan gambar teknis dan RAB." },
  { step: "03", title: "Kontrak", desc: "Kesepakatan ruang lingkup dan kontrak." },
  { step: "04", title: "Pelaksanaan", desc: "Eksekusi dengan pengawasan terstruktur." },
  { step: "05", title: "Serah Terima", desc: "Handover dan masa pemeliharaan." },
]

const standarList = [
  { icon: "📊", title: "Standar Mutu", desc: "Penerapan spesifikasi teknis sesuai regulasi." },
  { icon: "🦺", title: "Keselamatan Kerja", desc: "Kepatuhan terhadap prosedur K3." },
  { icon: "⏱️", title: "Pengendalian", desc: "Waktu, biaya, dan progres terukur." },
  { icon: "🤝", title: "Komunikasi", desc: "Transparansi dan komunikasi profesional." },
]
