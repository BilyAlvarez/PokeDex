import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
  },
}))

describe('email service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should send reset password email', async () => {
    const { sendResetPasswordEmail } = await import('../services/email.service')
    await expect(sendResetPasswordEmail('test@test.com', 'token123')).resolves.toBeUndefined()
  })

  it('should send notification email', async () => {
    const { sendNotificationEmail } = await import('../services/email.service')
    await expect(sendNotificationEmail('test@test.com', 'Subject', 'Body')).resolves.toBeUndefined()
  })
})
