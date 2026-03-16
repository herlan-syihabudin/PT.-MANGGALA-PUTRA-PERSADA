import { NextResponse } from "next/server"

// ========== TYPES ==========
type Project = {
  id: string
  rab_id?: string
  name?: string
  // add other fields as needed
}

type RABItem = {
  id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total_price: number
}

type RAB = {
  total_items: number
  total_value: number
  items: RABItem[]
}

type RABResponse = {
  summary: {
    total_items: number
    total_value: number
  }
  items: RABItem[]
}

// ========== UTILITIES ==========
function getBaseUrl(req: Request): string {
  // Priority: 1. Env var, 2. Forwarded host, 3. Request URL
  return process.env.NEXT_PUBLIC_APP_URL ||
         `https://${req.headers.get('x-forwarded-host')}` ||
         new URL(req.url).origin
}

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeout = 5000
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ========== MAIN HANDLER ==========
export async function GET(
  req: Request,
  { params }: { params: { project_id: string } }
) {
  const requestId = crypto.randomUUID?.() || Date.now().toString()
  
  try {
    // ===== VALIDATION =====
    const { project_id } = params

    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: "Project ID is required" 
        },
        { status: 400 }
      )
    }

    // Sanitize project ID
    const sanitizedId = project_id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (sanitizedId !== project_id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid project ID format" 
        },
        { status: 400 }
      )
    }

    // ===== GET BASE URL =====
    const base = getBaseUrl(req)
    console.log(`[${requestId}] Fetching RAB for project: ${sanitizedId}`)

    // ===== FETCH PROJECT =====
    let project: Project
    try {
      project = await fetchWithTimeout<Project>(
        `${base}/api/projects/${sanitizedId}`,
        { cache: "no-store" }
      )
    } catch (error) {
      console.error(`[${requestId}] Failed to fetch project:`, error)
      
      // Return empty but successful response (graceful degradation)
      return NextResponse.json({
        success: true,
        data: {
          summary: { total_items: 0, total_value: 0 },
          items: []
        }
      })
    }

    // ===== CHECK RAB ID =====
    if (!project.rab_id) {
      console.log(`[${requestId}] Project has no RAB ID`)
      return NextResponse.json({
        success: true,
        data: {
          summary: { total_items: 0, total_value: 0 },
          items: []
        }
      })
    }

    // ===== FETCH RAB =====
    let rab: RAB
    try {
      rab = await fetchWithTimeout<RAB>(
        `${base}/api/rab/${project.rab_id}`,
        { cache: "no-store" }
      )
    } catch (error) {
      console.error(`[${requestId}] Failed to fetch RAB:`, error)
      
      // Return empty but successful response
      return NextResponse.json({
        success: true,
        data: {
          summary: { total_items: 0, total_value: 0 },
          items: []
        }
      })
    }

    // ===== SUCCESS RESPONSE =====
    console.log(`[${requestId}] Successfully fetched RAB for project: ${sanitizedId}`)
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_items: rab.total_items || 0,
          total_value: rab.total_value || 0
        },
        items: rab.items || []
      }
    })

  } catch (err) {
    // ===== ERROR HANDLING =====
    console.error(`[${requestId}] PROJECT RAB API ERROR:`, err)

    // Differentiate error types
    if (err instanceof Error) {
      if (err.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false,
            error: "Request timeout" 
          },
          { status: 504 }
        )
      }
      
      if (err.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            success: false,
            error: "Network error" 
          },
          { status: 503 }
        )
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch project RAB" 
      },
      { status: 500 }
    )
  }
}

// Optional: Add caching strategy
export const revalidate = 5 // Revalidate every 5 seconds
