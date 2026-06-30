import { PokemonDetail, PokemonData } from '../../types/pokemon'
import { TypeBadge } from './TypeBadge'

interface IdentificationCardProps {
  pokemon: PokemonData | PokemonDetail
}

export function IdentificationCard({ pokemon }: IdentificationCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {pokemon.spriteUrl && (
        <div className="dex-sprite-round">
          <img src={pokemon.spriteUrl} alt={pokemon.name} className="w-16 h-16 object-contain" />
        </div>
      )}
      <span className="dex-dex-number">#{String(pokemon.nationalDexNumber).padStart(3, '0')}</span>
      <h2 className="dex-screen-title capitalize leading-tight -mt-0.5">{pokemon.name}</h2>
      {pokemon.category && (
        <p className="dex-mono-label -mt-0.5">{pokemon.category}</p>
      )}
      <div className="flex gap-1 mt-0.5">
        {pokemon.types.map(type => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </div>
  )
}
