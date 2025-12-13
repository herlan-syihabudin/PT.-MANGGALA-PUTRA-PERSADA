import type { Metadata } from "next"

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
  openGraph: {
    title: "Cara Kerja & Standar Proyek",
    description:
      "Tahapan kerja dan standar pelaksanaan proyek konstruksi dan engineering PT Manggala Putra Persada.",
    url: "https://pt-manggala-putra-persada.vercel.app/cara-kerja",
    siteName: "PT Manggala Putra Persada",
    images: [
      {
        url: "/og-image.png",
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
        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-gray-900">
          Cara Kerja & <span className="text-red-600">Standar Proyek</span>
        </h1>

        {/* PARAGRAF SEO PEMBUKA */}
        <p className="text-lg text-gray-600 max-w-3xl mb-12">
          Halaman ini menjelaskan cara kerja kontraktor dan standar pelaksanaan
          proyek yang diterapkan oleh PT Manggala Putra Persada dalam setiap
          pekerjaan konstruksi dan engineering.
        </p>

        <div className="space-y-12 text-gray-700 leading-relaxed">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Tahapan Pekerjaan
            </h2>
            <ol className="list-decimal ml-6 space-y-3">
              <li>Konsultasi awal dan survey lokasi proyek.</li>
              <li>Perencanaan teknis dan penyusunan RAB.</li>
              <li>Kesepakatan ruang lingkup dan kontrak kerja.</li>
              <li>Pelaksanaan proyek dengan pengawasan terstruktur.</li>
              <li>Serah terima pekerjaan serta masa pemeliharaan.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Standar Pelaksanaan
            </h2>
            <ul className="list-disc ml-6 space-y-3">
              <li>Penerapan standar mutu dan spesifikasi teknis.</li>
              <li>Kepatuhan terhadap keselamatan dan kesehatan kerja (K3).</li>
              <li>Pengendalian waktu, biaya, dan progres proyek.</li>
              <li>Transparansi dan komunikasi yang profesional.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
