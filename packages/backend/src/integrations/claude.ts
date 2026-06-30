import { env } from '../config/env'

interface ChatContext {
  message: string
  pokemonId?: string
  pokemonName?: string
  section?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

interface ChatResponse {
  text: string
  action?: string
}

export async function chatWithAssistant(context: ChatContext): Promise<ChatResponse | null> {
  if (!env.CLAUDE_API_KEY) {
    return {
      text: 'I am a Pokédex assistant. How can I help you today?',
    }
  }

  const systemPrompt = buildSystemPrompt(context)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...(context.history ?? []),
          { role: 'user', content: context.message },
        ],
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    return {
      text: data.content[0]?.text ?? '',
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return null
  }
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
