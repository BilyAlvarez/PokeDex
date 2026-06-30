export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  pokemonId?: string
  section?: string
}

export interface ChatResponse {
  text: string
  action?: string
}

export interface ScanResponse {
  identified: boolean
  pokemon?: {
    id: string
    nationalDexNumber: number
    name: string
    spriteUrl: string | null
    types: string[]
  }
  confidence?: number
  candidates?: { species: string; confidence: number }[]
  message: string
}
