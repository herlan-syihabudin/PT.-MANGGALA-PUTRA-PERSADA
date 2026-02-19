"use client"

import { 
  Phone, 
  Mail, 
  Calendar, 
  ChevronRight,
  Clock,
  Shield,
  CheckCircle,
  MessageSquare,
  Download,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CTA() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative py-28 bg-gradient-to-br from-red-600 to-red-700 overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gold accent blobs */}
        <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gold/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] bg-black/10 rounded-full blur-3xl" />
        
        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float-slow" />
        <div className="absolute bottom-20 right-1/4 w-3 h-3 bg-gold/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ===== TRUST BADGES ===== */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <badge.icon size={14} className="text-gold" />
              <span className="text-xs font-medium text-white">{badge.text}</span>
            </div>
          ))}
        </div>

        {/* ===== GOLD DIVIDER ===== */}
        <div className="gold-divider mx-auto mb-8" />

        {/* ===== MAIN HEADLINE ===== */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white max-w-4xl mx-auto leading-tight">
          Ready to Discuss Your 
          <span className="bg-gradient-to-r from-gold to-yellow-400 bg-clip-text text-transparent"> Industrial Project</span>
          ?
        </h2>

        {/* ===== SUB HEADLINE ===== */}
        <p className="mt-6 text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
          PT Manggala Putra Persada supports industrial, commercial, and
          residential projects through structured engineering planning,
          disciplined execution, and accountable construction delivery.
        </p>

        {/* ===== VALUE PROPOSITION CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          {valueProps.map((prop, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/10">
              <div className="p-2 bg-gold/20 rounded-lg">
                <prop.icon size={18} className="text-gold" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{prop.title}</p>
                <p className="text-xs text-red-200 mt-1">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== CTA BUTTONS ===== */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          
          {/* PRIMARY CTA - WhatsApp */}
          <a
            href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 bg-white text-red-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <MessageSquare size={20} />
            Schedule Project Consultation
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          {/* SECONDARY CTA - Request Quotation */}
          <Link
            href="/kontak"
            className="group inline-flex items-center justify-center gap-3 border-2 border-gold text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-gold/10 transition-all hover:-translate-y-1"
          >
            <Download size={18} />
            Request Quotation
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ===== ADDITIONAL CONTACT OPTIONS ===== */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-red-200">
          <a href="tel:+622112345678" className="flex items-center gap-2 hover:text-white transition">
            <Phone size={16} />
            <span>021-1234-5678</span>
          </a>
          <a href="mailto:info@mpp.co.id" className="flex items-center gap-2 hover:text-white transition">
            <Mail size={16} />
            <span>info@mpp.co.id</span>
          </a>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Mon-Fri, 8:00 - 17:00</span>
          </div>
        </div>

        {/* ===== RESPONSE GUARANTEE ===== */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-red-200">
          <Shield size={14} className="text-gold" />
          <span>24-hour response guarantee on all inquiries</span>
          <CheckCircle size={14} className="text-gold ml-2" />
          <span>NDA available upon request</span>
        </div>

        {/* ===== SOCIAL PROOF MINI ===== */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <p className="text-sm text-red-200">Trusted by industry leaders:</p>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
              ))}
            </div>
            <p className="text-sm text-white font-semibold">50+ Industrial Partners</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Data
const trustBadges = [
  { icon: Shield, text: "ISO 9001 Certified" },
  { icon: Clock, text: "14+ Years Experience" },
  { icon: CheckCircle, text: "100+ Projects Completed" },
]

const valueProps = [
  {
    icon: Calendar,
    title: "Free Consultation",
    description: "Discuss your project with our engineers"
  },
  {
    icon: Download,
    title: "Detailed Proposal",
    description: "Get comprehensive RAB and timeline"
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "ISO certified quality assurance"
  }
]
