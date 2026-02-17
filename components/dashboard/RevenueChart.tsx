"use client"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 800 },
  { name: "Mar", value: 1200 },
  { name: "Apr", value: 900 },
  { name: "May", value: 1500 },
]

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
      <h3 className="font-bold text-lg mb-4">
        Revenue Trend
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
