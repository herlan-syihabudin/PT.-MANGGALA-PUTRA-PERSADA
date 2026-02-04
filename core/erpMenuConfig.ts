// src/core/erpMenuConfig.ts

import {
  LayoutDashboard,
  Activity,
  AlertTriangle,

  MessagesSquare,
  Inbox,
  GitBranch,
  Users,
  FileText,
  ScrollText,

  Calculator,
  FileSpreadsheet,
  Table2,
  LineChart,
  Settings2,
  CheckSquare,

  PenTool,
  History,
  FileCheck,
  FileWarning,

  FolderKanban,
  Timer,
  ClipboardList,
  FilePlus,
  AlertOctagon,

  ShoppingCart,
  FilePlus2,
  FileBadge2,
  Store,
  Scale,
  Handshake,

  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  Box,
  ArrowLeftRight,
  Wrench,

  Wallet,
  PieChart,
  Receipt,
  CreditCard,
  Coins,
  FileSearch,

  Users2,
  Badge,
  Fingerprint,
  Banknote,
  FileSignature,
  Building2,

  Settings,
  FileBarChart,
  ShieldCheck,
} from "lucide-react"

export const ERP_MENU = [
  {
    section: "CORE",
    icon: LayoutDashboard,
    items: [
      { name: "Dashboard Utama", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Company KPI", href: "/admin/core/kpi", icon: Activity },
      { name: "Risk & Alert", href: "/admin/core/risk", icon: AlertTriangle },
    ],
  },

  {
    section: "MARKETING & CRM",
    icon: MessagesSquare,
    items: [
      { name: "Inquiry Masuk", href: "/admin/crm/inquiry", icon: Inbox },
      { name: "Pipeline & Deal", href: "/admin/crm/pipeline", icon: GitBranch },
      { name: "Klien", href: "/admin/crm/clients", icon: Users },
      { name: "Penawaran & Proposal", href: "/admin/crm/proposals", icon: FileText },
      { name: "Kontrak Project", href: "/admin/crm/contracts", icon: ScrollText },
    ],
  },

  {
    section: "ESTIMATOR",
    icon: Calculator,
    items: [
      { name: "RAB Project", href: "/admin/estimator/rab", icon: FileSpreadsheet },
      { name: "BOQ", href: "/admin/estimator/boq", icon: Table2 },
      { name: "Analisa Harga", href: "/admin/estimator/price-analysis", icon: LineChart },
      { name: "Value Engineering", href: "/admin/estimator/value-engineering", icon: Settings2 },
      { name: "Approval RAB", href: "/admin/estimator/approval", icon: CheckSquare },
    ],
  },

  {
    section: "ENGINEERING",
    icon: PenTool,
    items: [
      { name: "Design & Shop Drawing", href: "/admin/engineering/drawings", icon: PenTool },
      { name: "Revisi & Issue", href: "/admin/engineering/revisions", icon: History },
      { name: "As-Built Drawing", href: "/admin/engineering/asbuilt", icon: FileCheck },
      { name: "Engineering Change Note", href: "/admin/engineering/ecn", icon: FileWarning },
    ],
  },

  {
    section: "PROJECT MANAGEMENT",
    icon: FolderKanban,
    items: [
      { name: "Project List", href: "/admin/projects", icon: FolderKanban },
      { name: "Progress & Timeline", href: "/admin/projects/progress", icon: Timer },
      { name: "Site Report", href: "/admin/projects/site-report", icon: ClipboardList },
      { name: "VO / Claim", href: "/admin/projects/vo", icon: FilePlus },
      { name: "Issue & NCR", href: "/admin/projects/issue-ncr", icon: AlertOctagon },
    ],
  },

  {
    section: "PROCUREMENT",
    icon: ShoppingCart,
    items: [
      { name: "Purchase Request", href: "/admin/procurement/pr", icon: FilePlus2 },
      { name: "Purchase Order", href: "/admin/procurement/po", icon: FileBadge2 },
      { name: "Vendor & Supplier", href: "/admin/procurement/vendor", icon: Store },
      { name: "Price Comparison", href: "/admin/procurement/comparison", icon: Scale },
      { name: "Contract Procurement", href: "/admin/procurement/contracts", icon: Handshake },
    ],
  },

  {
    section: "LOGISTICS & INVENTORY",
    icon: Boxes,
    items: [
      { name: "Material In", href: "/admin/logistics/in", icon: ArrowDownToLine },
      { name: "Material Out", href: "/admin/logistics/out", icon: ArrowUpFromLine },
      { name: "Inventory Stock", href: "/admin/logistics/stock", icon: Box },
      { name: "Mutasi Gudang", href: "/admin/logistics/transfer", icon: ArrowLeftRight },
      { name: "Asset & Tools", href: "/admin/logistics/assets", icon: Wrench },
    ],
  },

  {
    section: "FINANCE & ACCOUNTING",
    icon: Wallet,
    items: [
      { name: "Budget Control", href: "/admin/finance/budget", icon: PieChart },
      { name: "Invoice & Billing", href: "/admin/finance/invoice", icon: Receipt },
      { name: "Payment Tracking", href: "/admin/finance/payment", icon: CreditCard },
      { name: "Project Cost", href: "/admin/finance/project-cost", icon: Coins },
      { name: "Tax & Compliance", href: "/admin/finance/tax", icon: FileSearch },
    ],
  },

  {
    section: "HR & GA",
    icon: Users2,
    items: [
      { name: "Employees", href: "/admin/hr/employees", icon: IdCard },
      { name: "Attendance", href: "/admin/hr/attendance", icon: Fingerprint },
      { name: "Payroll", href: "/admin/hr/payroll", icon: Banknote },
      { name: "Contract & Evaluation", href: "/admin/hr/contracts", icon: FileSignature },
      { name: "General Affair", href: "/admin/hr/ga", icon: Building2 },
    ],
  },

  {
    section: "SYSTEM",
    icon: Settings,
    items: [
      { name: "Reports", href: "/admin/reports", icon: FileBarChart },
      { name: "User & Roles", href: "/admin/system/users", icon: ShieldCheck },
      { name: "Settings", href: "/admin/settings", icon: Settings2 },
    ],
  },
]
