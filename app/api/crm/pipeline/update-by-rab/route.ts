import { NextResponse } from "next/server"
import { updateRow } from "@/lib/googleSheet"

export async function POST(req: Request) {
  const body = await req.json()

  const { inquiry_id, rab_id, estimated_value } = body

  // cari pipeline berdasarkan inquiry_id
  // update stage jadi PENAWARAN
  // isi rab_id
  // isi estimated_value
  // update updated_at

  await updateRow("SALES_PIPELINE", {
    findBy: "pipeline_id",
    value: inquiry_id,
    update: {
      stage: "PENAWARAN",
      rab_id,
      estimated_value,
      updated_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({ success: true })
}
