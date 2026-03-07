import Link from "next/link"
import { 
  ChevronRight, 
  PenTool, 
  GanttChart, 
  BadgeCheck, 
  Ruler, 
  Target, 
  Shield
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
    icon: PenTool,
    title: { id: 'Perencanaan Teknis yang Jelas', en: 'Technical Planning' },
    description: {
      id: 'Setiap pekerjaan dilaksanakan berdasarkan gambar kerja, spesifikasi teknis, serta metode kerja yang telah direncanakan.',
      en: 'All works are executed based on approved drawings and technical specifications.'
    }
  },
  {
    id: 'schedule',
    icon: GanttChart,
    title: { id: 'Pengendalian Waktu & Biaya', en: 'Cost & Schedule Control' },
    description: {
      id: 'Perencanaan pekerjaan, pengawasan progres, serta koordinasi tim dilakukan untuk menjaga proyek berjalan sesuai jadwal.',
      en: 'Structured planning and progress monitoring to maintain project schedule.'
    },
    highlighted: true
  },
  {
    id: 'quality',
    icon: BadgeCheck,
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
      className={`relative min-h-screen flex items-center justify-center py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden ${className}`}
    >
      {/* BACKGROUND ACCENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-0 w-40 h-px bg-gradient-to-r from-gold/0 via-gold/20 to-gold/0" />
        <div className="absolute bottom-1/4 right-0 w-40 h-px bg-gradient-to-l from-gold/0 via-gold/20 to-gold/0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 w-full">
        
        {/* HEADER - lebih kompak */}
        <div className="max-w-3xl mb-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-[2px] bg-gold/30 rounded-full" />
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              {locale === 'id' ? 'Mengapa Memilih Kami' : 'Why Choose Us'}
            </span>
            <div className="w-8 h-[2px] bg-gold/30 rounded-full" />
          </div>

          <h2
            id="why-choose-heading"
            className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900"
          >
            {locale === 'id' ? 'Sistem Kerja yang Terencana untuk Hasil Proyek yang Baik' : 'Structured Project Execution'}
            <span className="block text-gold mt-1 text-lg md:text-xl">
              {locale === 'id' ? 'Pelaksanaan Proyek yang Terencana' : 'Engineering-Led Execution'}
            </span>
          </h2>

          {/* Dekorasi garis */}
          <div className="relative mt-4">
            <div className="h-[2px] w-16 bg-gold rounded-full" />
            <div className="h-[2px] w-10 bg-gold/30 rounded-full mt-1" />
            <div className="h-[2px] w-5 bg-gold/10 rounded-full mt-1" />
          </div>

          <p className="mt-4 text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
            {locale === 'id' 
              ? 'Banyak proyek konstruksi mengalami kendala karena perencanaan yang kurang matang, koordinasi yang tidak jelas, serta pengendalian pekerjaan yang lemah. Kami menjalankan setiap proyek dengan sistem kerja yang terstruktur agar pelaksanaan di lapangan berjalan lebih terkendali.'
              : 'Many construction projects face challenges due to poor planning, unclear coordination, and weak execution control. We implement structured workflows to ensure controlled and predictable project delivery.'}
          </p>
        </div>

        {/* CARDS GRID - lebih pendek */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {CARDS.map((card) => {
            const Icon = card.icon
            const isHighlighted = 'highlighted' in card && card.highlighted
            
            return (
              <div
                key={card.id}
                className={`
                  group relative bg-white border border-gray-200 rounded-xl p-4
                  shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1
                  ${isHighlighted 
                    ? 'border-t-4 border-gold shadow-gold/5' 
                    : 'hover:border-gold/30'}
                `}
              >
                {/* Efek shine */}
                {isHighlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
                )}
                
                {/* Background glow */}
                {isHighlighted && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                )}
                
                <div className="relative">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center mb-3
                    transition-all duration-300 group-hover:scale-110
                    ${isHighlighted 
                      ? 'bg-gold/20 text-gold' 
                      : 'bg-gold/10 text-gold group-hover:bg-gold/20'}
                  `}>
                    <Icon size={20} className="text-gold" aria-hidden="true" />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">
                    {card.title[locale]}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed max-w-[42ch]">
                    {card.description[locale]}
                  </p>

                  {/* Decorative corner */}
                  {isHighlighted && (
                    <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-gold/20 to-transparent transform rotate-45 translate-x-4 -translate-y-4" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM SECTION - lebih kompak */}
        {showCta && (
          <div className="text-center">
            {/* CTA Link */}
            <Link
              href="/proyek/tahapan"
              className="inline-flex items-center gap-2 bg-gold/5 text-gold font-semibold px-6 py-3 rounded-full hover:bg-gold/10 transition-all group border border-gold/20 hover:border-gold/40 text-sm"
              aria-label="Lihat Tahapan Pelaksanaan Proyek"
            >
              <span>
                {locale === 'id' ? 'Lihat Cara Kami Menjalankan Proyek' : 'Learn Our Engineering Approach'}
              </span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </Link>

            {/* Features */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-3">
                {locale === 'id' ? 'Komitmen kami dalam setiap proyek:' : 'Our commitment in every project:'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-700 hover:border-gold/40 transition"
                    >
                      <Icon size={12} className="text-gold" />
                      <span className="text-xs">{feature.label[locale]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trust indicator */}
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400">
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
