"use client"

import { useEffect, useState } from "react"
import AdminSidebar from "@/components/dashboard/AdminSidebar"
import AdminHeader from "@/components/dashboard/AdminHeader"
import Breadcrumb from "@/components/dashboard/ui/Breadcrumb"
import { Toaster } from "sonner"
import { useERPStore } from "@/store/erpStore"
import { useThemeStore } from "@/store/useThemeStore"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Hydration safe state
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Get store values with safe defaults
  const collapsed = useERPStore((s) => s.collapsed)
  const { dark } = useThemeStore()

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  /* ================= APPLY DARK MODE GLOBAL ================= */
  useEffect(() => {
    if (!mounted) return
    
    // Don't force dark mode on sidebar - let sidebar handle itself
    // Only apply to layout background
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark, mounted])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  if (!mounted) {
    // SSR fallback
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-[280px]">
          <div className="h-16 bg-white border-b" />
          <div className="p-8">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300 relative
        ${dark ? "bg-gray-950" : "bg-gray-50"}
      `}
    >
      {/* SIDEBAR - Desktop */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white border-4 border-white dark:border-gray-900"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 z-50 md:hidden"
            >
              <AdminSidebar onMobileClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300
          ${collapsed ? "md:ml-[80px]" : "md:ml-[280px]"}
          ml-0 // No margin on mobile
        `}
      >
        {/* HEADER */}
        <AdminHeader 
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          showMobileMenu={!mobileMenuOpen}
        />

        {/* SUB HEADER (GLASS EFFECT) */}
        <div
          className={`px-4 md:px-8 py-3 border-b flex items-center justify-between backdrop-blur-xl sticky top-0 z-30
            ${
              dark
                ? "bg-gray-900/80 border-gray-800 text-gray-200"
                : "bg-white/80 border-gray-200 text-gray-900"
            }
          `}
        >
          <Breadcrumb />
          <div className="hidden md:block text-[10px] font-bold uppercase tracking-tighter opacity-60">
            Manggala Putra Persada v1.0
          </div>
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        theme={dark ? "dark" : "light"}
      />
    </div>
  )
}
