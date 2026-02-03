"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar() {
  const pathname = usePathname()

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "CRM Inquiry", href: "/admin/crm/inquiry" },
    { name: "Projects", href: "/admin/projects/list" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Settings", href: "/admin/settings" },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 hidden md:flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-lg font-extrabold text-white">
          MPP<span className="text-gold"> Admin</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          CRM & Project System
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800 hover:text-white"
                }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
        © {new Date().getFullYear()} MPP
      </div>
    </aside>
  )
}
