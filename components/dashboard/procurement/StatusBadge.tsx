type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "ORDERED"
type POStatus = "DRAFT" | "SENT" | "CONFIRMED" | "DELIVERED" | "CLOSED"
type GRStatus = "RECEIVED" | "PARTIAL"
type VendorStatus = "ACTIVE" | "INACTIVE"

type StatusType = "pr" | "po" | "gr" | "vendor"

interface StatusBadgeProps {
  status: string
  type?: StatusType
  size?: "sm" | "md"
  dot?: boolean
}

const STATUS_MAP: Record<StatusType, Record<string, string>> = {
  pr: {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    ORDERED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  po: {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    DELIVERED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    CLOSED: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  },
  gr: {
    RECEIVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    PARTIAL: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  vendor: {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
}

export default function StatusBadge({
  status,
  type = "pr",
  size = "sm",
  dot = false,
}: StatusBadgeProps) {
  const normalizedStatus = String(status).toUpperCase()

  const style =
    STATUS_MAP[type]?.[normalizedStatus] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"

  const sizeClass =
    size === "md"
      ? "px-3 py-1.5 text-sm"
      : "px-2 py-1 text-xs"

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${style}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {normalizedStatus}
    </span>
  )
}
