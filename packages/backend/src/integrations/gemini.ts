import { env } from '../config/env'
import type { ScanResult } from './visionAI'

const GEMINI_MODEL = 'gemini-flash-latest'

interface ChatContext {
  message: string
  pokemonId?: string
  pokemonName?: string
  section?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

function buildSystemPrompt(context: ChatContext): string {
  return `You are a Pokédex assistant, a scientific device that helps trainers identify and learn about Pokémon.
Your tone is precise, helpful, and slightly formal — like a scientific instrument, not a casual chatbot.

Current context:
${context.pokemonName ? `- Viewing Pokémon: ${context.pokemonName}` : ''}
${context.section ? `- Current section: ${context.section}` : ''}

You can:
- Answer questions about Pokémon types, stats, evolutions, and strategies
- Explain game mechanics
- Narrate Pokédex entries
- Help navigate the app (say "open my Pokédex" or "search for Charizard")
- Provide battle tips and type matchups

Keep responses concise and informative.`
}

export async function chatWithGemini(context: ChatContext, apiKey?: string): Promise<{ text: string } | null> {
  const key = apiKey || env.GEMINI_API_KEY
  if (!key) return null

  const contents = [
    ...(context.history ?? []).map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    })),
    { role: 'user' as const, parts: [{ text: context.message }] },
  ]

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
          contents,
          systemInstruction: { parts: [{ text: buildSystemPrompt(context) }] },
        }),
      },
    )

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('gemini:chatWithGemini HTTP', res.status, errBody)
      return null
    }

    const data = await res.json()
    const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text ? { text: text.trim() } : null
  } catch (e) {
    console.error('gemini:chatWithGemini', e)
    return null
  }
}

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
