import Link from "next/link"

export default function BesiPage() {
  const materials = [
    {
      title: "Besi WF / H-Beam",
      desc: "Digunakan untuk struktur utama bangunan industri, gudang, dan pabrik dengan kekuatan tinggi dan standar nasional.",
    },
    {
      title: "Besi IWF",
      desc: "Profil baja untuk kebutuhan struktur menengah hingga berat dengan efisiensi biaya dan kekuatan optimal.",
    },
    {
      title: "Besi UNP & CNP",
      desc: "Digunakan untuk rangka atap, secondary structure, dan konstruksi ringan hingga menengah.",
    },
    {
      title: "Besi Beton (Polos & Ulir)",
      desc: "Material utama pengecoran beton bertulang untuk pondasi, kolom, balok, dan struktur sipil.",
    },
    {
      title: "Plat Baja",
      desc: "Plat baja hitam dan galvanis untuk kebutuhan fabrikasi, base plate, dan komponen struktural.",
    },
    {
      title: "Pipa Baja",
      desc: "Pipa baja untuk struktur, mechanical support, dan kebutuhan industri lainnya.",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">
          Material <span className="text-red-600">Besi & Baja</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-14">
          Kami menyediakan berbagai jenis material besi dan baja untuk kebutuhan
          proyek konstruksi industri, gudang, dan perumahan dengan kualitas
          terjamin dan dukungan suplai yang andal.
        </p>

        {/* GRID CARD */}
        <div className="grid md:grid-cols-3 gap-8">
          {materials.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              {/* CTA */}
              <a
                href={`https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20konsultasi%20terkait%20material%20${encodeURIComponent(
                  item.title
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Inquiry via WhatsApp
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
