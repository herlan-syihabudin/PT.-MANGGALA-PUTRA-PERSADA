"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, UserCircle, Bell } from "lucide-react"
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
    let interval: NodeJS.Timeout | null = null
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
      // hemat resource: cuma fetch kalau tab aktif
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return

      try {
        const res = await fetch("/api/notifications/summary")
        if (!res.ok) return
        const data = await res.json()
        updateFromPayload(data)
      } catch (err) {
        console.error("Fetch notif summary error:", err)
      }
    }

    // 1) Coba SSE dulu
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

          // Fallback polling setiap 10 detik
          fetchSnapshot()
          interval = setInterval(fetchSnapshot, 10000)
        }
      } catch (err) {
        console.error("SSE init error, fallback to polling:", err)
        fetchSnapshot()
        interval = setInterval(fetchSnapshot, 10000)
      }
    }

    // initial snapshot
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

/* ========= COMPONENT: SIDEBAR ========= */

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const { estimator_inquiry, finance_approval, purchasing_request } =
    useRealtimeCounts()
  const user = useSessionUser()

  const [notifOpen, setNotifOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      // apapun hasilnya, paksa ke halaman login
      if (res.ok) {
        router.push("/login")
      } else {
        router.push("/login")
      }
    } catch {
      router.push("/login")
    }
  }

  // total global notif (bisa dipakai di icon bell)
  const totalNotif =
    estimator_inquiry + finance_approval + purchasing_request

  return (
    <aside className="w-72 bg-[#0f172a] text-gray-400 hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-800">
      {/* ===== TOP AREA (LOGO + GLOBAL NOTIF) ===== */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/20">
            M
          </div>
          <div>
            <p className="text-lg font-bold text-white tracking-tight">
              MPP<span className="text-blue-500 font-extralight ml-1">ERP</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-widest uppercase italic">
              Estimation & Project System
            </p>
          </div>
        </div>

        {/* GLOBAL NOTIF BELL */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 transition-colors"
          >
            <Bell size={16} className="text-gray-300" />
            {totalNotif > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] text-white rounded-full px-1.5 py-[1px] font-bold shadow-lg shadow-red-500/40">
                {totalNotif}
              </span>
            )}
          </button>

          {/* DROPDOWN NOTIF */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20"
              >
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-200">
                    Notification Center
                  </p>
                  <span className="text-[10px] text-gray-500">
                    Realtime
                  </span>
                </div>

                <div className="py-2 text-xs">
                  <NotifRow
                    label="Estimator – Inquiry baru"
                    count={estimator_inquiry}
                    href="/admin/estimator/to-estimate"
                  />
                  <NotifRow
                    label="Finance – Menunggu approval"
                    count={finance_approval}
                    href="/admin/finance/approval"
                  />
                  <NotifRow
                    label="Purchasing – Request baru"
                    count={purchasing_request}
                    href="/admin/purchasing/request"
                  />
                </div>

                <div className="px-4 py-2 border-t border-gray-800 text-[10px] text-gray-500">
                  Klik item untuk membuka modul terkait
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== MENU (WITH CUSTOM SCROLLBAR) ===== */}
      <nav className="flex-1 px-4 pb-4 pt-2 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) => isActive(i.href))

          return (
            <div key={group.section}>
              {/* SECTION HEADER */}
              <div
                className={`px-4 mb-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.15em]
                ${sectionActive ? "text-blue-400" : "text-gray-600"}`}
              >
                {group.section}
              </div>

              {/* ITEMS */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  // MULTI BADGE: mapping berdasarkan href
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
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group
                        ${active ? "text-white" : "hover:text-gray-200"}`}
                      >
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

                        <Icon
                          size={18}
                          className={`relative z-10 transition-transform duration-300 group-hover:scale-110 
                          ${active ? "text-blue-400" : "text-gray-500"}`}
                        />

                        <span className="relative z-10 font-medium text-[13px]">
                          {item.name}
                        </span>

                        {/* BADGE PER MENU */}
                        {hasNotification && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto relative z-10 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40"
                          >
                            {badgeCount}
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

      {/* ===== USER PROFILE CARD (ROLE-BASED) ===== */}
      <div className="p-4 mt-auto">
        <div className="bg-gray-800/40 rounded-2xl p-4 border border-gray-800 flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <UserCircle size={24} />
          </div>
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
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-4 text-center font-mono">
          v2.2.0-2026 • live
        </p>
      </div>
    </aside>
  )
}

/* ========= SMALL COMPONENT: NOTIF ROW ========= */

function NotifRow({
  label,
  count,
  href,
}: {
  label: string
  count: number
  href: string
}) {
  const has = count > 0

  return (
    <Link href={href}>
      <div
        className={`px-4 py-2 flex items-center justify-between hover:bg-gray-800/80 cursor-pointer transition-colors ${
          !has ? "opacity-60" : ""
        }`}
      >
        <span className="text-[11px] text-gray-200">{label}</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            has
              ? "bg-red-500/80 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {count}
        </span>
      </div>
    </Link>
  )
}
