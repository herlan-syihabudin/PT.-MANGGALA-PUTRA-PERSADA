export default function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Lingkup Layanan
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Pendekatan Terstruktur untuk Setiap Proyek
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            Kami menghadirkan layanan konstruksi berbasis engineering
            dengan perencanaan yang matang, pelaksanaan terukur,
            dan pengendalian mutu yang konsisten.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* SERVICE 1 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Konstruksi Sipil & Struktur
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pekerjaan konstruksi bangunan dan struktur dengan fokus
              pada kekuatan, stabilitas, dan kesesuaian terhadap
              spesifikasi teknis serta standar keselamatan kerja.
            </p>
          </div>

          {/* SERVICE 2 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Struktur Baja
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Fabrikasi dan erection struktur baja untuk kebutuhan
              industri dan komersial dengan presisi tinggi,
              perhitungan teknik yang akurat, dan kontrol kualitas ketat.
            </p>
          </div>

          {/* SERVICE 3 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              MEP (Mechanical, Electrical & Plumbing)
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Perencanaan dan pelaksanaan sistem MEP yang terintegrasi
              untuk mendukung fungsi bangunan secara optimal,
              efisien, dan berkelanjutan.
            </p>
          </div>

          {/* SERVICE 4 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Interior & Finishing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pekerjaan interior dan penyelesaian akhir dengan perhatian
              pada detail, fungsi ruang, dan kualitas hasil,
              sesuai dengan kebutuhan dan karakter proyek.
            </p>
          </div>

          {/* SERVICE 5 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Design & Build
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Solusi terpadu dari tahap perencanaan hingga pelaksanaan,
              memastikan koordinasi yang efisien, waktu pengerjaan
              terkontrol, dan hasil yang sesuai target.
            </p>
          </div>

          {/* SERVICE 6 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Manajemen Proyek
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pengelolaan proyek secara sistematis meliputi pengendalian
              biaya, mutu, waktu, serta keselamatan kerja untuk
              memastikan proyek berjalan sesuai rencana.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
