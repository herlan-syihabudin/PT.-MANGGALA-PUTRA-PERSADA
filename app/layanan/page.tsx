export default function LayananPage() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* SECTION TITLE */}
        <div className="mb-16 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Layanan <span className="text-red-600">Kami</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Layanan konstruksi terintegrasi berbasis rekayasa teknik untuk
            mendukung kebutuhan proyek industri dan perumahan secara
            menyeluruh.
          </p>
        </div>

        {/* SERVICES LIST */}
        <div className="grid gap-12 md:grid-cols-2">
          {/* SERVICE ITEM */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Konstruksi Sipil & Struktur
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pelaksanaan pekerjaan konstruksi sipil dan struktur dengan
              fokus pada kekuatan bangunan, stabilitas struktur, serta
              kesesuaian terhadap gambar dan spesifikasi teknis proyek.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Struktur Baja
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Fabrikasi dan erection struktur baja untuk pabrik, gudang,
              dan fasilitas industri dengan perhitungan teknik presisi
              serta pengendalian mutu yang terukur.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              MEP (Mechanical, Electrical & Plumbing)
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Perencanaan dan pelaksanaan sistem MEP terintegrasi,
              meliputi instalasi listrik, plumbing, HVAC, dan sistem
              proteksi kebakaran sesuai standar keselamatan dan regulasi.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Interior & Fit Out
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Pekerjaan interior dan fit out untuk kantor, hunian, dan
              fasilitas produksi dengan perhatian pada fungsi ruang,
              kualitas material, dan hasil akhir yang rapi.
            </p>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Renovasi & Maintenance
            </h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl">
              Layanan renovasi dan pemeliharaan bangunan serta sistem
              pendukungnya untuk menjaga kinerja, keamanan, dan umur
              layanan aset secara optimal.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
