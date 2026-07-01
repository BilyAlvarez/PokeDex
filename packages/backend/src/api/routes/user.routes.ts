import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { getUserProgress, updateUserProgress, getUserStats, getScanHistory, updateProfile, changePassword } from '../../services/user.service'
import { progressUpdateSchema, updateProfileSchema, changePasswordSchema, createTicketSchema } from '../../utils/validators'
import { prisma } from '../../config/database'

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

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getUserStats(req.user!.userId)
    res.json(stats)
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

router.put('/profile', async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body)
    const user = await updateProfile(req.user!.userId, data)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.put('/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
    await changePassword(req.user!.userId, currentPassword, newPassword)
    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
})

router.get('/tickets', async (req, res, next) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(tickets)
  } catch (error) { next(error) }
})

router.post('/tickets', async (req, res, next) => {
  try {
    const { subject, description, priority } = createTicketSchema.parse(req.body)
    const ticket = await prisma.supportTicket.create({
      data: { userId: req.user!.userId, subject, description, priority: priority || 'MEDIUM' },
    })
    res.status(201).json(ticket)
  } catch (error) { next(error) }
})

export default router
