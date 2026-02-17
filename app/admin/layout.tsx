"use client"

import AdminSidebar from "@/components/dashboard/AdminSidebar"
import AdminHeader from "@/components/dashboard/AdminHeader"
import Breadcrumb from "@/components/dashboard/ui/Breadcrumb"
import { Toaster } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR (Fixed inside component) */}
      <AdminSidebar />

      {/* MAIN WRAPPER (shifted by sidebar width) */}
      <div className="flex-1 flex flex-col min-w-0 ml-72 transition-all duration-300">
        
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

      {/* GLOBAL TOASTER */}
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
