import { env } from '../config/env'
import { cacheService } from '../services/cache.service'
import { getIntegrationConfig } from '../services/integration-config.service'

async function getBaseUrl(): Promise<string> {
  const config = await getIntegrationConfig('pokeapi')
  return config?.baseUrl ?? env.POKEAPI_BASE_URL
}

interface PokeApiPokemon {
  id: number
  name: string
  types: { type: { name: string } }[]
  height: number
  weight: number
  abilities: { ability: { name: string }; is_hidden: boolean }[]
  stats: { base_stat: number; stat: { name: string } }[]
  sprites: {
    front_default: string | null
    front_shiny: string | null
    other: {
      'official-artwork': { front_default: string | null; front_shiny: string | null }
    }
  }
  species: { url: string }
}

interface PokeApiSpecies {
  flavor_text_entries: { flavor_text: string; language: { name: string } }[]
  genera: { genus: string; language: { name: string } }[]
  habitat: { name: string } | null
  evolution_chain: { url: string }
}

interface PokeApiEvolutionChain {
  chain: {
    species: { name: string; url: string }
    evolves_to: {
      species: { name: string; url: string }
      evolution_details: {
        trigger: { name: string }
        level: number | null
        item: { name: string } | null
        min_happiness: number | null
        min_affection: number | null
        trade_species: { name: string } | null
      }[]
      evolves_to: {
        species: { name: string; url: string }
        evolution_details: {
          trigger: { name: string }
          level: number | null
          item: { name: string } | null
          min_happiness: number | null
          min_affection: number | null
          trade_species: { name: string } | null
        }[]
      }[]
    }[]
  }
}

const STAT_MAP: Record<string, string> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
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

export async function fetchPokemonByIdOrName(identifier: string | number): Promise<NormalizedPokemon | null> {
  const cacheKey = `pokemon:${identifier}`
  const cached = await cacheService.get<NormalizedPokemon>(cacheKey)
  if (cached) return cached

  const baseUrl = await getBaseUrl()
  const pokemonRes = await fetch(`${baseUrl}/pokemon/${identifier}`)
  if (!pokemonRes.ok) return null
  const pokemonData: PokeApiPokemon = await pokemonRes.json()

  const speciesRes = await fetch(pokemonData.species.url)
  const speciesData: PokeApiSpecies = await speciesRes.json()

  const result = normalizePokemonData(pokemonData, speciesData)

  await cacheService.set(cacheKey, result, 86400)
  return result
}

export async function testConnection(): Promise<{ success: boolean; latency: number; message: string }> {
  const start = Date.now()
  const baseUrl = await getBaseUrl()
  const res = await fetch(`${baseUrl}/pokemon/1`)
  const latency = Date.now() - start
  if (!res.ok) return { success: false, latency, message: `HTTP ${res.status}: ${res.statusText}` }
  return { success: true, latency, message: `PokéAPI reachable (${latency}ms)` }
}

export async function fetchPokemonList(offset = 0, limit = 20): Promise<{ count: number; results: { name: string; url: string }[] }> {
  const cacheKey = `pokemon:list:${offset}:${limit}`
  const cached = await cacheService.get<{ count: number; results: { name: string; url: string }[] }>(cacheKey)
  if (cached) return cached

  const baseUrl = await getBaseUrl()
  const res = await fetch(`${baseUrl}/pokemon?offset=${offset}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch Pokemon list')
  const data: { results: { name: string; url: string }[]; count: number } = await res.json()

  const result = { count: data.count, results: data.results }
  await cacheService.set(cacheKey, result, 300)
  return result
}

export async function fetchEvolutionChain(url: string) {
  const cacheKey = `evolution:${url}`
  const cached = await cacheService.get(cacheKey)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) return null
  const data: PokeApiEvolutionChain = await res.json()

  const result = parseEvolutionChain(data.chain)
  await cacheService.set(cacheKey, result, 86400)
  return result
}

function normalizePokemonData(pokemon: PokeApiPokemon, species: PokeApiSpecies) {
  const stats: Record<string, number> = {}
  for (const s of pokemon.stats) {
    const key = STAT_MAP[s.stat.name] || s.stat.name
    stats[key] = s.base_stat
  }

  const englishEntry = species.flavor_text_entries.find(e => e.language.name === 'en')
  const englishGenus = species.genera.find(g => g.language.name === 'en')

  return {
    nationalDexNumber: pokemon.id,
    name: pokemon.name,
    types: pokemon.types.map(t => t.type.name),
    height: pokemon.height / 10,
    weight: pokemon.weight / 10,
    description: englishEntry?.flavor_text.replace(/[\n\f]/g, ' ') ?? '',
    habitat: species.habitat?.name ?? null,
    category: englishGenus?.genus ?? null,
    abilities: pokemon.abilities.filter(a => !a.is_hidden).map(a => a.ability.name),
    baseStats: stats,
    spriteUrl: pokemon.sprites.front_default,
    artworkUrl: pokemon.sprites.other['official-artwork'].front_default,
    shinySpriteUrl: pokemon.sprites.front_shiny ?? null,
    shinyArtworkUrl: pokemon.sprites.other?.['official-artwork']?.front_shiny ?? null,
    generation: guessGeneration(pokemon.id),
  }
}

function parseEvolutionChain(chain: PokeApiEvolutionChain['chain']): {
  species: string
  evolvesTo: {
    species: string
    condition: string | null
    conditionDetail: string | null
    evolvesTo: { species: string; condition: string | null; conditionDetail: string | null }[]
  }[]
} {
  return {
    species: chain.species.name,
    evolvesTo: chain.evolves_to.map(e => ({
      species: e.species.name,
      condition: e.evolution_details[0]?.trigger.name ?? null,
      conditionDetail: formatEvolutionDetail(e.evolution_details[0]),
      evolvesTo: e.evolves_to.map(e2 => ({
        species: e2.species.name,
        condition: e2.evolution_details[0]?.trigger.name ?? null,
        conditionDetail: formatEvolutionDetail(e2.evolution_details[0]),
      })),
    })),
  }
}

function formatEvolutionDetail(detail: PokeApiEvolutionChain['chain']['evolves_to'][0]['evolution_details'][0] | undefined): string | null {
  if (!detail) return null
  const parts: string[] = []
  if (detail.level) parts.push(`Level ${detail.level}`)
  if (detail.item?.name) parts.push(`Use ${detail.item.name}`)
  if (detail.min_happiness) parts.push(`Happiness ≥ ${detail.min_happiness}`)
  if (detail.min_affection) parts.push(`Affection ≥ ${detail.min_affection}`)
  if (detail.trade_species?.name) parts.push(`Trade with ${detail.trade_species.name}`)
  return parts.length > 0 ? parts.join(', ') : null
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
