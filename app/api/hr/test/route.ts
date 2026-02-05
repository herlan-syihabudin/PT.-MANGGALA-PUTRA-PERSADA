import { NextResponse } from "next/server"

export async function GET() {
  const url =
    `${process.env.HR_API_URL}?action=employees&token=${process.env.HR_API_TOKEN}`

  const res = await fetch(url, { cache: "no-store" })
  const data = await res.json()

  return NextResponse.json(data)
}
