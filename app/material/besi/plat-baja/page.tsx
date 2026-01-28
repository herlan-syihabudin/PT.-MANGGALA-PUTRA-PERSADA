import Link from "next/link"

export default function PlatBajaPage() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Plat <span className="text-red-600">Baja</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Plat baja merupakan material utama untuk kebutuhan fabrikasi,
          struktur, base plate, tangki, dan berbagai aplikasi industri.
          Tersedia plat baja hitam dan galvanis dengan ketebalan beragam.
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border">
          <img
            src="/material/besi/plat-baja.jpg"
            alt="Plat Baja Hitam dan Galvanis"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Kegunaan Plat Baja
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Base plate & pelat sambungan struktur baja</li>
              <li>Fabrikasi tangki & mesin industri</li>
              <li>Lantai baja & cover plate</li>
              <li>Kebutuhan konstruksi & manufaktur</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Jenis: Plat Hitam & Plat Galvanis</li>
              <li>Ukuran standar: 4 x 8 ft / Custom cutting</li>
              <li>Material: Baja karbon</li>
              <li>Supply: Proyek & Retail</li>
            </ul>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Plat Baja (Estimasi)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Ketebalan</th>
                  <th className="px-4 py-3 text-left">Ukuran</th>
                  <th className="px-4 py-3 text-left">Berat / Lembar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3">1.2 mm</td>
                  <td className="px-4 py-3">4 x 8 ft</td>
                  <td className="px-4 py-3">≈ 29 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">2.3 mm</td>
                  <td className="px-4 py-3">4 x 8 ft</td>
                  <td className="px-4 py-3">≈ 56 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">4.5 mm</td>
                  <td className="px-4 py-3">4 x 8 ft</td>
                  <td className="px-4 py-3">≈ 108 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">6.0 mm</td>
                  <td className="px-4 py-3">4 x 8 ft</td>
                  <td className="px-4 py-3">≈ 144 kg</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">9.0 mm</td>
                  <td className="px-4 py-3">4 x 8 ft</td>
                  <td className="px-4 py-3">≈ 216 kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi dan dapat berbeda tergantung pabrik & toleransi produksi.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href="https://wa.me/6281297396612?text=Halo,%20saya%20ingin%20request%20harga%20dan%20stok%20Plat%20Baja"
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
