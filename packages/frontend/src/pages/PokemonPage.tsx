import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { PokemonDetail } from '../components/pokedex/PokemonDetail'
import { IdentificationCard } from '../components/pokedex/IdentificationCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { usePokemonStore } from '../stores/pokemonStore'
import { AssistantPanel } from '../components/assistant/AssistantPanel'

export function PokemonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { current, loading, error, fetchById, fetchByDexNumber } = usePokemonStore()

  useEffect(() => {
    if (!id) return
    if (/^\d+$/.test(id)) {
      fetchByDexNumber(parseInt(id, 10))
    } else {
      fetchById(id)
    }
  }, [id, fetchById, fetchByDexNumber])

  return (
    <>
      <DeviceShell
        ledStatus={current ? 'green' : 'off'}
        topScreen={
          <TopScreen>
            {current ? (
              <IdentificationCard pokemon={current} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center">
                <span className="text-2xl text-gray-400">?</span>
              </div>
            )}
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            {loading && <LoadingSpinner />}
            {error && <p className="dex-error">{error}</p>}
            {current && <PokemonDetail pokemon={current} />}
          </BottomScreen>
        }
        onNavigate={() => navigate('/search')}
        onSelect={() => navigate('/home')}
      />
      <AssistantPanel />
    </>
  )
}
