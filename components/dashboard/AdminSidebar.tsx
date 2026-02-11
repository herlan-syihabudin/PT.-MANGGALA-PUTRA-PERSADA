"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ERP_MENU } from "@/core/erpMenuConfig"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { LogOut, UserCircle } from "lucide-react" // Tambahin icon

export default function AdminSidebar() {
  const pathname = usePathname()
  const [inquiryCount, setInquiryCount] = useState(0)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  useEffect(() => {
    async function fetchCount() {
      // Hanya fetch kalau tab lagi aktif (hemat resource)
      if (document.visibilityState !== 'visible') return;
      
      try {
        const res = await fetch("/api/estimator/inquiry/count")
        if (!res.ok) return
        const data = await res.json()
        setInquiryCount(data.count || 0)
      } catch (error) {
        console.error("Sidebar count error:", error)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 15000) // 15 detik cukup aman
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-72 bg-[#0f172a] text-gray-400 hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-800">
      
      {/* ===== LOGO ===== */}
      <div className="px-8 py-8 flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20">
            M
          </div>
          <p className="text-xl font-bold text-white tracking-tight">
            MPP<span className="text-blue-500 font-extralight ml-1">ERP</span>
          </p>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 font-medium tracking-widest uppercase italic">
          Estimation & Project System
        </p>
      </div>

      {/* ===== MENU (WITH CUSTOM SCROLLBAR) ===== */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) => isActive(i.href))

          return (
            <div key={group.section}>
              {/* SECTION HEADER */}
              <div className={`px-4 mb-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.15em]
                ${sectionActive ? "text-blue-400" : "text-gray-600"}`}>
                {group.section}
              </div>

              {/* ITEMS */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  const hasNotification = item.href === "/admin/estimator/rab" && inquiryCount > 0

                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                        ${active ? "text-white" : "hover:text-gray-200"}`}>
                        
                        {/* ANIMATED BG */}
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              layoutId="active-pill"
                              className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent rounded-xl border-l-2 border-blue-500"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                          )}
                        </AnimatePresence>

                        <Icon size={18} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 
                          ${active ? "text-blue-400" : "text-gray-500"}`} 
                        />

                        <span className="relative z-10 font-medium text-[13px]">{item.name}</span>

                        {/* BADGE */}
                        {hasNotification && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40"
                          >
                            {inquiryCount}
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

      {/* ===== USER PROFILE CARD (THE UPGRADE) ===== */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-800 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <UserCircle size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-200 truncate">Estimator Utama</p>
            <p className="text-[10px] text-gray-500 truncate italic">estimator@mpp.co.id</p>
          </div>
          <button className="text-gray-600 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-4 text-center font-mono">
          v2.1.0-2026
        </p>
      </div>
    </aside>
  )
}
