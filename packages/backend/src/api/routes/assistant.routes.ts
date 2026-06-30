import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.middleware'
import { processChat, narrateDescription } from '../../services/assistant.service'
import { chatSchema } from '../../utils/validators'
import { getPokemonById } from '../../services/pokemon.service'

const router = Router()

router.post('/chat', optionalAuth, async (req, res, next) => {
  try {
    const { message, pokemonId, section } = chatSchema.parse(req.body)

    let pokemonName: string | undefined
    if (pokemonId) {
      const pokemon = await getPokemonById(pokemonId)
      pokemonName = pokemon.name
    }

    const result = await processChat({
      message,
      pokemonId,
      pokemonName,
      section,
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/narrate', optionalAuth, async (req, res, next) => {
  try {
    const { pokemonId } = req.body
    if (!pokemonId) {
      res.status(400).json({ error: 'pokemonId is required' })
      return
    }

    const pokemon = await getPokemonById(pokemonId)
    const text = narrateDescription(
      pokemon.name,
      pokemon.description,
      pokemon.category,
      pokemon.types,
    )

    res.json({ text })
  } catch (error) {
    next(error)
  }
})

export default router
