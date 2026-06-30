import { Response, NextFunction } from 'express'
import { authMiddleware, AuthPayload } from './auth.middleware'
import { AppError } from './errorHandler.middleware'

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function adminMiddleware(req: Parameters<typeof authMiddleware>[0], _res: Response, next: NextFunction) {
  authMiddleware(req, _res, (err) => {
    if (err) return next(err)
    if (req.user?.role !== 'ADMIN') {
      return next(new AppError(403, 'Admin access required'))
    }
    next()
  })
}
