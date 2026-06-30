import 'dotenv/config'

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  POKEAPI_BASE_URL: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2',
  REDIS_URL: process.env.REDIS_URL || '',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  VISION_API_URL: process.env.VISION_API_URL || '',
}
