import { motion } from "framer-motion"

type StatusItemProps = {
  label: string
  value: number
  total?: number
  variant?:
    | "new"
    | "followup"
    | "survey"
    | "offer"
    | "deal"
    | "lost"
}

export default function StatusItem({
  label,
  value,
  total = 10,
  variant = "new",
}: StatusItemProps) {
  const percent = total > 0 
  ? Math.min((value / total) * 100, 100) 
  : 0

  const variantStyle: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    followup: "bg-indigo-50 text-indigo-700",
    survey: "bg-yellow-50 text-yellow-700",
    offer: "bg-orange-50 text-orange-700",
    deal: "bg-green-50 text-green-700",
    lost: "bg-red-50 text-red-700",
  }

  const barColor: Record<string, string> = {
    new: "bg-blue-500",
    followup: "bg-indigo-500",
    survey: "bg-yellow-500",
    offer: "bg-orange-500",
    deal: "bg-green-500",
    lost: "bg-red-500",
  }

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">

      {/* GOLD ACCENT */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-t-xl" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${variantStyle[variant]}`}
        >
          {label}
        </span>
        <span className="font-bold text-gray-900 text-sm">
          {value}
        </span>
      </div>

     {/* PROGRESS BAR */}
<div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${percent}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={`h-full ${barColor[variant]}`}
  />
</div>

      {/* FOOTNOTE */}
      <p className="text-[11px] text-gray-400 mt-2">
        {value} dari {total} data
      </p>
    </div>
  )
}
