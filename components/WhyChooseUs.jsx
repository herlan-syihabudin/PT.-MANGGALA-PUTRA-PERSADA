import Link from "next/link"
import { ChevronRight, HardHat, TrendingDown, Shield } from "lucide-react"

export function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      aria-labelledby="why-choose-heading"
      className="relative py-28 bg-gray-50 overflow-hidden"
    >
      {/* BACKGROUND ACCENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[360px] h-[360px] bg-black/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-light opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="max-w-3xl mb-20">
          <span className="inline-block mb-4 text-sm font-semibold text-gold tracking-wider uppercase">
            Why Choose Us
          </span>

          <h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900"
          >
            Proyek Terstruktur, Hasil Pasti:
            <span className="block text-gold">Engineering-Led Execution</span>
          </h2>

          {/* Divider */}
          <div className="relative mt-5">
            <div className="h-[3px] w-16 bg-gold rounded-full" />
            <div className="h-[3px] w-8 bg-gold/30 rounded-full mt-1" />
          </div>

          <p className="mt-6 text-lg text-gray-700 leading-relaxed max-w-2xl">
            Banyak proyek konstruksi gagal bukan karena eksekusi, tetapi karena
            perencanaan yang lemah dan koordinasi engineering yang tidak disiplin.
            <br /><br />
            Di MPP, setiap proyek dikendalikan sejak tahap awal dengan pendekatan
            <span className="font-semibold text-gray-900"> engineering-led</span>
            {" "}untuk memastikan biaya, waktu, dan kualitas tetap terkontrol
            secara terstruktur.
          </p>
        </div>

        {/* TRUST CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* CARD 1 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
              <HardHat size={24} className="text-gold" />
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-lg">
              Engineering-Led Execution
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Setiap pekerjaan dijalankan berdasarkan gambar approved, review engineering terkoordinasi,
              dan supervisi teknis berkelanjutan untuk menekan risiko kesalahan lapangan serta meminimalkan rework.
            </p>
          </div>

          {/* CARD 2 (HIGHLIGHT) */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all hover:-translate-y-1 border-t-4 border-gold relative before:absolute before:inset-0 before:bg-gold/5 before:rounded-2xl before:pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <TrendingDown size={24} className="text-gold" />
              </div>

              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                Cost & Schedule Discipline
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Perencanaan terstruktur, monitoring progres, dan pelaporan transparan
                membantu mencegah pembengkakan biaya serta keterlambatan yang sering
                terjadi pada proyek tanpa kontrol sistematis.
              </p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-soft hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
              <Shield size={24} className="text-gold" />
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-lg">
              Quality & HSE Control
            </h3>

            <p className="text-gray-600 leading-relaxed">
              Sistem jaminan kualitas dan prosedur K3 diterapkan konsisten sepanjang
              siklus proyek untuk memastikan proyek tidak hanya selesai,
              tetapi juga aman dan siap beroperasi dalam jangka panjang.
            </p>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/tentang-kami"
            className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all group"
          >
            <span>Pelajari Pendekatan Engineering Kami</span>
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <p className="text-sm text-gray-500 mt-4">
            ✦ 14+ tahun pengalaman ✦ 100+ proyek industri ✦ ISO 9001:2015 ✦
          </p>
        </div>

      </div>
    </section>
  )
}
