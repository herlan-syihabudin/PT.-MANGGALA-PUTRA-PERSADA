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
            width={40}
            height={40}
            priority
          />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-red-600">Manggala Putra Persada</span>
          </span>
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <Link href="/tentang" className="hover:text-red-600">Tentang</Link>
          <Link href="/layanan" className="hover:text-red-600">Layanan</Link>
          <Link href="/proyek" className="hover:text-red-600">Proyek</Link>
          <Link
            href="/kontak"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Kontak
          </Link>
        </nav>
      </div>
    </header>
  )
}
