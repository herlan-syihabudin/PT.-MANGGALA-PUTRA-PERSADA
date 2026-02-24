import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone } from "lucide-react"
import type { Metadata } from "next"

/* =====================
   SEO METADATA
===================== */
export const metadata: Metadata = {
  title: "Supplier Besi & Baja Proyek – H-Beam, WF, UNP, Plat & Pipa | PT Manggala Putra Persada",
  description: "Supplier material besi dan baja untuk proyek industri, gudang, dan konstruksi. Menyediakan H-Beam, WF / IWF, UNP, Besi Beton, Plat Baja, dan Pipa Baja standar SNI & JIS. Ready stock dan pengiriman cepat.",
  keywords: "supplier besi baja, H-Beam, WF beam, UNP channel, besi beton SNI, plat baja, pipa baja, material konstruksi",
  openGraph: {
    title: "Supplier Besi & Baja Proyek | MPP Engineering",
    description: "Material besi dan baja standar SNI untuk proyek industri dan konstruksi.",
    images: ["/images/og-besi.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi",
  },
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

        {/* ===== BREADCRUMB ===== */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <Link href="/material" className="hover:text-gold transition">Material</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">Besi & Baja</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-12">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Supplier <span className="text-gold">Besi & Baja</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            PT Manggala Putra Persada merupakan supplier material besi dan baja
            untuk kebutuhan proyek industri, gudang, pabrik, dan konstruksi.
            Menyediakan spesifikasi jelas, standar nasional, serta respon cepat
            untuk tim purchasing dan estimator proyek.
          </p>
        </div>

        {/* ===== GRID ===== */}
        <div className="grid md:grid-cols-3 gap-8">
          {materials.map((item) => (
            <div
              key={item.slug}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col"
            >
              {/* IMAGE */}
              <Link
                href={`/material/besi/${item.slug}`}
                className="relative h-56 block overflow-hidden bg-gray-100"
              >
                <Image
                  src={item.image}
                  alt={`${item.title} standar SNI untuk proyek industri dan konstruksi`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
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
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gold rounded-full" />
                      Standar SNI / JIS
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gold rounded-full" />
                      Supply Proyek & Retail
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gold rounded-full" />
                      Ready Stock / Indent
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gold rounded-full" />
                      Fast Response Purchasing
                    </li>
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
                    className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold 
                      hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2
                      shadow-lg shadow-red-600/20 hover:shadow-xl"
                  >
                    <Phone size={16} />
                    Request Harga & Stok
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== SEO TEXT BLOCK ===== */}
        <div className="mt-20 max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Supplier Material Besi & Baja untuk Proyek Industri
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            Kami menyediakan material besi dan baja seperti H-Beam, WF / IWF,
            UNP, besi beton, plat baja, dan pipa baja untuk kebutuhan proyek
            gudang, pabrik, workshop, dan konstruksi industri di seluruh
            Indonesia. Seluruh material tersedia dengan spesifikasi jelas,
            standar SNI/JIS, serta dukungan cepat untuk kebutuhan purchasing
            dan pengiriman proyek.
          </p>

          <p className="mt-4 text-gray-600">
            Lihat detail produk:
            <Link href="/material/besi/h-beam" className="text-gold hover:underline ml-1">H-Beam</Link>,
            <Link href="/material/besi/wf" className="text-gold hover:underline ml-1">WF</Link>,
            <Link href="/material/besi/unp" className="text-gold hover:underline ml-1">UNP</Link>,
            <Link href="/material/besi/besi-beton" className="text-gold hover:underline ml-1">Besi Beton</Link>,
            <Link href="/material/besi/plat-baja" className="text-gold hover:underline ml-1">Plat Baja</Link>,
            <Link href="/material/besi/pipa-baja" className="text-gold hover:underline ml-1">Pipa Baja</Link>
          </p>
        </div>

        {/* ===== SCHEMA MARKUP (ItemList) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Material Besi & Baja",
              "description": "Daftar material besi dan baja untuk proyek konstruksi",
              "numberOfItems": materials.length,
              "itemListElement": materials.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://mppindo.com/material/besi/${item.slug}`,
                "name": item.title,
                "image": item.image,
              }))
            })
          }}
        />

      </div>
    </section>
  )
}
