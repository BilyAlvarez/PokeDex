import { create } from 'zustand'
import { api } from '../services/api'

interface AdminUser {
  id: string
  email: string
  username: string
  role: string
}

interface AdminState {
  admin: AdminUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  init: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  token: null,
  loading: false,
  error: null,

  init: () => {
    const token = localStorage.getItem('admin-token')
    const admin = localStorage.getItem('admin-user')
    if (token && admin) {
      set({ token, admin: JSON.parse(admin) })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await api.auth.adminLogin({ email, password })
      localStorage.setItem('admin-token', res.token)
      localStorage.setItem('admin-user', JSON.stringify(res.user))
      set({ admin: res.user, token: res.token })
      return true
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Admin login failed' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    set({ admin: null, token: null })
  },
}))
