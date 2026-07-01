import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  narrateSchema,
  createIntegrationSchema,
  updateIntegrationSchema,
  updateUserRoleSchema,
  updateTicketSchema,
  createTicketSchema,
} from '../utils/validators'

describe('registerSchema', () => {
  it('should accept valid data', () => {
    const result = registerSchema.parse({ email: 'test@test.com', username: 'testuser', password: '123456' })
    expect(result.email).toBe('test@test.com')
    expect(result.username).toBe('testuser')
    expect(result.password).toBe('123456')
  })

  it('should reject invalid email', () => {
    expect(() => registerSchema.parse({ email: 'invalid', username: 'test', password: '123456' })).toThrow()
  })

  it('should reject short username', () => {
    expect(() => registerSchema.parse({ email: 'a@b.com', username: 'ab', password: '123456' })).toThrow()
  })

  it('should reject short password', () => {
    expect(() => registerSchema.parse({ email: 'a@b.com', username: 'test', password: '12345' })).toThrow()
  })
})

describe('loginSchema', () => {
  it('should accept valid data', () => {
    const result = loginSchema.parse({ email: 'a@b.com', password: 'x' })
    expect(result.email).toBe('a@b.com')
  })

  it('should reject missing password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow()
  })
})

describe('forgotPasswordSchema', () => {
  it('should accept valid email', () => {
    const result = forgotPasswordSchema.parse({ email: 'user@test.com' })
    expect(result.email).toBe('user@test.com')
  })

  it('should reject invalid email', () => {
    expect(() => forgotPasswordSchema.parse({ email: 'notanemail' })).toThrow()
  })
})

describe('resetPasswordSchema', () => {
  it('should accept valid data', () => {
    const result = resetPasswordSchema.parse({ token: 'abc123', password: 'newpassword' })
    expect(result.token).toBe('abc123')
    expect(result.password).toBe('newpassword')
  })

  it('should reject short password', () => {
    expect(() => resetPasswordSchema.parse({ token: 'abc', password: '12345' })).toThrow()
  })

  it('should reject empty token', () => {
    expect(() => resetPasswordSchema.parse({ token: '', password: '123456' })).toThrow()
  })
})

describe('narrateSchema', () => {
  it('should accept valid pokemonId', () => {
    const result = narrateSchema.parse({ pokemonId: 'some-id' })
    expect(result.pokemonId).toBe('some-id')
  })

  it('should reject empty pokemonId', () => {
    expect(() => narrateSchema.parse({ pokemonId: '' })).toThrow()
  })
})

describe('createIntegrationSchema', () => {
  it('should accept valid data with defaults', () => {
    const result = createIntegrationSchema.parse({ key: 'test-key', name: 'Test' })
    expect(result.key).toBe('test-key')
    expect(result.name).toBe('Test')
    expect(result.type).toBe('other')
    expect(result.status).toBe('INACTIVE')
  })

  it('should reject missing key', () => {
    expect(() => createIntegrationSchema.parse({ name: 'Test' })).toThrow()
  })
})

describe('updateUserRoleSchema', () => {
  it('should accept USER role', () => {
    const result = updateUserRoleSchema.parse({ role: 'USER' })
    expect(result.role).toBe('USER')
  })

  it('should accept ADMIN role', () => {
    const result = updateUserRoleSchema.parse({ role: 'ADMIN' })
    expect(result.role).toBe('ADMIN')
  })

  it('should reject invalid role', () => {
    expect(() => updateUserRoleSchema.parse({ role: 'MODERATOR' })).toThrow()
  })
})

describe('createTicketSchema', () => {
  it('should accept valid data', () => {
    const result = createTicketSchema.parse({ subject: 'Bug', description: 'Something broke' })
    expect(result.subject).toBe('Bug')
    expect(result.description).toBe('Something broke')
    expect(result.priority).toBe('MEDIUM')
  })

  it('should reject missing subject', () => {
    expect(() => createTicketSchema.parse({ description: 'desc' })).toThrow()
  })
})

describe('updateTicketSchema', () => {
  it('should accept partial update', () => {
    const result = updateTicketSchema.parse({ status: 'RESOLVED' })
    expect(result.status).toBe('RESOLVED')
  })

  it('should reject invalid status', () => {
    expect(() => updateTicketSchema.parse({ status: 'INVALID' })).toThrow()
  })
})

describe('updateIntegrationSchema', () => {
  it('should accept empty object', () => {
    const result = updateIntegrationSchema.parse({})
    expect(result).toEqual({})
  })

  it('should accept valid status', () => {
    const result = updateIntegrationSchema.parse({ status: 'ACTIVE' })
    expect(result.status).toBe('ACTIVE')
  })
})
