import { Router } from 'express'
import { prisma } from '../../config/database'
import { authMiddleware } from '../middleware/auth.middleware'
import { AppError } from '../middleware/errorHandler.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/', async (req, res, next) => {
  try {
    const teams = await prisma.team.findMany({
      where: { userId: req.user!.userId },
      include: {
        slots: {
          include: { pokemon: true },
          orderBy: { slotIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(teams)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, slots } = req.body
    if (!name) throw new AppError(400, 'Team name is required')

    const team = await prisma.$transaction(async (tx) => {
      const created = await tx.team.create({
        data: {
          userId: req.user!.userId,
          name,
          slots: {
            create: (slots as { pokemonId: string; slotIndex: number }[]).map(
              (s) => ({
                pokemonId: s.pokemonId,
                slotIndex: s.slotIndex,
              })
            ),
          },
        },
        include: {
          slots: {
            include: { pokemon: true },
            orderBy: { slotIndex: 'asc' },
          },
        },
      })
      return created
    })

    res.status(201).json(team)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, slots } = req.body

    const existing = await prisma.team.findFirst({
      where: { id, userId: req.user!.userId },
    })
    if (!existing) throw new AppError(404, 'Team not found')

    const team = await prisma.$transaction(async (tx) => {
      await tx.teamSlot.deleteMany({ where: { teamId: id } })

      const updated = await tx.team.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          slots: {
            create: (slots as { pokemonId: string; slotIndex: number }[]).map(
              (s) => ({
                pokemonId: s.pokemonId,
                slotIndex: s.slotIndex,
              })
            ),
          },
        },
        include: {
          slots: {
            include: { pokemon: true },
            orderBy: { slotIndex: 'asc' },
          },
        },
      })
      return updated
    })

    res.json(team)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const existing = await prisma.team.findFirst({
      where: { id, userId: req.user!.userId },
    })
    if (!existing) throw new AppError(404, 'Team not found')

    await prisma.team.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
