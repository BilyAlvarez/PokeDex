import { Router } from 'express'
import { registerUser, loginUser } from '../../services/user.service'
import { registerSchema, loginSchema } from '../../utils/validators'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = registerSchema.parse(req.body)
    const result = await registerUser(email, username, password)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const result = await loginUser(email, password)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
