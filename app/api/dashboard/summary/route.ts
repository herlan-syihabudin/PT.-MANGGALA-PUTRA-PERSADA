import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { z } from 'zod'
import crypto from 'crypto'
import winston from 'winston'
import { prisma } from '@/lib/prisma' // Singleton Prisma
import { redis } from '@/lib/redis' // Singleton Redis

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

export const revalidate = 30 // ISR cache 30 detik

// Constants
const CACHE_TTL = 45 // Cache TTL in seconds
const RATE_LIMIT_MAX = 100 // Max requests per window
const RATE_LIMIT_WINDOW = '60 s' // Rate limit window

// Validation Schema
const QuerySchema = z.object({
  period: z.enum(['MTD', 'QTD', 'YTD', 'ALL']).default('MTD'),
  projectId: z.string().optional(),
  includeForecast: z.enum(['true', 'false']).default('false'),
  includeTrends: z.enum(['true', 'false']).default('false'),
  includeAlerts: z.enum(['true', 'false']).default('true'),
  format: z.enum(['json', 'csv']).default('json'),
})

// ======================
// Rate Limiter Singleton
// ======================

const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
  analytics: true,
})

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
// Service Layer
// ======================

class DashboardService {
  private prisma = prisma
  private redis = redis
  private logger = logger

  async getDashboardData(params: z.infer<typeof QuerySchema>) {
    const cacheKey = this.generateCacheKey(params)
    
    // Try cache first
    const cached = await this.getCachedData(cacheKey)
    if (cached) return cached

    // Parallel data fetching dengan SELECT minimal
    const [
      finance,
      projects,
      hr,
      inventory,
      pipeline,
      kpis,
      alerts,
      trends
    ] = await Promise.all([
      this.getFinanceData(params),
      this.getProjectData(params),
      this.getHRData(params),
      this.getInventoryData(params),
      this.getPipelineData(params),
      this.getKPIData(params),
      params.includeAlerts === 'true' ? this.getAlerts() : Promise.resolve({ count: 0, critical: 0, warning: 0, info: 0, items: [] }),
      params.includeTrends === 'true' ? this.getTrends(params) : Promise.resolve({})
    ])

    // Generate insights
    const insights = this.generateInsights({
      finance,
      projects,
      hr,
      inventory,
      pipeline,
      kpis
    })

    // Calculate forecasts jika diminta
    const forecast = params.includeForecast === 'true' 
      ? await this.generateForecast(finance, projects)
      : null

    const dashboardData = {
      summary: {
        period: params.period,
        timestamp: new Date().toISOString(),
        dataQuality: this.assessDataQuality({ finance, projects, hr, inventory }),
        cache: {
          hit: false,
          ttl: CACHE_TTL
        }
      },
      
      metrics: {
        finance: {
          current: {
            revenue: finance.current.revenue,
            expenses: finance.current.expenses,
            profit: finance.current.profit,
            margin: finance.current.margin,
            burnRate: finance.current.burnRate,
            runway: finance.current.runway,
            ebitda: finance.current.ebitda,
            workingCapital: finance.current.workingCapital
          },
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
        version: '4.2.0',
        engine: 'MPP Quantum Analytics',
        environment: process.env.NODE_ENV,
        dataSources: this.getDataSources()
      }
    }

    // Cache the result
    await this.cacheData(cacheKey, dashboardData)

    return dashboardData
  }

  // ======================
  // Data Fetching Methods
  // ======================

  private async getFinanceData(params: any): Promise<FinanceData> {
    const dateRange = this.getDateRange(params.period)
    
    const [revenue, expenses, cashflow] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'REVENUE',
          date: dateRange
        }
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'EXPENSE',
          date: dateRange
        }
      }),
      this.prisma.cashflow.findMany({
        where: { date: dateRange },
        orderBy: { date: 'asc' },
        select: { date: true, amount: true, type: true }
      })
    ])

    const totalRevenue = revenue._sum.amount || 0
    const totalExpenses = expenses._sum.amount || 0
    const profit = totalRevenue - totalExpenses
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    return {
      current: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: profit,
        margin: margin,
        burnRate: this.calculateBurnRate(totalExpenses),
        runway: this.calculateRunway(totalExpenses, await this.getCashBalance()),
        ebitda: this.calculateEBITDA(profit, totalExpenses),
        workingCapital: await this.calculateWorkingCapital()
      },
      
      trends: {
        revenue: await this.getRevenueTrend(params.period),
        expenses: await this.getExpenseTrend(params.period),
        margin: await this.getMarginTrend(params.period),
        cashflow: cashflow
      }
    }
  }

  private async getProjectData(params: any): Promise<ProjectData> {
    const projects = await this.prisma.project.findMany({
      where: this.getProjectFilter(params),
      select: {
        id: true,
        name: true,
        status: true,
        budget: true,
        actualCost: true,
        startDate: true,
        endDate: true,
        progress: true,
      }
    })

    const active = projects.filter(p => p.status === 'ACTIVE')
    const completed = projects.filter(p => p.status === 'COMPLETED')
    
    const now = new Date()
    const delayed = projects.filter(p => 
      p.status === 'ACTIVE' && 
      p.endDate && 
      p.endDate < now
    )

    const totalValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const actualCost = projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
    const variance = totalValue - actualCost
    const variancePercentage = totalValue > 0 ? (variance / totalValue) * 100 : 0

    const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0)
    const completionRate = projects.length > 0 ? totalProgress / projects.length : 0
    const onTimeDelivery = projects.length > 0 ? (completed.length / projects.length) * 100 : 0

    return {
      overview: {
        total: projects.length,
        active: active.length,
        delayed: delayed.length,
        completed: completed.length,
        totalValue: totalValue,
        actualCost: actualCost,
        variance: variance,
        variancePercentage: variancePercentage
      },
      
      performance: {
        completionRate: completionRate,
        onTimeDelivery: onTimeDelivery,
        delayImpact: this.calculateDelayImpact(delayed),
        avgDelayDays: this.calculateAvgDelay(delayed)
      }
    }
  }

  private async getHRData(params: any) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [employees, attendance, payroll] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.attendance.findMany({
        where: { date: today },
        select: { status: true }
      }),
      this.prisma.payroll.aggregate({
        _sum: { amount: true },
        where: { 
          month: today.getMonth() + 1,
          year: today.getFullYear()
        }
      })
    ])

    const present = attendance.filter(a => a.status === 'PRESENT').length
    const absent = attendance.filter(a => a.status === 'ABSENT').length
    const leave = attendance.filter(a => a.status === 'LEAVE').length
    const attendanceRate = employees > 0 ? (present / employees) * 100 : 0

    return {
      workforce: {
        total: employees,
        present,
        absent,
        leave,
        attendanceRate: attendanceRate
      },
      
      financial: {
        totalPayroll: payroll._sum.amount || 0,
        avgSalary: employees > 0 ? (payroll._sum.amount || 0) / employees : 0
      }
    }
  }

  private async getInventoryData(params: any) {
    const [materials, stockMovements] = await Promise.all([
      this.prisma.material.findMany({
        select: {
          id: true,
          name: true,
          minimumStock: true,
          stock: {
            select: { quantity: true, unitPrice: true }
          }
        }
      }),
      this.prisma.stockMovement.findMany({
        where: { date: this.getDateRange(params.period) },
        select: { type: true, quantity: true, date: true }
      })
    ])

    const totalItems = materials.length
    const lowStock = materials.filter(m => 
      (m.stock?.quantity || 0) <= (m.minimumStock || 0)
    ).length
    const outOfStock = materials.filter(m => 
      (m.stock?.quantity || 0) === 0
    ).length
    
    const totalValue = materials.reduce((sum, m) => 
      sum + ((m.stock?.quantity || 0) * (m.stock?.unitPrice || 0)), 0
    )

    return {
      stock: {
        totalItems,
        totalValue: totalValue,
        lowStock,
        outOfStock,
        stockHealth: this.calculateStockHealth(lowStock, totalItems),
        turnoverRate: this.calculateTurnoverRate(stockMovements, totalValue),
        daysOfInventory: this.calculateDaysOfInventory(stockMovements, totalValue)
      },
      
      alerts: {
        needsReorder: lowStock,
        critical: outOfStock
      }
    }
  }

  private async getPipelineData(params: any) {
    const opportunities = await this.prisma.opportunity.findMany({
      where: this.getPipelineFilter(params),
      select: {
        id: true,
        name: true,
        stage: true,
        value: true,
        probability: true,
        customer: {
          select: { name: true }
        }
      }
    })

    const stages = {
      new: opportunities.filter(o => o.stage === 'NEW'),
      followup: opportunities.filter(o => o.stage === 'FOLLOWUP'),
      survey: opportunities.filter(o => o.stage === 'SURVEY'),
      offer: opportunities.filter(o => o.stage === 'OFFER'),
      deal: opportunities.filter(o => o.stage === 'DEAL'),
      lost: opportunities.filter(o => o.stage === 'LOST')
    }

    const activeOpportunities = opportunities.filter(o => o.stage !== 'DEAL' && o.stage !== 'LOST')
    const totalValue = activeOpportunities.reduce((sum, o) => sum + o.value, 0)
    
    const weightedValue = activeOpportunities.reduce((sum, o) => 
      sum + (o.value * (o.probability / 100)), 0
    )

    return {
      overview: {
        total: opportunities.length,
        active: activeOpportunities.length,
        totalValue: totalValue,
        weightedValue: weightedValue,
        conversionRate: this.calculateConversionRate(opportunities)
      },
      
      stages: Object.entries(stages).reduce((acc, [stage, items]) => ({
        ...acc,
        [stage]: {
          count: items.length,
          value: items.reduce((sum, i) => sum + i.value, 0)
        }
      }), {}),
      
      forecast: {
        expected: this.calculateExpectedRevenue(opportunities),
        bestCase: this.calculateBestCaseRevenue(opportunities),
        worstCase: this.calculateWorstCaseRevenue(opportunities),
        confidence: this.calculateForecastConfidence(opportunities)
      }
    }
  }

  private async getKPIData(params: any) {
    const kpis = await this.prisma.kPI.findMany({
      where: { 
        period: params.period,
        year: new Date().getFullYear()
      },
      select: {
        id: true,
        name: true,
        category: true,
        value: true,
        targetId: true,
        historicalData: true
      }
    })

    const targets = await this.prisma.kPITarget.findMany({
      where: { year: new Date().getFullYear() },
      select: { id: true, value: true }
    })

    const targetMap = targets.reduce((acc, t) => ({ ...acc, [t.id]: t.value }), {})

    return kpis.reduce((acc, kpi) => {
      const target = targetMap[kpi.targetId]
      const achievement = target ? (kpi.value / target) * 100 : null

      return {
        ...acc,
        [kpi.category]: {
          ...acc[kpi.category],
          [kpi.name]: {
            value: kpi.value,
            target: target,
            achievement: achievement,
            status: this.getKPIStatus(achievement),
            trend: this.calculateTrend(kpi.historicalData || [])
          }
        }
      }
    }, {})
  }

  private async getAlerts() {
    const alerts = await this.prisma.alert.findMany({
      where: {
        resolved: false,
        severity: { in: ['CRITICAL', 'WARNING', 'INFO'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        severity: true,
        category: true,
        createdAt: true
      }
    })

    return {
      count: alerts.length,
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      warning: alerts.filter(a => a.severity === 'WARNING').length,
      info: alerts.filter(a => a.severity === 'INFO').length,
      items: alerts
    }
  }

  private async getTrends(params: any) {
    const historicalData = await this.prisma.dailySnapshot.findMany({
      where: {
        date: {
          gte: this.getHistoricalDateRange(params.period)
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        revenue: true,
        profit: true,
        activeProjects: true,
        attendance: true
      }
    })

    return {
      revenue: this.calculateTrend(historicalData.map(d => d.revenue || 0)),
      profit: this.calculateTrend(historicalData.map(d => d.profit || 0)),
      projects: this.calculateTrend(historicalData.map(d => d.activeProjects || 0)),
      attendance: this.calculateTrend(historicalData.map(d => d.attendance || 0))
    }
  }

  // ======================
  // Helper Methods
  // ======================

  private generateCacheKey(params: any): string {
    const hash = crypto.createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex')
    return `dashboard:${hash}`
  }

  private async getCachedData(key: string) {
    const cached = await this.redis.get(key)
    if (cached) {
      this.logger.info(`Cache hit for ${key}`)
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached
      return { ...data, meta: { ...data.meta, cache: { hit: true } } }
    }
    return null
  }

  private async cacheData(key: string, data: any) {
    await this.redis.set(key, JSON.stringify(data), { ex: CACHE_TTL })
    this.logger.info(`Cached data for ${key}`)
  }

  private getDateRange(period: string) {
    const now = new Date()
    const start = new Date(now)
    
    switch(period) {
      case 'MTD':
        start.setDate(1)
        break
      case 'QTD':
        start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case 'YTD':
        start.setMonth(0, 1)
        break
      case 'ALL':
        start.setFullYear(2000, 0, 1)
        break
    }
    
    return { gte: start, lte: now }
  }

  private getHistoricalDateRange(period: string) {
    const now = new Date()
    const start = new Date(now)
    
    switch(period) {
      case 'MTD':
        start.setMonth(start.getMonth() - 3)
        break
      case 'QTD':
        start.setMonth(start.getMonth() - 12)
        break
      case 'YTD':
        start.setFullYear(start.getFullYear() - 2)
        break
      default:
        start.setFullYear(start.getFullYear() - 1)
    }
    
    return { gte: start, lte: now }
  }

  private getProjectFilter(params: any) {
    if (params.projectId) {
      return { id: params.projectId }
    }
    return {}
  }

  private getPipelineFilter(params: any) {
    return this.getDateRange(params.period)
  }

  private async getCashBalance(): Promise<number> {
    const cash = await this.prisma.cashflow.aggregate({
      _sum: { amount: true }
    })
    return cash._sum.amount || 0
  }

  // ======================
  // Calculator Methods
  // ======================

  private calculateBurnRate(expenses: number): number {
    return expenses / 30
  }

  private calculateRunway(expenses: number, cash: number): string {
    if (expenses === 0) return 'Infinite'
    const days = Math.floor(cash / (expenses / 30))
    return `${days} days`
  }

  private calculateEBITDA(profit: number, expenses: number): number {
    return profit + (expenses * 0.2)
  }

  private async calculateWorkingCapital(): Promise<number> {
    const [assets, liabilities] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'ASSET' }
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'LIABILITY' }
      })
    ])
    return (assets._sum.amount || 0) - (liabilities._sum.amount || 0)
  }

  private async getRevenueTrend(period: string): Promise<any> {
    const data = await this.prisma.dailySnapshot.findMany({
      where: { date: this.getHistoricalDateRange(period) },
      select: { date: true, revenue: true },
      orderBy: { date: 'asc' }
    })
    
    if (data.length < 2) {
      return { direction: 'STABLE', percentage: 0 }
    }
    
    const first = data[0].revenue || 0
    const last = data[data.length-1].revenue || 0
    const base = first || 1 // Prevent division by zero
    const percentage = ((last - first) / base) * 100
    
    return {
      direction: last > first ? 'UP' : last < first ? 'DOWN' : 'STABLE',
      percentage: percentage
    }
  }

  private async getExpenseTrend(period: string): Promise<any> {
    const data = await this.prisma.dailySnapshot.findMany({
      where: { date: this.getHistoricalDateRange(period) },
      select: { date: true, expenses: true },
      orderBy: { date: 'asc' }
    })
    
    if (data.length < 2) {
      return { direction: 'STABLE', percentage: 0 }
    }
    
    const first = data[0].expenses || 0
    const last = data[data.length-1].expenses || 0
    const base = first || 1
    const percentage = ((last - first) / base) * 100
    
    return {
      direction: last > first ? 'UP' : last < first ? 'DOWN' : 'STABLE',
      percentage: percentage
    }
  }

  private async getMarginTrend(period: string): Promise<any> {
    const data = await this.prisma.dailySnapshot.findMany({
      where: { date: this.getHistoricalDateRange(period) },
      select: { date: true, margin: true },
      orderBy: { date: 'asc' }
    })
    
    if (data.length < 2) {
      return { direction: 'STABLE', percentage: 0 }
    }
    
    const first = data[0].margin || 0
    const last = data[data.length-1].margin || 0
    const percentage = last - first
    
    return {
      direction: last > first ? 'UP' : last < first ? 'DOWN' : 'STABLE',
      percentage: percentage
    }
  }

  private calculateDelayImpact(delayed: any[]): string {
    if (delayed.length > 5) return 'HIGH'
    if (delayed.length > 2) return 'MEDIUM'
    return 'LOW'
  }

  private calculateAvgDelay(delayed: any[]): number {
    if (delayed.length === 0) return 0
    return delayed.length * 5
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
    return totalOut / ((totalValue || 1) / 1000000)
  }

  private calculateDaysOfInventory(movements: any[], totalValue: number): number {
    const totalOut = movements
      .filter(m => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0)
    const avgDailyOut = totalOut / 30
    return avgDailyOut > 0 ? Math.floor(totalValue / avgDailyOut) : 0
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

  private calculateTrend(data: number[]): string {
    if (data.length < 2) return 'STABLE'
    const last = data[data.length - 1]
    const first = data[0]
    const base = first || 1
    const change = ((last - first) / base) * 100
    if (change > 5) return 'UP'
    if (change < -5) return 'DOWN'
    return 'STABLE'
  }

  private getKPIStatus(achievement: number | null): string {
    if (!achievement) return 'NO_TARGET'
    if (achievement >= 100) return 'EXCEEDED'
    if (achievement >= 80) return 'ON_TRACK'
    if (achievement >= 60) return 'AT_RISK'
    return 'CRITICAL'
  }

  private async generateForecast(finance: any, projects: any) {
    return {
      revenue: {
        nextMonth: finance.current.revenue * 1.1,
        nextQuarter: finance.current.revenue * 3.3,
        confidence: 'MEDIUM'
      },
      expenses: {
        nextMonth: finance.current.expenses * 1.05,
        trend: 'STABLE'
      }
    }
  }

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

    // Combine all insights
    insights.all = [...insights.finance, ...insights.projects, ...insights.hr, ...insights.inventory, ...insights.pipeline]
      .sort((a, b) => b.priority - a.priority)

    return insights
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

  private assessDataQuality(data: any): string {
    const checks = [
      data.finance?.current?.revenue !== 0,
      (data.projects?.overview?.total || 0) > 0,
      (data.hr?.workforce?.total || 0) > 0
    ]
    const score = checks.filter(Boolean).length / checks.length
    return score > 0.8 ? 'HIGH' : score > 0.5 ? 'MEDIUM' : 'LOW'
  }

  private getDataSources() {
    return ['PostgreSQL', 'Redis Cache']
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
    // Rate Limiting
    const identifier = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'anonymous'
    
    const rate = await rateLimiter.limit(identifier)
    
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

    // Parse and validate query params
    const { searchParams } = new URL(request.url)
    
    const query = QuerySchema.parse({
      period: searchParams.get('period') || 'MTD',
      projectId: searchParams.get('projectId'),
      includeForecast: searchParams.get('includeForecast') || 'false',
      includeTrends: searchParams.get('includeTrends') || 'false',
      includeAlerts: searchParams.get('includeAlerts') || 'true',
      format: searchParams.get('format') || 'json'
    })

    logger.info('Dashboard API called', { 
      requestId, 
      query,
      identifier: identifier.substring(0, 10)
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
      queryComplexity: calculateQueryComplexity(query) // FIXED: panggil static function
    }

    // Set response headers
    const headers = new Headers({
      'X-Response-Time': `${responseTime}ms`,
      'X-RateLimit-Limit': rate.limit.toString(), // FIXED: pake rate.limit
      'X-RateLimit-Remaining': rate.remaining.toString(), // FIXED: pake rate.remaining
      'X-Request-ID': requestId,
      'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
      'CDN-Cache-Control': `public, max-age=${CACHE_TTL}`,
      'Vercel-CDN-Cache-Control': `public, max-age=${CACHE_TTL}`
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
        performance
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
