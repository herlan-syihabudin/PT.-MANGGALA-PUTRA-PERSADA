"use client"

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
  ChartOptions
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

type MonthlyProgress = {
  month: string
  target: number
  actual: number
}

export default function SCurveChart({ data }: { data: MonthlyProgress[] }) {
  // Validasi data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-400">No progress data available</p>
      </div>
    )
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Target (S-Curve)",
        data: data.map((d) => d.target),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Actual Progress",
        data: data.map((d) => d.actual),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  import type { ChartOptions } from "chart.js"

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.8)",
      titleColor: "white",
      bodyColor: "white",
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context) => {
          const label = context.dataset.label || ""
          const value = context.raw || 0
          return `${label}: ${value}%`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: "rgba(0,0,0,0.05)",
      },
      title: {
        display: true,
        text: "Progress (%)",
        color: "rgb(107,114,128)",
        font: {
          size: 11,
          weight: 500,
        },
      },
      ticks: {
        callback: (value) => `${value}%`,
      },
    },
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: "Timeline",
        color: "rgb(107,114,128)",
        font: {
          size: 11,
          weight: 500,
        },
      },
    },
  },
}

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}
