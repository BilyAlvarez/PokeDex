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

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).optional(),
  email: z.string().email('Invalid email').optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export const pokemonQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.string().optional(),
  generation: z.coerce.number().int().optional(),
  search: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const narrateSchema = z.object({
  pokemonId: z.string().min(1, 'pokemonId is required'),
})

export const createIntegrationSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().optional().default('other'),
  description: z.string().optional(),
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).optional().default('INACTIVE'),
})

export const updateIntegrationSchema = z.object({
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).optional(),
  type: z.string().optional(),
  description: z.string().optional(),
})

export const testIntegrationSchema = z.object({
  id: z.string().min(1, 'Integration ID is required'),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: 'Role must be USER or ADMIN' }),
})

export const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  response: z.string().optional(),
})

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().default('MEDIUM'),
})
