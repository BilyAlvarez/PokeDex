import { useState } from 'react'
import { MoveData } from '../../types/pokemon'
import { TypeBadge } from './TypeBadge'

interface MovesListProps {
  moves: MoveData[]
}

export function MovesList({ moves }: MovesListProps) {
  const [filter, setFilter] = useState<string>('all')

  const methods = ['all', ...new Set(moves.map(m => m.learnMethod.toLowerCase()))]
  const filtered = filter === 'all' ? moves : moves.filter(m => m.learnMethod.toLowerCase() === filter)

  return (
    <div>
      <div className="flex gap-1 mb-3 flex-wrap">
        {methods.map(method => (
          <button
            key={method}
            onClick={() => setFilter(method)}
            className={`text-xs px-2 py-1 rounded-full capitalize cursor-pointer transition-colors
              ${filter === method ? 'bg-[#CC1F1F] text-white' : 'bg-[#E8E0D0] text-[#2D2D2D] hover:bg-gray-300'}`}
          >
            {method}
          </button>
        ))}
      </div>

      <div className="space-y-1 max-h-60 overflow-auto">
        {filtered.map(move => (
          <div key={move.id} className="flex items-center gap-2 text-sm bg-[#E8E0D0] rounded px-2 py-1.5">
            <TypeBadge type={move.type} size="sm" />
            <span className="flex-1 font-medium capitalize text-[#2D2D2D]">{move.name.replace('-', ' ')}</span>
            {move.level && <span className="text-xs font-mono text-gray-500">Lv.{move.level}</span>}
            {move.power && <span className="text-xs font-mono text-gray-500 w-8 text-right">{move.power}</span>}
            {move.accuracy && <span className="text-xs font-mono text-gray-500 w-8 text-right">{move.accuracy}%</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
