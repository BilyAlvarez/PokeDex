import { create } from 'zustand'
import { UserData, UserProgressData } from '../types/user'
import { api } from '../services/api'

interface UserState {
  user: UserData | null
  token: string | null
  progress: UserProgressData[]
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
  fetchProgress: () => Promise<void>
  updateProgress: (pokemonId: string, status: 'SEEN' | 'CAUGHT', photoUrl?: string) => Promise<void>
  init: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  progress: [],
  loading: false,
  error: null,

  init: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      set({ token, user: JSON.parse(user) })
      get().fetchProgress()
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await api.auth.login({ email, password })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user, token: res.token })
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  register: async (email, username, password) => {
    set({ loading: true, error: null })
    try {
      const res = await api.auth.register({ email, username, password })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user, token: res.token })
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, progress: [] })
  },

  fetchProgress: async () => {
    if (!get().token) return
    try {
      const progress = await api.user.getProgress()
      set({ progress })
    } catch (e) {
      console.error('fetchProgress', e)
    }
  },

  updateProgress: async (pokemonId, status, photoUrl) => {
    try {
      const updated = await api.user.updateProgress({ pokemonId, status, photoUrl })
      set(state => ({
        progress: state.progress.map(p => p.pokemonId === pokemonId ? { ...p, ...updated } : p),
      }))
    } catch (e) {
      console.error('updateProgress', e)
    }
  },
}))
