import Link from "next/link"

export default function BesiBetonPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Besi <span className="text-red-600">Beton Polos & Ulir</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Besi beton merupakan material utama dalam konstruksi beton bertulang
          yang digunakan untuk pondasi, kolom, balok, dan pelat lantai.
          Tersedia dalam tipe polos dan ulir sesuai standar SNI.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/besi-beton.jpg"
            alt="Besi Beton Polos dan Ulir"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Kegunaan Besi Beton
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Pondasi bangunan</li>
              <li>Kolom dan balok beton bertulang</li>
              <li>Pelat lantai & struktur gedung</li>
              <li>Proyek perumahan, gedung & industri</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Tipe: Polos (BJTP) & Ulir (BJTS)</li>
              <li>Standar: SNI</li>
              <li>Panjang: 12 Meter</li>
              <li>Supply: Proyek & Retail</li>
            </ul>
          </div>
        </div>

        {/* TABLE POLOS */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi Beton Polos (BJTP)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Diameter</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3">Ø 6 mm</td><td className="px-4 py-3">0.222</td><td className="px-4 py-3">≈ 2.66 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 8 mm</td><td className="px-4 py-3">0.395</td><td className="px-4 py-3">≈ 4.74 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 10 mm</td><td className="px-4 py-3">0.617</td><td className="px-4 py-3">≈ 7.40 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 12 mm</td><td className="px-4 py-3">0.888</td><td className="px-4 py-3">≈ 10.66 kg</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE ULIR */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi Beton Ulir (BJTS)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Diameter</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-3">Ø 10 mm</td><td className="px-4 py-3">0.617</td><td className="px-4 py-3">≈ 7.40 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 13 mm</td><td className="px-4 py-3">1.042</td><td className="px-4 py-3">≈ 12.50 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 16 mm</td><td className="px-4 py-3">1.578</td><td className="px-4 py-3">≈ 18.94 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 19 mm</td><td className="px-4 py-3">2.226</td><td className="px-4 py-3">≈ 26.71 kg</td></tr>
                <tr><td className="px-4 py-3">Ø 22 mm</td><td className="px-4 py-3">2.984</td><td className="px-4 py-3">≈ 35.81 kg</td></tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi dan mengikuti standar SNI & toleransi pabrik.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20request%20harga%20dan%20stok%20Besi%20Beton%20Polos%20dan%20Ulir"
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-red-700 transition"
          >
            Request Price & Stock
          </a>

          <Link
            href="/kontak"
            className="border border-gray-300 px-8 py-4 rounded-xl font-semibold text-center hover:bg-gray-100 transition"
          >
            Konsultasi Teknis Proyek
          </Link>
        </div>

      </div>
    </section>
  )
}
