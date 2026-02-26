import { NextResponse } from "next/server"
import { google } from "googleapis"
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, description, category, type, status, notes, items } = body

    const packageId = `PKG-${Date.now()}`
    const now = new Date().toISOString()
    const createdBy = "USER-001" // TODO: Get from session

    // Prepare rows for each item in the package
    const rows = items.map((item: any) => [
      packageId,                    // PACKAGE_ID
      name,                         // PACKAGE_NAME
      `CAT-${category}`,            // CATEGORY_ID (simplified)
      category,                     // CATEGORY
      `SCOPE-${category}`,          // SCOPE_ID (simplified)
      category,                     // SCOPE
      item.jobId,                   // JOB_NAME_ID
      item.jobName,                 // JOB_NAME
      item.unit,                    // UNIT
      0,                            // MATERIAL_PRICE (to be filled later)
      0,                            // LABOUR_PRICE (to be filled later)
      0,                            // TOTAL_PRICE
      status,                       // STATUS
      now,                          // CREATED_AT
      createdBy,                    // CREATED_BY
      now,                          // UPDATED_AT
      createdBy,                    // UPDATED_BY
      notes || ''                   // NOTES
    ])

    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    )

    const sheets = google.sheets({ version: "v4", auth })
    const SHEET_ID = process.env.GSHEET_ESTIMATOR_ID!

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "WORK_LIBRARY!A:R",
      valueInputOption: "RAW",
      requestBody: { values: rows }
    })

    return NextResponse.json({ 
      success: true, 
      package_id: packageId 
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
