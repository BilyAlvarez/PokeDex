import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { SearchBar } from '../components/search/SearchBar'
import { FilterPanel } from '../components/search/FilterPanel'
import { PokemonCard } from '../components/pokedex/PokemonCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { usePokemonStore } from '../stores/pokemonStore'
import { AssistantPanel } from '../components/assistant/AssistantPanel'

export function SearchPage() {
  const navigate = useNavigate()
  const { list, loading, fetchList } = usePokemonStore()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | undefined>()
  const [gen, setGen] = useState<number | undefined>()

  const doSearch = useCallback(() => {
    fetchList({ page: 1, type, generation: gen, search: search || undefined })
  }, [fetchList, type, gen, search])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  const handleSearch = (query: string) => {
    setSearch(query)
    if (query) doSearch()
  }

  return (
    <>
      <DeviceShell
        ledStatus="green"
        topScreen={
          <TopScreen>
            <SearchBar onSearch={handleSearch} />
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            <FilterPanel
              selectedType={type}
              selectedGen={gen}
              onTypeChange={setType}
              onGenChange={setGen}
            />

            <div className="mt-4 space-y-2">
              {loading && <LoadingSpinner />}
              {list.map(p => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
              {!loading && list.length === 0 && (
                <p className="dex-empty">No Pokémon found</p>
              )}
            </div>
          </BottomScreen>
        }
        onNavigate={(dir) => {
          if (dir === 'left') navigate('/pokedex')
          if (dir === 'right') navigate('/home')
        }}
      />
      <AssistantPanel />
    </>
  )
}
