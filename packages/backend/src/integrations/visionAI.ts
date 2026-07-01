import { getActiveIntegrationByType, getIntegrationConfig } from '../services/integration-config.service'
import { scanWithOllama } from './ollama'
import { env } from '../config/env'

export interface ScanResult {
  species: string
  confidence: number
  candidates: { species: string; confidence: number }[]
}

export async function scanImage(imageBase64: string): Promise<ScanResult | null> {
  const activeVision = await getActiveIntegrationByType('vision')

  if (!activeVision) {
    console.error('visionAI: no active vision integration configured')
    return null
  }

  if (activeVision.key === 'ollama-vision') {
    return scanWithOllama(imageBase64)
  }

  const visionConfig = activeVision.key === 'vision'
    ? activeVision
    : await getIntegrationConfig('vision')

  const visionUrl = visionConfig?.baseUrl ?? (env.VISION_API_URL || null)
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
