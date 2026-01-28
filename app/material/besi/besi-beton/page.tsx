import Link from "next/link"

export default function BesiBetonPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Besi <span className="text-red-600">Beton Polos & Ulir (SNI)</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Besi beton adalah material utama dalam konstruksi beton bertulang
          untuk pondasi, kolom, balok, dan pelat lantai. Tersedia tipe
          <strong> Polos (BJTP)</strong> dan <strong>Ulir (BJTS)</strong> sesuai
          standar SNI untuk kebutuhan proyek dan retail.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/besi-beton.jpg"
            alt="Besi Beton Polos dan Ulir SNI"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* INFO GRID */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Aplikasi Besi Beton
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Pondasi bangunan & sloof</li>
              <li>Kolom dan balok beton bertulang</li>
              <li>Pelat lantai dan struktur gedung</li>
              <li>Proyek perumahan, gedung, & industri</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>✔ Tipe: BJTP (Polos) & BJTS (Ulir)</li>
              <li>✔ Standar: SNI</li>
              <li>✔ Panjang standar: 12 Meter</li>
              <li>✔ Supply: Proyek & Retail</li>
              <li>✔ Ready Stock / Indent</li>
            </ul>
          </div>
        </div>

        {/* TABLE BJTP */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi Beton Polos (BJTP)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
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

        {/* TABLE BJTS */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi Beton Ulir (BJTS)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
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
            * Berat bersifat estimasi dan mengikuti standar SNI serta toleransi pabrik.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20penawaran%20Besi%20Beton%20(SNI)%20–%20diameter,%20qty,%20dan%20lokasi%20kirim."
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-red-700 transition"
          >
            Request Harga & Stok
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
