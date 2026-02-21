"use client"

import Link from "next/link"
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react"
import { usePathname } from "next/navigation"
import { useERPStore } from "@/store/erpStore"
import { motion, AnimatePresence } from "framer-motion"
import {
  LogOut,
  UserCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutDashboard,
  Search,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
   Boxes, 
} from "lucide-react"
import { ERP_MENU } from "@/core/erpMenuConfig"

/* ========= TYPES ========= */
type SessionUser = {
  name: string
  email: string
  role: string
}

type RealtimeCounts = {
  estimator_inquiry: number
  finance_approval: number
  purchasing_request: number
}

/* ========= HOOK: REALTIME COUNTS (OPTIMIZED) ========= */
function useRealtimeListener() {
  const setCounts = useERPStore((s) => s.setCounts)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let interval: ReturnType<typeof setInterval> | null = null
    let es: EventSource | null = null

    function updateFromPayload(payload: any) {
      if (!mountedRef.current) return
      setCounts({
        estimator_inquiry:
          typeof payload?.estimator_inquiry === "number"
            ? payload.estimator_inquiry
            : undefined,
        finance_approval:
          typeof payload?.finance_approval === "number"
            ? payload.finance_approval
            : undefined,
        purchasing_request:
          typeof payload?.purchasing_request === "number"
            ? payload.purchasing_request
            : undefined,
      })
    }

    async function fetchSnapshot() {
      if (!mountedRef.current) return
      try {
        const res = await fetch("/api/notifications/summary", {
          signal: AbortSignal.timeout?.(5000) // timeout 5 detik
        })
        if (!res.ok) return
        const data = await res.json()
        if (mountedRef.current) updateFromPayload(data)
      } catch (err) {
        // Silent fail untuk performance
        if (process.env.NODE_ENV === 'development') {
          console.debug("Notif summary error:", err)
        }
      }
    }

    // Gunakan SSE jika browser support
    if (typeof window !== 'undefined' && window.EventSource) {
      try {
        es = new EventSource("/api/notifications/stream")
        
        es.onmessage = (event) => {
          if (!mountedRef.current) return
          try {
            const payload = JSON.parse(event.data)
            updateFromPayload(payload)
          } catch (err) {
            // Silent
          }
        }

        es.onerror = () => {
          if (!mountedRef.current) return
          es?.close()
          es = null
          fetchSnapshot()
          interval = setInterval(fetchSnapshot, 15000) // polling lebih jarang
        }
      } catch (err) {
        fetchSnapshot()
        interval = setInterval(fetchSnapshot, 15000)
      }
    } else {
      fetchSnapshot()
      interval = setInterval(fetchSnapshot, 15000)
    }

    fetchSnapshot()

    return () => {
      mountedRef.current = false
      if (es) es.close()
      if (interval) clearInterval(interval)
    }
  }, [setCounts])
}

/* ========= HOOK: SESSION USER (CACHED) ========= */
function useSessionUser(): SessionUser {
  const [user, setUser] = useState<SessionUser>(() => {
    // Coba ambil dari localStorage untuk fast render
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('mpp_user')
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch (e) {}
      }
    }
    return {
      name: "Estimator Utama",
      email: "estimator@mpp.co.id",
      role: "ESTIMATOR",
    }
  })

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: AbortSignal.timeout?.(3000)
        })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        const newUser = {
          name: data.name || "User",
          email: data.email || "user@mpp.co.id",
          role: (data.role || "STAFF").toUpperCase(),
        }
        
        setUser(newUser)
        localStorage.setItem('mpp_user', JSON.stringify(newUser))
      } catch (err) {
        // Silent fail, pakai cache
      }
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [])

  return user
}

/* ========= HOOK: CLICK OUTSIDE (OPTIMIZED) ========= */
function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return

    function handler(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      const insideAny = refs.some((r) => r.current?.contains(target))
      if (!insideAny) onOutside()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside()
    }

    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler) // Untuk mobile
    document.addEventListener("keydown", onKey)
    
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
      document.removeEventListener("keydown", onKey)
    }
  }, [refs, onOutside, enabled])
}

/* ========= HOOK: MEDIA QUERY (RESPONSIVE) ========= */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
  const media = window.matchMedia(query)

  const listener = (e: MediaQueryListEvent) => {
    setMatches(e.matches)
  }

  setMatches(media.matches)

  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}, [query])
  return matches
}

/* ========= COMPONENT: SIDEBAR ========= */
interface AdminSidebarProps {
  onMobileClose?: () => void
}

export default function AdminSidebar({ onMobileClose }: AdminSidebarProps) {
  useRealtimeListener()
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  // State dengan optimasi
  const estimator_inquiry = useERPStore((s) => s.counts.estimator_inquiry)
  const finance_approval = useERPStore((s) => s.counts.finance_approval)
  const purchasing_request = useERPStore((s) => s.counts.purchasing_request)
  const user = useSessionUser()

  const [notifOpen, setNotifOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist collapsed state dengan localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mpp_sidebar_collapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Toggle dengan persist
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => {
      const newValue = !prev
      localStorage.setItem('mpp_sidebar_collapsed', JSON.stringify(newValue))
      return newValue
    })
  }, [])

  // Auto collapse di mobile
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false)
    }
  }, [isMobile])

  // Refs
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const quickBtnRef = useRef<HTMLButtonElement>(null)
  const quickPanelRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null)

  useClickOutside(
    [notifBtnRef, notifPanelRef],
    () => setNotifOpen(false),
    notifOpen
  )
  useClickOutside(
    [quickBtnRef, quickPanelRef],
    () => setQuickOpen(false),
    quickOpen
  )
  useClickOutside(
    [sidebarRef, mobileMenuBtnRef],
    () => setMobileOpen(false),
    mobileOpen && isMobile
  )

  // Memoized values
  const totalNotif = useMemo(() => 
    estimator_inquiry + finance_approval + purchasing_request,
    [estimator_inquiry, finance_approval, purchasing_request]
  )

  const quickActions = useMemo(
    () => [
      {
        label: "New Inquiry",
        desc: "Buat lead masuk",
        href: "/admin/crm/inquiry/new",
        icon: FileText,
      },
      {
        label: "New RAB",
        desc: "Mulai estimator",
        href: "/admin/estimator/rab/new",
        icon: BarChart3,
      },
      {
        label: "New Project",
        desc: "Create proyek",
        href: "/admin/projects/new",
        icon: LayoutDashboard,
      },
      {
  label: "New Library",
  desc: "Tambah work template",
  href: "/admin/estimator/library/new",
  icon: Boxes,
},
      {
        label: "New PO",
        desc: "Purchase Order",
        href: "/admin/purchasing/po/new",
        icon: ShoppingCart,
      },
    ],
    []
  )

  const isActive = useCallback((href: string) => 
    pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  )

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem('mpp_user')
      window.location.href = "/login"
    } catch (err) {
      console.error("Logout error:", err)
    }
  }, [])

  const handleLinkClick = () => {
  if (onMobileClose) {
    onMobileClose()
  }
}

  // Class names
  const sidebarWidth = collapsed ? "w-[80px]" : "w-[280px]"
  const padX = collapsed ? "px-3" : "px-6"

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          ref={mobileMenuBtnRef}
          onClick={() => setMobileOpen(prev => !prev)}
          className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-300 shadow-lg"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                ref={sidebarRef}
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 w-[280px] h-screen z-50 overflow-hidden
                  bg-gradient-to-b from-[#0B1120] via-[#0f172a] to-[#111827]
                  text-gray-400 border-r border-gray-800 shadow-2xl"
              >
                <MobileSidebarContent
                  user={user}
                  pathname={pathname}
                  totalNotif={totalNotif}
                  estimator_inquiry={estimator_inquiry}
                  finance_approval={finance_approval}
                  purchasing_request={purchasing_request}
                  quickActions={quickActions}
                  isActive={isActive}
                  onLogout={handleLogout}
                  onClose={() => setMobileOpen(false)}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <aside
      ref={sidebarRef}
      className={`${sidebarWidth} overflow-visible hidden md:flex flex-col h-screen fixed top-0 left-0 z-50
      bg-gradient-to-b from-[#0B1120] via-[#0f172a] to-[#111827]
      backdrop-blur-xl
      text-gray-400 border-r border-gray-800 shadow-2xl shadow-black/40 transition-[width] duration-300 ease-in-out`}
    >
      {/* Desktop Content */}
      <DesktopSidebarContent
        collapsed={collapsed}
        onLinkClick={handleLinkClick}
        padX={padX}
        totalNotif={totalNotif}
        estimator_inquiry={estimator_inquiry}
        finance_approval={finance_approval}
        purchasing_request={purchasing_request}
        quickActions={quickActions}
        user={user}
        isActive={isActive}
        onToggle={toggleSidebar}
        onNotifToggle={() => {
          setNotifOpen(prev => !prev)
          setQuickOpen(false)
        }}
        notifOpen={notifOpen}
        notifBtnRef={notifBtnRef}
        notifPanelRef={notifPanelRef}
        onQuickToggle={() => {
          setQuickOpen(prev => !prev)
          setNotifOpen(false)
        }}
        quickOpen={quickOpen}
        quickBtnRef={quickBtnRef}
        quickPanelRef={quickPanelRef}
        onLogout={handleLogout}
      />
    </aside>
  )
}

/* ========= DESKTOP SIDEBAR CONTENT ========= */
const DesktopSidebarContent = React.memo(function DesktopSidebarContent({
  collapsed,
  padX,
  totalNotif,
  estimator_inquiry,
  finance_approval,
  purchasing_request,
  quickActions,
  user,
  isActive,
  onToggle,
  onLinkClick,
  onNotifToggle,
  notifOpen,
  notifBtnRef,
  notifPanelRef,
  onQuickToggle,
  quickOpen,
  quickBtnRef,
  quickPanelRef,
  onLogout,
}: any) {
  return (
    <>
      {/* TOP AREA */}
      <div className={`${padX} pt-6 pb-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20 shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-lg font-bold text-white tracking-tight truncate">
                MPP<span className="text-blue-500 font-extralight ml-1">ERP</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-widest uppercase italic truncate">
                Estimation & Project
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-300" />
            ) : (
              <ChevronLeft size={16} className="text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              ref={notifBtnRef}
              type="button"
              onClick={onNotifToggle}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} className="text-gray-300" />
              {totalNotif > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] text-white rounded-full px-1.5 py-[1px] font-bold shadow-lg shadow-red-500/40">
                  {totalNotif > 9 ? '9+' : totalNotif}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <NotificationPanel
                  ref={notifPanelRef}
                  estimator_inquiry={estimator_inquiry}
                  finance_approval={finance_approval}
                  purchasing_request={purchasing_request}
                  onClose={() => onNotifToggle()}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* QUICK ACTION */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-3`}>
        <div className="relative">
          <button
            ref={quickBtnRef}
            type="button"
            onClick={onQuickToggle}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-800
            bg-gradient-to-r from-blue-600/25 to-transparent hover:from-blue-600/35 transition-colors
            ${collapsed ? "py-2" : "py-2.5"}`}
            aria-label="Quick actions"
          >
            <Plus size={16} className="text-blue-300" />
            {!collapsed && (
              <span className="text-[12px] font-semibold text-gray-100">
                Create
              </span>
            )}
          </button>

          <AnimatePresence>
            {quickOpen && (
              <QuickActionPanel
                ref={quickPanelRef}
                actions={quickActions}
                onClose={() => onQuickToggle()}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MINI WIDGET */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-4`}>
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              System
            </p>
            <span className="text-[10px] text-green-400 font-semibold">
              Live
            </span>
          </div>

          {!collapsed ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              <MiniStat label="Inquiry" value={estimator_inquiry} />
              <MiniStat label="Approval" value={finance_approval} />
              <MiniStat label="Request" value={purchasing_request} />
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 pb-4 pt-2 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) => isActive(i.href))

          return (
            <div key={group.section}>
              {!collapsed && (
                <div
                  className={`px-4 mb-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.15em]
                  ${sectionActive ? "text-blue-400" : "text-gray-600"}`}
                >
                  {group.section}
                </div>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  const badgeCount =
  item.href === "/admin/estimator/rab"
    ? estimator_inquiry
    : item.href === "/admin/finance/approval"
    ? finance_approval
    : item.href === "/admin/purchasing/request"
    ? purchasing_request
    : item.href === "/admin/estimator/library"
    ? 0 // 🔥 nanti bisa diganti library_draft_count
    : 0

                  return (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      label={item.name}
        
                      onClick={onLinkClick}
                      active={active}
                      collapsed={collapsed}
                      badgeCount={badgeCount}
                    >
                      <Icon
                        size={18}
                        className={`transition-transform duration-300 group-hover:scale-110
                        ${active ? "text-blue-400" : "text-gray-500"}`}
                      />
                    </SidebarItem>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* USER PROFILE */}
      <div className={`${collapsed ? "p-3" : "p-4"} mt-auto`}>
        <UserProfile
          collapsed={collapsed}
          user={user}
          onLogout={onLogout}
        />
      </div>
    </>
  )
})

/* ========= MOBILE SIDEBAR CONTENT ========= */
const MobileSidebarContent = React.memo(function MobileSidebarContent({
  user,
  pathname,
  totalNotif,
  estimator_inquiry,
  finance_approval,
  purchasing_request,
  quickActions,
  isActive,
  onLogout,
  onClose,
}: any) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white italic">
            M
          </div>
          <div>
            <p className="text-lg font-bold text-white">MPP ERP</p>
            <p className="text-[10px] text-gray-500">Estimation System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Quick Actions Mobile */}
      <div className="px-4 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-500 mb-2 px-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.slice(0, 4).map((action: any) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={onClose}
              className="bg-gray-800/40 border border-gray-700 rounded-xl p-3 hover:bg-gray-800 transition-colors"
            >
              <action.icon size={18} className="text-blue-400 mb-2" />
              <p className="text-xs font-medium text-gray-200">{action.label}</p>
              <p className="text-[9px] text-gray-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Menu Mobile */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {ERP_MENU.map((group) => (
          <div key={group.section} className="mb-6">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider px-2 mb-2">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                const badgeCount =
  item.href === "/admin/estimator/rab"
    ? estimator_inquiry
    : item.href === "/admin/finance/approval"
    ? finance_approval
    : item.href === "/admin/purchasing/request"
    ? purchasing_request
    : item.href === "/admin/estimator/library"
    ? 0
    : 0

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${active 
                        ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500" 
                        : "text-gray-400 hover:bg-gray-800/60"}`}
                  >
                    <Icon size={18} />
                    <span className="text-sm flex-1">{item.name}</span>
                    {badgeCount > 0 && (
                      <span className="bg-red-500 text-[9px] text-white rounded-full px-2 py-0.5 font-bold">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Mobile */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <UserCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-200">{user.name}</p>
            <p className="text-[10px] text-blue-400">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
})

/* ========= NOTIFICATION PANEL ========= */
const NotificationPanel = React.forwardRef(function NotificationPanel(
  { estimator_inquiry, finance_approval, purchasing_request, onClose }: any,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20"
    >
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-200">
          Notification Center
        </p>
        <span className="text-[10px] text-gray-500">Realtime</span>
      </div>

      <div className="py-2 text-xs">
        <NotifRow
          label="Estimator – Inquiry baru"
          count={estimator_inquiry}
          href="/admin/estimator/to-estimate"
          onClick={onClose}
        />
        <NotifRow
          label="Finance – Menunggu approval"
          count={finance_approval}
          href="/admin/finance/approval"
          onClick={onClose}
        />
        <NotifRow
          label="Purchasing – Request baru"
          count={purchasing_request}
          href="/admin/purchasing/request"
          onClick={onClose}
        />
      </div>

      <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500">
        Klik item untuk membuka modul terkait
      </div>
    </motion.div>
  )
})

/* ========= QUICK ACTION PANEL ========= */
const QuickActionPanel = React.forwardRef(function QuickActionPanel(
  { actions, onClose }: any,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="absolute left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-30"
    >
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-200">
          Quick Create
        </p>
        <span className="text-[10px] text-gray-500">Fast entry</span>
      </div>

      <div className="p-2">
        {actions.map((a: any) => (
          <Link
            key={a.href}
            href={a.href}
            onClick={onClose}
            className="block"
          >
            <div className="px-3 py-2 rounded-lg hover:bg-gray-800/80 transition-colors">
              <p className="text-[12px] font-semibold text-gray-100">
                {a.label}
              </p>
              <p className="text-[10px] text-gray-500">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500">
        Tips: Create dulu → nanti detail bisa dilengkapi
      </div>
    </motion.div>
  )
})

/* ========= MINI STAT ========= */
const MiniStat = React.memo(function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800/40 border border-gray-800 rounded-xl px-2 py-2 text-center">
      <p className="text-[9px] text-gray-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-[12px] font-bold text-gray-100 mt-0.5">{value}</p>
    </div>
  )
})

/* ========= SIDEBAR ITEM ========= */
const SidebarItem = React.memo(function SidebarItem({
  href,
  label,
  active,
  collapsed,
  badgeCount,
  children,
  onClick,
}: {
  href: string
  label: string
  active: boolean
  collapsed: boolean
  badgeCount?: number
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className="block">
      <div
        className={`relative flex items-center gap-3 rounded-xl transition-all duration-300 group
        ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5"}
        ${active ? "text-white" : "hover:text-gray-200"}`}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-blue-600/22 to-transparent rounded-xl border-l-2 border-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">{children}</div>

        {!collapsed && (
          <span className="relative z-10 font-medium text-[13px] flex-1">
            {label}
          </span>
        )}

        {!collapsed && (badgeCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40"
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </motion.span>
        )}

        {collapsed && (badgeCount ?? 0) > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow shadow-red-500/40" />
        )}

        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-gray-900 border border-gray-700 text-[11px] text-gray-100 px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">
              {label}
              {badgeCount ? ` (${badgeCount})` : ''}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
})

/* ========= USER PROFILE ========= */
const UserProfile = React.memo(function UserProfile({
  collapsed,
  user,
  onLogout,
}: {
  collapsed: boolean
  user: SessionUser
  onLogout: () => void
}) {
  return (
    <div
      className={`bg-gray-800/40 rounded-2xl border border-gray-800 flex items-center gap-3 group
      ${collapsed ? "p-3 justify-center" : "p-4"}`}
    >
      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
        <UserCircle size={24} />
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-200 truncate">
            {user.name}
          </p>
          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">
            {user.role}
          </p>
          <p className="text-[10px] text-gray-500 truncate italic">
            {user.email}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onLogout}
        className={`text-gray-600 hover:text-red-400 transition-colors ${
          collapsed ? "hidden" : ""
        }`}
        title="Logout"
        aria-label="Logout"
      >
        <LogOut size={16} />
      </button>

      {collapsed && (
        <button
          type="button"
          onClick={onLogout}
          className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 border border-gray-700"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut size={10} />
        </button>
      )}
    </div>
  )
})

/* ========= NOTIFICATION ROW ========= */
const NotifRow = React.memo(function NotifRow({
  label,
  count,
  href,
  onClick,
}: {
  label: string
  count: number
  href: string
  onClick?: () => void
}) {
  const has = count > 0

  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`px-4 py-2 flex items-center justify-between hover:bg-gray-800/80 cursor-pointer transition-colors ${
          !has ? "opacity-60" : ""
        }`}
      >
        <span className="text-[11px] text-gray-200">{label}</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            has ? "bg-red-500/80 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          {count > 9 ? '9+' : count}
        </span>
      </div>
    </Link>
  )
})
