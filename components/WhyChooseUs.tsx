import Link from "next/link"
import { 
  ChevronRight, 
  PenTool, 
  GanttChart, 
  BadgeCheck, 
  Ruler, 
  Target, 
  Shield,
  HardHat,
  TrendingDown
} from "lucide-react"

interface WhyChooseUsProps {
  className?: string
  showCta?: boolean
  locale?: 'id' | 'en'
  aboutUrl?: string
}

const CARDS = [
  {
    id: 'technical',
    icon: PenTool, // Diganti dari HardHat biar lebih representatif
    title: { id: 'Perencanaan Teknis yang Jelas', en: 'Technical Planning' },
    description: {
      id: 'Setiap pekerjaan dilaksanakan berdasarkan gambar kerja, spesifikasi teknis, serta metode kerja yang telah direncanakan.',
      en: 'All works are executed based on approved drawings and technical specifications.'
    }
  },
  {
    id: 'schedule',
    icon: GanttChart, // Diganti dari TrendingDown biar lebih positif
    title: { id: 'Pengendalian Waktu & Biaya', en: 'Cost & Schedule Control' },
    description: {
      id: 'Perencanaan pekerjaan, pengawasan progres, serta koordinasi tim dilakukan untuk menjaga proyek berjalan sesuai jadwal.',
      en: 'Structured planning and progress monitoring to maintain project schedule.'
    },
    highlighted: true
  },
  {
    id: 'quality',
    icon: BadgeCheck, // Diganti dari Shield biar lebih pas buat mutu
    title: { id: 'Pengawasan Mutu & K3', en: 'Quality & Safety Control' },
    description: {
      id: 'Setiap tahap pekerjaan diawasi untuk memastikan kualitas konstruksi dan penerapan standar keselamatan kerja.',
      en: 'Quality assurance and safety procedures are applied throughout the project.'
    }
  }
] as const

const FEATURES = [
  { id: 'execution', icon: Ruler, label: { id: 'Pelaksanaan Berdasarkan Gambar Kerja', en: 'Execution Based on Drawings' } },
  { id: 'control', icon: Target, label: { id: 'Pengendalian Proyek yang Terencana', en: 'Structured Project Control' } },
  { id: 'hse', icon: Shield, label: { id: 'Pengawasan Mutu dan Keselamatan Kerja', en: 'Quality & Safety Control' } }
] as const

export function WhyChooseUs({ 
  className = '', 
  showCta = true,
  locale = 'id',
  aboutUrl = '/tentang'
}: WhyChooseUsProps) {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-heading"
      className={`relative py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden ${className}`}
    >
      {/* BACKGROUND ACCENTS - lebih halus */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-40 h-px bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0" />
        <div className="absolute bottom-1/4 right-0 w-40 h-px bg-gradient-to-l from-gold/0 via-gold/20 to-gold/0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* HEADER - dengan dekorasi tambahan */}
        <div className="max-w-3xl mb-14">
          {/* Badge dengan garis di samping */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-gold/30 rounded-full" />
            <span className="text-sm font-semibold text-gold tracking-wider uppercase">
              {locale === 'id' ? 'Mengapa Memilih Kami' : 'Why Choose Us'}
            </span>
            <div className="w-8 h-[2px] bg-gold/30 rounded-full" />
          </div>

          <h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900"
          >
            {locale === 'id' ? 'Sistem Kerja yang Terencana untuk Hasil Proyek yang Baik' : 'Structured Project Execution'}
            <span className="block text-gold mt-2">
              {locale === 'id' ? 'Pelaksanaan Proyek yang Terencana' : 'Engineering-Led Execution'}
            </span>
          </h2>

          {/* Dekorasi garis - dipercantik */}
          <div className="relative mt-6">
            <div className="h-[3px] w-20 bg-gold rounded-full" />
            <div className="h-[3px] w-12 bg-gold/30 rounded-full mt-1" />
            <div className="h-[3px] w-6 bg-gold/10 rounded-full mt-1" />
          </div>

          <p className="mt-8 text-lg text-gray-700 leading-relaxed max-w-2xl">
            {locale === 'id' 
              ? 'Banyak proyek konstruksi mengalami kendala karena perencanaan yang kurang matang, koordinasi yang tidak jelas, serta pengendalian pekerjaan yang lemah. Kami menjalankan setiap proyek dengan sistem kerja yang terstruktur agar pelaksanaan di lapangan berjalan lebih terkendali.'
              : 'Many construction projects face challenges due to poor planning, unclear coordination, and weak execution control. We implement structured workflows to ensure controlled and predictable project delivery.'}
          </p>
        </div>

        {/* CARDS GRID */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map((card) => {
            const Icon = card.icon
            const isHighlighted = 'highlighted' in card && card.highlighted
            
            return (
              <div
                key={card.id}
                className={`
                  group relative bg-white border border-gray-200 rounded-2xl p-8 
                  shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2
                  ${isHighlighted 
                    ? 'border-t-4 border-gold border-t-4 border-gold shadow-gold/5' 
                    : 'hover:border-gold/30'}
                `}
              >
                {/* Efek shine untuk card yang di-highlight */}
                {isHighlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
                
                {/* Background glow halus */}
                {isHighlighted && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                )}
                
                <div className="relative">
                  {/* Icon container dengan efek */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center mb-5 
                    transition-all duration-300 group-hover:scale-110
                    ${isHighlighted 
                      ? 'bg-gold/20 text-gold' 
                      : 'bg-gold/10 text-gold group-hover:bg-gold/20'}
                  `}>
                    <Icon size={28} className="text-gold" aria-hidden="true" />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-3 text-xl">
                    {card.title[locale]}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {card.description[locale]}
                  </p>

                  {/* Decorative corner untuk card yang di-highlight */}
                  {isHighlighted && (
                    <>
                      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-gold/20 to-transparent transform rotate-45 translate-x-6 -translate-y-6" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM SECTION - dengan tampilan lebih menarik */}
        {showCta && (
          <div className="mt-16 text-center">
            {/* CTA Link dengan style button */}
            <Link
              href={aboutUrl}
              className="inline-flex items-center gap-3 bg-gold/5 text-gold font-semibold px-8 py-4 rounded-full hover:bg-gold/10 transition-all group border border-gold/20 hover:border-gold/40"
              aria-label={locale === 'id' ? 'Lihat Cara Kami Menjalankan Proyek' : 'Learn about our engineering approach'}
            >
              <span className="text-lg">
                {locale === 'id' ? 'Lihat Cara Kami Menjalankan Proyek' : 'Learn Our Engineering Approach'}
              </span>
              <ChevronRight
                size={20}
                className="group-hover:translate-x-2 transition-transform"
                aria-hidden="true"
              />
            </Link>

            {/* Features dengan card kecil */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-6">
                {locale === 'id' ? 'Komitmen kami dalam setiap proyek:' : 'Our commitment in every project:'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div 
                      key={feature.id} 
                      className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm hover:border-gold/30 hover:shadow-md transition-all group"
                    >
                      <Icon size={16} className="text-gold group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium text-gray-700">{feature.label[locale]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trust indicator tambahan (tetap ringan) */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gold/40 rounded-full" />
                {locale === 'id' ? 'Teknis terukur' : 'Measurable execution'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gold/40 rounded-full" />
                {locale === 'id' ? 'Pengawasan ketat' : 'Strict supervision'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gold/40 rounded-full" />
                {locale === 'id' ? 'Hasil terjamin' : 'Guaranteed results'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
