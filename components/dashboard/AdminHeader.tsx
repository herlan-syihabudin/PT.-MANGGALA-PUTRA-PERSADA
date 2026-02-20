"use client"

import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Menu
} from "lucide-react"
import { useState } from "react"

type AdminHeaderProps = {
  onMobileMenuToggle?: () => void
  showMobileMenu?: boolean
}

export default function AdminHeader({
  onMobileMenuToggle,
  showMobileMenu,
}: AdminHeaderProps) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">
        
        {/* MOBILE HAMBURGER */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Branding */}
        <div className="hidden md:block">
          <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-[0.2em] leading-none mb-1">
            CRM Platform
          </p>
          <p className="font-black text-gray-900 text-sm tracking-tight">
            PT Manggala Putra Persada
          </p>
        </div>
      </div>

      {/* CENTER SEARCH */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari data, proyek, atau dokumen..."
            className="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block" />

        {/* USER PROFILE */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              AD
            </div>

            <div className="hidden md:block text-left leading-none">
              <p className="text-sm font-bold text-gray-900">Administrator</p>
              <p className="text-[10px] text-gray-500 font-medium mt-1">Super User</p>
            </div>

            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} 
            />
          </button>

          {showProfile && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowProfile(false)} 
              />

              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in zoom-in duration-200">
                
                <div className="px-4 py-2 border-b border-gray-50 mb-2">
                  <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    admin@mpp.co.id
                  </p>
                </div>
                
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <User size={16} /> Profile Settings
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <Settings size={16} /> System Logs
                </button>
                
                <div className="h-[1px] bg-gray-100 my-2 mx-4" />
                
                <button 
                  onClick={() => alert("Logging out...")}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
