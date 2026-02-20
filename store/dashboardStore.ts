// store/dashboardStore.ts
import { create } from 'zustand'

interface DashboardState {
  data: any
  isLoading: boolean
  error: Error | null
  lastUpdated: Date | null
  refetch: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  refetch: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      set({ data, isLoading: false, error: null, lastUpdated: new Date() })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  }
}))
