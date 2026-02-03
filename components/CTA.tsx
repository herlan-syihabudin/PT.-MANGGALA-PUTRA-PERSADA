export default function CTA() {
  return (
    <section className="relative py-28 bg-red-600 overflow-hidden">
      
      {/* GOLD ACCENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        
        {/* GOLD DIVIDER */}
        <div className="mx-auto mb-6 h-[3px] w-16 bg-gold rounded-full" />

        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Ready to Discuss Your Project?
        </h2>

        <p className="mt-6 text-lg text-red-100 max-w-2xl mx-auto leading-relaxed">
          PT Manggala Putra Persada supports industrial, commercial, and
          residential projects through structured engineering planning,
          disciplined execution, and accountable construction delivery.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          
          {/* PRIMARY CTA */}
          <a
            href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Schedule Project Consultation
          </a>

          {/* SECONDARY CTA (GOLD ACCENT) */}
          <a
            href="/kontak"
            className="inline-flex items-center justify-center border-2 border-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-gold/10 transition"
          >
            Request Quotation
          </a>
        </div>
      </div>
    </section>
  )
}
