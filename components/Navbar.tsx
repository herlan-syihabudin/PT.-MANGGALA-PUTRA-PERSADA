"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { 
  Menu, 
  X, 
  ChevronDown,
  Phone,
  Mail,
  Building2,
  HardHat,
  Zap,
  Paintbrush,
  Compass,
  ChevronRight
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [openServiceDesktop, setOpenServiceDesktop] = useState(false)
  const [openServiceMobile, setOpenServiceMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Detect scroll untuk efek header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenServiceDesktop(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Prevent scroll when mobile menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/"
    return pathname?.startsWith(path)
  }

  const services = [
    {
      href: "/layanan/konstruksi-sipil",
      label: "Konstruksi Sipil",
      icon: Building2,
      description: "Pembangunan infrastruktur, gedung, dan fasilitas sipil"
    },
    {
      href: "/layanan/struktur-baja",
      label: "Struktur Baja",
      icon: HardHat,
      description: "Fabrikasi dan erection struktur baja berat"
    },
    {
      href: "/layanan/mep",
      label: "MEP",
      icon: Zap,
      description: "Mechanical, Electrical, & Plumbing"
    },
    {
      href: "/layanan/fit-out",
      label: "Interior & Fit Out",
      icon: Paintbrush,
      description: "Desain interior dan penyelesaian akhir"
    },
    {
      href: "/layanan/design-build",
      label: "Design & Build",
      icon: Compass,
      description: "Solusi terintegrasi desain dan konstruksi"
    }
  ]

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-md py-2" 
            : "bg-white/90 backdrop-blur-sm py-0"
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src="/logo-mp1.png"
                alt="PT Manggala Putra Persada"
                width={40}
                height={40}
                priority
                className="transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight leading-tight">
                <span className="text-gray-900">MPP</span>
                <span className="text-red-600 ml-1">Engineering</span>
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">
                Contractors & Engineers
              </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <NavLink href="/" active={isActive("/")}>
              Home
            </NavLink>
            
            <NavLink href="/tentang" active={isActive("/tentang")}>
              Tentang Kami
            </NavLink>

            {/* DROPDOWN LAYANAN - HOVER BASED */}
            <div 
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setOpenServiceDesktop(true)}
              onMouseLeave={() => setOpenServiceDesktop(false)}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-md transition-all ${
                  isActive("/layanan")
                    ? "text-red-600 font-semibold"
                    : "text-gray-700 hover:text-red-600"
                }`}
                aria-expanded={openServiceDesktop}
                aria-haspopup="true"
              >
                Layanan 
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    openServiceDesktop ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega Menu Dropdown */}
              {openServiceDesktop && (
                <div className="absolute left-0 top-full mt-1 w-80 bg-white border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {services.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        onClick={() => setOpenServiceDesktop(false)}
                      >
                        <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                          <service.icon size={18} className="text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{service.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-gray-400 group-hover:text-red-600" />
                      </Link>
                    ))}
                  </div>
                  
                  {/* Footer dropdown */}
                  <div className="bg-gray-50 px-4 py-3 border-t">
                    <Link 
                      href="/layanan" 
                      className="text-sm text-red-600 hover:underline flex items-center gap-1"
                      onClick={() => setOpenServiceDesktop(false)}
                    >
                      Lihat semua layanan <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/proyek" active={isActive("/proyek")}>
              Proyek
            </NavLink>
            
            <NavLink href="/klien" active={isActive("/klien")}>
              Klien & Mitra
            </NavLink>
            
            <NavLink href="/insight" active={isActive("/insight")}>
              Insight
            </NavLink>

            {/* Kontak terpisah sebagai CTA */}
            <Link
              href="/kontak"
              className="ml-4 bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
            >
              Konsultasi Proyek
            </Link>
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU - SIDEBAR STYLE */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu panel */}
          <div 
            ref={mobileMenuRef}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            <div className="p-6 space-y-6">
              
              {/* Header mobile */}
              <div className="flex items-center justify-between pb-4 border-b">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Image
                    src="/logo-mp1.png"
                    alt="Logo"
                    width={32}
                    height={32}
                  />
                  <span className="font-bold text-lg">MPP Engineering</span>
                </Link>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu items */}
              <div className="space-y-4">
                <MobileLink 
                  href="/" 
                  active={isActive("/")}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </MobileLink>
                
                <MobileLink 
                  href="/tentang" 
                  active={isActive("/tentang")}
                  onClick={() => setIsOpen(false)}
                >
                  Tentang Kami
                </MobileLink>

                {/* Mobile Layanan Dropdown */}
                <div>
                  <button
                    onClick={() => setOpenServiceMobile(!openServiceMobile)}
                    className="w-full flex items-center justify-between py-2 text-gray-700 font-medium hover:text-red-600"
                    aria-expanded={openServiceMobile}
                  >
                    Layanan
                    <ChevronDown 
                      size={18} 
                      className={`transition-transform duration-200 ${
                        openServiceMobile ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openServiceMobile && (
                    <div className="mt-3 ml-4 space-y-3 border-l-2 border-red-200 pl-4">
                      {services.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="flex items-start gap-3 py-2 text-gray-600 hover:text-red-600 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <service.icon size={16} className="mt-0.5 text-gray-400 group-hover:text-red-600" />
                          <div>
                            <p className="font-medium">{service.label}</p>
                            <p className="text-xs text-gray-500">{service.description}</p>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href="/layanan"
                        className="flex items-center gap-1 py-2 text-sm text-red-600 hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        Lihat semua layanan <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>

                <MobileLink 
                  href="/proyek" 
                  active={isActive("/proyek")}
                  onClick={() => setIsOpen(false)}
                >
                  Proyek
                </MobileLink>
                
                <MobileLink 
                  href="/klien" 
                  active={isActive("/klien")}
                  onClick={() => setIsOpen(false)}
                >
                  Klien & Mitra
                </MobileLink>
                
                <MobileLink 
                  href="/insight" 
                  active={isActive("/insight")}
                  onClick={() => setIsOpen(false)}
                >
                  Insight
                </MobileLink>
              </div>

              {/* Contact Info Mobile */}
              <div className="pt-6 border-t space-y-3">
                <a href="tel:02138716203" className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-600">
                  <Phone size={16} className="text-red-600" />
                  <span>021-38716203</span>
                </a>
                <a href="mailto:info@mppindo.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-red-600">
                  <Mail size={16} className="text-red-600" />
                  <span>info@mppindo.com</span>
                </a>
              </div>

              {/* CTA Mobile */}
              <Link
                href="/kontak"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-all"
              >
                Konsultasi Proyek Gratis
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Komponen untuk NavLink desktop
function NavLink({ 
  href, 
  children, 
  active 
}: { 
  href: string
  children: React.ReactNode
  active: boolean 
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md transition-all ${
        active
          ? "text-red-600 font-semibold bg-red-50"
          : "text-gray-700 hover:text-red-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  )
}

// Komponen untuk link mobile
function MobileLink({ 
  href, 
  children, 
  active,
  onClick 
}: { 
  href: string
  children: React.ReactNode
  active?: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-2 font-medium transition-colors ${
        active
          ? "text-red-600"
          : "text-gray-700 hover:text-red-600"
      }`}
    >
      {children}
    </Link>
  )
}
