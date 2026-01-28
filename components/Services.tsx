import Image from "next/image"

export default function Services() {
  const services = [
    {
      title: "Civil & Structural Construction",
      desc: "Pelaksanaan pekerjaan konstruksi sipil dan struktur dengan pendekatan engineering yang mengutamakan kekuatan struktur, stabilitas bangunan, serta kesesuaian terhadap spesifikasi teknis dan standar keselamatan kerja.",
      image: "/images/services/civil.jpg",
    },
    {
      title: "Steel Structure Engineering",
      desc: "Fabrikasi dan erection struktur baja untuk kebutuhan industri dan komersial dengan perhitungan teknik yang akurat, presisi pelaksanaan tinggi, serta pengendalian mutu yang ketat.",
      image: "/images/services/steel.jpg",
    },
    {
      title: "MEP Systems Integration",
      desc: "Perencanaan dan pelaksanaan sistem Mechanical, Electrical, dan Plumbing yang terintegrasi untuk mendukung performa bangunan secara optimal, efisien, dan berkelanjutan.",
      image: "/images/services/mep.jpg",
    },
    {
      title: "Interior & Architectural Finishing",
      desc: "Pekerjaan interior dan finishing dengan perhatian tinggi terhadap detail, fungsi ruang, dan kualitas hasil akhir, disesuaikan dengan karakter serta kebutuhan proyek.",
      image: "/images/services/interior.jpg",
    },
    {
      title: "Design & Build Solutions",
      desc: "Solusi terpadu dari tahap perencanaan hingga pelaksanaan konstruksi untuk memastikan koordinasi yang efisien, pengendalian waktu, serta pencapaian target proyek.",
      image: "/images/services/renovation.jpg",
    },
    {
      title: "Project Management & Control",
      desc: "Pengelolaan proyek secara sistematis meliputi pengendalian biaya, mutu, jadwal, serta aspek keselamatan kerja untuk memastikan proyek berjalan sesuai rencana dan komitmen.",
      image: "/images/services/management.jpg",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Engineering Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            A Structured Engineering Approach for Every Project
          </h2>
          <p className="mt-5 text-lg text-gray-600">
            We deliver construction and engineering services through disciplined
            planning, precise execution, and consistent quality control.
          </p>
        </div>

        {/* SERVICES GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, i) => (
            <div
              key={i}
              className="group border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-xl transition"
            >
              {/* IMAGE */}
              <div className="relative h-48 w-full">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
