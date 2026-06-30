import { EvolutionData } from '../../types/pokemon'

interface EvolutionChainProps {
  evolutions: EvolutionData[]
}

export function EvolutionChain({ evolutions }: EvolutionChainProps) {
  if (evolutions.length === 0) {
    return <p className="dex-empty not-italic">No evolutions</p>
  }

  return (
    <div className="space-y-3">
      {evolutions.map(evo => (
        <div key={evo.id} className="flex items-center gap-3 bg-cream rounded-lg p-3">
          {evo.evolvesTo.spriteUrl && (
            <img src={evo.evolvesTo.spriteUrl} alt={evo.evolvesTo.name} className="w-12 h-12 object-contain" />
          )}
          <div className="flex-1">
            <p className="font-semibold capitalize text-charcoal">{evo.evolvesTo.name}</p>
            <div className="flex gap-1 mt-1">
              {evo.evolvesTo.types.map(type => (
                <span key={type} className="text-xs bg-gray-200 px-2 py-0.5 rounded-full capitalize">{type}</span>
              ))}
            </div>
          </div>
          {evo.condition && (
            <span className="text-xs text-gray-500 italic text-right max-w-[120px]">{evo.conditionDetail || evo.condition}</span>
          )}
        </div>
      ))}
    </div>
  )
}
