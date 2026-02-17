"use client"

import { useEffect } from "react"
import AdminSidebar from "@/components/dashboard/AdminSidebar"
import AdminHeader from "@/components/dashboard/AdminHeader"
import Breadcrumb from "@/components/dashboard/ui/Breadcrumb"
import { Toaster } from "sonner"
import { useERPStore } from "@/store/erpStore"
import { useThemeStore } from "@/store/useThemeStore"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const collapsed = useERPStore((s) => s.collapsed)
  const { dark } = useThemeStore()

  /* ================= APPLY DARK MODE GLOBAL ================= */
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [dark])

  return (
    <div
      className={`min-h-screen flex transition-colors duration-300
        ${dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}
      `}
    >
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* HEADER */}
        <AdminHeader />

        {/* SUB HEADER (GLASS EFFECT) */}
        <div
          className={`px-8 py-3 border-b flex items-center justify-between backdrop-blur-xl
            ${
              dark
                ? "bg-white/5 border-white/10"
                : "bg-white/60 border-gray-200"
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

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
