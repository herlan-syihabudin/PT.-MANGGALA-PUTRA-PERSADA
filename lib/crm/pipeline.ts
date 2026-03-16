// lib/crm/pipeline.ts

// ========== TYPES & CONSTANTS ==========
export const PIPELINE_STAGES = [
  'PROSPEK',
  'NEGOSIASI', 
  'FOLLOW UP',
  'MENANG',
  'KALAH'
] as const

export const PROPOSAL_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'rejected'
] as const

export type PipelineStage = typeof PIPELINE_STAGES[number]
export type ProposalStatus = typeof PROPOSAL_STATUSES[number]

export interface Deal {
  pipeline_id: string
  stage: PipelineStage
  rab_id: string | null
  proposal_status: ProposalStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface UpdateDealData {
  stage?: PipelineStage
  rab_id?: string
  proposal_status?: ProposalStatus
  notes?: string
}

// ========== ERROR CLASSES ==========
export class PipelineError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'PipelineError'
  }
}

// ========== VALIDATION ==========
function validateDealId(id: string): string {
  if (!id || typeof id !== 'string') {
    throw new PipelineError('Deal ID is required', 'INVALID_ID')
  }
  
  const sanitized = id.trim().replace(/[^a-zA-Z0-9_-]/g, '')
  if (sanitized !== id) {
    throw new PipelineError('Invalid deal ID format', 'INVALID_FORMAT')
  }
  
  return sanitized
}

function validateStage(stage: string): PipelineStage {
  if (!PIPELINE_STAGES.includes(stage as PipelineStage)) {
    throw new PipelineError(
      `Invalid stage. Must be one of: ${PIPELINE_STAGES.join(', ')}`,
      'INVALID_STAGE'
    )
  }
  return stage as PipelineStage
}

function validateProposalStatus(status: string): ProposalStatus {
  if (!PROPOSAL_STATUSES.includes(status as ProposalStatus)) {
    throw new PipelineError(
      `Invalid proposal status. Must be one of: ${PROPOSAL_STATUSES.join(', ')}`,
      'INVALID_STATUS'
    )
  }
  return status as ProposalStatus
}

// ========== DATABASE FUNCTIONS (untuk nanti) ==========
// Ini akan diganti dengan implementasi DB/Google Sheets
async function queryDB<T>(query: string, params: any[]): Promise<T> {
  // TODO: Implementasi database
  console.log('Mock DB query:', query, params)
  throw new Error('Database not implemented')
}

// ========== MAIN FUNCTIONS ==========

/**
 * Get deal by ID
 * @param id - Deal ID
 * @returns Deal object
 * @throws {PipelineError} Jika deal tidak ditemukan
 */
export async function getDeal(id: string): Promise<Deal> {
  try {
    // Validate input
    const dealId = validateDealId(id)
    
    // TODO: Replace with actual DB query
    // const result = await queryDB<Deal>(
    //   'SELECT * FROM deals WHERE pipeline_id = $1',
    //   [dealId]
    // )
    
    // if (!result) {
    //   throw new PipelineError(`Deal with ID ${dealId} not found`, 'NOT_FOUND')
    // }
    
    // Mock data - remove when DB is ready
    const mockDeal: Deal = {
      pipeline_id: dealId,
      stage: 'FOLLOW UP',
      rab_id: null,
      proposal_status: 'draft',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    return mockDeal
    
  } catch (error) {
    if (error instanceof PipelineError) {
      throw error
    }
    
    console.error('Error in getDeal:', error)
    throw new PipelineError('Failed to fetch deal', 'FETCH_FAILED')
  }
}

/**
 * Update deal data
 * @param id - Deal ID
 * @param data - Data to update
 * @returns Updated deal
 */
export async function updateDeal(
  id: string, 
  data: UpdateDealData
): Promise<Deal> {
  try {
    // Validate
    const dealId = validateDealId(id)
    
    // Validate stage if provided
    if (data.stage) {
      validateStage(data.stage)
    }
    
    // Validate proposal status if provided
    if (data.proposal_status) {
      validateProposalStatus(data.proposal_status)
    }
    
    // Get existing deal
    const existingDeal = await getDeal(dealId)
    
    // Merge data
    const updatedDeal: Deal = {
      ...existingDeal,
      ...data,
      updated_at: new Date().toISOString(),
    }
    
    // TODO: Update in database
    // await queryDB(
    //   'UPDATE deals SET stage = $1, rab_id = $2, proposal_status = $3, notes = $4, updated_at = $5 WHERE pipeline_id = $6',
    //   [updatedDeal.stage, updatedDeal.rab_id, updatedDeal.proposal_status, updatedDeal.notes, updatedDeal.updated_at, dealId]
    // )
    
    console.log('Deal updated:', updatedDeal)
    return updatedDeal
    
  } catch (error) {
    if (error instanceof PipelineError) {
      throw error
    }
    
    console.error('Error in updateDeal:', error)
    throw new PipelineError('Failed to update deal', 'UPDATE_FAILED')
  }
}

/**
 * Lock RAB (make read-only)
 * @param rabId - RAB ID to lock
 * @returns boolean success
 */
export async function lockRAB(rabId: string): Promise<boolean> {
  try {
    // Validate
    if (!rabId || typeof rabId !== 'string') {
      throw new PipelineError('RAB ID is required', 'INVALID_RAB_ID')
    }
    
    const sanitizedId = rabId.trim().replace(/[^a-zA-Z0-9_-]/g, '')
    if (sanitizedId !== rabId) {
      throw new PipelineError('Invalid RAB ID format', 'INVALID_RAB_FORMAT')
    }
    
    // TODO: Update RAB status in database
    // await queryDB(
    //   'UPDATE rab SET locked = true, locked_at = $1 WHERE id = $2',
    //   [new Date().toISOString(), sanitizedId]
    // )
    
    console.log(`RAB ${sanitizedId} locked successfully`)
    return true
    
  } catch (error) {
    if (error instanceof PipelineError) {
      throw error
    }
    
    console.error('Error in lockRAB:', error)
    throw new PipelineError('Failed to lock RAB', 'LOCK_FAILED')
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get all deals in a specific stage
 * @param stage - Pipeline stage
 * @returns Array of deals
 */
export async function getDealsByStage(stage: PipelineStage): Promise<Deal[]> {
  try {
    validateStage(stage)
    
    // TODO: Query database
    // const results = await queryDB<Deal[]>(
    //   'SELECT * FROM deals WHERE stage = $1',
    //   [stage]
    // )
    
    // Mock data
    return [] // Replace with actual data
    
  } catch (error) {
    console.error('Error in getDealsByStage:', error)
    throw new PipelineError('Failed to fetch deals by stage', 'FETCH_FAILED')
  }
}

/**
 * Check if RAB is locked
 * @param rabId - RAB ID to check
 * @returns boolean
 */
export async function isRABLocked(rabId: string): Promise<boolean> {
  try {
    // TODO: Check in database
    // const result = await queryDB<{ locked: boolean }>(
    //   'SELECT locked FROM rab WHERE id = $1',
    //   [rabId]
    // )
    
    return false // Replace with actual check
    
  } catch (error) {
    console.error('Error in isRABLocked:', error)
    return false // Fail safe - assume not locked
  }
}

// ========== PIPELINE PROGRESS ==========

/**
 * Calculate pipeline progress
 * @param deal - Deal object
 * @returns Progress percentage
 */
export function getPipelineProgress(deal: Deal): number {
  const stageIndex = PIPELINE_STAGES.indexOf(deal.stage)
  if (stageIndex === -1) return 0
  
  return (stageIndex + 1) / PIPELINE_STAGES.length * 100
}

/**
 * Get next stage in pipeline
 * @param currentStage - Current stage
 * @returns Next stage or null if at end
 */
export function getNextStage(currentStage: PipelineStage): PipelineStage | null {
  const index = PIPELINE_STAGES.indexOf(currentStage)
  if (index === -1 || index === PIPELINE_STAGES.length - 1) {
    return null
  }
  return PIPELINE_STAGES[index + 1]
}

/**
 * Get previous stage in pipeline
 * @param currentStage - Current stage
 * @returns Previous stage or null if at start
 */
export function getPreviousStage(currentStage: PipelineStage): PipelineStage | null {
  const index = PIPELINE_STAGES.indexOf(currentStage)
  if (index <= 0) return null
  return PIPELINE_STAGES[index - 1]
}
