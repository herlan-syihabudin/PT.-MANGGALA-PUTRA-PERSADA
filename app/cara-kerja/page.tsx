export default function CaraKerjaPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-gray-900">
          Cara Kerja & <span className="text-red-600">Standar Proyek</span>
        </h1>

        <div className="space-y-10 text-gray-700 leading-relaxed">
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
