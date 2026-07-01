import { motion } from 'framer-motion'
import { BaseStats } from '../../types/pokemon'

interface StatsChartProps {
  stats: BaseStats
  typeHex?: string
}

const STAT_NAMES: Record<keyof BaseStats, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'SPA',
  specialDefense: 'SPD',
  speed: 'SPE',
}

function getBarColor(value: number, typeHex?: string): string {
  if (typeHex) return typeHex
  if (value >= 100) return '#22c55e'
  if (value >= 70) return '#00b4d8'
  if (value >= 50) return '#f2b705'
  return '#ef4444'
}

export function StatsChart({ stats, typeHex }: StatsChartProps) {
  const maxStat = 255

  return (
    <div className="space-y-2.5">
      {(Object.keys(STAT_NAMES) as (keyof BaseStats)[]).map((key, i) => {
        const value = stats[key]
        const pct = Math.min((value / maxStat) * 100, 100)
        const barColor = getBarColor(value, typeHex)
        return (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="w-8 font-mono font-bold text-charcoal text-xs shrink-0">
              {STAT_NAMES[key]}
            </span>
            <div className="flex-1 bg-cream rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.15 + i * 0.065 }}
                className="h-full rounded-full"
                style={{ backgroundColor: barColor, opacity: 0.85 }}
              />
            </div>
            <span className="w-7 text-right font-mono text-xs text-charcoal tabular-nums shrink-0">
              {value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
