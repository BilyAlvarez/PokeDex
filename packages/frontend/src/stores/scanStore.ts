import { create } from 'zustand'
import { ScanResponse } from '../types/assistant'
import { api } from '../services/api'

interface ScanState {
  scanning: boolean
  result: ScanResponse | null
  error: string | null
  scan: (image: string) => Promise<void>
  clear: () => void
}

export const useScanStore = create<ScanState>((set) => ({
  scanning: false,
  result: null,
  error: null,

  scan: async (image) => {
    set({ scanning: true, error: null, result: null })
    try {
      const result = await api.scan.submit(image)
      set({ result, scanning: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Scan failed', scanning: false })
    }
  },

  clear: () => set({ result: null, error: null }),
}))
