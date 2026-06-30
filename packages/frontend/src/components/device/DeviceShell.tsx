import { ReactNode } from 'react'
import { Hinge } from './Hinge'
import { LedIndicator } from './LedIndicator'
import { ButtonPanel } from './ButtonPanel'

interface DeviceShellProps {
  topScreen: ReactNode
  bottomScreen: ReactNode
  ledStatus?: 'off' | 'green' | 'yellow' | 'red'
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onSelect?: () => void
  children?: ReactNode
}

export function DeviceShell({ topScreen, bottomScreen, ledStatus = 'green', onNavigate, onSelect, children }: DeviceShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-device-black to-charcoal flex items-center justify-center p-4">
      <div className="device-shell relative w-full max-w-[920px] bg-gradient-to-b from-pokedex-red to-[#b01818] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)] p-6 border-2 border-pokedex-dark">
        <div className="flex items-center gap-2 mb-4 px-1">
          <LedIndicator status={ledStatus} />
          <span className="text-bone/60 text-[10px] font-mono tracking-[0.2em] uppercase">Pokédex</span>
          <div className="flex-1" />
          <span className="text-bone/30 text-[10px] font-mono tracking-wider">v0.1</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-bone rounded-xl p-2.5 border-2 border-pokedex-dark shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] min-h-[320px]">
            {topScreen}
          </div>

          <Hinge />

          <div className="flex-1 bg-bone rounded-xl p-2.5 border-2 border-pokedex-dark shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] min-h-[320px]">
            {bottomScreen}
          </div>
        </div>

        <div className="mt-5 px-1">
          <ButtonPanel onNavigate={onNavigate} onSelect={onSelect} />
        </div>

        {children}
      </div>
    </div>
  )
}
