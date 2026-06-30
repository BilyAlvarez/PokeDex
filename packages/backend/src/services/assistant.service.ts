import { chatWithAssistant } from '../integrations/claude'

export interface AssistantRequest {
  message: string
  pokemonId?: string
  pokemonName?: string
  section?: string
  history?: { role: 'user' | 'assistant'; content: string }[]
}

export interface AssistantResponse {
  text: string
  action?: string
}

export async function processChat(request: AssistantRequest): Promise<AssistantResponse> {
  const result = await chatWithAssistant({
    message: request.message,
    pokemonId: request.pokemonId,
    pokemonName: request.pokemonName,
    section: request.section,
    history: request.history,
  })

  if (!result) {
    return {
      text: 'I apologize, but I am having trouble processing your request right now. Please try again.',
    }
  }

  return result
}

export function narrateDescription(
  pokemonName: string,
  description: string,
  category: string | null,
  types: string[],
): string {
  const typeStr = types.join('/')
  return `${pokemonName}, the ${category ?? 'Pokémon'} of type ${typeStr}. ${description}`
}
