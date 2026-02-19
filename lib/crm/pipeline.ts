// lib/crm/pipeline.ts

export async function getDeal(id: string) {
  // TODO: ganti dengan query ke DB / Google Sheet
  return {
    pipeline_id: id,
    stage: "FOLLOW UP",
    rab_id: "",
    proposal_status: "draft",
  }
}

export async function updateDeal(id: string, data: any) {
  // TODO: update ke DB
  return {
    pipeline_id: id,
    ...data,
  }
}

export async function lockRAB(rabId: string) {
  // TODO: set RAB jadi read-only di DB
  return true
}
