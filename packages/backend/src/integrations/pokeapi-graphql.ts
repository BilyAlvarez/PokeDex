import { cacheService } from '../services/cache.service'

const GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta'

const GET_POKEMON_QUERY = `
  query getPokemon($id: Int!) {
    pokemon_v2_pokemonspecies(where: {id: {_eq: $id}}) {
      id
      name
      pokemon_v2_pokemons {
        height
        weight
        pokemon_v2_pokemontypes {
          pokemon_v2_type { name }
        }
        pokemon_v2_pokemonabilities {
          is_hidden
          pokemon_v2_ability { name }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat { name }
        }
        pokemon_v2_pokemonsprites {
          sprites
        }
      }
      pokemon_v2_pokemonspeciesflavortexts(
        where: {language_id: {_eq: 9}}
        limit: 1
      ) {
        flavor_text
      }
      pokemon_v2_genera(
        where: {language_id: {_eq: 9}}
        limit: 1
      ) {
        genus
      }
      pokemon_v2_habitat {
        name
      }
      pokemon_v2_generation { id }
    }
  }
`

interface PokemonV2Response {
  pokemon_v2_pokemonspecies: Array<{
    id: number
    name: string
    pokemon_v2_pokemons: Array<{
      height: number
      weight: number
      pokemon_v2_pokemontypes: Array<{ pokemon_v2_type: { name: string } }>
      pokemon_v2_pokemonabilities: Array<{ is_hidden: boolean; pokemon_v2_ability: { name: string } }>
      pokemon_v2_pokemonstats: Array<{ base_stat: number; pokemon_v2_stat: { name: string } }>
      pokemon_v2_pokemonsprites: Array<{ sprites: Record<string, unknown> }>
    }>
    pokemon_v2_pokemonspeciesflavortexts: Array<{ flavor_text: string }>
    pokemon_v2_genera: Array<{ genus: string }>
    pokemon_v2_habitat: { name: string } | null
    pokemon_v2_generation: { id: number }
  }>
}

interface NormalizedPokemon {
  nationalDexNumber: number
  name: string
  types: string[]
  height: number
  weight: number
  description: string
  habitat: string | null
  category: string | null
  abilities: string[]
  baseStats: Record<string, number>
  spriteUrl: string | null
  artworkUrl: string | null
  shinySpriteUrl: string | null
  shinyArtworkUrl: string | null
  generation: number
}

const STAT_MAP: Record<string, string> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
}

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) return null
  const json = await res.json()
  if (json.errors) return null
  return json.data as T
}

export async function testConnection(): Promise<{ success: boolean; latency: number; message: string }> {
  const start = Date.now()
  const data = await graphqlRequest<PokemonV2Response>(GET_POKEMON_QUERY, { id: 1 })
  const latency = Date.now() - start
  if (!data || !data.pokemon_v2_pokemonspecies.length) {
    return { success: false, latency, message: 'GraphQL endpoint unreachable or returned no data' }
  }
  return { success: true, latency, message: `PokéAPI GraphQL reachable (${latency}ms)` }
}

export async function fetchPokemonByIdOrName(identifier: string | number): Promise<NormalizedPokemon | null> {
  const dexNumber = typeof identifier === 'number' ? identifier : parseInt(identifier, 10)
  if (isNaN(dexNumber)) return null

  const cacheKey = `pokeapi-gql:pokemon:${dexNumber}`
  const cached = await cacheService.get<NormalizedPokemon>(cacheKey)
  if (cached) return cached

  const data = await graphqlRequest<PokemonV2Response>(GET_POKEMON_QUERY, { id: dexNumber })
  if (!data) return null

  const species = data.pokemon_v2_pokemonspecies[0]
  if (!species) return null

  const pokemon = species.pokemon_v2_pokemons[0]
  if (!pokemon) return null

  const rawSprites: Record<string, unknown> = pokemon.pokemon_v2_pokemonsprites[0]?.sprites as Record<string, unknown> ?? {}
  const otherSprites = rawSprites.other as Record<string, Record<string, string | null>> | undefined
  const stats: Record<string, number> = {}
  for (const s of pokemon.pokemon_v2_pokemonstats) {
    const key = STAT_MAP[s.pokemon_v2_stat.name] || s.pokemon_v2_stat.name
    stats[key] = s.base_stat
  }

  const description = species.pokemon_v2_pokemonspeciesflavortexts[0]?.flavor_text?.replace(/[\n\f]/g, ' ') ?? ''
  const genus = species.pokemon_v2_genera[0]?.genus ?? null

  const result: NormalizedPokemon = {
    nationalDexNumber: species.id,
    name: species.name,
    types: pokemon.pokemon_v2_pokemontypes.map(t => t.pokemon_v2_type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    description,
    habitat: species.pokemon_v2_habitat?.name ?? null,
    category: genus,
    abilities: pokemon.pokemon_v2_pokemonabilities.filter(a => !a.is_hidden).map(a => a.pokemon_v2_ability.name),
    baseStats: stats,
    spriteUrl: (rawSprites.front_default as string | null) ?? null,
    artworkUrl: otherSprites?.['official-artwork']?.front_default ?? null,
    shinySpriteUrl: (rawSprites.front_shiny as string | null) ?? null,
    shinyArtworkUrl: otherSprites?.['official-artwork']?.front_shiny ?? null,
    generation: species.pokemon_v2_generation?.id ?? guessGeneration(species.id),
  }

  await cacheService.set(cacheKey, result, 86400)
  return result
}

function guessGeneration(dexNumber: number): number {
  if (dexNumber <= 151) return 1
  if (dexNumber <= 251) return 2
  if (dexNumber <= 386) return 3
  if (dexNumber <= 493) return 4
  if (dexNumber <= 649) return 5
  if (dexNumber <= 721) return 6
  if (dexNumber <= 809) return 7
  if (dexNumber <= 898) return 8
  return 9
}
