import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle, Ruler } from "lucide-react"
import type { Metadata } from "next"

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281229222463"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mppindo.com"

export const metadata: Metadata = {
  title: "Besi WF / IWF SNI | Harga & Tabel Berat | Supplier Baja Struktural | MPP Engineering",
  description: "Supplier besi WF (Wide Flange) standar SNI & JIS untuk struktur gudang, pabrik, dan bangunan industri. Tersedia ukuran 100-500, panjang 12m, ready stock. Request harga & stok untuk proyek Anda.",
  keywords: "besi WF, IWF, baja struktural, balok baja, kolom baja, supplier WF, WF 200, WF 250, WF 300, WF 400, konstruksi baja",
  openGraph: {
  title: "Besi WF / IWF SNI | MPP Engineering",
  description: "Profil baja struktural untuk kolom dan balok industri. Tabel berat lengkap.",
  url: `${SITE_URL}/material/besi/wf`,
  images: [`${SITE_URL}/images/og-wf.jpg`],
},
  alternates: {
    canonical: `${SITE_URL}/material/besi/wf`,
  },
}

export default function WFPage() {
  // Data tabel lebih lengkap
  const wfData = [
    { ukuran: "WF 100 x 50", tebal: "5 / 7", beratPerM: "9.3", beratPerBatang: "≈ 112 kg" },
    { ukuran: "WF 125 x 60", tebal: "6 / 8", beratPerM: "13.4", beratPerBatang: "≈ 161 kg" },
    { ukuran: "WF 150 x 75", tebal: "7 / 10", beratPerM: "14.0", beratPerBatang: "≈ 168 kg" },
    { ukuran: "WF 175 x 90", tebal: "7 / 11", beratPerM: "18.2", beratPerBatang: "≈ 218 kg" },
    { ukuran: "WF 200 x 100", tebal: "8 / 12", beratPerM: "21.3", beratPerBatang: "≈ 256 kg" },
    { ukuran: "WF 250 x 125", tebal: "9 / 14", beratPerM: "29.6", beratPerBatang: "≈ 355 kg" },
    { ukuran: "WF 300 x 150", tebal: "10 / 15", beratPerM: "36.7", beratPerBatang: "≈ 440 kg" },
    { ukuran: "WF 350 x 175", tebal: "12 / 19", beratPerM: "49.6", beratPerBatang: "≈ 595 kg" },
    { ukuran: "WF 400 x 200", tebal: "13 / 21", beratPerM: "66.0", beratPerBatang: "≈ 792 kg" },
    { ukuran: "WF 450 x 200", tebal: "14 / 23", beratPerM: "76.0", beratPerBatang: "≈ 912 kg" },
    { ukuran: "WF 500 x 200", tebal: "16 / 25", beratPerM: "89.6", beratPerBatang: "≈ 1.075 kg" },
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
          <span className="text-gray-900 font-medium">WF / IWF</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Besi <span className="text-gold">WF / IWF</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Besi WF (Wide Flange) merupakan profil baja struktural yang
            digunakan untuk kolom dan balok bangunan industri, gudang, pabrik,
            serta konstruksi menengah hingga berat dengan efisiensi struktur
            dan daya dukung tinggi.
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (Ukuran 150-300)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Package size={16} />
            <span>Indent (2-3 minggu)</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm">
            <Truck size={16} />
            <span>Pengiriman Seluruh Indonesia</span>
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
          <Image
            src="/material/besi/wf.jpg"
            alt="Besi WF / IWF standar SNI untuk struktur gudang dan pabrik"
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
              Kegunaan Besi WF
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Balok dan kolom struktur baja",
                "Gudang, pabrik, dan workshop",
                "Struktur mezzanine dan canopy",
                "Bangunan industri & komersial",
                "Struktur atap bentang lebar",
                "Jembatan dan infrastruktur",
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
                "Yield Strength: 245 MPa",
                "Tensile Strength: 400-510 MPa",
                "Panjang standar: 12 Meter",
                "Material: Baja struktural karbon",
                "Supply: Proyek & Non-Proyek",
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
            Tabel Berat Besi WF / IWF
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ukuran WF</th>
                  <th className="px-4 py-3 text-left font-semibold">Tebal (Web/Flange)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {wfData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition even:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.tebal}</td>
                    <td className="px-4 py-3">{row.beratPerM}</td>
                    <td className="px-4 py-3">{row.beratPerBatang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 bg-gold rounded-full" />
            * Berat bersifat estimasi, tergantung standar pabrik dan toleransi produksi.
          </p>
        </div>

        {/* ===== TECHNICAL INFO ===== */}
        <div className="mb-16 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Ruler size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Info Teknis</h3>
              <p className="text-sm text-gray-700">
                Besi WF memiliki rasio kekuatan-terhadap-berat yang optimal untuk aplikasi 
                struktur bentang lebar. Profil ini lebih efisien dibanding H-Beam untuk 
                aplikasi balok karena flange yang lebih lebar memberikan stabilitas lateral lebih baik.
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
              { name: "Besi H-Beam", slug: "h-beam", desc: "Struktur utama bangunan industri" },
              { name: "Besi UNP", slug: "unp", desc: "Secondary structure & rangka" },
              { name: "Besi Beton", slug: "besi-beton", desc: "Pondasi dan struktur beton" },
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
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Halo PT Manggala Putra Persada, saya ingin request harga dan stok Besi WF. Ukuran: ______, Qty: ______, Lokasi Kirim: ______."
)}`}
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
              "name": "Besi WF / IWF SNI",
              "description": "Besi WF (Wide Flange) standar SNI & JIS untuk struktur bangunan industri, gudang, dan pabrik.",
              "image": `${SITE_URL}/material/besi/wf.jpg`,
              "brand": {
                "@type": "Brand",
                "name": "SNI / JIS"
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
