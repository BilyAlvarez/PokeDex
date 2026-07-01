import { DPad } from './DPad'

interface ButtonPanelProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onSelect?: () => void
}

export function ButtonPanel({ onNavigate, onSelect }: ButtonPanelProps) {
  return (
    <div className="flex items-center justify-between">
      <DPad onNavigate={onNavigate} />
      <div className="flex items-center gap-3">
        <button
          onClick={onSelect}
          className="w-14 h-8 bg-pokedex-cyan text-white text-xs font-bold rounded-md
                     shadow-[0_3px_0_var(--color-pokedex-cyan-dark),0_4px_8px_rgba(0,0,0,0.2)]
                     active:shadow-[0_1px_0_var(--color-pokedex-cyan-dark)] active:translate-y-[2px]
                     transition-all duration-75 cursor-pointer select-none tracking-wider uppercase"
        >
          Select
        </button>
      </div>
    </div>
  )
}
