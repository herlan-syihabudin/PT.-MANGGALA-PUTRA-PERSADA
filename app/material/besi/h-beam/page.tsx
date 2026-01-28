import Link from "next/link"

export default function HBeamPage() {
  const waBase =
    "https://wa.me/6281297396612?text="

  const waText = encodeURIComponent(
    "Halo PT Manggala Putra Persada, saya ingin request harga & stok Besi H-Beam."
  )

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Besi <span className="text-red-600">H-Beam</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-3xl mb-10">
          Besi H-Beam adalah material baja struktural utama untuk bangunan industri,
          gudang, pabrik, dan konstruksi berat. Digunakan sebagai kolom dan balok
          dengan kapasitas beban tinggi serta standar nasional (SNI & JIS).
        </p>

        {/* IMAGE */}
        <div className="mb-12 rounded-2xl overflow-hidden border bg-gray-100">
          <img
            src="/materials/besi/hbeam.jpg"
            alt="Besi H Beam"
            className="w-full h-[360px] object-cover"
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Aplikasi Besi H-Beam
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Struktur utama bangunan industri & pabrik</li>
              <li>Kolom dan balok baja</li>
              <li>Gudang, hanggar, dan workshop</li>
              <li>Jembatan dan struktur berat</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              Spesifikasi Umum
            </h2>
            <ul className="text-gray-700 space-y-2">
              <li>Standar: SNI / JIS</li>
              <li>Panjang: 12 Meter (custom length available)</li>
              <li>Material: Baja struktural karbon</li>
              <li>Supply: Proyek & non-proyek</li>
            </ul>
          </div>
        </div>

        {/* WEIGHT TABLE */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">
            Tabel Berat Besi H-Beam (Estimasi)
          </h2>

          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left">Ukuran</th>
                  <th className="px-4 py-3 text-left">Tebal (Web / Flange)</th>
                  <th className="px-4 py-3 text-left">Berat (kg/m)</th>
                  <th className="px-4 py-3 text-left">Berat / Batang (12 m)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["H 200", "8 / 12", "49.9", "≈ 599 kg"],
                  ["H 250", "9 / 14", "72.4", "≈ 869 kg"],
                  ["H 300", "10 / 15", "94.0", "≈ 1.128 kg"],
                  ["H 350", "12 / 19", "137.0", "≈ 1.644 kg"],
                  ["H 400", "13 / 21", "172.0", "≈ 2.064 kg"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{row[0]}</td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                    <td className="px-4 py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            * Berat bersifat estimasi dan dapat berbeda tergantung standar pabrik
            serta toleransi produksi.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4">
          <a
            href={waBase + waText}
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
