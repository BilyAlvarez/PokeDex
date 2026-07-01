import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'

import { env } from './config/env'
import { connectDatabase } from './config/database'
import { errorHandler } from './api/middleware/errorHandler.middleware'
import { rateLimit } from './api/middleware/rateLimit.middleware'
import { pokemonRoutes, authRoutes, userRoutes, scanRoutes, assistantRoutes, adminRoutes, teamRoutes } from './api/routes'
import { cacheService } from './services/cache.service'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' })
})

app.use('/api/v1/pokemon', pokemonRoutes)
app.use('/api/v1/auth', rateLimit(10, 60000), authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/scan', rateLimit(5, 60000), scanRoutes)
app.use('/api/v1/assistant', rateLimit(20, 60000), assistantRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/team', teamRoutes)

app.use(errorHandler)

async function start() {
  await connectDatabase()
  await cacheService.connect()
  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`)
  })
}

start()

export default app
