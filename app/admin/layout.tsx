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
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-yellow-100">
      
      {/* SIDEBAR - Fixed width, hidden on mobile logic typically handled inside component */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER - Sticky at the top */}
        <AdminHeader />

        {/* SUB-HEADER: Breadcrumb with more style */}
        <div className="px-8 py-3 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <Breadcrumb />
          <div className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Manggala Putra Persada v1.0
          </div>
        </div>

        {/* CONTENT AREA - Smooth scrolling */}
        <main className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {/* Ganti min-w-[1024px] jadi max-w-screen-2xl mx-auto 
             biar dashboard nggak "melebar" terlalu jauh di monitor Ultra-Wide 
          */}
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
