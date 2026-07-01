import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'es'
export type FontSize = 'small' | 'medium' | 'large'
export type ThemeMode = 'light' | 'dark'

interface PreferencesState {
  language: Language
  theme: ThemeMode
  notifications: boolean
  compactView: boolean
  fontSize: FontSize
  reduceMotion: boolean
  highContrast: boolean

  setLanguage: (l: Language) => void
  setTheme: (t: ThemeMode) => void
  toggleTheme: () => void
  toggleLanguage: () => void
  setNotifications: (v: boolean) => void
  setCompactView: (v: boolean) => void
  setFontSize: (s: FontSize) => void
  setReduceMotion: (v: boolean) => void
  setHighContrast: (v: boolean) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'light',
      notifications: true,
      compactView: false,
      fontSize: 'medium',
      reduceMotion: false,
      highContrast: false,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(s => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      toggleLanguage: () => set(s => ({ language: s.language === 'en' ? 'es' : 'en' })),
      setNotifications: (notifications) => set({ notifications }),
      setCompactView: (compactView) => set({ compactView }),
      setFontSize: (fontSize) => set({ fontSize }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
    }),
    { name: 'pokedex-preferences' }
  )
)
