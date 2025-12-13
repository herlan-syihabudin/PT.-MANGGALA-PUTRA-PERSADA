export default function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-gray-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT CONTENT */}
        <div>
          <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            General Contractor & MEP
          </span>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Solusi Konstruksi <br />
            <span className="text-red-600">Pabrik & Perumahan</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
            PT Manggala Putra Persada menangani pekerjaan konstruksi sipil, baja,
            MEP, dan interior dengan pendekatan profesional, terukur, dan
            bertanggung jawab.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20konsultasi%20proyek"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition shadow-md"
            >
              Konsultasi Gratis
            </a>

            <a
              href="/proyek"
              className="inline-flex items-center justify-center border border-gray-300 px-8 py-4 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Lihat Proyek
            </a>
          </div>

          {/* TRUST INDICATOR */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md text-sm text-gray-600">
            <div>
              <p className="font-bold text-gray-900">Profesional</p>
              <p>Manajemen Proyek</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Terukur</p>
              <p>Biaya & Waktu</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Bertanggung Jawab</p>
              <p>Mutu & K3</p>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL BLOCK */}
        <div className="hidden md:flex justify-end">
          <div className="relative w-full max-w-md aspect-[4/5] bg-gray-100 rounded-2xl shadow-lg flex items-center justify-center text-gray-400 text-sm">
            {/* Placeholder untuk foto proyek */}
            Area Foto Proyek <br /> (Pabrik / Perumahan)
          </div>
        </div>
      </div>
    </section>
  )
}
