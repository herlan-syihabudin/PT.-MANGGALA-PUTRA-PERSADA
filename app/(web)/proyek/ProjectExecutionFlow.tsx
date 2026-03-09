import Link from "next/link"
import {
  ClipboardList,
  Search,
  PenTool,
  Calculator,
  Package,
  HardHat,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Timer,
  Trophy
} from "lucide-react"

export const steps = [
  {
    number: "01",
    title: "Kick-Off Proyek & Analisis Kebutuhan",
    description:
      "Tahap awal dimulai dengan diskusi bersama klien untuk memahami kebutuhan proyek, ruang lingkup pekerjaan, target waktu, anggaran, serta standar teknis yang diinginkan.",
    icon: ClipboardList,
    color: "from-blue-500 to-cyan-500",
    lightColor: "blue",
    stats: "Diskusi mendalam"
  },
  {
    number: "02",
    title: "Survei Lapangan & Kajian Teknis",
    description:
      "Tim melakukan survei lokasi untuk mengumpulkan data kondisi eksisting seperti struktur bangunan, utilitas, akses kerja, serta potensi kendala teknis di lapangan.",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    lightColor: "purple",
    stats: "Data akurat"
  },
  {
    number: "03",
    title: "Perencanaan & Desain Teknis",
    description:
      "Penyusunan gambar kerja dan kajian teknis dilakukan untuk memastikan solusi konstruksi yang efisien, aman, dan sesuai dengan kebutuhan proyek.",
    icon: PenTool,
    color: "from-amber-500 to-orange-500",
    lightColor: "amber",
    stats: "Solusi optimal"
  },
  {
    number: "04",
    title: "Penyusunan Anggaran & Jadwal Proyek",
    description:
      "Penyusunan Rencana Anggaran Biaya (RAB) serta jadwal pelaksanaan proyek dilakukan secara sistematis untuk mendukung pengendalian biaya dan waktu.",
    icon: Calculator,
    color: "from-emerald-500 to-teal-500",
    lightColor: "emerald",
    stats: "Biaya terkendali"
  },
  {
    number: "05",
    title: "Pengadaan Material & Pengendalian Mutu",
    description:
      "Material dipilih sesuai spesifikasi teknis dengan proses pengadaan yang terkontrol untuk menjaga kualitas material yang digunakan.",
    icon: Package,
    color: "from-red-500 to-rose-500",
    lightColor: "red",
    stats: "Material teruji"
  },
  {
    number: "06",
    title: "Pelaksanaan Konstruksi & Instalasi",
    description:
      "Pekerjaan konstruksi dan instalasi dilaksanakan oleh tim berpengalaman dengan pengawasan lapangan serta penerapan standar keselamatan kerja.",
    icon: HardHat,
    color: "from-indigo-500 to-blue-500",
    lightColor: "indigo",
    stats: "Tim ahli"
  },
  {
    number: "07",
    title: "Pemeriksaan Akhir & Serah Terima",
    description:
      "Tahap akhir meliputi pemeriksaan hasil pekerjaan, penyelesaian detail proyek, serta serah terima kepada klien sesuai ruang lingkup yang disepakati.",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-500",
    lightColor: "green",
    stats: "Hasil terjamin"
  },
]

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100",
    text: "text-blue-600",
    hoverText: "group-hover:text-blue-700",
    shadow: "shadow-blue-500/10"
  },
  purple: {
    bg: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
    text: "text-purple-600",
    hoverText: "group-hover:text-purple-700",
    shadow: "shadow-purple-500/10"
  },
  amber: {
    bg: "bg-amber-50",
    hoverBg: "group-hover:bg-amber-100",
    text: "text-amber-600",
    hoverText: "group-hover:text-amber-700",
    shadow: "shadow-amber-500/10"
  },
  emerald: {
    bg: "bg-emerald-50",
    hoverBg: "group-hover:bg-emerald-100",
    text: "text-emerald-600",
    hoverText: "group-hover:text-emerald-700",
    shadow: "shadow-emerald-500/10"
  },
  red: {
    bg: "bg-red-50",
    hoverBg: "group-hover:bg-red-100",
    text: "text-red-600",
    hoverText: "group-hover:text-red-700",
    shadow: "shadow-red-500/10"
  },
  indigo: {
    bg: "bg-indigo-50",
    hoverBg: "group-hover:bg-indigo-100",
    text: "text-indigo-600",
    hoverText: "group-hover:text-indigo-700",
    shadow: "shadow-indigo-500/10"
  },
  green: {
    bg: "bg-green-50",
    hoverBg: "group-hover:bg-green-100",
    text: "text-green-600",
    hoverText: "group-hover:text-green-700",
    shadow: "shadow-green-500/10"
  }
}

export default function ProjectExecutionFlow() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      
      {/* Background Elements - Lebih subtle dan modern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Connecting Lines (pseudo elements untuk efek connecting antar card) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* HEADER - Dipercantik dengan badge dan dekorasi */}
        <div className="max-w-3xl mb-16">
          {/* Badge dengan efek */}
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <span className="text-sm font-semibold text-gold uppercase tracking-[0.2em]">
              Alur Kerja Terstruktur
            </span>
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>

          {/* Title dengan gradient dan dekorasi */}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              7 Tahapan{' '}
              <span className="bg-gradient-to-r from-red-600 to-gold bg-clip-text text-transparent relative">
                Pelaksanaan Proyek
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0,5 Q50,0 100,5 T200,5" stroke="currentColor" strokeWidth="2" fill="none" className="text-gold/30" />
                </svg>
              </span>
            </h2>
          </div>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Setiap proyek dilaksanakan melalui tahapan kerja yang terencana
            mulai dari analisis kebutuhan hingga pelaksanaan di lapangan
            untuk menjaga kualitas pekerjaan, ketepatan waktu, dan koordinasi tim.
          </p>

          {/* Quick Stats - Menambah kredibilitas */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-gold" />
              <span className="text-sm text-gray-600">7 Tahapan Terstruktur</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-gold" />
              <span className="text-sm text-gray-600">Quality Control di Setiap Fase</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              <span className="text-sm text-gray-600">Hasil Terukur & Terjamin</span>
            </div>
          </div>
        </div>

        {/* STEPS GRID - Dengan desain card yang lebih modern */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 auto-rows-fr">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLastInRow = (index + 1) % 3 === 0
            const isMiddle = (index + 1) % 3 === 2
      const style = colorStyles[step.lightColor]
            
            return (
  <div
    id={`step-${step.number}`}
    key={step.number}
    className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-transparent overflow-hidden scroll-mt-24"
  >
                {/* Background Gradient on Hover */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 
                  transition-opacity duration-500 pointer-events-none
                `} />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Number Badge - Lebih menonjol */}
                <div className="absolute top-4 right-4 text-4xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none">
                  {step.number}
                </div>

                {/* Content dengan layout yang lebih baik */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header dengan icon yang lebih hidup */}
                  <div className="flex items-start justify-between mb-5">
                    <div
  className={`
    w-14 h-14 rounded-xl flex items-center justify-center
    ${style.bg} ${style.hoverBg}
    transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
    shadow-lg ${style.shadow}
  `}
>
                      <Icon 
 size={28} 
 className={`${style.text} ${style.hoverText} transition-colors`} 
/>
                    </div>
                    
                    {/* Stats tag - subtle */}
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {step.stats}
                    </span>
                  </div>

                  {/* Title dengan efek garis bawah */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description dengan line-clamp */}
                  <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                    {step.description}
                  </p>

                  {/* Step indicator - subtle link */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    <span>Tahap {step.number}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Corner Accent untuk card tertentu */}
                {index % 2 === 0 && (
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gold/5 to-transparent rounded-tr-[32px] pointer-events-none" />
                )}
              </div>
            )
          })}
        </div>

        {/* BOTTOM CTA - Menghubungkan ke action berikutnya */}
        {/* BOTTOM CTA - Menghubungkan ke action berikutnya */}
<div className="mt-16 text-center">
  <Link  // ⬅️ GANTI DIV JADI LINK
    href="#step-01"  // ⬅️ TAMBAH HREF
    className="inline-flex items-center gap-3 bg-gold/5 px-8 py-4 rounded-full border border-gold/20 hover:bg-gold/10 transition-all group"
  >
    <span className="font-semibold text-gold">
      Lihat Detail Setiap Tahapan
    </span>
    <ArrowRight size={18} className="text-gold group-hover:translate-x-1 transition-transform" />
  </Link>  {/* ⬅️ TAMBAH TAG PENUTUP */}

  {/* Progress Indicator */}
  <div className="flex justify-center gap-2 mt-8">
    {steps.map((_, i) => (
      <div 
        key={i}
        className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gold/50 transition-colors cursor-pointer"
        title={`Tahap ${i + 1}`}
      />
    ))}
  </div>
</div>
      </div>
    </section>
  )
}  {
    number: "03",
    title: "Perencanaan & Desain Teknis",
    description:
      "Penyusunan gambar kerja dan kajian teknis dilakukan untuk memastikan solusi konstruksi yang efisien, aman, dan sesuai dengan kebutuhan proyek.",
    icon: PenTool,
    color: "from-amber-500 to-orange-500",
    lightColor: "amber",
    stats: "Solusi optimal"
  },
  {
    number: "04",
    title: "Penyusunan Anggaran & Jadwal Proyek",
    description:
      "Penyusunan Rencana Anggaran Biaya (RAB) serta jadwal pelaksanaan proyek dilakukan secara sistematis untuk mendukung pengendalian biaya dan waktu.",
    icon: Calculator,
    color: "from-emerald-500 to-teal-500",
    lightColor: "emerald",
    stats: "Biaya terkendali"
  },
  {
    number: "05",
    title: "Pengadaan Material & Pengendalian Mutu",
    description:
      "Material dipilih sesuai spesifikasi teknis dengan proses pengadaan yang terkontrol untuk menjaga kualitas material yang digunakan.",
    icon: Package,
    color: "from-red-500 to-rose-500",
    lightColor: "red",
    stats: "Material teruji"
  },
  {
    number: "06",
    title: "Pelaksanaan Konstruksi & Instalasi",
    description:
      "Pekerjaan konstruksi dan instalasi dilaksanakan oleh tim berpengalaman dengan pengawasan lapangan serta penerapan standar keselamatan kerja.",
    icon: HardHat,
    color: "from-indigo-500 to-blue-500",
    lightColor: "indigo",
    stats: "Tim ahli"
  },
  {
    number: "07",
    title: "Pemeriksaan Akhir & Serah Terima",
    description:
      "Tahap akhir meliputi pemeriksaan hasil pekerjaan, penyelesaian detail proyek, serta serah terima kepada klien sesuai ruang lingkup yang disepakati.",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-500",
    lightColor: "green",
    stats: "Hasil terjamin"
  },
]

const colorStyles = {
  blue: {
    bg: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100",
    text: "text-blue-600",
    hoverText: "group-hover:text-blue-700",
    shadow: "shadow-blue-500/10"
  },
  purple: {
    bg: "bg-purple-50",
    hoverBg: "group-hover:bg-purple-100",
    text: "text-purple-600",
    hoverText: "group-hover:text-purple-700",
    shadow: "shadow-purple-500/10"
  },
  amber: {
    bg: "bg-amber-50",
    hoverBg: "group-hover:bg-amber-100",
    text: "text-amber-600",
    hoverText: "group-hover:text-amber-700",
    shadow: "shadow-amber-500/10"
  },
  emerald: {
    bg: "bg-emerald-50",
    hoverBg: "group-hover:bg-emerald-100",
    text: "text-emerald-600",
    hoverText: "group-hover:text-emerald-700",
    shadow: "shadow-emerald-500/10"
  },
  red: {
    bg: "bg-red-50",
    hoverBg: "group-hover:bg-red-100",
    text: "text-red-600",
    hoverText: "group-hover:text-red-700",
    shadow: "shadow-red-500/10"
  },
  indigo: {
    bg: "bg-indigo-50",
    hoverBg: "group-hover:bg-indigo-100",
    text: "text-indigo-600",
    hoverText: "group-hover:text-indigo-700",
    shadow: "shadow-indigo-500/10"
  },
  green: {
    bg: "bg-green-50",
    hoverBg: "group-hover:bg-green-100",
    text: "text-green-600",
    hoverText: "group-hover:text-green-700",
    shadow: "shadow-green-500/10"
  }
}

export default function ProjectExecutionFlow() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      
      {/* Background Elements - Lebih subtle dan modern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-300" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* HEADER DIHAPUS - Karena sudah ada di halaman utama */}

        {/* STEPS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 auto-rows-fr">
          {steps.map((step, index) => {
            const Icon = step.icon
            const style = colorStyles[step.lightColor]
            
            return (
              <div
                id={`step-${step.number}`}
                key={step.number}
                className="group relative bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-transparent overflow-hidden scroll-mt-24"
              >
                {/* Background Gradient on Hover */}
                <div className={`
                  absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 
                  transition-opacity duration-500 pointer-events-none
                `} />

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Number Badge */}
                <div className="absolute top-4 right-4 text-4xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none">
                  {step.number}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header dengan icon */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`
                        w-14 h-14 rounded-xl flex items-center justify-center
                        ${style.bg} ${style.hoverBg}
                        transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                        shadow-lg ${style.shadow}
                      `}
                    >
                      <Icon size={28} className={`${style.text} ${style.hoverText} transition-colors`} />
                    </div>
                    
                    {/* Stats tag */}
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      {step.stats}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-sm flex-grow">
                    {step.description}
                  </p>

                  {/* Step indicator */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    <span>Tahap {step.number}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Corner Accent */}
                {index % 2 === 0 && (
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gold/5 to-transparent rounded-tr-[32px] pointer-events-none" />
                )}
              </div>
            )
          })}
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-16 text-center">
          <Link
            href="#step-01"
            className="inline-flex items-center gap-3 bg-gold/5 px-8 py-4 rounded-full border border-gold/20 hover:bg-gold/10 transition-all group"
          >
            <span className="font-semibold text-gold">
              Lihat Detail Setiap Tahapan
            </span>
            <ArrowRight size={18} className="text-gold group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gold/50 transition-colors cursor-pointer"
                title={`Tahap ${i + 1}`}
                onClick={() => {
                  document.getElementById(`step-${steps[i].number}`)?.scrollIntoView({ 
                    behavior: 'smooth' 
                  })
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
