import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle, Ruler, Gauge } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Besi UNP (U-Channel) | Harga & Tabel Berat | Supplier Baja | MPP Engineering",
  description: "Supplier besi UNP (U-Channel) untuk secondary structure, rangka atap, purlin, dan support struktur. Tersedia ukuran 50-200, panjang 6m & 12m, SNI/JIS. Request harga & stok.",
  keywords: "besi UNP, U-Channel, kanal U, profil UNP, secondary structure, rangka atap, gording, purlin, supplier UNP jakarta",
  openGraph: {
    title: "Besi UNP (U-Channel) | MPP Engineering",
    description: "Profil baja untuk secondary structure dan rangka. Tabel berat lengkap.",
    images: ["/images/og-unp.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi/unp",
  },
}

export default function UNPPage() {
  // Data tabel lebih lengkap (dengan dimensi)
  const unpData = [
    { ukuran: "UNP 50", h: 50, b: 38, tw: 4.5, tf: 7.0, beratPerM: "5.59", berat6m: "≈ 33.5 kg", berat12m: "≈ 67.0 kg" },
    { ukuran: "UNP 65", h: 65, b: 42, tw: 4.8, tf: 7.5, beratPerM: "7.09", berat6m: "≈ 42.5 kg", berat12m: "≈ 85.1 kg" },
    { ukuran: "UNP 80", h: 80, b: 45, tw: 5.0, tf: 8.0, beratPerM: "8.64", berat6m: "≈ 51.8 kg", berat12m: "≈ 103.7 kg" },
    { ukuran: "UNP 100", h: 100, b: 50, tw: 5.5, tf: 8.5, beratPerM: "10.6", berat6m: "≈ 63.6 kg", berat12m: "≈ 127.2 kg" },
    { ukuran: "UNP 120", h: 120, b: 55, tw: 6.0, tf: 9.0, beratPerM: "13.4", berat6m: "≈ 80.4 kg", berat12m: "≈ 160.8 kg" },
    { ukuran: "UNP 140", h: 140, b: 60, tw: 6.5, tf: 9.5, beratPerM: "16.4", berat6m: "≈ 98.4 kg", berat12m: "≈ 196.8 kg" },
    { ukuran: "UNP 150", h: 150, b: 65, tw: 7.0, tf: 10.0, beratPerM: "18.6", berat6m: "≈ 111.6 kg", berat12m: "≈ 223.2 kg" },
    { ukuran: "UNP 160", h: 160, b: 65, tw: 7.5, tf: 10.5, beratPerM: "21.2", berat6m: "≈ 127.2 kg", berat12m: "≈ 254.4 kg" },
    { ukuran: "UNP 180", h: 180, b: 70, tw: 8.0, tf: 11.0, beratPerM: "24.5", berat6m: "≈ 147.0 kg", berat12m: "≈ 294.0 kg" },
    { ukuran: "UNP 200", h: 200, b: 75, tw: 8.5, tf: 11.5, beratPerM: "28.2", berat6m: "≈ 169.2 kg", berat12m: "≈ 338.4 kg" },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* ===== BREADCRUMB ===== */}
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <Link href="/material" className="hover:text-gold transition">Material</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <Link href="/material/besi" className="hover:text-gold transition">Besi & Baja</Link>
          <ChevronRight size={14} className="inline mx-2" />
          <span className="text-gray-900 font-medium">UNP (U-Channel)</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Besi <span className="text-gold">UNP (U-Channel)</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Besi UNP (U-Channel) merupakan profil baja yang umum digunakan
            sebagai secondary structure, rangka atap, dudukan, dan penguat
            struktur pada konstruksi industri maupun komersial.
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (UNP 50 - 150)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Package size={16} />
            <span>Indent (UNP 160 - 200)</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm">
            <Truck size={16} />
            <span>Pengiriman Seluruh Indonesia</span>
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
          <Image
            src="/material/besi/unp.jpg"
            alt="Besi UNP (U-Channel) untuk secondary structure dan rangka atap"
            width={1200}
            height={360}
            className="w-full h-[360px] object-cover"
            priority
          />
        </div>

        {/* ===== INFO GRID ===== */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full" />
              Kegunaan Besi UNP
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Rangka atap dan secondary structure",
                "Dudukan mesin & support struktur",
                "Balok pengaku dan penguat rangka",
                "Konstruksi gudang & workshop",
                "Purlin dan gording atap",
                "Frame mesin dan conveyor",
                "Support pipa dan cable tray",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full" />
              Spesifikasi Umum
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Standar: JIS G3101 (SS400) / SNI",
                "Material: Baja struktural karbon",
                "Panjang: 6 Meter & 12 Meter",
                "Surface: Mill finish",
                "Toleransi: Sesuai standar JIS",
                "Supply: Proyek & Retail",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== WEIGHT TABLE ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Tabel Berat Besi UNP
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ukuran UNP</th>
                  <th className="px-4 py-3 text-left font-semibold">h x b (mm)</th>
                  <th className="px-4 py-3 text-left font-semibold">tw / tf (mm)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Batang 6m</th>
                  <th className="px-4 py-3 text-left font-semibold">Batang 12m</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {unpData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition even:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.h} x {row.b}</td>
                    <td className="px-4 py-3">{row.tw} / {row.tf}</td>
                    <td className="px-4 py-3">{row.beratPerM}</td>
                    <td className="px-4 py-3">{row.berat6m}</td>
                    <td className="px-4 py-3">{row.berat12m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 bg-gold rounded-full" />
            * Berat bersifat estimasi, tergantung standar pabrik & toleransi produksi.
          </p>
        </div>

        {/* ===== TECHNICAL INFO ===== */}
        <div className="mb-16 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Gauge size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Info Teknis</h3>
              <p className="text-sm text-gray-700">
                Besi UNP (U-Channel) memiliki kekuatan yang baik untuk aplikasi secondary structure.
                Profil ini lebih ringan dari WF/H-Beam namun cukup kaku untuk purlin, gording,
                dan support struktur. Tersedia dalam dua panjang (6m dan 12m) untuk fleksibilitas proyek.
              </p>
            </div>
          </div>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Material Terkait
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Besi WF", slug: "wf", desc: "Balok dan kolom struktur utama" },
              { name: "Besi H-Beam", slug: "h-beam", desc: "Struktur utama bangunan industri" },
              { name: "Pipa Baja", slug: "pipa-baja", desc: "Struktur & mechanical support" },
            ].map((item) => (
              <Link
                key={item.slug}
                href={`/material/besi/${item.slug}`}
                className="group border border-gray-200 rounded-xl p-6 hover:border-gold/30 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-gold transition">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20request%20harga%20dan%20stok%20Besi%20UNP.%0AUkuran:%20______,%0APanjang:%20______%20(6m%20/%2012m),%0AJumlah:%20______%20batang,%0ALokasi%20Kirim:%20______."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold 
              hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 
              hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group flex-1"
          >
            <Phone size={18} />
            Request Harga & Stok
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            href="/kontak"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex-1"
          >
            Konsultasi Teknis Proyek
          </Link>
        </div>

        {/* ===== SCHEMA MARKUP (Product) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Besi UNP (U-Channel)",
              "description": "Profil baja UNP untuk secondary structure, rangka atap, dan support struktur.",
              "image": "https://mppindo.com/material/besi/unp.jpg",
              "brand": {
                "@type": "Brand",
                "name": "JIS / SNI"
              },
              "offers": {
                "@type": "Offer",
                "availability": "https://schema.org/InStock",
                "priceSpecification": {
                  "@type": "PriceSpecification",
                  "priceCurrency": "IDR"
                }
              }
            })
          }}
        />

      </div>
    </section>
  )
}
