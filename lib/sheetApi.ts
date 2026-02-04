export const SHEET_API_BASE =
  "https://script.google.com/macros/s/AKfycbxSFbPhTETR76VLJniLtiHrGa_llG7aRSgX7mT4I3j_se3pqKrRSr9nZfUUc0Rgzmxl_g/exec"

export async function fetchSheet(sheet: string) {
  const res = await fetch(`${SHEET_API_BASE}?sheet=${sheet}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Gagal ambil data sheet")
  }

  return res.json()
}
