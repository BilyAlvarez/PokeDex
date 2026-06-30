const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400', fire: 'bg-orange-500', water: 'bg-blue-500',
  electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-cyan-300',
  fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-amber-600',
  flying: 'bg-indigo-300', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-yellow-700', ghost: 'bg-purple-700', dragon: 'bg-indigo-600',
  dark: 'bg-gray-700', steel: 'bg-gray-400', fairy: 'bg-pink-300',
}

interface TypeBadgeProps {
  type: string
  size?: 'sm' | 'md'
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const color = TYPE_COLORS[type] || 'bg-gray-400'
  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`${color} ${textSize} text-white font-semibold rounded-full uppercase tracking-wide`}>
      {type}
    </span>
  )
}
