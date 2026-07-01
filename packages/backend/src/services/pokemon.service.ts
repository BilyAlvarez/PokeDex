import { prisma } from '../config/database'
import { fetchPokemonByIdOrName } from '../integrations/pokeapi'
import { fetchPokemonByIdOrName as fetchPokemonGraphql } from '../integrations/pokeapi-graphql'
import { formatPokemon, formatPokemonDetail, formatEvolution, formatMove } from '../utils/formatters'
import { PokemonData, PokemonDetail, EvolutionData, MoveData } from '../models/Pokemon'
import { AppError } from '../api/middleware/errorHandler.middleware'
import { cacheService } from './cache.service'
import type { Prisma } from '@prisma/client'

let syncLock = false

export async function listPokemon(params: {
  page: number
  limit: number
  type?: string
  generation?: number
  search?: string
}): Promise<{ data: PokemonData[]; total: number; page: number; totalPages: number }> {
  const skip = (params.page - 1) * params.limit
  const where: Record<string, unknown> = {}

  if (params.type) {
    where.types = { has: params.type }
  }
  if (params.generation) {
    where.generation = params.generation
  }
  if (params.search) {
    where.name = { contains: params.search, mode: 'insensitive' }
  }

  let total = await prisma.pokemon.count({ where })

  const maxDex = await prisma.pokemon.aggregate({ _max: { nationalDexNumber: true } })
  const currentMax = maxDex._max.nationalDexNumber ?? 0
  const totalSpecies = await getTotalSpeciesCount()
  if (currentMax < totalSpecies && !syncLock) {
    syncLock = true
    try {
      const start = currentMax + 1
      const end = Math.min(start + 49, totalSpecies)
      const inserted = await syncPokemonBatch(start, end)
      if (inserted > 0) {
        total = await prisma.pokemon.count({ where })
      }
    } finally {
      syncLock = false
    }
  }

  const pokemon = total > 0
    ? await prisma.pokemon.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { nationalDexNumber: 'asc' },
      })
    : []

  return {
    data: pokemon.map(formatPokemon),
    total,
    page: params.page,
    totalPages: Math.ceil(total / params.limit),
  }
}

export async function getPokemonById(id: string): Promise<PokemonDetail> {
  const pokemon = await prisma.pokemon.findUnique({
    where: { id },
    include: {
      evolutions: { include: { evolvesTo: true } },
      moves: { orderBy: { level: 'asc' } },
    },
  })

  if (!pokemon) {
    throw new AppError(404, 'Pokemon not found')
  }

  return formatPokemonDetail(pokemon)
}

export async function getPokemonByDexNumber(dexNumber: number): Promise<PokemonDetail> {
  const pokemon = await prisma.pokemon.findUnique({
    where: { nationalDexNumber: dexNumber },
    include: {
      evolutions: { include: { evolvesTo: true } },
      moves: { orderBy: { level: 'asc' } },
    },
  })

  if (!pokemon) {
    throw new AppError(404, 'Pokemon not found')
  }

  return formatPokemonDetail(pokemon)
}

export async function getEvolutions(pokemonId: string): Promise<EvolutionData[]> {
  const evolutions = await prisma.evolution.findMany({
    where: { pokemonId },
    include: { evolvesTo: true },
  })

  return evolutions.map(formatEvolution)
}

export async function getMoves(pokemonId: string): Promise<MoveData[]> {
  const moves = await prisma.move.findMany({
    where: { pokemonId },
    orderBy: [{ learnMethod: 'asc' }, { level: 'asc' }],
  })

  return moves.map(formatMove)
}

export async function syncPokemonFromApi(dexNumber: number): Promise<PokemonDetail> {
  const existing = await prisma.pokemon.findUnique({
    where: { nationalDexNumber: dexNumber },
  })

  if (existing) {
    return getPokemonByDexNumber(dexNumber)
  }

  let data = await fetchPokemonByIdOrName(dexNumber)
  if (!data) {
    data = await fetchPokemonGraphql(dexNumber)
  }
  if (!data) {
    throw new AppError(404, 'Pokemon not found in external API')
  }

  const pokemon = await prisma.pokemon.create({
    data: {
      nationalDexNumber: data.nationalDexNumber,
      name: data.name,
      types: data.types,
      height: data.height,
      weight: data.weight,
      description: data.description,
      habitat: data.habitat,
      category: data.category,
      abilities: data.abilities,
      baseStats: data.baseStats,
      spriteUrl: data.spriteUrl,
      artworkUrl: data.artworkUrl,
      shinySpriteUrl: data.shinySpriteUrl,
      shinyArtworkUrl: data.shinyArtworkUrl,
      generation: data.generation,
    },
  })

  await Promise.allSettled([
    syncMovesForPokemon(pokemon.id, dexNumber),
    syncEvolutionsForPokemon(pokemon.id, dexNumber),
  ])

  await cacheService.clear()
  return getPokemonById(pokemon.id)
}

// ── Helpers ─────────────────────────────────────────────────

const TOTAL_DEX_CACHE_KEY = 'totalDexCount'
const KNOWN_MAX_DEX = 1025
const SPECIES_BASE_URL = 'https://pokeapi.co/api/v2/pokemon-species'

async function getTotalSpeciesCount(): Promise<number> {
  const cached = await cacheService.get<number>(TOTAL_DEX_CACHE_KEY)
  if (cached) return cached
  try {
    const res = await fetch(`${SPECIES_BASE_URL}?limit=1`)
    if (!res.ok) return KNOWN_MAX_DEX
    const data: { count: number } = await res.json()
    await cacheService.set(TOTAL_DEX_CACHE_KEY, data.count, 86400)
    return data.count
  } catch (e) {
    console.error('pokemonService:getTotalSpeciesCount', e)
    return KNOWN_MAX_DEX
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// ── Batch sync ──────────────────────────────────────────────

export async function syncPokemonBatch(start: number, end: number, concurrency = 5): Promise<number> {
  let inserted = 0
  const queue: number[] = []
  for (let i = start; i <= end; i++) {
    queue.push(i)
  }
  while (queue.length > 0) {
    const batch = queue.splice(0, concurrency)
    const results = await Promise.allSettled(
      batch.map(async (dex): Promise<boolean> => {
        try {
          const existing = await prisma.pokemon.findUnique({ where: { nationalDexNumber: dex } })
          if (existing) return false
          let data = await fetchPokemonByIdOrName(dex)
          if (!data) {
            await delay(300)
            data = await fetchPokemonGraphql(dex)
          }
          if (!data) {
            await delay(500)
            data = await fetchPokemonByIdOrName(dex)
            if (!data) {
              data = await fetchPokemonGraphql(dex)
            }
          }
          if (!data) return false

          const pokemon = await prisma.pokemon.create({
            data: {
              nationalDexNumber: data.nationalDexNumber,
              name: data.name,
              types: data.types,
              height: data.height,
              weight: data.weight,
              description: data.description,
              habitat: data.habitat,
              category: data.category,
              abilities: data.abilities,
              baseStats: data.baseStats,
              spriteUrl: data.spriteUrl,
              artworkUrl: data.artworkUrl,
              shinySpriteUrl: data.shinySpriteUrl,
              shinyArtworkUrl: data.shinyArtworkUrl,
              generation: data.generation,
            },
          })

          await Promise.allSettled([
            syncMovesForPokemon(pokemon.id, dex),
            syncEvolutionsForPokemon(pokemon.id, dex),
          ])

          return true
        } catch (e) {
          console.error('pokemonService:syncPokemonBatch', e)
          return false
        }
      })
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) inserted++
    }
    await delay(200)
  }
  if (inserted > 0) {
    await cacheService.clear()
  }
  return inserted
}

// ── Moves sync ──────────────────────────────────────────────

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

interface RawMove {
  move: { name: string; url: string }
  version_group_details: Array<{
    level_learned_at: number
    move_learn_method: { name: string }
  }>
}

const LEARN_METHOD_MAP: Record<string, string> = {
  'level-up': 'LEVEL',
  machine: 'TM',
  egg: 'EGG',
  tutor: 'TUTOR',
}

const moveDetailCache = new Map<string, {
  type: string
  power: number | null
  accuracy: number | null
  pp: number | null
  description: string | null
}>()

async function fetchMoveDetail(moveName: string) {
  const cached = moveDetailCache.get(moveName)
  if (cached) return cached

  try {
    const res = await fetch(`${POKEAPI_BASE}/move/${moveName}`)
    if (!res.ok) {
      const fallback = { type: 'normal', power: null, accuracy: null, pp: null, description: null }
      moveDetailCache.set(moveName, fallback)
      return fallback
    }
    const data: {
      type: { name: string }
      power: number | null
      accuracy: number | null
      pp: number | null
      effect_entries: Array<{ effect: string; language: { name: string } }>
    } = await res.json()
    const englishEntry = data.effect_entries.find(e => e.language.name === 'en')
    const result = {
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      description: englishEntry?.effect.replace(/[\n\f]/g, ' ') ?? null,
    }
    moveDetailCache.set(moveName, result)
    return result
  } catch (e) {
    console.error('pokemonService:fetchMoveDetail', e)
    const fallback = { type: 'normal', power: null, accuracy: null, pp: null, description: null }
    moveDetailCache.set(moveName, fallback)
    return fallback
  }
}

async function syncMovesForPokemon(pokemonId: string, dexNumber: number): Promise<void> {
  try {
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${dexNumber}`)
    if (!res.ok) return
    const data: { moves: RawMove[] } = await res.json()
    if (!data.moves?.length) return

    const moves = data.moves.slice(0, 30)

    const moveRecords = await Promise.all(
      moves.map(async (m) => {
        const detail = m.version_group_details[0]
        if (!detail) return null

        const method = LEARN_METHOD_MAP[detail.move_learn_method.name] || 'LEVEL'
        const level = detail.level_learned_at ?? 0
        const moveDetail = await fetchMoveDetail(m.move.name)

        return {
          pokemonId,
          name: m.move.name,
          type: moveDetail.type,
          power: moveDetail.power,
          accuracy: moveDetail.accuracy,
          pp: moveDetail.pp,
          description: moveDetail.description,
          learnMethod: method,
          level,
        }
      })
    )

    const validMoves = moveRecords.filter(Boolean)
    if (validMoves.length > 0) {
      await prisma.move.createMany({ data: validMoves as Prisma.MoveCreateManyInput[], skipDuplicates: true })
    }
  } catch (e) {
    console.error('pokemonService:syncMovesForPokemon', e)
  }
}

// ── Evolutions sync ─────────────────────────────────────────

interface ChainLink {
  species: { name: string; url: string }
  evolution_details: Array<{
    trigger: { name: string }
    level: number | null
    item: { name: string } | null
    min_happiness: number | null
    min_affection: number | null
    trade_species: { name: string } | null
  }>
  evolves_to: ChainLink[]
}

async function syncEvolutionsForPokemon(pokemonId: string, dexNumber: number): Promise<void> {
  try {
    const speciesRes = await fetch(`${POKEAPI_BASE}/pokemon-species/${dexNumber}`)
    if (!speciesRes.ok) return
    const speciesData: { evolution_chain: { url: string } | null } = await speciesRes.json()
    if (!speciesData.evolution_chain?.url) return

    const chainRes = await fetch(speciesData.evolution_chain.url)
    if (!chainRes.ok) return
    const chainData: { chain: ChainLink } = await chainRes.json()

    const currentName = (await prisma.pokemon.findUnique({
      where: { id: pokemonId },
      select: { name: true },
    }))?.name
    if (!currentName) return

    const findEvolutions = (link: ChainLink, name: string): ChainLink[] | null => {
      if (link.species.name === name) {
        return link.evolves_to
      }
      for (const child of link.evolves_to) {
        const found = findEvolutions(child, name)
        if (found) return found
      }
      return null
    }

    const evolutions = findEvolutions(chainData.chain, currentName)
    if (!evolutions || evolutions.length === 0) return

    for (const evo of evolutions) {
      const dexMatch = evo.species.url.match(/\/pokemon-species\/(\d+)\//)
      if (!dexMatch) continue
      const targetDex = parseInt(dexMatch[1], 10)

      const targetPokemon = await prisma.pokemon.findUnique({
        where: { nationalDexNumber: targetDex },
      })
      if (!targetPokemon) continue

      const trigger = evo.evolution_details[0]
      const condition = trigger?.trigger.name ?? null
      const parts: string[] = []
      if (trigger?.level) parts.push(`Level ${trigger.level}`)
      if (trigger?.item?.name) parts.push(`Use ${trigger.item.name}`)
      if (trigger?.min_happiness) parts.push(`Happiness \u2265 ${trigger.min_happiness}`)
      if (trigger?.min_affection) parts.push(`Affection \u2265 ${trigger.min_affection}`)
      if (trigger?.trade_species?.name) parts.push(`Trade with ${trigger.trade_species.name}`)
      const conditionDetail = parts.length > 0 ? parts.join(', ') : condition

      await prisma.evolution.create({
        data: {
          pokemonId,
          evolvesToId: targetPokemon.id,
          condition,
          conditionDetail,
        },
      })
    }
  } catch (e) {
    console.error('pokemonService:syncEvolutionsForPokemon', e)
  }
}
