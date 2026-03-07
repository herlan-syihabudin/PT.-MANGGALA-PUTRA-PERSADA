import Link from "next/link"
import { 
  Building2, 
  Zap, 
  Wind, 
  ChevronRight,
  Shield,
  Truck,
  Factory,
  Sparkles,
  ArrowRight
} from "lucide-react"

export default function Partners() {
  const partners = [
    {
      title: "Struktur Baja & Material Konstruksi",
      desc: "Mitra manufaktur baja struktural dan penyedia material konstruksi untuk mendukung kebutuhan proyek industri dan perumahan.",
      href: "/material/besi",
      icon: Factory,
      color: "from-blue-500 to-cyan-500",
      stats: "15+ Tahun Kerjasama",
      badge: "Strategic Partner"
    },
    {
      title: "Sistem Panel & Kelistrikan",
      desc: "Panel maker dan penyedia sistem kelistrikan industri untuk mendukung instalasi MEP dan sistem distribusi daya.",
      href: "/material/panel",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      stats: "1000+ Panel Terpasang",
      badge: "Authorized Partner"
    },
    {
      title: "HVLS & Sistem Ventilasi",
      desc: "Penyedia sistem HVLS fan dan solusi ventilasi industri untuk mendukung kenyamanan dan efisiensi sirkulasi udara pada fasilitas produksi dan gudang.",
      href: "/material/ventilasi",
      icon: Wind,
      color: "from-emerald-500 to-teal-500",
      stats: "500+ Unit Terinstal",
      badge: "Technology Partner"
    },
  ]

  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Accent blobs */}
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[360px] h-[360px] bg-red-600/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        
        {/* Decorative lines */}
        <div className="absolute top-1/3 left-0 w-40 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-l from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* ===== HEADER - konsisten dengan komponen lain ===== */}
        <div className="max-w-3xl mb-12">
          {/* Badge dengan garis */}
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
            <span className="text-xs font-semibold text-gold tracking-wider uppercase">
              Strategic Alliances
            </span>
            <div className="w-6 h-[2px] bg-gold/30 rounded-full" />
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Technology & Manufacturing 
            <span className="block text-gold mt-1 text-lg md:text-xl">
              Partners
            </span>
          </h2>

          {/* Divider */}
          <div className="relative mt-4">
            <div className="h-[2px] w-16 bg-gold rounded-full" />
            <div className="h-[2px] w-10 bg-gold/30 rounded-full mt-1" />
          </div>

          {/* Description */}
          <p className="mt-4 text-sm md:text-base text-gray-600 leading-relaxed max-w-2xl">
            Dalam pelaksanaan proyek, PT Manggala Putra Persada bekerja sama dengan
            berbagai manufaktur dan penyedia sistem untuk memastikan mutu material,
            keandalan teknis, serta kesinambungan pasokan proyek.
          </p>
        </div>

        {/* ===== PARTNERS GRID ===== */}
        <div className="grid md:grid-cols-3 gap-4">
          {partners.map((item, i) => {
            const Icon = item.icon
            
            return (
              <Link
                key={i}
                href={item.href}
                className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Icon */}
                <div className="relative mb-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${item.color} bg-opacity-10
                    transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                    shadow-lg
                  `}>
                    <Icon size={22} className="text-white" />
                  </div>

                  {/* Badge */}
                  <span className="absolute top-0 right-0 px-2 py-1 bg-gold/10 text-gold text-[10px] font-medium rounded-full border border-gold/20">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-gold transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {item.desc}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-1 mb-4">
                  <Shield size={12} className="text-gold" />
                  <span className="text-[10px] text-gray-500">{item.stats}</span>
                </div>

                {/* View details link */}
                <div className="flex items-center gap-1 text-gold text-xs font-medium group-hover:gap-2 transition-all">
                  <span>View Details</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-gold/5 to-transparent rounded-tl-xl pointer-events-none" />
              </Link>
            )
          })}
        </div>

        {/* ===== TRUST INDICATORS ===== */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Truck size={14} className="text-gold" />
            Supply Chain Terintegrasi
          </span>
          <span className="flex items-center gap-1.5">
            <Shield size={14} className="text-gold" />
            Material Terverifikasi
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-gold" />
            Garansi Produk
          </span>
        </div>
        </div>
    </section>
  )
}
