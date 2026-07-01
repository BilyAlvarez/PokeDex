export interface AdminStats {
  users: number
  pokemon: number
  scans: number
  openTickets: number
  integrations: IntegrationSummary[]
}

export interface IntegrationSummary {
  key: string
  name: string
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  lastChecked: string | null
}

export interface Integration {
  id: string
  key: string
  name: string
  type: string
  description: string | null
  baseUrl: string | null
  apiKey: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'
  lastChecked: string | null
  createdAt: string
  updatedAt: string
}

export interface SupportTicket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  response: string | null
  createdAt: string
  user: { id: string; username: string; email: string }
}

export interface SystemLogEntry {
  id: string
  action: string
  detail: string | null
  level: string
  createdAt: string
  user: { username: string } | null
}
