import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (v: boolean) => void
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,

      toggle: () =>
        set((state) => ({
          collapsed: !state.collapsed,
        })),

      setCollapsed: (value: boolean) =>
        set({
          collapsed: value,
        }),
    }),
    {
      name: "mpp-sidebar-state",
      storage: createJSONStorage(() => localStorage),

      // 👇 TARO DI SINI
      onRehydrateStorage: () => (state) => {
        console.log("Sidebar state loaded:", state)
      },
    }
  )
)
