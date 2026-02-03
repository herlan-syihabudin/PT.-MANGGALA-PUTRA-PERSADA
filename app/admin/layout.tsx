import AdminSidebar from "@/components/AdminSidebar"
import AdminHeader from "@/components/AdminHeader"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
