import { prisma } from '../config/database'

export interface IntegrationConfig {
  id: string
  key: string
  name: string
  baseUrl: string | null
  apiKey: string | null
}

const configCache = new Map<string, IntegrationConfig | null>()
let cacheEnabled = true

export function disableConfigCache() {
  cacheEnabled = false
  configCache.clear()
}

export function clearConfigCache() {
  configCache.clear()
}

export async function getIntegrationConfig(key: string): Promise<IntegrationConfig | null> {
  if (cacheEnabled) {
    const cached = configCache.get(key)
    if (cached !== undefined) return cached
  }

  const integration = await prisma.integration.findUnique({ where: { key } })
  if (!integration || integration.status !== 'ACTIVE') {
    if (cacheEnabled) configCache.set(key, null)
    return null
  }

  const config: IntegrationConfig = {
    id: integration.id,
    key: integration.key,
    name: integration.name,
    baseUrl: integration.baseUrl,
    apiKey: integration.apiKey,
  }

  if (cacheEnabled) configCache.set(key, config)
  return config
}

export async function getActiveIntegrationByType(type: string): Promise<IntegrationConfig | null> {
  if (cacheEnabled) {
    const cached = configCache.get(`type:${type}`)
    if (cached !== undefined) return cached
  }

  const integration = await prisma.integration.findFirst({
    where: { type, status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
  })

  if (!integration) {
    if (cacheEnabled) configCache.set(`type:${type}`, null)
    return null
  }

  const config: IntegrationConfig = {
    id: integration.id,
    key: integration.key,
    name: integration.name,
    baseUrl: integration.baseUrl,
    apiKey: integration.apiKey,
  }

  if (cacheEnabled) configCache.set(`type:${type}`, config)
  return config
}
