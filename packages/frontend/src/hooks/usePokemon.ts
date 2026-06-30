import { useEffect, useCallback } from 'react'
import { usePokemonStore } from '../stores/pokemonStore'

export function usePokemon(dexNumber?: number) {
  const store = usePokemonStore()

  useEffect(() => {
    if (dexNumber) {
      store.fetchByDexNumber(dexNumber)
    }
  }, [dexNumber])

  const fetchList = useCallback((params?: { page?: number; type?: string; search?: string }) => {
    store.fetchList(params)
  }, [])

  return { ...store, fetchList }
}
