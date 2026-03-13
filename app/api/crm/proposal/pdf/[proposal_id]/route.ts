export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import { quotationTemplate } from "@/lib/templates/quotation/quotationTemplate"
chromium.setGraphicsMode = false

export async function GET(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {
  console.log("=== PDF GENERATION DEBUG ===")
  console.log("1. Proposal ID:", params.proposal_id)
  console.log("2. NODE_ENV:", process.env.NODE_ENV)

  try {
    // 1. FETCH DATA
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(
      `${baseUrl}/api/crm/proposal/${params.proposal_id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return new Response("Proposal not found", { status: 404 })
    }

    const data = await res.json()

    // 2. GENERATE HTML
    const html = quotationTemplate(data)
    if (!html || html.length < 100) {
      return new Response("Invalid template", { status: 500 })
    }

    // 3. LAUNCH BROWSER
    console.log("3. Launching browser...")
    let browser = null
    
    try {
      // ✅ PASTIKAN CHROMIUM PATH BENAR
      let executablePath;
      try {
        executablePath = await chromium.executablePath();
        console.log("4. Chromium path:", executablePath);
      } catch (pathError) {
        console.error("Failed to get chromium path:", pathError);
        // Fallback untuk development
        if (process.env.NODE_ENV === 'development') {
          executablePath = undefined;
        } else {
          throw pathError;
        }
      }

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: true,
      })
      
      console.log("5. Browser launched")

      const page = await browser.newPage()
      
      // 4. SET CONTENT
      await page.setContent(html, { 
        waitUntil: "domcontentloaded",
        timeout: 30000 
      })
      
      // Tunggu fonts dan images
      await page.evaluateHandle('document.fonts.ready')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 5. GENERATE PDF
      console.log("6. Generating PDF...")
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          bottom: "20px",
          left: "20px",
          right: "20px"
        }
      })
      
      console.log("7. PDF generated, size:", pdfBuffer.length)

      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="proposal-${params.proposal_id}.pdf"`,
          "Content-Length": pdfBuffer.length.toString()
        }
      })

    } catch (browserError: any) {
      console.error("Browser error:", browserError)
      throw browserError
    } finally {
      if (browser) {
        await browser.close()
        console.log("8. Browser closed")
      }
    }

  } catch (error: any) {
    console.error("=== PDF GENERATION ERROR ===")
    console.error(error)
    
    return new Response(JSON.stringify({
      error: "Failed to generate PDF",
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
