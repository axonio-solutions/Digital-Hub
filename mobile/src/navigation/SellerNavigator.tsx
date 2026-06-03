import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useCallback, useEffect, useRef, useState } from 'react'

import { BottomTabBar } from '../components/BottomTabBar'
import { fetchUnreadNotifications } from '../lib/api-client'
import { scheduleLocalNotification } from '../lib/push-notifications'
import { useUserStore } from '../lib/stores/user-store'
import { NotificationsScreen } from '../screens/NotificationsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { EditProfileScreen } from '../screens/EditProfileScreen'
import { HelpScreen } from '../screens/HelpScreen'
import { RequestDetailsScreen } from '../screens/RequestDetailsScreen'
import { CreditsScreen } from '../screens/CreditsScreen'
import { SellerHomeScreen } from '../screens/SellerHomeScreen'
import { MarketplaceScreen } from '../screens/MarketplaceScreen'
import { MyQuotesScreen } from '../screens/MyQuotesScreen'
import { SubmitQuoteScreen } from '../screens/SubmitQuoteScreen'
import type {
  SellerTabParamList,
  SellerHomeStackParamList,
  SellerMarketplaceStackParamList,
  SellerQuotesStackParamList,
  SellerNotificationsStackParamList,
  SellerProfileStackParamList,
} from './types'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import type { TabId } from '../components/BottomTabBar'

const POLL_INTERVAL_MS = 30000

const HomeStack = createNativeStackNavigator<SellerHomeStackParamList>()
const MarketStack =
  createNativeStackNavigator<SellerMarketplaceStackParamList>()
const QuotesStack = createNativeStackNavigator<SellerQuotesStackParamList>()
const NotifStack =
  createNativeStackNavigator<SellerNotificationsStackParamList>()
const ProfileStackNav =
  createNativeStackNavigator<SellerProfileStackParamList>()
const Tab = createBottomTabNavigator<SellerTabParamList>()

// ── Per-tab stacks ─────────────────────────────────────────────────────────────

function SellerHomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="SellerHome" component={SellerHomeScreen} />
      <HomeStack.Screen name="SubmitQuote" component={SubmitQuoteScreen} />
      <HomeStack.Screen name="Credits" component={CreditsScreen} />
    </HomeStack.Navigator>
  )
}

function SellerMarketplaceStackScreen() {
  return (
    <MarketStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketStack.Screen name="Marketplace" component={MarketplaceScreen} />
      <MarketStack.Screen name="SubmitQuote" component={SubmitQuoteScreen} />
      <MarketStack.Screen name="Credits" component={CreditsScreen} />
    </MarketStack.Navigator>
  )
}

function SellerQuotesStackScreen() {
  return (
    <QuotesStack.Navigator screenOptions={{ headerShown: false }}>
      <QuotesStack.Screen name="MyQuotes" component={MyQuotesScreen} />
      <QuotesStack.Screen name="SubmitQuote" component={SubmitQuoteScreen} />
      <QuotesStack.Screen name="Credits" component={CreditsScreen} />
    </QuotesStack.Navigator>
  )
}

function SellerNotificationsStackScreen() {
  return (
    <NotifStack.Navigator screenOptions={{ headerShown: false }}>
      <NotifStack.Screen name="Notifications" component={NotificationsScreen} />
      <NotifStack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
      />
    </NotifStack.Navigator>
  )
}

function SellerProfileStackScreen() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
      <ProfileStackNav.Screen name="Help" component={HelpScreen} />
      <ProfileStackNav.Screen name="Credits" component={CreditsScreen} />
    </ProfileStackNav.Navigator>
  )
}

// ── Tab bar adapter ────────────────────────────────────────────────────────────

const TAB_ID_MAP: Record<string, TabId> = {
  SellerHomeStack: 'home',
  SellerMarketplaceStack: 'requests',
  SellerQuotesStack: 'quotes',
  SellerNotificationsStack: 'notifications',
  SellerProfileStack: 'profile',
}

function CustomTabBar(props: BottomTabBarProps & { unreadCount: number }) {
  const { state, navigation, unreadCount } = props
  const activeRouteName = state.routes[state.index].name
  const activeTab = TAB_ID_MAP[activeRouteName] ?? 'home'

  return (
    <BottomTabBar
      activeTab={activeTab}
      onTabChange={(tab) => {
        const routeName = Object.entries(TAB_ID_MAP).find(
          ([, v]) => v === tab,
        )?.[0]
        if (routeName)
          navigation.navigate(routeName as keyof SellerTabParamList)
      }}
      unreadCount={unreadCount}
      variant="seller"
    />
  )
}

// ── SellerNavigator ────────────────────────────────────────────────────────────

export function SellerNavigator() {
  const [unreadCount, setUnreadCount] = useState(0)
  const prevNotifIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
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

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} unreadCount={unreadCount} />}
    >
      <Tab.Screen name="SellerHomeStack" component={SellerHomeStackScreen} />
      <Tab.Screen
        name="SellerMarketplaceStack"
        component={SellerMarketplaceStackScreen}
      />
      <Tab.Screen
        name="SellerQuotesStack"
        component={SellerQuotesStackScreen}
      />
      <Tab.Screen
        name="SellerNotificationsStack"
        component={SellerNotificationsStackScreen}
      />
      <Tab.Screen
        name="SellerProfileStack"
        component={SellerProfileStackScreen}
      />
    </Tab.Navigator>
  )
}
