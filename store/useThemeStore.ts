import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ThemeState {
  dark: boolean
  toggleTheme: () => void
  setDark: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,

      toggleTheme: () =>
        set((s) => ({
          dark: !s.dark,
        })),

      setDark: (value) =>
        set({
          dark: value,
        }),
    }),
    {
      name: "mpp-theme",
    }
  )
)
