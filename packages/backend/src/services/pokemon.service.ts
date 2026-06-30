import { prisma } from '../config/database'
import { fetchPokemonByIdOrName, fetchPokemonList } from '../integrations/pokeapi'
import { formatPokemon, formatPokemonDetail, formatEvolution, formatMove } from '../utils/formatters'
import { PokemonData, PokemonDetail, EvolutionData, MoveData } from '../models/Pokemon'
import { AppError } from '../api/middleware/errorHandler.middleware'
import { cacheService } from './cache.service'

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

  const [pokemon, total] = await Promise.all([
    prisma.pokemon.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: { nationalDexNumber: 'asc' },
    }),
    prisma.pokemon.count({ where }),
  ])

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

  const data = await fetchPokemonByIdOrName(dexNumber)
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
      generation: data.generation,
    },
    include: {
      evolutions: { include: { evolvesTo: true } },
      moves: { orderBy: { level: 'asc' } },
    },
  })

  await cacheService.clear()
  return formatPokemonDetail(pokemon)
}

export async function syncPokemonBatch(start: number, end: number): Promise<number> {
  let synced = 0
  for (let i = start; i <= end; i++) {
    try {
      const existing = await prisma.pokemon.findUnique({ where: { nationalDexNumber: i } })
      if (existing) continue

      await syncPokemonFromApi(i)
      synced++
      console.log(`Synced #${i}`)
    } catch (error) {
      console.error(`Failed to sync #${i}:`, error)
    }
  }
  return synced
}
