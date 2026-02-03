"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [openMobile, setOpenMobile] = useState(false)
  const [openService, setOpenService] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-mp1.png"
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

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-red-600 transition">Home</Link>
          <Link href="/tentang" className="hover:text-red-600 transition">Tentang Kami</Link>

          {/* DROPDOWN LAYANAN – CLICK BASED */}
<div className="relative">
  <button
    onClick={() => setOpenService(!openService)}
    className="flex items-center gap-1 hover:text-red-600 transition"
  >
    Layanan <span className="text-xs">▾</span>
  </button>

  {openService && (
    <div
      className="absolute left-0 top-full mt-3 w-56 bg-white border rounded-lg shadow-lg z-50"
      onMouseLeave={() => setOpenService(false)}
    >
      <Link
        href="/layanan/konstruksi-sipil"
        onClick={() => setOpenService(false)}
        className="block px-4 py-2 hover:bg-gray-50"
      >
        Konstruksi Sipil
      </Link>
      <Link
        href="/layanan/struktur-baja"
        onClick={() => setOpenService(false)}
        className="block px-4 py-2 hover:bg-gray-50"
      >
        Struktur Baja
      </Link>
      <Link
        href="/layanan/mep"
        onClick={() => setOpenService(false)}
        className="block px-4 py-2 hover:bg-gray-50"
      >
        MEP
      </Link>
      <Link
        href="/layanan/fit-out"
        onClick={() => setOpenService(false)}
        className="block px-4 py-2 hover:bg-gray-50"
      >
        Interior & Fit Out
      </Link>
      <Link
        href="/layanan/design-build"
        onClick={() => setOpenService(false)}
        className="block px-4 py-2 hover:bg-gray-50"
      >
        Design & Build
      </Link>
    </div>
  )}
</div>

          <Link href="/proyek" className="hover:text-red-600 transition">Proyek</Link>
          <Link href="/klien" className="hover:text-red-600 transition">Klien & Mitra</Link>
          <Link href="/insight" className="hover:text-red-600 transition">Insight</Link>

          {/* CTA */}
          <Link
            href="/kontak"
            className="bg-red-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Konsultasi Proyek
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpenMobile(!openMobile)}
          className="md:hidden text-gray-700 text-xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {openMobile && (
        <div className="md:hidden bg-white border-t">
          <div className="px-6 py-4 space-y-3 text-sm">
            <Link href="/" onClick={() => setOpenMobile(false)}>Home</Link>
            <Link href="/tentang" onClick={() => setOpenMobile(false)}>Tentang Kami</Link>
            <Link href="/layanan" onClick={() => setOpenMobile(false)}>Layanan</Link>
            <Link href="/proyek" onClick={() => setOpenMobile(false)}>Proyek</Link>
            <Link href="/klien" onClick={() => setOpenMobile(false)}>Klien & Mitra</Link>
            <Link href="/insight" onClick={() => setOpenMobile(false)}>Insight</Link>

            <Link
              href="/kontak"
              onClick={() => setOpenMobile(false)}
              className="block mt-4 text-center bg-red-600 text-white py-2 rounded-md font-semibold"
            >
              Konsultasi Proyek
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
