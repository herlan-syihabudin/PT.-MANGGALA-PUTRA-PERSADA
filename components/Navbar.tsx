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
          <Link href="/tentang" className="hover:text-red-600 transition">
            Tentang
          </Link>
          <Link href="/layanan" className="hover:text-red-600 transition">
            Layanan
          </Link>
          <Link href="/proyek" className="hover:text-red-600 transition">
            Proyek
          </Link>

          {/* CTA */}
          <Link
            href="/kontak"
            className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Konsultasi Proyek
          </Link>
        </nav>
      </div>
    </header>
  )
}
