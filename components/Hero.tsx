import Image from "next/image"
import Link from "next/link"
import { 
  Phone, 
  ChevronRight, 
  Award, 
  Users, 
  Building2, 
  HardHat,
  Shield,
  FileText,
  CheckCircle
} from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 border border-red-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/5 to-yellow-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div className="relative z-10">

            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <HardHat size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                Engineering-Led Construction Contractor
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              <span className="text-gray-900">Engineering-Led </span>
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Construction Contractor
              </span>
              <span className="text-gray-900"> in Indonesia</span>
            </h1>

            <p className="mt-8 text-xl text-gray-700 font-medium max-w-2xl">
              Steel Structure, Civil Engineering, MEP Installation & Design-Build Services
              <span className="block text-base text-gray-500 font-normal mt-2">
                for Industrial and Commercial Projects Across Indonesia
              </span>
            </p>

            {/* Trust */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trustItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <item.icon size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/kontak"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Phone size={18} />
                Free Project Consultation
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/proyek"
                className="group inline-flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-red-50 transition-all"
              >
                View Portfolio
              </Link>
            </div>

            {/* Micro Trust */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                <span>Free Initial Consultation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={16} className="text-blue-600" />
                <span>NDA Protected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} className="text-orange-600" />
                <span>Detailed Engineering Proposal</span>
              </div>
            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10" />
              
              <Image
                src="/images/hero-project.jpg"
                alt="Engineering-led construction project by PT Manggala Putra Persada"
                width={800}
                height={1000}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover w-full h-[600px]"
              />

              <div className="absolute bottom-0 left-0 right-0 z-20 p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Award size={20} className="text-yellow-400" />
                  <span className="text-sm font-medium">ISO 9001:2015 Certified</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">Industrial Plant Construction</h3>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-2xl font-bold">100+</p>
                    <p className="text-xs text-gray-300">Industrial Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-gray-300">Safety Record</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">14+</p>
                    <p className="text-xs text-gray-300">Years Experience</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

const trustItems = [
  { icon: Award, value: "ISO 9001", label: "Quality Certified" },
  { icon: Users, value: "50+", label: "Industrial Clients" },
  { icon: Building2, value: "100+", label: "Projects Done" },
  { icon: HardHat, value: "14+", label: "Years Experience" },
]
