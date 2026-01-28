import Link from "next/link"

export default function WFPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Besi <span className="text-red-600">WF / IWF</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Besi WF (Wide Flange / IWF) merupakan profil baja struktural yang
          digunakan untuk kolom dan balok bangunan industri, gudang, pabrik,
          serta konstruksi menengah hingga berat dengan efisiensi struktur
          dan daya dukung tinggi.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/wf.jpg"
            alt="Besi WF / IWF"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Kegunaan Besi WF
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Balok dan kolom struktur baja</li>
              <li>Gudang, pabrik, dan workshop</li>
              <li>Struktur mezzanine dan canopy</li>
              <li>Bangunan industri & komersial</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Standar: JIS / SNI</li>
              <li>Panjang standar: 12 Meter</li>
              <li>Material: Baja struktural</li>
              <li>Supply: Proyek & Non-Proyek</li>
            </ul>
          </div>
        </div>

        {/* WEIGHT TABLE */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi WF
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">Ukuran WF</th>
                  <th className="px-4 py-3 text-left">Tebal (mm)</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (12m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">WF 150</td>
                  <td className="px-4 py-3">7 / 10</td>
                  <td className="px-4 py-3">14.0</td>
                  <td className="px-4 py-3">≈ 168 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">WF 200</td>
                  <td className="px-4 py-3">8 / 12</td>
                  <td className="px-4 py-3">21.3</td>
                  <td className="px-4 py-3">≈ 256 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">WF 250</td>
                  <td className="px-4 py-3">9 / 14</td>
                  <td className="px-4 py-3">29.6</td>
                  <td className="px-4 py-3">≈ 355 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">WF 300</td>
                  <td className="px-4 py-3">10 / 15</td>
                  <td className="px-4 py-3">36.7</td>
                  <td className="px-4 py-3">≈ 440 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">WF 350</td>
                  <td className="px-4 py-3">12 / 19</td>
                  <td className="px-4 py-3">49.6</td>
                  <td className="px-4 py-3">≈ 595 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">WF 400</td>
                  <td className="px-4 py-3">13 / 21</td>
                  <td className="px-4 py-3">66.0</td>
                  <td className="px-4 py-3">≈ 792 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi, tergantung standar pabrik dan toleransi produksi.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20request%20harga%20dan%20stok%20Besi%20WF"
            className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-center hover:bg-red-700 transition"
          >
            Request Price & Stock
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
