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
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Upload,
  Copy,
  Printer,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Camera,
  Mic,
  Headphones,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Zap,
  Flame,
  Droplet,
  Wind,
  Tornado,
  Rainbow,
  Umbrella,
  Thermometer,
  ThermometerSun,
  Gauge,
  Compass,
  Navigation,
  Map,
  MapPin,
  Flag,
  Award,
  Medal,
  Trophy,
  Crown,
  Star,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Sad,
  Surprise,
  Eye,
  EyeOff,
  Bike,
  Car,
  Bus,
  Train,
  Plane,
  Ship,
  Rocket,
  Satellite,
  Ghost,
  Robot,
  Cat,
  Dog,
  Fish,
  Bird,
  Bug,
  Flower,
  Tree,
  Leaf,
  Mountain,
  Sunset,
  Sunrise,
  Moon as MoonIcon,
  Cloud as CloudIcon,
} from "lucide-react"
import { ERP_MENU } from "@/core/erpMenuConfig"

/* ========= TYPES ========= */

type SessionUser = {
  name: string
  email: string
  role: string
  avatar?: string
  department?: string
  lastLogin?: string
  permissions?: string[]
}

type RealtimeCounts = {
  estimator_inquiry: number
  finance_approval: number
  purchasing_request: number
  project_overdue?: number
  task_today?: number
  message_unread?: number
}

type ThemeMode = "dark" | "light" | "system"
type Language = "id" | "en"
type NotificationType = "info" | "success" | "warning" | "error"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
  action?: string
}

/* ========= CONFIG ========= */

const THEME_CONFIG = {
  dark: {
    bg: "from-[#0B1120] via-[#0f172a] to-[#111827]",
    border: "border-gray-800",
    text: "text-gray-400",
    textHover: "hover:text-gray-200",
    bgHover: "hover:bg-gray-800/50",
    active: "bg-blue-600/20 border-l-2 border-blue-500",
    card: "bg-gray-900/40 border-gray-800",
    icon: "text-gray-500",
    iconHover: "group-hover:text-blue-400",
  },
  light: {
    bg: "from-gray-50 via-white to-gray-100",
    border: "border-gray-200",
    text: "text-gray-600",
    textHover: "hover:text-gray-900",
    bgHover: "hover:bg-gray-100",
    active: "bg-blue-100 border-l-2 border-blue-500",
    card: "bg-white border-gray-200",
    icon: "text-gray-400",
    iconHover: "group-hover:text-blue-600",
  },
}

const LANGUAGE_CONFIG = {
  id: {
    search: "Cepat cari...",
    notifications: "Pusat Notifikasi",
    quickCreate: "Buat Cepat",
    system: "Sistem",
    live: "Hidup",
    tips: "Tips: Buat dulu → detail bisa dilengkapi nanti",
    logout: "Keluar",
    version: "v2.2.0-2026",
    profile: "Profil",
    settings: "Pengaturan",
    help: "Bantuan",
    theme: "Tema",
    language: "Bahasa",
    today: "Hari ini",
    yesterday: "Kemarin",
    thisWeek: "Minggu ini",
    older: "Lama",
  },
  en: {
    search: "Quick search...",
    notifications: "Notification Center",
    quickCreate: "Quick Create",
    system: "System",
    live: "Live",
    tips: "Tips: Create first → details can be added later",
    logout: "Logout",
    version: "v2.2.0-2026",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    theme: "Theme",
    language: "Language",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    older: "Older",
  },
}

/* ========= HOOK: REALTIME COUNTS (SSE + FALLBACK POLLING) ========= */

function useRealtimeListener() {
  const setCounts = useERPStore((s) => s.setCounts)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let es: EventSource | null = null

    function updateFromPayload(payload: any) {
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
        project_overdue:
          typeof payload?.project_overdue === "number"
            ? payload.project_overdue
            : undefined,
        task_today:
          typeof payload?.task_today === "number"
            ? payload.task_today
            : undefined,
        message_unread:
          typeof payload?.message_unread === "number"
            ? payload.message_unread
            : undefined,
      })
    }

    async function fetchSnapshot() {
      try {
        const res = await fetch("/api/notifications/summary")
        if (!res.ok) return
        const data = await res.json()
        updateFromPayload(data)
      } catch (err) {
        console.error("Fetch notif summary error:", err)
      }
    }

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
        es?.close()
        es = null
        fetchSnapshot()
        interval = setInterval(fetchSnapshot, 10000)
      }
    } catch (err) {
      fetchSnapshot()
      interval = setInterval(fetchSnapshot, 10000)
    }

    fetchSnapshot()

    return () => {
      if (es) es.close()
      if (interval) clearInterval(interval)
    }
  }, [setCounts])
}

/* ========= HOOK: SESSION USER ========= */

function useSessionUser(): SessionUser {
  const [user, setUser] = useState<SessionUser>({
    name: "Estimator Utama",
    email: "estimator@mpp.co.id",
    role: "ESTIMATOR",
    department: "Estimator Division",
    lastLogin: new Date().toISOString(),
    permissions: ["read", "write", "delete"],
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
          department: data.department || "General",
          avatar: data.avatar,
          lastLogin: data.lastLogin || new Date().toISOString(),
          permissions: data.permissions || ["read"],
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

/* ========= HOOK: THEME ========= */

function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme") as ThemeMode
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle("dark", saved === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return { theme, toggleTheme, mounted }
}

/* ========= HOOK: LANGUAGE ========= */

function useLanguage() {
  const [lang, setLang] = useState<Language>("id")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language
    if (saved) setLang(saved)
  }, [])

  const toggleLang = () => {
    const newLang = lang === "id" ? "en" : "id"
    setLang(newLang)
    localStorage.setItem("lang", newLang)
  }

  return { lang, toggleLang, t: LANGUAGE_CONFIG[lang] }
}

/* ========= HOOK: NOTIFICATIONS ========= */

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Mock notifications - replace with actual API
    const mock: Notification[] = [
      {
        id: "1",
        type: "info",
        title: "Inquiry Baru",
        message: "PT Maju Jaya mengirimkan inquiry baru",
        timestamp: new Date().toISOString(),
        read: false,
        link: "/admin/estimator/to-estimate",
        action: "Lihat",
      },
      {
        id: "2",
        type: "success",
        title: "RAB Selesai",
        message: "RAB #RAB-123 telah selesai dibuat",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        link: "/admin/estimator/rab/RAB-123",
        action: "Buka",
      },
      {
        id: "3",
        type: "warning",
        title: "Project Overdue",
        message: "Project Gedung X melewati deadline",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        link: "/admin/projects/PRJ-456",
        action: "Cek",
      },
      {
        id: "4",
        type: "error",
        title: "Approval Tertunda",
        message: "Finance approval menunggu 3 hari",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        link: "/admin/finance/approval",
        action: "Proses",
      },
    ]

    setNotifications(mock)
    setUnreadCount(mock.filter((n) => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notif && !notif.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }
}

/* ========= HOOK: CLICK OUTSIDE ========= */

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

/* ========= HOOK: SEARCH ========= */

function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    // Mock search - replace with actual API
    const mockResults = [
      { type: "project", label: "Gedung X", href: "/admin/projects/1" },
      { type: "inquiry", label: "INQ-123", href: "/admin/crm/inquiry/1" },
      { type: "rab", label: "RAB-456", href: "/admin/estimator/rab/1" },
      { type: "customer", label: "PT Maju Jaya", href: "/admin/crm/customers/1" },
    ].filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))

    setResults(mockResults)
  }, [query])

  return { query, setQuery, results, open, setOpen }
}

/* ========= MAIN COMPONENT ========= */

export default function AdminSidebar() {
  useRealtimeListener()
  const pathname = usePathname()
  const router = useRouter()

  // Store
  const estimator_inquiry = useERPStore((s) => s.counts.estimator_inquiry)
  const finance_approval = useERPStore((s) => s.counts.finance_approval)
  const purchasing_request = useERPStore((s) => s.counts.purchasing_request)
  const project_overdue = useERPStore((s) => s.counts.project_overdue)
  const task_today = useERPStore((s) => s.counts.task_today)
  const message_unread = useERPStore((s) => s.counts.message_unread)

  // Hooks
  const user = useSessionUser()
  const { theme, toggleTheme, mounted } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const search = useSearch()

  // UI State
  const [notifOpen, setNotifOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  // Sidebar state
  const collapsed = useERPStore((s) => s.collapsed)
  const toggle = useERPStore((s) => s.toggleSidebar)

  // Refs
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const quickBtnRef = useRef<HTMLButtonElement>(null)
  const quickPanelRef = useRef<HTMLDivElement>(null)
  const userBtnRef = useRef<HTMLButtonElement>(null)
  const userPanelRef = useRef<HTMLDivElement>(null)
  const settingsBtnRef = useRef<HTMLButtonElement>(null)
  const settingsPanelRef = useRef<HTMLDivElement>(null)
  const helpBtnRef = useRef<HTMLButtonElement>(null)
  const helpPanelRef = useRef<HTMLDivElement>(null)
  const statusBtnRef = useRef<HTMLButtonElement>(null)
  const statusPanelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Click outside handlers
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
    [userBtnRef, userPanelRef],
    () => setUserMenuOpen(false),
    userMenuOpen
  )
  useClickOutside(
    [settingsBtnRef, settingsPanelRef],
    () => setSettingsOpen(false),
    settingsOpen
  )
  useClickOutside(
    [helpBtnRef, helpPanelRef],
    () => setHelpOpen(false),
    helpOpen
  )
  useClickOutside(
    [statusBtnRef, statusPanelRef],
    () => setStatusOpen(false),
    statusOpen
  )
  useClickOutside([searchRef], () => search.setOpen(false), search.open)

  // Active menu
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  // Logout
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    }
    window.location.href = "/login"
  }

  // Totals
  const totalNotif =
    estimator_inquiry + finance_approval + purchasing_request + (project_overdue || 0)

  const sidebarWidth = collapsed ? "w-[80px]" : "w-[320px]"
  const padX = collapsed ? "px-3" : "px-6"

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        label: t.quickCreate === "Buat Cepat" ? "New Inquiry" : "Buat Inquiry",
        desc: "Buat lead masuk",
        href: "/admin/crm/inquiry/new",
        icon: Plus,
        color: "blue",
      },
      {
        label: t.quickCreate === "Buat Cepat" ? "New RAB" : "Buat RAB",
        desc: "Mulai estimator",
        href: "/admin/estimator/rab/new",
        icon: FileText,
        color: "green",
      },
      {
        label: t.quickCreate === "Buat Cepat" ? "New Project" : "Buat Project",
        desc: "Create proyek",
        href: "/admin/projects/new",
        icon: LayoutDashboard,
        color: "purple",
      },
      {
        label: t.quickCreate === "Buat Cepat" ? "New PO" : "Buat PO",
        desc: "Purchase Order",
        href: "/admin/purchasing/po/new",
        icon: ShoppingCart,
        color: "orange",
      },
      {
        label: t.quickCreate === "Buat Cepat" ? "New Customer" : "Buat Customer",
        desc: "Tambah data customer",
        href: "/admin/crm/customers/new",
        icon: Users,
        color: "red",
      },
      {
        label: t.quickCreate === "Buat Cepat" ? "New Task" : "Buat Task",
        desc: "Buat tugas baru",
        href: "/admin/tasks/new",
        icon: CheckSquare,
        color: "cyan",
      },
    ],
    [t]
  )

  // Theme
  if (!mounted) return null
  const themeConfig = THEME_CONFIG[theme]

  return (
    <aside
      className={`${sidebarWidth} overflow-visible hidden md:flex flex-col h-screen fixed top-0 left-0 z-50
      bg-gradient-to-b ${themeConfig.bg}
      backdrop-blur-xl
      ${themeConfig.text} ${themeConfig.border} border-r
      shadow-2xl shadow-black/40 transition-[width] duration-300 ease-in-out`}
    >
      {/* ===== TOP AREA ===== */}
      <div className={`${padX} pt-6 pb-4 flex items-center justify-between`}>
        {/* LOGO */}
        <div className="flex items-center gap-2 min-w-0">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-500/30 shrink-0 cursor-pointer"
            onClick={() => router.push("/admin/dashboard")}
          >
            M
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0"
            >
              <p className="text-lg font-bold text-white tracking-tight truncate flex items-center gap-1">
                MPP
                <span className="text-blue-400 font-extralight text-sm ml-0.5">
                  ERP
                </span>
                {project_overdue && project_overdue > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[8px] font-bold">
                    {project_overdue} overdue
                  </span>
                )}
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5 font-medium tracking-widest uppercase italic truncate">
                Estimation & Project System
              </p>
            </motion.div>
          )}
        </div>

        {/* RIGHT TOP ICONS */}
        <div className="flex items-center gap-1.5">
          {/* Search Button */}
          <button
            type="button"
            onClick={() => search.setOpen(true)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors relative group"
            title="Search (Ctrl+K)"
          >
            <Search size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            {!collapsed && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-[9px] px-1.5 py-0.5 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Ctrl+K
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors group"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-400 group-hover:rotate-90 transition-transform" />
            ) : (
              <Moon size={16} className="text-gray-300 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors group"
            title={lang === "id" ? "Switch to English" : "Ganti ke Indonesia"}
          >
            <Globe size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            <span className="absolute text-[8px] font-bold text-gray-400 mt-3">
              {lang.toUpperCase()}
            </span>
          </button>

          {/* Collapse toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-colors group"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            ) : (
              <ChevronLeft size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            )}
          </motion.button>

          {/* Global notif bell */}
          <div className="relative">
            <motion.button
              ref={notifBtnRef}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v)
                setQuickOpen(false)
                setUserMenuOpen(false)
                setSettingsOpen(false)
                setHelpOpen(false)
                setStatusOpen(false)
              }}
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-700 bg-gray-900/60 hover:bg-gray-800 transition-colors group"
              title={t.notifications}
            >
              <Bell size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
              {totalNotif + unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-[9px] text-white rounded-full px-1.5 py-[1px] font-bold shadow-lg shadow-red-500/40"
                >
                  {totalNotif + unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  ref={notifPanelRef}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50"
                >
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                        <Bell size={14} className="text-blue-400" />
                        {t.notifications}
                      </p>
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        {totalNotif + unreadCount} unread • Realtime
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="px-2 py-1 text-[9px] bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto py-2">
                    {/* System Notifications */}
                    <div className="px-4 py-2">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
                        System
                      </p>
                      <SystemNotifRow
                        icon={AlertCircle}
                        label="Inquiry baru"
                        count={estimator_inquiry}
                        href="/admin/estimator/to-estimate"
                        color="blue"
                        onClick={() => setNotifOpen(false)}
                      />
                      <SystemNotifRow
                        icon={CheckCircle}
                        label="Finance approval"
                        count={finance_approval}
                        href="/admin/finance/approval"
                        color="green"
                        onClick={() => setNotifOpen(false)}
                      />
                      <SystemNotifRow
                        icon={ShoppingCart}
                        label="Purchasing request"
                        count={purchasing_request}
                        href="/admin/purchasing/request"
                        color="orange"
                        onClick={() => setNotifOpen(false)}
                      />
                      <SystemNotifRow
                        icon={Clock}
                        label="Project overdue"
                        count={project_overdue || 0}
                        href="/admin/projects?status=overdue"
                        color="red"
                        onClick={() => setNotifOpen(false)}
                      />
                      <SystemNotifRow
                        icon={CheckSquare}
                        label="Task hari ini"
                        count={task_today || 0}
                        href="/admin/tasks/today"
                        color="purple"
                        onClick={() => setNotifOpen(false)}
                      />
                      <SystemNotifRow
                        icon={MessageSquare}
                        label="Pesan belum dibaca"
                        count={message_unread || 0}
                        href="/admin/messages"
                        color="yellow"
                        onClick={() => setNotifOpen(false)}
                      />
                    </div>

                    {/* User Notifications */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-800">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">
                          Personal
                        </p>
                        {notifications.map((notif) => (
                          <UserNotifRow
                            key={notif.id}
                            notification={notif}
                            onMarkRead={markAsRead}
                            onDelete={deleteNotification}
                            onClick={() => setNotifOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-[9px] text-gray-500">
                    <span>🔔 Klik untuk membuka</span>
                    <span>ESC to close</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===== SEARCH BAR (when expanded) ===== */}
      {!collapsed && (
        <div className={`${padX} pb-4`} ref={searchRef}>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={t.search}
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              onFocus={() => search.setOpen(true)}
              className="w-full pl-9 pr-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />

            <AnimatePresence>
              {search.open && search.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40 overflow-hidden"
                >
                  {search.results.map((r, i) => (
                    <Link
                      key={i}
                      href={r.href}
                      onClick={() => {
                        search.setOpen(false)
                        search.setQuery("")
                      }}
                    >
                      <div className="px-4 py-3 hover:bg-gray-800/80 transition-colors flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center">
                          {r.type === "project" && <LayoutDashboard size={12} className="text-blue-400" />}
                          {r.type === "inquiry" && <FileText size={12} className="text-green-400" />}
                          {r.type === "rab" && <DollarSign size={12} className="text-yellow-400" />}
                          {r.type === "customer" && <Users size={12} className="text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-xs text-gray-200">{r.label}</p>
                          <p className="text-[9px] text-gray-500 capitalize">{r.type}</p>
                        </div>
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
        <div className="relative">
          <motion.button
            ref={quickBtnRef}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              setQuickOpen((v) => !v)
              setNotifOpen(false)
              setUserMenuOpen(false)
              setSettingsOpen(false)
              setHelpOpen(false)
              setStatusOpen(false)
            }}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-800
            bg-gradient-to-r from-blue-600/20 to-transparent hover:from-blue-600/30 transition-all
            ${collapsed ? "py-2.5" : "py-3"}`}
            title={t.quickCreate}
          >
            <Plus size={16} className="text-blue-400" />
            {!collapsed && (
              <span className="text-[12px] font-semibold text-gray-100">
                {t.quickCreate}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {quickOpen && (
              <motion.div
                ref={quickPanelRef}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-40"
              >
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    {t.quickCreate}
                  </p>
                  <span className="text-[9px] text-gray-500">Fast entry</span>
                </div>

                <div className="p-2 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1">
                    {quickActions.map((a) => {
                      const Icon = a.icon
                      const colors = {
                        blue: "text-blue-400 bg-blue-500/10",
                        green: "text-green-400 bg-green-500/10",
                        purple: "text-purple-400 bg-purple-500/10",
                        orange: "text-orange-400 bg-orange-500/10",
                        red: "text-red-400 bg-red-500/10",
                        cyan: "text-cyan-400 bg-cyan-500/10",
                      }
                      return (
                        <Link
                          key={a.href}
                          href={a.href}
                          onClick={() => setQuickOpen(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-3 rounded-lg hover:bg-gray-800/80 transition-colors cursor-pointer"
                          >
                            <div className={`w-8 h-8 rounded-lg ${colors[a.color as keyof typeof colors]} flex items-center justify-center mb-2`}>
                              <Icon size={14} />
                            </div>
                            <p className="text-[11px] font-semibold text-gray-200">{a.label}</p>
                            <p className="text-[8px] text-gray-500 mt-0.5">{a.desc}</p>
                          </motion.div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                <div className="px-4 py-2 border-t border-gray-800 text-[8px] text-gray-500">
                  {t.tips}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== MINI WIDGET (SYSTEM STATUS) ===== */}
      <div className={`${collapsed ? "px-3" : "px-4"} pb-4`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`${themeConfig.card} border rounded-2xl p-3 cursor-pointer`}
          onClick={() => setStatusOpen(!statusOpen)}
          ref={statusBtnRef}
        >
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <Activity size={10} className="text-green-400" />
              {t.system}
            </p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-green-400 shadow shadow-green-500/40"
            />
          </div>

          {!collapsed ? (
            <>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <MiniStat
                  label="Inquiry"
                  value={estimator_inquiry}
                  icon={FileText}
                  color="blue"
                />
                <MiniStat
                  label="Approval"
                  value={finance_approval}
                  icon={CheckCircle}
                  color="green"
                />
                <MiniStat
                  label="Request"
                  value={purchasing_request}
                  icon={ShoppingCart}
                  color="orange"
                />
              </div>

              <AnimatePresence>
                {statusOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500">CPU Usage</span>
                      <span className="text-green-400 font-mono">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "45%" }}
                        className="bg-blue-500 h-1 rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500">Memory</span>
                      <span className="text-yellow-400 font-mono">2.1/4GB</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "52%" }}
                        className="bg-yellow-500 h-1 rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-gray-500">Storage</span>
                      <span className="text-purple-400 font-mono">128/256GB</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "50%" }}
                        className="bg-purple-500 h-1 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            </div>
          )}
        </motion.div>
      </div>

      {/* ===== MENU ===== */}
      <nav className="flex-1 px-3 pb-4 pt-2 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
        {ERP_MENU.map((group) => {
          const sectionActive = group.items.some((i) => isActive(i.href))

          return (
            <div key={group.section}>
              {/* SECTION HEADER */}
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`px-4 mb-3 flex items-center gap-2 text-[9px] uppercase font-bold tracking-[0.15em]
                  ${sectionActive ? "text-blue-400" : "text-gray-600"}`}
                >
                  {group.section}
                </motion.div>
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
                      : item.href === "/admin/projects"
                      ? project_overdue
                      : item.href === "/admin/tasks"
                      ? task_today
                      : item.href === "/admin/messages"
                      ? message_unread
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
                      theme={theme}
                    >
                      <Icon
                        size={18}
                        className={`transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
                        ${active ? "text-blue-400" : themeConfig.icon}`}
                      />
                      {hasNotification && collapsed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow shadow-red-500/40"
                        />
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
      <div className={`${collapsed ? "p-3" : "p-4"} mt-auto relative`}>
        <motion.div
          ref={userBtnRef}
          whileHover={{ scale: 1.02 }}
          className={`${themeConfig.card} rounded-2xl border flex items-center gap-3 group cursor-pointer relative
          ${collapsed ? "p-3 justify-center" : "p-4"}`}
          onClick={() => {
            setUserMenuOpen(!userMenuOpen)
            setNotifOpen(false)
            setQuickOpen(false)
            setSettingsOpen(false)
            setHelpOpen(false)
            setStatusOpen(false)
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30 shrink-0 relative"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserCircle size={24} />
            )}
            {message_unread && message_unread > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900" />
            )}
          </motion.div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-xs font-bold text-gray-200 truncate flex items-center gap-1">
                {user.name}
                {user.role === "ADMIN" && (
                  <Crown size={10} className="text-yellow-400" />
                )}
              </p>
              <p className="text-[8px] text-blue-400 font-semibold uppercase tracking-wide">
                {user.role}
              </p>
              <p className="text-[8px] text-gray-500 truncate italic flex items-center gap-1">
                <Mail size={8} />
                {user.email}
              </p>
            </motion.div>
          )}

          {!collapsed && (
            <ChevronRight
              size={14}
              className={`text-gray-500 transition-transform duration-300 ${
                userMenuOpen ? "rotate-90" : ""
              }`}
            />
          )}
        </motion.div>

        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              ref={userPanelRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`absolute bottom-full left-4 right-4 mb-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40 overflow-hidden ${
                collapsed ? "left-3 right-3" : ""
              }`}
            >
              <div className="p-2">
                <MenuItem
                  icon={UserCircle}
                  label={t.profile}
                  href="/admin/profile"
                  onClick={() => setUserMenuOpen(false)}
                />
                <MenuItem
                  icon={Settings}
                  label={t.settings}
                  onClick={() => {
                    setUserMenuOpen(false)
                    setSettingsOpen(true)
                  }}
                />
                <MenuItem
                  icon={HelpCircle}
                  label={t.help}
                  onClick={() => {
                    setUserMenuOpen(false)
                    setHelpOpen(true)
                  }}
                />
                <MenuItem
                  icon={Moon}
                  label={theme === "dark" ? "Light Mode" : "Dark Mode"}
                  onClick={toggleTheme}
                />
                <MenuItem
                  icon={Globe}
                  label={lang === "id" ? "English" : "Indonesia"}
                  onClick={toggleLang}
                />
                <div className="border-t border-gray-800 my-1" />
                <MenuItem
                  icon={LogOut}
                  label={t.logout}
                  onClick={handleLogout}
                  danger
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              ref={settingsPanelRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`absolute bottom-full left-4 right-4 mb-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40 overflow-hidden ${
                collapsed ? "left-3 right-3" : ""
              }`}
            >
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Settings size={14} className="text-blue-400" />
                  {t.settings}
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] text-gray-500 mb-2">Theme</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (theme !== "dark") toggleTheme()
                        }}
                        className={`px-3 py-2 rounded-lg text-[10px] font-medium transition ${
                          theme === "dark"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => {
                          if (theme !== "light") toggleTheme()
                        }}
                        className={`px-3 py-2 rounded-lg text-[10px] font-medium transition ${
                          theme === "light"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] text-gray-500 mb-2">Language</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (lang !== "id") toggleLang()
                        }}
                        className={`px-3 py-2 rounded-lg text-[10px] font-medium transition ${
                          lang === "id"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        Indonesia
                      </button>
                      <button
                        onClick={() => {
                          if (lang !== "en") toggleLang()
                        }}
                        className={`px-3 py-2 rounded-lg text-[10px] font-medium transition ${
                          lang === "en"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[9px] text-gray-500 mb-2">Notifications</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        Email notifications
                      </label>
                      <label className="flex items-center gap-2 text-[10px] text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        Desktop notifications
                      </label>
                      <label className="flex items-center gap-2 text-[10px] text-gray-300">
                        <input type="checkbox" className="rounded" defaultChecked />
                        Sound alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Panel */}
        <AnimatePresence>
          {helpOpen && (
            <motion.div
              ref={helpPanelRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`absolute bottom-full left-4 right-4 mb-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-40 overflow-hidden ${
                collapsed ? "left-3 right-3" : ""
              }`}
            >
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <HelpCircle size={14} className="text-blue-400" />
                  {t.help}
                </p>

                <div className="space-y-2">
                  <HelpItem icon={FileText} label="User Guide" />
                  <HelpItem icon={Video} label="Video Tutorials" />
                  <HelpItem icon={MessageSquare} label="FAQs" />
                  <HelpItem icon={Mail} label="Contact Support" />
                  <HelpItem icon={Phone} label="Call Center" />
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800">
                  <p className="text-[8px] text-gray-500 text-center">
                    {t.version} • Need help? support@mpp.co.id
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <p className="text-[8px] text-gray-600 mt-4 text-center font-mono">
            {t.version} • {t.live}
          </p>
        )}
      </div>
    </aside>
  )
}

/* ========= COMPONENTS ========= */

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    orange: "text-orange-400 bg-orange-500/10",
    red: "text-red-400 bg-red-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${colors[color as keyof typeof colors]} rounded-xl px-2 py-2 text-center`}
    >
      <Icon size={10} className="mx-auto mb-1" />
      <p className="text-[8px] text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-[10px] font-bold text-gray-100 mt-0.5">{value}</p>
    </motion.div>
  )
}

function SidebarItem({
  href,
  label,
  active,
  collapsed,
  badgeCount,
  theme,
  children,
}: {
  href: string
  label: string
  active: boolean
  collapsed: boolean
  badgeCount?: number
  theme: string
  children: React.ReactNode
}) {
  const themeConfig = THEME_CONFIG[theme as keyof typeof THEME_CONFIG]

  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 rounded-xl transition-all duration-300 group
        ${collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5"}
        ${active ? "text-white" : themeConfig.textHover}`}
      >
        {/* active background */}
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent rounded-xl border-l-2 border-blue-500"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* hover background */}
        <motion.div
          className="absolute inset-0 bg-gray-800/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ zIndex: -1 }}
        />

        <div className="relative z-10">{children}</div>

        {!collapsed && (
          <span className="relative z-10 font-medium text-[12px] flex-1">
            {label}
          </span>
        )}

        {!collapsed && (badgeCount ?? 0) > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative z-10 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-red-600 text-[9px] font-bold text-white shadow-lg shadow-red-500/40"
          >
            {badgeCount}
          </motion.span>
        )}

        {/* tooltip when collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
            <div className="bg-gray-900 border border-gray-700 text-[10px] text-gray-100 px-2 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-2">
              {label}
              {(badgeCount ?? 0) > 0 && (
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-bold">
                  {badgeCount}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

function SystemNotifRow({
  icon: Icon,
  label,
  count,
  href,
  color,
  onClick,
}: {
  icon: any
  label: string
  count: number
  href: string
  color: string
  onClick?: () => void
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    orange: "bg-orange-500/10 text-orange-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  }

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 2 }}
        className="px-2 py-1.5 flex items-center justify-between hover:bg-gray-800/80 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${colors[color as keyof typeof colors]} flex items-center justify-center`}>
            <Icon size={12} />
          </div>
          <span className="text-[10px] text-gray-300">{label}</span>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
          count > 0
            ? "bg-red-500/80 text-white"
            : "bg-gray-800 text-gray-500"
        }`}>
          {count}
        </span>
      </motion.div>
    </Link>
  )
}

function UserNotifRow({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  onClick?: () => void
}) {
  const colors = {
    info: "bg-blue-500/10 text-blue-400",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    error: "bg-red-500/10 text-red-400",
  }

  const icons = {
    info: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  }

  const Icon = icons[notification.type]
  const timeAgo = getTimeAgo(notification.timestamp)

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`px-2 py-2 rounded-lg mb-1 transition-colors relative group
        ${notification.read ? "opacity-60" : "bg-gray-800/30"}`}
    >
      <Link href={notification.link || "#"} onClick={onClick}>
        <div className="flex gap-2">
          <div className={`w-7 h-7 rounded-lg ${colors[notification.type]} flex items-center justify-center flex-shrink-0`}>
            <Icon size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-200">{notification.title}</p>
            <p className="text-[8px] text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
            <p className="text-[7px] text-gray-500 mt-1">{timeAgo}</p>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onMarkRead(notification.id)
            }}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
            title="Mark as read"
          >
            <CheckCircle size={10} className="text-green-400" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            onDelete(notification.id)
          }}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          title="Delete"
        >
          <X size={10} className="text-gray-400" />
        </button>
      </div>
    </motion.div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  danger,
}: {
  icon: any
  label: string
  href?: string
  onClick?: () => void
  danger?: boolean
}) {
  const content = (
    <div className={`px-3 py-2 rounded-lg flex items-center gap-2 text-[11px] transition-colors
      ${danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-gray-800"}`}>
      <Icon size={14} />
      {label}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <button onClick={onClick} className="w-full">{content}</button>
}

function HelpItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/80 transition-colors cursor-pointer">
      <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center">
        <Icon size={12} className="text-gray-400" />
      </div>
      <span className="text-[10px] text-gray-300">{label}</span>
    </div>
  )
}

function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Baru saja"
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`
  return past.toLocaleDateString("id-ID")
}
