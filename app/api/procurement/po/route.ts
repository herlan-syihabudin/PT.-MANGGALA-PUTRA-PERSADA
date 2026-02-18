import { NextResponse } from "next/server"
import { google } from "googleapis"
import { nanoid } from "nanoid"

export const dynamic = "force-dynamic"

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const SHEET_ID = process.env.GSHEET_PROCUREMENT_ID!
const PO_SHEET = "PURCHASE_ORDER"
const PO_ITEM_SHEET = "PO_ITEMS"
const PR_SHEET = "PURCHASE_REQUEST"
const VENDOR_SHEET = "VENDORS"
const PROJECT_SHEET = "PROJECTS"

type PO = {
  po_id: string
  po_code: string
  vendor_id: string
  project_id: string
  pr_id?: string
  order_date: string
  delivery_date?: string
  status: "DRAFT" | "SENT" | "CONFIRMED" | "DELIVERED" | "CLOSED"
  notes?: string
  total_amount: number
  created_by?: string
  updated_by?: string
  deleted_by?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

type POItem = {
  po_item_id: string
  po_id: string
  material_id?: string
  description: string
  qty: number
  unit: string
  unit_price: number
  subtotal: number
}

// Helper: Validate vendor exists
async function validateVendor(vendor_id: string): Promise<boolean> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${VENDOR_SHEET}!A2:A`,
  })
  const vendors = (res.data.values || []).map(r => r[0])
  return vendors.includes(vendor_id)
}

// Helper: Validate PR exists and get its status
async function validatePR(pr_id: string): Promise<{ exists: boolean; status: string }> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PR_SHEET}!A2:G`,
  })
  const rows = res.data.values || []
  const pr = rows.find(r => r[0] === pr_id && !r[14])
  
  if (!pr) return { exists: false, status: "" }
  return { exists: true, status: pr[6] || "" }
}

// Helper: Validate project exists
async function validateProject(project_id: string): Promise<boolean> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${PROJECT_SHEET}!A2:A`,
  })
  const projects = (res.data.values || []).map(r => r[0])
  return projects.includes(project_id)
}

// Valid status transitions
const VALID_PO_STATUS_TRANSITIONS: Record<string, string[]> = {
  "DRAFT": ["SENT"],
  "SENT": ["CONFIRMED"],
  "CONFIRMED": ["DELIVERED"],
  "DELIVERED": ["CLOSED"],
  "CLOSED": [],
}

// ==================== GET ALL POs ====================
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const vendor_id = searchParams.get('vendor_id')
    const project_id = searchParams.get('project_id')
    const includeDeleted = searchParams.get('include_deleted') === 'true'

    const poRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!A2:P`,
    })

    let poRows = poRes.data.values || []
    
    // Filter out deleted
    if (!includeDeleted) {
      poRows = poRows.filter(r => !r[15]) // kolom P = deleted_at
    }

    const pos: PO[] = poRows.map(r => ({
      po_id: r[0] || "",
      po_code: r[1] || "",
      vendor_id: r[2] || "",
      project_id: r[3] || "",
      pr_id: r[4] || undefined,
      order_date: r[5] || new Date().toISOString(),
      delivery_date: r[6] || undefined,
      status: r[7] as PO["status"] || "DRAFT",
      notes: r[8] || undefined,
      total_amount: Number(r[9] || 0),
      created_by: r[10] || undefined,
      updated_by: r[11] || undefined,
      deleted_by: r[12] || undefined,
      created_at: r[13] || "",
      updated_at: r[14] || "",
      deleted_at: r[15] || null,
    }))

    // Apply filters
    let filtered = pos
    if (status) {
      filtered = filtered.filter(p => p.status === status)
    }
    if (vendor_id) {
      filtered = filtered.filter(p => p.vendor_id === vendor_id)
    }
    if (project_id) {
      filtered = filtered.filter(p => p.project_id === project_id)
    }

    // Fetch items for each PO
    const itemRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PO_ITEM_SHEET}!A2:J`,
    })
    const itemRows = itemRes.data.values || []
    
    const itemsByPO = itemRows.reduce((acc, r) => {
      const po_id = r[1]
      if (!acc[po_id]) acc[po_id] = []
      acc[po_id].push({
        po_item_id: r[0] || "",
        po_id: r[1] || "",
        material_id: r[2] || undefined,
        description: r[3] || "",
        qty: Number(r[4] || 0),
        unit: r[5] || "",
        unit_price: Number(r[6] || 0),
        subtotal: Number(r[7] || 0),
      })
      return acc
    }, {} as Record<string, POItem[]>)

    const result = filtered.map(po => ({
      ...po,
      items: itemsByPO[po.po_id] || []
    }))

    return NextResponse.json({
      success: true,
      data: result,
      error: null
    })

  } catch (error) {
    console.error("GET POs ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to fetch POs"
    }, { status: 500 })
  }
}

// ==================== CREATE PO ====================
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.po_code) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "po_code is required"
      }, { status: 400 })
    }
    
    if (!body.vendor_id) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "vendor_id is required"
      }, { status: 400 })
    }

    if (!body.project_id) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "project_id is required"
      }, { status: 400 })
    }

    // Validate vendor exists
    const vendorExists = await validateVendor(body.vendor_id)
    if (!vendorExists) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Vendor not found"
      }, { status: 400 })
    }

    // Validate project exists
    const projectExists = await validateProject(body.project_id)
    if (!projectExists) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "Project not found"
      }, { status: 400 })
    }

    // Validate PR if provided
    if (body.pr_id) {
      const pr = await validatePR(body.pr_id)
      if (!pr.exists) {
        return NextResponse.json({
          success: false,
          data: null,
          error: "PR not found"
        }, { status: 400 })
      }
      
      // Rule: Cannot create PO without APPROVED PR (unless manual override)
      if (!body.manual_override && pr.status !== "APPROVED") {
        return NextResponse.json({
          success: false,
          data: null,
          error: "PR must be APPROVED before creating PO"
        }, { status: 400 })
      }
    }

    // Check duplicate po_code
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!B2:B`,
    })
    
    const existingCodes = (checkRes.data.values || []).map(r => String(r[0] || "").trim().toLowerCase())
    if (existingCodes.includes(String(body.po_code).trim().toLowerCase())) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "po_code must be unique"
      }, { status: 400 })
    }

    const po_id = "PO-" + nanoid(8).toUpperCase()
    const now = new Date().toISOString()

    // Calculate total amount from items
    let total_amount = 0
    const items = body.items || []
    const createdItems: POItem[] = []

    for (const item of items) {
      if (!item.description) continue
      
      const qty = Number(item.qty || 0)
      const unit_price = Number(item.unit_price || 0)
      const subtotal = qty * unit_price
      total_amount += subtotal
    }

    // Create PO header
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${PO_SHEET}!A:P`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          po_id,
          body.po_code,
          body.vendor_id,
          body.project_id,
          body.pr_id || "",
          body.order_date || now,
          body.delivery_date || "",
          body.status || "DRAFT",
          body.notes || "",
          total_amount,
          body.created_by || "SYSTEM",
          body.created_by || "SYSTEM",
          "",
          now,
          now,
          "",
        ]]
      }
    })

    // Create PO items
    for (const item of items) {
      if (!item.description) continue

      const po_item_id = "POI-" + nanoid(8).toUpperCase()
      const qty = Number(item.qty || 0)
      const unit_price = Number(item.unit_price || 0)
      const subtotal = qty * unit_price

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${PO_ITEM_SHEET}!A:J`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[
            po_item_id,
            po_id,
            item.material_id || "",
            item.description,
            qty,
            item.unit || "",
            unit_price,
            subtotal,
            now,
            now,
          ]]
        }
      })

      createdItems.push({
        po_item_id,
        po_id,
        material_id: item.material_id,
        description: item.description,
        qty,
        unit: item.unit || "",
        unit_price,
        subtotal,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        po_id,
        po_code: body.po_code,
        vendor_id: body.vendor_id,
        project_id: body.project_id,
        pr_id: body.pr_id,
        order_date: body.order_date || now,
        delivery_date: body.delivery_date,
        status: body.status || "DRAFT",
        notes: body.notes,
        total_amount,
        created_by: body.created_by || "SYSTEM",
        updated_by: body.created_by || "SYSTEM",
        created_at: now,
        updated_at: now,
        items: createdItems,
      },
      error: null
    }, { status: 201 })

  } catch (error) {
    console.error("CREATE PO ERROR:", error)
    return NextResponse.json({
      success: false,
      data: null,
      error: "Failed to create PO"
    }, { status: 500 })
  }
}
