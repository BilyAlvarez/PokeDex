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
  evolvesTo: {
    id: string
    nationalDexNumber: number
    name: string
    spriteUrl: string | null
    types: string[]
  }
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
  shinySpriteUrl: string | null
  shinyArtworkUrl: string | null
  cryUrl: string
}

export interface Team {
  id: string
  name: string
  slots: TeamSlot[]
  createdAt: string
}

export interface TeamSlot {
  id: string
  slotIndex: number
  pokemon: PokemonData
}

export interface PokemonListResponse {
  data: PokemonData[]
  total: number
  page: number
  totalPages: number
}
