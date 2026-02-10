"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function EditRabItemPage({
  params,
}: {
  params: { project_id: string }
}) {
  const router = useRouter()
  const row = useSearchParams().get("row")

  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/estimator/rab?project_id=${params.project_id}`)
      .then((r) => r.json())
      .then((d) => {
        const item = d.items.find((i: any) => String(i.row) === row)
        setForm(item)
      })
  }, [])

  if (!form) return null

  function onChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function save() {
    await fetch("/api/estimator/rab", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        row: form.row,
        project_id: params.project_id,
        ...form,
        volume: Number(form.volume),
        material_price: Number(form.material_price),
        labour_price: Number(form.labour_price),
      }),
    })

    router.push(`/admin/projects/${params.project_id}/rab`)
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-lg font-semibold">Edit Item RAB</h1>

      {["scope","item_name","category","volume","unit","material_price","labour_price"].map((k) => (
        <input
          key={k}
          name={k}
          value={form[k]}
          onChange={onChange}
          className="w-full border px-3 py-2 text-sm rounded"
        />
      ))}

      <button
        onClick={save}
        className="px-4 py-2 bg-blue-600 text-white text-xs rounded"
      >
        Simpan Perubahan
      </button>
    </div>
  )
}
