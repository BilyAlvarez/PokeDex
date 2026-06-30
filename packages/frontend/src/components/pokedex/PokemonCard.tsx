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
      className="bg-[#F5F0E8] rounded-lg p-3 border-2 border-[#E8E0D0] hover:border-[#CC1F1F]
                 transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer text-left w-full"
    >
      <div className="flex items-center gap-3">
        {pokemon.spriteUrl && (
          <img src={pokemon.spriteUrl} alt={pokemon.name} className="w-16 h-16 object-contain" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-500">#{String(pokemon.nationalDexNumber).padStart(3, '0')}</span>
            <h3 className="font-semibold text-[#2D2D2D] truncate capitalize">{pokemon.name}</h3>
          </div>
          <div className="flex gap-1 mt-1">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}
