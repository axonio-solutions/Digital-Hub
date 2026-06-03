import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import Constants from 'expo-constants'
import type { SessionUser } from './api-client'

const EDGE_FN_URL =
  'https://hfilegaukynyagypmuwf.supabase.co/functions/v1/send-push'
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK'

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.warn('Background notification task error:', error)
      return
    }
    const notif = (data as any)?.notification
    if (notif?.request?.content?.data) {
      const d = notif.request.content.data as Record<string, unknown>
      console.log('Background notification data:', d)
    }
  },
)

export function initNotificationHandler() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
  } catch (e) {
    console.warn('Failed to set notification handler:', e)
  }
}

export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK)
  } catch (e) {
    console.warn('Failed to register background notification task:', e)
  }
}

export async function unregisterBackgroundNotificationTask() {
  try {
    await Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK)
  } catch (e) {
    console.warn('Failed to unregister background notification task:', e)
  }
}

let responseSubscription: Notifications.EventSubscription | null = null
let receivedSubscription: Notifications.EventSubscription | null = null

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

export function setupNotificationForegroundListener(
  onReceived?: (data: Record<string, unknown>) => void,
) {
  receivedSubscription?.remove()
  receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = notification.request.content.data as
        | Record<string, unknown>
        | undefined
      onReceived?.(data ?? {})
    },
  )
}

export function cleanupNotificationResponseListener() {
  responseSubscription?.remove()
  responseSubscription = null
  receivedSubscription?.remove()
  receivedSubscription = null
}

export async function registerPushToken(user: SessionUser) {
  try {
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
