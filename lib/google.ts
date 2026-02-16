import { google } from "googleapis"
import { getEnv } from "./env"

export function getSheetsClient() {
  const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GOOGLE_SHEET_ID,
  } = getEnv()

  const auth = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    undefined,
    GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  )

  const sheets = google.sheets({ version: "v4", auth })

  return {
    sheets,
    sheetId: GOOGLE_SHEET_ID,
  }
}