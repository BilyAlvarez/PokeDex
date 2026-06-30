import { env } from '../config/env'

export interface ScanResult {
  species: string
  confidence: number
  candidates: { species: string; confidence: number }[]
}

export async function scanImage(imageBase64: string): Promise<ScanResult | null> {
  if (!env.VISION_API_URL) {
    console.warn('VISION_API_URL not configured, returning mock result')
    return mockScan()
  }

  try {
    const res = await fetch(env.VISION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 }),
    })

    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error('Vision AI scan failed:', error)
    return null
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
