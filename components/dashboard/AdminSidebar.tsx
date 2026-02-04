"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ERP_MENU } from "@/core/erpMenuConfig"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside className="w-72 bg-gray-900 text-gray-300 hidden md:flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-lg font-extrabold text-white">
          MPP<span className="text-yellow-400"> ERP</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Enterprise Resource Planning
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 text-sm">
        {ERP_MENU.map((group) => (
          <div key={group.section}>
            <p className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 flex items-center gap-2">
              <group.icon size={14} />
              {group.section}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                      ${
                        isActive(item.href)
                          ? "bg-gray-800 text-white"
                          : "hover:bg-gray-800 hover:text-white"
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
        © {new Date().getFullYear()} PT Manggala Putra Persada
      </div>
    </aside>
  )
}
