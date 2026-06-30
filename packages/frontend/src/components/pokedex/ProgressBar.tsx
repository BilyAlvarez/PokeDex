interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const barColor = pct >= 80 ? 'bg-pokedex-amber' : pct >= 40 ? 'bg-pokedex-red' : 'bg-pokedex-cyan'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-charcoal font-mono">
        <span>{current} / {total}</span>
        <span className={pct >= 80 ? 'text-pokedex-amber font-bold' : ''}>{pct}%</span>
      </div>
      <div className="bg-cream rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
