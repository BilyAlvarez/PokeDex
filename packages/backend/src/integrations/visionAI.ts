import { getActiveIntegrationByType } from '../services/integration-config.service'
import { scanWithOllama } from './ollama'
import { env } from '../config/env'
import type { Integration as PrismaIntegration } from '@prisma/client'

export interface ScanResult {
  species: string
  confidence: number
  candidates: { species: string; confidence: number }[]
}

export interface ScanImageError {
  code: 'NO_INTEGRATION' | 'CONNECTION_REFUSED' | 'REQUEST_FAILED'
  message: string
}

export async function scanImage(imageBase64: string): Promise<{ result: ScanResult } | { error: ScanImageError }> {
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
    return { error: { code: 'NO_INTEGRATION', message: 'No vision AI integration found. Go to Admin → Integrations to add one.' } }
  }

  if (vision.key === 'ollama-vision') {
    try {
      const result = await scanWithOllama(imageBase64, vision.baseUrl ?? undefined)
      if (!result) {
        return { error: { code: 'CONNECTION_REFUSED', message: `Ollama is not running at ${vision.baseUrl || 'http://localhost:11434'}. Start Ollama or add a different vision integration.` } }
      }
      return { result }
    } catch {
      return { error: { code: 'CONNECTION_REFUSED', message: `Ollama is not running at ${vision.baseUrl || 'http://localhost:11434'}. Start Ollama or add a different vision integration.` } }
    }
  }

  const visionUrl = vision.baseUrl ?? (env.VISION_API_URL || null)
  if (!visionUrl) {
    return { error: { code: 'NO_INTEGRATION', message: 'Vision integration has no URL configured.' } }
  }

  try {
    const res = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    })

    if (!res.ok) return { error: { code: 'REQUEST_FAILED', message: `Vision AI returned status ${res.status}` } }
    const result = await res.json()
    return { result }
  } catch (e) {
    return { error: { code: 'CONNECTION_REFUSED', message: `Cannot reach vision AI at ${visionUrl}. Check the URL and ensure the service is running.` } }
  }
}
