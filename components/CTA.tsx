"use client"

import { Phone, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="relative py-20 md:py-24 bg-gradient-to-br from-red-600 to-red-700 overflow-hidden">
      
      {/* SUBTLE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] bg-gold rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* HEADLINE */}
        <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
          Ready to Discuss Your 
          <span className="block text-gold mt-2">
            Industrial Project?
          </span>
        </h2>

        {/* SUBTEXT */}
        <p className="mt-6 text-lg text-red-100 max-w-3xl mx-auto leading-relaxed">
          PT Manggala Putra Persada delivers structured engineering planning,
          disciplined execution, and accountable construction delivery
          for industrial and commercial developments across Indonesia.
        </p>

        {/* CTA BUTTONS */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          
          <a
            href="https://wa.me/6281297396612"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            <Phone size={18} />
            Schedule Project Consultation
          </a>

          <Link
            href="/kontak"
            className="inline-flex items-center justify-center border border-white/50 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition"
          >
            Request Quotation
          </Link>
        </div>

        {/* MICRO TRUST */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gold" />
            ISO 9001 Certified
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-gold" />
            24-Hour Response Guarantee
          </div>
        </div>

      </div>
    </section>
  )
}
