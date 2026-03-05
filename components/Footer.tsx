"use client"

import Link from "next/link"
import Image from "next/image"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Globe,
  Award,
  ChevronRight,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Shield,
  FileText,
  Building2,
  HardHat,
  Zap,
  Paintbrush,
  Compass
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "6281229222463"
const PHONE = process.env.NEXT_PUBLIC_PHONE || "02138716203"
const EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@mppindo.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mppindo.com"

const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hello PT Manggala Putra Persada, I would like to discuss a project inquiry."
)}`

// Format phone untuk display
const formatPhone = (phone: string) => {
  if (!phone) return ""
  if (phone.startsWith("0") && phone.length >= 10) {
    return phone.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3")
  }
  return phone
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    
    setSubscribing(true)
    // TODO: Implement newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success("Thank you for subscribing!")
    setEmail("")
    setSubscribing(false)
  }

  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      
      {/* ===== BACKGROUND ELEMENTS ===== */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.02]" />
      </div>

      {/* ===== MAIN FOOTER ===== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Top section with logo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 shrink-0">
              <Image
                src="/images/logo-mpp.png"
                alt="PT Manggala Putra Persada - Engineering & Construction Contractor"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">PT Manggala Putra Persada</h2>
              <p className="text-sm text-gray-400">Engineering & Construction Contractor</p>
            </div>
          </div>
          
          {/* Gold divider */}
          <div className="hidden md:block w-64 h-[2px] bg-gradient-to-r from-gold via-gold/50 to-transparent rounded-full" />
        </div>

        {/* Main Grid - 4 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* ===== COLUMN 1: COMPANY INFO ===== */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Building2 size={18} className="text-gold" aria-hidden="true" />
                About Company
              </h3>
              <div className="w-12 h-[2px] bg-gold rounded-full mb-4" />
            </div>

            <p className="text-sm leading-relaxed text-gray-400">
              PT Manggala Putra Persada is an engineering and construction
              company in Indonesia delivering structured civil, steel structure,
              and MEP solutions through disciplined planning, technical accuracy,
              and accountable project execution.
            </p>

            {/* Standards & Commitments */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gold uppercase tracking-wider">
                Standards & Commitments
              </p>
              <div className="flex flex-wrap gap-2">
                {standards.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-md"
                  >
                    <Shield size={10} className="text-gold" aria-hidden="true" />
                    <span className="text-xs text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Status */}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <FileText size={12} aria-hidden="true" />
              Legally registered construction company in Indonesia
            </p>
          </div>

          {/* ===== COLUMN 2: SERVICES ===== */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <HardHat size={18} className="text-gold" aria-hidden="true" />
                Our Services
              </h3>
              <div className="w-12 h-[2px] bg-gold rounded-full mb-4" />
            </div>

            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    href={service.href}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                  >
                    <service.icon size={14} className="text-gold group-hover:translate-x-1 transition" aria-hidden="true" />
                    <span>{service.name}</span>
                    <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== COLUMN 3: QUICK LINKS ===== */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Compass size={18} className="text-gold" aria-hidden="true" />
                Quick Links
              </h3>
              <div className="w-12 h-[2px] bg-gold rounded-full mb-4" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1 group"
                >
                  <ChevronRight size={10} className="text-gold opacity-0 group-hover:opacity-100 transition" aria-hidden="true" />
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Social Media */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-white mb-3">Follow Us</p>
              <div className="flex gap-3">
                {socialMedia.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gold hover:text-gray-900 transition group"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <social.icon size={16} className="group-hover:scale-110 transition" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ===== COLUMN 4: CONTACT ===== */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Phone size={18} className="text-gold" aria-hidden="true" />
                Contact Info
              </h3>
              <div className="w-12 h-[2px] bg-gold rounded-full mb-4" />
            </div>

            <div className="space-y-4">
              
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-1 flex-shrink-0" aria-hidden="true" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Setu+Bekasi+West+Java+17320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group transition"
                >
                  <p className="text-sm text-gray-400 group-hover:text-white transition">
                    Setu, Bekasi Regency
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-300 transition">
                    West Java 17320 – Indonesia
                  </p>
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gold flex-shrink-0" aria-hidden="true" />
                <div className="flex flex-col">
                  <a 
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    +62 812 2922 2463 (WhatsApp)
                  </a>
                  <a
                    href={`tel:${PHONE}`}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    {formatPhone(PHONE)}
                  </a>
                </div>
              </div>
            
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gold flex-shrink-0" aria-hidden="true" />
                <a 
                  href={`mailto:${EMAIL}?subject=Project Inquiry - PT MPP`}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {EMAIL}
                </a>
              </div>

              {/* Website */}
<div className="flex items-center gap-3">
  <Globe size={16} className="text-gold flex-shrink-0" aria-hidden="true" />
  <a 
    href={SITE_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-gray-400 hover:text-white transition"
  >
    {SITE_URL.replace(/^https?:\/\//, "")}
  </a>
</div>

              {/* Business Hours */}
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-1 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-400">Monday – Friday</p>
                  <p className="text-xs text-gray-500">08.00 – 17.00 WIB</p>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4">
              <p className="text-sm font-semibold text-white mb-2">Get Updates</p>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold"
                  disabled={subscribing}
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-gold text-gray-900 rounded-r-lg font-semibold text-sm hover:bg-gold/80 transition disabled:opacity-50"
                >
                  {subscribing ? '...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <p className="text-xs text-gray-500">
              © {currentYear} PT Manggala Putra Persada. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex gap-6 text-xs">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-400 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-400 transition">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-500 hover:text-gray-400 transition">
                Sitemap
              </Link>
            </div>

            {/* Made with */}
            <p className="text-xs text-gray-600">
              Engineered with precision in Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Data
const standards = [
  "Quality Management Approach",
  "Safety-First Policy",
  "Environmental Responsibility"
]

const services = [
  { name: "Civil & Structural Construction", icon: Building2, href: "/layanan/konstruksi-sipil" },
  { name: "Steel Structure Engineering", icon: HardHat, href: "/layanan/struktur-baja" },
  { name: "MEP Systems Integration", icon: Zap, href: "/layanan/mep" },
  { name: "Interior & Architectural Fit-Out", icon: Paintbrush, href: "/layanan/fit-out" },
  { name: "Design & Build Solutions", icon: Compass, href: "/layanan/design-build" },
]

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/tentang" },
  { name: "Services", href: "/layanan" },
  { name: "Projects", href: "/proyek" },
  { name: "Insights", href: "/insight" },
  { name: "Contact", href: "/kontak" },
]

const socialMedia = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/mppengineering" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/mpp-engineering" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/mppengineering" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@mppengineering" },
]
