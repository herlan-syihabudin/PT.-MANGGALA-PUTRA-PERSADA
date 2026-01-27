import Image from "next/image"

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
            Engineering & Integrated Construction Solutions
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

          {/* DESCRIPTION – HYBRID SEO */}
          <p className="mt-6 text-base text-gray-600 max-w-xl leading-relaxed">
            PT Manggala Putra Persada is an engineering and construction company
            in Indonesia providing integrated civil, steel structure, and MEP
            solutions with a structured approach to ensure quality, safety,
            cost efficiency, and on-time project delivery.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg shadow-red-600/20"
            >
              Project Consultation
            </a>

            <a
              href="/projects"
              className="inline-flex items-center justify-center border border-gray-300 px-8 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              View Portfolio
            </a>
          </div>

          {/* TRUST INDICATOR */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md text-sm">
            <div>
              <p className="font-bold text-gray-900">Engineering-Led</p>
              <p className="text-gray-600">Technical Approach</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Integrated</p>
              <p className="text-gray-600">Cost &amp; Schedule Control</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Accountable</p>
              <p className="text-gray-600">Quality &amp; HSE</p>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hidden md:flex justify-end">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-xl shadow-black/10 ring-1 ring-black/5">
            <Image
              src="/images/hero-project.jpg"
              alt="PT Manggala Putra Persada Engineering Project Indonesia"
              fill
              priority
              className="object-cover grayscale-[45%] brightness-95 contrast-95"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full bg-white/90 backdrop-blur px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  Industrial &amp; Residential Projects
                </p>
                <p className="text-xs text-gray-600">
                  Civil · Steel Structure · MEP · Fit Out · Design &amp; Build
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
