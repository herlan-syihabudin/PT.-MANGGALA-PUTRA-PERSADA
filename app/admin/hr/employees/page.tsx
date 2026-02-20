import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  Wallet, 
  HeartPulse, 
  Clock, 
  TrendingUp, 
  DoorClosed,
  CheckCircle2,
  Lock,
  AlertCircle,
  ArrowRight,
  UserRound,
  Calendar,
  BarChart3,
  CircleDollarSign,
  FileCheck,
  UserCog
} from "lucide-react"

/* ================= MOCK STATUS (NANTI DIGANTI API) ================= */
const HR_STATUS = {
  master: true,
  employment: true,
  organization: true,
  contract: false,
  payroll: false,
  bpjs: false,
  attendance: true,
  performance: true,
  exit: true,
}

/* ================= MODULE CONFIG ================= */
const MODULES = [
  {
    id: 'master',
    title: 'Employee Master',
    desc: 'Data inti karyawan (identitas & kontak)',
    icon: Users,
    color: 'blue',
    href: '/admin/hr/employees/master',
    status: HR_STATUS.master,
    order: 1,
    dependencies: []
  },
  {
    id: 'employment',
    title: 'Employment Status',
    desc: 'Status kerja, tanggal masuk/keluar, lokasi',
    icon: UserRound,
    color: 'indigo',
    href: '/admin/hr/employment-status',
    status: HR_STATUS.employment,
    order: 2,
    dependencies: ['master']
  },
  {
    id: 'organization',
    title: 'Organization & Position',
    desc: 'Divisi, jabatan, atasan langsung',
    icon: Building2,
    color: 'purple',
    href: '/admin/hr/organization',
    status: HR_STATUS.organization,
    order: 3,
    dependencies: ['employment']
  },
  {
    id: 'contract',
    title: 'Contract Management',
    desc: 'Kontrak PKWT / PKWTT & masa berlaku',
    icon: FileText,
    color: 'amber',
    href: '/admin/hr/contract',
    status: HR_STATUS.contract,
    order: 4,
    dependencies: ['organization'],
    lockedReason: 'Lengkapi data organisasi terlebih dahulu'
  },
  {
    id: 'payroll',
    title: 'Compensation & Payroll',
    desc: 'Gaji pokok, tunjangan, rekening',
    icon: CircleDollarSign,
    color: 'green',
    href: '/admin/hr/payroll',
    status: HR_STATUS.payroll,
    order: 5,
    dependencies: ['contract'],
    lockedReason: 'Kontrak belum lengkap'
  },
  {
    id: 'bpjs',
    title: 'BPJS & Tax',
    desc: 'BPJS Kesehatan, TK, NPWP',
    icon: HeartPulse,
    color: 'rose',
    href: '/admin/hr/bpjs-tax',
    status: HR_STATUS.bpjs,
    order: 6,
    dependencies: ['payroll'],
    lockedReason: 'Payroll belum aktif'
  },
  {
    id: 'attendance',
    title: 'Attendance',
    desc: 'Relasi absensi & lembur',
    icon: Clock,
    color: 'cyan',
    href: '/admin/hr/attendance',
    status: HR_STATUS.attendance,
    isExternal: true,
    order: 7
  },
  {
    id: 'performance',
    title: 'Performance',
    desc: 'KPI, OKR & penilaian',
    icon: TrendingUp,
    color: 'orange',
    href: '/admin/hr/performance',
    status: HR_STATUS.performance,
    isExternal: true,
    order: 8
  },
  {
    id: 'exit',
    title: 'Employee Exit',
    desc: 'Resign, clearance & nonaktif',
    icon: DoorClosed,
    color: 'gray',
    href: '/admin/hr/employee-exit',
    status: HR_STATUS.exit,
    order: 9,
    dependencies: ['payroll']
  }
]

/* ================= PAGE ================= */
export default function EmployeePage() {
  const coreModules = MODULES.filter(m => !m.isExternal)
  const completedCore = coreModules.filter(m => m.status).length
  const totalCore = coreModules.length
  const progress = Math.round((completedCore / totalCore) * 100)

  // Stats
  const totalEmployees = 156 // Mock data
  const activeContracts = 142
  const pendingReviews = 8

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="p-4 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Employee Module
                </span>
                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  v2.0
                </span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Pengelolaan siklus hidup karyawan secara end-to-end
              </p>
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
                <FileCheck size={16} />
                Export Report
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                <UserCog size={16} />
                Manage Employees
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Karyawan"
              value={totalEmployees}
              icon={Users}
              trend="+12 bulan ini"
              color="blue"
            />
            <StatCard
              title="Kontrak Aktif"
              value={activeContracts}
              icon={FileText}
              trend="91% dari total"
              color="green"
            />
            <StatCard
              title="Review Pending"
              value={pendingReviews}
              icon={AlertCircle}
              trend="Perlu perhatian"
              color="amber"
              alert
            />
            <StatCard
              title="Module Progress"
              value={`${progress}%`}
              icon={BarChart3}
              trend={`${completedCore}/${totalCore} selesai`}
              color="purple"
            />
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Employee Lifecycle Progress</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Progress berdasarkan kesiapan modul HR utama
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{progress}%</span>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full relative"
              >
                <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse" />
              </motion.div>
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-6 gap-2 mt-6">
              {coreModules.map((module, idx) => (
                <TimelineStep
                  key={module.id}
                  label={module.title.split(' ')[0]}
                  completed={module.status}
                  active={!module.status && coreModules[idx - 1]?.status}
                  last={idx === coreModules.length - 1}
                />
              ))}
            </div>
          </div>

          {/* FLOW INFO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Employee Lifecycle Flow</h3>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-blue-700">Master → Status → Organisasi → Kontrak → Payroll → Exit</span>
                  <br />
                  Setiap modul harus diisi berurutan untuk memastikan data karyawan lengkap dan valid.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* MODULE GRID */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {MODULES.sort((a, b) => a.order - b.order).map((module, idx) => {
            const isLocked = !module.isExternal && 
              module.dependencies?.some(depId => {
                const dep = MODULES.find(m => m.id === depId)
                return !dep?.status
              })

            const status = module.isExternal 
              ? 'LINK' 
              : module.status 
                ? 'ACTIVE' 
                : isLocked 
                  ? 'LOCKED' 
                  : 'DRAFT'

            return (
              <SubModule
                key={module.id}
                title={module.title}
                desc={module.desc}
                icon={module.icon}
                status={status}
                href={module.href}
                lockedReason={module.lockedReason}
                color={module.color}
                index={idx}
                isExternal={module.isExternal}
              />
            )
          })}
        </motion.div>

        {/* BOTTOM INFO */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <Lock size={16} className="text-gray-400" />
            <span className="font-medium text-gray-700">Module Status Indicators:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatusIndicator color="green" label="Active - Siap digunakan" />
            <StatusIndicator color="yellow" label="Draft - Dalam pengembangan" />
            <StatusIndicator color="red" label="Locked - Butuh prerequisite" />
            <StatusIndicator color="gray" label="Link - Modul terpisah" />
            <StatusIndicator color="blue" label="Complete - Semua data terisi" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= SUB MODULE ================= */
function SubModule({ 
  title, 
  desc, 
  icon: Icon, 
  status, 
  href = "#", 
  lockedReason,
  color = 'blue',
  index = 0,
  isExternal = false
}: { 
  title: string
  desc: string
  icon: any
  status: "ACTIVE" | "DRAFT" | "LOCKED" | "LINK"
  href?: string
  lockedReason?: string
  color?: string
  index?: number
  isExternal?: boolean
}) {
  const statusColors = {
    ACTIVE: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700 border-green-200',
      icon: 'text-green-600'
    },
    DRAFT: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: 'text-yellow-600'
    },
    LOCKED: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700 border-red-200',
      icon: 'text-red-600'
    },
    LINK: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: 'text-gray-600'
    }
  }

  const colors = statusColors[status]
  const isLocked = status === 'LOCKED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={isLocked ? '#' : href}
        onClick={(e) => isLocked && e.preventDefault()}
        className={`relative group block bg-white border rounded-2xl p-6 transition-all duration-300
          ${isLocked 
            ? 'opacity-75 cursor-not-allowed border-gray-200' 
            : 'hover:shadow-xl hover:-translate-y-1 border-gray-200 hover:border-gray-300'
          }
          ${colors.bg} bg-opacity-30 hover:bg-opacity-50`}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isExternal && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              External
            </span>
          )}
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${colors.badge}`}>
            {status}
          </span>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>

        {/* Content */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 pr-20">
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {desc}
        </p>

        {/* Locked Reason */}
        {isLocked && lockedReason && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <Lock size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600">
              ⚠️ {lockedReason}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Modul Employee
          </span>
          {!isLocked && (
            <span className="text-xs text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Access Module
              <ArrowRight size={12} />
            </span>
          )}
        </div>

        {/* Hover Overlay untuk Locked */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white shadow-lg rounded-xl px-4 py-2 flex items-center gap-2 border border-red-200">
              <Lock size={14} className="text-red-500" />
              <span className="text-xs font-medium text-red-600">Terkunci</span>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

/* ================= STAT CARD ================= */
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  alert = false 
}: { 
  title: string
  value: string | number
  icon: any
  trend: string
  color?: string
  alert?: boolean
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {alert && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      <p className={`text-xs ${alert ? 'text-amber-600' : 'text-gray-500'}`}>
        {trend}
      </p>
    </motion.div>
  )
}

/* ================= TIMELINE STEP ================= */
function TimelineStep({ 
  label, 
  completed, 
  active,
  last 
}: { 
  label: string
  completed: boolean
  active?: boolean
  last?: boolean
}) {
  return (
    <div className="flex flex-col items-center relative">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
        ${completed 
          ? 'bg-green-500 text-white' 
          : active 
            ? 'bg-blue-500 text-white animate-pulse' 
            : 'bg-gray-200 text-gray-400'}`}
      >
        {completed ? (
          <CheckCircle2 size={16} />
        ) : (
          <span className="text-xs font-medium">{label[0]}</span>
        )}
      </div>
      <span className={`text-[10px] font-medium text-center
        ${completed ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-400'}`}>
        {label}
      </span>
      {!last && (
        <div className={`absolute top-4 left-[60%] w-full h-[2px] -z-10
          ${completed ? 'bg-green-500' : 'bg-gray-200'}`} />
      )}
    </div>
  )
}

/* ================= STATUS INDICATOR ================= */
function StatusIndicator({ color, label }: { color: string; label: string }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
    blue: 'bg-blue-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[color as keyof typeof colors]}`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  )
}
