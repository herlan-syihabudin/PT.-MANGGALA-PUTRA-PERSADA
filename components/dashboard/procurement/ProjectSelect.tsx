"use client"

import { useEffect, useState } from "react"

interface Project {
  project_id: string
  project_name: string
}

interface ProjectSelectProps {
  value?: string
  onChange: (projectId: string) => void
  required?: boolean
  disabled?: boolean
  label?: string
  error?: string
  helperText?: string
  className?: string
}

export default function ProjectSelect({
  value = "",
  onChange,
  required = false,
  disabled = false,
  label,
  error,
  helperText,
  className = "",
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        const res = await fetch("/api/projects")

        if (!res.ok) {
          throw new Error("Failed to fetch projects")
        }

        const json = await res.json()

        if (mounted) {
          // handle both {success,data} & direct array
          if (json.success && Array.isArray(json.data)) {
            setProjects(json.data)
          } else if (Array.isArray(json)) {
            setProjects(json)
          } else {
            setProjects([])
          }
        }
      } catch (err: any) {
        if (mounted) {
          setFetchError(err.message || "Error loading projects")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const baseStyle =
    "w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2"

  const normalStyle =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-200"

  const errorStyle =
    "border-red-400 focus:border-red-500 focus:ring-red-200"

  const disabledStyle =
    "bg-gray-100 cursor-not-allowed text-gray-500"

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || loading}
        className={`${baseStyle} ${
          error ? errorStyle : normalStyle
        } ${disabled || loading ? disabledStyle : ""}`}
      >
        <option value="">
          {loading
            ? "Loading..."
            : fetchError
            ? "Failed to load projects"
            : "Pilih Project"}
        </option>

        {!loading &&
          !fetchError &&
          projects.map((p) => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_name}
            </option>
          ))}
      </select>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {!error && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  )
}
