import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Besi H-Beam SNI | Harga & Tabel Berat | Supplier Baja Industri | MPP Engineering",
  description: "Supplier besi H-Beam standar SNI & JIS untuk struktur industri, gudang, dan pabrik. Tersedia ukuran 100-400, panjang 12m, ready stock. Request harga & stok untuk proyek Anda.",
  keywords: "besi H-Beam, H-Beam SNI, baja struktural, kolom baja, balok baja, supplier H-Beam, H-Beam 200, H-Beam 250",
  openGraph: {
    title: "Besi H-Beam SNI | MPP Engineering",
    description: "Material baja struktural utama untuk bangunan industri. Tabel berat lengkap.",
    images: ["/images/og-hbeam.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi/h-beam",
  },
}

export default function HBeamPage() {
  // Data tabel lebih lengkap
  const hbeamData = [
    { ukuran: "H 100 x 100", webFlange: "6 / 8", beratPerM: "17.2", beratPerBatang: "≈ 206 kg" },
    { ukuran: "H 125 x 125", webFlange: "6.5 / 9", beratPerM: "23.8", beratPerBatang: "≈ 286 kg" },
    { ukuran: "H 150 x 150", webFlange: "7 / 10", beratPerM: "31.5", beratPerBatang: "≈ 378 kg" },
    { ukuran: "H 200 x 200", webFlange: "8 / 12", beratPerM: "49.9", beratPerBatang: "≈ 599 kg" },
    { ukuran: "H 250 x 250", webFlange: "9 / 14", beratPerM: "72.4", beratPerBatang: "≈ 869 kg" },
    { ukuran: "H 300 x 300", webFlange: "10 / 15", beratPerM: "94.0", beratPerBatang: "≈ 1.128 kg" },
    { ukuran: "H 350 x 350", webFlange: "12 / 19", beratPerM: "137.0", beratPerBatang: "≈ 1.644 kg" },
    { ukuran: "H 400 x 400", webFlange: "13 / 21", beratPerM: "172.0", beratPerBatang: "≈ 2.064 kg" },
  ]

  const waBase = "https://wa.me/6281297396612?text="

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
          <span className="text-gray-900 font-medium">H-Beam</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Besi <span className="text-gold">H-Beam</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Besi H-Beam adalah material baja struktural utama untuk bangunan industri,
            gudang, pabrik, dan konstruksi berat. Digunakan sebagai kolom dan balok
            dengan kapasitas beban tinggi serta standar nasional (SNI & JIS).
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (Ukuran 200-300)</span>
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
            src="/material/besi/hbeam.jpg"
            alt="Besi H-Beam standar SNI untuk struktur bangunan industri dan gudang"
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
              Aplikasi Besi H-Beam
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Struktur utama bangunan industri & pabrik",
                "Kolom dan balok baja",
                "Gudang, hanggar, dan workshop",
                "Jembatan dan struktur berat",
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
                "Standar: SNI / JIS G 3101",
                "Material: Baja struktural karbon (SS400)",
                "Panjang: 12 Meter (custom available)",
                "Surface: Mill finish / painted",
                "Supply: Proyek & non-proyek",
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
            Tabel Berat Besi H-Beam (Estimasi)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ukuran</th>
                  <th className="px-4 py-3 text-left font-semibold">Tebal (Web / Flange)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hbeamData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.webFlange}</td>
                    <td className="px-4 py-3">{row.beratPerM}</td>
                    <td className="px-4 py-3">{row.beratPerBatang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <span className="w-1 h-1 bg-gold rounded-full" />
            * Berat bersifat estimasi dan dapat berbeda tergantung standar pabrik serta toleransi produksi.
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
              { name: "Besi WF", slug: "wf", desc: "Kolom dan balok struktur" },
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
            href={`${waBase}${encodeURIComponent(
              "Halo PT Manggala Putra Persada, saya ingin request harga & stok Besi H-Beam. Ukuran: ______, Qty: ______, Lokasi Kirim: ______."
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
              "name": "Besi H-Beam SNI",
              "description": "Besi H-Beam standar SNI & JIS untuk struktur bangunan industri, gudang, dan pabrik.",
              "image": "https://mppindo.com/material/besi/hbeam.jpg",
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
