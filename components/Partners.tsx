import Link from "next/link"

export default function Partners() {
  const partners = [
    {
      title: "Struktur Baja & Material Konstruksi",
      desc: "Mitra manufaktur baja struktural dan penyedia material konstruksi untuk mendukung kebutuhan proyek industri dan perumahan.",
      href: "/material/besi",
    },
    {
      title: "Sistem Panel & Kelistrikan",
      desc: "Panel maker dan penyedia sistem kelistrikan industri untuk mendukung instalasi MEP dan sistem distribusi daya.",
      href: "/material/panel",
    },
    {
      title: "HVLS & Sistem Ventilasi",
      desc: "Penyedia sistem HVLS fan dan solusi ventilasi industri untuk mendukung kenyamanan dan efisiensi sirkulasi udara pada fasilitas produksi dan gudang.",
      href: "/material/ventilasi",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* HEADER */}
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-6">
          Technology & Manufacturing Partners
        </h2>

        <p className="text-lg text-gray-600 max-w-3xl mb-14">
          Dalam pelaksanaan proyek, PT Manggala Putra Persada bekerja sama dengan
          berbagai manufaktur dan penyedia sistem untuk memastikan mutu material,
          keandalan teknis, serta kesinambungan pasokan proyek.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {partners.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="group border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6">
                {item.desc}
              </p>

              <span className="font-semibold text-red-600">
                View Details →
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
