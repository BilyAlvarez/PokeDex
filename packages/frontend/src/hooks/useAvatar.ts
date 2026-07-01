import { useState, useCallback } from 'react'

const KEY = 'pokedex-avatar-pokemon-id'

export function useAvatar() {
  const [avatarId, setIdState] = useState<number | null>(() => {
    const raw = localStorage.getItem(KEY)
    const n = raw ? parseInt(raw, 10) : NaN
    return isNaN(n) ? null : n
  })

  const setAvatarId = useCallback((id: number | null) => {
    if (id === null) {
      localStorage.removeItem(KEY)
    } else {
      localStorage.setItem(KEY, String(id))
    }
    setIdState(id)
  }, [])

  const spriteUrl = avatarId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${avatarId}.png`
    : null

  return { avatarId, setAvatarId, spriteUrl }
}
