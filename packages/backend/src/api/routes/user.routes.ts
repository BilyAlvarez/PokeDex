import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { getUserProgress, updateUserProgress, getScanHistory } from '../../services/user.service'
import { progressUpdateSchema } from '../../utils/validators'

const router = Router()

router.use(authMiddleware)

router.get('/progress', async (req, res, next) => {
  try {
    const progress = await getUserProgress(req.user!.userId)
    res.json(progress)
  } catch (error) {
    next(error)
  }
})

router.put('/progress', async (req, res, next) => {
  try {
    const { pokemonId, status, photoUrl } = progressUpdateSchema.parse(req.body)
    const result = await updateUserProgress(req.user!.userId, pokemonId, status, photoUrl)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.get('/scans', async (req, res, next) => {
  try {
    const scans = await getScanHistory(req.user!.userId)
    res.json(scans)
  } catch (error) {
    next(error)
  }
})

export default router
