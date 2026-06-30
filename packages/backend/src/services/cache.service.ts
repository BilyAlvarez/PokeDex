import { env } from '../config/env'

class CacheService {
  private cache = new Map<string, { data: unknown; expiresAt: number }>()

  async get<T>(key: string): Promise<T | null> {
    if (env.REDIS_URL) {
      return this.redisGet<T>(key)
    }
    return this.memoryGet<T>(key)
  }

  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    if (env.REDIS_URL) {
      return this.redisSet(key, data, ttlSeconds)
    }
    return this.memorySet(key, data, ttlSeconds)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  private memoryGet<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  private memorySet(key: string, data: unknown, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  private async redisGet<T>(_key: string): Promise<T | null> {
    // TODO: Implement Redis client
    return null
  }

  private async redisSet(_key: string, _data: unknown, _ttlSeconds: number): Promise<void> {
    // TODO: Implement Redis client
  }
}

export const cacheService = new CacheService()
