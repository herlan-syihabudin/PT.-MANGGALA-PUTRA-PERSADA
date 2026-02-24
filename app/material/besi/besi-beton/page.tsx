import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Besi Beton Polos & Ulir SNI | Harga & Tabel Berat | MPP Engineering",
  description: "Supplier besi beton polos (BJTP) dan ulir (BJTS) standar SNI untuk proyek konstruksi. Tersedia diameter 6-32mm, panjang 12m, ready stock. Request harga & stok untuk pengiriman cepat.",
  keywords: "besi beton SNI, besi polos, besi ulir, tabel berat besi beton, harga besi beton, supplier besi beton jakarta",
  openGraph: {
    title: "Besi Beton Polos & Ulir SNI | MPP Engineering",
    description: "Lengkap dengan tabel berat dan spesifikasi teknis. Ready stock untuk proyek Anda.",
    images: ["/images/og-besi-beton.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi/besi-beton",
  },
}

export default function BesiBetonPage() {
  // Data untuk tabel
  const bjtpData = [
    { diameter: "Ø 6 mm", beratPerM: "0.222", beratPerBatang: "≈ 2.66 kg" },
    { diameter: "Ø 8 mm", beratPerM: "0.395", beratPerBatang: "≈ 4.74 kg" },
    { diameter: "Ø 10 mm", beratPerM: "0.617", beratPerBatang: "≈ 7.40 kg" },
    { diameter: "Ø 12 mm", beratPerM: "0.888", beratPerBatang: "≈ 10.66 kg" },
  ]

  const bjtsData = [
    { diameter: "Ø 10 mm", beratPerM: "0.617", beratPerBatang: "≈ 7.40 kg" },
    { diameter: "Ø 13 mm", beratPerM: "1.042", beratPerBatang: "≈ 12.50 kg" },
    { diameter: "Ø 16 mm", beratPerM: "1.578", beratPerBatang: "≈ 18.94 kg" },
    { diameter: "Ø 19 mm", beratPerM: "2.226", beratPerBatang: "≈ 26.71 kg" },
    { diameter: "Ø 22 mm", beratPerM: "2.984", beratPerBatang: "≈ 35.81 kg" },
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
          <span className="text-gray-900 font-medium">Besi Beton</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Besi Beton <span className="text-gold">Polos & Ulir (SNI)</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Besi beton adalah material utama dalam konstruksi beton bertulang
            untuk pondasi, kolom, balok, dan pelat lantai. Tersedia tipe
            <strong className="text-gray-900"> Polos (BJTP)</strong> dan 
            <strong className="text-gray-900"> Ulir (BJTS)</strong> sesuai
            standar SNI untuk kebutuhan proyek dan retail.
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (Diameter umum)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Package size={16} />
            <span>Indent (2-3 minggu)</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm">
            <Truck size={16} />
            <span>Pengiriman Jabodetabek & Seluruh Indonesia</span>
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
          <Image
            src="/material/besi/besi-beton.jpg"
            alt="Besi Beton Polos dan Ulir SNI untuk proyek konstruksi"
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
              Aplikasi Besi Beton
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Pondasi bangunan & sloof",
                "Kolom dan balok beton bertulang",
                "Pelat lantai dan struktur gedung",
                "Proyek perumahan, gedung, & industri",
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
                "Tipe: BJTP (Polos) & BJTS (Ulir)",
                "Standar: SNI 2052:2017",
                "Panjang standar: 12 Meter",
                "Supply: Proyek & Retail",
                "Ready Stock / Indent",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== TABLE BJTP ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Tabel Berat Besi Beton Polos (BJTP)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Diameter</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bjtpData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{row.diameter}</td>
                    <td className="px-4 py-3">{row.beratPerM}</td>
                    <td className="px-4 py-3">{row.beratPerBatang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== TABLE BJTS ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Tabel Berat Besi Beton Ulir (BJTS)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Diameter</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bjtsData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{row.diameter}</td>
                    <td className="px-4 py-3">{row.beratPerM}</td>
                    <td className="px-4 py-3">{row.beratPerBatang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 bg-gold rounded-full" />
            * Berat bersifat estimasi dan mengikuti standar SNI serta toleransi pabrik.
          </p>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Material Terkait
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Besi H-Beam", slug: "h-beam", desc: "Struktur utama bangunan industri" },
              { name: "Besi WF", slug: "wf", desc: "Kolom dan balok struktur" },
              { name: "Besi UNP", slug: "unp", desc: "Secondary structure & rangka" },
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
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20penawaran%20Besi%20Beton%20(SNI)%20–%20diameter,%20qty,%20dan%20lokasi%20kirim."
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
            href="/material/besi"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition flex-1"
          >
            ← Kembali ke Daftar Material
          </Link>
        </div>

        {/* ===== SCHEMA MARKUP (Product) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Besi Beton Polos & Ulir SNI",
              "description": "Besi beton polos (BJTP) dan ulir (BJTS) standar SNI untuk konstruksi beton bertulang.",
              "image": "https://mppindo.com/material/besi/besi-beton.jpg",
              "brand": {
                "@type": "Brand",
                "name": "SNI"
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
