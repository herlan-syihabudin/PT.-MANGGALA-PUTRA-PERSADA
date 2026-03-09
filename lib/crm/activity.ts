import { google } from "googleapis"
import { nanoid } from "nanoid"

/* ================= TYPES ================= */
export type ActivityType = 
  | "STATUS_CHANGE"
  | "NOTE_ADDED"
  | "ASSIGNMENT_CHANGE"
  | "VALUE_CHANGE"
  | "DOCUMENT_UPLOAD"
  | "COMMENT"
  | "RAB_CREATED"
  | "PROPOSAL_CREATED"
  | "PROJECT_CREATED"

export type ActivityParams = {
  inquiry_id: string
  type: ActivityType
  description: string
  old_value?: string | number
  new_value?: string | number
  created_by?: string
}

/* ================= CONSTANTS ================= */
const ACTIVITY_COLUMNS = {
  LOG_ID: 0,      // A
  INQUIRY_ID: 1,  // B
  TYPE: 2,        // C
  DESCRIPTION: 3, // D
  OLD_VALUE: 4,   // E
  NEW_VALUE: 5,   // F
  CREATED_AT: 6,  // G
  CREATED_BY: 7,  // H
  MODULE,
REFERENCE_ID
} as const

const RETRYABLE_CODES = [408, 429, 502, 503]

if (retries > 0 && RETRYABLE_CODES.includes(Number(code))) {

/* ================= ENVIRONMENT VALIDATION ================= */
function validateEnvironment() {
  const required = [
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GSHEET_CRM_ID'
  ] as const
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

validateEnvironment()

/* ================= GOOGLE AUTH ================= */
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
)

const sheets = google.sheets({ version: "v4", auth })
const CRM_SHEET_ID = process.env.GSHEET_CRM_ID!
const ACTIVITY_SHEET = "CRM_ACTIVITY_LOG"

/* ================= HELPERS ================= */
const logger = {
  info: (message: string, data: any = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...data
    }))
  },
  error: (message: string, error: any, data: any = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: {
        message: error?.message,
        code: error?.code
      },
      ...data
    }))
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    const code = error.code || error.response?.status
    if (retries > 0 && RETRYABLE_CODES.includes(code)) {
      const delay = 1000 * (4 - retries)
      await new Promise(resolve => setTimeout(resolve, delay))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}

function createActivityRow(params: ActivityParams): string[][] {
  const row = new Array(8).fill("")
  
  row[ACTIVITY_COLUMNS.LOG_ID] = "LOG-" + nanoid(6).toUpperCase()
  row[ACTIVITY_COLUMNS.INQUIRY_ID] = params.inquiry_id
  row[ACTIVITY_COLUMNS.TYPE] = params.type
  row[ACTIVITY_COLUMNS.DESCRIPTION] = params.description
  row[ACTIVITY_COLUMNS.OLD_VALUE] = String(params.old_value || "")
  row[ACTIVITY_COLUMNS.NEW_VALUE] = String(params.new_value || "")
  row[ACTIVITY_COLUMNS.CREATED_AT] = new Date().toISOString()
  row[ACTIVITY_COLUMNS.CREATED_BY] = params.created_by || "System"
  
  return [row]
}

/* ================= MAIN FUNCTION ================= */
export async function appendActivity(params: ActivityParams): Promise<{ success: boolean; error?: any }> {
  try {
    logger.info('Appending activity', { 
      inquiry_id: params.inquiry_id,
      type: params.type 
    })

    const rows = createActivityRow(params)

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: CRM_SHEET_ID,
        range: `${ACTIVITY_SHEET}!A:H`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: rows }
      })
    )

    logger.info('Activity appended successfully', { 
      inquiry_id: params.inquiry_id,
      type: params.type 
    })

    return { success: true }

  } catch (error: any) {
    logger.error('Failed to append activity', error, { 
      inquiry_id: params.inquiry_id,
      type: params.type 
    })

    // Map error codes
    const errorMessages: Record<number, string> = {
      404: "Sheet tidak ditemukan",
      403: "Akses ke Google Sheets ditolak",
      429: "Terlalu banyak request",
    }

    const code = error.code || error.response?.status
const userMessage = errorMessages[code] || "Gagal mencatat aktivitas"
    
    // Return error tapi jangan throw
    return { 
      success: false, 
      error: { 
        message: userMessage,
        code: error.code 
      } 
    }
  }
}

/* ================= CONVENIENCE FUNCTIONS ================= */
export async function logStatusChange(
  inquiry_id: string,
  oldStatus: string,
  newStatus: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "STATUS_CHANGE",
    description: `Status berubah dari ${oldStatus} ke ${newStatus}`,
    old_value: oldStatus,
    new_value: newStatus,
    created_by
  })
}

export async function logNoteAdded(
  inquiry_id: string,
  note: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "NOTE_ADDED",
    description: `Catatan ditambahkan: ${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`,
    new_value: note,
    created_by
  })
}

export async function logAssignmentChange(
  inquiry_id: string,
  oldAssignee: string,
  newAssignee: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "ASSIGNMENT_CHANGE",
    description: `Penugasan berubah dari ${oldAssignee || 'unassigned'} ke ${newAssignee || 'unassigned'}`,
    old_value: oldAssignee || 'unassigned',
    new_value: newAssignee || 'unassigned',
    created_by
  })
}

export async function logValueChange(
  inquiry_id: string,
  oldValue: number,
  newValue: number,
  created_by?: string
) {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  })

  return appendActivity({
    inquiry_id,
    type: "VALUE_CHANGE",
    description: `Nilai berubah dari ${formatter.format(oldValue)} ke ${formatter.format(newValue)}`,
    old_value: oldValue,
    new_value: newValue,
    created_by
  })
}

export async function logRABCreated(
  inquiry_id: string,
  rab_id: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "RAB_CREATED",
    description: `RAB dibuat dengan ID: ${rab_id}`,
    new_value: rab_id,
    created_by
  })
}

export async function logProposalCreated(
  inquiry_id: string,
  proposal_id: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "PROPOSAL_CREATED",
    description: `Proposal dibuat dengan ID: ${proposal_id}`,
    new_value: proposal_id,
    created_by
  })
}

export async function logProjectCreated(
  inquiry_id: string,
  project_id: string,
  created_by?: string
) {
  return appendActivity({
    inquiry_id,
    type: "PROJECT_CREATED",
    description: `Project dibuat dengan ID: ${project_id}`,
    new_value: project_id,
    created_by
  })
}
