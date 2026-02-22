// app/admin/crm/page.tsx
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function CRMIndexPage() {
  redirect("/admin/crm/inquiry")
}
