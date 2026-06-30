import { Pokemon, Evolution, Move, UserProgress, ScanHistory } from '@prisma/client'
import { PokemonData, PokemonDetail, BaseStats, EvolutionData, MoveData } from '../models/Pokemon'
import { UserProgressData, ScanHistoryData } from '../models/User'

export function formatPokemonBaseStats(stats: unknown): BaseStats {
  const s = stats as Record<string, number>
  return {
    hp: s.hp ?? 0,
    attack: s.attack ?? 0,
    defense: s.defense ?? 0,
    specialAttack: s.specialAttack ?? 0,
    specialDefense: s.specialDefense ?? 0,
    speed: s.speed ?? 0,
  }
}

export function formatPokemon(pokemon: Pokemon & { evolutions?: Evolution[]; moves?: Move[] }): PokemonData {
  return {
    id: pokemon.id,
    nationalDexNumber: pokemon.nationalDexNumber,
    name: pokemon.name,
    types: pokemon.types,
    height: pokemon.height,
    weight: pokemon.weight,
    description: pokemon.description,
    habitat: pokemon.habitat,
    category: pokemon.category,
    abilities: pokemon.abilities,
    baseStats: formatPokemonBaseStats(pokemon.baseStats),
    spriteUrl: pokemon.spriteUrl,
    artworkUrl: pokemon.artworkUrl,
    generation: pokemon.generation,
  }
}

export function formatPokemonDetail(pokemon: Pokemon & { evolutions: (Evolution & { evolvesTo: Pokemon })[]; moves: Move[] }): PokemonDetail {
  return {
    ...formatPokemon(pokemon),
    evolutions: pokemon.evolutions.map(formatEvolution),
    moves: pokemon.moves.map(formatMove),
  }
}

export function formatEvolution(evolution: Evolution & { evolvesTo: Pokemon }): EvolutionData {
  return {
    id: evolution.id,
    pokemonId: evolution.pokemonId,
    evolvesToId: evolution.evolvesToId,
    condition: evolution.condition,
    conditionDetail: evolution.conditionDetail,
    evolvesTo: {
      id: evolution.evolvesTo.id,
      nationalDexNumber: evolution.evolvesTo.nationalDexNumber,
      name: evolution.evolvesTo.name,
      spriteUrl: evolution.evolvesTo.spriteUrl,
      types: evolution.evolvesTo.types,
    },
  }
}

export function formatMove(move: Move): MoveData {
  return {
    id: move.id,
    name: move.name,
    type: move.type,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    description: move.description,
    learnMethod: move.learnMethod,
    level: move.level,
  }
}

export function formatUserProgress(progress: UserProgress): UserProgressData {
  return {
    pokemonId: progress.pokemonId,
    status: progress.status,
    scannedAt: progress.scannedAt,
    photoUrl: progress.photoUrl,
  }
}

export function formatScanHistory(scan: ScanHistory): ScanHistoryData {
  return {
    id: scan.id,
    pokemonId: scan.pokemonId,
    confidence: scan.confidence,
    imageUrl: scan.imageUrl,
    createdAt: scan.createdAt,
  }
}
