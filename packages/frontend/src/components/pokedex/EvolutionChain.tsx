import { motion } from 'framer-motion'
import { EvolutionData } from '../../types/pokemon'
import { TypeBadge } from './TypeBadge'

interface EvolutionChainProps {
  evolutions: EvolutionData[]
}

export function EvolutionChain({ evolutions }: EvolutionChainProps) {
  if (evolutions.length === 0) {
    return <p className="dex-empty not-italic text-sm">No known evolutions</p>
  }

  return (
    <div className="space-y-2">
      {evolutions.map((evo, i) => (
        <motion.div
          key={evo.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.07, duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-3 bg-cream rounded-xl p-3"
        >
          {/* Arrow */}
          <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>

          {/* Sprite */}
          {evo.evolvesTo.spriteUrl ? (
            <img
              src={evo.evolvesTo.spriteUrl}
              alt={evo.evolvesTo.name}
              className="w-12 h-12 object-contain drop-shadow-sm shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-cream-dark flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold capitalize text-charcoal text-sm leading-snug">
              {evo.evolvesTo.name}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {evo.evolvesTo.types.map(type => (
                <TypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
          </div>

          {/* Condition */}
          {evo.condition && (
            <span className="text-xs text-gray-400 italic text-right shrink-0 max-w-[100px]">
              {evo.conditionDetail ?? evo.condition}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
