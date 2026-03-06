import Link from "next/link"
import { 
  ChevronRight, 
  Factory, 
  Building2, 
  Home, 
  Users, 
  Truck, 
  Wrench,
  PenTool,
  Shield
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Klien & Mitra Strategis | PT Manggala Putra Persada",
  description: "PT Manggala Putra Persada telah dipercaya oleh berbagai klien industri, komersial, dan residential. Kami juga bermitra dengan konsultan engineering, supplier material, dan fabrikator terpercaya di Indonesia.",
  keywords: "klien kontraktor indonesia, mitra konstruksi, konsultan engineering, supplier material bangunan, fabrikator baja, kontraktor bekasi",
  openGraph: {
  title: "Klien & Mitra Strategis | MPP Engineering",
  description: "Kolaborasi dengan klien dan mitra strategis di seluruh Indonesia.",
  url: "https://mppindo.com/klien",
  siteName: "PT Manggala Putra Persada",
  type: "website",
  images: [
    {
      url: "https://mppindo.com/images/og-klien.jpg",
      width: 1200,
      height: 630,
      alt: "Klien dan Mitra Strategis PT Manggala Putra Persada",
    },
  ],
},
  twitter: {
  card: "summary_large_image",
  title: "Klien & Mitra Strategis | PT Manggala Putra Persada",
  description: "Kolaborasi dengan klien industri, komersial, dan residential.",
  images: ["https://mppindo.com/images/og-klien.jpg"],
},
  alternates: {
    canonical: "https://mppindo.com/klien",
  },
}

export default function KlienPage() {
  // Data untuk clients
  const sectors = [
    {
      icon: Factory,
      title: "Industrial Clients",
      desc: "Manufacturing plants, warehouses, and industrial facilities requiring structured engineering execution and strict HSE compliance.",
    },
    {
      icon: Building2,
      title: "Commercial Clients",
      desc: "Office buildings, commercial spaces, and mixed-use developments delivered through coordinated design and construction systems.",
    },
    {
      icon: Home,
      title: "Residential Clients",
      desc: "Residential developments and private clients supported with quality-driven execution and controlled project timelines.",
    },
  ]

  const partners = [
    {
      icon: PenTool,
      title: "Engineering Consultants",
      desc: "Structural & MEP specialists",
    },
    {
      icon: Truck,
      title: "Material Suppliers",
      desc: "Steel, concrete, and MEP materials",
    },
    {
      icon: Wrench,
      title: "Fabricators & Vendors",
      desc: "Steel fabrication & finishing",
    },
    {
      icon: Users,
      title: "Project Stakeholders",
      desc: "Owners, consultants, authorities",
    },
  ]

  return (
    <section className="pt-16 md:pt-20 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ===== HEADER ===== */}
        <div className="max-w-3xl mb-16">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Trust & Partnership
          </span>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Clients & 
            <span className="block text-gold">Strategic Partners</span>
          </h1>

          <div className="relative mt-5 mb-6">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            PT Manggala Putra Persada berkolaborasi dengan klien dan mitra strategis 
            di seluruh Indonesia. Setiap kemitraan dibangun di atas disiplin engineering, 
            transparansi, dan akuntabilitas proyek jangka panjang.
          </p>
        </div>

        {/* ===== CLIENT SECTORS ===== */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {sectors.map((sector, idx) => (
            <div 
              key={idx}
              className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <sector.icon size={24} className="text-gold" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                {sector.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {sector.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ===== TRUSTED COMPANIES (LOGO PLACEHOLDER) ===== */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Dipercaya oleh
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i}
                className="h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center hover:border-gold/30 transition-all grayscale hover:grayscale-0"
              >
                <span className="text-gray-400 font-medium">Logo {i}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            *Logo perusahaan akan ditampilkan sesuai izin klien
          </p>
        </div>

        {/* ===== STRATEGIC PARTNERS ===== */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded-full" />
            Mitra Strategis
          </h2>

          <p className="text-lg text-gray-700 max-w-3xl mb-10">
            Kami bekerja sama dengan mitra terpercaya untuk memastikan akurasi teknis, 
            keandalan pasokan, dan kelancaran eksekusi proyek di semua disiplin.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {partners.map((partner, idx) => (
              <div 
                key={idx}
                className="group bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gold/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-gold/20 transition-colors">
                  <partner.icon size={20} className="text-gold" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {partner.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2">
                  {partner.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TESTIMONIAL / TRUST SIGNAL ===== */}
        <div className="mb-24 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-10">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <Shield size={40} className="text-gold flex-shrink-0" />
            <div>
              <p className="text-lg text-gray-700 italic leading-relaxed">
                "Kami percaya pada pendekatan engineering-led MPP. Setiap tahap 
                proyek dikomunikasikan dengan jelas, dan hasilnya sesuai dengan 
                yang dijanjikan."
              </p>
              <p className="font-semibold text-gray-900 mt-4">
                — Direktur Utama, Klien Industri
              </p>
              <p className="text-sm text-gray-500">
                Proyek Pabrik Manufaktur 15.000 m²
              </p>
            </div>
          </div>
        </div>

        {/* ===== CTA ===== */}
        <div className="border-t border-gray-200 pt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Tertarik Bekerja Sama?
          </h3>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Diskusikan bagaimana pendekatan engineering terstruktur dan eksekusi 
            profesional dapat mendukung proyek Anda berikutnya.
          </p>

          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold 
              hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 
              hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group"
          >
            Mulai Kolaborasi
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <script
type="application/ld+json"
dangerouslySetInnerHTML={{
__html: JSON.stringify({
"@context": "https://schema.org",
"@type": "Organization",
"name": "PT Manggala Putra Persada",
"url": "https://mppindo.com",
"logo": "https://mppindo.com/logo-mp.png",
"sameAs": [
"https://www.linkedin.com/company/mppindo"
],
"areaServed": "Indonesia",
"industry": "Construction",
})
}}
/>
      </div>
    </section>
  )
}
