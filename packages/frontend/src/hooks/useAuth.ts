import { useEffect } from 'react'
import { useUserStore } from '../stores/userStore'

export function useAuth() {
  const store = useUserStore()
  const init = useUserStore(s => s.init)

  useEffect(() => {
    init()
  }, [init])

  return store
}
