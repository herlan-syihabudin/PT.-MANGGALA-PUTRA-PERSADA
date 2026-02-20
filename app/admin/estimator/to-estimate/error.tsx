"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("To Estimate Page Error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white border border-rose-200 rounded-xl p-8 max-w-md text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          Gagal Memuat Data
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          {error.message || "Terjadi kesalahan saat memuat data"}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
