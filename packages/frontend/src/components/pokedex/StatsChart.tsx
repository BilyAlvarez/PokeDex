import { BaseStats } from '../../types/pokemon'

interface StatsChartProps {
  stats: BaseStats
}

const STAT_NAMES: Record<keyof BaseStats, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SPA',
  specialDefense: 'SPD',
  speed: 'SPE',
}

export function StatsChart({ stats }: StatsChartProps) {
  const maxStat = 255

  return (
    <div className="space-y-1">
      {(Object.keys(STAT_NAMES) as (keyof BaseStats)[]).map(key => {
        const value = stats[key]
        const pct = Math.min((value / maxStat) * 100, 100)
        return (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className="w-8 font-mono font-bold text-charcoal text-xs">{STAT_NAMES[key]}</span>
            <div className="flex-1 bg-cream rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-pokedex-cyan transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right font-mono text-xs text-charcoal">{value}</span>
          </div>
        )
      })}
    </div>
  )
}
