export default function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">
      {/* BACKGROUND ACCENT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[420px] h-[420px] bg-gray-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        {/* LEFT CONTENT */}
        <div>
          {/* BADGE */}
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            General Contractor &amp; MEP Solutions
          </span>

          {/* HEADLINE */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900 max-w-xl">
            Engineering-Led Integrated Construction <br />
            &amp; Project Execution
          </h1>

          {/* SUB HEADLINE */}
          <p className="mt-5 text-lg text-gray-700 font-medium max-w-xl">
            Your Reliable Partner from Engineering to Execution
          </p>

          {/* DESCRIPTION */}
          <p className="mt-6 text-base text-gray-600 max-w-xl leading-relaxed">
            PT Manggala Putra Persada menyediakan solusi konstruksi dan MEP
            berbasis rekayasa teknik yang terintegrasi, dengan pendekatan
            terukur untuk memastikan mutu pekerjaan, keselamatan kerja,
            serta ketepatan waktu dan biaya proyek.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20konsultasi%20proyek"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
            >
              Konsultasi Proyek
            </a>

            <a
              href="/proyek"
              className="inline-flex items-center justify-center border border-gray-300 px-8 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Lihat Portofolio
            </a>
          </div>

          {/* TRUST INDICATOR */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md text-sm">
            <div>
              <p className="font-bold text-gray-900">Engineering-Led</p>
              <p className="text-gray-600">Pendekatan Teknik</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Terintegrasi</p>
              <p className="text-gray-600">Biaya &amp; Waktu</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Akuntabel</p>
              <p className="text-gray-600">Mutu &amp; K3</p>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hidden md:flex justify-end">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-xl shadow-black/10 ring-1 ring-black/5">
            <img
              src="/images/hero-project.jpg"
              alt="PT Manggala Putra Persada Project"
              className="absolute inset-0 w-full h-full object-cover grayscale-[45%] brightness-95 contrast-95"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full bg-white/90 backdrop-blur px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  Industrial &amp; Residential Projects
                </p>
                <p className="text-xs text-gray-600">
                  Civil · Steel · MEP · Interior · Design &amp; Build
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
