"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useERPStore } from "@/store/erpStore"
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
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Zap,
  Crown,
  Mail,
  FileText,
  ShoppingCart,
  CheckSquare,
  Users,
  DollarSign,
  X,
} from "lucide-react"
import { ERP_MENU } from "@/core/erpMenuConfig"

/* ========= TYPES ========= */
type SessionUser = {
  name: string
  email: string
  role: string
  avatar?: string
}

type RealtimeCounts = {
  estimator_inquiry: number
  finance_approval: number
  purchasing_request: number
  project_overdue?: number
  task_today?: number
  message_unread?: number
}

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
}

/* ========= CONFIG ========= */
const THEME_CONFIG = {
  dark: "bg-gradient-to-b from-[#0B1120] via-[#0f172a] to-[#111827] border-gray-800 text-gray-400",
  light: "bg-gradient-to-b from-gray-50 via-white to-gray-100 border-gray-200 text-gray-600",
}

const LANG = {
  id: {
    search: "Cari...",
    notifications: "Notifikasi",
    quickCreate: "Buat Cepat",
    system: "Sistem",
    logout: "Keluar",
    version: "v2.2.0",
    profile: "Profil",
    settings: "Pengaturan",
    help: "Bantuan",
  },
  en: {
    search: "Search...",
    notifications: "Notifications",
    quickCreate: "Quick Create",
    system: "System",
    logout: "Logout",
    version: "v2.2.0",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
  },
}

/* ========= HOOKS ========= */
function useRealtime() {
  const setCounts = useERPStore((s) => s.setCounts)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/notifications/summary")
        const data = await res.json()
        setCounts(data)
      } catch (err) {
        console.error("Failed to fetch counts", err)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [setCounts])
}

function useUser(): SessionUser {
  const [user, setUser] = useState<SessionUser>({
    name: "Estimator Utama",
    email: "estimator@mpp.co.id",
    role: "ESTIMATOR",
  })
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => setUser({
        name: data.name || "User",
        email: data.email || "user@mpp.co.id",
        role: (data.role || "STAFF").toUpperCase(),
        avatar: data.avatar,
      }))
      .catch(console.error)
  }, [])
  return user
}

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme") as "dark" | "light"
    if (saved) setTheme(saved)
  }, [])
  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }
  return { theme, toggle, mounted }
}

function useLang() {
  const [lang, setLang] = useState<"id" | "en">("id")
  useEffect(() => {
    const saved = localStorage.getItem("lang") as "id" | "en"
    if (saved) setLang(saved)
  }, [])
  const toggle = () => {
    const newLang = lang === "id" ? "en" : "id"
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }
  return { lang, toggle, t: LANG[lang] }
}

function useNotifications() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  useEffect(() => {
    // Mock data - ganti dengan API call
    setNotifs([
      { id: "1", type: "info", title: "Inquiry Baru", message: "PT Maju Jaya", timestamp: new Date().toISOString(), read: false, link: "/admin/estimator/to-estimate" },
      { id: "2", type: "success", title: "RAB Selesai", message: "RAB-123", timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: "3", type: "warning", title: "Project Overdue", message: "Gedung X", timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
    ])
    setUnread(2)
  }, [])
  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }
  const deleteNotif = (id: string) => {
    const notif = notifs.find(n => n.id === id)
    setNotifs(prev => prev.filter(n => n.id !== id))
    if (notif && !notif.read) setUnread(prev => Math.max(0, prev - 1))
  }
  return { notifs, unread, markRead, deleteNotif }
}

function useClickOutside(refs: React.RefObject<HTMLElement>[], onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: MouseEvent) => {
      if (!refs.some(r => r.current?.contains(e.target as Node))) onOutside()
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOutside()
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", onKey)
    }
  }, [refs, onOutside, enabled])
}

function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    // Mock search
    setResults([
      { type: "project", label: "Gedung X", href: "/admin/projects/1" },
      { type: "inquiry", label: "INQ-123", href: "/admin/crm/inquiry/1" },
      { type: "rab", label: "RAB-456", href: "/admin/estimator/rab/1" },
    ].filter(r => r.label.toLowerCase().includes(query.toLowerCase())))
  }, [query])
  return { query, setQuery, results, open, setOpen }
}

/* ========= MAIN COMPONENT ========= */
export default function AdminSidebar() {
  useRealtime()
  const pathname = usePathname()
  const router = useRouter()
  
  // Store
  const counts = useERPStore((s) => s.counts)
  const collapsed = useERPStore((s) => s.collapsed)
  const toggle = useERPStore((s) => s.toggleSidebar)

  // Hooks
  const user = useUser()
  const { theme, toggle: toggleTheme, mounted } = useTheme()
  const { lang, toggle: toggleLang, t } = useLang()
  const { notifs, unread, markRead, deleteNotif } = useNotifications()
  const search = useSearch()

  // UI State
  const [notifOpen, setNotifOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  // Refs
  const notifRef = useRef<HTMLDivElement>(null)
  const quickRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useClickOutside([notifRef], () => setNotifOpen(false), notifOpen)
  useClickOutside([quickRef], () => setQuickOpen(false), quickOpen)
  useClickOutside([userRef], () => setUserOpen(false), userOpen)
  useClickOutside([searchRef], () => search.setOpen(false), search.open)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")
  
  const totalNotif = (counts.estimator_inquiry || 0) + (counts.finance_approval || 0) + 
                     (counts.purchasing_request || 0) + (counts.project_overdue || 0) + unread

  const quickActions = [
    { label: "Inquiry", href: "/admin/crm/inquiry/new", icon: FileText, color: "blue" },
    { label: "RAB", href: "/admin/estimator/rab/new", icon: DollarSign, color: "green" },
    { label: "Project", href: "/admin/projects/new", icon: LayoutDashboard, color: "purple" },
    { label: "Customer", href: "/admin/crm/customers/new", icon: Users, color: "red" },
  ]

  if (!mounted) return null

  return (
    <aside className={`${collapsed ? "w-[80px]" : "w-[280px]"} hidden md:flex flex-col h-screen fixed top-0 left-0 z-50
      ${THEME_CONFIG[theme]} border-r backdrop-blur-xl transition-all duration-300`}>
      
      {/* ===== TOP ===== */}
      <div className={`${collapsed ? "px-3" : "px-6"} pt-6 pb-4 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white cursor-pointer"
            onClick={() => router.push("/admin/dashboard")}
          >
            M
          </motion.div>
          {!collapsed && (
            <div>
              <p className="text-lg font-bold text-white">MPP ERP</p>
              <p className="text-[8px] text-gray-500">Estimation System</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Search */}
          <button onClick={() => search.setOpen(true)} className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center">
            <Search size={16} />
          </button>

          {/* Theme */}
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center">
            {theme === "dark" ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
          </button>

          {/* Lang */}
          <button onClick={toggleLang} className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center text-xs font-bold">
            {lang.toUpperCase()}
          </button>

          {/* Collapse */}
          <button onClick={toggle} className="w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Notif */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-lg hover:bg-gray-800/50 flex items-center justify-center"
            >
              <Bell size={16} />
              {totalNotif > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] text-white rounded-full px-1 min-w-[14px] h-3.5 flex items-center justify-center">
                  {totalNotif > 9 ? '9+' : totalNotif}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50"
                >
                  <div className="p-3 border-b border-gray-800 flex justify-between">
                    <p className="text-xs font-semibold">{t.notifications}</p>
                    <p className="text-[8px] text-gray-500">{totalNotif} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* System Notifs */}
                    <div className="p-2">
                      <p className="text-[8px] text-gray-500 px-2 mb-1">System</p>
                      {Object.entries(counts).map(([key, val]) => val > 0 && (
                        <SystemNotif key={key} label={key} count={val} />
                      ))}
                    </div>
                    {/* User Notifs */}
                    {notifs.length > 0 && (
                      <div className="p-2 border-t border-gray-800">
                        <p className="text-[8px] text-gray-500 px-2 mb-1">Personal</p>
                        {notifs.map(n => (
                          <UserNotif
                            key={n.id}
                            notif={n}
                            onRead={() => markRead(n.id)}
                            onDelete={() => deleteNotif(n.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===== SEARCH ===== */}
      {!collapsed && (
        <div className="px-4 pb-4" ref={searchRef}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder={t.search}
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onFocus={() => search.setOpen(true)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900/50 border border-gray-800 rounded-lg text-xs"
            />
            <AnimatePresence>
              {search.open && search.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-800 rounded-lg z-50"
                >
                  {search.results.map((r, i) => (
                    <Link key={i} href={r.href} onClick={() => search.setOpen(false)}>
                      <div className="px-3 py-2 hover:bg-gray-800 text-xs flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
                          {r.type === "project" && <LayoutDashboard size={10} className="text-blue-400" />}
                          {r.type === "inquiry" && <FileText size={10} className="text-green-400" />}
                          {r.type === "rab" && <DollarSign size={10} className="text-yellow-400" />}
                        </div>
                        {r.label}
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ===== QUICK ACTION ===== */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-4`}>
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setQuickOpen(!quickOpen)}
            className={`w-full flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-blue-600/10 hover:bg-blue-600/20 transition
              ${collapsed ? "py-2" : "py-2.5"}`}
          >
            <Plus size={16} className="text-blue-400" />
            {!collapsed && <span className="text-xs font-medium">{t.quickCreate}</span>}
          </button>

          <AnimatePresence>
            {quickOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40"
              >
                <div className="p-2">
                  {quickActions.map(a => (
                    <Link key={a.href} href={a.href} onClick={() => setQuickOpen(false)}>
                      <div className="px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg bg-${a.color}-500/10 flex items-center justify-center`}>
                          <a.icon size={14} className={`text-${a.color}-400`} />
                        </div>
                        <div>
                          <p className="text-xs font-medium">{a.label}</p>
                          <p className="text-[8px] text-gray-500">Create new</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== SYSTEM STATUS ===== */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-4`}>
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider">{t.system}</p>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="mt-2 grid grid-cols-3 gap-1">
              <Stat label="Inq" value={counts.estimator_inquiry || 0} />
              <Stat label="Fin" value={counts.finance_approval || 0} />
              <Stat label="Pur" value={counts.purchasing_request || 0} />
            </div>
          )}
        </div>
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {ERP_MENU.map((group) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <p className="px-3 mb-2 text-[8px] uppercase tracking-wider text-gray-600 font-bold">
                {group.section}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const badge = item.href.includes("estimator") ? counts.estimator_inquiry :
                           item.href.includes("finance") ? counts.finance_approval :
                           item.href.includes("purchasing") ? counts.purchasing_request :
                           item.href.includes("projects") ? counts.project_overdue : 0

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${active ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500" : "hover:bg-gray-800/50"}`}>
                    <Icon size={18} />
                    {!collapsed && (
                      <>
                        <span className="text-xs flex-1">{item.name}</span>
                        {badge > 0 && (
                          <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ===== USER ===== */}
      <div className={`${collapsed ? "p-3" : "p-4"} relative`} ref={userRef}>
        <div
          onClick={() => setUserOpen(!userOpen)}
          className={`flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl p-3 cursor-pointer hover:bg-gray-800/50 transition
            ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : <UserCircle size={20} />}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate flex items-center gap-1">
                  {user.name}
                  {user.role === "ADMIN" && <Crown size={10} className="text-yellow-400" />}
                </p>
                <p className="text-[8px] text-gray-500 truncate">{user.email}</p>
              </div>
              <ChevronRight size={12} className={`transition-transform ${userOpen ? "rotate-90" : ""}`} />
            </>
          )}
        </div>

        <AnimatePresence>
          {userOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40"
            >
              <div className="p-1">
                <MenuItem icon={UserCircle} label={t.profile} href="/admin/profile" />
                <MenuItem icon={Settings} label={t.settings} href="/admin/settings" />
                <MenuItem icon={HelpCircle} label={t.help} href="/admin/help" />
                <MenuItem icon={LogOut} label={t.logout} onClick={() => router.push("/logout")} danger />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <p className="text-[6px] text-gray-600 text-center mt-4">{t.version} • live</p>
        )}
      </div>
    </aside>
  )
}

/* ========= SMALL COMPONENTS ========= */
const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center bg-gray-800/50 rounded-lg py-1">
    <p className="text-[8px] text-gray-500">{label}</p>
    <p className="text-[10px] font-bold">{value}</p>
  </div>
)

const SystemNotif = ({ label, count }: { label: string; count: number }) => (
  <div className="px-3 py-1.5 flex items-center justify-between text-xs">
    <span className="text-gray-300">{label.replace('_', ' ')}</span>
    <span className="bg-red-500/80 text-white text-[8px] px-1.5 py-0.5 rounded-full">{count}</span>
  </div>
)

const UserNotif = ({ notif, onRead, onDelete }: { notif: Notification; onRead: () => void; onDelete: () => void }) => {
  const colors = {
    info: "bg-blue-500/10 text-blue-400",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    error: "bg-red-500/10 text-red-400",
  }
  const icons = { info: AlertCircle, success: CheckCircle, warning: AlertCircle, error: XCircle }
  const Icon = icons[notif.type]

  return (
    <div className="px-3 py-2 rounded-lg hover:bg-gray-800/80 transition relative group">
      <div className="flex gap-2">
        <div className={`w-6 h-6 rounded-lg ${colors[notif.type]} flex items-center justify-center`}>
          <Icon size={12} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium">{notif.title}</p>
          <p className="text-[8px] text-gray-400">{notif.message}</p>
        </div>
      </div>
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
        {!notif.read && (
          <button onClick={onRead} className="p-0.5 hover:bg-gray-700 rounded">
            <CheckCircle size={8} className="text-green-400" />
          </button>
        )}
        <button onClick={onDelete} className="p-0.5 hover:bg-gray-700 rounded">
          <X size={8} className="text-gray-400" />
        </button>
      </div>
    </div>
  )
}

const MenuItem = ({ icon: Icon, label, href, onClick, danger }: any) => {
  const content = (
    <div className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs transition-colors
      ${danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-gray-800"}`}>
      <Icon size={14} />
      {label}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : <button onClick={onClick} className="w-full">{content}</button>
}
