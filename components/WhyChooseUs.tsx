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
    id: 'technical',
    icon: HardHat,
    title: { id: 'Perencanaan Teknis yang Jelas', en: 'Technical Planning' },
    description: {
      id: 'Setiap pekerjaan dilaksanakan berdasarkan gambar kerja, spesifikasi teknis, serta metode kerja yang telah direncanakan.',
      en: 'All works are executed based on approved drawings and technical specifications.'
    }
  },
  {
    id: 'schedule',
    icon: TrendingDown,
    title: { id: 'Pengendalian Waktu & Biaya', en: 'Cost & Schedule Control' },
    description: {
      id: 'Perencanaan pekerjaan, pengawasan progres, serta koordinasi tim dilakukan untuk menjaga proyek berjalan sesuai jadwal.',
      en: 'Structured planning and progress monitoring to maintain project schedule.'
    },
    highlighted: true
  },
  {
    id: 'quality',
    icon: Shield,
    title: { id: 'Pengawasan Mutu & K3', en: 'Quality & Safety Control' },
    description: {
      id: 'Setiap tahap pekerjaan diawasi untuk memastikan kualitas konstruksi dan penerapan standar keselamatan kerja.',
      en: 'Quality assurance and safety procedures are applied throughout the project.'
    }
  }
] as const

const FEATURES = [
  { id: 'execution', icon: Shield, label: { id: 'Pelaksanaan Berdasarkan Gambar Kerja', en: 'Execution Based on Drawings' } },
  { id: 'control', icon: Shield, label: { id: 'Pengendalian Proyek yang Terencana', en: 'Structured Project Control' } },
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
            {locale === 'id' ? 'Sistem Kerja yang Terencana untuk Hasil Proyek yang Baik' : 'Structured Project Execution'}
            <span className="block text-gold">
              {locale === 'id' ? 'Pelaksanaan Proyek yang Terencana' : 'Engineering-Led Execution'}
            </span>
          </h2>

          <div className="relative mt-5">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed max-w-2xl">
            {locale === 'id' 
              ? id: 'Banyak proyek konstruksi mengalami kendala karena perencanaan yang kurang matang, koordinasi yang tidak jelas, serta pengendalian pekerjaan yang lemah. Kami menjalankan setiap proyek dengan sistem kerja yang terstruktur agar pelaksanaan di lapangan berjalan lebih terkendali.' 
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
              aria-label={locale === 'id' ? 'Lihat Cara Kami Menjalankan Proyek' : 'Learn about our engineering approach'}
            >
              <span>
                {locale === 'id' ? 'Lihat Cara Kami Menjalankan Proyek' : 'Learn Our Engineering Approach'}
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
