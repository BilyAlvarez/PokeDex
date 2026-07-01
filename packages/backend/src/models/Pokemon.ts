export interface BaseStats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
}

export interface PokemonData {
  id: string
  nationalDexNumber: number
  name: string
  types: string[]
  height: number
  weight: number
  description: string
  habitat: string | null
  category: string | null
  abilities: string[]
  baseStats: BaseStats
  spriteUrl: string | null
  artworkUrl: string | null
  shinySpriteUrl: string | null
  shinyArtworkUrl: string | null
  generation: number
}

export interface EvolutionData {
  id: string
  pokemonId: string
  evolvesToId: string
  condition: string | null
  conditionDetail: string | null
  evolvesTo: Pick<PokemonData, 'id' | 'nationalDexNumber' | 'name' | 'spriteUrl' | 'types'>
}

export interface MoveData {
  id: string
  name: string
  type: string
  power: number | null
  accuracy: number | null
  pp: number | null
  description: string | null
  learnMethod: string
  level: number | null
}

export interface PokemonDetail extends PokemonData {
  evolutions: EvolutionData[]
  moves: MoveData[]
}
