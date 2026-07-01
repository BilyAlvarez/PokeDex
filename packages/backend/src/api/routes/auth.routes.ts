import { Router } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/database'
import { registerUser, loginUser } from '../../services/user.service'
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../utils/validators'
import { sendResetPasswordEmail } from '../../services/email.service'
import { AppError } from '../middleware/errorHandler.middleware'

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

router.post('/admin-login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const result = await loginUser(email, password)
    if (result.user.role !== 'ADMIN') {
      throw new AppError(403, 'Admin access required')
    }
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.json({ message: 'If that email exists, a reset link has been sent.' })
      return
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExp = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    })

    await sendResetPasswordEmail(email, resetToken)

    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body)

    const user = await prisma.user.findFirst({ where: { resetToken: token } })
    if (!user) throw new AppError(400, 'Invalid or expired reset token')

    if (!user.resetTokenExp || user.resetTokenExp < new Date()) {
      throw new AppError(400, 'Reset token has expired')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null },
    })

    res.json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    next(error)
  }
})

export default router
