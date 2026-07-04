import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/database'
import { adminMiddleware } from '../middleware/admin.middleware'
import { AppError } from '../middleware/errorHandler.middleware'
import { env } from '../../config/env'
import { testConnection as testPokeApi } from '../../integrations/pokeapi'
import { testConnection as testPokeApiGraphql } from '../../integrations/pokeapi-graphql'
import { testConnection as testOllama } from '../../integrations/ollama'
import { clearConfigCache } from '../../services/integration-config.service'
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  testIntegrationSchema,
  updateTicketSchema,
  createTicketSchema,
} from '../../utils/validators'

type IntegrationRecord = { key: string; baseUrl?: string | null }
type Tester = (integration: IntegrationRecord) => Promise<{ success: boolean; latency: number; message: string }>

const INTEGRATION_TESTERS: Record<string, Tester> = {
  pokeapi: () => testPokeApi(),
  'pokeapi-graphql': () => testPokeApiGraphql(),
  'ollama-vision': int => testOllama(int.baseUrl ?? 'http://localhost:11434'),
  'ollama-chat': int => testOllama(int.baseUrl ?? 'http://localhost:11434'),
}

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

router.post('/integrations', async (req, res, next) => {
  try {
    const { key, name, type, description, baseUrl, apiKey, status } = createIntegrationSchema.parse(req.body)
    const existing = await prisma.integration.findUnique({ where: { key } })
    if (existing) throw new AppError(409, 'Integration with this key already exists')
    const integration = await prisma.integration.create({
      data: {
        key,
        name,
        type: type || 'other',
        description: description || null,
        baseUrl: baseUrl || null,
        apiKey: apiKey || null,
        status: status || 'INACTIVE',
      },
    })
    clearConfigCache()
    await prisma.systemLog.create({
      data: { userId: req.user!.userId, action: 'integration.create', detail: `Integration ${name} (${key}) created` },
    })
    res.status(201).json(integration)
  } catch (error) { next(error) }
})

router.delete('/integrations/:id', async (req, res, next) => {
  try {
    const integration = await prisma.integration.findUnique({ where: { id: req.params.id } })
    if (!integration) throw new AppError(404, 'Integration not found')
    await prisma.integration.delete({ where: { id: req.params.id } })
    clearConfigCache()
    await prisma.systemLog.create({
      data: { userId: req.user!.userId, action: 'integration.delete', detail: `Integration ${integration.name} (${integration.key}) deleted` },
    })
    res.json({ message: 'Integration deleted' })
  } catch (error) { next(error) }
})

router.put('/integrations/:id', async (req, res, next) => {
  try {
    const { baseUrl, apiKey, status, type, description } = updateIntegrationSchema.parse(req.body)
    const integration = await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        ...(baseUrl !== undefined && { baseUrl }),
        ...(apiKey !== undefined && { apiKey }),
        ...(status !== undefined && { status }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        lastChecked: status === 'ACTIVE' ? new Date() : undefined,
      },
    })
    clearConfigCache()
    res.json(integration)
  } catch (error) { next(error) }
})

router.post('/integrations/test', async (req, res, next) => {
  try {
    const { id } = testIntegrationSchema.parse(req.body)
    const integration = await prisma.integration.findUnique({ where: { id } })
    if (!integration) throw new AppError(404, 'Integration not found')

    const tester = INTEGRATION_TESTERS[integration.key]
    const result = tester
      ? await tester(integration)
      : { success: true, latency: 0, message: `${integration.name} reachable` }

    await prisma.integration.update({
      where: { id },
      data: { status: result.success ? 'ACTIVE' : 'ERROR', lastChecked: new Date() },
    })

    clearConfigCache()
    await prisma.systemLog.create({
      data: { userId: req.user!.userId, action: 'integration.test', detail: `${integration.name} tested — ${result.message}` },
    })

    res.json(result)
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
    const { status, priority, response } = updateTicketSchema.parse(req.body)
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
    const { subject, description, priority } = createTicketSchema.parse(req.body)
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
    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10)
    await prisma.user.upsert({
      where: { email: 'admin@pokedex.com' },
      update: {},
      create: { email: 'admin@pokedex.com', username: 'admin', passwordHash: hash, role: 'ADMIN' },
    })

    await Promise.all([
      prisma.integration.upsert({ where: { key: 'pokeapi' }, update: {}, create: { key: 'pokeapi', name: 'PokéAPI', type: 'data', description: 'Pokémon data source (REST)', baseUrl: 'https://pokeapi.co/api/v2', status: 'ACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'pokeapi-graphql' }, update: {}, create: { key: 'pokeapi-graphql', name: 'PokéAPI GraphQL', type: 'data', description: 'Pokémon data source (GraphQL)', baseUrl: 'https://beta.pokeapi.co/graphql/v1beta', status: 'ACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'claude' }, update: {}, create: { key: 'claude', name: 'Claude AI', type: 'chat', description: 'Conversational assistant (Anthropic)', status: 'INACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'vision' }, update: {}, create: { key: 'vision', name: 'Vision AI', type: 'vision', description: 'Image recognition engine (external)', status: 'INACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'ollama-vision' }, update: {}, create: { key: 'ollama-vision', name: 'Ollama Vision', type: 'vision', description: 'Local image recognition via Ollama (llava)', baseUrl: 'http://localhost:11434', status: 'INACTIVE' } }),
      prisma.integration.upsert({ where: { key: 'ollama-chat' }, update: {}, create: { key: 'ollama-chat', name: 'Ollama Chat', type: 'chat', description: 'Local conversational AI via Ollama (llama3)', baseUrl: 'http://localhost:11434', status: 'ACTIVE' } }),
    ])

    res.json({ message: 'Seed data created' })
  } catch (error) { next(error) }
})

export default router
