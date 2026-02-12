"use client"

import { useRouter } from "next/navigation"

export default function ConvertButton({ inquiry_id }: { inquiry_id: string }) {
  const router = useRouter()

  const handleConvert = async () => {
    try {
      const res = await fetch("/api/estimator/rab/from-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry_id }),
      })

      const result = await res.json()

      if (!res.ok) throw new Error()

      router.push(`/admin/estimator/rab/${result.rab_id}`)
    } catch (err) {
      alert("Gagal convert inquiry")
    }
  }

  return (
    <button
      onClick={handleConvert}
      className="text-xs text-green-600"
    >
      Convert
    </button>
  )
}
