import Link from "next/link"

export default function Partners() {
  const partners = [
    {
      title: "Structural Steel & Construction Materials",
      desc: "Supply of structural steel materials such as rebar, WF / H-Beam, plates, and supporting construction materials for industrial and residential projects.",
      waText:
        "Halo MPP, saya ingin request penawaran material struktur baja (besi beton / WF / baja lainnya).",
    },
    {
      title: "Electrical Panel & Power Systems",
      desc: "Panel maker and industrial electrical system supply to support MEP installations, power distribution, and operational facilities.",
      waText:
        "Halo MPP, saya ingin request penawaran panel listrik atau sistem kelistrikan.",
    },
    {
      title: "HVLS Fan & Industrial Ventilation Systems",
      desc: "Supply of HVLS fans and industrial ventilation systems to improve airflow efficiency and working comfort in factories and warehouses.",
      waText:
        "Halo MPP, saya ingin request penawaran sistem ventilasi atau HVLS fan.",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Material & Technology Supply
          </span>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Technology & Manufacturing Partners
          </h2>

          <p className="mt-5 text-lg text-gray-600">
            PT Manggala Putra Persada collaborates with selected manufacturers
            and system providers to supply engineering-grade materials and
            technologies, ensuring quality, technical reliability, and
            continuity of supply.
          </p>
        </div>

        {/* PARTNER CARDS */}
        <div className="grid md:grid-cols-3 gap-10">
          {partners.map((item, i) => (
            <div
              key={i}
              className="group border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed mb-6">
                {item.desc}
              </p>

              <Link
                href={`https://wa.me/6281297396612?text=${encodeURIComponent(
                  item.waText
                )}`}
                target="_blank"
                className="inline-flex font-semibold text-red-600 hover:underline"
              >
                Request Quotation →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
