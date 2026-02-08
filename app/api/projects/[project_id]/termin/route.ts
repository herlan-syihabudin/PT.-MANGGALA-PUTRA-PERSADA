export async function POST(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  try {
    const body = await req.json()
    const {
      termin_no,
      description,
      percent,
      value,
      due_date,
    } = body

    if (!termin_no || !percent || !value) {
      return NextResponse.json(
        { message: "Field wajib belum lengkap" },
        { status: 400 }
      )
    }

    const created_at = new Date().toISOString()

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TERMIN_SHEET}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          params.project_id,
          termin_no,
          description || "",
          percent,
          value,
          "Draft",
          due_date || "",
          "",
          created_at,
        ]],
      },
    })

    return NextResponse.json(
      { message: "Termin berhasil dibuat" },
      { status: 201 }
    )
  } catch (err) {
    console.error("CREATE TERMIN ERROR:", err)
    return NextResponse.json(
      { message: "Gagal membuat termin" },
      { status: 500 }
    )
  }
}
