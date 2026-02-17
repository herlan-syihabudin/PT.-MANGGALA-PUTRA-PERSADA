"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import {
  ArrowLeft,
  RefreshCcw,
  CheckCircle2,
  FileText,
  Briefcase,
} from "lucide-react"

type Deal = {
  pipeline_id: string
  customer_id: string
  project_name: string
  stage:
    | "FOLLOW UP"
    | "PENAWARAN"
    | "NEGOSIASI"
    | "DEAL"
    | "ON GOING"
    | "LOST"
  estimated_value: number
  rab_id: string
  proposal_id: string
  created_at: string
  updated_at: string
}

const stageColor: Record<string, string> = {
  "FOLLOW UP": "bg-blue-100 text-blue-700",
  PENAWARAN: "bg-orange-100 text-orange-700",
  NEGOSIASI: "bg-yellow-100 text-yellow-700",
  DEAL: "bg-green-100 text-green-700",
  "ON GOING": "bg-purple-100 text-purple-700",
  LOST: "bg-red-100 text-red-700",
}

function getAgingDays(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function DealDetailPage({
  params,
}: {
  params: { pipeline_id: string }
}) {
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.pipeline_id) return notFound()

    const fetchDeal = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/crm/pipeline/${params.pipeline_id}`
        )
        const json = await res.json()
        setDeal(json)
      } catch (e) {
        console.error("Error fetch deal", e)
      } finally {
        setLoading(false)
      }
    }

    fetchDeal()
  }, [params.pipeline_id])

  const updateStage = async (newStage: Deal["stage"]) => {
    if (!deal) return

    await fetch(`/api/crm/pipeline/${deal.pipeline_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: newStage,
      }),
    })

    setDeal({
      ...deal,
      stage: newStage,
      updated_at: new Date().toISOString(),
    })
  }

  const convertToProject = async () => {
    if (!deal) return

    await fetch("/api/project/create-from-deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pipeline_id: deal.pipeline_id,
      }),
    })

    alert("Deal converted to project 🔥")
  }

  if (loading)
    return (
      <div className="p-10 animate-pulse text-gray-400">
        Loading Deal...
      </div>
    )

  if (!deal) return notFound()

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 mb-3"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="text-2xl font-extrabold text-gray-900">
            {deal.project_name}
          </h1>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${stageColor[deal.stage]}`}
          >
            {deal.stage}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => updateStage("NEGOSIASI")}
            className="px-4 py-2 rounded-lg border bg-white text-sm flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Move Stage
          </button>

          <button
            onClick={convertToProject}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Convert
          </button>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Deal Information</h3>
            <p><b>Pipeline ID:</b> {deal.pipeline_id}</p>
            <p><b>Customer:</b> {deal.customer_id}</p>
            <p>
              <b>Estimated Value:</b> Rp{" "}
              {deal.estimated_value.toLocaleString("id-ID")}
            </p>
            <p>
              <b>Aging:</b> {getAgingDays(deal.updated_at)} hari
            </p>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <h3 className="font-bold mb-4">Documents</h3>

            <div className="flex gap-3">
              {deal.rab_id && (
                <a
                  href={`/rab/${deal.rab_id}`}
                  className="px-4 py-2 rounded-lg border bg-white text-sm flex items-center gap-2"
                >
                  <FileText size={16} />
                  View RAB
                </a>
              )}

              {deal.proposal_id && (
                <a
                  href={`/proposal/${deal.proposal_id}`}
                  className="px-4 py-2 rounded-lg border bg-white text-sm flex items-center gap-2"
                >
                  <Briefcase size={16} />
                  View Proposal
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <h3 className="font-bold mb-4">Timeline</h3>
          <p className="text-sm text-gray-500">
            Created: {new Date(deal.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">
            Updated: {new Date(deal.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </section>
  )
}
