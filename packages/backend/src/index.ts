import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'

import { env } from './config/env'
import { connectDatabase } from './config/database'
import { errorHandler } from './api/middleware/errorHandler.middleware'
import { pokemonRoutes, authRoutes, userRoutes, scanRoutes, assistantRoutes, adminRoutes } from './api/routes'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' })
})

app.use('/api/v1/pokemon', pokemonRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/scan', scanRoutes)
app.use('/api/v1/assistant', assistantRoutes)
app.use('/api/v1/admin', adminRoutes)

app.use(errorHandler)

async function start() {
  await connectDatabase()
  app.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`)
  })
}

start()

export default app
