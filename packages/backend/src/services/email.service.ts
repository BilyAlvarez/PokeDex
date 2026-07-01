import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
})

export async function sendResetPasswordEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@pokedex.com',
    to,
    subject: 'Pokédex - Reset your password',
    text: `Click this link to reset your password: ${resetUrl}`,
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  })
}

export async function sendNotificationEmail(to: string, subject: string, body: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@pokedex.com',
    to,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  })
}
