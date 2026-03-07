import Image from "next/image"
import { 
  Users,
  HardHat,
  CheckCircle,
  Target,
  Eye,
  TrendingUp,
  Shield,
  Clock
} from "lucide-react"

export default function AboutSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
            <HardHat size={16} className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">Didukung Tim Berpengalaman di Bidang Konstruksi</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            Pelaksanaan Proyek dengan 
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"> Perencanaan Teknis yang Jelas</span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-700 mx-auto mt-6 rounded-full" />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT CONTENT - COMPANY STORY */}
          <div className="space-y-8">
            
            {/* Badge Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-2xl font-black text-red-600">{stat.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Main Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                <span className="font-bold text-gray-900">PT Manggala Putra Persada</span> merupakan perusahaan kontraktor yang
menangani pekerjaan konstruksi sipil, struktur baja, instalasi MEP,
serta proyek design & build untuk sektor industri dan komersial di Indonesia.
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">
                Kami percaya hasil konstruksi yang baik dicapai melalui
perencanaan yang matang, sistem kerja yang jelas,
serta disiplin teknis dalam setiap tahap pelaksanaan proyek.
              </p>
            </div>

            {/* Key Differentiators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {differentiators.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition group">
                  <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition">
                    <item.icon size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Komitmen Kerja:</p>
              {certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-sm text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT CONTENT - VISION & MISSION */}
          <div className="space-y-6">
            
            {/* Vision Card */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Eye size={28} className="text-white/90" />
                  <h3 className="text-2xl font-bold">Visi Perusahaan</h3>
                </div>
                <p className="text-lg text-white/90 leading-relaxed">
                  Menjadi mitra kerja yang terpercaya dalam pelaksanaan
proyek konstruksi untuk sektor industri dan komersial di Indonesia.
                </p>
                <div className="mt-6 flex items-center gap-2 text-white/80 text-sm">
                  <Target size={16} />
                  <span>100% Client Satisfaction Target</span>
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition">
                  <TrendingUp size={24} className="text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Misi Perusahaan</h3>
              </div>

              <div className="space-y-4">
                {missions.map((mission, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded-full mt-0.5">
                      <CheckCircle size={14} className="text-green-600" />
                    </div>
                    <p className="text-gray-700">{mission}</p>
                  </div>
                ))}
              </div>

              {/* Values */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Nilai Perusahaan</h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-50 hover:text-red-600 transition"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Milestone */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Company Milestones</h4>
              <div className="space-y-3">
                {milestones.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full" />
                    <span className="text-sm text-gray-700 flex-1">{item.text}</span>
                    <span className="text-xs font-mono text-gray-500">{item.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Siap Memulai Proyek Anda?</p>
              <p className="text-xs text-gray-500">Diskusikan kebutuhan proyek Anda bersama tim kami</p>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition ml-4">
              Konsultasi Proyek
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Data
const stats = [
  { value: "Tim Berpengalaman", label: "Tenaga Kerja & Engineer Berpengalaman" },
  { value: "Beragam Proyek", label: "Pengalaman Tim di Proyek Industri" },
  { value: "Fokus Industri", label: "Konstruksi Sipil, Baja & MEP" },
]

const differentiators = [
  {
    icon: HardHat,
    title: "Perencanaan Teknis",
    description: "Setiap pekerjaan dilaksanakan berdasarkan gambar kerja dan spesifikasi teknis"
  },
  {
    icon: Clock,
    title: "Pengendalian Waktu",
    description: "Pelaksanaan proyek dengan pengendalian jadwal kerja yang terencana"
  },
  {
    icon: Shield,
    title: "Pengawasan Kualitas",
    description: "Setiap tahap pekerjaan diawasi untuk menjaga mutu konstruksi"
  },
  {
    icon: Users,
    title: "Tim Berpengalaman",
    description: "Didukung tenaga kerja dan teknisi berpengalaman di bidang konstruksi"
  }
]

const missions = [
  "Melaksanakan pekerjaan konstruksi sesuai gambar kerja dan spesifikasi teknis",
  "Menjaga kualitas pekerjaan, keselamatan kerja, dan ketepatan waktu proyek",
  "Membangun hubungan kerja yang baik dengan klien dan mitra proyek",
  "Mengembangkan kemampuan tim serta metode kerja konstruksi yang efektif"
]

const values = [
  "Integrity", "Excellence", "Safety First", "Innovation", "Accountability", "Teamwork"
]

const certifications = [
  "Pengendalian Mutu Pekerjaan",
  "Penerapan Keselamatan Kerja (K3)",
  "Pengawasan Teknis Lapangan"
]

const milestones = [
  { year: "2026", text: "PT Manggala Putra Persada didirikan" },
  { year: "2026", text: "Memulai layanan konstruksi sipil dan struktur baja" },
  { year: "2026", text: "Pengembangan layanan instalasi MEP dan design & build" }
]
