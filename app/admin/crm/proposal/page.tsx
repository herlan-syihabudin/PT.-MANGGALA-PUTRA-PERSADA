"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText } from "lucide-react"

type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  total_value: number
  status: string
  created_at: string
}

export default function ProposalPage() {
  const [data, setData] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/crm/proposal")
      const json = await res.json()
      setData(json)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-10">Loading Proposal...</div>
  }

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-8">Proposal List</h1>

      <div className="bg-white border rounded-2xl p-6">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Proposal ID</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.proposal_id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <Link
                    href={`/crm/proposal/${p.proposal_id}`}
                    className="text-blue-600 font-semibold"
                  >
                    {p.proposal_id}
                  </Link>
                </td>
                <td className="p-3">
                  Rp {p.total_value.toLocaleString("id-ID")}
                </td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
