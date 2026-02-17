"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface ERPStore {
  // ===== UI STATE =====
  collapsed: boolean
  toggleSidebar: () => void
  setCollapsed: (v: boolean) => void

  // ===== REALTIME COUNTS =====
  counts: {
    estimator_inquiry: number
    finance_approval: number
    purchasing_request: number
  }
  setCounts: (newCounts: Partial<ERPStore["counts"]>) => void

  // ===== USER SESSION =====
  user: {
    name: string
    role: string
    email: string
  } | null
  setUser: (user: ERPStore["user"]) => void
}

export const useERPStore = create<ERPStore>()(
  persist(
    (set) => ({
      // ===== Sidebar =====
      collapsed: false,
      toggleSidebar: () =>
        set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (v) => set({ collapsed: v }),

      // ===== Realtime Counts =====
      counts: {
        estimator_inquiry: 0,
        finance_approval: 0,
        purchasing_request: 0,
      },
      setCounts: (newCounts) =>
        set((state) => ({
          counts: { ...state.counts, ...newCounts },
        })),

      // ===== User =====
      user: null,
      setUser: (userData) => set({ user: userData }),
    }),
    {
      name: "mpp-erp-storage",

      // ⛔️ PENTING: cuma simpan UI ke localStorage
      partialize: (state) => ({
        collapsed: state.collapsed,
      }),

      storage: createJSONStorage(() => localStorage),
    }
  )
)
