import { describe, it, expect, vi, beforeEach } from 'vitest'
import { testConnection, scanWithOllama, chatWithOllama } from '../integrations/ollama'

vi.mock('../services/integration-config.service', () => ({
  getActiveIntegrationByType: vi.fn(async (type: string) => {
    if (type === 'vision') {
      return { id: 'v1', key: 'ollama-vision', name: 'Ollama Vision', baseUrl: 'http://localhost:11434', apiKey: null }
    }
    if (type === 'chat') {
      return { id: 'c1', key: 'ollama-chat', name: 'Ollama Chat', baseUrl: 'http://localhost:11434', apiKey: null }
    }
    return null
  }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('testConnection', () => {
  it('should return success when Ollama responds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: 'llava:latest' }, { name: 'llama3:latest' }] }),
    })

    const result = await testConnection('http://localhost:11434')
    expect(result.success).toBe(true)
    expect(result.latency).toBeGreaterThanOrEqual(0)
    expect(result.message).toContain('Ollama reachable')
    expect(result.message).toContain('llava')
    expect(result.message).toContain('llama3')
  })

  it('should return success with no models message when none pulled', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ models: [] }),
    })

    const result = await testConnection('http://localhost:11434')
    expect(result.success).toBe(true)
    expect(result.message).toContain('none pulled yet')
  })

  it('should return failure on HTTP error', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' })

    const result = await testConnection('http://localhost:11434')
    expect(result.success).toBe(false)
    expect(result.message).toContain('Ollama HTTP 500')
  })

  it('should return failure when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    const result = await testConnection('http://localhost:11434')
    expect(result.success).toBe(false)
    expect(result.message).toContain('Ollama unreachable')
  })
})

describe('scanWithOllama', () => {
  it('should return identified Pokémon on successful scan', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'pikachu' }),
    })

    const result = await scanWithOllama('fake-base64-image')
    expect(result).not.toBeNull()
    expect(result!.species).toBe('pikachu')
    expect(result!.confidence).toBe(0.85)
    expect(result!.candidates).toHaveLength(1)
  })

  it('should return null when Ollama returns unknown', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'unknown' }),
    })

    const result = await scanWithOllama('fake-base64-image')
    expect(result).toBeNull()
  })

  it('should return null on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const result = await scanWithOllama('fake-base64-image')
    expect(result).toBeNull()
  })

  it('should return null on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 })
    const result = await scanWithOllama('fake-base64-image')
    expect(result).toBeNull()
  })
})

describe('chatWithOllama', () => {
  it('should return assistant response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Pikachu is an Electric-type Pokémon.' } }),
    })

    const result = await chatWithOllama({ message: 'Tell me about Pikachu', pokemonName: 'pikachu' })
    expect(result).not.toBeNull()
    expect(result!.text).toBe('Pikachu is an Electric-type Pokémon.')
  })

  it('should include context in system prompt', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Info' } }),
    })

    const result = await chatWithOllama({
      message: 'What is this?',
      pokemonName: 'charizard',
      section: 'stats',
    })
    expect(result).not.toBeNull()
    expect(result!.text).toBe('Info')

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody.messages[0].content).toContain('charizard')
    expect(callBody.messages[0].content).toContain('stats')
  })

  it('should include conversation history', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Reply' } }),
    })

    const history = [
      { role: 'user' as const, content: 'Hi' },
      { role: 'assistant' as const, content: 'Hello' },
    ]

    await chatWithOllama({ message: 'How are you?', history })
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    const userMessages = callBody.messages.filter((m: { role: string }) => m.role === 'user')
    expect(userMessages).toHaveLength(2)
    expect(userMessages[0].content).toBe('Hi')
    expect(userMessages[1].content).toBe('How are you?')
  })

  it('should return null on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const result = await chatWithOllama({ message: 'Hello' })
    expect(result).toBeNull()
  })
})
