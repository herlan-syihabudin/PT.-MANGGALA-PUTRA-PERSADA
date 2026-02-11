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
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <AdminHeader />

        {/* BREADCRUMB */}
        <div className="px-6 py-3 border-b bg-white">
          <Breadcrumb />
        </div>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-auto bg-gray-50">
          <div className="p-6 min-w-[1024px]">
            {children}
          </div>
        </main>
      </div>

      {/* 🔥 GLOBAL TOASTER FOR ERP */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}
