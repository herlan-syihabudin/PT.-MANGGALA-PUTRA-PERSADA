import { notFound } from "next/navigation"
import Link from "next/link"

/**
 * Mapping sementara
 * NANTI BISA DIGANTI DATA DB / CMS
 */
const MATERIALS: Record<string, any> = {
  "iwf": {
    title: "Besi WF / IWF",
    desc: "Profil baja WF (Wide Flange) digunakan untuk struktur utama bangunan industri, gudang, dan konstruksi berat.",
  },
  "unp-cnp": {
    title: "Besi UNP & CNP",
    desc: "Besi UNP dan CNP digunakan sebagai rangka atap, secondary structure, dan konstruksi baja ringan hingga menengah.",
  },
  "besi-beton": {
    title: "Besi Beton",
    desc: "Besi beton polos dan ulir untuk pekerjaan beton bertulang seperti pondasi, kolom, dan balok struktural.",
  },
  "plat-baja": {
    title: "Plat Baja",
    desc: "Plat baja hitam dan galvanis untuk base plate, fabrikasi, dan kebutuhan industri.",
  },
  "pipa-baja": {
    title: "Pipa Baja",
    desc: "Pipa baja hitam dan galvanis untuk struktur, mechanical support, dan instalasi industri.",
  },
}

export default function MaterialDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  // KHUSUS H-BEAM → redirect ke halaman detail asli
  if (params.slug === "h-beam") {
    return notFound()
  }

  const material = MATERIALS[params.slug]

  if (!material) return notFound()

  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* TITLE */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          {material.title}
        </h1>

        <p className="text-lg text-gray-600 mb-10">
          {material.desc}
        </p>

        {/* PLACEHOLDER INFO */}
        <div className="border border-gray-200 rounded-2xl p-8 mb-12 bg-gray-50">
          <p className="text-gray-700 leading-relaxed">
            Halaman detail untuk <strong>{material.title}</strong> sedang dalam
            tahap pengembangan. Saat ini kami melayani permintaan harga,
            spesifikasi teknis, dan ketersediaan stok melalui WhatsApp.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href={`https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20penawaran%20material%20${encodeURIComponent(
              material.title
            )}`}
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-red-700 transition"
          >
            Request Price & Stock
          </a>

          <Link
            href="/material/besi"
            className="border border-gray-300 px-8 py-4 rounded-xl font-semibold text-center hover:bg-gray-100 transition"
          >
            Kembali ke Daftar Material
          </Link>
        </div>

      </div>
    </section>
  )
}
