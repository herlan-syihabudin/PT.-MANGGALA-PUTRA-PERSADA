import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import { quotationTemplate } from "@/lib/templates/quotation/quotationTemplate"

export async function GET(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

const res = await fetch(
  `${baseUrl}/api/crm/proposal/${params.proposal_id}`,
  { cache: "no-store" }
)

const data = await res.json()

const html = quotationTemplate(data)

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  defaultViewport: chromium.defaultViewport,
  headless: true
})

const page = await browser.newPage()

await page.setContent(html, { waitUntil: "networkidle0" })

const pdf = await page.pdf({
  format: "A4",
  printBackground: true
})

await browser.close()

return new Response(pdf,{
  headers:{
    "Content-Type":"application/pdf",
    "Content-Disposition":`inline; filename="proposal-${params.proposal_id}.pdf"`
  }
})

}
