import { env } from '../config/env'
import type { ScanResult } from './visionAI'

const GEMINI_MODEL = 'gemini-flash-latest'

export async function scanWithGemini(
  imageBase64: string,
  apiKey?: string,
): Promise<ScanResult | null> {
  const key = apiKey || env.GEMINI_API_KEY
  if (!key) return null

  const rawBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: rawBase64,
                  },
                },
                {
                  text: 'Identify this Pokémon species from the image. Return only the Pokémon name in lowercase, nothing else. If unsure or no Pokémon is visible, return "unknown".',
                },
              ],
            },
          ],
        }),
      },
    )

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('gemini:scanWithGemini HTTP', res.status, errBody)
      return null
    }

    const data = await res.json()
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text
    const species = text?.trim().toLowerCase() ?? ''

    if (!species || species === 'unknown') return null

    return {
      species,
      confidence: 0.88,
      candidates: [{ species, confidence: 0.88 }],
    }
  } catch (e) {
    console.error('gemini:scanWithGemini', e)
    return null
  }
}
