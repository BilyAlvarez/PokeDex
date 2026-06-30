const BASE_URL = '/api/v1'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    register: (data: { email: string; username: string; password: string }) =>
      request<{ user: { id: string; email: string; username: string; createdAt: string }; token: string }>(
        '/auth/register', { method: 'POST', body: JSON.stringify(data) }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; username: string; createdAt: string }; token: string }>(
        '/auth/login', { method: 'POST', body: JSON.stringify(data) }
      ),
  },

  pokemon: {
    list: (params?: { page?: number; limit?: number; type?: string; generation?: number; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.type) searchParams.set('type', params.type)
      if (params?.generation) searchParams.set('generation', params.generation.toString())
      if (params?.search) searchParams.set('search', params.search)
      const qs = searchParams.toString()
      return request<import('../types').PokemonListResponse>(`/pokemon${qs ? `?${qs}` : ''}`)
    },
    getById: (id: string) =>
      request<import('../types').PokemonDetail>(`/pokemon/${id}`),
    getByDexNumber: (dex: number) =>
      request<import('../types').PokemonDetail>(`/pokemon/${dex}`),
    getEvolutions: (id: string) =>
      request<import('../types').EvolutionData[]>(`/pokemon/${id}/evolutions`),
    getMoves: (id: string) =>
      request<import('../types').MoveData[]>(`/pokemon/${id}/moves`),
  },

  scan: {
    submit: (image: string) =>
      request<import('../types').ScanResponse>('/scan', { method: 'POST', body: JSON.stringify({ image }) }),
  },

  user: {
    getProgress: () =>
      request<import('../types').UserProgressData[]>('/user/progress'),
    updateProgress: (data: { pokemonId: string; status: 'SEEN' | 'CAUGHT'; photoUrl?: string }) =>
      request<import('../types').UserProgressData>('/user/progress', { method: 'PUT', body: JSON.stringify(data) }),
    getScans: () =>
      request<import('../types').ScanHistoryData[]>('/user/scans'),
  },

  assistant: {
    chat: (data: { message: string; pokemonId?: string; section?: string }) =>
      request<import('../types').ChatResponse>('/assistant/chat', { method: 'POST', body: JSON.stringify(data) }),
    narrate: (pokemonId: string) =>
      request<{ text: string }>('/assistant/narrate', { method: 'POST', body: JSON.stringify({ pokemonId }) }),
  },
}
