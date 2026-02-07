"use client"

import { useEffect, useState } from "react"

type ProjectProgress = {
  project_id: string
  project_name: string
  start_date: string
  end_date: string
  status: string
  progress: {
    mep: number
    civil: number
    steel: number
    interior: number
    overall: number
  }
}

export default function ScheduleProgressPage() {
  const [data, setData] = useState<ProjectProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects/progress", { cache: "no-store" })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Schedule &amp; Progress</h1>

      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Project</th>
              <th>MEP</th>
              <th>Civil</th>
              <th>Steel</th>
              <th>Interior</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.project_id} className="border-t">
                <td className="p-3 font-medium">{p.project_name}</td>

                <ProgressCell value={p.progress.mep} />
                <ProgressCell value={p.progress.civil} />
                <ProgressCell value={p.progress.steel} />
                <ProgressCell value={p.progress.interior} />

                <td className="text-center font-bold">
                  {p.progress.overall}%
                </td>

                <td className="text-center">
                  <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProgressCell({ value }: { value: number }) {
  return (
    <td className="p-3 w-32">
      <div className="w-full bg-gray-200 rounded h-2">
        <div
          className="bg-green-600 h-2 rounded"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-xs text-center mt-1">{value}%</div>
    </td>
  )
}
