import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { PokemonDetail } from '../components/pokedex/PokemonDetail'
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
  }, [id])

  return (
    <>
      <DeviceShell
        ledStatus={current ? 'green' : 'off'}
        topScreen={
          <TopScreen>
            {current?.spriteUrl && (
              <img src={current.spriteUrl} alt={current.name} className="w-24 h-24 object-contain" />
            )}
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            {loading && <LoadingSpinner />}
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
