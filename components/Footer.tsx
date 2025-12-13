export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-14 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-3">
            PT Manggala Putra Persada
          </h3>
          <p className="text-sm leading-relaxed">
            General Contractor & MEP <br />
            Pabrik · Perumahan · Full Package
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-white font-semibold mb-3">Layanan</h4>
          <ul className="text-sm space-y-2">
            <li>Konstruksi Sipil</li>
            <li>Konstruksi Baja</li>
            <li>MEP</li>
            <li>Interior & Fit Out</li>
            <li>Renovasi & Maintenance</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">Kontak</h4>
          <p className="text-sm leading-relaxed">
            Bekasi – Jawa Barat <br />
            WhatsApp: 0812-9739-6612
          </p>

          <a
            className="inline-block mt-4 text-sm font-semibold text-white bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
            href="https://wa.me/6281297396612?text=Halo%20PT%20Manggala%20Putra%20Persada,%20saya%20ingin%20konsultasi%20proyek"
            target="_blank"
            rel="noreferrer"
          >
            Konsultasi via WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-gray-800 text-xs text-gray-400 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} PT Manggala Putra Persada. All rights reserved.</p>
        <p>Bekasi · Indonesia</p>
      </div>
    </footer>
  )
}
