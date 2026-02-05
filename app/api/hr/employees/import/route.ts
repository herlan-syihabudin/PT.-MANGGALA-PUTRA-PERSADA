import { NextResponse } from "next/server"
import Papa from "papaparse"

const SCRIPT_URL = process.env.GAS_EMPLOYEE_URL!
const API_TOKEN = process.env.GAS_TOKEN!

function generateEmployeeID(divisi: string) {
  const company = "MPP"
  const year = new Date().getFullYear()
  const divCode = divisi.replace(/\s/g, "").toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `${company}-${divCode}-${year}-${rand}`
}

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
  }

  const text = await file.text()

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    return NextResponse.json({ error: "CSV tidak valid" }, { status: 400 })
  }

  const rows: any[] = parsed.data as any[]

  let success = 0
  let failed: any[] = []

  for (const row of rows) {
    try {
      if (!row.nama_lengkap || !row.divisi || row.nik_ktp?.length !== 16) {
        throw new Error("Data wajib tidak lengkap")
      }

      const payload = {
        action: "add",
        employee_id: generateEmployeeID(row.divisi),
        ...row,
      }

      const res = await fetch(`${SCRIPT_URL}?token=${API_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Gagal simpan")

      success++
    } catch (err: any) {
      failed.push({
        nama: row.nama_lengkap,
        error: err.message,
      })
    }
  }

  return NextResponse.json({
    total: rows.length,
    success,
    failed,
  })
}
