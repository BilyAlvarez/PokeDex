import { useEffect } from 'react'
import { useUserStore } from '../stores/userStore'

export function useUserProgress() {
  const { progress, fetchProgress, token } = useUserStore()

  useEffect(() => {
    if (token) {
      fetchProgress()
    }
  }, [token, fetchProgress])

  return { progress }
}
