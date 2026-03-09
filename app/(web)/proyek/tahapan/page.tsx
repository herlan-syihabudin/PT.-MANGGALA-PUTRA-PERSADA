import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import ProjectExecutionFlow, { steps } from "../ProjectExecutionFlow"

export const metadata: Metadata = {
  title: "7 Tahapan Pelaksanaan Proyek Konstruksi Industri | MPP Engineering",
  description: "Pelajari alur kerja terstruktur kami dalam mengeksekusi proyek konstruksi industri: dari analisis kebutuhan, survei lapangan, desain teknis, hingga serah terima.",
  
  openGraph: {
    title: "7 Tahapan Pelaksanaan Proyek Engineering-Led | MPP Engineering",
    description: "Bagaimana kami menjalankan proyek konstruksi industri dengan pendekatan engineering yang terukur.",
    url: "https://mppindo.com/proyek/tahapan",
    siteName: "PT Manggala Putra Persada",
    type: "website",
    images: [{
      url: "https://mppindo.com/images/og-execution-flow.jpg",
      width: 1200,
      height: 630,
      alt: "Tahapan Pelaksanaan Proyek MPP Engineering",
    }],
  },

  alternates: {
    canonical: "https://mppindo.com/proyek/tahapan",
  },
}

export default function TahapanPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      {/* Navigation Bar */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            href="/proyek" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gold transition group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition" />
            <span>Kembali ke Portofolio Proyek</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
              Engineering Execution Framework
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              7 Tahapan Pelaksanaan Proyek
              <span className="block text-2xl md:text-3xl text-gold mt-2">
                Dari Konsep hingga Serah Terima
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Setiap proyek konstruksi industri membutuhkan pendekatan yang terstruktur. 
              Kami menerapkan 7 tahapan kerja yang terencana untuk memastikan kualitas, 
              ketepatan waktu, dan kepuasan klien.
            </p>
            
            {/* Quick Stats - Pindah dari component ke sini biar lebih kontekstual */}
            <div className="flex flex-wrap gap-6 mt-8 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Timer size={20} className="text-gold" />
                </div>
                <div>
                  <div className="font-bold text-xl">7 Tahapan</div>
                  <div className="text-sm text-gray-400">Terstruktur</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-gold" />
                </div>
                <div>
                  <div className="font-bold text-xl">100% QC</div>
                  <div className="text-sm text-gray-400">di Setiap Fase</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                  <Trophy size={20} className="text-gold" />
                </div>
                <div>
                  <div className="font-bold text-xl">Terjamin</div>
                  <div className="text-sm text-gray-400">Hasil Akhir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Execution Flow Component - SEKARANG TANPA JUDUL */}
      <ProjectExecutionFlow />

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lihat Hasil Nyata dari Tahapan Ini
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Jelajahi portofolio proyek kami yang telah selesai dengan menerapkan 
            7 tahapan pelaksanaan di atas.
          </p>
          <Link
            href="/proyek"
            className="inline-flex items-center gap-3 bg-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-gold/90 transition shadow-lg hover:shadow-xl"
          >
            Lihat Portofolio Proyek
          </Link>
        </div>
      </div>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "7 Tahapan Pelaksanaan Proyek Konstruksi",
            "description": "Panduan tahapan pelaksanaan proyek konstruksi industri dari MPP Engineering",
            "totalTime": "PT6M",
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description,
              "url": `https://mppindo.com/proyek/tahapan#step-${step.number}`
            }))
          })
        }}
      />
    </main>
  )
}            href="/proyek" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gold transition group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition" />
            <span>Kembali ke Portofolio Proyek</span>
          </Link>
        </div>
      </div>

      {/* Hero Section untuk halaman tahapan */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
              Engineering Execution Framework
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              7 Tahapan Pelaksanaan Proyek
              <span className="block text-2xl md:text-3xl text-gold mt-2">
                Dari Konsep hingga Serah Terima
              </span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Setiap proyek konstruksi industri membutuhkan pendekatan yang terstruktur. 
              Kami menerapkan 7 tahapan kerja yang terencana untuk memastikan kualitas, 
              ketepatan waktu, dan kepuasan klien.
            </p>
          </div>
        </div>
      </div>

      {/* Project Execution Flow Component */}
      <ProjectExecutionFlow />

      {/* Call to Action - Kembali ke portofolio */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Lihat Hasil Nyata dari Tahapan Ini
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Jelajahi portofolio proyek kami yang telah selesai dengan menerapkan 
            7 tahapan pelaksanaan di atas.
          </p>
          <Link
            href="/proyek"
            className="inline-flex items-center gap-3 bg-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-gold/90 transition shadow-lg hover:shadow-xl"
          >
            Lihat Portofolio Proyek
          </Link>
        </div>
      </div>

      {/* Schema Markup untuk halaman ini */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "7 Tahapan Pelaksanaan Proyek Konstruksi",
            "description": "Panduan tahapan pelaksanaan proyek konstruksi industri dari MPP Engineering",
            "totalTime": "PT6M",
            "step": steps.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description,
              "url": `https://mppindo.com/proyek/tahapan#step-${step.number}`
            }))
          })
        }}
      />
    </main>
  )
}

