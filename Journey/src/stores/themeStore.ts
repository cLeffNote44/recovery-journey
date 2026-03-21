import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => {
        const newValue = !state.isDarkMode
        document.documentElement.classList.toggle('dark', newValue)
        return { isDarkMode: newValue }
      }),
      setDarkMode: (value: boolean) => set(() => {
        document.documentElement.classList.toggle('dark', value)
        return { isDarkMode: value }
      }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)
