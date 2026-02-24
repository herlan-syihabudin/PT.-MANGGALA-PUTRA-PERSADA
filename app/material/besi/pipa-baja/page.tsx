import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle, Flame, Droplets } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pipa Baja Hitam & Galvanis | Harga & Tabel Berat | Supplier | MPP Engineering",
  description: "Supplier pipa baja hitam dan galvanis untuk struktur, mechanical support, dan instalasi industri. Tersedia diameter 1/2-12 inch, schedule 40/80, panjang 6m, SNI/ASTM. Request harga & stok.",
  keywords: "pipa baja, pipa hitam, pipa galvanis, pipa schedule 40, pipa schedule 80, pipa struktur, supplier pipa baja jakarta",
  openGraph: {
    title: "Pipa Baja Hitam & Galvanis | MPP Engineering",
    description: "Lengkap dengan tabel berat dan spesifikasi teknis.",
    images: ["/images/og-pipa.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi/pipa-baja",
  },
}

export default function PipaBajaPage() {
  // Data tabel lebih lengkap (schedule 40)
  const pipaData = [
    { diameter: "1/2 Inch", inch: "0.5", tebal: "2.6 mm (SCH 40)", beratPerM: "1.27", beratPerBatang: "≈ 7.6 kg" },
    { diameter: "3/4 Inch", inch: "0.75", tebal: "2.8 mm (SCH 40)", beratPerM: "1.68", beratPerBatang: "≈ 10.1 kg" },
    { diameter: "1 Inch", inch: "1", tebal: "3.2 mm (SCH 40)", beratPerM: "2.50", beratPerBatang: "≈ 15.0 kg" },
    { diameter: "1¼ Inch", inch: "1.25", tebal: "3.5 mm (SCH 40)", beratPerM: "3.39", beratPerBatang: "≈ 20.3 kg" },
    { diameter: "1½ Inch", inch: "1.5", tebal: "3.8 mm (SCH 40)", beratPerM: "4.05", beratPerBatang: "≈ 24.3 kg" },
    { diameter: "2 Inch", inch: "2", tebal: "4.0 mm (SCH 40)", beratPerM: "5.44", beratPerBatang: "≈ 32.6 kg" },
    { diameter: "2½ Inch", inch: "2.5", tebal: "4.6 mm (SCH 40)", beratPerM: "7.66", beratPerBatang: "≈ 46.0 kg" },
    { diameter: "3 Inch", inch: "3", tebal: "5.0 mm (SCH 40)", beratPerM: "10.30", beratPerBatang: "≈ 61.8 kg" },
    { diameter: "4 Inch", inch: "4", tebal: "5.5 mm (SCH 40)", beratPerM: "14.60", beratPerBatang: "≈ 87.6 kg" },
    { diameter: "6 Inch", inch: "6", tebal: "6.5 mm (SCH 40)", beratPerM: "23.50", beratPerBatang: "≈ 141 kg" },
    { diameter: "8 Inch", inch: "8", tebal: "7.5 mm (SCH 40)", beratPerM: "34.50", beratPerBatang: "≈ 207 kg" },
    { diameter: "10 Inch", inch: "10", tebal: "8.5 mm (SCH 40)", beratPerM: "48.00", beratPerBatang: "≈ 288 kg" },
    { diameter: "12 Inch", inch: "12", tebal: "9.5 mm (SCH 40)", beratPerM: "63.50", beratPerBatang: "≈ 381 kg" },
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
          <span className="text-gray-900 font-medium">Pipa Baja</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Pipa <span className="text-gold">Baja</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Pipa baja digunakan untuk kebutuhan struktur, mechanical support,
            instalasi industri, hingga sistem utilitas. Tersedia pipa baja hitam
            dan galvanis dengan berbagai diameter, ketebalan (schedule), dan standar.
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (1/2" - 6")</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Package size={16} />
            <span>Indent (8" - 12")</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm">
            <Truck size={16} />
            <span>Pengiriman Seluruh Indonesia</span>
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
          <Image
            src="/material/besi/pipa-baja.jpg"
            alt="Pipa Baja Hitam dan Galvanis untuk struktur dan instalasi industri"
            width={1200}
            height={360}
            className="w-full h-[360px] object-cover"
            priority
          />
        </div>

        {/* ===== JENIS PIPA ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Pipa Hitam</h3>
              <p className="text-sm text-gray-600">
                Untuk aplikasi umum, struktur, dan instalasi yang tidak memerlukan ketahanan korosi ekstra.
                Cocok untuk pemipaan udara, steam, dan minyak.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Droplets size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Pipa Galvanis</h3>
              <p className="text-sm text-gray-600">
                Dilapisi seng untuk ketahanan korosi. Ideal untuk pipa air, instalasi outdoor, 
                dan lingkungan lembab.
              </p>
            </div>
          </div>
        </div>

        {/* ===== INFO GRID ===== */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full" />
              Kegunaan Pipa Baja
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Struktur rangka & support bangunan",
                "Instalasi mechanical & piping industri",
                "Tiang, railing, dan konstruksi baja ringan",
                "Sistem utilitas & fabrikasi",
                "Pipa bor pile (pondasi dalam)",
                "Fire protection system (sprinkler)",
                "Pipa air bertekanan",
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
                "Jenis: Pipa Hitam & Pipa Galvanis",
                "Standar: ASTM A53 Grade B / SNI 0039",
                "Schedule: SCH 40, SCH 80 (custom)",
                "Panjang standar: 6 Meter",
                "Surface: Mill finish / Galvanized",
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
            Tabel Berat Pipa Baja (Schedule 40)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Diameter (Inch)</th>
                  <th className="px-4 py-3 text-left font-semibold">Diameter (mm)</th>
                  <th className="px-4 py-3 text-left font-semibold">Tebal / Schedule</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Batang (6m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pipaData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition even:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.diameter}</td>
                    <td className="px-4 py-3">{row.inch}"</td>
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
            * Berat bersifat estimasi, tergantung standar pabrik & toleransi produksi.
          </p>
        </div>

        {/* ===== TECHNICAL INFO ===== */}
        <div className="mb-16 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-lg">i</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Info Teknis</h3>
              <p className="text-sm text-gray-700">
                Pipa Schedule 40 adalah standar paling umum untuk aplikasi industri dan komersial.
                Untuk aplikasi tekanan tinggi atau beban berat, tersedia Schedule 80 dengan ketebalan lebih.
                Pipa galvanis memiliki berat sekitar 3-5% lebih berat karena lapisan seng.
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
              { name: "Besi WF", slug: "wf", desc: "Balok dan kolom struktur" },
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
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20request%20harga%20dan%20stok%20Pipa%20Baja.%0AJenis:%20______%20(Hitam/Galvanis),%0ADiameter:%20______,%0ATebal/Schedule:%20______,%0APanjang:%20______,%0AQty:%20______%20batang,%0ALokasi%20Kirim:%20______."
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
              "name": "Pipa Baja Hitam & Galvanis",
              "description": "Pipa baja Schedule 40 untuk struktur, mechanical support, dan instalasi industri.",
              "image": "https://mppindo.com/material/besi/pipa-baja.jpg",
              "brand": {
                "@type": "Brand",
                "name": "ASTM / SNI"
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
