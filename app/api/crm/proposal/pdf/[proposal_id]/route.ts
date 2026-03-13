import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import { quotationTemplate } from "@/lib/templates/quotation/quotationTemplate"

export async function GET(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {

const { proposal_id } = params

const data = await getProposalData(proposal_id)

const html = quotationTemplate(data)

const isDev = process.env.NODE_ENV === "development"

const browser = await puppeteer.launch({
  args: isDev ? [] : chromium.args,
  executablePath: isDev ? undefined : await chromium.executablePath(),
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

return new Response(pdf, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="proposal-${proposal_id}.pdf"`,
    "Cache-Control": "no-store"
  }
})

}
