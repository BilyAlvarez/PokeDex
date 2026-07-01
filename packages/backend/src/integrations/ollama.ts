import { getActiveIntegrationByType } from '../services/integration-config.service'
import type { IntegrationConfig } from '../services/integration-config.service'

async function getActiveOllamaConfig(type: string): Promise<IntegrationConfig | null> {
  return getActiveIntegrationByType(type)
}

export async function testConnection(baseUrl: string): Promise<{ success: boolean; latency: number; message: string }> {
  const start = Date.now()
  const url = `${baseUrl.replace(/\/+$/, '')}/api/tags`
  try {
    const res = await fetch(url, { method: 'GET' })
    const latency = Date.now() - start
    if (!res.ok) return { success: false, latency, message: `Ollama HTTP ${res.status}` }
    const data = await res.json()
    const models: { name: string }[] = data.models ?? []
    const modelNames = models.map(m => m.name.replace(/:latest$/, ''))
    return {
      success: true,
      latency,
      message: `Ollama reachable (${latency}ms) — models: ${modelNames.join(', ') || 'none pulled yet'}`,
    }
  } catch (e) {
    console.error('ollama:testConnection', e)
    const latency = Date.now() - start
    return { success: false, latency, message: `Ollama unreachable at ${url}` }
  }
}

export async function scanWithOllama(imageBase64: string): Promise<{
  species: string
  confidence: number
  candidates: { species: string; confidence: number }[]
} | null> {
  const config = await getActiveOllamaConfig('vision')
  if (!config?.baseUrl) return null

  try {
    const res = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt: 'Identify this Pokémon. Return only the Pokémon species name in lowercase. If no Pokémon is clearly visible, return "unknown".',
        images: [imageBase64],
        stream: false,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const species = data.response?.trim().toLowerCase() ?? ''

    if (!species || species === 'unknown') return null

    return {
      species,
      confidence: 0.85,
      candidates: [{ species, confidence: 0.85 }],
    }
  } catch (e) {
    console.error('ollama:scanWithOllama', e)
    return null
  }
}

export async function chatWithOllama(context: {
  message: string
  pokemonName?: string
  pokemonId?: string
  section?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}): Promise<{ text: string } | null> {
  const config = await getActiveOllamaConfig('chat')
  if (!config?.baseUrl) return null

  const systemPrompt = `You are a Pokédex assistant, a scientific device that helps trainers identify and learn about Pokémon.
Your tone is precise, helpful, and slightly formal — like a scientific instrument, not a casual chatbot.

Current context:
${context.pokemonName ? `- Viewing Pokémon: ${context.pokemonName}` : ''}
${context.section ? `- Current section: ${context.section}` : ''}

You can:
- Answer questions about Pokémon types, stats, evolutions, and strategies
- Explain game mechanics
- Provide battle tips and type matchups
- Narrate Pokédex entries

Keep responses concise and informative.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(context.history ?? []).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: context.message },
  ]

  try {
    const res = await fetch(`${config.baseUrl.replace(/\/+$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages,
        stream: false,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    return { text: data.message?.content ?? '' }
  } catch (e) {
    console.error('ollama:chatWithOllama', e)
    return null
  }
}
