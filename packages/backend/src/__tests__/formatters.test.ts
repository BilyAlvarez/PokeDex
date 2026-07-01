import { describe, it, expect } from 'vitest'
import type { Pokemon, Move } from '@prisma/client'
import { formatPokemonBaseStats, formatPokemon, formatMove } from '../utils/formatters'

describe('formatPokemonBaseStats', () => {
  it('should parse valid stats', () => {
    const result = formatPokemonBaseStats({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    })
    expect(result).toEqual({
      hp: 35,
      attack: 55,
      defense: 40,
      specialAttack: 50,
      specialDefense: 50,
      speed: 90,
    })
  })

  it('should default missing stats to 0', () => {
    const result = formatPokemonBaseStats({ hp: 10 })
    expect(result).toEqual({
      hp: 10,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    })
  })

})

describe('formatPokemon', () => {
  const mockPokemon: Pokemon = {
    id: 'test-id',
    nationalDexNumber: 25,
    name: 'pikachu',
    types: ['electric'],
    height: 0.4,
    weight: 6.0,
    description: 'A test pokemon',
    habitat: 'forest',
    category: 'Mouse',
    abilities: ['static'],
    baseStats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 },
    spriteUrl: 'https://example.com/sprite.png',
    artworkUrl: 'https://example.com/artwork.png',
    shinySpriteUrl: null,
    shinyArtworkUrl: null,
    generation: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should format pokemon data correctly', () => {
    const result = formatPokemon(mockPokemon)
    expect(result.id).toBe('test-id')
    expect(result.name).toBe('pikachu')
    expect(result.types).toEqual(['electric'])
    expect(result.nationalDexNumber).toBe(25)
    expect(result.generation).toBe(1)
    expect(result.baseStats.hp).toBe(35)
  })
})

describe('formatMove', () => {
  it('should format a move with all fields', () => {
    const mockMove: Move = {
      id: 'move-1',
      pokemonId: 'p-1',
      name: 'thunderbolt',
      type: 'electric',
      power: 90,
      accuracy: 100,
      pp: 15,
      description: 'A shocking move!',
      learnMethod: 'LEVEL',
      level: 10,
    }

    const result = formatMove(mockMove)
    expect(result.name).toBe('thunderbolt')
    expect(result.type).toBe('electric')
    expect(result.power).toBe(90)
    expect(result.learnMethod).toBe('LEVEL')
    expect(result.level).toBe(10)
  })

  it('should handle nullable fields', () => {
    const mockMove: Move = {
      id: 'move-2',
      pokemonId: 'p-1',
      name: 'growl',
      type: 'normal',
      power: null,
      accuracy: null,
      pp: null,
      description: null,
      learnMethod: 'EGG',
      level: null,
    }

    const result = formatMove(mockMove)
    expect(result.name).toBe('growl')
    expect(result.power).toBeNull()
    expect(result.level).toBeNull()
  })
})
