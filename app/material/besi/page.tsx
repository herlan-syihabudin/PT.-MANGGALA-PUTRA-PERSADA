import Image from "next/image"
import Link from "next/link"

export default function BesiPage() {
  const materials = [
    {
      title: "Besi H-Beam",
      slug: "h-beam",
      image: "/material/besi/hbeam.jpg",
      desc: "Struktur utama bangunan industri, gudang, dan pabrik dengan kekuatan tinggi dan standar nasional.",
    },
    {
      title: "Besi IWF",
      slug: "iwf",
      image: "/material/besi/wf.jpg",
      desc: "Profil baja untuk struktur menengah hingga berat dengan efisiensi biaya dan presisi engineering.",
    },
    {
      title: "Besi UNP & CNP",
      slug: "unp",
      image: "/material/besi/unp.jpg",
      desc: "Material rangka atap dan secondary structure untuk konstruksi ringan hingga menengah.",
    },
    {
      title: "Besi Beton (Polos & Ulir)",
      slug: "besi-beton",
      image: "/material/besi/besi-beton.jpg",
      desc: "Material utama pengecoran beton bertulang untuk pondasi, kolom, dan balok struktural.",
    },
    {
      title: "Plat Baja",
      slug: "plat-baja",
      image: "/material/besi/plat-baja.jpg",
      desc: "Plat baja hitam & galvanis untuk fabrikasi, base plate, dan kebutuhan industri.",
    },
    {
      title: "Pipa Baja",
      slug: "pipa-baja",
      image: "/material/besi/pipa-baja.jpg",
      desc: "Pipa baja untuk struktur, mechanical support, dan instalasi industri.",
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
          Supplier <span className="text-red-600">Material Besi & Baja</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-14">
          Penyedia material besi dan baja untuk kebutuhan proyek industri,
          gudang, dan konstruksi dengan suplai terjamin, spesifikasi jelas,
          dan respon cepat untuk kebutuhan purchasing.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {materials.map((item) => (
            <div
              key={item.slug}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col"
            >
              {/* CLICKABLE IMAGE */}
              <Link href={`/material/besi/${item.slug}`} className="relative h-56 block overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              </Link>

              {/* CONTENT */}
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/material/besi/${item.slug}`}
                    className="text-center border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                  >
                    View Detail
                  </Link>

                  <a
                    href={`https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20penawaran%20material%20${encodeURIComponent(
                      item.title
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
                  >
                    Request Price & Stock
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
