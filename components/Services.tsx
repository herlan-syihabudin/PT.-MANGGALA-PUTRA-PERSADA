import Image from "next/image"

export default function Services() {
  const services = [
    {
      title: "Civil & Structural Construction",
      desc: "Pelaksanaan pekerjaan konstruksi sipil dan struktur dengan pendekatan engineering yang mengutamakan kekuatan struktur, stabilitas bangunan, kepatuhan spesifikasi teknis, serta standar keselamatan kerja.",
      image: "/images/services/civil.jpg",
    },
    {
      title: "Steel Structure Engineering",
      desc: "Fabrikasi dan erection struktur baja untuk proyek industri dan komersial dengan perhitungan teknik akurat, presisi tinggi, serta sistem pengendalian mutu terukur.",
      image: "/images/services/steel.jpg",
    },
    {
      title: "MEP Systems Integration",
      desc: "Perencanaan dan implementasi sistem Mechanical, Electrical, dan Plumbing yang terintegrasi untuk memastikan efisiensi operasional, keandalan sistem, dan keberlanjutan bangunan.",
      image: "/images/services/mep.jpg",
    },
    {
      title: "Interior & Architectural Finishing",
      desc: "Pekerjaan interior dan finishing arsitektural dengan fokus pada fungsi ruang, kualitas material, estetika profesional, serta ketepatan detail pelaksanaan.",
      image: "/images/services/interior.jpg",
    },
    {
      title: "Design & Build Solutions",
      desc: "Solusi terintegrasi dari tahap perencanaan hingga pelaksanaan konstruksi untuk memastikan koordinasi yang efisien, kontrol waktu, serta kepastian hasil proyek.",
      image: "/images/services/renovation.jpg",
    },
    {
      title: "Project Management & Control",
      desc: "Pengelolaan proyek secara sistematis mencakup pengendalian biaya, mutu, jadwal, serta keselamatan kerja untuk menjamin pencapaian target proyek secara konsisten.",
      image: "/images/services/management.jpg",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 text-sm font-semibold text-gold-dark bg-gold/15 rounded-full">
            Engineering Capabilities
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Structured Engineering Services
            <span className="block mt-3 w-20 h-1 bg-gold rounded-full" />
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            Kami menyediakan layanan konstruksi dan engineering melalui
            perencanaan terstruktur, koordinasi teknis yang disiplin,
            serta eksekusi lapangan yang terukur dan bertanggung jawab.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, i) => (
            <div
              key={i}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition hover:shadow-xl hover:border-gold/50"
            >
              {/* IMAGE */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
              </div>

              {/* CONTENT */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {service.desc}
                </p>

                {/* GOLD LINE */}
                <div className="w-10 h-0.5 bg-gold rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
