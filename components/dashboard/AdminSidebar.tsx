"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/store/useSidebar"
import { useEffect, useMemo, useRef, useState } from "react"
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

/* ========= HOOK: REALTIME COUNTS (SSE + FALLBACK POLLING) ========= */

function useRealtimeCounts(): RealtimeCounts {
  const [counts, setCounts] = useState<RealtimeCounts>({
    estimator_inquiry: 0,
    finance_approval: 0,
    purchasing_request: 0,
  })

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let es: EventSource | null = null

    function updateFromPayload(payload: any) {
      setCounts((prev) => ({
        estimator_inquiry:
          typeof payload?.estimator_inquiry === "number"
            ? payload.estimator_inquiry
            : prev.estimator_inquiry,
        finance_approval:
          typeof payload?.finance_approval === "number"
            ? payload.finance_approval
            : prev.finance_approval,
        purchasing_request:
          typeof payload?.purchasing_request === "number"
            ? payload.purchasing_request
            : prev.purchasing_request,
      }))
    }

    async function fetchSnapshot() {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      )
        return

      try {
        const res = await fetch("/api/notifications/summary")
        if (!res.ok) return
        const data = await res.json()
        updateFromPayload(data)
      } catch (err) {
        console.error("Fetch notif summary error:", err)
      }
    }

    if (typeof window !== "undefined") {
      try {
        es = new EventSource("/api/notifications/stream")

        es.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data)
            updateFromPayload(payload)
          } catch (err) {
            console.error("SSE parse error:", err)
          }
        }

        es.onerror = () => {
          console.warn("SSE error, fallback to polling…")
          es?.close()
          es = null
          fetchSnapshot()
          interval = setInterval(fetchSnapshot, 10000)
        }
      } catch (err) {
        console.error("SSE init error, fallback to polling:", err)
        fetchSnapshot()
        interval = setInterval(fetchSnapshot, 10000)
      }
    }

    fetchSnapshot()

    return () => {
      if (es) es.close()
      if (interval) clearInterval(interval)
    }
  }, [])

  return counts
}

/* ========= HOOK: SESSION USER ========= */

function useSessionUser(): SessionUser {
  const [user, setUser] = useState<SessionUser>({
    name: "Estimator Utama",
    email: "estimator@mpp.co.id",
    role: "ESTIMATOR",
  })

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return

        setUser({
          name: data.name || "User",
          email: data.email || "user@mpp.co.id",
          role: (data.role || "STAFF").toUpperCase(),
        })
      } catch (err) {
        console.error("Fetch session user error:", err)
      }
    }

    fetchUser()
    return () => {
      cancelled = true
    }
  }, [])

  return user
}

/* ========= UTIL: CLICK OUTSIDE ========= */

function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  onOutside: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return

    function handler(e: MouseEvent) {
      const target = e.target as Node
      const insideAny = refs.some((r) => r.current?.contains(target))
      if (!insideAny) onOutside()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOutside()
    }

    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", onKey)
    }
  }, [refs, onOutside, enabled])
}

/* ========= COMPONENT: SIDEBAR ========= */

export default function AdminSidebar() {
  const pathname = usePathname()

  const { estimator_inquiry, finance_approval, purchasing_request } =
    useRealtimeCounts()
  const user = useSessionUser()

  const [notifOpen, setNotifOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)

  const { collapsed, toggle } = useSidebar()

  // Collapsible sidebar (persist)

  useEffect(() => {
    try {
      localStorage.setItem("mpp_sidebar_collapsed", collapsed ? "1" : "0")
    } catch {}
  }, [collapsed])

  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const quickBtnRef = useRef<HTMLButtonElement>(null)
  const quickPanelRef = useRef<HTMLDivElement>(null)

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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    }
    window.location.href = "/login"
  }

  const totalNotif =
    estimator_inquiry + finance_approval + purchasing_request

  const sidebarWidth = collapsed ? "w-[80px]" : "w-[280px]"
  const padX = collapsed ? "px-3" : "px-6"
  

  const quickActions = useMemo(
    () => [
      {
        label: "New Inquiry",
        desc: "Buat lead masuk",
        href: "/admin/crm/inquiry/new",
      },
      {
        label: "New RAB",
        desc: "Mulai estimator",
        href: "/admin/estimator/rab/new",
      },
      {
        label: "New Project",
        desc: "Create proyek",
        href: "/admin/projects/new",
      },
      {
        label: "New PO",
        desc: "Purchase Order",
        href: "/admin/purchasing/po/new",
      },
    ],
    []
  )

  return (
    <aside
      className={`${sidebarWidth} overflow-visible hidden md:flex flex-col h-screen fixed top-0 left-0 z-50
      bg-gradient-to-b from-[#0B1120] via-[#0f172a] to-[#111827]
      backdrop-blur-xl
      text-gray-400 border-r border-gray-800 shadow-2xl shadow-black/40 transition-[margin] duration-300 ease-in-out`}
    >
      {/* ===== TOP AREA ===== */}
      <div className={`${padX} pt-6 pb-4 flex items-center justify-between`}>
        {/* LOGO */}
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
                Estimation & Project System
              </p>
            </div>
          )}
        </div>

        {/* RIGHT TOP ICONS */}
        <div className="flex items-center gap-2">
          {/* Collapse toggle */}
          <button
  type="button"
  onClick={toggle}
  className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors"
>
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-300" />
            ) : (
              <ChevronLeft size={16} className="text-gray-300" />
            )}
          </button>

          {/* Global notif bell */}
          <div className="relative">
            <button
              ref={notifBtnRef}
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v)
                setQuickOpen(false)
              }}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell size={16} className="text-gray-300" />
              {totalNotif > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] text-white rounded-full px-1.5 py-[1px] font-bold shadow-lg shadow-red-500/40">
                  {totalNotif}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  ref={notifPanelRef}
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
                      onClick={() => setNotifOpen(false)}
                    />
                    <NotifRow
                      label="Finance – Menunggu approval"
                      count={finance_approval}
                      href="/admin/finance/approval"
                      onClick={() => setNotifOpen(false)}
                    />
                    <NotifRow
                      label="Purchasing – Request baru"
                      count={purchasing_request}
                      href="/admin/purchasing/request"
                      onClick={() => setNotifOpen(false)}
                    />
                  </div>

                  <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500">
                    Klik item untuk membuka modul terkait • ESC to close
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===== QUICK ACTION ===== */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-3`}>
        <div className="relative">
          <button
            ref={quickBtnRef}
            type="button"
            onClick={() => {
              setQuickOpen((v) => !v)
              setNotifOpen(false)
            }}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-800
            bg-gradient-to-r from-blue-600/25 to-transparent hover:from-blue-600/35 transition-colors
            ${collapsed ? "py-2" : "py-2.5"}`}
            title="Quick Actions"
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
              <motion.div
                ref={quickPanelRef}
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
                  {quickActions.map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      onClick={() => setQuickOpen(false)}
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
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== MINI WIDGET (SYSTEM STATUS) ===== */}
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
              <div className="w-2 h-2 rounded-full bg-green-400 shadow shadow-green-500/40" />
            </div>
          )}
        </div>
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-3 pb-4 pt-2 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) => isActive(i.href))

          return (
            <div key={group.section}>
              {/* SECTION HEADER */}
              {!collapsed && (
                <div
                  className={`px-4 mb-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.15em]
                  ${sectionActive ? "text-blue-400" : "text-gray-600"}`}
                >
                  {group.section}
                </div>
              )}

              {/* ITEMS */}
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
                      : 0

                  const hasNotification = badgeCount > 0

                  return (
                    <SidebarItem
                      key={item.href}
                      href={item.href}
                      label={item.name}
                      active={active}
                      collapsed={collapsed}
                      badgeCount={badgeCount}
                    >
                      <Icon
                        size={18}
                        className={`transition-transform duration-300 group-hover:scale-110
                        ${active ? "text-blue-400" : "text-gray-500"}`}
                      />
                      {/* keep children only for icon */}
                      {hasNotification && collapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow shadow-red-500/40" />
                      )}
                    </SidebarItem>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ===== USER PROFILE CARD ===== */}
      <div className={`${collapsed ? "p-3" : "p-4"} mt-auto`}>
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
            onClick={handleLogout}
            className={`text-gray-600 hover:text-red-400 transition-colors ${
              collapsed ? "hidden" : ""
            }`}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>

        {!collapsed && (
          <p className="text-[10px] text-gray-600 mt-4 text-center font-mono">
            v2.2.0-2026 • live
          </p>
        )}
      </div>
    </aside>
  )
}

/* ========= COMPONENTS ========= */

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800/40 border border-gray-800 rounded-xl px-2 py-2 text-center">
      <p className="text-[9px] text-gray-500 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-[12px] font-bold text-gray-100 mt-0.5">{value}</p>
    </div>
  )
}

function SidebarItem({
  href,
  label,
  active,
  collapsed,
  badgeCount,
  children,
}: {
  href: string
  label: string
  active: boolean
  collapsed: boolean
  badgeCount?: number
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="block">
      <div
        className={`relative flex items-center gap-3 rounded-xl transition-all duration-300 group
        ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5"}
        ${active ? "text-white" : "hover:text-gray-200"}`}
      >
        {/* active background */}
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-blue-600/22 to-transparent rounded-xl border-l-2 border-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">{children}</div>

        {!collapsed && (
          <span className="relative z-10 font-medium text-[13px]">
            {label}
          </span>
        )}

        {!collapsed && (badgeCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto relative z-10 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40"
          >
            {badgeCount}
          </motion.span>
        )}

        {/* tooltip when collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="bg-gray-900 border border-gray-700 text-[11px] text-gray-100 px-2 py-1 rounded-lg shadow-xl whitespace-nowrap">
              {label}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

/* ========= SMALL COMPONENT: NOTIF ROW ========= */

function NotifRow({
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
          {count}
        </span>
      </div>
    </Link>
  )
}
