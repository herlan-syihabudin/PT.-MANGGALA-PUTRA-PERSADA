"use client"

import AdminSidebar from "@/components/dashboard/AdminSidebar"
import AdminHeader from "@/components/dashboard/AdminHeader"
import Breadcrumb from "@/components/dashboard/ui/Breadcrumb"
import { Toaster } from "sonner"
import { useERPStore } from "@/store/erpStore"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const collapsed = useERPStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
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

        {/* SUB HEADER */}
        <div className="px-8 py-3 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <Breadcrumb />
          <div className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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

      {/* TOASTER */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          style: { borderRadius: '1rem' },
        }} 
      />
    </div>
  )
}
