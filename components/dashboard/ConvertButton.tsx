"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ConvertButton({ inquiry_id }: { inquiry_id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    if (loading) return

    try {
      setLoading(true)

      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id }),
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(result.message || "Gagal convert inquiry")
        return
      }

      toast.success("Berhasil convert ke RAB")

      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch (err) {
      toast.error("Terjadi kesalahan saat convert")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleConvert}
      disabled={loading}
      className="text-xs text-green-600 disabled:opacity-40"
    >
      {loading ? "Processing..." : "Convert"}
    </button>
  )
}
