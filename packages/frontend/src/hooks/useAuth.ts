import { useEffect } from 'react'
import { useUserStore } from '../stores/userStore'

export function useAuth() {
  const store = useUserStore()

  useEffect(() => {
    store.init()
  }, [])

  return store
}
