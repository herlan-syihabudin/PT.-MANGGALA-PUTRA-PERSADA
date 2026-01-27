export default function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Engineering Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            A Structured Engineering Approach for Every Project
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            We deliver construction and engineering services through
            disciplined planning, precise execution, and consistent
            quality control to ensure reliable project outcomes.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {/* SERVICE 1 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Civil & Structural Construction
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pelaksanaan pekerjaan konstruksi sipil dan struktur dengan
              pendekatan engineering yang mengutamakan kekuatan struktur,
              stabilitas bangunan, serta kesesuaian terhadap spesifikasi
              teknis dan standar keselamatan kerja.
            </p>
          </div>

          {/* SERVICE 2 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Steel Structure Engineering
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Fabrikasi dan erection struktur baja untuk kebutuhan industri
              dan komersial dengan perhitungan teknik yang akurat, presisi
              pelaksanaan tinggi, serta pengendalian mutu yang ketat.
            </p>
          </div>

          {/* SERVICE 3 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              MEP Systems Integration
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Perencanaan dan pelaksanaan sistem Mechanical, Electrical,
              dan Plumbing yang terintegrasi untuk mendukung performa
              bangunan secara optimal, efisien, dan berkelanjutan.
            </p>
          </div>

          {/* SERVICE 4 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Interior & Architectural Finishing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pekerjaan interior dan finishing dengan perhatian tinggi
              terhadap detail, fungsi ruang, dan kualitas hasil akhir,
              disesuaikan dengan karakter serta kebutuhan proyek.
            </p>
          </div>

          {/* SERVICE 5 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Design & Build Solutions
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Solusi terpadu dari tahap perencanaan hingga pelaksanaan
              konstruksi untuk memastikan koordinasi yang efisien,
              pengendalian waktu, serta pencapaian target proyek.
            </p>
          </div>

          {/* SERVICE 6 */}
          <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Project Management & Control
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Pengelolaan proyek secara sistematis meliputi pengendalian
              biaya, mutu, jadwal, serta aspek keselamatan kerja untuk
              memastikan proyek berjalan sesuai rencana dan komitmen.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
