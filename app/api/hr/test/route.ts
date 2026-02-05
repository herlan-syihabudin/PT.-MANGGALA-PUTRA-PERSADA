import { NextResponse } from "next/server"

export async function GET() {
  const res = await fetch(
    `${process.env.HR_API_URL}?action=employees`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HR_API_TOKEN}`,
      },
      cache: "no-store",
    }
  )

  const data = await res.json()
  return NextResponse.json(data)
}
