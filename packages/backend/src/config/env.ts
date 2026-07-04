import 'dotenv/config'
import crypto from 'crypto'

const rawSecret = process.env.JWT_SECRET
if (!rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}
const generatedSecret = !rawSecret ? crypto.randomBytes(32).toString('hex') : rawSecret

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  DATABASE_URL: process.env.DATABASE_URL || '',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()),
  POKEAPI_BASE_URL: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2',
  REDIS_URL: process.env.REDIS_URL || '',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  VISION_API_URL: process.env.VISION_API_URL || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
}
