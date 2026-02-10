import { google } from "googleapis"

export async function recalcRabProject(
  sheets: any,
  spreadsheetId: string,
  project_id: string
) {
  // ambil semua item
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "RAB_ITEM!A2:N",
  })

  const rows = res.data.values || []

  const items = rows.filter((r: any[]) => r[1] === project_id)

  const total_item = items.length
  const total_nilai_rab = items.reduce(
    (sum, r) => sum + Number(r[10] || 0),
    0
  )

  // ambil RAB_PROJECT
  const rabRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "RAB_PROJECT!A2:G",
  })

  const rabRows = rabRes.data.values || []
  const rowIndex = rabRows.findIndex(
    (r: any[]) => r[1] === project_id
  )

  if (rowIndex === -1) return

  const sheetRow = rowIndex + 2 // offset header

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `RAB_PROJECT!C${sheetRow}:D${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[total_item, total_nilai_rab]],
    },
  })
}
