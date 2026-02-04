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
        "Seluruh pekerjaan struktur baja kami mengikuti standar SNI serta praktik engineering internasional, termasuk kontrol fabrikasi, pengelasan, dan erection di lapangan.",
    },
    {
      question: "Apakah termasuk fabrikasi dan erection di lokasi?",
      answer:
        "Ya. Layanan struktur baja kami mencakup engineering detail, fabrikasi di workshop, surface treatment, hingga erection dan alignment di lokasi proyek.",
    },
  ],

  /* =====================
     MEP
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

  /* =====================
     KONSTRUKSI SIPIL
  ===================== */
  "konstruksi-sipil": [
    {
      question: "Apa saja lingkup pekerjaan konstruksi sipil yang ditangani?",
      answer:
        "Lingkup pekerjaan konstruksi sipil meliputi pekerjaan tanah, pondasi, struktur beton bertulang, slab, kolom, balok, retaining wall, hingga pekerjaan struktur pendukung bangunan.",
    },
    {
      question: "Apakah konstruksi sipil mencakup pekerjaan pondasi?",
      answer:
        "Ya. Kami menangani pondasi dangkal dan pondasi dalam seperti footplate, pile cap, bore pile, dan tiang pancang sesuai kebutuhan struktur dan kondisi tanah.",
    },
    {
      question: "Apakah pekerjaan konstruksi sipil mengikuti standar SNI?",
      answer:
        "Seluruh pekerjaan konstruksi sipil dilaksanakan sesuai standar SNI, spesifikasi teknis proyek, dan metode kerja yang telah disetujui melalui engineering review.",
    },
    {
      question: "Bagaimana sistem quality control pada pekerjaan sipil?",
      answer:
        "Quality control dilakukan melalui inspection & test plan (ITP), pengawasan engineering, kontrol mutu material, serta pemeriksaan dimensi dan kekuatan struktur secara berkala.",
    },
    {
      question: "Jenis proyek apa yang cocok untuk layanan konstruksi sipil?",
      answer:
        "Konstruksi sipil cocok untuk proyek industri, gedung komersial, perumahan, gudang, dan fasilitas pendukung infrastruktur.",
    },
  ],

  /* =====================
     DESIGN & BUILD
  ===================== */
  "design-build": [
    {
      question: "Apa yang dimaksud dengan layanan design & build?",
      answer:
        "Design & build adalah metode pelaksanaan proyek di mana proses perencanaan desain dan konstruksi dilakukan secara terintegrasi oleh satu kontraktor.",
    },
    {
      question: "Apa keuntungan menggunakan sistem design & build?",
      answer:
        "Keuntungan design & build meliputi koordinasi yang lebih baik, efisiensi biaya, waktu pelaksanaan lebih singkat, serta minim risiko perubahan desain saat konstruksi.",
    },
    {
      question: "Apakah desain dikembangkan oleh tim engineering?",
      answer:
        "Ya. Desain dikembangkan oleh tim engineering dengan mempertimbangkan aspek teknis, fungsionalitas, efisiensi biaya, dan kemudahan pelaksanaan di lapangan.",
    },
  ],

  /* =====================
     PROJECT MANAGEMENT
  ===================== */
  "project-management": [
    {
      question: "Apa peran project management dalam proyek konstruksi?",
      answer:
        "Project management berperan dalam pengendalian biaya, waktu, mutu, serta koordinasi seluruh pihak agar proyek berjalan sesuai rencana dan target.",
    },
    {
      question: "Apakah tersedia laporan progres proyek?",
      answer:
        "Ya. Kami menyediakan laporan progres berkala yang mencakup status pekerjaan, capaian jadwal, kualitas, dan isu teknis yang perlu ditindaklanjuti.",
    },
    {
      question: "Bagaimana pengendalian biaya dan jadwal dilakukan?",
      answer:
        "Pengendalian dilakukan melalui baseline planning, monitoring rutin, evaluasi deviasi, serta tindakan korektif berbasis data lapangan.",
    },
  ],
}
