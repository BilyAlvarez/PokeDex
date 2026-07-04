const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

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

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('admin-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
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
      request<{ user: { id: string; email: string; username: string; role: string; createdAt: string }; token: string }>(
        '/auth/register', { method: 'POST', body: JSON.stringify(data) }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; username: string; role: string; createdAt: string }; token: string }>(
        '/auth/login', { method: 'POST', body: JSON.stringify(data) }
      ),
    adminLogin: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email: string; username: string; role: string; createdAt: string }; token: string }>(
        '/auth/admin-login', { method: 'POST', body: JSON.stringify(data) }
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

  team: {
    list: () => request<import('../types/pokemon').Team[]>('/team'),
    create: (data: { name: string; slots: { pokemonId: string; slotIndex: number }[] }) =>
      request<import('../types/pokemon').Team>('/team', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; slots?: { pokemonId: string; slotIndex: number }[] }) =>
      request<import('../types/pokemon').Team>(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ message: string }>(`/team/${id}`, { method: 'DELETE' }),
  },

  user: {
    getProgress: () =>
      request<import('../types').UserProgressData[]>('/user/progress'),
    updateProgress: (data: { pokemonId: string; status: 'SEEN' | 'CAUGHT'; photoUrl?: string }) =>
      request<import('../types').UserProgressData>('/user/progress', { method: 'PUT', body: JSON.stringify(data) }),
    getStats: () =>
      request<{ seen: number; caught: number; total: number; scans: number }>('/user/stats'),
    getScans: () =>
      request<import('../types').ScanHistoryData[]>('/user/scans'),
    updateProfile: (data: { username?: string; email?: string }) =>
      request<import('../types').UserData>('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/user/password', { method: 'PUT', body: JSON.stringify(data) }),
    tickets: () =>
      request<import('../types/admin').SupportTicket[]>('/user/tickets'),
    createTicket: (data: { subject: string; description: string; priority?: string }) =>
      request<import('../types/admin').SupportTicket>('/user/tickets', { method: 'POST', body: JSON.stringify(data) }),
  },

  assistant: {
    chat: (data: { message: string; pokemonId?: string; section?: string }) =>
      request<import('../types').ChatResponse>('/assistant/chat', { method: 'POST', body: JSON.stringify(data) }),
    narrate: (pokemonId: string) =>
      request<{ text: string }>('/assistant/narrate', { method: 'POST', body: JSON.stringify({ pokemonId }) }),
  },

  admin: {
    stats: () => adminRequest<import('../types/admin').AdminStats>('/admin/stats'),
    integrations: () => adminRequest<import('../types/admin').Integration[]>('/admin/integrations'),
    createIntegration: (data: { key: string; name: string; type?: string; description?: string; baseUrl?: string; apiKey?: string; status?: string }) =>
      adminRequest<import('../types/admin').Integration>('/admin/integrations', { method: 'POST', body: JSON.stringify(data) }),
    updateIntegration: (id: string, data: Record<string, unknown>) =>
      adminRequest<import('../types/admin').Integration>(`/admin/integrations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteIntegration: (id: string) =>
      adminRequest<{ message: string }>(`/admin/integrations/${id}`, { method: 'DELETE' }),
    tickets: (status?: string) => adminRequest<import('../types/admin').SupportTicket[]>(`/admin/tickets${status ? `?status=${status}` : ''}`),
    updateTicket: (id: string, data: Record<string, string>) =>
      adminRequest<import('../types/admin').SupportTicket>(`/admin/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    logs: (limit?: number) => adminRequest<import('../types/admin').SystemLogEntry[]>(`/admin/logs${limit ? `?limit=${limit}` : ''}`),
    testIntegration: (id: string) =>
      adminRequest<{ success: boolean; latency: number; message: string }>('/admin/integrations/test', { method: 'POST', body: JSON.stringify({ id }) }),
    seed: () => adminRequest<{ message: string }>('/admin/seed', { method: 'POST' }),
  },
}
