import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pokedex.com' },
    update: {},
    create: {
      email: 'admin@pokedex.com',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  const userPassword = await bcrypt.hash('user123', 10)

  await prisma.user.upsert({
    where: { email: 'user@pokedex.com' },
    update: {},
    create: {
      email: 'user@pokedex.com',
      username: 'AshKetchum',
      passwordHash: userPassword,
      role: 'USER',
    },
  })

  const integrations = [
    { key: 'pokeapi', name: 'PokéAPI', type: 'data', description: 'Pokémon data source (REST)', baseUrl: 'https://pokeapi.co/api/v2', status: 'ACTIVE' as const },
    { key: 'pokeapi-graphql', name: 'PokéAPI GraphQL', type: 'data', description: 'Pokémon data source (GraphQL)', baseUrl: 'https://beta.pokeapi.co/graphql/v1beta', status: 'ACTIVE' as const },
    { key: 'claude', name: 'Claude AI', type: 'chat', description: 'Conversational assistant (Anthropic)', baseUrl: null, status: 'INACTIVE' as const },
    { key: 'vision', name: 'Vision AI', type: 'vision', description: 'Image recognition engine (external)', baseUrl: null, status: 'INACTIVE' as const },
    { key: 'ollama-vision', name: 'Ollama Vision', type: 'vision', description: 'Local image recognition via Ollama (llava)', baseUrl: 'http://localhost:11434', status: 'ACTIVE' as const },
    { key: 'ollama-chat', name: 'Ollama Chat', type: 'chat', description: 'Local conversational AI via Ollama (llama3)', baseUrl: 'http://localhost:11434', status: 'ACTIVE' as const },
    { key: 'gemini-vision', name: 'Gemini Vision', type: 'vision', description: 'Google Gemini API for image recognition', baseUrl: null, status: 'INACTIVE' as const },
  ]

  for (const int of integrations) {
    await prisma.integration.upsert({
      where: { key: int.key },
      update: {},
      create: int,
    })
  }

  console.log('Seed complete')
  console.log(`Admin: admin@pokedex.com / admin123`)
  console.log(`User:  user@pokedex.com  / user123`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
