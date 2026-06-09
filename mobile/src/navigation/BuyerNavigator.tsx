import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useCallback, useEffect, useRef, useState } from 'react'

import { BottomTabBar } from '../components/BottomTabBar'
import { fetchUnreadNotifications } from '../lib/api-client'
import { scheduleLocalNotification } from '../lib/push-notifications'
import { storage } from '../lib/storage'
import { useUserStore } from '../lib/stores/user-store'
import { HomeScreen } from '../screens/HomeScreen'
import { NewRequestScreen } from '../screens/NewRequestScreen'
import { NotificationsScreen } from '../screens/NotificationsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { EditProfileScreen } from '../screens/EditProfileScreen'
import { HelpScreen } from '../screens/HelpScreen'
import { MyRequestsScreen } from '../screens/MyRequestsScreen'
import { RequestDetailsScreen } from '../screens/RequestDetailsScreen'
import type {
  BuyerTabParamList,
  BuyerHomeStackParamList,
  BuyerRequestsStackParamList,
  BuyerNotificationsStackParamList,
  BuyerProfileStackParamList,
  RootStackParamList,
} from './types'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import type { TabId } from '../components/BottomTabBar'

const POLL_INTERVAL_MS = 30000

const HomeStack = createNativeStackNavigator<BuyerHomeStackParamList>()
const RequestsStack = createNativeStackNavigator<BuyerRequestsStackParamList>()
const NotificationsStack =
  createNativeStackNavigator<BuyerNotificationsStackParamList>()
const ProfileStack = createNativeStackNavigator<BuyerProfileStackParamList>()
const Tab = createBottomTabNavigator<BuyerTabParamList>()

// ── Per-tab stacks ─────────────────────────────────────────────────────────────

function BuyerHomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
      />
      <HomeStack.Screen name="NewRequest" component={NewRequestScreen} />
      <HomeStack.Screen name="EditRequest" component={NewRequestScreen} />
    </HomeStack.Navigator>
  )
}

function BuyerRequestsStackScreen() {
  return (
    <RequestsStack.Navigator screenOptions={{ headerShown: false }}>
      <RequestsStack.Screen name="MyRequests" component={MyRequestsScreen} />
      <RequestsStack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
      />
      <RequestsStack.Screen
        name="EditRequest"
        component={NewRequestScreen}
      />
    </RequestsStack.Navigator>
  )
}

function BuyerNotificationsStackScreen() {
  return (
    <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationsStack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <NotificationsStack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
      />
      <NotificationsStack.Screen
        name="EditRequest"
        component={NewRequestScreen}
      />
    </NotificationsStack.Navigator>
  )
}

function BuyerProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Help" component={HelpScreen} />
    </ProfileStack.Navigator>
  )
}

// ── Tab bar adapter ────────────────────────────────────────────────────────────

const TAB_ID_MAP: Record<string, TabId> = {
  BuyerHomeStack: 'home',
  BuyerRequestsStack: 'requests',
  BuyerNotificationsStack: 'notifications',
  BuyerProfileStack: 'profile',
}

function CustomTabBar(
  props: BottomTabBarProps & { unreadCount: number; onCreatePress: () => void },
) {
  const { state, navigation, unreadCount, onCreatePress } = props
  const activeRouteName = state.routes[state.index].name
  const activeTab = TAB_ID_MAP[activeRouteName] ?? 'home'

  return (
    <BottomTabBar
      activeTab={activeTab}
      onTabChange={(tab) => {
        const routeName = Object.entries(TAB_ID_MAP).find(
          ([, v]) => v === tab,
        )?.[0]
        if (routeName) navigation.navigate(routeName as keyof BuyerTabParamList)
      }}
      onCreatePress={onCreatePress}
      unreadCount={unreadCount}
      variant="buyer"
    />
  )
}

// ── BuyerNavigator ─────────────────────────────────────────────────────────────

export function BuyerNavigator() {
  const user = useUserStore((s) => s.user)
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [unreadCount, setUnreadCount] = useState(0)
  const prevNotifIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    let firstRun = true
    async function poll() {
      try {
        if (firstRun) {
          firstRun = false
          try {
            const raw = await storage.getItem('seen-notif-ids')
            if (raw) {
              const ids: string[] = JSON.parse(raw)
              for (const id of ids) {
                prevNotifIdsRef.current.add(id)
              }
            }
          } catch {
            // ignore parse errors
          }
        }
        const data = await fetchUnreadNotifications()
        if (cancelled) return
        const items = Array.isArray(data) ? data : []
        setUnreadCount(items.filter((n: any) => !n.isRead).length)
        const prevIds = prevNotifIdsRef.current
        const newItems = items.filter((n: any) => !prevIds.has(n.id) && n.title)
        for (const n of newItems) {
          const requestId = n.metadata?.requestId || n.referenceId
          scheduleLocalNotification(n.title, n.message, {
            ...(requestId ? { requestId } : {}),
          })
        }
        prevNotifIdsRef.current = new Set(items.map((n: any) => n.id))
        await storage.setItem(
          'seen-notif-ids',
          JSON.stringify([...prevNotifIdsRef.current]),
        )
      } catch {
        // silently fail
      }
    }
    poll()
    const id = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const handleCreatePress = useCallback(() => {
    navigation.navigate('BuyerTabs', {
      screen: 'BuyerHomeStack',
      params: { screen: 'NewRequest', params: { buyerId: user!.id } },
    })
  }, [navigation, user?.id])

  if (!user) return null

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar
          {...props}
          unreadCount={unreadCount}
          onCreatePress={handleCreatePress}
        />
      )}
    >
      <Tab.Screen name="BuyerHomeStack" component={BuyerHomeStackScreen} />
      <Tab.Screen
        name="BuyerRequestsStack"
        component={BuyerRequestsStackScreen}
      />
      <Tab.Screen
        name="BuyerNotificationsStack"
        component={BuyerNotificationsStackScreen}
      />
      <Tab.Screen
        name="BuyerProfileStack"
        component={BuyerProfileStackScreen}
      />
    </Tab.Navigator>
  )
}
