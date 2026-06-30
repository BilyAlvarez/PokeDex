import { useNavigate } from 'react-router-dom'
import { DeviceShell } from '../components/device/DeviceShell'
import { TopScreen } from '../components/device/TopScreen'
import { BottomScreen } from '../components/device/BottomScreen'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useSound } from '../hooks/useSound'
import { AssistantPanel } from '../components/assistant/AssistantPanel'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { playBip } = useSound()

  const handleNavigation = (path: string) => {
    playBip()
    navigate(path)
  }

  return (
    <>
      <DeviceShell
        ledStatus="green"
        topScreen={
          <TopScreen>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
              alt="Pikachu"
              className="w-24 h-24 object-contain opacity-30"
            />
            <p className="text-xs font-mono text-gray-400">Pokédex Real v0.1</p>
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#CC1F1F] tracking-wider">POKÉDEX</h1>
              <p className="text-[#2D2D2D]/60 text-sm mt-1">Identify. Learn. Complete.</p>
              {user && (
                <p className="text-sm text-[#2D2D2D] mt-2">Welcome, <span className="font-semibold">{user.username}</span>!</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => handleNavigation('/scan')}>
                Scan
              </Button>
              <Button onClick={() => handleNavigation('/pokedex')}>
                My Pokédex
              </Button>
              <Button onClick={() => handleNavigation('/search')}>
                Search
              </Button>
              <Button variant={user ? 'ghost' : 'secondary'} onClick={() => handleNavigation(user ? '/pokedex' : '/login')}>
                {user ? 'Profile' : 'Login'}
              </Button>
            </div>
          </BottomScreen>
        }
      />
      <AssistantPanel />
    </>
  )
}
