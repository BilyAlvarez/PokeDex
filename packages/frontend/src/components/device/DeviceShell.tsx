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
    <div className="min-h-screen bg-[#2D2D2D] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[900px] bg-[#CC1F1F] rounded-2xl shadow-2xl p-6 border-2 border-[#8E1212]">
        <div className="flex items-center gap-2 mb-4">
          <LedIndicator status={ledStatus} />
          <span className="text-[#F5F0E8] text-xs font-mono tracking-wider uppercase opacity-70">Pokédex</span>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-[#F5F0E8] rounded-lg p-4 border-2 border-[#8E1212] shadow-inner min-h-[300px]">
            {topScreen}
          </div>

          <Hinge />

          <div className="flex-1 bg-[#F5F0E8] rounded-lg p-4 border-2 border-[#8E1212] shadow-inner min-h-[300px]">
            {bottomScreen}
          </div>
        </div>

        <div className="mt-4">
          <ButtonPanel onNavigate={onNavigate} onSelect={onSelect} />
        </div>

        {children}
      </div>
    </div>
  )
}
