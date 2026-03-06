export type FAQItem = {
  question: string
  answer: string
}

export const faqByService: Record<string, FAQItem[]> = {
  /* =====================
     STRUKTUR BAJA
  ===================== */
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
        "Seluruh pekerjaan struktur baja kami mengikuti standar SNI serta praktik engineering internasional sesuai spesifikasi teknis proyek.",
    },
    {
      question: "Apakah termasuk fabrikasi dan erection di lokasi?",
      answer:
        "Ya. Layanan struktur baja mencakup engineering detail, fabrikasi di workshop, surface treatment, hingga erection dan alignment di lokasi proyek.",
    },
  ],

  /* =====================
     MEP
  ===================== */
  mep: [
    {
      question: "Apa saja lingkup pekerjaan MEP yang ditangani?",
      answer:
        "Lingkup pekerjaan MEP meliputi sistem Mechanical (HVAC & piping), Electrical (LV/MV, panel, lighting), serta Plumbing dan Fire Protection untuk proyek industri dan komersial.",
    },
    {
      question: "Apakah pekerjaan MEP dikoordinasikan dengan struktur dan arsitektur?",
      answer:
        "Ya. Seluruh pekerjaan MEP dikoordinasikan secara engineering dengan struktur dan arsitektur untuk menghindari clash dan memastikan instalasi rapi serta fungsional.",
    },
    {
      question: "Apakah tersedia pekerjaan testing dan commissioning?",
      answer:
        "Kami melaksanakan testing, commissioning, dan performance verification sebelum handover untuk memastikan sistem bekerja sesuai desain dan spesifikasi.",
    },
    {
      question: "Apakah MEP mencakup sistem fire protection?",
      answer:
        "Ya. Pekerjaan MEP mencakup fire hydrant, sprinkler, fire pump, dan sistem proteksi kebakaran sesuai standar teknis dan regulasi yang berlaku.",
    },
  ],

  /* =====================
     KONSTRUKSI SIPIL
  ===================== */
  "konstruksi-sipil": [
    {
      question: "Apa saja lingkup pekerjaan konstruksi sipil?",
      answer:
        "Lingkup pekerjaan konstruksi sipil meliputi pekerjaan tanah, pondasi, struktur beton bertulang, slab, kolom, balok, retaining wall, serta struktur pendukung bangunan.",
    },
    {
      question: "Apakah pekerjaan sipil mencakup pondasi?",
      answer:
        "Ya. Kami menangani pondasi dangkal dan pondasi dalam seperti footplate, pile cap, bore pile, dan tiang pancang sesuai kebutuhan struktur dan kondisi tanah.",
    },
    {
      question: "Apakah konstruksi sipil mengikuti standar SNI?",
      answer:
        "Seluruh pekerjaan konstruksi sipil dilaksanakan sesuai standar SNI, spesifikasi teknis proyek, serta metode kerja yang telah melalui review engineering.",
    },
    {
      question: "Bagaimana sistem quality control pada pekerjaan sipil?",
      answer:
        "Kontrol kualitas dilakukan melalui pengawasan engineering, persetujuan shop drawing, serta inspeksi material dan pekerjaan lapangan secara berkala.",
    },
  ],

  /* =====================
     DESIGN & BUILD
  ===================== */
  "design-build": [
    {
      question: "Apa yang dimaksud dengan sistem design & build?",
      answer:
        "Design & build adalah metode pelaksanaan proyek di mana proses desain dan konstruksi dikelola secara terintegrasi oleh satu kontraktor.",
    },
    {
      question: "Keuntungan design & build meliputi koordinasi desain dan konstruksi yang lebih terintegrasi, efisiensi biaya proyek, waktu pelaksanaan lebih singkat, serta pengurangan risiko perubahan desain selama konstruksi berlangsung.",
      answer:
        "Keuntungan design & build meliputi koordinasi lebih baik, efisiensi biaya, waktu pelaksanaan lebih singkat, serta risiko perubahan desain yang lebih rendah.",
    },
  ],

  /* =====================
     FIT OUT
  ===================== */
  "fit-out": [
    {
      question: "Apa yang dimaksud dengan pekerjaan fit out?",
      answer:
        "Fit out adalah pekerjaan penyempurnaan interior bangunan setelah struktur utama selesai, mencakup partisi, ceiling, flooring, MEP interior, dan finishing agar siap digunakan.",
    },
    {
      question: "Apakah layanan fit out mencakup kantor dan bangunan komersial?",
      answer:
        "Ya. Layanan fit out mencakup kantor, showroom, retail, dan fasilitas komersial dengan pendekatan engineering-led execution.",
    },
    {
      question: "Apakah fit out mencakup pekerjaan MEP interior?",
      answer:
        "Ya. Fit out mencakup instalasi MEP interior seperti lighting, power outlet, data, AC, plumbing ringan, dan sistem pendukung ruang.",
    },
    {
      question: "Bagaimana kontrol kualitas pekerjaan fit out?",
      answer:
        "Kontrol kualitas dilakukan melalui pengawasan engineering, persetujuan shop drawing, serta inspeksi material dan pekerjaan finishing agar hasil rapi dan tahan lama.",
    },
  ],
}
