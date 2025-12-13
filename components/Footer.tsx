import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        {/* COMPANY */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">
            PT Manggala Putra Persada
          </h3>
          <p className="text-sm leading-relaxed">
            Engineering & Structured Construction company yang
            menghadirkan pendekatan terukur, disiplin teknik,
            dan komitmen terhadap mutu serta keselamatan kerja.
          </p>
        </div>

        {/* SERVICES */}
        <div>
          <h4 className="text-white font-semibold mb-4">Layanan</h4>
          <ul className="space-y-2 text-sm">
            <li>Konstruksi Sipil & Struktur</li>
            <li>Struktur Baja</li>
            <li>MEP</li>
            <li>Interior & Finishing</li>
            <li>Design & Build</li>
          </ul>
        </div>

        {/* NAVIGATION */}
        <div>
          <h4 className="text-white font-semibold mb-4">Navigasi</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/tentang" className="hover:text-white">Tentang Kami</Link></li>
            <li><Link href="/layanan" className="hover:text-white">Layanan</Link></li>
            <li><Link href="/proyek" className="hover:text-white">Proyek</Link></li>
            <li><Link href="/kontak" className="hover:text-white">Kontak</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h4 className="text-white font-semibold mb-4">Kontak</h4>
          <p className="text-sm">
            Bekasi, Jawa Barat<br />
            Indonesia
          </p>
          <p className="mt-2 text-sm">
            Telp / WhatsApp:<br />
            <a
              href="https://wa.me/6281297396612"
              className="hover:text-white"
            >
              +62 812-9739-6612
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} PT Manggala Putra Persada. All rights reserved.
      </div>
    </footer>
  )
}
