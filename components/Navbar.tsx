export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-xl">
          <span className="text-red-600">MP</span> Persada
        </div>

        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="/">Home</a>
          <a href="/tentang">Tentang</a>
          <a href="/layanan">Layanan</a>
          <a href="/proyek">Proyek</a>
          <a href="/kontak">Kontak</a>
        </nav>
      </div>
    </header>
  )
}
