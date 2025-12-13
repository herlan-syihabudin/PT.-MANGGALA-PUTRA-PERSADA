import Link from "next/link"

export default function Projects() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Portofolio Proyek
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Proyek Representatif yang Kami Tangani
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Berikut adalah beberapa proyek yang merepresentasikan
            pendekatan engineering dan pelaksanaan terstruktur
            yang kami terapkan dalam setiap pekerjaan.
          </p>
        </div>

        {/* PROJECT GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* PROJECT 1 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Industrial Project
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Pembangunan Fasilitas Produksi
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Pekerjaan konstruksi sipil dan struktur baja untuk
                fasilitas industri dengan fokus pada kekuatan struktur,
                efisiensi tata ruang, dan keselamatan kerja.
              </p>
            </div>
          </div>

          {/* PROJECT 2 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Residential Project
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Pengembangan Kawasan Perumahan
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Pelaksanaan konstruksi perumahan dengan pendekatan
                terencana, pengendalian mutu yang konsisten,
                dan ketepatan waktu pengerjaan.
              </p>
            </div>
          </div>

          {/* PROJECT 3 */}
          <div className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition">
            <div className="h-56 bg-gradient-to-tr from-gray-200 to-gray-100" />
            <div className="p-6">
              <span className="text-xs font-semibold text-red-600">
                Engineering & MEP
              </span>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                Sistem MEP Bangunan Komersial
              </h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Implementasi sistem mechanical, electrical, dan plumbing
                yang terintegrasi untuk mendukung operasional bangunan
                secara optimal dan efisien.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16">
          <Link
            href="/proyek"
            className="inline-flex items-center justify-center border border-gray-300 px-8 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Lihat Seluruh Proyek
          </Link>
        </div>
      </div>
    </section>
  )
}
