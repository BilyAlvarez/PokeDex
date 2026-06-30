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
    { key: 'pokeapi', name: 'PokéAPI', description: 'Pokémon data source', baseUrl: 'https://pokeapi.co/api/v2', status: 'ACTIVE' as const },
    { key: 'claude', name: 'Claude AI', description: 'Conversational assistant', baseUrl: null, status: 'INACTIVE' as const },
    { key: 'vision', name: 'Vision AI', description: 'Image recognition engine', baseUrl: null, status: 'INACTIVE' as const },
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
