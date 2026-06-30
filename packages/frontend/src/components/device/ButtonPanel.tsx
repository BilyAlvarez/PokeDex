import { DPad } from './DPad'
import { Button } from '../ui/Button'

interface ButtonPanelProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  onSelect?: () => void
}

export function ButtonPanel({ onNavigate, onSelect }: ButtonPanelProps) {
  return (
    <div className="flex items-center justify-between">
      <DPad onNavigate={onNavigate} />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onSelect}>Select</Button>
      </div>
    </div>
  )
}
