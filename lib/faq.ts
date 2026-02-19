export type FAQCategory = 
  | 'general' 
  | 'services' 
  | 'technical' 
  | 'project-management' 
  | 'quality-control' 
  | 'commercial'
  | 'after-sales'

export type FAQItem = {
  id?: string                     // Unique ID untuk anchor links
  question: string
  answer: string
  category: FAQCategory           // Kategori untuk grouping
  tags?: string[]                  // Tags untuk filtering/search
  
  // 🔥 SEO & Rich Snippets
  schemaMarkup?: boolean           // Include di JSON-LD
  featured?: boolean                // Tampil di homepage
  order?: number                    // Custom ordering
  
  // 🔥 Analytics
  views?: number                    // Berapa kali dilihat
  helpful?: number                  // Yang klik "helpful"
  notHelpful?: number               // Yang klik "not helpful"
  
  // 🔥 Metadata
  lastUpdated?: string              // Tanggal update
  createdBy?: string                 // Author
  relatedInsights?: string[]        // Artikel terkait
  relatedServices?: string[]        // Layanan terkait
}

export const faqItems: FAQItem[] = [
  {
    id: "project-types",
    question: "Jenis proyek apa yang ditangani PT Manggala Putra Persada?",
    answer: `
      <p>Kami menangani berbagai jenis proyek konstruksi, termasuk:</p>
      <ul>
        <li><strong>Proyek Industri</strong> - pabrik, gudang, fasilitas manufaktur</li>
        <li><strong>Proyek Komersial</strong> - gedung perkantoran, pusat perbelanjaan</li>
        <li><strong>Bangunan Khusus</strong> - rumah sakit, laboratorium, data center</li>
        <li><strong>Struktur Baja</strong> - fabrikasi dan erection baja berat</li>
        <li><strong>Konstruksi Sipil</strong> - infrastruktur, pondasi, beton</li>
        <li><strong>MEP</strong> - mechanical, electrical, plumbing installation</li>
        <li><strong>Design & Build</strong> - integrated design and construction</li>
      </ul>
      <p>Setiap proyek ditangani dengan pendekatan engineering-led untuk memastikan kualitas, keamanan, dan efisiensi biaya.</p>
    `,
    category: 'general',
    tags: ['proyek', 'layanan', 'industri', 'komersial'],
    schemaMarkup: true,
    featured: true,
    order: 1,
    helpful: 45,
    notHelpful: 2,
    lastUpdated: "2025-02-19",
    relatedServices: [
      "/layanan/design-build",
      "/layanan/konstruksi-sipil",
      "/layanan/struktur-baja",
    ],
  },
  
  {
    id: "design-build-services",
    question: "Apakah PT Manggala Putra Persada melayani proyek design & build?",
    answer: `
      <p><strong>Ya, kami menyediakan layanan design & build terintegrasi.</strong></p>
      <p>Dengan pendekatan engineering-led, kami menawarkan:</p>
      <ul>
        <li>Konsultasi engineering sejak tahap konsep</li>
        <li>Koordinasi antara tim desain dan pelaksana</li>
        <li>Optimasi biaya melalui value engineering</li>
        <li>Kepastian waktu dengan perencanaan terpadu</li>
        <li>Single point of responsibility untuk klien</li>
      </ul>
      <p>Keuntungan design & build bersama kami:</p>
      <ul>
        <li>Mengurangi risiko konflik desain</li>
        <li>Mempercepat waktu pelaksanaan</li>
        <li>Kontrol kualitas lebih baik</li>
        <li>Efisiensi biaya konstruksi</li>
      </ul>
    `,
    category: 'services',
    tags: ['design-build', 'layanan', 'engineering'],
    schemaMarkup: true,
    featured: true,
    order: 2,
    helpful: 38,
    notHelpful: 1,
    lastUpdated: "2025-02-19",
    relatedServices: ["/layanan/design-build"],
    relatedInsights: ["/insight/engineering-coordination-design-build"],
  },
  
  {
    id: "quality-control-system",
    question: "Bagaimana sistem quality control yang diterapkan?",
    answer: `
      <p>Quality control kami mengikuti standar industri dengan pendekatan sistematis:</p>
      
      <h4>1. Tahap Perencanaan</h4>
      <ul>
        <li>Inspection & Test Plan (ITP) untuk setiap pekerjaan</li>
        <li>Method statement dan prosedur kerja</li>
        <li>Identifikasi titik kritis pengendalian mutu</li>
      </ul>
      
      <h4>2. Tahap Pelaksanaan</h4>
      <ul>
        <li>Inspeksi material sebelum instalasi</li>
        <li>Pengawasan engineering di setiap tahap</li>
        <li>Pengujian sesuai spesifikasi teknis</li>
        <li>Dokumentasi hasil inspeksi</li>
      </ul>
      
      <h4>3. Tahap Verifikasi</h4>
      <ul>
        <li>Quality control checkpoint</li>
        <li>Pengujian akhir dan commissioning</li>
        <li>Serah terima dengan dokumentasi lengkap</li>
      </ul>
      
      <p>Sistem ini memastikan setiap pekerjaan memenuhi spesifikasi, gambar teknis, dan standar kualitas yang disyaratkan.</p>
    `,
    category: 'quality-control',
    tags: ['quality-control', 'mutu', 'inspeksi', 'standar'],
    schemaMarkup: true,
    featured: true,
    order: 3,
    helpful: 52,
    notHelpful: 3,
    lastUpdated: "2025-02-19",
    relatedInsights: ["/insight/quality-control-construction-sites"],
  },
  
  {
    id: "progress-reporting",
    question: "Apakah tersedia laporan progres proyek?",
    answer: `
      <p><strong>Ya, setiap proyek dilengkapi dengan sistem pelaporan progres yang komprehensif.</strong></p>
      
      <p>Laporan yang tersedia:</p>
      <ul>
        <li><strong>Laporan Harian</strong> - progres pekerjaan, tenaga kerja, material</li>
        <li><strong>Laporan Mingguan</strong> - capaian, kendala, rencana minggu depan</li>
        <li><strong>Laporan Bulanan</strong> - progress fisik, keuangan, S-curve</li>
        <li><strong>Laporan Kualitas</strong> - hasil inspeksi, pengujian material</li>
        <li><strong>Laporan Foto</strong> - dokumentasi perkembangan proyek</li>
      </ul>
      
      <p>Semua laporan dapat diakses melalui sistem monitoring kami dan disajikan dalam format yang mudah dipahami oleh semua stakeholder proyek.</p>
    `,
    category: 'project-management',
    tags: ['laporan', 'progres', 'monitoring', 'reporting'],
    schemaMarkup: true,
    featured: true,
    order: 4,
    helpful: 31,
    notHelpful: 0,
    lastUpdated: "2025-02-19",
  },
  
  // ===== ADDITIONAL FAQS =====
  
  {
    id: "project-cost-estimation",
    question: "Bagaimana cara mendapatkan estimasi biaya proyek?",
    answer: `
      <p>Untuk mendapatkan estimasi biaya proyek yang akurat, Anda dapat:</p>
      <ol>
        <li>Mengisi formulir konsultasi di website kami</li>
        <li>Menghubungi tim kami melalui telepon atau email</li>
        <li>Menjadwalkan meeting untuk membahas spesifikasi proyek</li>
        <li>Menyediakan dokumen seperti gambar atau scope of work</li>
      </ol>
      <p>Tim engineering kami akan melakukan analisis dan memberikan proposal yang mencakup:</p>
      <ul>
        <li>RAB (Rencana Anggaran Biaya) detail</li>
        <li>Jadwal pelaksanaan</li>
        <li>Spesifikasi teknis</li>
        <li>Metode pelaksanaan</li>
      </ul>
    `,
    category: 'commercial',
    tags: ['biaya', 'estimasi', 'proposal', 'rab'],
    order: 5,
    helpful: 27,
  },
  
  {
    id: "project-duration",
    question: "Berapa lama waktu penyelesaian proyek?",
    answer: `
      <p>Durasi proyek sangat tergantung pada:</p>
      <ul>
        <li>Skala dan kompleksitas proyek</li>
        <li>Jenis pekerjaan (sipil, struktur baja, MEP)</li>
        <li>Kondisi lapangan dan aksesibilitas</li>
        <li>Ketersediaan material dan tenaga kerja</li>
      </ul>
      <p>Tim kami akan menyusun jadwal detail di awal proyek dan melakukan monitoring ketat untuk memastikan penyelesaian tepat waktu. Kami juga menerapkan sistem percepatan jika diperlukan untuk mengantisipasi kendala.</p>
    `,
    category: 'project-management',
    tags: ['durasi', 'waktu', 'jadwal'],
    order: 6,
  },
  
  {
    id: "warranty-after-construction",
    question: "Apakah ada garansi setelah proyek selesai?",
    answer: `
      <p><strong>Ya, kami memberikan garansi untuk semua pekerjaan konstruksi.</strong></p>
      <p>Layanan purna jual kami meliputi:</p>
      <ul>
        <li>Garansi struktur sesuai ketentuan kontrak</li>
        <li>Pendampingan operasional dan maintenance</li>
        <li>Layanan perbaikan jika ditemukan defect</li>
        <li>Konsultasi teknis untuk pengembangan</li>
      </ul>
      <p>Komitmen kami adalah memberikan kepuasan jangka panjang untuk setiap proyek yang kami kerjakan.</p>
    `,
    category: 'after-sales',
    tags: ['garansi', 'purna-jual', 'maintenance'],
    order: 7,
    featured: true,
  },
  
  {
    id: "certifications-standards",
    question: "Sertifikasi dan standar apa yang dimiliki perusahaan?",
    answer: `
      <p>PT Manggala Putra Persada memiliki berbagai sertifikasi dan mengikuti standar industri:</p>
      <ul>
        <li>ISO 9001:2015 untuk sistem manajemen mutu</li>
        <li>ISO 14001:2015 untuk manajemen lingkungan</li>
        <li>ISO 45001:2018 untuk K3</li>
        <li>SMK3 (Sistem Manajemen K3) dari Kemnaker RI</li>
        <li>Anggota GAPEKSINDO dan ASPEKINDO</li>
        <li>Kualifikasi usaha BUMN dan swasta</li>
      </ul>
      <p>Sertifikasi ini menjadi bukti komitmen kami terhadap kualitas, keselamatan, dan profesionalisme.</p>
    `,
    category: 'general',
    tags: ['sertifikasi', 'iso', 'kualifikasi', 'standar'],
    order: 8,
    featured: true,
  },
]
