"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "react-hot-toast"
import { useDebouncedCallback } from "use-debounce"

// ✅ TAMBAHKAN INI
const SCOPES = [
  { key: "mep", label: "MEP" },
  { key: "civil", label: "Civil" },
  { key: "steel", label: "Steel" },
  { key: "interior", label: "Interior" },
] as const

type ScopeKey = typeof SCOPES[number]["key"]

type ScopeProgress = {
  project_id: string
} & Record<ScopeKey, number>

type ValidationError = {
  field: string
  message: string
}

export default function ProjectProgressPage({
  params,
}: {
  params: { project_id: string }
}) {
  const router = useRouter()
  const { project_id } = params

  // Refs for cleanup
  const isMounted = useRef(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(new Map())
  const [initialForm, setInitialForm] = useState<ScopeProgress | null>(null)

  const [form, setForm] = useState<ScopeProgress>({
    project_id,
    mep: 0,
    civil: 0,
    steel: 0,
    interior: 0,
  })

  // Validation function
  const validateField = useCallback((key: string, value: number): string | null => {
    if (isNaN(value)) return "Harus berupa angka"
    if (value < 0) return "Minimal 0%"
    if (value > 100) return "Maksimal 100%"
    if (!Number.isInteger(value) && value.toString().includes('.')) {
      return "Gunakan bilangan bulat"
    }
    return null
  }, [])

  // Debounced validation
  const debouncedValidate = useDebouncedCallback((key: string, value: number) => {
    if (!isMounted.current) return
    
    const error = validateField(key, value)
    setFieldErrors(prev => {
      const newMap = new Map(prev)
      if (error) {
        newMap.set(key, error)
      } else {
        newMap.delete(key)
      }
      return newMap
    })
  }, 300)

  // Validate all fields
  const validateAllFields = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = []
    const fields = SCOPES.map(s => s.key)
    
    fields.forEach(field => {
      const value = form[field]
      const error = validateField(field, value)
      if (error) {
        errors.push({ field, message: error })
      }
    })
    
    return errors
  }, [form, validateField])

  // Check if form has changes
  const hasChanges = useMemo(() => {
    if (!initialForm) return false
    return (
      initialForm.mep !== form.mep ||
      initialForm.civil !== form.civil ||
      initialForm.steel !== form.steel ||
      initialForm.interior !== form.interior
    )
  }, [form, initialForm])

  // Calculate average progress
  const averageProgress = useMemo(() => {
    return (form.mep + form.civil + form.steel + form.interior) / 4
  }, [form])

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true
    
    return () => {
      isMounted.current = false
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Before unload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = '' // Chrome requires returnValue to be set
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Auto-save feature (optional)
  useEffect(() => {
    if (!hasChanges || saving || fieldErrors.size > 0) return
    
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      if (hasChanges && !saving && fieldErrors.size === 0 && isMounted.current) {
        handleSave()
        toast.success("Auto-saved!", { 
          icon: '💾',
          duration: 2000
        })
      }
    }, 5000) // Auto-save after 5 seconds of inactivity
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [form, hasChanges, saving, fieldErrors.size])

  // Fetch existing progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(`/api/projects/${project_id}/progress`, {
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        
        if (!data) {
          throw new Error("No data received")
        }

        const newForm = {
          project_id,
          mep: data.mep_progress ?? 0,
          civil: data.civil_progress ?? 0,
          steel: data.steel_progress ?? 0,
          interior: data.interior_progress ?? 0,
        }

        if (isMounted.current) {
          setForm(newForm)
          setInitialForm(newForm)
        }
      } catch (err) {
        if (isMounted.current) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch progress"
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchProgress()
  }, [project_id])

  // Update form field
  const updateField = useCallback((key: keyof ScopeProgress, value: number) => {
    // Clamp value between 0-100
    const clampedValue = Math.max(0, Math.min(100, Number(value) || 0))
    
    setForm((prev) => ({
      ...prev,
      [key]: clampedValue,
    }))

    // Validate field if it's been touched
    if (touched.has(key)) {
      debouncedValidate(key, clampedValue)
    }
  }, [touched, debouncedValidate])

  // Handle field blur (mark as touched)
  const handleBlur = useCallback((key: string) => {
    setTouched(prev => new Set(prev).add(key))
    
    const error = validateField(key, form[key as keyof ScopeProgress] as number)
    setFieldErrors(prev => {
      const newMap = new Map(prev)
      if (error) {
        newMap.set(key, error)
      } else {
        newMap.delete(key)
      }
      return newMap
    })
  }, [form, validateField])

  // Handle cancel with unsaved changes warning
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (window.confirm("Ada perubahan yang belum disimpan. Yakin ingin keluar?")) {
        router.back()
      }
    } else {
      router.back()
    }
  }, [hasChanges, router])

  // Handle save - MEMOIZED with useCallback
  const handleSave = useCallback(async () => {
    try {
      // Validate all fields before save
      const errors = validateAllFields()
      if (errors.length > 0) {
        errors.forEach(error => {
          toast.error(`${error.field}: ${error.message}`)
        })
        return
      }

      setSaving(true)
      setError(null)

      // Store previous form for potential rollback
      const previousForm = { ...form }

      const res = await fetch(`/api/projects/${project_id}/progress`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mep_progress: form.mep,
          civil_progress: form.civil,
          steel_progress: form.steel,
          interior_progress: form.interior,
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        // Rollback form on error
        if (isMounted.current) {
          setForm(previousForm)
        }
        throw new Error(data?.message || `Gagal menyimpan progress (${res.status})`)
      }

      if (isMounted.current) {
        toast.success("Progress berhasil disimpan!", {
          duration: 3000,
          icon: '✅',
        })

        // Update initial form to match saved state
        setInitialForm(form)

        // Small delay to show success message before redirect
        setTimeout(() => {
          if (isMounted.current) {
            router.push(`/admin/projects/${project_id}`)
          }
        }, 1000)
      }
      
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan server"
        setError(errorMessage)
        toast.error(errorMessage, {
          duration: 5000,
          icon: '❌',
        })
      }
    } finally {
      if (isMounted.current) {
        setSaving(false)
      }
    }
  }, [form, project_id, validateAllFields, router])

  // Keyboard shortcut (Ctrl+S) - with proper dependencies
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        if (!saving && hasChanges && fieldErrors.size === 0) {
          handleSave()
        }
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [saving, hasChanges, fieldErrors.size, handleSave])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data progress...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-red-800">Error Loading Data</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 5000,
            icon: '❌',
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Update Progress Proyek</h1>
                <p className="mt-1 text-sm text-gray-500">
                  ID Proyek: <span className="font-mono">{project_id.slice(0, 8)}...{project_id.slice(-4)}</span>
                </p>
              </div>
              {hasChanges && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <span className="h-2 w-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></span>
                  Belum disimpan
                </span>
              )}
            </div>
          </div>

          {/* Progress Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Ringkasan Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rata-rata Progress</span>
                  <span className="font-medium">{averageProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${averageProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">MEP</div>
                  <div className="text-green-600">{form.mep}%</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">Civil</div>
                  <div className="text-green-600">{form.civil}%</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">Steel</div>
                  <div className="text-green-600">{form.steel}%</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="font-medium">Interior</div>
                  <div className="text-green-600">{form.interior}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
             {SCOPES.map((scope) => {
  const k = scope.key
  const error = fieldErrors.get(k)
  const isTouched = touched.has(k)
  const value = form[k]

  return (
                  <div key={k} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label 
                        htmlFor={`progress-${k}`}
                        className="text-sm font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {scope.label}
                      </label>
                      {isTouched && !error && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Valid
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        id={`progress-${k}`}
                        type="range"
                        min={0}
                        max={100}
                        value={value}
                        onChange={(e) => updateField(k, Number(e.target.value))}
                        onBlur={() => handleBlur(k)}
                        className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer
                          ${error ? 'bg-red-200' : 'bg-gray-200'}`}
                        style={{
                          background: `linear-gradient(to right, 
                            ${error ? '#ef4444' : '#10b981'} 0%, 
                            ${error ? '#ef4444' : '#10b981'} ${value}%, 
                            #e5e7eb ${value}%, 
                            #e5e7eb 100%)`
                        }}
                        aria-label={`Progress ${k}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={value}
                        aria-invalid={!!error}
                      />
                      
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={value}
                          onChange={(e) => updateField(k, Number(e.target.value))}
                          onBlur={() => handleBlur(k)}
                          className={`w-20 border rounded-lg px-3 py-2 text-sm text-right
                            ${error 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                            }
                            focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                          aria-label={`Progress ${k} dalam persen`}
                        />
                        <span className="text-sm text-gray-500 w-4">%</span>
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-8 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Batal
              </button>
              
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || fieldErrors.size > 0 || !hasChanges}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium
                  hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                  flex items-center justify-center gap-2"
                title={!hasChanges ? "Tidak ada perubahan" : fieldErrors.size > 0 ? "Ada error pada form" : "Simpan progress"}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan Progress</span>
                  </>
                )}
              </button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="mt-4 text-xs text-gray-400 text-center">
              <span className="inline-flex items-center gap-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">S</kbd>
                <span>untuk menyimpan</span>
              </span>
              {hasChanges && !saving && fieldErrors.size === 0 && (
                <span className="ml-3 text-green-600">
                  (Auto-save in 5s)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
