import { Router } from 'express'
import { listPokemon, getPokemonById, getPokemonByDexNumber, getEvolutions, getMoves, syncPokemonFromApi } from '../../services/pokemon.service'
import { pokemonQuerySchema } from '../../utils/validators'
import { AppError } from '../middleware/errorHandler.middleware'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const query = pokemonQuerySchema.parse(req.query)
    const result = await listPokemon(query)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/sync/:dexNumber', async (req, res, next) => {
  try {
    const dexNumber = parseInt(req.params.dexNumber, 10)
    if (isNaN(dexNumber)) throw new AppError(400, 'Invalid dex number')
    const pokemon = await syncPokemonFromApi(dexNumber)
    res.json(pokemon)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const param = req.params.id
    if (/^\d+$/.test(param)) {
      const pokemon = await getPokemonByDexNumber(parseInt(param, 10))
      res.json(pokemon)
    } else {
      const pokemon = await getPokemonById(param)
      res.json(pokemon)
    }
  } catch (error) {
    next(error)
  }
})

router.get('/:id/evolutions', async (req, res, next) => {
  try {
    const evolutions = await getEvolutions(req.params.id)
    res.json(evolutions)
  } catch (error) {
    next(error)
  }
})

router.get('/:id/moves', async (req, res, next) => {
  try {
    const moves = await getMoves(req.params.id)
    res.json(moves)
  } catch (error) {
    next(error)
  }
})

export default router
