"use client"

import { useState, useMemo, useEffect } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
} from "recharts"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

function formatCompactIDR(value: number) {
  if (value >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)
    return `Rp ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)
    return `Rp ${(value / 1_000).toFixed(1)}K`
  return `Rp ${value.toLocaleString("id-ID")}`
}

/* ================= DATA ================= */

const monthlyData = [
  { name: "Jan", current: 400_000_000, last: 350_000_000 },
  { name: "Feb", current: 800_000_000, last: 700_000_000 },
  { name: "Mar", current: 1_200_000_000, last: 1_000_000_000 },
  { name: "Apr", current: 900_000_000, last: 950_000_000 },
  { name: "May", current: 1_500_000_000, last: 1_200_000_000 },
]

const weeklyData = [
  { name: "W1", current: 250_000_000, last: 200_000_000 },
  { name: "W2", current: 320_000_000, last: 280_000_000 },
  { name: "W3", current: 410_000_000, last: 390_000_000 },
  { name: "W4", current: 500_000_000, last: 450_000_000 },
]

/* ================= COMPONENT ================= */

export default function RevenueChartPro() {
  const [mode, setMode] = useState<"monthly" | "weekly">("monthly")

  const data = mode === "monthly" ? monthlyData : weeklyData

  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.current, 0),
    [data]
  )

  /* ===== Animated Total Number ===== */

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 60, damping: 20 })
  const rounded = useTransform(spring, (latest) => Math.round(latest))

  useEffect(() => {
    motionValue.set(total)
  }, [total, motionValue])

  /* ===== Tooltip ===== */

  function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-slate-700 shadow-xl rounded-xl px-4 py-3 text-xs font-semibold">
          <div className="mb-1 font-bold">{label}</div>
          <div className="text-blue-500">
            Current: {formatCompactIDR(payload[0].value)}
          </div>
          <div className="text-gray-400">
            Last Year: {formatCompactIDR(payload[1].value)}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative rounded-3xl p-8 shadow-2xl border border-white/30 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl transition-all">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h3>

          <motion.div className="text-4xl font-black mt-2 text-gray-900 dark:text-white tracking-tight">
            <motion.span>
              {formatCompactIDR(rounded.get())}
            </motion.span>
          </motion.div>

          <p className="text-xs text-gray-500 mt-1">
            Total Revenue ({mode})
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setMode("monthly")}
            className={`px-3 py-1 rounded-lg transition ${
              mode === "monthly"
                ? "bg-white dark:bg-slate-700 shadow"
                : "opacity-60"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setMode("weekly")}
            className={`px-3 py-1 rounded-lg transition ${
              mode === "weekly"
                ? "bg-white dark:bg-slate-700 shadow"
                : "opacity-60"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="areaCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />

          <XAxis dataKey="name" strokeOpacity={0.5} />
          <YAxis tickFormatter={(v) => formatCompactIDR(v)} width={80} />

          <Tooltip content={<CustomTooltip />} />

          {/* Area Current */}
          <Area
            type="monotone"
            dataKey="current"
            stroke="none"
            fill="url(#areaCurrent)"
          />

          {/* Current Line */}
          <Line
            type="monotone"
            dataKey="current"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />

          {/* Last Year Line */}
          <Line
            type="monotone"
            dataKey="last"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
