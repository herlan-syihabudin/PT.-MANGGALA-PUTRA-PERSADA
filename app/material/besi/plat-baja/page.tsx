import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, Package, Truck, CheckCircle, Flame, Droplets, Ruler } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Plat Baja Hitam & Galvanis | Harga & Tabel Berat | Supplier | MPP Engineering",
  description: "Supplier plat baja hitam dan galvanis untuk fabrikasi, base plate, tangki, dan konstruksi. Tersedia ketebalan 1.2-20mm, ukuran 4x8 ft & 5x20 ft, custom cutting. Request harga & stok.",
  keywords: "plat baja, plat hitam, plat galvanis, base plate, plat struktur, checker plate, plat kapal, supplier plat baja jakarta",
  openGraph: {
    title: "Plat Baja Hitam & Galvanis | MPP Engineering",
    description: "Lengkap dengan tabel berat dan spesifikasi teknis.",
    images: ["/images/og-plat.jpg"],
  },
  alternates: {
    canonical: "https://mppindo.com/material/besi/plat-baja",
  },
}

export default function PlatBajaPage() {
  // Data tabel lebih lengkap
  const platData = [
    { tebal: "1.2 mm", ukuran: "4 x 8 ft", berat: "≈ 29 kg", aplikasi: "Cover, panel" },
    { tebal: "1.6 mm", ukuran: "4 x 8 ft", berat: "≈ 39 kg", aplikasi: "Cover, bending ringan" },
    { tebal: "2.0 mm", ukuran: "4 x 8 ft", berat: "≈ 48 kg", aplikasi: "Base plate ringan" },
    { tebal: "2.3 mm", ukuran: "4 x 8 ft", berat: "≈ 56 kg", aplikasi: "Base plate, sambungan" },
    { tebal: "3.2 mm", ukuran: "4 x 8 ft", berat: "≈ 77 kg", aplikasi: "Struktur ringan" },
    { tebal: "4.5 mm", ukuran: "4 x 8 ft", berat: "≈ 108 kg", aplikasi: "Struktur sedang" },
    { tebal: "6.0 mm", ukuran: "4 x 8 ft", berat: "≈ 144 kg", aplikasi: "Struktur berat" },
    { tebal: "8.0 mm", ukuran: "4 x 8 ft", berat: "≈ 192 kg", aplikasi: "Tangki, base plate" },
    { tebal: "9.0 mm", ukuran: "4 x 8 ft", berat: "≈ 216 kg", aplikasi: "Tangki, struktur" },
    { tebal: "10 mm", ukuran: "4 x 8 ft", berat: "≈ 240 kg", aplikasi: "Tangki, jembatan" },
    { tebal: "12 mm", ukuran: "4 x 8 ft", berat: "≈ 288 kg", aplikasi: "Struktur berat" },
    { tebal: "16 mm", ukuran: "4 x 8 ft", berat: "≈ 384 kg", aplikasi: "Struktur khusus" },
    { tebal: "20 mm", ukuran: "4 x 8 ft", berat: "≈ 480 kg", aplikasi: "Struktur khusus" },
  ]

  // Ukuran besar
  const platBesarData = [
    { tebal: "6 mm", ukuran: "5 x 20 ft", berat: "≈ 540 kg" },
    { tebal: "8 mm", ukuran: "5 x 20 ft", berat: "≈ 720 kg" },
    { tebal: "10 mm", ukuran: "5 x 20 ft", berat: "≈ 900 kg" },
    { tebal: "12 mm", ukuran: "5 x 20 ft", berat: "≈ 1.080 kg" },
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
          <span className="text-gray-900 font-medium">Plat Baja</span>
        </div>

        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-8">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Material Proyek
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Plat <span className="text-gold">Baja</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            Plat baja merupakan material utama untuk kebutuhan fabrikasi,
            struktur, base plate, tangki, dan berbagai aplikasi industri.
            Tersedia plat baja hitam dan galvanis dengan ketebalan 1.2-20mm.
          </p>
        </div>

        {/* ===== STOCK STATUS ===== */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <CheckCircle size={16} />
            <span>Ready Stock (1.2mm - 12mm)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Package size={16} />
            <span>Indent (16mm - 20mm, custom ukuran)</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-sm">
            <Truck size={16} />
            <span>Pengiriman Seluruh Indonesia</span>
          </div>
        </div>

        {/* ===== IMAGE ===== */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
          <Image
            src="/material/besi/plat-baja.jpg"
            alt="Plat Baja Hitam dan Galvanis untuk fabrikasi dan konstruksi industri"
            width={1200}
            height={360}
            className="w-full h-[360px] object-cover"
            priority
          />
        </div>

        {/* ===== JENIS PLAT ===== */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Plat Hitam (Hot Rolled)</h3>
              <p className="text-sm text-gray-600">
                Untuk aplikasi struktural, fabrikasi umum, base plate, dan tangki.
                Standar ASTM A36 / SS400. Permukaan mill finish.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Droplets size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Plat Galvanis</h3>
              <p className="text-sm text-gray-600">
                Dilapisi seng untuk ketahanan korosi. Ideal untuk aplikasi outdoor,
                atap, dinding, dan lingkungan lembab.
              </p>
            </div>
          </div>
        </div>

        {/* ===== INFO GRID ===== */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full" />
              Kegunaan Plat Baja
            </h2>
            <ul className="space-y-2 text-gray-700">
              {[
                "Base plate & pelat sambungan struktur baja",
                "Fabrikasi tangki & mesin industri",
                "Lantai baja & cover plate",
                "Plat dinding dan penguat struktur",
                "Checker plate untuk lantai anti slip",
                "Plat bending untuk fabrikasi",
                "Kebutuhan konstruksi & manufaktur",
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
                "Jenis: Plat Hitam (HR) & Plat Galvanis",
                "Standar: ASTM A36 / JIS G3101 SS400",
                "Ukuran standar: 4 x 8 ft (1.2 x 2.4 m)",
                "Ukuran besar: 5 x 20 ft (1.5 x 6 m)",
                "Custom cutting: sesuai kebutuhan",
                "Toleransi ketebalan: ±0.2mm (sesuai standar)",
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

        {/* ===== WEIGHT TABLE (4x8 ft) ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Tabel Berat Plat Baja 4 x 8 ft (1.2 x 2.4 m)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ketebalan</th>
                  <th className="px-4 py-3 text-left font-semibold">Ukuran</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Lembar</th>
                  <th className="px-4 py-3 text-left font-semibold">Aplikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {platData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition even:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.tebal}</td>
                    <td className="px-4 py-3">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.berat}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.aplikasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== WEIGHT TABLE (5x20 ft) ===== */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Tabel Berat Plat Baja 5 x 20 ft (1.5 x 6 m)
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ketebalan</th>
                  <th className="px-4 py-3 text-left font-semibold">Ukuran</th>
                  <th className="px-4 py-3 text-left font-semibold">Berat / Lembar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {platBesarData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition even:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{row.tebal}</td>
                    <td className="px-4 py-3">{row.ukuran}</td>
                    <td className="px-4 py-3">{row.berat}</td>
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
            <Ruler size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Info Teknis</h3>
              <p className="text-sm text-gray-700">
                Plat hitam hot rolled (HR) memiliki toleransi ketebalan sesuai standar ASTM A6.
                Untuk aplikasi yang memerlukan presisi tinggi, tersedia plat mesin (surface grinding).
                Plat galvanis memiliki lapisan seng sekitar 120-600 g/m² tergantung kebutuhan.
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
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20request%20harga%20dan%20stok%20Plat%20Baja.%0AJenis:%20______%20(Hitam/Galvanis),%0AKetebalan:%20______%20mm,%0AUkuran:%20______%20(4x8%20ft%20/%20custom),%0AJumlah:%20______%20lembar,%0ALokasi%20Kirim:%20______."
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
              "name": "Plat Baja Hitam & Galvanis",
              "description": "Plat baja untuk fabrikasi, base plate, tangki, dan konstruksi industri.",
              "image": "https://mppindo.com/material/besi/plat-baja.jpg",
              "brand": {
                "@type": "Brand",
                "name": "ASTM A36 / SS400"
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
