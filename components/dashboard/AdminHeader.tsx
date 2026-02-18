"use client"

import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  Globe,
  Crown,
  FileText,
  Users,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Zap,
  Menu,
  X,
  Maximize2,
  Minimize2,
  Activity,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

// ================= TYPES =================

type UserProfile = {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  initials: string
  department?: string
  position?: string
  lastLogin?: string
  permissions?: string[]
  notifications?: {
    email: boolean
    push: boolean
    sound: boolean
  }
  preferences?: {
    theme: "light" | "dark" | "system"
    language: "id" | "en"
    timezone: string
    dateFormat: string
  }
}

type Notification = {
  id: string
  type: "info" | "success" | "warning" | "error" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  link?: string
  action?: string
  icon?: any
  priority?: "low" | "medium" | "high"
  category?: string
}

type SearchResult = {
  id: string
  type: "project" | "inquiry" | "rab" | "customer" | "task" | "document" | "message" | "user"
  label: string
  description?: string
  href: string
  icon?: any
  tags?: string[]
  date?: string
  status?: string
}

type QuickAction = {
  label: string
  description: string
  href: string
  icon: any
  color: string
  shortcut?: string
  category?: string
}

type SystemStatus = {
  cpu: number
  memory: { used: number; total: number }
  storage: { used: number; total: number }
  uptime: string
  version: string
  environment: "production" | "staging" | "development"
  services: {
    database: boolean
    api: boolean
    storage: boolean
    realtime: boolean
  }
}

// ================= CONFIG =================

const THEMES = {
  light: {
    bg: "bg-white/90",
    border: "border-gray-200",
    text: "text-gray-900",
    textMuted: "text-gray-500",
    textHover: "hover:text-gray-700",
    bgHover: "hover:bg-gray-100",
    card: "bg-white",
    shadow: "shadow-lg shadow-gray-200/50",
    icon: "text-gray-400",
    iconHover: "group-hover:text-blue-500",
    input: "bg-gray-100",
    inputFocus: "focus:bg-white focus:ring-blue-500/20",
    dropdown: "bg-white border-gray-200",
    dropdownHover: "hover:bg-gray-50",
    active: "bg-blue-50 text-blue-600",
    brand: "text-yellow-600",
    brandBg: "bg-yellow-500",
    brandGradient: "from-yellow-400 to-yellow-600",
  },
  dark: {
    bg: "bg-gray-900/90 backdrop-blur-md",
    border: "border-gray-800",
    text: "text-gray-100",
    textMuted: "text-gray-400",
    textHover: "hover:text-white",
    bgHover: "hover:bg-gray-800",
    card: "bg-gray-800",
    shadow: "shadow-lg shadow-black/50",
    icon: "text-gray-500",
    iconHover: "group-hover:text-blue-400",
    input: "bg-gray-800",
    inputFocus: "focus:bg-gray-900 focus:ring-blue-400/20",
    dropdown: "bg-gray-800 border-gray-700",
    dropdownHover: "hover:bg-gray-700",
    active: "bg-blue-600/20 text-blue-400",
    brand: "text-yellow-400",
    brandBg: "bg-yellow-500",
    brandGradient: "from-yellow-400 to-yellow-600",
  },
}

const LANGUAGES = {
  id: {
    search: "Cari data, proyek, atau dokumen...",
    notifications: "Notifikasi",
    profile: "Profil",
    settings: "Pengaturan",
    help: "Bantuan",
    logout: "Keluar",
    signedInAs: "Masuk sebagai",
    systemLogs: "Log Sistem",
    viewAll: "Lihat Semua",
    markAllRead: "Tandai Dibaca",
    noNotifications: "Tidak ada notifikasi",
    today: "Hari ini",
    yesterday: "Kemarin",
    thisWeek: "Minggu ini",
    older: "Lama",
    quickActions: "Aksi Cepat",
    systemStatus: "Status Sistem",
    cpu: "CPU",
    memory: "Memori",
    storage: "Penyimpanan",
    uptime: "Waktu Aktif",
    version: "Versi",
    environment: "Lingkungan",
    services: "Layanan",
    database: "Database",
    api: "API",
    realtime: "Realtime",
    searchResults: "Hasil Pencarian",
    noResults: "Tidak ada hasil",
    shortcuts: "Pintasan",
    theme: "Tema",
    language: "Bahasa",
    dark: "Gelap",
    light: "Terang",
    system: "Sistem",
    indonesia: "Indonesia",
    english: "English",
    profileSettings: "Pengaturan Profil",
    accountSettings: "Pengaturan Akun",
    security: "Keamanan",
    billing: "Tagihan",
    team: "Tim",
    integrations: "Integrasi",
    documentation: "Dokumentasi",
    support: "Dukungan",
    feedback: "Umpan Balik",
    whatsNew: "Apa yang Baru",
    keyboardShortcuts: "Pintasan Keyboard",
    about: "Tentang",
    terms: "Syarat & Ketentuan",
    privacy: "Kebijakan Privasi",
    license: "Lisensi",
  },
  en: {
    search: "Search data, projects, or documents...",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    logout: "Logout",
    signedInAs: "Signed in as",
    systemLogs: "System Logs",
    viewAll: "View All",
    markAllRead: "Mark All Read",
    noNotifications: "No notifications",
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This week",
    older: "Older",
    quickActions: "Quick Actions",
    systemStatus: "System Status",
    cpu: "CPU",
    memory: "Memory",
    storage: "Storage",
    uptime: "Uptime",
    version: "Version",
    environment: "Environment",
    services: "Services",
    database: "Database",
    api: "API",
    realtime: "Realtime",
    searchResults: "Search Results",
    noResults: "No results",
    shortcuts: "Shortcuts",
    theme: "Theme",
    language: "Language",
    dark: "Dark",
    light: "Light",
    system: "System",
    indonesia: "Indonesia",
    english: "English",
    profileSettings: "Profile Settings",
    accountSettings: "Account Settings",
    security: "Security",
    billing: "Billing",
    team: "Team",
    integrations: "Integrations",
    documentation: "Documentation",
    support: "Support",
    feedback: "Feedback",
    whatsNew: "What's New",
    keyboardShortcuts: "Keyboard Shortcuts",
    about: "About",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
    license: "License",
  },
}

// ================= HOOKS =================

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("header-theme") as "light" | "dark"
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle("dark", saved === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("header-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return { theme, toggleTheme, mounted, config: THEMES[theme] }
}

function useLanguage() {
  const [lang, setLang] = useState<"id" | "en">("id")

  useEffect(() => {
    const saved = localStorage.getItem("header-lang") as "id" | "en"
    if (saved) setLang(saved)
  }, [])

  const toggleLang = () => {
    const newLang = lang === "id" ? "en" : "id"
    setLang(newLang)
    localStorage.setItem("header-lang", newLang)
  }

  return { lang, toggleLang, t: LANGUAGES[lang] }
}

function useUser() {
  const [user, setUser] = useState<UserProfile>({
    id: "1",
    name: "Administrator",
    email: "admin@mpp.co.id",
    role: "SUPER_ADMIN",
    initials: "AD",
    department: "IT",
    position: "System Administrator",
    lastLogin: new Date().toISOString(),
    permissions: ["all"],
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
    preferences: {
      theme: "light",
      language: "id",
      timezone: "Asia/Jakarta",
      dateFormat: "DD/MM/YYYY",
    },
  })

  useEffect(() => {
    // Fetch user data from API
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(prev => ({
            ...prev,
            ...data,
            initials: data.name ? data.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() : "AD",
          }))
        }
      } catch (error) {
        console.error("Failed to fetch user", error)
      }
    }

    fetchUser()
  }, [])

  return user
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Mock notifications - replace with real API
    const mock: Notification[] = [
      {
        id: "1",
        type: "info",
        title: "Inquiry Baru",
        message: "PT Maju Jaya mengirimkan inquiry baru untuk proyek Gedung X",
        timestamp: new Date().toISOString(),
        read: false,
        link: "/admin/estimator/to-estimate",
        action: "Lihat",
        priority: "high",
        category: "inquiry",
      },
      {
        id: "2",
        type: "success",
        title: "RAB Selesai",
        message: "RAB #RAB-123 telah selesai dibuat dan siap dikirim",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        link: "/admin/estimator/rab/RAB-123",
        action: "Buka",
        priority: "medium",
        category: "rab",
      },
      {
        id: "3",
        type: "warning",
        title: "Project Overdue",
        message: "Project Gedung X melewati deadline 3 hari yang lalu",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        link: "/admin/projects/PRJ-456",
        action: "Cek",
        priority: "high",
        category: "project",
      },
      {
        id: "4",
        type: "error",
        title: "Approval Tertunda",
        message: "Finance approval untuk PO #PO-789 menunggu 3 hari",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        link: "/admin/finance/approval",
        action: "Proses",
        priority: "critical",
        category: "finance",
      },
      {
        id: "5",
        type: "system",
        title: "System Update",
        message: "Sistem akan di-update malam ini pukul 02:00 WIB",
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        read: true,
        priority: "low",
        category: "system",
      },
    ]

    setNotifications(mock)
    setUnreadCount(mock.filter(n => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id: string) => {
    const notif = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notif && !notif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }
}

function useSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [popular, setPopular] = useState<string[]>([])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    // Mock search - replace with real API
    const mock: SearchResult[] = [
      {
        id: "1",
        type: "project",
        label: "Gedung X",
        description: "PT Maju Jaya",
        href: "/admin/projects/1",
        icon: Building,
        tags: ["aktif", "mep"],
        date: new Date().toISOString(),
        status: "running",
      },
      {
        id: "2",
        type: "inquiry",
        label: "INQ-123",
        description: "PT Maju Jaya - Renovasi Gedung",
        href: "/admin/crm/inquiry/1",
        icon: FileText,
        tags: ["estimating"],
        date: new Date().toISOString(),
        status: "estimating",
      },
      {
        id: "3",
        type: "rab",
        label: "RAB-456",
        description: "Renovasi Gedung X",
        href: "/admin/estimator/rab/1",
        icon: DollarSign,
        tags: ["draft"],
        date: new Date().toISOString(),
        status: "draft",
      },
      {
        id: "4",
        type: "customer",
        label: "PT Maju Jaya",
        description: "Jakarta",
        href: "/admin/crm/customers/1",
        icon: Users,
        tags: ["active", "vip"],
        date: new Date().toISOString(),
        status: "active",
      },
      {
        id: "5",
        type: "task",
        label: "Review RAB",
        description: "Due today",
        href: "/admin/tasks/1",
        icon: CheckCircle,
        tags: ["urgent"],
        date: new Date().toISOString(),
        status: "pending",
      },
    ].filter(r => 
      r.label.toLowerCase().includes(query.toLowerCase()) ||
      r.description?.toLowerCase().includes(query.toLowerCase()) ||
      r.tags?.some(t => t.includes(query.toLowerCase()))
    )

    setResults(mock)
  }, [query])

  return { query, setQuery, results, open, setOpen, recent, popular }
}

function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    cpu: 45,
    memory: { used: 2.1, total: 4 },
    storage: { used: 128, total: 256 },
    uptime: "15d 7h 23m",
    version: "v2.2.0-2026",
    environment: "production",
    services: {
      database: true,
      api: true,
      storage: true,
      realtime: true,
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setStatus(prev => ({
        ...prev,
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: {
          used: Number((Math.random() * 2 + 1).toFixed(1)),
          total: 4,
        },
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return status
}

function useClickOutside(refs: React.RefObject<HTMLElement>[], onOutside: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    function handler(e: MouseEvent) {
      const target = e.target as Node
      const insideAny = refs.some(r => r.current?.contains(target))
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

function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        document.getElementById("global-search")?.focus()
      }

      // Ctrl/Cmd + N for new
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        // Open quick create
      }

      // Ctrl/Cmd + , for settings
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault()
        // Open settings
      }

      // Ctrl/Cmd + / for shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        // Show shortcuts
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}

// ================= MAIN COMPONENT =================

export default function AdminHeader() {
  const router = useRouter()
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // Hooks
  const user = useUser()
  const { theme, toggleTheme, config } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const search = useSearch()
  const systemStatus = useSystemStatus()
  useKeyboardShortcuts()

  // Refs
  const profileBtnRef = useRef<HTMLButtonElement>(null)
  const profilePanelRef = useRef<HTMLDivElement>(null)
  const notifBtnRef = useRef<HTMLButtonElement>(null)
  const notifPanelRef = useRef<HTMLDivElement>(null)
  const searchBtnRef = useRef<HTMLButtonElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const quickBtnRef = useRef<HTMLButtonElement>(null)
  const quickPanelRef = useRef<HTMLDivElement>(null)
  const statusBtnRef = useRef<HTMLButtonElement>(null)
  const statusPanelRef = useRef<HTMLDivElement>(null)
  const helpBtnRef = useRef<HTMLButtonElement>(null)
  const helpPanelRef = useRef<HTMLDivElement>(null)

  // Click outside handlers
  useClickOutside([profileBtnRef, profilePanelRef], () => setShowProfile(false), showProfile)
  useClickOutside([notifBtnRef, notifPanelRef], () => setShowNotifications(false), showNotifications)
  useClickOutside([searchBtnRef, searchPanelRef], () => setShowSearch(false), showSearch)
  useClickOutside([quickBtnRef, quickPanelRef], () => setShowQuickActions(false), showQuickActions)
  useClickOutside([statusBtnRef, statusPanelRef], () => setShowStatus(false), showStatus)
  useClickOutside([helpBtnRef, helpPanelRef], () => setShowHelp(false), showHelp)

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      label: t.quickActions === "Aksi Cepat" ? "New Inquiry" : "Buat Inquiry",
      description: "Buat lead masuk baru",
      href: "/admin/crm/inquiry/new",
      icon: FileText,
      color: "blue",
      shortcut: "Ctrl+N",
      category: "crm",
    },
    {
      label: t.quickActions === "Aksi Cepat" ? "New RAB" : "Buat RAB",
      description: "Mulai estimator baru",
      href: "/admin/estimator/rab/new",
      icon: DollarSign,
      color: "green",
      shortcut: "Ctrl+Shift+R",
      category: "estimator",
    },
    {
      label: t.quickActions === "Aksi Cepat" ? "New Project" : "Buat Project",
      description: "Create proyek baru",
      href: "/admin/projects/new",
      icon: Building,
      color: "purple",
      shortcut: "Ctrl+Shift+P",
      category: "project",
    },
    {
      label: t.quickActions === "Aksi Cepat" ? "New PO" : "Buat PO",
      description: "Purchase Order baru",
      href: "/admin/purchasing/po/new",
      icon: ShoppingCart,
      color: "orange",
      shortcut: "Ctrl+Shift+O",
      category: "purchasing",
    },
    {
      label: t.quickActions === "Aksi Cepat" ? "New Customer" : "Buat Customer",
      description: "Tambah data customer",
      href: "/admin/crm/customers/new",
      icon: Users,
      color: "red",
      shortcut: "Ctrl+Shift+C",
      category: "crm",
    },
    {
      label: t.quickActions === "Aksi Cepat" ? "New Task" : "Buat Task",
      description: "Buat tugas baru",
      href: "/admin/tasks/new",
      icon: CheckCircle,
      color: "cyan",
      shortcut: "Ctrl+Shift+T",
      category: "task",
    },
  ]

  // Group quick actions by category
  const groupedQuickActions = quickActions.reduce((acc, action) => {
    const category = action.category || "other"
    if (!acc[category]) acc[category] = []
    acc[category].push(action)
    return acc
  }, {} as Record<string, QuickAction[]>)

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setFullscreen(false)
      }
    }
  }

  return (
    <header className={`h-16 ${config.bg} backdrop-blur-md border-b ${config.border} px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300`}>
      
      {/* LEFT: Branding/Context */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {mobileMenuOpen ? <X size={20} className={config.icon} /> : <Menu size={20} className={config.icon} />}
        </button>

        {/* Brand */}
        <div className="hidden md:block">
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-[10px] ${config.brand} font-bold uppercase tracking-[0.2em] leading-none mb-1`}
          >
            CRM Platform
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`font-black ${config.text} text-sm tracking-tight`}
          >
            PT Manggala Putra Persada
          </motion.p>
        </div>

        {/* Quick Stats (desktop) */}
        <div className="hidden lg:flex items-center gap-3 ml-6">
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] font-mono text-gray-600 dark:text-gray-400">CPU {systemStatus.cpu}%</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Activity size={10} className="text-blue-500" />
            <span className="text-[9px] font-mono text-gray-600 dark:text-gray-400">{systemStatus.services.api ? "API Live" : "API Down"}</span>
          </div>
        </div>
      </div>

      {/* CENTER: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block relative" ref={searchBtnRef}>
        <div className="relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${config.icon} group-focus-within:text-yellow-500 transition-colors`} size={18} />
          <input 
            id="global-search"
            type="text" 
            placeholder={t.search}
            value={search.query}
            onChange={(e) => {
              search.setQuery(e.target.value)
              setShowSearch(true)
            }}
            onFocus={() => setShowSearch(true)}
            className={`w-full ${config.input} border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-yellow-500/20 ${config.inputFocus} transition-all outline-none ${config.text}`}
          />

          {/* Search Shortcut Hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-mono text-gray-600 dark:text-gray-400">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[9px] font-mono text-gray-600 dark:text-gray-400">K</kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearch && (search.results.length > 0 || search.query.length > 0) && (
            <motion.div
              ref={searchPanelRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className={`absolute left-0 right-0 mt-2 ${config.dropdown} rounded-2xl shadow-xl overflow-hidden z-50`}
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className={`text-xs font-semibold ${config.text} flex items-center gap-2`}>
                  <Search size={14} className={config.icon} />
                  {t.searchResults}
                </p>
                <span className={`text-[9px] ${config.textMuted}`}>{search.results.length} ditemukan</span>
              </div>

              <div className="max-h-96 overflow-y-auto py-2">
                {search.results.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className={`text-xs ${config.textMuted}`}>{t.noResults}</p>
                    <p className={`text-[9px] ${config.textMuted} mt-1`}>Coba kata kunci lain</p>
                  </div>
                ) : (
                  search.results.map((result) => {
                    const Icon = result.icon || FileText
                    return (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => {
                          setShowSearch(false)
                          search.setQuery("")
                        }}
                      >
                        <motion.div
                          whileHover={{ x: 2 }}
                          className={`px-4 py-3 ${config.dropdownHover} transition-colors flex items-start gap-3 cursor-pointer`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                            result.type === "project" ? "from-blue-500/20 to-blue-600/20 text-blue-500" :
                            result.type === "inquiry" ? "from-green-500/20 to-green-600/20 text-green-500" :
                            result.type === "rab" ? "from-yellow-500/20 to-yellow-600/20 text-yellow-500" :
                            result.type === "customer" ? "from-purple-500/20 to-purple-600/20 text-purple-500" :
                            "from-gray-500/20 to-gray-600/20 text-gray-500"
                          } flex items-center justify-center`}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-semibold ${config.text}`}>{result.label}</p>
                              {result.status && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${
                                  result.status === "running" ? "bg-green-500/10 text-green-500" :
                                  result.status === "estimating" ? "bg-yellow-500/10 text-yellow-500" :
                                  result.status === "draft" ? "bg-gray-500/10 text-gray-500" :
                                  "bg-blue-500/10 text-blue-500"
                                }`}>
                                  {result.status}
                                </span>
                              )}
                            </div>
                            <p className={`text-[9px] ${config.textMuted} mt-0.5 line-clamp-1`}>{result.description}</p>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {result.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className={`px-1 py-0.5 ${config.input} rounded text-[7px] ${config.textMuted}`}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })
                )}
              </div>

              <div className={`px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-[8px] ${config.textMuted} flex items-center justify-between`}>
                <span>↑↓ navigate • ↵ select • ESC close</span>
                <span className="font-mono">{search.results.length} results</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: Actions & User Profile */}
      <div className="flex items-center gap-1 sm:gap-3">
        
        {/* Quick Actions Button (desktop) */}
        <div className="relative hidden lg:block">
          <motion.button
            ref={quickBtnRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowQuickActions(!showQuickActions)
              setShowNotifications(false)
              setShowProfile(false)
              setShowStatus(false)
              setShowHelp(false)
            }}
            className={`p-2 ${config.bgHover} rounded-lg relative transition-colors`}
            title={t.quickActions}
          >
            <Zap size={20} className={config.icon} />
          </motion.button>

          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                ref={quickPanelRef}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-96 ${config.dropdown} rounded-2xl shadow-xl overflow-hidden z-50`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className={`text-xs font-semibold ${config.text} flex items-center gap-2`}>
                    <Zap size={14} className="text-yellow-400" />
                    {t.quickActions}
                  </p>
                  <span className={`text-[9px] ${config.textMuted}`}>Keyboard shortcuts</span>
                </div>

                <div className="max-h-96 overflow-y-auto py-2">
                  {Object.entries(groupedQuickActions).map(([category, actions]) => (
                    <div key={category}>
                      <p className={`px-4 py-1 text-[8px] uppercase tracking-wider ${config.textMuted} font-semibold`}>
                        {category}
                      </p>
                      {actions.map((action) => {
                        const colors = {
                          blue: "from-blue-500/20 to-blue-600/20 text-blue-500",
                          green: "from-green-500/20 to-green-600/20 text-green-500",
                          purple: "from-purple-500/20 to-purple-600/20 text-purple-500",
                          orange: "from-orange-500/20 to-orange-600/20 text-orange-500",
                          red: "from-red-500/20 to-red-600/20 text-red-500",
                          cyan: "from-cyan-500/20 to-cyan-600/20 text-cyan-500",
                        }
                        return (
                          <Link
                            key={action.href}
                            href={action.href}
                            onClick={() => setShowQuickActions(false)}
                          >
                            <motion.div
                              whileHover={{ x: 2 }}
                              className={`px-4 py-3 ${config.dropdownHover} transition-colors flex items-start gap-3 cursor-pointer`}
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[action.color as keyof typeof colors]} flex items-center justify-center`}>
                                <action.icon size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs font-semibold ${config.text}`}>{action.label}</p>
                                  <span className={`text-[7px] font-mono px-1 py-0.5 ${config.input} rounded`}>
                                    {action.shortcut}
                                  </span>
                                </div>
                                <p className={`text-[9px] ${config.textMuted} mt-0.5`}>{action.description}</p>
                              </div>
                            </motion.div>
                          </Link>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Status Button (desktop) */}
        <div className="relative hidden lg:block">
          <motion.button
            ref={statusBtnRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowStatus(!showStatus)
              setShowNotifications(false)
              setShowProfile(false)
              setShowQuickActions(false)
              setShowHelp(false)
            }}
            className={`p-2 ${config.bgHover} rounded-lg relative transition-colors`}
            title={t.systemStatus}
          >
            <Activity size={20} className={config.icon} />
            {!systemStatus.services.api && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </motion.button>

          <AnimatePresence>
            {showStatus && (
              <motion.div
                ref={statusPanelRef}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-80 ${config.dropdown} rounded-2xl shadow-xl overflow-hidden z-50`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className={`text-xs font-semibold ${config.text} flex items-center gap-2`}>
                    <Activity size={14} className="text-blue-400" />
                    {t.systemStatus}
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {/* CPU */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] ${config.textMuted}`}>{t.cpu}</span>
                      <span className={`text-[9px] font-mono ${config.text}`}>{systemStatus.cpu}%</span>
                    </div>
                    <div className={`w-full ${config.input} rounded-full h-1.5 overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${systemStatus.cpu}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] ${config.textMuted}`}>{t.memory}</span>
                      <span className={`text-[9px] font-mono ${config.text}`}>
                        {systemStatus.memory.used}GB / {systemStatus.memory.total}GB
                      </span>
                    </div>
                    <div className={`w-full ${config.input} rounded-full h-1.5 overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(systemStatus.memory.used / systemStatus.memory.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[9px] ${config.textMuted}`}>{t.storage}</span>
                      <span className={`text-[9px] font-mono ${config.text}`}>
                        {systemStatus.storage.used}GB / {systemStatus.storage.total}GB
                      </span>
                    </div>
                    <div className={`w-full ${config.input} rounded-full h-1.5 overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(systemStatus.storage.used / systemStatus.storage.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <p className={`text-[9px] ${config.textMuted} mb-2`}>{t.services}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <ServiceIndicator
                        label={t.database}
                        active={systemStatus.services.database}
                        config={config}
                      />
                      <ServiceIndicator
                        label={t.api}
                        active={systemStatus.services.api}
                        config={config}
                      />
                      <ServiceIndicator
                        label={t.storage}
                        active={systemStatus.services.storage}
                        config={config}
                      />
                      <ServiceIndicator
                        label={t.realtime}
                        active={systemStatus.services.realtime}
                        config={config}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className={`pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-[8px] ${config.textMuted}`}>
                    <div>
                      <span className="block">{t.uptime}</span>
                      <span className={`font-mono ${config.text}`}>{systemStatus.uptime}</span>
                    </div>
                    <div>
                      <span className="block">{t.version}</span>
                      <span className={`font-mono ${config.text}`}>{systemStatus.version}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Help Button (desktop) */}
        <div className="relative hidden lg:block">
          <motion.button
            ref={helpBtnRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowHelp(!showHelp)
              setShowNotifications(false)
              setShowProfile(false)
              setShowQuickActions(false)
              setShowStatus(false)
            }}
            className={`p-2 ${config.bgHover} rounded-lg transition-colors`}
            title={t.help}
          >
            <HelpCircle size={20} className={config.icon} />
          </motion.button>

          <AnimatePresence>
            {showHelp && (
              <motion.div
                ref={helpPanelRef}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-72 ${config.dropdown} rounded-2xl shadow-xl overflow-hidden z-50`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className={`text-xs font-semibold ${config.text} flex items-center gap-2`}>
                    <HelpCircle size={14} className="text-blue-400" />
                    {t.help}
                  </p>
                </div>

                <div className="p-2">
                  <HelpMenuItem icon={FileText} label={t.documentation} />
                  <HelpMenuItem icon={Video} label={t.support} />
                  <HelpMenuItem icon={MessageSquare} label={t.feedback} />
                  <HelpMenuItem icon={Gift} label={t.whatsNew} />
                  <HelpMenuItem icon={Keyboard} label={t.keyboardShortcuts} />
                  <HelpMenuItem icon={Info} label={t.about} />
                </div>

                <div className={`px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-[8px] ${config.textMuted} text-center`}>
                  {t.terms} • {t.privacy}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fullscreen Toggle (desktop) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className={`p-2 ${config.bgHover} rounded-lg transition-colors hidden lg:block`}
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize2 size={20} className={config.icon} /> : <Maximize2 size={20} className={config.icon} />}
        </motion.button>

        {/* Theme Toggle (desktop) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`p-2 ${config.bgHover} rounded-lg transition-colors hidden lg:block`}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <MoonIcon size={20} className={config.icon} />
          )}
        </motion.button>

        {/* Language Toggle (desktop) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLang}
          className={`p-2 ${config.bgHover} rounded-lg transition-colors hidden lg:flex items-center gap-1`}
          title={lang === "id" ? "English" : "Indonesia"}
        >
          <Globe size={20} className={config.icon} />
          <span className={`text-[10px] font-bold ${config.text}`}>{lang.toUpperCase()}</span>
        </motion.button>
        
        {/* Notifications */}
        <div className="relative">
          <motion.button
            ref={notifBtnRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
              setShowQuickActions(false)
              setShowStatus(false)
              setShowHelp(false)
            }}
            className={`p-2 ${config.bgHover} rounded-lg relative transition-colors`}
            title={t.notifications}
          >
            <Bell size={20} className={config.icon} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
              />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full px-1.5 py-0.5 min-w-[1rem] text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                ref={notifPanelRef}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-96 ${config.dropdown} rounded-2xl shadow-xl overflow-hidden z-50`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className={`text-xs font-semibold ${config.text} flex items-center gap-2`}>
                    <Bell size={14} className="text-yellow-400" />
                    {t.notifications}
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className={`text-[9px] ${config.textMuted} hover:${config.text} transition-colors`}
                      >
                        {t.markAllRead}
                      </button>
                    )}
                    <Link href="/admin/notifications">
                      <button className={`text-[9px] ${config.textMuted} hover:${config.text} transition-colors`}>
                        {t.viewAll}
                      </button>
                    </Link>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className={`text-xs ${config.textMuted}`}>{t.noNotifications}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const typeColors = {
                        info: "bg-blue-500/10 text-blue-500",
                        success: "bg-green-500/10 text-green-500",
                        warning: "bg-yellow-500/10 text-yellow-500",
                        error: "bg-red-500/10 text-red-500",
                        system: "bg-purple-500/10 text-purple-500",
                      }
                      const typeIcons = {
                        info: Info,
                        success: CheckCircle,
                        warning: AlertCircle,
                        error: XCircle,
                        system: Activity,
                      }
                      const Icon = typeIcons[notif.type]

                      return (
                        <NotificationItem
                          key={notif.id}
                          notification={notif}
                          icon={Icon}
                          typeColor={typeColors[notif.type]}
                          config={config}
                          onMarkRead={() => markAsRead(notif.id)}
                          onDelete={() => deleteNotification(notif.id)}
                          onClose={() => setShowNotifications(false)}
                        />
                      )
                    })
                  )}
                </div>

                <div className={`px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-[8px] ${config.textMuted} text-center`}>
                  {t.shortcuts}: ESC to close
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block`} />

        {/* User Profile Dropdown */}
        <div className="relative">
          <motion.button 
            ref={profileBtnRef}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
              setShowQuickActions(false)
              setShowStatus(false)
              setShowHelp(false)
            }}
            className={`flex items-center gap-3 p-1.5 ${config.bgHover} rounded-xl transition-all group`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.brandGradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-lg object-cover" />
              ) : (
                user.initials
              )}
            </div>
            <div className="hidden md:block text-left leading-none">
              <p className={`text-sm font-bold ${config.text} flex items-center gap-1`}>
                {user.name}
                {user.role === "SUPER_ADMIN" && (
                  <Crown size={12} className="text-yellow-400" />
                )}
              </p>
              <p className={`text-[9px] ${config.textMuted} font-medium mt-1`}>
                {user.role === "SUPER_ADMIN" ? "Super User" : user.role}
              </p>
            </div>
            <ChevronDown 
              size={16} 
              className={`${config.icon} transition-transform duration-300 ${showProfile ? 'rotate-180' : ''}`} 
            />
          </motion.button>

          {/* DROPDOWN MENU */}
          <AnimatePresence>
            {showProfile && (
              <>
                <motion.div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfile(false)} 
                />
                <motion.div
                  ref={profilePanelRef}
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.95 }}
                  className={`absolute right-0 mt-2 w-72 ${config.dropdown} border ${config.border} rounded-2xl shadow-xl py-2 z-50`}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.brandGradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {user.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${config.text} truncate`}>{user.name}</p>
                        <p className={`text-[9px] ${config.textMuted} truncate`}>{user.email}</p>
                      </div>
                    </div>
                    <p className={`text-[8px] ${config.textMuted} mt-2`}>
                      {t.signedInAs} <span className={`font-mono ${config.text}`}>{user.role}</span>
                    </p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <MenuItem 
                      icon={User} 
                      label={t.profile} 
                      href="/admin/profile"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                    <MenuItem 
                      icon={Settings} 
                      label={t.settings} 
                      href="/admin/settings"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                    <MenuItem 
                      icon={Shield} 
                      label={t.security} 
                      href="/admin/security"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                    <MenuItem 
                      icon={Users} 
                      label={t.team} 
                      href="/admin/team"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                  </div>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-4" />
                  
                  <div className="py-1">
                    <MenuItem 
                      icon={HelpCircle} 
                      label={t.help} 
                      href="/admin/help"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                    <MenuItem 
                      icon={FileText} 
                      label={t.documentation} 
                      href="/admin/docs"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                    <MenuItem 
                      icon={MessageSquare} 
                      label={t.feedback} 
                      href="/admin/feedback"
                      config={config}
                      onClick={() => setShowProfile(false)}
                    />
                  </div>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-4" />
                  
                  {/* Theme & Language quick toggles */}
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <MoonIcon size={14} className={config.icon} />
                      ) : (
                        <Sun size={14} className="text-yellow-400" />
                      )}
                      <span className={`text-[10px] ${config.text}`}>{t.theme}</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`px-2 py-1 text-[8px] ${config.input} rounded-lg ${config.text}`}
                    >
                      {theme === "dark" ? t.light : t.dark}
                    </button>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className={config.icon} />
                      <span className={`text-[10px] ${config.text}`}>{t.language}</span>
                    </div>
                    <button
                      onClick={toggleLang}
                      className={`px-2 py-1 text-[8px] ${config.input} rounded-lg ${config.text}`}
                    >
                      {lang === "id" ? t.english : t.indonesia}
                    </button>
                  </div>
                  
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1 mx-4" />
                  
                  {/* Logout */}
                  <button 
                    onClick={() => {
                      setShowProfile(false)
                      router.push("/logout")
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-semibold"
                  >
                    <LogOut size={16} />
                    {t.logout}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className={`fixed inset-0 z-40 md:hidden ${config.bg} backdrop-blur-md`}
          >
            <div className="p-6 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${config.icon}`} size={18} />
                <input
                  type="text"
                  placeholder={t.search}
                  className={`w-full ${config.input} border-none rounded-xl py-3 pl-10 pr-4 text-sm`}
                />
              </div>

              {/* Quick Actions */}
              <div>
                <p className={`text-xs font-semibold ${config.text} mb-3`}>{t.quickActions}</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.slice(0, 4).map((action) => (
                    <Link key={action.href} href={action.href}>
                      <div className={`p-3 ${config.card} rounded-xl text-center`}>
                        <action.icon size={20} className="mx-auto mb-2" />
                        <p className={`text-[10px] ${config.text}`}>{action.label}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div>
                <p className={`text-xs font-semibold ${config.text} mb-3`}>{t.systemStatus}</p>
                <div className={`p-4 ${config.card} rounded-xl`}>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className={config.textMuted}>CPU</span>
                        <span className={config.text}>{systemStatus.cpu}%</span>
                      </div>
                      <div className={`w-full ${config.input} rounded-full h-1.5`}>
                        <div className="w-[45%] h-full bg-blue-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className={config.textMuted}>Memory</span>
                        <span className={config.text}>2.1/4GB</span>
                      </div>
                      <div className={`w-full ${config.input} rounded-full h-1.5`}>
                        <div className="w-[52%] h-full bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="space-y-2">
                <MenuItemMobile icon={Home} label="Dashboard" href="/admin" config={config} />
                <MenuItemMobile icon={Building} label="Projects" href="/admin/projects" config={config} />
                <MenuItemMobile icon={Users} label="CRM" href="/admin/crm" config={config} />
                <MenuItemMobile icon={DollarSign} label="Estimator" href="/admin/estimator" config={config} />
                <MenuItemMobile icon={Settings} label={t.settings} href="/admin/settings" config={config} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ================= COMPONENTS =================

function MenuItem({ icon: Icon, label, href, config, onClick }: { icon: any; label: string; href?: string; config: any; onClick?: () => void }) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) onClick()
    if (href) router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${config.text} ${config.dropdownHover} transition-colors`}
    >
      <Icon size={16} className={config.icon} />
      {label}
    </button>
  )
}

function MenuItemMobile({ icon: Icon, label, href, config }: { icon: any; label: string; href: string; config: any }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full flex items-center gap-3 px-4 py-3 ${config.card} rounded-xl text-sm ${config.text} ${config.bgHover} transition-colors`}
    >
      <Icon size={18} className={config.icon} />
      {label}
    </button>
  )
}

function NotificationItem({ notification, icon: Icon, typeColor, config, onMarkRead, onDelete, onClose }: {
  notification: Notification
  icon: any
  typeColor: string
  config: any
  onMarkRead: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const router = useRouter()

  const getTimeAgo = (timestamp: string) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`px-4 py-3 ${config.dropdownHover} transition-colors cursor-pointer relative group ${
        !notification.read ? `${config.active} -mx-2 px-6` : ''
      }`}
      onClick={() => {
        if (notification.link) router.push(notification.link)
        if (!notification.read) onMarkRead()
        onClose()
      }}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 rounded-lg ${typeColor} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-[11px] font-semibold ${config.text}`}>{notification.title}</p>
              <p className={`text-[9px] ${config.textMuted} mt-0.5 line-clamp-2`}>{notification.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[7px] ${config.textMuted}`}>{getTimeAgo(notification.timestamp)}</span>
                {notification.priority === "high" && (
                  <span className="px-1 py-0.5 bg-red-500/10 text-red-500 rounded text-[7px] font-semibold">
                    High
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead()
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Mark as read"
          >
            <CheckCircle size={12} className="text-green-500" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Delete"
        >
          <X size={12} className="text-red-500" />
        </button>
      </div>
    </motion.div>
  )
}

function HelpMenuItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <Icon size={12} className="text-gray-500 dark:text-gray-400" />
      </div>
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </motion.div>
  )
}

function ServiceIndicator({ label, active, config }: { label: string; active: boolean; config: any }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={`text-[8px] ${config.textMuted}`}>{label}</span>
    </div>
  )
}
