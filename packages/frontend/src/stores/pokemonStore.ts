import { create } from 'zustand'
import { PokemonData, PokemonDetail, PokemonListResponse } from '../types/pokemon'
import { api } from '../services/api'

interface PokemonState {
  list: PokemonData[]
  total: number
  page: number
  totalPages: number
  current: PokemonDetail | null
  loading: boolean
  error: string | null
  fetchList: (params?: { page?: number; limit?: number; type?: string; generation?: number; search?: string }) => Promise<void>
  fetchById: (id: string) => Promise<void>
  fetchByDexNumber: (dex: number) => Promise<void>
  clearCurrent: () => void
}

export const usePokemonStore = create<PokemonState>((set) => ({
  list: [],
  total: 0,
  page: 1,
  totalPages: 0,
  current: null,
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null })
    try {
      const res: PokemonListResponse = await api.pokemon.list(params)
      set({ list: res.data, total: res.total, page: res.page, totalPages: res.totalPages })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch' })
    } finally {
      set({ loading: false })
    }
  },

  fetchById: async (id) => {
    set({ loading: true, error: null, current: null })
    try {
      const pokemon = await api.pokemon.getById(id)
      set({ current: pokemon })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch' })
    } finally {
      set({ loading: false })
    }
  },

  fetchByDexNumber: async (dex) => {
    set({ loading: true, error: null, current: null })
    try {
      const pokemon = await api.pokemon.getByDexNumber(dex)
      set({ current: pokemon })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch' })
    } finally {
      set({ loading: false })
    }
  },

  clearCurrent: () => set({ current: null }),
}))
