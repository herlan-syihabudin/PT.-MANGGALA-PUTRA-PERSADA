import Link from "next/link"

export default function PipaBajaPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Pipa <span className="text-red-600">Baja</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Pipa baja digunakan untuk kebutuhan struktur, mechanical support,
          instalasi industri, hingga sistem utilitas. Tersedia pipa baja hitam
          dan galvanis dengan berbagai diameter dan ketebalan.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/pipa-baja.jpg"
            alt="Pipa Baja Hitam dan Galvanis"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Kegunaan Pipa Baja
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Struktur rangka & support bangunan</li>
              <li>Instalasi mechanical & piping industri</li>
              <li>Tiang, railing, dan konstruksi baja ringan</li>
              <li>Sistem utilitas & fabrikasi</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Jenis: Pipa Hitam & Pipa Galvanis</li>
              <li>Panjang standar: 6 Meter</li>
              <li>Standar: SNI / ASTM</li>
              <li>Supply: Proyek & Non-Proyek</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Pipa Baja (Estimasi)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">Diameter</th>
                  <th className="px-4 py-3 text-left">Tebal</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (6m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">1 Inch</td>
                  <td className="px-4 py-3">2.5 mm</td>
                  <td className="px-4 py-3">2.50</td>
                  <td className="px-4 py-3">≈ 15 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">1½ Inch</td>
                  <td className="px-4 py-3">2.8 mm</td>
                  <td className="px-4 py-3">3.90</td>
                  <td className="px-4 py-3">≈ 23 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2 Inch</td>
                  <td className="px-4 py-3">3.2 mm</td>
                  <td className="px-4 py-3">5.44</td>
                  <td className="px-4 py-3">≈ 33 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">3 Inch</td>
                  <td className="px-4 py-3">3.6 mm</td>
                  <td className="px-4 py-3">8.60</td>
                  <td className="px-4 py-3">≈ 52 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">4 Inch</td>
                  <td className="px-4 py-3">4.0 mm</td>
                  <td className="px-4 py-3">12.20</td>
                  <td className="px-4 py-3">≈ 73 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi, tergantung standar pabrik & toleransi produksi.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20request%20harga%20dan%20stok%20Pipa%20Baja"
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
