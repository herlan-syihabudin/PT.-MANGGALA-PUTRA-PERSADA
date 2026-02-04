export type FAQItem = {
  question: string
  answer: string
}

export const faqByService: Record<string, FAQItem[]> = {
  "struktur-baja": [
    {
      question: "Apakah struktur baja cocok untuk bangunan industri dan gudang?",
      answer:
        "Ya. Struktur baja sangat cocok untuk bangunan industri dan gudang karena memiliki kekuatan tinggi, bentang lebar tanpa kolom tengah, serta waktu pemasangan yang lebih cepat dibanding struktur konvensional.",
    },
    {
      question: "Apa perbedaan H-Beam dan WF pada struktur baja?",
      answer:
        "H-Beam umumnya digunakan untuk struktur berat dengan beban besar, sedangkan WF lebih fleksibel untuk kolom dan balok bangunan industri menengah hingga besar. Pemilihan profil ditentukan oleh perhitungan struktur.",
    },
    {
      question: "Apakah pekerjaan struktur baja mengikuti standar SNI?",
      answer:
        "Seluruh pekerjaan struktur baja kami mengikuti standar SNI serta praktik engineering internasional, termasuk kontrol fabrikasi, pengelasan, dan erection di lapangan.",
    },
    {
      question: "Apakah termasuk fabrikasi dan erection di lokasi?",
      answer:
        "Ya. Layanan struktur baja kami mencakup engineering detail, fabrikasi di workshop, surface treatment, hingga erection dan alignment di lokasi proyek.",
    },
  ],

  /* =====================
     MEP FAQ
  ===================== */
  mep: [
    {
      question: "Apa saja lingkup pekerjaan MEP yang ditangani?",
      answer:
        "Lingkup pekerjaan MEP meliputi sistem Mechanical (HVAC & piping), Electrical (LV/MV, panel, lighting), serta Plumbing & Fire Protection untuk proyek industri dan komersial.",
    },
    {
      question: "Apakah pekerjaan MEP terkoordinasi dengan struktur dan arsitektur?",
      answer:
        "Ya. Seluruh pekerjaan MEP dikoordinasikan secara engineering dengan struktur dan arsitektur untuk menghindari clash dan memastikan instalasi yang rapi serta fungsional.",
    },
    {
      question: "Apakah tersedia pekerjaan testing dan commissioning?",
      answer:
        "Kami melaksanakan testing, commissioning, dan performance verification sebelum handover untuk memastikan sistem bekerja sesuai desain dan spesifikasi.",
    },
    {
      question: "Apakah MEP mencakup sistem fire protection?",
      answer:
        "Ya. Kami menangani fire hydrant, sprinkler, fire pump, dan sistem proteksi kebakaran sesuai standar teknis dan regulasi yang berlaku.",
    },
    {
      question: "Proyek apa saja yang cocok untuk layanan MEP?",
      answer:
        "Layanan MEP cocok untuk pabrik, gudang, gedung perkantoran, bangunan komersial, dan fasilitas utilitas pendukung.",
    },
  ],
}
