import { PokemonData } from '../../types/pokemon'
import { TypeBadge } from './TypeBadge'
import { useSound } from '../../hooks/useSound'
import { useNavigate } from 'react-router-dom'

interface PokemonCardProps {
  pokemon: PokemonData
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const navigate = useNavigate()
  const { playBip } = useSound()

  const handleClick = () => {
    playBip()
    navigate(`/pokemon/${pokemon.id}`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-bone rounded-xl p-3 border-2 border-cream
                 hover:border-pokedex-red hover:shadow-[0_4px_16px_rgba(204,31,31,0.15)]
                 transition-all duration-200 active:scale-[0.97] cursor-pointer text-left group"
    >
      <div className="flex items-center gap-3">
        {pokemon.spriteUrl && (
          <div className="dex-sprite-square">
            <img
              src={pokemon.spriteUrl}
              alt={pokemon.name}
              className="w-11 h-11 object-contain group-hover:scale-110 transition-transform duration-200"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="dex-dex-number">#{String(pokemon.nationalDexNumber).padStart(3, '0')}</span>
            <h3 className="font-semibold text-charcoal truncate capitalize group-hover:text-pokedex-red transition-colors">{pokemon.name}</h3>
          </div>
          <div className="flex gap-1 mt-1.5">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
        <span className="text-gray-300 group-hover:text-pokedex-red transition-colors text-sm">›</span>
      </div>
    </button>
  )
}
