import { PokemonDetail as PokemonDetailType } from '../../types/pokemon'
import { TypeBadge } from './TypeBadge'
import { StatsChart } from './StatsChart'
import { EvolutionChain } from './EvolutionChain'
import { MovesList } from './MovesList'
import { HabitatBadge } from './HabitatBadge'

interface PokemonDetailProps {
  pokemon: PokemonDetailType
}

export function PokemonDetail({ pokemon }: PokemonDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2">
        {pokemon.artworkUrl && (
          <img src={pokemon.artworkUrl} alt={pokemon.name} className="w-32 h-32 object-contain" />
        )}
        <div className="text-center">
          <span className="dex-dex-number">#{String(pokemon.nationalDexNumber).padStart(3, '0')}</span>
          <h2 className="text-2xl font-bold capitalize text-charcoal">{pokemon.name}</h2>
          {pokemon.category && <p className="text-sm text-gray-500">{pokemon.category}</p>}
          <div className="flex gap-1 justify-center mt-2">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="dex-section-heading">Description</h3>
        <p className="text-sm text-charcoal leading-relaxed">{pokemon.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-mono text-gray-500">Height</span>
          <p className="font-semibold">{pokemon.height} m</p>
        </div>
        <div>
          <span className="font-mono text-gray-500">Weight</span>
          <p className="font-semibold">{pokemon.weight} kg</p>
        </div>
        <div>
          <span className="font-mono text-gray-500">Abilities</span>
          <p className="font-semibold capitalize">{pokemon.abilities.join(', ')}</p>
        </div>
        <div>
          <HabitatBadge habitat={pokemon.habitat} />
        </div>
      </div>

      <div>
        <h3 className="dex-section-heading">Base Stats</h3>
        <StatsChart stats={pokemon.baseStats} />
      </div>

      <div>
        <h3 className="dex-section-heading">Evolutions</h3>
        <EvolutionChain evolutions={pokemon.evolutions} />
      </div>

      <div>
        <h3 className="dex-section-heading">Moves</h3>
        <MovesList moves={pokemon.moves} />
      </div>
    </div>
  )
}
