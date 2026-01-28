import Link from "next/link"

export default function UNPPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Besi <span className="text-red-600">UNP</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Besi UNP (U-Channel) merupakan profil baja yang umum digunakan
          sebagai secondary structure, rangka atap, dudukan, dan penguat
          struktur pada konstruksi industri maupun komersial.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/unp.jpg"
            alt="Besi UNP"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Kegunaan Besi UNP
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Rangka atap dan secondary structure</li>
              <li>Dudukan mesin & support struktur</li>
              <li>Balok pengaku dan penguat rangka</li>
              <li>Konstruksi gudang & workshop</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Standar: JIS / SNI</li>
              <li>Panjang: 6 Meter & 12 Meter</li>
              <li>Material: Baja struktural</li>
              <li>Supply: Proyek & Retail</li>
            </ul>
          </div>
        </div>

        {/* WEIGHT TABLE */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi UNP
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">Ukuran UNP</th>
                  <th className="px-4 py-3 text-left">Tebal (mm)</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (6m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">UNP 50</td>
                  <td className="px-4 py-3">4.5</td>
                  <td className="px-4 py-3">5.59</td>
                  <td className="px-4 py-3">≈ 33.5 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">UNP 65</td>
                  <td className="px-4 py-3">4.8</td>
                  <td className="px-4 py-3">7.09</td>
                  <td className="px-4 py-3">≈ 42.5 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">UNP 80</td>
                  <td className="px-4 py-3">5.0</td>
                  <td className="px-4 py-3">8.64</td>
                  <td className="px-4 py-3">≈ 51.8 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">UNP 100</td>
                  <td className="px-4 py-3">5.5</td>
                  <td className="px-4 py-3">10.6</td>
                  <td className="px-4 py-3">≈ 63.6 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">UNP 120</td>
                  <td className="px-4 py-3">6.0</td>
                  <td className="px-4 py-3">13.4</td>
                  <td className="px-4 py-3">≈ 80.4 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi dan dapat berbeda tergantung standar pabrik.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20request%20harga%20dan%20stok%20Besi%20UNP"
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
