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
    <section className="relative py-28 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS - ENHANCED ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold accent blobs dengan animasi lebih halus */}
        <div className="absolute -top-32 -right-32 w-[620px] h-[620px] bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-32 w-[560px] h-[560px] bg-red-600/5 rounded-full blur-3xl animate-pulse-slower" />
        
        {/* Multiple grid layers untuk depth */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        {/* Floating particles - lebih banyak dan bervariasi */}
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-gold/20 rounded-full animate-float-slow" />
        <div className="absolute top-60 left-2/3 w-3 h-3 bg-gold/20 rounded-full animate-float-delayed" />
        <div className="absolute bottom-40 right-1/4 w-4 h-4 bg-red-600/10 rounded-full animate-float-slower" />
        <div className="absolute bottom-60 left-1/3 w-2 h-2 bg-gold/30 rounded-full animate-ping-slow" />
        
        {/* Decorative lines - lebih elegan */}
        <div className="absolute top-1/3 left-0 w-64 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-1/3 right-0 w-64 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== HEADER SECTION - ENHANCED ===== */}
        <div className="max-w-3xl mb-16">
          {/* Badge dengan icon dan efek glow */}
          <div className="inline-flex items-center gap-3 mb-6 relative">
            <div className="absolute -inset-1 bg-gold/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition" />
            <div className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold/10 to-amber-50 border border-gold/20 rounded-full shadow-sm">
              <Award size={18} className="text-gold" />
              <span className="text-sm font-semibold bg-gradient-to-r from-gold to-amber-600 bg-clip-text text-transparent">
                Kinerja Pelaksanaan Proyek
              </span>
              <Sparkles size={14} className="text-gold/60" />
            </div>
          </div>

          {/* Title dengan efek lebih dramatis */}
          <div className="relative">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
              Pelaksanaan Proyek dengan Pendekatan 
              <span className="relative inline-block mt-2">
                <span className="bg-gradient-to-r from-gold via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                  {' '}Kerja yang Terstruktur
                </span>
                {/* Underline effect yang lebih cantik */}
                <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path 
                    d="M0,8 Q75,0 150,8 T300,8" 
                    stroke="url(#goldGradient)" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
          </div>

          {/* Gold divider dengan efek lebih kaya */}
          <div className="relative mt-8">
            <div className="flex items-center gap-2">
              <div className="h-[3px] w-20 bg-gradient-to-r from-gold to-amber-400 rounded-full" />
              <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-gold/50 rounded-full" />
              <div className="h-[3px] w-6 bg-gold/30 rounded-full" />
            </div>
            <div className="flex items-center gap-2 mt-1 ml-1">
              <div className="h-[2px] w-16 bg-gold/20 rounded-full" />
              <div className="h-[2px] w-8 bg-gold/10 rounded-full" />
            </div>
          </div>

          {/* Description dengan styling lebih baik */}
          <div className="mt-8 relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-gold via-amber-400 to-transparent rounded-full" />
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl pl-6 italic">
              Setiap proyek dilaksanakan dengan perencanaan dan metode kerja yang
terstruktur untuk menjaga kualitas pekerjaan, ketepatan waktu pelaksanaan,
serta keselamatan kerja di lapangan. Kami berupaya memastikan hasil
konstruksi dapat mendukung kebutuhan operasional klien dengan baik.
            </p>
          </div>
        </div>

        {/* ===== STATS COUNTERS - ENHANCED ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gold/10 to-transparent rounded-bl-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-6 text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-br from-gold to-amber-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{stat.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{stat.description}</p>
                
                {/* Subtle indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gold/20 rounded-full group-hover:w-12 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== OUTCOME CARDS - ENHANCED ===== */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          
          {outcomes.map((outcome, index) => {
            const isHighlighted = index === 1
            
            return (
              <div 
                key={index}
                className={`
                  group relative bg-white border rounded-2xl p-8 
                  transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl
                  ${isHighlighted 
                    ? 'border-t-4 border-gold shadow-xl shadow-gold/10 scale-105 md:scale-100' 
                    : 'border-gray-200 shadow-lg hover:border-gold/40'
                  }
                  overflow-hidden
                `}
              >
                {/* Shine effect untuk semua card */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1)_0%,transparent_50%)]" />
                </div>

                {/* Icon dengan efek lebih hidup */}
                <div className="relative mb-6">
                  <div className={`
                    absolute -inset-1 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition
                    ${isHighlighted ? 'bg-gold' : 'bg-gray-400'}
                  `} />
                  <div className={`
                    relative w-16 h-16 rounded-xl flex items-center justify-center
                    transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                    ${isHighlighted 
                      ? 'bg-gradient-to-br from-gold to-amber-500 shadow-lg shadow-gold/30' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-gold/20 group-hover:to-amber-50'
                    }
                  `}>
                    <outcome.icon 
                      size={32} 
                      className={isHighlighted 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-gold transition-colors'
                      } 
                    />
                  </div>
                </div>

                {/* Title dengan badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {outcome.title}
                  </h3>
                  {isHighlighted && (
                    <span className="relative px-3 py-1.5 bg-gradient-to-r from-gold to-amber-500 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap">
                      <span className="relative z-10">Most Valued</span>
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
                    </span>
                  )}
                </div>

                {/* Description dengan line height lebih baik */}
                <p className="text-gray-600 leading-relaxed mb-6 min-h-[120px]">
                  {outcome.description}
                </p>

                {/* Key metrics dengan desain lebih menarik */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Target size={14} className="text-gold" />
                      {outcome.metric.label}
                    </span>
                    <span className="font-bold text-lg text-gold">{outcome.metric.value}</span>
                  </div>
                  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-gold via-amber-400 to-gold rounded-full"
                      style={{ width: outcome.metric.percentage }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </div>
                  </div>
                </div>

                {/* Hover effect arrow - lebih halus */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <div className="p-2 bg-gold/10 rounded-full">
                    <ChevronRight size={18} className="text-gold" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ===== ADDITIONAL VALUE PROPOSITIONS - ENHANCED ===== */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          
          {/* Client Testimonial Snapshot - lebih premium */}
          <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center" />
            </div>
            
            {/* Gold accent */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Star rating dengan animasi */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star, i) => (
                  <div key={star} className="relative group/star">
                    <Star 
                      size={24} 
                      className="fill-gold text-gold drop-shadow-lg animate-pulse-glow" 
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                ))}
                <span className="ml-2 text-sm text-gray-300">5.0</span>
              </div>

              {/* Testimonial text dengan quote style */}
              <div className="relative">
                <span className="absolute -top-4 -left-2 text-6xl text-gold/20 font-serif">"</span>
                <p className="text-lg italic text-gray-300 leading-relaxed pl-4">
                  Pelaksanaan proyek berjalan sesuai jadwal dengan koordinasi yang baik
di lapangan. Pendekatan kerja yang terstruktur membantu pekerjaan
berjalan lebih lancar.
                </p>
              </div>

              {/* Author info */}
              <div className="mt-6 flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div>
                  <p className="font-bold text-lg">Operations Director</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Building2 size={14} />
                    Major Industrial Client
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Mini - lebih engaging */}
          <div className="group relative bg-white border-2 border-gray-200 rounded-3xl p-8 flex flex-col justify-center hover:border-gold/30 transition-all hover:shadow-2xl overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Icon decoratif */}
            <div className="absolute top-4 right-4 opacity-10">
              <HardHat size={80} className="text-gold" />
            </div>
            
            <h4 className="text-2xl font-bold text-gray-900 mb-3 relative">
              Sedang merencanakan proyek konstruksi?
            </h4>
            
            <p className="text-gray-600 mb-8 relative leading-relaxed">
              Diskusikan kebutuhan proyek Anda bersama tim kami untuk mengetahui
bagaimana pendekatan kerja kami dapat mendukung pelaksanaan proyek Anda.
            </p>
            
            <Link 
              href="/kontak"
              className="relative inline-flex items-center gap-3 bg-gradient-to-r from-gold to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all group/btn w-fit"
            >
              <span>Konsultasikan Proyek Anda</span>
              <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 rounded-xl" />
            </Link>

            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Zap size={12} className="text-gold" />
                Fast Response
              </span>
              <span className="flex items-center gap-1">
                <PenTool size={12} className="text-gold" />
                Free Consultation
              </span>
            </div>
          </div>
        </div>

        {/* ===== DISCLAIMER - ENHANCED ===== */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent rounded-full blur-xl" />
          <div className="relative text-sm text-gray-400 border border-gray-200/80 bg-white/50 backdrop-blur-sm rounded-2xl px-8 py-5 flex items-start gap-3 shadow-sm">
            <div className="p-1 bg-gold/10 rounded-full shrink-0">
              <span className="block w-4 h-4 text-gold text-center text-xs font-bold">ⓘ</span>
            </div>
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

// Data (100% SAME - TIDAK DIUBAH)
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
    description: "Proyek dilaksanakan sesuai jadwal yang telah disepakati sehingga klien\ndapat mempersiapkan instalasi peralatan, proses commissioning, serta kegiatan operasional tanpa mengalami keterlambatan.",
    metric: { label: "On-time delivery", value: "98%", percentage: "98%" }
  },
  {
    icon: Shield,
    title: "Pengendalian Risiko Pelaksanaan",
    description: "Perencanaan teknis serta koordinasi pekerjaan yang baik membantu\nmengurangi pekerjaan ulang, perbedaan gambar kerja, serta penyesuaian\ndi lapangan selama proses konstruksi berlangsung.",
    metric: { label: "Risk reduction", value: "75%", percentage: "75%" }
  },
  {
    icon: CheckCircle,
    title: "Kesiapan Operasional",
    description: "Struktur dan sistem yang telah selesai dikerjakan diserahkan kepada klien\ndalam kondisi siap untuk proses pengujian, commissioning, serta\ndigunakan dalam kegiatan operasional.",
    metric: { label: "Zero defects", value: "95%", percentage: "95%" }
  }
]
