import { getActiveIntegrationByType } from '../services/integration-config.service'
import { scanWithOllama } from './ollama'
import { env } from '../config/env'
import type { Integration as PrismaIntegration } from '@prisma/client'

export interface ScanResult {
  species: string
  confidence: number
  candidates: { species: string; confidence: number }[]
}

export async function scanImage(imageBase64: string): Promise<ScanResult | null> {
  let vision = await getActiveIntegrationByType('vision')

  if (!vision) {
    console.warn('visionAI: no ACTIVE vision integration — trying INACTIVE ollama-vision')
    const { prisma } = await import('../config/database')
    const row = await prisma.integration.findFirst({
      where: { type: 'vision', key: 'ollama-vision' },
    }) as PrismaIntegration | null
    if (row) {
      vision = {
        id: row.id,
        key: row.key,
        name: row.name,
        baseUrl: row.baseUrl,
        apiKey: row.apiKey,
      }
    }
  }

  if (!vision) {
    console.error('visionAI: no vision integration found at all')
    return null
  }

  if (vision.key === 'ollama-vision') {
    return scanWithOllama(imageBase64, vision.baseUrl ?? undefined)
  }

  const visionUrl = vision.baseUrl ?? (env.VISION_API_URL || null)
  if (!visionUrl) {
    console.error('visionAI: no vision URL configured')
    return null
  }

  try {
    const res = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    })

    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    console.error('visionAI', e)
    return null
  }
}
