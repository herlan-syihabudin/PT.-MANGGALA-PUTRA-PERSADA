import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ERPStore {
  // Sidebar State
  collapsed: boolean
  toggleSidebar: () => void
  
  // Realtime Counts
  counts: {
    estimator_inquiry: number
    finance_approval: number
    purchasing_request: number
  }
  setCounts: (newCounts: Partial<ERPStore['counts']>) => void
  
  // User Session
  user: {
    name: string
    role: string
    email: string
  } | null
  setUser: (user: any) => void
}

export const useERPStore = create<ERPStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
      
      counts: {
        estimator_inquiry: 0,
        finance_approval: 0,
        purchasing_request: 0,
      },
      setCounts: (newCounts) => set((state) => ({ 
        counts: { ...state.counts, ...newCounts } 
      })),
      
      user: null,
      setUser: (userData) => set({ user: userData }),
    }),
    { 
      name: 'mpp-erp-storage',
      partialize: (state) => ({ collapsed: state.collapsed }) // Cuma simpan status sidebar di localstorage
    }
  )
)
