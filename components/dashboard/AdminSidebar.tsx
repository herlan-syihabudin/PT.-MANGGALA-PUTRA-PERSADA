"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  const menu = [
    {
      section: "CORE",
      items: [{ name: "Dashboard", href: "/admin/dashboard" }],
    },
    {
      section: "CRM",
      items: [
        { name: "Inquiry Masuk", href: "/admin/crm/inquiry" },
        { name: "Pipeline & Deal", href: "/admin/crm/pipeline" },
        { name: "Klien", href: "/admin/crm/clients" },
      ],
    },
    {
      section: "PROJECT MANAGEMENT",
      items: [
        { name: "Project List", href: "/admin/projects" },
        { name: "Progress & Timeline", href: "/admin/projects/progress" },
        { name: "BOQ / RAB", href: "/admin/projects/boq" },
        { name: "Site Report", href: "/admin/projects/site-report" },
      ],
    },
    {
      section: "PROCUREMENT",
      items: [
        { name: "Purchase Request", href: "/admin/procurement/pr" },
        { name: "Purchase Order", href: "/admin/procurement/po" },
        { name: "Vendor & Supplier", href: "/admin/procurement/vendor" },
      ],
    },
    {
      section: "LOGISTICS",
      items: [
        { name: "Material In", href: "/admin/logistics/in" },
        { name: "Material Out", href: "/admin/logistics/out" },
        { name: "Inventory", href: "/admin/logistics/stock" },
      ],
    },
    {
      section: "FINANCE",
      items: [
        { name: "Budget Control", href: "/admin/finance/budget" },
        { name: "Invoice", href: "/admin/finance/invoice" },
        { name: "Payment Tracking", href: "/admin/finance/payment" },
      ],
    },
    {
      section: "HR & PAYROLL",
      items: [
        { name: "Employees", href: "/admin/hr/employees" },
        { name: "Attendance", href: "/admin/hr/attendance" },
        { name: "Payroll", href: "/admin/hr/payroll" },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        { name: "Reports", href: "/admin/reports" },
        { name: "Settings", href: "/admin/settings" },
      ],
    },
  ]

  return (
    <aside className="w-72 bg-gray-900 text-gray-300 hidden md:flex flex-col">
      {/* LOGO */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="text-lg font-extrabold text-white">
          MPP<span className="text-yellow-400"> ERP</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          CRM · Project · Finance · HR
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-6 text-sm">
        {menu.map((group) => (
          <div key={group.section}>
            <p className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500">
              {group.section}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg transition
                    ${
                      isActive(item.href)
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
        © {new Date().getFullYear()} PT Manggala Putra Persada
      </div>
    </aside>
  )
}
