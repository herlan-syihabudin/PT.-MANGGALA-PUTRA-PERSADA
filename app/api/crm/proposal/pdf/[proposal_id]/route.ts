import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import { quotationTemplate } from "@/lib/templates/quotation/quotationTemplate"

export async function GET(
  req: Request,
  { params }: { params: { proposal_id: string } }
) {
  // ===== DEBUGGING =====
  console.log("=== PDF GENERATION DEBUG ===")
  console.log("1. Proposal ID:", params.proposal_id)

  try {
    // 1. FETCH DATA
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    console.log("2. Base URL:", baseUrl)

    const res = await fetch(
      `${baseUrl}/api/crm/proposal/${params.proposal_id}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      console.error("3. Fetch failed:", res.status)
      return new Response("Proposal not found", { status: 404 })
    }

    const data = await res.json()
    console.log("4. Data received:", {
      proposal_id: data.proposal_id,
      customer: data.customer_name,
      hasData: !!data
    })

    // 2. GENERATE HTML
    const html = quotationTemplate(data)
    console.log("5. HTML length:", html?.length || 0)
    
    if (!html || html.length < 100) {
      console.error("HTML terlalu pendek:", html)
      return new Response("Invalid template", { status: 500 })
    }

    // 3. SAVE HTML KE FILE (UNTUK DEBUG - OPSIONAL)
    // await writeFileSync(`/tmp/debug-${params.proposal_id}.html`, html)

    // 4. LAUNCH BROWSER
    console.log("6. Launching browser...")
    let browser = null
    
    try {
      // Development vs Production
      const isDev = process.env.NODE_ENV === 'development'
      
      browser = await puppeteer.launch({
        args: isDev ? [] : chromium.args,
        executablePath: isDev 
          ? undefined // Pakai puppeteer biasa di dev
          : await chromium.executablePath(),
        defaultViewport: { width: 1200, height: 800 },
        headless: true,
      })
      
      console.log("7. Browser launched")

      const page = await browser.newPage()
      
      // 5. SET CONTENT DENGAN DEBUG
      console.log("8. Setting page content...")
      
      // Listen to console messages from page
      page.on('console', msg => console.log('PAGE LOG:', msg.text()))
      
      // Listen to page errors
      page.on('pageerror', error => console.log('PAGE ERROR:', error.message))
      
      // Listen to request failed
      page.on('requestfailed', request => 
        console.log('REQUEST FAILED:', request.url(), request.failure())
      )

      await page.setContent(html, { 
        waitUntil: "domcontentloaded", // Lebih cepat dari networkidle0
        timeout: 30000 
      })
      
      console.log("9. Content set")

      // 6. TUNGGU BENTAR UNTUK RENDER
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 7. GENERATE PDF
      console.log("10. Generating PDF...")
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
      
      console.log("11. PDF generated, size:", pdfBuffer.length)

      // 8. SAVE PDF KE FILE (UNTUK DEBUG - OPSIONAL)
      // await writeFileSync(`/tmp/proposal-${params.proposal_id}.pdf`, pdfBuffer)

      return new Response(new Uint8Array(pdfBuffer), {
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
        console.log("12. Browser closed")
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
