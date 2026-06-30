import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import { env } from '../config/env'
import { AppError } from '../api/middleware/errorHandler.middleware'
import { formatUserProgress, formatScanHistory } from '../utils/formatters'
import { UserData, UserProgressData, ScanHistoryData } from '../models/User'

export async function registerUser(email: string, username: string, password: string): Promise<{ user: UserData; token: string }> {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existing) {
    throw new AppError(409, 'Email or username already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  })

  const token = generateToken(user.id, user.email)

  return {
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    token,
  }
}

export async function loginUser(email: string, password: string): Promise<{ user: UserData; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError(401, 'Invalid email or password')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new AppError(401, 'Invalid email or password')
  }

  const token = generateToken(user.id, user.email)

  return {
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    token,
  }
}

export async function getUserProgress(userId: string): Promise<UserProgressData[]> {
  const progress = await prisma.userProgress.findMany({
    where: { userId },
  })

  return progress.map(formatUserProgress)
}

export async function updateUserProgress(
  userId: string,
  pokemonId: string,
  status: 'SEEN' | 'CAUGHT',
  photoUrl?: string,
): Promise<UserProgressData> {
  const pokemon = await prisma.pokemon.findUnique({ where: { id: pokemonId } })
  if (!pokemon) {
    throw new AppError(404, 'Pokemon not found')
  }

  const progress = await prisma.userProgress.upsert({
    where: { userId_pokemonId: { userId, pokemonId } },
    update: {
      status,
      scannedAt: status === 'SEEN' ? new Date() : undefined,
      photoUrl: photoUrl ?? undefined,
    },
    create: {
      userId,
      pokemonId,
      status,
      scannedAt: new Date(),
      photoUrl,
    },
  })

  return formatUserProgress(progress)
}

export async function getScanHistory(userId: string): Promise<ScanHistoryData[]> {
  const scans = await prisma.scanHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return scans.map(formatScanHistory)
}

export async function recordScan(
  userId: string,
  pokemonId: string,
  confidence: number,
  imageUrl?: string,
): Promise<ScanHistoryData> {
  const scan = await prisma.scanHistory.create({
    data: { userId, pokemonId, confidence, imageUrl },
  })

  await updateUserProgress(userId, pokemonId, 'SEEN')

  return formatScanHistory(scan)
}

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: '7d' })
}
