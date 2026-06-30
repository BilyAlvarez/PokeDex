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
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-cream flex items-center justify-center">
                <div className="w-8 h-8 bg-cream rounded-full" />
              </div>
              <div className="text-center">
                <p className="dex-mono-label">SYSTEM READY</p>
                <p className="text-[10px] font-mono text-gray-300 mt-0.5">Pokédex Real v0.1</p>
              </div>
            </div>
          </TopScreen>
        }
        bottomScreen={
          <BottomScreen>
            <div className="text-center mb-6">
              <h1 className="dex-brand-title">POKÉDEX</h1>
              <p className="text-charcoal/60 text-sm mt-1">Identify. Learn. Complete.</p>
              {user && (
                <p className="text-sm text-charcoal mt-2">Welcome, <span className="font-semibold">{user.username}</span>!</p>
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
              {user?.role === 'ADMIN' && (
                <Button variant="ghost" onClick={() => handleNavigation('/admin')}>
                  Admin
                </Button>
              )}
            </div>
          </BottomScreen>
        }
      />
      <AssistantPanel />
    </>
  )
}
