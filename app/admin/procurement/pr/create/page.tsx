'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Upload,
  Download,
  Copy,
  Trash2,
  Plus
} from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { toast } from 'sonner'

import ProjectSelect from '@/components/dashboard/procurement/ProjectSelect'
import ItemsEditor, { Item } from '@/components/dashboard/procurement/ItemsEditor'
import Money from '@/components/dashboard/procurement/Money'
import { formatIDR, parseIDR } from '@/lib/format'

// ========== TYPES ==========
interface LoadingState {
  submit: boolean
  draft: boolean
  template: boolean
  reference: boolean
  project: boolean
  budget: boolean
}

interface ErrorState {
  project: string | null
  budget: string | null
  template: string | null
  reference: string | null
  submit: string | null
}

// ========== MAIN COMPONENT ==========
export default function CreatePRPage() {
  const router = useRouter()

  // States
  const [loading, setLoading] = useState<LoadingState>({
    submit: false,
    draft: false,
    template: false,
    reference: false,
    project: false,
    budget: false
  })
  
  const [errors, setErrors] = useState<ErrorState>({
    project: null,
    budget: null,
    template: null,
    reference: null,
    submit: null
  })

  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)
  const [codeExists, setCodeExists] = useState(false)
  const [projectInfo, setProjectInfo] = useState<any>(null)
  const [budgetInfo, setBudgetInfo] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [approvers, setApprovers] = useState<any[]>([])
  const [reference, setReference] = useState('')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [hasUnsaved, setHasUnsaved] = useState(false)

  const [form, setForm] = useState({
    pr_code: '',
    project_id: '',
    requested_by: '',
    request_date: new Date().toISOString().split('T')[0],
    needed_date: '',
    notes: '',
    items: [] as Item[],
  })

  // 🔥 DEBOUNCE
  const debouncedForm = useDebounce(form, 2000)
  const debouncedCode = useDebounce(form.pr_code, 500)

  // ===== COMPUTED =====
  const total = useMemo(() => {
    return form.items.reduce((sum, item) => {
      return sum + (item.qty || 0) * (item.estimated_price || 0)
    }, 0)
  }, [form.items])

  // 🔥 VALIDATION (single source)
  const computedErrors = useMemo(() => {
    const errors: string[] = []
    
    if (!form.pr_code) errors.push('PR Code required')
    if (!form.project_id) errors.push('Project required')
    if (!form.requested_by) errors.push('Requestor required')
    if (form.items.length === 0) errors.push('At least 1 item required')
    if (total <= 0) errors.push('Total value must be > 0')
    if (form.needed_date && form.needed_date < form.request_date) {
      errors.push('Need date cannot be before request date')
    }
    if (codeExists) errors.push('PR Code already exists')
    if (budgetInfo && total > budgetInfo.remaining) {
      errors.push('Total exceeds remaining budget')
    }
    
    return errors
  }, [form, total, codeExists, budgetInfo])

  useEffect(() => {
    setValidationErrors(computedErrors)
  }, [computedErrors])

  const isValid = useMemo(() => {
    return form.pr_code &&
      form.project_id &&
      form.requested_by &&
      form.items.length > 0 &&
      total > 0 &&
      computedErrors.length === 0
  }, [form, total, computedErrors])

  // ===== UNSAVED CHANGES PROTECTION =====
  useEffect(() => {
    setHasUnsaved(draftLoaded)
  }, [form, draftLoaded])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsaved])

  // ===== DRAFT AUTO-SAVE =====
  useEffect(() => {
    const saved = localStorage.getItem('pr-draft')
    if (saved && !draftLoaded) {
      try {
        const draft = JSON.parse(saved)
        setForm(prev => ({ ...prev, ...draft }))
        setDraftLoaded(true)
        toast.info('Draft loaded from local storage')
      } catch (err) {
        console.error('Failed to load draft', err)
      }
    }
  }, [draftLoaded])

  useEffect(() => {
    if (!draftLoaded) return
    
    setLoading(prev => ({ ...prev, draft: true }))
    localStorage.setItem('pr-draft', JSON.stringify(debouncedForm))
    toast.success('Draft saved', { id: 'draft' })
    setLoading(prev => ({ ...prev, draft: false }))
  }, [debouncedForm])

  // ===== DUPLICATE CHECK =====
  useEffect(() => {
    if (debouncedCode.length < 3) {
      setCodeExists(false)
      return
    }
    
    const checkCode = async () => {
      try {
        const res = await fetch(`/api/procurement/pr/check-code?code=${debouncedCode}`)
        const data = await res.json()
        setCodeExists(data.exists)
      } catch (err) {
        console.error('Failed to check code', err)
      }
    }
    
    checkCode()
  }, [debouncedCode])

  // ===== PROJECT INFO =====
  useEffect(() => {
    if (!form.project_id) {
      setProjectInfo(null)
      setBudgetInfo(null)
      return
    }
    
    setLoading(prev => ({ ...prev, project: true, budget: true }))
    setErrors(prev => ({ ...prev, project: null, budget: null }))
    
    Promise.all([
      fetch(`/api/projects/${form.project_id}`).then(res => res.json()),
      fetch(`/api/projects/${form.project_id}/budget`).then(res => res.json())
    ])
      .then(([project, budget]) => {
        setProjectInfo(project)
        setBudgetInfo(budget)
      })
      .catch(err => {
        setErrors(prev => ({ 
          ...prev, 
          project: 'Failed to load project info',
          budget: 'Failed to load budget info'
        }))
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, project: false, budget: false }))
      })
  }, [form.project_id])

  // ===== LOAD TEMPLATES =====
  useEffect(() => {
    fetch('/api/procurement/item-templates')
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(() => setErrors(prev => ({ ...prev, template: 'Failed to load templates' })))
      
    fetch('/api/procurement/approvers')
      .then(res => res.json())
      .then(data => setApprovers(data))
      .catch(console.error)
  }, [])

  // ===== HANDLERS =====
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors')
      return
    }

    setLoading(prev => ({ ...prev, submit: true }))
    setErrors(prev => ({ ...prev, submit: null }))

    try {
      const hasFiles = files.length > 0
      let body: any
      let headers: HeadersInit = {}

      if (hasFiles) {
        const formData = new FormData()
        formData.append('data', JSON.stringify(form))
        files.forEach(file => formData.append('files', file))
        body = formData
      } else {
        headers = { 'Content-Type': 'application/json' }
        body = JSON.stringify(form)
      }

      const res = await fetch('/api/procurement/pr', {
        method: 'POST',
        headers,
        body
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create PR')
      }

      localStorage.removeItem('pr-draft')
      toast.success('PR created successfully')
      setHasUnsaved(false)
      
      router.push(`/procurement/pr/${data.data.pr_id}`)
    } catch (err: any) {
      setErrors(prev => ({ ...prev, submit: err?.message || 'Failed to create PR' }))
      toast.error(err?.message || 'Failed to create PR')
    } finally {
      setLoading(prev => ({ ...prev, submit: false }))
      setShowConfirm(false)
    }
  }

  const handleSubmitWithConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (total > 100000000) { // > 100jt
      setShowConfirm(true)
    } else {
      handleSubmit()
    }
  }

  const loadFromReference = async () => {
    if (!reference) return
    
    setLoading(prev => ({ ...prev, reference: true }))
    setErrors(prev => ({ ...prev, reference: null }))
    
    try {
      const res = await fetch(`/api/procurement/reference/${reference}`)
      const data = await res.json()
      
      setForm({
        ...form,
        items: data.items || [],
        notes: `From ${reference}: ${data.notes || ''}`
      })
      toast.success(`Loaded from ${reference}`)
    } catch (err) {
      setErrors(prev => ({ ...prev, reference: 'Failed to load reference' }))
      toast.error('Failed to load reference')
    } finally {
      setLoading(prev => ({ ...prev, reference: false }))
    }
  }

  const loadTemplate = useCallback(() => {
    setLoading(prev => ({ ...prev, template: true }))
    try {
      setForm({
        ...form,
        items: templates.map(t => ({
          description: t.description,
          qty: 1,
          unit: t.unit,
          estimated_price: t.estimated_price
        }))
      })
      toast.success('Template loaded')
    } catch (err) {
      setErrors(prev => ({ ...prev, template: 'Failed to load template' }))
    } finally {
      setLoading(prev => ({ ...prev, template: false }))
    }
  }, [templates, form])

  const clearDraft = () => {
    localStorage.removeItem('pr-draft')
    setForm({
      pr_code: '',
      project_id: '',
      requested_by: '',
      request_date: new Date().toISOString().split('T')[0],
      needed_date: '',
      notes: '',
      items: [],
    })
    setDraftLoaded(false)
    setHasUnsaved(false)
    toast.success('Draft cleared')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (hasUnsaved) {
                if (confirm('You have unsaved changes. Leave anyway?')) {
                  router.back()
                }
              } else {
                router.back()
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Create Purchase Request</h1>
        </div>

        {/* Draft indicator */}
        {draftLoaded && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {loading.draft ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Clock size={16} />
            )}
            <span>{loading.draft ? 'Saving...' : 'Draft auto-saved'}</span>
            <button
              onClick={clearDraft}
              className="text-xs text-red-600 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Error Summary */}
      {errors.submit && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {errors.submit}
        </div>
      )}

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Please fix the following:
          </p>
          <ul className="text-xs text-yellow-700 list-disc list-inside">
            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Budget Warning */}
      {budgetInfo && total > budgetInfo.remaining && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800 flex items-center gap-2">
            <AlertCircle size={16} />
            Total exceeds remaining budget
          </p>
          <p className="text-xs text-red-700 mt-1">
            Budget remaining: <Money value={budgetInfo.remaining} />
          </p>
        </div>
      )}

      <form onSubmit={handleSubmitWithConfirm} className="space-y-6">

        {/* Reference Loader */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Load from reference (PO/Quotation #)..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={loadFromReference}
              disabled={loading.reference}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading.reference ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          {errors.reference && (
            <p className="text-xs text-red-600 mt-1">{errors.reference}</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            {/* Template loader */}
            {templates.length > 0 && (
              <button
                type="button"
                onClick={loadTemplate}
                disabled={loading.template}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {loading.template ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Load Template
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormInput
              label="PR Code *"
              value={form.pr_code}
              onChange={(v) => setForm({ ...form, pr_code: v })}
              placeholder="PR-2025-001"
              error={codeExists ? 'Code already exists' : undefined}
              icon={codeExists ? XCircle : (form.pr_code ? CheckCircle : undefined)}
              iconColor={codeExists ? 'text-red-500' : (form.pr_code ? 'text-green-500' : undefined)}
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Project *
              </label>
              <ProjectSelect
                value={form.project_id}
                onChange={(id) => setForm({ ...form, project_id: id })}
                required
              />
              
              {/* Project info preview */}
              {loading.project && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-500 flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading project info...
                </div>
              )}
              
              {errors.project && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg text-sm text-red-600">
                  {errors.project}
                </div>
              )}
              
              {projectInfo && !loading.project && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium">{projectInfo.project_name}</p>
                  <p className="text-xs text-gray-600">
                    Location: {projectInfo.lokasi || '-'}
                  </p>
                </div>
              )}
            </div>

            <FormInput
              label="Requested By *"
              value={form.requested_by}
              onChange={(v) => setForm({ ...form, requested_by: v })}
            />

            <FormInput
              label="Request Date *"
              type="date"
              value={form.request_date}
              onChange={(v) => setForm({ ...form, request_date: v })}
            />

            <FormInput
              label="Need By Date"
              type="date"
              value={form.needed_date}
              onChange={(v) => setForm({ ...form, needed_date: v })}
              error={
                form.needed_date && form.needed_date < form.request_date
                  ? 'Need date cannot be before request date'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white border rounded-xl p-6">
          <ItemsEditor
            items={form.items}
            onChange={(items) => setForm({ ...form, items })}
            type="pr"
          />

          {/* Total Preview */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Items count</p>
              <p className="font-medium">{form.items.length} items</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Estimated Total</p>
              <p className="text-2xl font-bold">
                <Money value={total} />
              </p>
              {loading.budget ? (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 justify-end">
                  <RefreshCw size={12} className="animate-spin" />
                  Loading budget...
                </p>
              ) : budgetInfo && (
                <p className="text-xs text-gray-500 mt-1">
                  Budget remaining: <Money value={budgetInfo.remaining} />
                </p>
              )}
              {errors.budget && (
                <p className="text-xs text-red-500 mt-1">{errors.budget}</p>
              )}
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div className="bg-white border rounded-xl p-6">
          <label className="block text-sm font-medium mb-2">
            Attachments
          </label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles([...files, ...Array.from(e.target.files!)])
                }
              }}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Upload size={16} />
              Click to upload or drag and drop
            </label>
          </div>
          
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between gap-2 mt-2 p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2 text-sm">
                <FileText size={14} />
                {f.name}
              </div>
              <button
                type="button"
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="bg-white border rounded-xl p-6">
          <label className="block text-sm font-medium mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Additional information..."
          />
        </div>

        {/* Approval Flow Preview */}
        {approvers.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-medium mb-4">Approval Flow</h3>
            <div className="space-y-3">
              {approvers.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              if (hasUnsaved) {
                if (confirm('You have unsaved changes. Leave anyway?')) {
                  router.back()
                }
              } else {
                router.back()
              }
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isValid || loading.submit || validationErrors.length > 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.submit ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading.submit ? 'Creating...' : 'Create PR'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Confirm Large PR</h3>
            <p className="text-sm text-gray-600 mb-4">
              Total value is <Money value={total} />. Are you sure you want to create this PR?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={loading.submit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading.submit ? 'Creating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 🔥 Reusable Input with enhancements
function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  iconColor,
  hint
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  error?: string
  icon?: any
  iconColor?: string
  hint?: string
}) {
  const IconComponent = Icon

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full border rounded-lg px-3 py-2
            ${Icon ? 'pr-8' : ''}
            ${error ? 'border-red-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        />
        {IconComponent && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor}`}>
            <IconComponent size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <XCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
