"use client"

export default function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between sticky top-0 z-40">
      
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          CRM System
        </p>
        <p className="font-semibold text-gray-900">
          PT Manggala Putra Persada
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Admin</span>
        <button
          onClick={() => alert("Logout feature coming soon")}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

    </header>
  )
}
