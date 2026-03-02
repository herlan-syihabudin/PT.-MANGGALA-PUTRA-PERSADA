import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { z } from 'zod'
import crypto from 'crypto'
import winston from 'winston'
import { redis } from '@/lib/redis' // Singleton Redis (optional)

export const dynamic = "force-dynamic"
// ======================
// Logger Singleton
// ======================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// ======================
// Configuration & Constants
// ======================



// Constants
const CACHE_TTL = 45 // Cache TTL in seconds
const RATE_LIMIT_MAX = 100 // Max requests per window
const RATE_LIMIT_WINDOW = '60 s' // Rate limit window

// Validation Schema
const QuerySchema = z.object({
  period: z.enum(['MTD', 'QTD', 'YTD', 'ALL']).default('MTD'),
  includeForecast: z.enum(['true', 'false']).default('false'),
  includeTrends: z.enum(['true', 'false']).default('false'),
  includeAlerts: z.enum(['true', 'false']).default('true'),
  format: z.enum(['json', 'csv']).default('json'),
})

// ======================
// Rate Limiter (Optional - bisa dihapus kalau ga pake Redis)
// ======================

let rateLimiter: any = null

// Only initialize rateLimiter if Redis is configured
if (process.env.UPSTASH_REDIS_REST_URL) {
  const { Ratelimit } = require('@upstash/ratelimit')
  rateLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
    analytics: true,
  })
}

// ======================
// Type Definitions
// ======================

interface FinanceData {
  current: {
    revenue: number
    expenses: number
    profit: number
    margin: number
    burnRate: number
    runway: string
    ebitda: number
    workingCapital: number
  }
  trends: {
    revenue: { direction: string; percentage: number }
    expenses: { direction: string; percentage: number }
    margin: { direction: string; percentage: number }
    cashflow: any[]
  }
}

interface ProjectData {
  overview: {
    total: number
    active: number
    delayed: number
    completed: number
    totalValue: number
    actualCost: number
    variance: number
    variancePercentage: number
  }
  performance: {
    completionRate: number
    onTimeDelivery: number
    delayImpact: string
    avgDelayDays: number
  }
}

// ======================
// MOCK DATA GENERATOR
// ======================

class MockDataGenerator {
  // Generate random number between min and max
  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Generate random percentage
  private randomPercentage(min: number, max: number): number {
    return this.random(min * 100, max * 100) / 100
  }

  // Generate finance data
  generateFinanceData(period: string): FinanceData {
    const revenue = this.random(50000000, 150000000) // 50M - 150M
    const expenses = this.random(30000000, 100000000) // 30M - 100M
    const profit = revenue - expenses
    const margin = (profit / revenue) * 100

    // Generate cashflow history
    const cashflow = []
    const days = period === 'MTD' ? 30 : period === 'QTD' ? 90 : 365
    for (let i = 0; i < Math.min(days, 30); i++) {
      cashflow.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: this.random(1000000, 5000000),
        type: this.random(0, 1) ? 'INFLOW' : 'OUTFLOW'
      })
    }

    return {
      current: {
        revenue,
        expenses,
        profit,
        margin,
        burnRate: expenses / 30,
        runway: this.calculateRunway(expenses / 30, this.random(50000000, 200000000)),
        ebitda: profit * 0.8,
        workingCapital: this.random(20000000, 80000000)
      },
      trends: {
        revenue: {
          direction: this.random(0, 1) ? 'UP' : 'DOWN',
          percentage: this.randomPercentage(-15, 25)
        },
        expenses: {
          direction: this.random(0, 1) ? 'UP' : 'DOWN',
          percentage: this.randomPercentage(-10, 20)
        },
        margin: {
          direction: this.random(0, 1) ? 'UP' : 'DOWN',
          percentage: this.randomPercentage(-5, 8)
        },
        cashflow
      }
    }
  }

  private calculateRunway(burnRate: number, cash: number): string {
    if (burnRate === 0) return 'Infinite'
    const days = Math.floor(cash / burnRate)
    return `${days} days`
  }

  // Generate project data
  generateProjectData(): ProjectData {
    const total = this.random(15, 40)
    const active = this.random(8, total)
    const completed = this.random(3, 10)
    const delayed = this.random(1, Math.floor(active * 0.4))
    
    const totalValue = this.random(500000000, 2000000000) // 500M - 2B
    const actualCost = totalValue * this.randomPercentage(0.7, 0.95)
    const variance = totalValue - actualCost
    const variancePercentage = (variance / totalValue) * 100

    const totalProgress = this.random(30, 85)
    const completionRate = totalProgress / 100
    const onTimeDelivery = ((completed - this.random(0, 2)) / (completed || 1)) * 100

    return {
      overview: {
        total,
        active,
        delayed,
        completed,
        totalValue,
        actualCost,
        variance,
        variancePercentage
      },
      performance: {
        completionRate,
        onTimeDelivery,
        delayImpact: delayed > 5 ? 'HIGH' : delayed > 2 ? 'MEDIUM' : 'LOW',
        avgDelayDays: delayed * this.random(3, 10)
      }
    }
  }

  // Generate HR data
  generateHRData() {
    const total = this.random(150, 250)
    const present = this.random(Math.floor(total * 0.85), total)
    const absent = total - present
    const leave = this.random(2, 8)
    
    return {
      workforce: {
        total,
        present,
        absent,
        leave,
        attendanceRate: (present / total) * 100
      },
      financial: {
        totalPayroll: this.random(800000000, 1500000000), // 800M - 1.5B
        avgSalary: this.random(5000000, 10000000) // 5M - 10M
      }
    }
  }

  // Generate inventory data
  generateInventoryData(period: string) {
    const totalItems = this.random(800, 1500)
    const lowStock = this.random(10, 50)
    const outOfStock = this.random(2, 15)
    const totalValue = this.random(2000000000, 5000000000) // 2B - 5B

    // Generate stock movements
    const movements = []
    for (let i = 0; i < 30; i++) {
      movements.push({
        type: this.random(0, 1) ? 'IN' : 'OUT',
        quantity: this.random(10, 200),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      })
    }

    return {
      stock: {
        totalItems,
        totalValue,
        lowStock,
        outOfStock,
        stockHealth: this.calculateStockHealth(lowStock, totalItems),
        turnoverRate: this.calculateTurnoverRate(movements, totalValue),
        daysOfInventory: this.calculateDaysOfInventory(movements, totalValue)
      },
      alerts: {
        needsReorder: lowStock,
        critical: outOfStock
      }
    }
  }

  private calculateStockHealth(lowStock: number, totalItems: number): string {
    if (totalItems === 0) return 'HEALTHY'
    const ratio = lowStock / totalItems
    if (ratio > 0.2) return 'CRITICAL'
    if (ratio > 0.1) return 'WARNING'
    return 'HEALTHY'
  }

  private calculateTurnoverRate(movements: any[], totalValue: number): number {
    const totalOut = movements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0)
    return Number((totalOut / ((totalValue || 1) / 1000000)).toFixed(2))
  }

  private calculateDaysOfInventory(movements: any[], totalValue: number): number {
    const totalOut = movements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0)
    const avgDailyOut = totalOut / 30
    return avgDailyOut > 0 ? Math.floor(totalValue / avgDailyOut) : 0
  }

  // Generate pipeline data
  generatePipelineData() {
    const stages = ['NEW', 'FOLLOWUP', 'SURVEY', 'OFFER', 'DEAL', 'LOST']
    const opportunities = []
    
    for (let i = 0; i < this.random(30, 60); i++) {
      const stage = stages[this.random(0, stages.length - 1)]
      opportunities.push({
        stage,
        value: this.random(50000000, 500000000),
        probability: stage === 'DEAL' ? 100 : stage === 'LOST' ? 0 : this.random(20, 80)
      })
    }

    const activeOpportunities = opportunities.filter(o => o.stage !== 'DEAL' && o.stage !== 'LOST')
    const totalValue = activeOpportunities.reduce((sum, o) => sum + o.value, 0)
    const weightedValue = activeOpportunities.reduce((sum, o) => sum + (o.value * (o.probability / 100)), 0)

    return {
      overview: {
        total: opportunities.length,
        active: activeOpportunities.length,
        totalValue,
        weightedValue,
        conversionRate: this.calculateConversionRate(opportunities)
      },
      stages: stages.reduce((acc, stage) => {
        const items = opportunities.filter(o => o.stage === stage)
        return {
          ...acc,
          [stage.toLowerCase()]: {
            count: items.length,
            value: items.reduce((sum, i) => sum + i.value, 0)
          }
        }
      }, {}),
      forecast: {
        expected: this.calculateExpectedRevenue(opportunities),
        bestCase: this.calculateBestCaseRevenue(opportunities),
        worstCase: this.calculateWorstCaseRevenue(opportunities),
        confidence: this.calculateForecastConfidence(opportunities)
      }
    }
  }

  private calculateConversionRate(opportunities: any[]): number {
    const deals = opportunities.filter(o => o.stage === 'DEAL').length
    const lost = opportunities.filter(o => o.stage === 'LOST').length
    const total = deals + lost
    return total > 0 ? (deals / total) * 100 : 0
  }

  private calculateExpectedRevenue(opportunities: any[]): number {
    return opportunities
      .filter(o => o.stage !== 'LOST')
      .reduce((sum, o) => sum + (o.value * (o.probability / 100)), 0)
  }

  private calculateBestCaseRevenue(opportunities: any[]): number {
    return opportunities
      .filter(o => o.stage !== 'LOST')
      .reduce((sum, o) => sum + o.value, 0)
  }

  private calculateWorstCaseRevenue(opportunities: any[]): number {
    return opportunities
      .filter(o => o.stage === 'DEAL')
      .reduce((sum, o) => sum + o.value, 0)
  }

  private calculateForecastConfidence(opportunities: any[]): string {
    const active = opportunities.filter(o => o.stage !== 'LOST')
    if (active.length === 0) return 'LOW'
    
    const avgProb = active.reduce((sum, o) => sum + (o.probability || 0), 0) / active.length
    if (avgProb > 70) return 'HIGH'
    if (avgProb > 40) return 'MEDIUM'
    return 'LOW'
  }

  // Generate KPI data
  generateKPIData() {
    const categories = ['keuangan', 'proyek', 'sdM', 'penjualan', 'operasional']
    const kpis: any = {}

    categories.forEach(category => {
      kpis[category] = {
        [`${category}Target`]: {
          value: this.random(70, 120),
          target: 100,
          achievement: this.random(70, 120),
          status: this.getKPIStatus(this.random(70, 120)),
          trend: this.random(0, 1) ? 'UP' : 'DOWN'
        }
      }
    })

    return kpis
  }

  private getKPIStatus(achievement: number): string {
    if (achievement >= 100) return 'EXCEEDED'
    if (achievement >= 80) return 'ON_TRACK'
    if (achievement >= 60) return 'AT_RISK'
    return 'CRITICAL'
  }

  // Generate alerts
  generateAlerts() {
    const severities = ['CRITICAL', 'WARNING', 'INFO']
    const categories = ['FINANCE', 'PROJECT', 'INVENTORY', 'HR', 'SALES']
    const alerts = []

    const count = this.random(5, 15)
    for (let i = 0; i < count; i++) {
      const severity = severities[this.random(0, severities.length - 1)]
      alerts.push({
        id: crypto.randomUUID(),
        title: `${severity} Alert ${i + 1}`,
        message: `This is a ${severity.toLowerCase()} alert message`,
        severity,
        category: categories[this.random(0, categories.length - 1)],
        createdAt: new Date(Date.now() - this.random(0, 7) * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return {
      count: alerts.length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
      info: alerts.filter(a => a.severity === 'INFO').length,
      items: alerts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
  }

  // Generate trends
  generateTrends(period: string) {
    const dataPoints = period === 'MTD' ? 30 : period === 'QTD' ? 90 : 365
    const history = []

    for (let i = 0; i < Math.min(dataPoints, 30); i++) {
      history.push({
        revenue: this.random(40000000, 160000000),
        profit: this.random(5000000, 30000000),
        activeProjects: this.random(10, 25),
        attendance: this.random(85, 98)
      })
    }

    const calculateTrend = (values: number[]) => {
      if (values.length < 2) return 'STABLE'
      const first = values[0]
      const last = values[values.length - 1]
      const change = ((last - first) / (first || 1)) * 100
      if (change > 5) return 'UP'
      if (change < -5) return 'DOWN'
      return 'STABLE'
    }

    return {
      revenue: calculateTrend(history.map(h => h.revenue)),
      profit: calculateTrend(history.map(h => h.profit)),
      projects: calculateTrend(history.map(h => h.activeProjects)),
      attendance: calculateTrend(history.map(h => h.attendance))
    }
  }
}

// ======================
// Dashboard Service (Tanpa Prisma)
// ======================

class DashboardService {
  private generator: MockDataGenerator
  private redis: any
  private logger: any

  constructor() {
    this.generator = new MockDataGenerator()
    this.redis = redis
    this.logger = logger
  }

  async getDashboardData(params: z.infer<typeof QuerySchema>) {
    const cacheKey = this.generateCacheKey(params)
    
    // Try cache first (optional)
    if (this.redis) {
      const cached = await this.getCachedData(cacheKey)
      if (cached) return cached
    }

    // Generate all mock data
    const finance = this.generator.generateFinanceData(params.period)
    const projects = this.generator.generateProjectData()
    const hr = this.generator.generateHRData()
    const inventory = this.generator.generateInventoryData(params.period)
    const pipeline = this.generator.generatePipelineData()
    const kpis = this.generator.generateKPIData()
    const alerts = params.includeAlerts === 'true' ? this.generator.generateAlerts() : { count: 0, critical: 0, warning: 0, info: 0, items: [] }
    const trends = params.includeTrends === 'true' ? this.generator.generateTrends(params.period) : {}

    // Generate insights
    const insights = this.generateInsights({ finance, projects, hr, inventory, pipeline, kpis })

    // Generate forecast
    const forecast = params.includeForecast === 'true' 
      ? this.generateForecast(finance, projects)
      : null

    const dashboardData = {
      summary: {
        period: params.period,
        timestamp: new Date().toISOString(),
        dataQuality: 'HIGH',
        dataSource: 'MOCK_DATA',
        cache: {
          hit: false,
          ttl: CACHE_TTL
        }
      },
      
      metrics: {
        finance: {
          current: finance.current,
          trends: finance.trends,
          insights: insights.finance,
          health: this.calculateFinancialHealth(finance)
        },
        projects: {
          overview: projects.overview,
          performance: projects.performance,
          insights: insights.projects,
          health: this.calculateProjectHealth(projects)
        },
        hr: {
          workforce: hr.workforce,
          financial: hr.financial,
          insights: insights.hr,
          health: this.calculateHRHealth(hr)
        },
        inventory: {
          stock: inventory.stock,
          alerts: inventory.alerts,
          insights: insights.inventory,
          health: this.calculateInventoryHealth(inventory)
        },
        pipeline: {
          overview: pipeline.overview,
          stages: pipeline.stages,
          forecast: pipeline.forecast,
          insights: insights.pipeline,
          health: this.calculatePipelineHealth(pipeline)
        }
      },

      kpis: {
        ...kpis,
        performance: this.calculatePerformanceScore(kpis),
        trends: trends
      },

      intelligence: {
        insights: insights.all,
        alerts: alerts,
        forecast: forecast,
        recommendations: this.generateRecommendations({
          finance,
          projects,
          inventory,
          pipeline
        })
      },

      meta: {
        generatedAt: new Date().toISOString(),
        responseTime: 0,
        version: '4.3.0-mock',
        engine: 'MPP Mock Analytics',
        environment: process.env.NODE_ENV,
        dataSources: ['MOCK_DATA']
      }
    }

    // Cache the result (optional)
    if (this.redis) {
      await this.cacheData(cacheKey, dashboardData)
    }

    return dashboardData
  }

  // ======================
  // Cache Methods (Optional)
  // ======================

  private generateCacheKey(params: any): string {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex')
    return `dashboard:mock:${hash}`
  }

  private async getCachedData(key: string) {
    try {
      const cached = await this.redis?.get(key)
      if (cached) {
        this.logger.info(`Cache hit for ${key}`)
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached
        return { ...data, meta: { ...data.meta, cache: { hit: true } } }
      }
    } catch (error) {
      this.logger.warn('Cache read failed', { error })
    }
    return null
  }

  private async cacheData(key: string, data: any) {
    try {
      await this.redis?.set(key, JSON.stringify(data), { ex: CACHE_TTL })
      this.logger.info(`Cached data for ${key}`)
    } catch (error) {
      this.logger.warn('Cache write failed', { error })
    }
  }

  // ======================
  // Analytics Methods
  // ======================

  private generateInsights(data: any) {
    const insights = {
      finance: [],
      projects: [],
      hr: [],
      inventory: [],
      pipeline: [],
      all: []
    }

    // Finance insights
    if (data.finance?.current?.margin) {
      const margin = data.finance.current.margin
      if (margin > 20) {
        insights.finance.push({
          type: 'POSITIVE',
          priority: 80,
          message: `Profit margin ${margin.toFixed(2)}% is excellent`,
          category: 'FINANCE'
        })
      } else if (margin < 10) {
        insights.finance.push({
          type: 'WARNING',
          priority: 90,
          message: `Profit margin ${margin.toFixed(2)}% is below target`,
          category: 'FINANCE'
        })
      }
    }

    // Project insights
    if (data.projects?.overview) {
      const delayed = data.projects.overview.delayed
      if (delayed > 5) {
        insights.projects.push({
          type: 'WARNING',
          priority: 85,
          message: `${delayed} projects are delayed - immediate attention required`,
          category: 'PROJECT'
        })
      }
    }

    insights.all = [...insights.finance, ...insights.projects, ...insights.hr, ...insights.inventory, ...insights.pipeline]
      .sort((a, b) => b.priority - a.priority)

    return insights
  }

  private generateForecast(finance: any, projects: any) {
    return {
      revenue: {
        nextMonth: finance.current.revenue * 1.1,
        nextQuarter: finance.current.revenue * 3.3,
        confidence: 'MEDIUM'
      },
      expenses: {
        nextMonth: finance.current.expenses * 1.05,
        trend: 'STABLE'
      },
      projects: {
        nextMonth: Math.floor(projects.overview.active * 1.2),
        completion: Math.min(100, projects.performance.completionRate + 10)
      }
    }
  }

  private generateRecommendations(data: any) {
    const recommendations = []

    // Financial recommendations
    if (data.finance?.current?.runway) {
      const runwayStr = data.finance.current.runway
      if (runwayStr.includes('days')) {
        const runway = parseInt(runwayStr)
        if (runway < 30) {
          recommendations.push({
            category: 'FINANCIAL',
            priority: 'CRITICAL',
            action: 'Urgent: Cash runway below 30 days',
            impact: 'Secure additional funding or reduce costs immediately',
            timeline: 'This week'
          })
        }
      }
    }

    // Project recommendations
    if (data.projects?.overview?.delayed > 3) {
      recommendations.push({
        category: 'PROJECT',
        priority: 'HIGH',
        action: 'Review delayed projects and reallocate resources',
        impact: 'Reduce delay impact by 50%',
        timeline: 'Next 3 days'
      })
    }

    // Inventory recommendations
    if (data.inventory?.stock?.lowStock > 10) {
      recommendations.push({
        category: 'INVENTORY',
        priority: 'MEDIUM',
        action: 'Reorder low stock items',
        impact: 'Prevent material shortages',
        timeline: 'This week'
      })
    }

    return recommendations
  }

  private calculateFinancialHealth(finance: any): any {
    const margin = finance.current.margin || 0
    
    let runwayDays = 999
    if (finance.current.runway && finance.current.runway.includes('days')) {
      runwayDays = parseInt(finance.current.runway)
    }

    const score = Math.min(100, Math.max(0, 
      (margin / 20) * 50 +
      (runwayDays / 60) * 50
    ))

    let status = 'CRITICAL'
    if (margin > 15 && runwayDays > 45) status = 'HEALTHY'
    else if (margin > 10 && runwayDays > 30) status = 'STABLE'

    return { score, status }
  }

  private calculateProjectHealth(projects: any): any {
    const onTime = projects.performance.onTimeDelivery || 0
    return {
      score: onTime,
      status: onTime > 80 ? 'HEALTHY' : onTime > 60 ? 'STABLE' : 'CRITICAL'
    }
  }

  private calculateHRHealth(hr: any): any {
    const attendance = hr.workforce.attendanceRate || 0
    return {
      score: attendance,
      status: attendance > 95 ? 'HEALTHY' : attendance > 85 ? 'STABLE' : 'CRITICAL'
    }
  }

  private calculateInventoryHealth(inventory: any): any {
    const lowStock = inventory.stock.lowStock
    const total = inventory.stock.totalItems
    const healthScore = total > 0 ? 100 - ((lowStock / total) * 100) : 100
    
    let status = 'HEALTHY'
    if (lowStock > 5) status = 'STABLE'
    if (lowStock > 10) status = 'CRITICAL'
    
    return {
      score: Math.max(0, healthScore),
      status: status
    }
  }

  private calculatePipelineHealth(pipeline: any): any {
    const conversion = pipeline.overview.conversionRate || 0
    return {
      score: conversion,
      status: conversion > 40 ? 'HEALTHY' : conversion > 20 ? 'STABLE' : 'CRITICAL'
    }
  }

  private calculatePerformanceScore(kpis: any): number {
    let total = 0
    let count = 0
    
    Object.values(kpis).forEach((category: any) => {
      Object.values(category).forEach((kpi: any) => {
        if (kpi.achievement) {
          total += kpi.achievement
          count++
        }
      })
    })
    
    return count > 0 ? Math.round(total / count) : 0
  }
}

// ======================
// Static Helper Functions
// ======================

function calculateQueryComplexity(query: any): string {
  const features = Object.values(query).filter(v => v === 'true').length
  if (features > 3) return 'HIGH'
  if (features > 1) return 'MEDIUM'
  return 'LOW'
}

function convertToCSV(data: any): string {
  try {
    const rows = ['Category,Metric,Value']
    
    if (data.metrics?.finance?.current) {
      Object.entries(data.metrics.finance.current).forEach(([key, value]) => {
        rows.push(`Finance,${key},${value}`)
      })
    }
    
    if (data.metrics?.projects?.overview) {
      Object.entries(data.metrics.projects.overview).forEach(([key, value]) => {
        rows.push(`Projects,${key},${value}`)
      })
    }
    
    return rows.join('\n')
  } catch (error) {
    return 'Error generating CSV'
  }
}

// ======================
// Main API Handler
// ======================

export async function GET(request: Request) {
  const startTime = Date.now()
  const service = new DashboardService()
  const requestId = crypto.randomUUID()
  
  try {
    // Rate Limiting (optional)
    let rate = { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 }
    
    if (rateLimiter) {
      const identifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'anonymous'
      rate = await rateLimiter.limit(identifier)
      
      if (!rate.success) {
        logger.warn(`Rate limit exceeded for ${identifier}`, { requestId })
        
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            limit: rate.limit,
            reset: rate.reset,
            remaining: rate.remaining,
            requestId
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rate.limit.toString(),
              'X-RateLimit-Remaining': rate.remaining.toString(),
              'X-RateLimit-Reset': rate.reset.toString(),
              'X-Request-ID': requestId
            }
          }
        )
      }
    }

    // Parse and validate query params
    const { searchParams } = new URL(request.url)
    
    const query = QuerySchema.parse({
      period: searchParams.get('period') || 'MTD',
      includeForecast: searchParams.get('includeForecast') || 'false',
      includeTrends: searchParams.get('includeTrends') || 'false',
      includeAlerts: searchParams.get('includeAlerts') || 'true',
      format: searchParams.get('format') || 'json'
    })

    logger.info('Dashboard API called', { 
      requestId, 
      query,
      source: 'MOCK_DATA'
    })

    // Fetch dashboard data
    const dashboardData = await service.getDashboardData(query)

    // Calculate response time
    const responseTime = Date.now() - startTime
    dashboardData.meta.responseTime = responseTime
    dashboardData.meta.requestId = requestId

    // Add performance metrics
    const performance = {
      responseTime: `${responseTime}ms`,
      cached: dashboardData.meta.cache?.hit || false,
      queryComplexity: calculateQueryComplexity(query)
    }

    // Set response headers
    const headers = new Headers({
      'X-Response-Time': `${responseTime}ms`,
      'X-RateLimit-Limit': rate.limit.toString(),
      'X-RateLimit-Remaining': rate.remaining.toString(),
      'X-Request-ID': requestId,
      'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
      'X-Data-Source': 'MOCK'
    })

    // Handle different response formats
    if (query.format === 'csv') {
      const csv = convertToCSV(dashboardData)
      headers.set('Content-Type', 'text/csv')
      headers.set('Content-Disposition', `attachment; filename=dashboard-${query.period}-${Date.now()}.csv`)
      return new NextResponse(csv, { headers })
    }

    return NextResponse.json(
      {
        ...dashboardData,
        performance,
        notice: 'This is mock data for development/demo purposes'
      },
      { 
        headers,
        status: 200 
      }
    )

  } catch (error: any) {
    // Error handling
    logger.error('Dashboard API Error:', {
      requestId,
      error: error.message,
      stack: error.stack,
      time: Date.now() - startTime
    })

    const errorResponse = {
      error: 'Failed to load dashboard summary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code || 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      requestId
    }

    return NextResponse.json(errorResponse, { 
      status: error.status || 500,
      headers: {
        'X-Error-Code': error.code || 'INTERNAL_ERROR',
        'X-Request-ID': requestId
      }
    })
  }
}
