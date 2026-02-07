"use client"
import { useEffect, useState } from "react"

function Node({ node }: any) {
  return (
    <li className="ml-4 mt-2">
      <div className="rounded border px-3 py-2 bg-white">
        <div className="font-semibold">{node.nama_lengkap}</div>
        <div className="text-xs text-gray-500">
          {node.jabatan} • {node.divisi}
        </div>
      </div>

      {node.children?.length > 0 && (
        <ul className="border-l ml-3 pl-3">
          {node.children.map((c: any) => (
            <Node key={c.employee_id} node={c} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function OrganizationTreePage() {
  const [tree, setTree] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/hr/organization/tree", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setTree(d.data || []))
  }, [])

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Organization Tree
      </h1>

      <ul>
        {tree.map(n => (
          <Node key={n.employee_id} node={n} />
        ))}
      </ul>
    </section>
  )
}
