export default function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center bg-gray-50">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          General Contractor & MEP <br />
          <span className="text-red-600">Pabrik & Perumahan</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-xl">
          Menangani konstruksi sipil, baja, MEP, dan interior dengan standar mutu
          tinggi dan komitmen ketepatan waktu.
        </p>

        <div className="mt-8 flex gap-4">
          <a
            href="https://wa.me/62XXXXXXXXXX"
            className="bg-red-600 text-white px-6 py-3 rounded font-semibold"
          >
            Konsultasi Gratis
          </a>
          <a
            href="/proyek"
            className="border border-gray-300 px-6 py-3 rounded font-semibold"
          >
            Lihat Proyek
          </a>
        </div>
      </div>
    </section>
  )
}
