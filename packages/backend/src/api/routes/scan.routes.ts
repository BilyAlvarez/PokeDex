import { Router } from 'express'
import { authMiddleware, optionalAuth } from '../middleware/auth.middleware'
import { processScan } from '../../services/scan.service'
import { recordScan } from '../../services/user.service'
import { scanSchema } from '../../utils/validators'

const router = Router()

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { image } = scanSchema.parse(req.body)
    const result = await processScan(image)

    if (result.identified && result.pokemon && req.user) {
      await recordScan(
        req.user.userId,
        result.pokemon.id,
        result.confidence ?? 0,
      )
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
