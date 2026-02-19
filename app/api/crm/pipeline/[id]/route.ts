// app/api/crm/pipeline/[id]/route.ts - PATCH
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { stage } = body
    
    // 1. Get existing deal
    const existingDeal = await getDeal(params.id)
    
    // 2. VALIDASI STAGE TRANSITION
    const validTransitions: Record<string, string[]> = {
      "FOLLOW UP": ["PENAWARAN"],
      "PENAWARAN": ["NEGOSIASI"],
      "NEGOSIASI": ["DEAL", "LOST"],
      "DEAL": [],
      "LOST": [],
    }
    
    if (stage && !validTransitions[existingDeal.stage]?.includes(stage)) {
      return NextResponse.json(
        { message: `Transisi tidak valid: dari ${existingDeal.stage} ke ${stage}` },
        { status: 400 }
      )
    }
    
    // 3. VALIDASI SYARAT STAGE
    if (stage === "PENAWARAN" && !existingDeal.rab_id) {
      return NextResponse.json(
        { message: "RAB harus ada sebelum masuk stage PENAWARAN" },
        { status: 400 }
      )
    }
    
    if (stage === "NEGOSIASI" && existingDeal.proposal_status !== "sent") {
      return NextResponse.json(
        { message: "Proposal harus sudah dikirim sebelum negosiasi" },
        { status: 400 }
      )
    }
    
    if (stage === "DEAL" && existingDeal.proposal_status !== "approved") {
      return NextResponse.json(
        { message: "Proposal harus disetujui sebelum DEAL" },
        { status: 400 }
      )
    }
    
    // 4. LOCK RAB jika sudah DEAL
    if (stage === "DEAL" && existingDeal.rab_id) {
      await lockRAB(existingDeal.rab_id) // Set read-only
    }
    
    // 5. Update dengan validasi
    const updatedDeal = await updateDeal(params.id, {
      ...body,
      last_activity_at: new Date().toISOString(), // Update untuk aging
    })
    
    return NextResponse.json(updatedDeal)
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal update deal" },
      { status: 500 }
    )
  }
}
