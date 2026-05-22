import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { authMiddleware } from '@/features/auth/guards/auth'

export const submitSupportTicketServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      subject: z.string().min(1).max(200),
      category: z.string().min(1),
      message: z.string().min(1).max(5000),
    }),
  )
  .handler(
    async ({
      data,
      context,
    }: {
      data: { subject: string; category: string; message: string }
      context: any
    }) => {
      const { submitSupportTicketUseCase } =
        await import('@/use-cases/support/index')
      return await submitSupportTicketUseCase({
        userId: context.user.id,
        userEmail: context.user.email,
        userName: context.user.name,
        subject: data.subject,
        category: data.category,
        message: data.message,
      })
    },
  )
