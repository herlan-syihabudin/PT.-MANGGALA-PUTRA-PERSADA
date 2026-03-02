import Link from "next/link"
import { ChevronRight, HardHat, TrendingDown, Shield } from "lucide-react"

interface WhyChooseUsProps {
  className?: string
  showCta?: boolean
  locale?: 'id' | 'en'
  aboutUrl?: string
}

const CARDS = [
  {
    id: 'engineering',
    icon: HardHat,
    title: { id: 'Engineering-Led Execution', en: 'Engineering-Led Execution' },
    description: {
      id: 'Setiap pekerjaan dijalankan berdasarkan gambar approved...',
      en: 'Every work is executed based on approved drawings...'
    }
  },
  {
    id: 'cost',
    icon: TrendingDown,
    title: { id: 'Cost & Schedule Discipline', en: 'Cost & Schedule Discipline' },
    description: {
      id: 'Perencanaan terstruktur, monitoring progres...',
      en: 'Structured planning, progress monitoring...'
    },
    highlighted: true
  },
  {
    id: 'quality',
    icon: Shield,
    title: { id: 'Quality & HSE Control', en: 'Quality & HSE Control' },
    description: {
      id: 'Sistem jaminan kualitas dan prosedur K3...',
      en: 'Quality assurance system and HSE procedures...'
    }
  }
] as const

const FEATURES = [
  { id: 'execution', icon: Shield, label: { id: 'Engineering-Led Execution', en: 'Engineering-Led Execution' } },
  { id: 'control', icon: Shield, label: { id: 'Structured Project Control', en: 'Structured Project Control' } },
  { id: 'hse', icon: Shield, label: { id: 'Quality & HSE Commitment', en: 'Quality & HSE Commitment' } }
] as const

export function WhyChooseUs({ 
  className = '', 
  showCta = true,
  locale = 'id',
  aboutUrl = '/tentang-kami'
}: WhyChooseUsProps) {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-heading"
      className={`relative py-16 md:py-20 bg-gray-50 overflow-hidden ${className}`}
    >
      {/* BACKGROUND ACCENTS - tetap sama */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-light opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="max-w-3xl mb-14">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            {locale === 'id' ? 'Mengapa Memilih Kami' : 'Why Choose Us'}
          </span>

          <h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
          >
            {locale === 'id' ? 'Proyek Terstruktur, Hasil Pasti:' : 'Structured Projects, Guaranteed Results:'}
            <span className="block text-gold">
              {locale === 'id' ? 'Engineering-Led Execution' : 'Engineering-Led Execution'}
            </span>
          </h2>

          <div className="relative mt-5">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed max-w-2xl">
            {locale === 'id' 
              ? 'Banyak proyek konstruksi gagal...' 
              : 'Many construction projects fail...'}
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          {CARDS.map((card) => {
            const Icon = card.icon
            const isHighlighted = 'highlighted' in card && card.highlighted
            
            return (
              <div
                key={card.id}
                className={`
                  group bg-white border border-gray-200 rounded-2xl p-8 
                  shadow-soft hover:shadow-xl transition-all hover:-translate-y-1
                  ${isHighlighted ? 'border-t-4 border-gold relative before:absolute before:inset-0 before:bg-gold/5 before:rounded-2xl before:pointer-events-none' : ''}
                `}
              >
                <div className={isHighlighted ? 'relative' : ''}>
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <Icon size={24} className="text-gold" aria-hidden="true" />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-3 text-lg">
                    {card.title[locale]}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {card.description[locale]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM CTA */}
        {showCta && (
          <div className="mt-12 text-center">
            <Link
              href={aboutUrl}
              className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all group"
              aria-label={locale === 'id' ? 'Pelajari pendekatan engineering kami' : 'Learn about our engineering approach'}
            >
              <span>
                {locale === 'id' ? 'Pelajari Pendekatan Engineering Kami' : 'Learn Our Engineering Approach'}
              </span>
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </Link>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.id} className="flex items-center gap-2">
                    <Icon size={14} className="text-gold" aria-hidden="true" />
                    <span>{feature.label[locale]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
