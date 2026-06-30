import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { PokemonCard } from '../components/pokedex/PokemonCard'
import { ProgressBar } from '../components/pokedex/ProgressBar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { usePokemonStore } from '../stores/pokemonStore'
import { useUserStore } from '../stores/userStore'
import { AssistantPanel } from '../components/assistant/AssistantPanel'

export function MyPokedexPage() {
  const navigate = useNavigate()
  const { list, total, loading, fetchList } = usePokemonStore()
  const { token } = useUserStore()
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    fetchList({ page, limit })
  }, [page])

  return (
    <>
      <DeviceShell
        ledStatus="green"
        topScreen={
          <TopScreen>
            <div className="text-center">
              <p className="text-lg font-bold text-[#2D2D2D]">My Pokédex</p>
              <ProgressBar current={total} total={898} />
            </div>
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            {loading && <LoadingSpinner />}

            {!token && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Login to track your progress</p>
                <Button onClick={() => navigate('/login')}>Login</Button>
              </div>
            )}

            <div className="space-y-2">
              {list.map(p => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
            </div>

            {total > limit && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="text-sm font-mono text-gray-500 self-center">Page {page}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </BottomScreen>
        }
        onNavigate={(dir) => {
          if (dir === 'left') navigate('/home')
          if (dir === 'right') navigate('/search')
        }}
      />
      <AssistantPanel />
    </>
  )
}
