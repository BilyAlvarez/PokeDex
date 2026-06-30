import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const scanSchema = z.object({
  image: z.string().min(1, 'Image data is required'),
})

export const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  pokemonId: z.string().optional(),
  section: z.string().optional(),
})

export const progressUpdateSchema = z.object({
  pokemonId: z.string().min(1),
  status: z.enum(['SEEN', 'CAUGHT']),
  photoUrl: z.string().optional(),
})

export const pokemonQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.string().optional(),
  generation: z.coerce.number().int().optional(),
  search: z.string().optional(),
})
