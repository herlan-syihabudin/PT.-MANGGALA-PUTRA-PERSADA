export default function AboutSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* LEFT */}
        <div>
          <span className="inline-block mb-4 px-4 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-full">
            Tentang Kami
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Engineering dengan Pendekatan Terstruktur
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            PT Manggala Putra Persada adalah perusahaan yang bergerak
            di bidang engineering dan konstruksi dengan fokus pada
            perencanaan yang matang, pelaksanaan terukur, dan
            pengendalian mutu yang konsisten.
          </p>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Kami percaya bahwa setiap proyek membutuhkan struktur
            yang kuat, sistem kerja yang jelas, serta disiplin teknik
            untuk menghasilkan hasil yang berkelanjutan dan dapat
            diandalkan.
          </p>
        </div>

        {/* RIGHT */}
        <div className="grid gap-6">
          <div className="border border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-2">Visi</h3>
            <p className="text-gray-600">
              Menjadi mitra konstruksi dan engineering yang dipercaya
              melalui pendekatan terstruktur, presisi teknis, dan
              komitmen jangka panjang.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 mb-2">Misi</h3>
            <ul className="text-gray-600 space-y-2 list-disc list-inside">
              <li>Menyediakan solusi konstruksi berbasis engineering</li>
              <li>Menjaga mutu, keselamatan, dan ketepatan pelaksanaan</li>
              <li>Membangun kepercayaan melalui sistem kerja profesional</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
