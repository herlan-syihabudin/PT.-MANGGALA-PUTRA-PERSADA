import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">
      
      {/* BACKGROUND ACCENT */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[420px] h-[420px] bg-gray-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT CONTENT */}
        <div>
          {/* BADGE */}
          <span className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 text-sm font-semibold text-gold-dark bg-gold/15 rounded-full">
            Engineering & Integrated Construction Solutions
          </span>

          {/* ======================
              PRIMARY SEO H1
          ====================== */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900 max-w-xl">
            Engineering-Led Construction Contractor in Indonesia
            <span className="block mt-2 w-24 h-1 bg-gold rounded-full" />
          </h1>

          {/* SUB HEADLINE (SEO SUPPORT) */}
          <p className="mt-6 text-lg text-gray-700 font-medium max-w-xl">
            Steel Structure, Civil, MEP & Design-Build Services for Industrial Projects
          </p>

          {/* DESCRIPTION (AUTHORITY CONTENT) */}
          <p className="mt-6 text-base text-gray-600 max-w-xl leading-relaxed">
            PT Manggala Putra Persada (MPP Engineering) is an engineering-led
            construction contractor in Indonesia providing integrated civil,
            steel structure, MEP, and design & build solutions for industrial
            and commercial projects, delivered through structured planning,
            quality control, and disciplined execution.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/6281297396612"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
            >
              Project Consultation
            </a>

            <a
              href="/proyek"
              className="inline-flex items-center justify-center border border-gold text-gold-dark px-8 py-4 rounded-xl font-semibold hover:bg-gold/10 transition"
            >
              View Portfolio
            </a>
          </div>

          {/* TRUST INDICATOR */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md text-sm">
            <div>
              <p className="font-bold text-gray-900">Engineering-Led</p>
              <p className="text-gray-600">Technical Discipline</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Integrated</p>
              <p className="text-gray-600">Cost & Schedule Control</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Accountable</p>
              <p className="text-gray-600">Quality & HSE</p>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hidden md:flex justify-end">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-xl ring-1 ring-gold/40">
            <Image
              src="/images/hero-project.jpg"
              alt="Engineering-led construction project in Indonesia by PT Manggala Putra Persada"
              fill
              priority
              className="object-cover grayscale-[30%] brightness-100 contrast-95"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full bg-white/90 backdrop-blur px-5 py-4 border-t border-gold/40">
                <p className="text-sm font-semibold text-gray-900">
                  Industrial & Commercial Projects
                </p>
                <p className="text-xs text-gray-600">
                  Civil · Steel Structure · MEP · Fit Out · Design & Build
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
