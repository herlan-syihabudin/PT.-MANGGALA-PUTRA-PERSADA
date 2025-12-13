export default function ProyekPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-gray-900">
          Proyek <span className="text-red-600">Representatif</span>
        </h1>

        <p className="text-lg text-gray-700 mb-14 max-w-3xl leading-relaxed">
          PT Manggala Putra Persada menangani berbagai pekerjaan konstruksi
          dengan pendekatan engineering dan pelaksanaan terstruktur,
          yang merepresentasikan standar mutu, keselamatan kerja,
          dan ketepatan pelaksanaan proyek.
        </p>

        <div className="grid md:grid-cols-3 gap-10 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Proyek Industri
            </h2>
            <p>
              Pekerjaan konstruksi untuk fasilitas industri seperti pabrik,
              gudang, dan bangunan pendukung dengan fokus pada kekuatan
              struktur dan efisiensi operasional.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Proyek Perumahan
            </h2>
            <p>
              Pelaksanaan pembangunan dan pengembangan perumahan dengan
              perencanaan yang matang, pengendalian mutu, dan
              ketepatan waktu pengerjaan.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              Engineering, MEP & Interior
            </h2>
            <p>
              Implementasi sistem MEP serta pekerjaan interior untuk
              bangunan komersial dan hunian yang mendukung fungsi,
              kenyamanan, dan keselamatan bangunan.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
