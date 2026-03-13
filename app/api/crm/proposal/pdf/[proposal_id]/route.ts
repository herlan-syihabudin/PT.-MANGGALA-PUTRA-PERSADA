import puppeteer from "puppeteer"
import {quotationTemplate} from "@/lib/templates/quotation/quotationTemplate"

export async function GET(req,{params}){

const data = await getProposalData(params.proposal_id)

const html = quotationTemplate(data)

const browser = await puppeteer.launch()

const page = await browser.newPage()

await page.setContent(html)

const pdf = await page.pdf({
format:"A4",
printBackground:true
})

await browser.close()

return new Response(pdf,{
headers:{
"Content-Type":"application/pdf"
}
})

}
