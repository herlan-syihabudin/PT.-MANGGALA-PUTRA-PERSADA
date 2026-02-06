import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type StatusRow = {
  employee_id: string
  status: string
  jenis_status: string
  lokasi_kerja: string
  start_date: string
  end_date: string
  is_current: string
  created_at: string
  updated_by: string
  keterangan: string
}

async function getStatus(employee_id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hr/employment-status?employee_id=${employee_id}`,
    { cache: "no-store" }
  )

  if (!res.ok) return null
  return res.json()
}

export default async function EmploymentStatusDetail({
  params,
}: {
  params: { employee_id: string }
}) {
  const data = await getStatus(params.employee_id)

  if (!data) return notFound()

  const rows: StatusRow[] = data.data || []

  return (
    <section className="p-6 md:p-10 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Employment Status
        </h1>
        <p className="text-sm text-gray-500">
          Riwayat status kerja karyawan
        </p>
      </div>

      {/* EMPLOYEE INFO */}
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Employee ID</p>
        <p className="font-semibold text-gray-900">
          {params.employee_id}
        </p>
      </div>

      {/* TIMELINE */}
      <div className="bg-white border rounded-xl divide-y">
        {rows.length === 0 && (
          <p className="p-6 text-sm text-gray-500">
            Belum ada riwayat status
          </p>
        )}

        {rows.map((row, i) => {
          const isActive =
            String(row.is_current).toUpperCase() === "TRUE"

          return (
            <div key={i} className="p-5 flex gap-4">
              <div className="pt-1">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    isActive ? "bg-green-600" : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {row.status}
                  </h3>
                  {isActive && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      AKTIF
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  {row.jenis_status} • {row.lokasi_kerja}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {row.start_date}
                  {row.end_date && ` → ${row.end_date}`}
                </p>

                {row.keterangan && (
                  <p className="text-xs text-gray-400 mt-1">
                    {row.keterangan}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
