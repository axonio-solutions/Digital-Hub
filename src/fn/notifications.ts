import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/guards/auth'

/**
 * Axis Layer 3: Notifications Actions
 */

export const getNotificationPreferencesServerFn = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .handler(async ({ context }: { context: any }) => {
    const { getNotificationSettingsUseCase } = await import(
      '@/use-cases/notifications/index'
    )
    return await getNotificationSettingsUseCase(context.user.id)
  })

export const updateNotificationPreferencesServerFn = createServerFn({
  method: 'POST',
})
  .middleware([authMiddleware])
  .handler(async ({ data, context }: { data: any; context: any }) => {
    const { updateNotificationSettingsUseCase } = await import('@/use-cases/notifications/index')
    return await updateNotificationSettingsUseCase(context.user.id, data)
  })

export const fetchUnreadNotificationsServerFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context?.user?.id as string
    const { getUnreadNotificationsUseCase } = await import('@/use-cases/notifications/index')
    return await getUnreadNotificationsUseCase(userId)
  })

export const markNotificationReadServerFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ data: id }) => {
    const { markNotificationAsReadUseCase } = await import('@/use-cases/notifications/index')
    return await markNotificationAsReadUseCase(id)
  })

export const markAllNotificationsReadServerFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context?.user?.id as string
    const { markAllAsReadUseCase } = await import('@/use-cases/notifications/index')
    return await markAllAsReadUseCase(userId)
  })
