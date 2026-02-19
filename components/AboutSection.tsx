import Image from "next/image"
import { 
  Award, 
  Users, 
  Building2, 
  HardHat,
  CheckCircle,
  Target,
  Eye,
  TrendingUp,
  Shield,
  Clock,
  Zap
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
            <span className="text-sm font-semibold text-red-700">Engineering Excellence Since 2010</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            Engineering-Driven Construction with 
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent"> Structured Approach</span>
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
                <span className="font-bold text-gray-900">PT Manggala Putra Persada</span> is an engineering and construction company
                in Indonesia delivering projects through disciplined planning,
                controlled execution, and measurable quality standards.
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">
                We believe reliable construction outcomes are achieved through
                strong engineering fundamentals, clear systems of work, and
                technical discipline to ensure long-term performance, safety,
                and sustainability.
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
              <p className="text-sm font-semibold text-gray-900">Certified by:</p>
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
                  <h3 className="text-2xl font-bold">Our Vision</h3>
                </div>
                <p className="text-lg text-white/90 leading-relaxed">
                  To become a trusted engineering and construction partner by
                  delivering structured, precise, and accountable project
                  execution across Indonesia.
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
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
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
                <h4 className="font-semibold text-gray-900 mb-4">Our Core Values</h4>
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
              <p className="text-sm font-semibold text-gray-900">Ready to start your project?</p>
              <p className="text-xs text-gray-500">Join 50+ industrial partners who trust us</p>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition ml-4">
              Consult Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Data
const stats = [
  { value: "14+", label: "Years Experience" },
  { value: "100+", label: "Projects Completed" },
  { value: "50+", label: "Industrial Clients" },
]

const differentiators = [
  {
    icon: HardHat,
    title: "Engineering-Led",
    description: "Every project starts with engineering fundamentals"
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "Structured planning & schedule control"
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "ISO 9001 certified processes"
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Licensed engineers & certified workers"
  }
]

const missions = [
  "Deliver engineering-led construction solutions across all project phases",
  "Maintain strict quality, safety, and schedule control systems",
  "Build long-term trust through professional work systems and transparency",
  "Continuous innovation in construction methods and technologies"
]

const values = [
  "Integrity", "Excellence", "Safety First", "Innovation", "Accountability", "Teamwork"
]

const certifications = [
  "ISO 9001:2015", "ISO 14001:2015", "ISO 45001:2018", "SMK3"
]

const milestones = [
  { year: "2010", text: "Company founded in Jakarta" },
  { year: "2015", text: "First industrial plant project" },
  { year: "2018", text: "ISO 9001 certification" },
  { year: "2020", text: "Expanded to design-build services" },
  { year: "2024", text: "50+ industrial clients milestone" }
]
