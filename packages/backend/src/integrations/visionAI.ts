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
    return mockScan()
  }

  if (activeVision.key === 'ollama-vision') {
    return scanWithOllama(imageBase64)
  }

  const visionConfig = activeVision.key === 'vision'
    ? activeVision
    : await getIntegrationConfig('vision')

  const visionUrl = visionConfig?.baseUrl ?? (env.VISION_API_URL || null)
  if (!visionUrl) {
    return mockScan()
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
    return mockScan()
  }
}

function mockScan(): ScanResult {
  return {
    species: 'pikachu',
    confidence: 0.92,
    candidates: [
      { species: 'pikachu', confidence: 0.92 },
      { species: 'raichu', confidence: 0.05 },
      { species: 'pichu', confidence: 0.02 },
    ],
  }
}
