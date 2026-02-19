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
import { useEffect, useState } from "react"

export default function Hero() {
  const [counts, setCounts] = useState({ projects: 0, experience: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    // Animated counters
    const timer1 = setTimeout(() => setCounts({ projects: 100, experience: 14 }), 500)
    
    return () => {
      clearTimeout(timer1)
    }
  }, [])

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 border border-red-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/5 to-yellow-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
        <div className="absolute left-0 top-0 w-1 h-32 bg-gradient-to-b from-red-600 to-transparent" />
        <div className="absolute right-0 bottom-0 w-1 h-32 bg-gradient-to-t from-red-600 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-0">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ===== LEFT CONTENT ===== */}
          <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* 🔥 1️⃣ PAIN HOOK - Langsung nancep! */}
            <div className="mb-6 animate-pulse-slow">
              <p className="text-lg md:text-xl font-bold text-red-600 bg-red-50 inline-block px-6 py-3 rounded-xl border border-red-200 shadow-sm">
                ⚡ Industrial Projects Delayed? Overbudget? Poor Coordination?
              </p>
            </div>
            
            {/* Badge with icon */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-50 border border-red-200 rounded-full">
              <HardHat size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                Engineering-Led Construction Contractor
              </span>
            </div>

            {/* ===== PRIMARY HEADLINE ===== */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              <span className="text-gray-900">Engineering-Led </span>
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Construction Contractor
              </span>
              <span className="text-gray-900"> in Indonesia</span>
            </h1>

            {/* 🔥 2️⃣ KEYWORD INDONESIA */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Kontraktor Industri Indonesia
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Jasa Konstruksi Baja
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                Kontraktor Design & Build
              </span>
            </div>

            {/* Decorative line */}
            <div className="flex gap-2 mt-6">
              <div className="w-16 h-1 bg-red-600 rounded-full" />
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
              <div className="w-4 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* ===== SUB HEADLINE ===== */}
            <p className="mt-8 text-xl text-gray-700 font-medium max-w-2xl">
              Steel Structure, Civil Engineering, MEP Installation & Design-Build Services
              <span className="block text-base text-gray-500 font-normal mt-2">
                for Industrial and Commercial Projects Across Indonesia
              </span>
            </p>

            {/* ===== TRUST INDICATORS WITH ICONS ===== */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trustItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group hover:scale-105 transition-transform duration-300">
                  <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                    <item.icon size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== DESCRIPTION ===== */}
            <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">PT Manggala Putra Persada (MPP Engineering)</span> delivers 
                integrated construction solutions through structured planning, rigorous quality control, 
                and disciplined execution. Our engineering-led approach ensures:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-gray-900">Cost Certainty</strong> – Value engineering & budget control</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-gray-900">Schedule Reliability</strong> – Integrated planning & monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-gray-900">Quality Assurance</strong> – Systematic inspection & testing</span>
                </li>
              </ul>
            </div>

            {/* ===== CTA SECTION ===== */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/kontak"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5"
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
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 🔥 3️⃣ MICRO TRUST - Bikin user aman */}
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

            {/* ===== SOCIAL PROOF ===== */}
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white animate-float"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Trusted by 50+ Industrial Partners</p>
                <p className="text-xs text-gray-500">Since 2010 • Completed 100+ Projects</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT VISUAL ===== */}
          <div className="hidden lg:block relative">
            {/* Main Image Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-float-slow">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10" />
              
              <Image
                src="/images/hero-project.jpg"
                alt="Engineering-led construction project by PT Manggala Putra Persada - Industrial building construction site with steel structure"
                width={800}
                height={1000}
                priority
                className="object-cover w-full h-[600px] scale-105 hover:scale-100 transition-transform duration-700"
              />

              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Award size={20} className="text-yellow-400" />
                  <span className="text-sm font-medium">ISO 9001:2015 Certified</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Industrial Plant Construction</h3>
                <p className="text-sm text-gray-200 mb-4">Steel Structure • MEP • Civil Works</p>
                
                {/* Stats dengan animated counters */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-2xl font-bold">{counts.projects}+</p>
                    <p className="text-xs text-gray-300">Industrial Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-gray-300">Safety Record</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{counts.experience}+</p>
                    <p className="text-xs text-gray-300">Years Experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card - Experience (dengan subtle animation) */}
            <div className="absolute -bottom-6 -left-12 bg-white rounded-xl shadow-xl p-5 max-w-[200px] border border-gray-100 animate-float-slow">
              <p className="text-xs text-gray-500 mb-1">Engineering Experience</p>
              <p className="text-2xl font-black text-gray-900">{counts.experience}+ Years</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-600">Active Projects: 8</span>
              </div>
            </div>

            {/* Floating Card - Projects (dengan subtle animation) */}
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-float" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Building2 size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed Projects</p>
                  <p className="text-xl font-bold text-gray-900">{counts.projects}+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM WAVE ===== */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
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
