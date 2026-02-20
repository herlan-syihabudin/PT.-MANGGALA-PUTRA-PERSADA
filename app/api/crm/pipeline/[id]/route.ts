import { NextResponse } from "next/server"

/**
 * SIMPLE IN-MEMORY STORE (DEV ONLY)
 * Nanti bisa ganti ke DB / Google Sheet / Postgres
 */
const mockDeals: Record<string, any> = {}

/**
 * GET DEAL
 */
async function getDeal(id: string) {
  const deal = mockDeals[id]

  if (!deal) {
    return null
  }

  return deal
}

/**
 * UPDATE DEAL
 */
async function updateDeal(id: string, data: any) {
  mockDeals[id] = {
    ...(mockDeals[id] || {}),
    ...data,
    pipeline_id: id,
  }

  return mockDeals[id]
}

/**
 * LOCK RAB (DEV SIMULATION)
 */
async function lockRAB(rabId: string) {
  console.log("RAB locked:", rabId)
  return true
}

/**
 * PATCH - UPDATE STAGE
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { stage } = body

    const existingDeal = await getDeal(params.id)

    if (!existingDeal) {
      return NextResponse.json(
        { message: "Deal tidak ditemukan" },
        { status: 404 }
      )
    }

    // ===============================
    // VALID STAGE TRANSITION
    // ===============================
    const validTransitions: Record<string, string[]> = {
      "FOLLOW UP": ["PENAWARAN"],
      "PENAWARAN": ["NEGOSIASI"],
      "NEGOSIASI": ["DEAL", "LOST"],
      "DEAL": [],
      "LOST": [],
    }

    if (
      stage &&
      !validTransitions[existingDeal.stage]?.includes(stage)
    ) {
      return NextResponse.json(
        {
          message: `Transisi tidak valid: dari ${existingDeal.stage} ke ${stage}`,
        },
        { status: 400 }
      )
    }

    // ===============================
    // VALIDASI SYARAT
    // ===============================
    if (stage === "PENAWARAN" && !existingDeal.rab_id) {
      return NextResponse.json(
        { message: "RAB harus ada sebelum masuk PENAWARAN" },
        { status: 400 }
      )
    }

    if (
      stage === "NEGOSIASI" &&
      existingDeal.proposal_status !== "sent"
    ) {
      return NextResponse.json(
        {
          message:
            "Proposal harus sudah dikirim sebelum NEGOSIASI",
        },
        { status: 400 }
      )
    }

    if (
      stage === "DEAL" &&
      existingDeal.proposal_status !== "approved"
    ) {
      return NextResponse.json(
        {
          message:
            "Proposal harus disetujui sebelum DEAL",
        },
        { status: 400 }
      )
    }

    // ===============================
    // LOCK RAB IF DEAL
    // ===============================
    if (stage === "DEAL" && existingDeal.rab_id) {
      await lockRAB(existingDeal.rab_id)
    }

    // ===============================
    // UPDATE
    // ===============================
    const updatedDeal = await updateDeal(params.id, {
      ...existingDeal,
      ...body,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json(updatedDeal)
  } catch (error) {
    console.error("PATCH ERROR:", error)

    return NextResponse.json(
      { message: "Gagal update deal" },
      { status: 500 }
    )
  }
}
