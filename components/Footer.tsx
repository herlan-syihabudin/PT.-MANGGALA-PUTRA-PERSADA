import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-12">

        {/* COMPANY */}
        <div>
          <h3 className="text-white font-extrabold text-lg mb-3">
            PT Manggala Putra Persada
          </h3>

          {/* GOLD DIVIDER */}
          <div className="h-[3px] w-12 bg-gold rounded-full mb-4" />

          <p className="text-sm leading-relaxed">
            PT Manggala Putra Persada is an engineering and construction
            company in Indonesia delivering structured civil, steel structure,
            and MEP solutions through disciplined planning, technical accuracy,
            and accountable project execution.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            Legally registered construction company in Indonesia.
          </p>
        </div>

        {/* SERVICES */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Services
          </h4>
          <ul className="space-y-2 text-sm">
            <li>Civil & Structural Construction</li>
            <li>Steel Structure Engineering</li>
            <li>MEP Systems Integration</li>
            <li>Interior & Architectural Fit-Out</li>
            <li>Design & Build Solutions</li>
          </ul>
        </div>

        {/* COMPANY NAV */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Company
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link href="/tentang" className="hover:text-white transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/layanan" className="hover:text-white transition">
                Services
              </Link>
            </li>
            <li>
              <Link href="/proyek" className="hover:text-white transition">
                Projects
              </Link>
            </li>
            <li>
              <Link href="/insight" className="hover:text-white transition">
                Insights
              </Link>
            </li>
            <li>
              <Link href="/kontak" className="hover:text-white transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h4 className="text-white font-semibold mb-4">
            Contact
          </h4>

          <p className="text-sm leading-relaxed">
            Bekasi, West Java<br />
            Indonesia
          </p>

          <p className="mt-3 text-sm">
            Phone / WhatsApp:<br />
            <a
              href="https://wa.me/6281297396612"
              className="hover:text-white transition"
            >
              +62 812-9739-6612
            </a>
          </p>

          <p className="mt-3 text-sm">
            Email:<br />
            <a
              href="mailto:info@mpp-engineering.com"
              className="hover:text-white transition"
            >
              info@mpp-engineering.com
            </a>
          </p>

          <p className="mt-4 text-xs text-gray-400">
            Business Hours:<br />
            Monday – Friday | 08.00 – 17.00 WIB
          </p>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} PT Manggala Putra Persada. All rights reserved.
      </div>
    </footer>
  )
}
