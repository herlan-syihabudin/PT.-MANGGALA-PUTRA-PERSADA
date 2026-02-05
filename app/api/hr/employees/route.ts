import { NextRequest, NextResponse } from "next/server"

const SCRIPT_URL = process.env.HR_SCRIPT_URL!
const API_TOKEN = process.env.HR_API_TOKEN!

export async function GET() {
  try {
    const url = `${SCRIPT_URL}?action=employees&token=${API_TOKEN}`

    const res = await fetch(url, { cache: "no-store" })
    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error("HR GET ERROR:", err)
    return NextResponse.json(
      { error: "Failed to fetch employee data" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${SCRIPT_URL}?token=${API_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error || "Failed to save employee" },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("HR POST ERROR:", err)
    return NextResponse.json(
      { error: "Failed to save employee" },
      { status: 500 }
    )
  }
}
