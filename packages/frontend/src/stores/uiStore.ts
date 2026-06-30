import { create } from 'zustand'

type Section = 'home' | 'scan' | 'pokedex' | 'search' | 'assistant'

interface UIState {
  currentSection: Section
  assistantOpen: boolean
  ledStatus: 'off' | 'green' | 'yellow' | 'red'
  navigate: (section: Section) => void
  toggleAssistant: () => void
  setLedStatus: (status: 'off' | 'green' | 'yellow' | 'red') => void
}

export const useUIStore = create<UIState>((set) => ({
  currentSection: 'home',
  assistantOpen: false,
  ledStatus: 'green',

  navigate: (section) => set({ currentSection: section }),
  toggleAssistant: () => set(state => ({ assistantOpen: !state.assistantOpen })),
  setLedStatus: (status) => set({ ledStatus: status }),
}))
