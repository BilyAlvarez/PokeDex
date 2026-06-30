import { Request, Response, NextFunction } from 'express'
import { AppError } from './errorHandler.middleware'

const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.user?.userId || req.ip || 'anonymous'
    const now = Date.now()

    const entry = requests.get(key)
    if (!entry || now > entry.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (entry.count >= maxRequests) {
      throw new AppError(429, 'Too many requests. Please try again later.')
    }

    entry.count++
    next()
  }
}
