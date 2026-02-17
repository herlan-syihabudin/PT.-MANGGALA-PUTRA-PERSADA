"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"

type Proposal = {
  proposal_id: string
  pipeline_id: string
  rab_id: string
  total_value: number
  status: string
  created_at: string
}

export default function ProposalDetail({
  params,
}: {
  params: { proposal_id: string }
}) {
  const [proposal, setProposal] = useState<Proposal | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/crm/proposal")
      const json = await res.json()

      const found = json.find(
        (p: Proposal) => p.proposal_id === params.proposal_id
      )

      setProposal(found)
    }

    fetchData()
  }, [params.proposal_id])

  if (!proposal) return notFound()

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-extrabold mb-8">
        {proposal.proposal_id}
      </h1>

      <div className="bg-white border rounded-2xl p-6 space-y-3">
        <p><b>Pipeline:</b> {proposal.pipeline_id}</p>
        <p><b>RAB:</b> {proposal.rab_id}</p>
        <p>
          <b>Total:</b> Rp{" "}
          {proposal.total_value.toLocaleString("id-ID")}
        </p>
        <p><b>Status:</b> {proposal.status}</p>
        <p>
          <b>Date:</b>{" "}
          {new Date(proposal.created_at).toLocaleDateString()}
        </p>
      </div>
    </section>
  )
}
