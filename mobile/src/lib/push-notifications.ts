import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import type { SessionUser } from './api-client'

const EDGE_FN_URL =
  'https://hfilegaukynyagypmuwf.supabase.co/functions/v1/send-push'
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

export function initNotificationHandler() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
  } catch (e) {
    console.warn('Failed to set notification handler:', e)
  }
}

let responseSubscription: Notifications.EventSubscription | null = null

export function setupNotificationResponseListener(
  onNavigateToRequest: (requestId: string) => void,
) {
  responseSubscription?.remove()
  responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as
        | { requestId?: string }
        | undefined
      if (data?.requestId) {
        onNavigateToRequest(data.requestId)
      }
    },
  )
}

export function cleanupNotificationResponseListener() {
  responseSubscription?.remove()
  responseSubscription = null
}

export async function registerPushToken(user: SessionUser) {
  try {
    // expo-modules-core is not in the mobile node_modules so the inherited
    // PermissionResponse properties (granted, status) are invisible to tsc.
    const existing = (await Notifications.getPermissionsAsync()) as any
    let granted: boolean = existing.granted

    if (!granted) {
      const result = (await Notifications.requestPermissionsAsync()) as any
      granted = result.granted
    }

    if (!granted) {
      return
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId || projectId === 'YOUR_EAS_PROJECT_ID') {
      console.warn('Push notifications disabled: No EAS project ID configured')
      return
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId })

    await fetch(EDGE_FN_URL + '/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
      },
      body: JSON.stringify({
        userId: user.id,
        token: token.data,
        platform: Platform.OS,
      }),
    })
  } catch (e) {
    console.warn('Push token registration failed:', e)
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null,
  })
}
