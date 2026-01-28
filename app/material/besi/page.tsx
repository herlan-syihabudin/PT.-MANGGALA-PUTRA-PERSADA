import Image from "next/image"
import Link from "next/link"

/* =====================
   SEO METADATA
===================== */
export const metadata = {
  title:
    "Supplier Besi & Baja Proyek – H-Beam, WF, UNP, Plat & Pipa | PT Manggala Putra Persada",
  description:
    "Supplier material besi dan baja untuk proyek industri, gudang, dan konstruksi. Menyediakan H-Beam, WF / IWF, UNP, Besi Beton, Plat Baja, dan Pipa Baja standar SNI & JIS. Ready stock dan pengiriman cepat untuk kebutuhan purchasing.",
}

export default function BesiPage() {
  const materials = [
    {
      title: "Besi H-Beam",
      slug: "h-beam",
      image: "/material/besi/hbeam.jpg",
      desc: "Besi H-Beam standar SNI untuk struktur utama bangunan industri, gudang, pabrik, dan konstruksi berat.",
    },
    {
      title: "Besi WF / IWF",
      slug: "wf",
      image: "/material/besi/wf.jpg",
      desc: "Profil baja WF / IWF standar SNI untuk kolom dan balok bangunan industri, gudang, dan proyek konstruksi menengah hingga besar.",
    },
    {
      title: "Besi UNP",
      slug: "unp",
      image: "/material/besi/unp.jpg",
      desc: "Profil baja UNP (U-Channel) untuk secondary structure, rangka atap, dudukan mesin, dan penguat struktur.",
    },
    {
      title: "Besi Beton (Polos & Ulir)",
      slug: "besi-beton",
      image: "/material/besi/besi-beton.jpg",
      desc: "Besi beton polos dan ulir standar SNI untuk pondasi, kolom, balok, dan struktur beton bertulang.",
    },
    {
      title: "Plat Baja",
      slug: "plat-baja",
      image: "/material/besi/plat-baja.jpg",
      desc: "Plat baja hitam dan galvanis untuk fabrikasi, base plate, tangki, dan kebutuhan industri.",
    },
    {
      title: "Pipa Baja",
      slug: "pipa-baja",
      image: "/material/besi/pipa-baja.jpg",
      desc: "Pipa baja hitam dan galvanis untuk struktur, mechanical support, dan instalasi industri.",
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
          PT Manggala Putra Persada merupakan supplier material besi dan baja
          untuk kebutuhan proyek industri, gudang, pabrik, dan konstruksi.
          Menyediakan spesifikasi jelas, standar nasional, serta respon cepat
          untuk tim purchasing dan estimator proyek.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-10">
          {materials.map((item) => (
            <div
              key={item.slug}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col"
            >
              {/* IMAGE */}
              <Link
                href={`/material/besi/${item.slug}`}
                className="relative h-56 block overflow-hidden"
              >
                <Image
                  src={item.image}
                  alt={`${item.title} standar SNI untuk proyek industri dan konstruksi`}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              </Link>

              {/* CONTENT */}
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h2>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.desc}
                  </p>

                  {/* TRUST POINT */}
                  <ul className="text-xs text-gray-500 space-y-1 mb-5">
                    <li>✔ Standar SNI / JIS</li>
                    <li>✔ Supply Proyek & Retail</li>
                    <li>✔ Ready Stock / Indent</li>
                    <li>✔ Fast Response Purchasing</li>
                  </ul>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
                  <Link
                    href={`/material/besi/${item.slug}`}
                    className="text-center border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
                  >
                    Lihat Spesifikasi
                  </Link>

                  <a
                    href={`https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20penawaran%20${encodeURIComponent(
                      item.title
                    )}%20(ukuran,%20qty,%20lokasi%20kirim).`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-center bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
                  >
                    Request Harga & Stok
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SEO TEXT BLOCK */}
        <div className="mt-20 max-w-4xl text-gray-600 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Supplier Material Besi & Baja untuk Proyek Industri
          </h2>
          <p>
            Kami menyediakan material besi dan baja seperti H-Beam, WF / IWF,
            UNP, besi beton, plat baja, dan pipa baja untuk kebutuhan proyek
            gudang, pabrik, workshop, dan konstruksi industri di seluruh
            Indonesia. Seluruh material tersedia dengan spesifikasi jelas,
            standar SNI/JIS, serta dukungan cepat untuk kebutuhan purchasing
            dan pengiriman proyek.
          </p>

          <p className="mt-4">
            Lihat detail produk:
            <Link href="/material/besi/h-beam" className="text-red-600 ml-1">H-Beam</Link>,
            <Link href="/material/besi/wf" className="text-red-600 ml-1">WF</Link>,
            <Link href="/material/besi/unp" className="text-red-600 ml-1">UNP</Link>,
            <Link href="/material/besi/besi-beton" className="text-red-600 ml-1">Besi Beton</Link>,
            <Link href="/material/besi/plat-baja" className="text-red-600 ml-1">Plat Baja</Link>,
            <Link href="/material/besi/pipa-baja" className="text-red-600 ml-1">Pipa Baja</Link>
          </p>
        </div>

      </div>
    </section>
  )
}
