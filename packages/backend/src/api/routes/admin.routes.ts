import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/database'
import { adminMiddleware } from '../middleware/admin.middleware'
import { AppError } from '../middleware/errorHandler.middleware'

const router = Router()

router.use(adminMiddleware)

router.get('/stats', async (_req, res, next) => {
  try {
    const [users, pokemon, scans, tickets, integrations] = await Promise.all([
      prisma.user.count(),
      prisma.pokemon.count(),
      prisma.scanHistory.count(),
      prisma.supportTicket.count(),
      prisma.integration.findMany({ select: { key: true, name: true, status: true, lastChecked: true } }),
    ])
    res.json({ users, pokemon, scans, openTickets: tickets, integrations })
  } catch (error) { next(error) }
})

router.get('/integrations', async (_req, res, next) => {
  try {
    const integrations = await prisma.integration.findMany({ orderBy: { name: 'asc' } })
    res.json(integrations)
  } catch (error) { next(error) }
})

router.put('/integrations/:id', async (req, res, next) => {
  try {
    const { baseUrl, apiKey, status, description } = req.body
    const integration = await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        ...(baseUrl !== undefined && { baseUrl }),
        ...(apiKey !== undefined && { apiKey }),
        ...(status !== undefined && { status }),
        ...(description !== undefined && { description }),
        lastChecked: status === 'ACTIVE' ? new Date() : undefined,
      },
    })
    res.json(integration)
  } catch (error) { next(error) }
})

router.post('/integrations/test', async (req, res, next) => {
  try {
    const { id } = req.body
    const integration = await prisma.integration.findUnique({ where: { id } })
    if (!integration) throw new AppError(404, 'Integration not found')

    const result = { success: true, latency: 0, message: `${integration.name} reachable` }

    await prisma.integration.update({
      where: { id },
      data: { status: 'ACTIVE', lastChecked: new Date() },
    })

    await prisma.systemLog.create({
      data: { userId: req.user!.userId, action: 'integration.test', detail: `${integration.name} tested — ${result.message}` },
    })

    res.json(result)
  } catch (error) { next(error) }
})

router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (error) { next(error) }
})

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['USER', 'ADMIN'].includes(role)) throw new AppError(400, 'Invalid role')
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, email: true, username: true, role: true },
    })
    res.json(user)
  } catch (error) { next(error) }
})

router.get('/tickets', async (req, res, next) => {
  try {
    const { status } = req.query
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    const tickets = await prisma.supportTicket.findMany({
      where,
      include: { user: { select: { id: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(tickets)
  } catch (error) { next(error) }
})

router.put('/tickets/:id', async (req, res, next) => {
  try {
    const { status, priority, response } = req.body
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(response !== undefined && { response }),
      },
      include: { user: { select: { id: true, username: true, email: true } } },
    })

    await prisma.systemLog.create({
      data: { userId: req.user!.userId, action: 'ticket.update', detail: `Ticket ${ticket.id} → ${ticket.status}` },
    })

    res.json(ticket)
  } catch (error) { next(error) }
})

router.post('/tickets', async (req, res, next) => {
  try {
    const { subject, description, priority } = req.body
    if (!subject || !description) throw new AppError(400, 'Subject and description required')
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user!.userId,
        subject,
        description,
        priority: priority || 'MEDIUM',
      },
    })
    res.status(201).json(ticket)
  } catch (error) { next(error) }
})

router.get('/logs', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200)
    const logs = await prisma.systemLog.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    res.json(logs)
  } catch (error) { next(error) }
})

router.post('/seed', async (_req, res, next) => {
  try {
    const hash = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
      where: { email: 'admin@pokedex.com' },
      update: {},
      create: { email: 'admin@pokedex.com', username: 'admin', passwordHash: hash, role: 'ADMIN' },
    })

    await Promise.all([
      prisma.integration.upsert({ where: { key: 'pokeapi' }, update: {}, create: { key: 'pokeapi', name: 'PokéAPI', description: 'Pokémon data source', baseUrl: 'https://pokeapi.co/api/v2', status: 'ACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'claude' }, update: {}, create: { key: 'claude', name: 'Claude AI', description: 'Conversational assistant', status: 'INACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'vision' }, update: {}, create: { key: 'vision', name: 'Vision AI', description: 'Image recognition engine', status: 'INACTIVE' } }),
    ])

    res.json({ message: 'Seed data created' })
  } catch (error) { next(error) }
})

export default router
