import { useEffect, useCallback } from 'react'
import { usePokemonStore } from '../stores/pokemonStore'

export function usePokemon(dexNumber?: number) {
  const store = usePokemonStore()
  const fetchByDexNumber = usePokemonStore(s => s.fetchByDexNumber)

  useEffect(() => {
    if (dexNumber) {
      fetchByDexNumber(dexNumber)
    }
  }, [dexNumber, fetchByDexNumber])

  const fetchList = useCallback((params?: { page?: number; type?: string; search?: string }) => {
    const s = usePokemonStore.getState()
    s.fetchList(params)
  }, [])

  return { ...store, fetchList }
}
