'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Search, RefreshCw, AlertCircle } from 'lucide-react'

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
  placeholder?: string
  allowAll?: boolean
  allowNone?: boolean
  showSearch?: boolean
  className?: string
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let projectsCache: { data: Project[]; timestamp: number } | null = null

export default function ProjectSelect({
  value = "",
  onChange,
  required = false,
  disabled = false,
  label,
  error,
  helperText,
  placeholder,
  allowAll = false,
  allowNone = false,
  showSearch = true,
  className = "",
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  // Load projects with cache
  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function load() {
      // Check cache first
      if (projectsCache && Date.now() - projectsCache.timestamp < CACHE_TTL) {
        if (mounted) {
          setProjects(projectsCache.data)
          setLoading(false)
          setFetchError(null)
        }
        return
      }

      try {
        setLoading(true)
        setFetchError(null)

        const res = await fetch("/api/projects", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch projects (${res.status})`)
        }

        const json = await res.json()

        if (!mounted) return

        let projectList: Project[] = []

        // Handle different response formats
        if (json.success && Array.isArray(json.data)) {
          projectList = json.data
        } else if (Array.isArray(json)) {
          projectList = json
        } else {
          projectList = []
        }

        // Sort by name
        projectList.sort((a, b) => 
          a.project_name.localeCompare(b.project_name)
        )

        setProjects(projectList)
        projectsCache = { data: projectList, timestamp: Date.now() }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        if (mounted) {
          setFetchError(err?.message || "Error loading projects")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [retryKey])

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!search.trim() || !showSearch) return projects
    
    const searchLower = search.toLowerCase()
    return projects.filter(p => 
      p.project_name.toLowerCase().includes(searchLower) ||
      p.project_id.toLowerCase().includes(searchLower)
    )
  }, [projects, search, showSearch])

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1)
  }, [])

  // Base styles
  const baseStyle = "w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2"
  const normalStyle = "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
  const errorStyle = "border-red-400 focus:border-red-500 focus:ring-red-200"
  const disabledStyle = "bg-gray-100 cursor-not-allowed text-gray-500"

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Search Input */}
      {showSearch && !loading && !fetchError && projects.length > 5 && (
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}

      {/* Select Dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || loading || !!fetchError}
        className={`${baseStyle} ${
          error ? errorStyle : normalStyle
        } ${disabled || loading || fetchError ? disabledStyle : ""}`}
      >
        {/* Placeholder Option */}
        <option value="">
          {loading 
            ? "⏳ Loading projects..."
            : fetchError 
            ? "❌ Failed to load"
            : placeholder || "Pilih Project"}
        </option>

        {/* Special Options */}
        {allowNone && !loading && !fetchError && (
          <option value="">--- None ---</option>
        )}
        
        {allowAll && !loading && !fetchError && (
          <option value="ALL">--- All Projects ---</option>
        )}

        {/* Project Options */}
        {!loading && !fetchError && filteredProjects.map((p) => (
          <option key={p.project_id} value={p.project_id}>
            {p.project_name} {p.project_id && `(${p.project_id.slice(0, 8)})`}
          </option>
        ))}

        {/* No Results */}
        {!loading && !fetchError && filteredProjects.length === 0 && (
          <option value="" disabled>
            No projects found
          </option>
        )}
      </select>

      {/* Error State */}
      {fetchError && (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={12} />
          <span>{fetchError}</span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded hover:bg-red-100"
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      )}

      {/* Validation Error */}
      {error && !fetchError && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {!error && !fetchError && helperText && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {/* Items Count */}
      {!loading && !fetchError && projects.length > 0 && (
        <p className="text-xs text-gray-400">
          {filteredProjects.length} of {projects.length} projects
          {filteredProjects.length !== projects.length && " (filtered)"}
        </p>
      )}
    </div>
  )
}

// ========== UTILITY HOOK ==========
export function useProjectSelect(initialValue: string = "") {
  const [projectId, setProjectId] = useState(initialValue)
  const [projectName, setProjectName] = useState("")

  // Load project name when ID changes
  useEffect(() => {
    if (!projectId || projectId === "ALL") {
      setProjectName("")
      return
    }

    async function loadProjectName() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (!res.ok) return
        
        const data = await res.json()
        setProjectName(data.project_name || data.name || "")
      } catch {
        // Silently fail
      }
    }

    loadProjectName()
  }, [projectId])

  return {
    projectId,
    projectName,
    setProjectId,
    clear: () => setProjectId(""),
  }
}
