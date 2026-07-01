import { env } from '../config/env'
import Redis from 'ioredis'

class CacheService {
  private cache = new Map<string, { data: unknown; expiresAt: number }>()
  private redis: Redis | null = null
  private redisOk = false

  async get<T>(key: string): Promise<T | null> {
    if (env.REDIS_URL && this.redisOk) {
      try {
        return await this.redisGet<T>(key)
      } catch {
        this.redisOk = false
      }
    }
    return this.memoryGet<T>(key)
  }

  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    if (env.REDIS_URL && this.redisOk) {
      try {
        return await this.redisSet(key, data, ttlSeconds)
      } catch {
        this.redisOk = false
      }
    }
    return this.memorySet(key, data, ttlSeconds)
  }

  async clear(): Promise<void> {
    this.cache.clear()
    if (this.redis && this.redisOk) {
      try {
        await this.redis.flushall()
      } catch {
        this.redisOk = false
      }
    }
  }

  async connect(): Promise<void> {
    if (!env.REDIS_URL) return
    try {
      this.redis = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })
      await this.redis.connect()
      this.redisOk = true
    } catch {
      this.redisOk = false
    }
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

  private async redisGet<T>(key: string): Promise<T | null> {
    const raw = await this.redis!.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  }

  private async redisSet(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    await this.redis!.setex(key, ttlSeconds, JSON.stringify(data))
  }
}

export const cacheService = new CacheService()
