export default function CTA() {
  return (
    <section className="py-24 bg-red-600">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
          Ready to Discuss Your Project?
        </h2>

        <p className="mt-5 text-lg text-red-100 max-w-2xl mx-auto">
          PT Manggala Putra Persada is ready to support your project
          through a structured engineering approach, measurable execution,
          and reliable construction solutions tailored to your needs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Schedule Project Consultation
          </a>

          <a
            href="/contact"
            className="inline-flex items-center justify-center border border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Request Quotation
          </a>
        </div>
      </div>
    </section>
  )
}
