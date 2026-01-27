import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-mp.png"
            alt="PT Manggala Putra Persada"
            width={36}
            height={36}
            priority
          />
          <span className="font-extrabold text-lg tracking-tight">
            <span className="text-gray-900">MPP</span>
            <span className="text-red-600 ml-1">Engineering</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-red-600 transition">
            About
          </Link>
          <Link href="/services" className="hover:text-red-600 transition">
            Services
          </Link>
          <Link href="/projects" className="hover:text-red-600 transition">
            Projects
          </Link>

          {/* CTA */}
          <a
            href="https://wa.me/6281297396612?text=Hello%20PT%20Manggala%20Putra%20Persada,%20I%20would%20like%20to%20discuss%20a%20project"
            target="_blank"
            rel="noreferrer"
            className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Project Inquiry
          </a>
        </nav>
      </div>
    </header>
  )
}
