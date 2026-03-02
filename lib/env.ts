export function getEnv() {
  const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GSHEET_HR_ID,
    GSHEET_CRM_ID,
    GSHEET_ESTIMATOR_ID,
    GSHEET_PROCUREMENT_ID,
  } = process.env

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google credentials")
  }

  return {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY,
    GSHEET_HR_ID: GSHEET_HR_ID || "",
    GSHEET_CRM_ID: GSHEET_CRM_ID || "",
    GSHEET_ESTIMATOR_ID: GSHEET_ESTIMATOR_ID || "",
    GSHEET_PROCUREMENT_ID: GSHEET_PROCUREMENT_ID || "",
  }
}
