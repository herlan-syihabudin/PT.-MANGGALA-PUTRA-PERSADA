"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function SCurveChart({ data }: any) {

  const chartData = {
    labels: data.map((d:any) => d.month),
    datasets: [
      {
        label: "Target (S-Curve)",
        data: data.map((d:any) => d.target),
        borderColor: "rgb(59,130,246)",
        backgroundColor: "rgba(59,130,246,0.1)",
        tension: 0.4
      },
      {
        label: "Actual",
        data: data.map((d:any) => d.actual),
        borderColor: "rgb(16,185,129)",
        backgroundColor: "rgba(16,185,129,0.1)",
        tension: 0.4
      }
    ]
  }

  return (
    <div className="h-64 w-full">
      <Line data={chartData}/>
    </div>
  )
}
