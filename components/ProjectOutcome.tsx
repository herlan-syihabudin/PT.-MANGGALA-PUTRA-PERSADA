import { 
  Calendar, 
  Shield, 
  CheckCircle,
  Award,
  Target,
  Zap,
  ChevronRight,
  Sparkles,
  Star,
  Users,
  Building2,
  HardHat,
  PenTool
} from "lucide-react"
import Link from "next/link"

export function ProjectOutcome() {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold accent blobs */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] bg-red-600/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        {/* Floating particles - lebih subtle */}
        <div className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-gold/20 rounded-full animate-float-slow" />
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-red-600/10 rounded-full animate-float-slower" />
        
        {/* Decorative lines */}
        <div className="absolute top-1/3 left-0 w-40 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ===== HEADER SECTION - TUNED ===== */}
        <div className="max-w-3xl mb-10">
          {/* Badge - konsisten dengan WhyChooseUs */}
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
              <Award size={14} className="text-gold" />
              <span className="text-xs font-semibold text-gold">
                Kinerja Pelaksanaan Proyek
              </span>
            </div>
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
          </div>

          {/* Title - ukuran diturunkan */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Pelaksanaan Proyek dengan Pendekatan{' '}
            <span className="text-gold block mt-1 text-lg md:text-xl">
              Kerja yang Terstruktur
            </span>
          </h2>

          {/* Gold divider sederhana */}
          <div className="relative mt-4">
            <div className="h-[2px] w-16 bg-gold rounded-full" />
            <div className="h-[2px] w-10 bg-gold/30 rounded-full mt-1" />
          </div>

          {/* Description - konsisten font size */}
          <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
            Setiap proyek dilaksanakan dengan perencanaan dan metode kerja yang
terstruktur untuk menjaga kualitas pekerjaan, ketepatan waktu pelaksanaan,
serta keselamatan kerja di lapangan. Kami berupaya memastikan hasil
konstruksi dapat mendukung kebutuhan operasional klien dengan baik.
          </p>
        </div>

        {/* ===== STATS COUNTERS - UKURAN DIKECILKAN ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative p-4 text-center">
                <div className="text-lg md:text-xl font-bold bg-gradient-to-br from-gold to-amber-600 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <p className="text-xs font-semibold text-gray-900 mb-0.5">{stat.label}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== OUTCOME CARDS - UKURAN DIKECILKAN ===== */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          
          {outcomes.map((outcome, index) => {
            const isHighlighted = index === 1
            
            return (
              <div 
                key={index}
                className={`
                  group relative bg-white border rounded-xl p-5 
                  transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                  ${isHighlighted 
                    ? 'border-t-4 border-gold shadow-md shadow-gold/10' 
                    : 'border-gray-200 shadow-sm hover:border-gold/40'
                  }
                  overflow-hidden
                `}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                {/* Icon */}
                <div className="relative mb-4">
                  <div className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110
                    ${isHighlighted 
                      ? 'bg-gradient-to-br from-gold to-amber-500 shadow-md shadow-gold/30' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-gold/20 group-hover:to-amber-50'
                    }
                  `}>
                    <outcome.icon 
                      size={22} 
                      className={isHighlighted ? 'text-white' : 'text-gray-600 group-hover:text-gold'} 
                    />
                  </div>
                </div>

                {/* Title dengan badge */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    {outcome.title}
                  </h3>
                  {isHighlighted && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-gold to-amber-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                      Most Valued
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {outcome.description}
                </p>

                {/* Key metrics */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Target size={12} className="text-gold" />
                      {outcome.metric.label}
                    </span>
                    <span className="font-bold text-sm text-gold">{outcome.metric.value}</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-gold via-amber-400 to-gold rounded-full"
                      style={{ width: outcome.metric.percentage }}
                    />
                  </div>
                </div>

                {/* Hover effect arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <div className="p-1 bg-gold/10 rounded-full">
                    <ChevronRight size={14} className="text-gold" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ===== ADDITIONAL VALUE PROPOSITIONS - UKURAN DIKECILKAN ===== */}
        <div className="grid lg:grid-cols-2 gap-4 mb-12">
          
          {/* Client Testimonial Snapshot */}
          <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center" />
            </div>
            
            <div className="relative">
              {/* Star rating */}
              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="fill-gold text-gold" />
                ))}
                <span className="ml-2 text-xs text-gray-300">5.0</span>
              </div>

              {/* Testimonial text */}
              <div className="relative">
                <span className="absolute -top-3 -left-1 text-4xl text-gold/20 font-serif">"</span>
                <p className="text-sm italic text-gray-300 leading-relaxed pl-3">
                  Pelaksanaan proyek berjalan sesuai jadwal dengan koordinasi yang baik
di lapangan. Pendekatan kerja yang terstruktur membantu pekerjaan
berjalan lebih lancar.
                </p>
              </div>

              {/* Author info */}
              <div className="mt-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Operations Director</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Building2 size={12} />
                    Major Industrial Client
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Mini */}
          <div className="group relative bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-center hover:border-gold/30 transition-all hover:shadow-lg overflow-hidden">
            {/* Icon decoratif */}
            <div className="absolute top-3 right-3 opacity-5">
              <HardHat size={60} className="text-gold" />
            </div>
            
            <h4 className="text-base font-bold text-gray-900 mb-2 relative">
              Sedang merencanakan proyek konstruksi?
            </h4>
            
            <p className="text-xs text-gray-600 mb-4 relative leading-relaxed">
              Diskusikan kebutuhan proyek Anda bersama tim kami untuk mengetahui
bagaimana pendekatan kerja kami dapat mendukung pelaksanaan proyek Anda.
            </p>
            
            <Link 
              href="/kontak"
              className="relative inline-flex items-center gap-2 bg-gradient-to-r from-gold to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-md transition-all group/btn w-fit"
            >
              <span>Konsultasikan Proyek Anda</span>
              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>

            {/* Trust badges */}
            <div className="mt-4 flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-gold" />
                Fast Response
              </span>
              <span className="flex items-center gap-1">
                <PenTool size={10} className="text-gold" />
                Free Consultation
              </span>
            </div>
          </div>
        </div>

        {/* ===== DISCLAIMER - SEDERHANA ===== */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative text-xs text-gray-400 border border-gray-200 bg-white/50 rounded-xl px-5 py-3 flex items-start gap-2">
            <span className="text-gold text-xs">ⓘ</span>
            <p>
              Hasil proyek dapat berbeda tergantung pada ruang lingkup pekerjaan,
kondisi lapangan, serta kebutuhan spesifik dari masing-masing klien.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

// Data (100% SAME)
const stats = [
  { 
    value: "Tim Berpengalaman", 
    label: "Latar Belakang Engineering", 
    description: "Berpengalaman di proyek konstruksi industri"
  },
  { 
    value: "Pendekatan Terstruktur", 
    label: "Metode Pelaksanaan", 
    description: "Perencanaan teknis dan pengendalian proyek"
  },
  { 
    value: "Kualitas Pekerjaan", 
    label: "Standar Konstruksi", 
    description: "Mengutamakan mutu dan keselamatan kerja"
  },
  { 
    value: "Fokus Industri", 
    label: "Proyek Industrial & Komersial", 
    description: "Gudang, pabrik, dan fasilitas produksi"
  },
]

const outcomes = [
  {
    icon: Calendar,
    title: "Ketepatan Waktu Pelaksanaan",
    description: "Proyek dilaksanakan sesuai jadwal yang telah disepakati sehingga klien dapat mempersiapkan instalasi peralatan, proses commissioning, serta kegiatan operasional tanpa mengalami keterlambatan.",
    metric: { label: "On-time delivery", value: "98%", percentage: "98%" }
  },
  {
    icon: Shield,
    title: "Pengendalian Risiko Pelaksanaan",
    description: "Perencanaan teknis serta koordinasi pekerjaan yang baik membantu mengurangi pekerjaan ulang, perbedaan gambar kerja, serta penyesuaian di lapangan selama proses konstruksi berlangsung.",
    metric: { label: "Risk reduction", value: "75%", percentage: "75%" }
  },
  {
    icon: CheckCircle,
    title: "Kesiapan Operasional",
    description: "Struktur dan sistem yang telah selesai dikerjakan diserahkan kepada klien dalam kondisi siap untuk proses pengujian, commissioning, serta digunakan dalam kegiatan operasional.",
    metric: { label: "Zero defects", value: "95%", percentage: "95%" }
  }
]
