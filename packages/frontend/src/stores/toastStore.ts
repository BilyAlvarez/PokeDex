import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title?: string
  message: string
  duration: number
}

interface ToastStore {
  toasts: ToastItem[]
  add: (toast: Omit<ToastItem, 'id'>) => string
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2, 9)
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },
  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export function useToast() {
  const add = useToastStore(s => s.add)
  const defaults = { duration: 4000 }
  return {
    success: (message: string, title?: string, opts?: Partial<ToastItem>) =>
      add({ variant: 'success', message, title, ...defaults, ...opts }),
    error: (message: string, title?: string, opts?: Partial<ToastItem>) =>
      add({ variant: 'error', message, title, ...defaults, ...opts }),
    warning: (message: string, title?: string, opts?: Partial<ToastItem>) =>
      add({ variant: 'warning', message, title, ...defaults, ...opts }),
    info: (message: string, title?: string, opts?: Partial<ToastItem>) =>
      add({ variant: 'info', message, title, ...defaults, ...opts }),
  }
}
