import { scanImage } from '../integrations/visionAI'
import type { ScanImageError } from '../integrations/visionAI'
import { fetchPokemonByIdOrName } from '../integrations/pokeapi'
import { syncPokemonFromApi } from './pokemon.service'
import { AppError } from '../api/middleware/errorHandler.middleware'

export interface ScanResponse {
  identified: boolean
  pokemon?: {
    id: string
    nationalDexNumber: number
    name: string
    spriteUrl: string | null
    types: string[]
  }
  confidence?: number
  candidates?: { species: string; confidence: number }[]
  message: string
}

export async function processScan(imageBase64: string): Promise<ScanResponse> {
  const out = await scanImage(imageBase64)

  if ('error' in out) {
    const err: ScanImageError = out.error
    if (err.code === 'NO_INTEGRATION') {
      throw new AppError(400, err.message)
    }
    throw new AppError(502, err.message)
  }

  const result = out.result

  if (result.confidence >= 0.85) {
    const pokemon = await findOrSyncPokemon(result.species)
    return {
      identified: true,
      pokemon: {
        id: pokemon.id,
        nationalDexNumber: pokemon.nationalDexNumber,
        name: pokemon.name,
        spriteUrl: pokemon.spriteUrl,
        types: pokemon.types,
      },
      confidence: result.confidence,
      message: `I identify this Pokémon as ${pokemon.name}!`,
    }
  }

  if (result.confidence >= 0.5) {
    return {
      identified: false,
      candidates: result.candidates,
      confidence: result.confidence,
      message: 'I am not completely sure. Please select from the candidates below.',
    }
  }

  return {
    identified: false,
    message: 'Could not identify the Pokémon. Please try again with a clearer image.',
  }
}

async function findOrSyncPokemon(species: string) {
  const apiData = await fetchPokemonByIdOrName(species)
  if (!apiData) {
    throw new AppError(404, `Pokemon "${species}" not found`)
  }

  try {
    return await syncPokemonFromApi(apiData.nationalDexNumber)
  } catch (e) {
    console.error('scanService', e)
    return {
      id: apiData.nationalDexNumber.toString(),
      nationalDexNumber: apiData.nationalDexNumber,
      name: apiData.name,
      spriteUrl: apiData.spriteUrl,
      types: apiData.types,
    }
  }
}
