export default function ProyekPage() {
  return (
    <section className="container mx-auto px-6 py-20 max-w-6xl">
      <h1 className="text-4xl font-bold mb-10">
        Proyek & <span className="text-red-600">Pengalaman</span>
      </h1>

      <p className="text-gray-700 mb-10 max-w-3xl">
        PT Manggala Putra Persada menangani berbagai pekerjaan konstruksi untuk
        proyek pabrik, perumahan, serta pekerjaan MEP dan interior dengan
        pendekatan profesional dan terukur.
      </p>

      <div className="grid md:grid-cols-3 gap-8 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold mb-2">Proyek Industri</h2>
          <p>Pabrik, gudang, dan bangunan pendukung industri.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Proyek Perumahan</h2>
          <p>Rumah tinggal, perumahan, dan renovasi hunian.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">MEP & Interior</h2>
          <p>Instalasi MEP dan pekerjaan interior kantor maupun hunian.</p>
        </div>
      </div>
    </section>
  )
}
