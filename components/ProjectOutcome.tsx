import { 
  Calendar, 
  Shield, 
  CheckCircle,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Target,
  Zap,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

export function ProjectOutcome() {
  return (
    <section className="relative py-28 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold accent blobs */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] bg-red-600/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Floating particles */}
        <div className="absolute top-40 left-1/4 w-2 h-2 bg-gold/30 rounded-full animate-float-slow" />
        <div className="absolute bottom-40 right-1/4 w-3 h-3 bg-red-600/30 rounded-full animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===== HEADER SECTION ===== */}
        <div className="max-w-3xl mb-16">
          {/* Badge dengan icon */}
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full">
            <Award size={16} className="text-gold" />
            <span className="text-sm font-semibold text-gold">Kinerja Pelaksanaan Proyek</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Pelaksanaan Proyek dengan Pendekatan 
            <span className="bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent"> Kerja yang Terstruktur</span>
          </h2>

          {/* Gold divider dengan efek */}
          <div className="relative mt-6">
            <div className="h-[3px] w-20 bg-gold rounded-full" />
            <div className="h-[3px] w-12 bg-gold/50 rounded-full mt-1" />
          </div>

          <p className="mt-8 text-lg text-gray-700 leading-relaxed max-w-2xl">
            Setiap proyek dilaksanakan dengan perencanaan dan metode kerja yang
terstruktur untuk menjaga kualitas pekerjaan, ketepatan waktu pelaksanaan,
serta keselamatan kerja di lapangan. Kami berupaya memastikan hasil
konstruksi dapat mendukung kebutuhan operasional klien dengan baik.
          </p>
        </div>

        {/* ===== STATS COUNTERS (TRUST BUILDERS) ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
              <div className="text-3xl font-black text-gold mb-2">{stat.value}</div>
              <p className="text-sm font-semibold text-gray-900">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* ===== OUTCOME CARDS - ENHANCED ===== */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {outcomes.map((outcome, index) => (
            <div 
              key={index}
              className={`
                group relative bg-white border rounded-2xl p-8 
                transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl
                ${index === 1 ? 'border-t-4 border-gold shadow-lg' : 'border-gray-200 shadow-soft hover:border-gold/50'}
              `}
            >
              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-6
                ${index === 1 ? 'bg-gold/20' : 'bg-gray-100 group-hover:bg-gold/20 transition-colors'}
              `}>
                <outcome.icon 
                  size={28} 
                  className={index === 1 ? 'text-gold' : 'text-gray-600 group-hover:text-gold transition-colors'} 
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                {outcome.title}
                {index === 1 && (
                  <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-full">Most Valued</span>
                )}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {outcome.description}
              </p>

              {/* Key metrics untuk setiap outcome */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{outcome.metric.label}</span>
                  <span className="font-bold text-gold">{outcome.metric.value}</span>
                </div>
                <div className="mt-2 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full"
                    style={{ width: outcome.metric.percentage }}
                  />
                </div>
              </div>

              {/* Hover effect arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition">
                <ChevronRight size={20} className="text-gold" />
              </div>
            </div>
          ))}
        </div>

        {/* ===== ADDITIONAL VALUE PROPOSITIONS ===== */}
        <div className="mt-20 grid md:grid-cols-2 gap-8">
          
          {/* Client Testimonial Snapshot */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 fill-gold" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-lg italic text-gray-300">
              ""Pelaksanaan proyek berjalan sesuai jadwal dengan koordinasi yang baik
di lapangan. Pendekatan kerja yang terstruktur membantu pekerjaan
berjalan lebih lancar.""
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700" />
              <div>
                <p className="font-semibold">Operations Director</p>
                <p className="text-sm text-gray-400">Major Industrial Client</p>
              </div>
            </div>
          </div>

          {/* CTA Mini */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col justify-center">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Sedang merencanakan proyek konstruksi?
            </h4>
            <p className="text-gray-600 mb-6">
              Diskusikan kebutuhan proyek Anda bersama tim kami untuk mengetahui
bagaimana pendekatan kerja kami dapat mendukung pelaksanaan proyek Anda.
            </p>
            <Link 
              href="/kontak"
              className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
            >
              Konsultasikan Proyek Anda
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* ===== DISCLAIMER (Enhanced) ===== */}
        <div className="mt-16 max-w-3xl text-sm text-gray-400 border-t border-gray-200 pt-8">
          <p>
            ⓘ Hasil proyek dapat berbeda tergantung pada ruang lingkup pekerjaan,
kondisi lapangan, serta kebutuhan spesifik dari masing-masing klien.
          </p>
        </div>

      </div>
    </section>
  )
}

// Data
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
    description: "Proyek dilaksanakan sesuai jadwal yang telah disepakati sehingga klien
dapat mempersiapkan instalasi peralatan, proses commissioning, serta
kegiatan operasional tanpa mengalami keterlambatan.",
    metric: { label: "On-time delivery", value: "98%", percentage: "98%" }
  },
  {
    icon: Shield,
    title: "Pengendalian Risiko Pelaksanaan",
    description: "Perencanaan teknis serta koordinasi pekerjaan yang baik membantu
mengurangi pekerjaan ulang, perbedaan gambar kerja, serta penyesuaian
di lapangan selama proses konstruksi berlangsung.",
    metric: { label: "Risk reduction", value: "75%", percentage: "75%" }
  },
  {
    icon: CheckCircle,
    title: "Kesiapan Operasional",
    description: "Struktur dan sistem yang telah selesai dikerjakan diserahkan kepada klien
dalam kondisi siap untuk proses pengujian, commissioning, serta
digunakan dalam kegiatan operasional.",
    metric: { label: "Zero defects", value: "95%", percentage: "95%" }
  }
]
