export default function FAQ() {
  const faqs = [
    {
      q: "Jenis proyek apa saja yang ditangani PT Manggala Putra Persada?",
      a: "Kami menangani proyek konstruksi industri dan perumahan, meliputi pekerjaan konstruksi sipil, struktur baja, sistem MEP, serta interior dan pekerjaan pendukung lainnya.",
    },
    {
      q: "Apakah PT Manggala Putra Persada menerima proyek skala kecil hingga menengah?",
      a: "Ya. Kami menerima proyek dengan berbagai skala, sepanjang ruang lingkup pekerjaan dan standar pelaksanaan dapat disepakati bersama sejak awal.",
    },
    {
      q: "Apakah tersedia layanan konsultasi dan survey awal proyek?",
      a: "Kami menyediakan konsultasi awal dan survey lokasi untuk memahami kebutuhan proyek, kondisi lapangan, serta menentukan pendekatan teknis yang tepat.",
    },
    {
      q: "Apakah PT Manggala Putra Persada menerapkan standar keselamatan kerja (K3)?",
      a: "Ya. Setiap proyek dilaksanakan dengan memperhatikan standar keselamatan dan kesehatan kerja (K3) serta ketentuan teknis yang berlaku.",
    },
    {
      q: "Bagaimana sistem perencanaan dan pengendalian proyek dilakukan?",
      a: "Proyek direncanakan melalui tahapan perencanaan teknis, estimasi biaya, penjadwalan pekerjaan, serta pengawasan pelaksanaan secara terstruktur.",
    },
    {
      q: "Apakah PT Manggala Putra Persada dapat bekerja berdasarkan gambar dari klien?",
      a: "Ya. Kami dapat bekerja berdasarkan gambar dan spesifikasi dari klien, maupun membantu penyempurnaan teknis apabila diperlukan.",
    },
    {
      q: "Bagaimana sistem komunikasi dan pelaporan selama proyek berjalan?",
      a: "Kami menerapkan komunikasi dan pelaporan progres secara berkala agar klien dapat memantau perkembangan pekerjaan dengan jelas dan transparan.",
    },
    {
      q: "Bagaimana cara memulai kerja sama proyek?",
      a: "Klien dapat menghubungi kami melalui halaman kontak atau WhatsApp untuk diskusi awal terkait kebutuhan proyek dan penjadwalan survey.",
    },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold mb-10 text-gray-900">
          Pertanyaan yang Sering Diajukan
        </h2>

        <div className="space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
              <p className="text-gray-700 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
