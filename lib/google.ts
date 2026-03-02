import { google } from "googleapis"
import { getEnv } from "./env"

function createClient(sheetId: string) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY } = getEnv()

  const auth = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  const sheets = google.sheets({ version: "v4", auth })

  return {
    sheets,
    sheetId,
  }
}

/* ===== MODULE CLIENTS ===== */

export function getHRClient() {
  const { GSHEET_HR_ID } = getEnv()
  return createClient(GSHEET_HR_ID)
}

export function getCRMClient() {
  const { GSHEET_CRM_ID } = getEnv()
  return createClient(GSHEET_CRM_ID)
}

export function getEstimatorClient() {
  const { GSHEET_ESTIMATOR_ID } = getEnv()
  return createClient(GSHEET_ESTIMATOR_ID)
}

export function getProcurementClient() {
  const { GSHEET_PROCUREMENT_ID } = getEnv()
  return createClient(GSHEET_PROCUREMENT_ID)
}
