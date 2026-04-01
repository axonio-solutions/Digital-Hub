import { 
  fetchNotificationPreferences, 
  upsertNotificationPreferences 
} from '@/data-access/notifications'

/**
 * Get notification settings for a user.
 * If no record exists, it will return default settings (but not save them yet
 * to the DB until the user explicitly changes something, to save on DB writes).
 */
export async function getNotificationSettingsUseCase(userId: string) {
  const prefs = await fetchNotificationPreferences(userId)
  
  if (!prefs) {
    return {
      userId,
      emailEnabled: true,
      inAppEnabled: true,
      sellerAlertFrequency: 'IMMEDIATE',
      sellerBrandScope: 'SPECIALTY_ONLY',
    }
  }
  
  return prefs
}

/**
 * Update notification settings for a user.
 */
export async function updateNotificationSettingsUseCase(userId: string, data: any) {
  // Validate frequency and scope if needed
  const allowedFrequencies = ['IMMEDIATE', 'DAILY_DIGEST']
  const allowedScopes = ['SPECIALTY_ONLY', 'ALL_BRANDS']
  
  const updateData: any = {}
  
  if (typeof data.emailEnabled === 'boolean') updateData.emailEnabled = data.emailEnabled
  if (typeof data.inAppEnabled === 'boolean') updateData.inAppEnabled = data.inAppEnabled
  
  if (data.sellerAlertFrequency && allowedFrequencies.includes(data.sellerAlertFrequency)) {
    updateData.sellerAlertFrequency = data.sellerAlertFrequency
  }
  
  if (data.sellerBrandScope && allowedScopes.includes(data.sellerBrandScope)) {
    updateData.sellerBrandScope = data.sellerBrandScope
  }

  return await upsertNotificationPreferences(userId, updateData)
}
