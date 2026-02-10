"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ERP_MENU } from "@/core/erpMenuConfig"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside className="w-72 bg-gray-900 text-gray-300 hidden md:flex flex-col relative">
      {/* ===== LOGO ===== */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-lg font-extrabold text-white tracking-wide">
          MPP<span className="text-yellow-400"> ERP</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Enterprise Resource Planning
        </p>
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-7 text-sm">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) =>
            isActive(i.href)
          )

          return (
            <div key={group.section} className="relative">
              {/* ===== SECTION HEADER ===== */}
              <div
                className={`px-4 mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider transition-colors
                ${
                  sectionActive
                    ? "text-blue-400"
                    : "text-gray-500"
                }`}
              >
                <group.icon size={14} />
                {group.section}

                {/* glow dot when active */}
                {sectionActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                )}
              </div>

              {/* ===== ITEMS ===== */}
              <div className="space-y-1 relative">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`relative flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer
                        transition-all duration-200
                        ${
                          active
                            ? "text-blue-400 font-semibold"
                            : "hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {/* ACTIVE BACKGROUND */}
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              layoutId="sidebar-active-bg"
                              className="absolute inset-0 rounded-lg bg-blue-600/15"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* ACTIVE LEFT BAR */}
                        {active && (
                          <motion.span
                            layoutId="sidebar-active-bar"
                            className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 28,
                            }}
                          />
                        )}

                        {/* ICON */}
                        <Icon
                          size={16}
                          className={`relative z-10 ${
                            active ? "text-blue-400" : ""
                          }`}
                        />

                        {/* TEXT */}
                        <span className="relative z-10">
                          {item.name}
                        </span>

                        {/* subtle arrow indicator */}
                        {active && (
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-auto text-[10px] text-blue-400 relative z-10"
                          >
                            ●
                          </motion.span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
        © {new Date().getFullYear()} PT Manggala Putra Persada
      </div>
    </aside>
  )
}
