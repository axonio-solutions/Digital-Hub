import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import Ionicons from '@expo/vector-icons/Ionicons'
import { BottomTabBar } from '../components/BottomTabBar'
import { fetchCreditBalance, fetchUnreadNotifications } from '../lib/api-client'
import { scheduleLocalNotification } from '../lib/push-notifications'
import { spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { ProfileScreen } from './ProfileScreen'
import { SellerBillingScreen } from './SellerBillingScreen'
import { SellerDashboardScreen } from './SellerDashboardScreen'
import { SellerMarketplaceScreen } from './SellerMarketplaceScreen'
import { SellerQuotesScreen } from './SellerQuotesScreen'
import { SellerRequestOfferScreen } from './SellerRequestOfferScreen'
import { NotificationScreen } from './NotificationScreen'
import { RequestDetailScreen } from './RequestDetailScreen'
import type { ExistingQuoteData } from './SellerRequestOfferScreen'
import type { OpenRequestRow } from '../types/seller'
import type { TabId } from '../components/BottomTabBar'
import type { SessionUser } from '../lib/api-client'

const POLL_INTERVAL_MS = 30000

interface SellerScreenProps {
  user: SessionUser
  onLogOut: () => void
  onUserUpdate?: (user: SessionUser) => void
  pendingRequestId?: string | null
  onPendingRequestConsumed?: () => void
}

export function SellerScreen({
  user,
  onLogOut,
  onUserUpdate,
  pendingRequestId,
  onPendingRequestConsumed,
}: SellerScreenProps) {
  const t = useTheme()
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [refreshKey, setRefreshKey] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBilling, setShowBilling] = useState(false)
  const [creditBalance, setCreditBalance] = useState(0)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  )
  const [selectedMarketplaceRequest, setSelectedMarketplaceRequest] =
    useState<OpenRequestRow | null>(null)
  const [selectedEditData, setSelectedEditData] = useState<{
    request: OpenRequestRow
    existingQuote: ExistingQuoteData
  } | null>(null)
  const prevNotifIdsRef = useRef<Set<string>>(new Set())

  function bumpRefresh() {
    setRefreshKey((k) => k + 1)
  }

  function handleNavigateBilling() {
    setShowBilling(true)
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab)
    bumpRefresh()
  }

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  function handleShowNotifications() {
    setShowNotifications(true)
  }

  function handleBackFromDetail() {
    setSelectedRequestId(null)
    bumpRefresh()
  }

  function handleNotificationNavigate(tab: TabId) {
    setShowNotifications(false)
    setActiveTab(tab)
  }

  useEffect(() => {
    if (pendingRequestId) {
      setActiveTab('requests')
      onPendingRequestConsumed?.()
    }
  }, [pendingRequestId, onPendingRequestConsumed])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const data = await fetchUnreadNotifications()
        if (cancelled) return
        const items = Array.isArray(data) ? data : []
        const count = items.filter((n: any) => !n.isRead).length
        setUnreadCount(count)

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
  }, [refreshKey])

  useEffect(() => {
    fetchCreditBalance().then((res) => {
      if (res) setCreditBalance(res.balance ?? 0)
    })
  }, [refreshKey])

  if (selectedRequestId) {
    return (
      <RequestDetailScreen
        requestId={selectedRequestId}
        onBack={handleBackFromDetail}
        onEdit={() => {}}
      />
    )
  }

  if (selectedMarketplaceRequest) {
    return (
      <View style={styles.container}>
        <View style={styles.screenArea}>
          <SellerRequestOfferScreen
            request={selectedMarketplaceRequest}
            existingQuote={null}
            sellerId={user.id}
            onBack={() => setSelectedMarketplaceRequest(null)}
            onSuccess={() => {
              setSelectedMarketplaceRequest(null)
              bumpRefresh()
            }}
            onRequestCredits={handleNavigateBilling}
          />
        </View>
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedMarketplaceRequest(null)
            handleTabChange(tab)
          }}
          unreadCount={unreadCount}
          variant="seller"
        />
      </View>
    )
  }

  if (selectedEditData) {
    return (
      <View style={styles.container}>
        <View style={styles.screenArea}>
          <SellerRequestOfferScreen
            request={selectedEditData.request}
            existingQuote={selectedEditData.existingQuote}
            sellerId={user.id}
            initialTab="offer"
            onBack={() => setSelectedEditData(null)}
            onSuccess={() => {
              setSelectedEditData(null)
              bumpRefresh()
            }}
            onRequestCredits={handleNavigateBilling}
          />
        </View>
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedEditData(null)
            handleTabChange(tab)
          }}
          unreadCount={unreadCount}
          variant="seller"
        />
      </View>
    )
  }

  if (showNotifications) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={styles.overlayHeader}>
          <Pressable onPress={() => setShowNotifications(false)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
          <Text style={[styles.overlayTitle, { color: t.text }]}>
            Notifications
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <NotificationScreen
          onSelectRequest={setSelectedRequestId}
          onNavigateToTab={handleNotificationNavigate}
          refreshKey={refreshKey}
          onUnreadCountChange={handleUnreadCountChange}
          userRole="seller"
        />
      </View>
    )
  }

  if (showBilling) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={styles.overlayHeader}>
          <Pressable onPress={() => setShowBilling(false)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={t.text} />
          </Pressable>
          <Text style={[styles.overlayTitle, { color: t.text }]}>
            Credits & Billing
          </Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.screenArea}>
          <SellerBillingScreen refreshKey={refreshKey} />
        </View>
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setShowBilling(false)
            handleTabChange(tab)
          }}
          unreadCount={unreadCount}
          variant="seller"
        />
      </View>
    )
  }

  function renderScreen() {
    switch (activeTab) {
      case 'home':
        return (
          <SellerDashboardScreen
            user={user}
            onNavigateMarketplace={() => setActiveTab('requests')}
            onNavigateQuotes={() => setActiveTab('quotes')}
            onNavigateBilling={handleNavigateBilling}
            refreshKey={refreshKey}
          />
        )
      case 'requests':
        return (
          <SellerMarketplaceScreen
            user={user}
            onNavigateBilling={handleNavigateBilling}
            onSelectRequest={setSelectedMarketplaceRequest}
            refreshKey={refreshKey}
          />
        )
      case 'quotes':
        return (
          <SellerQuotesScreen
            user={user}
            refreshKey={refreshKey}
            onEditQuote={(request, existingQuote) =>
              setSelectedEditData({ request, existingQuote })
            }
          />
        )
      case 'notifications':
        return (
          <NotificationScreen
            onSelectRequest={setSelectedRequestId}
            onNavigateToTab={handleNotificationNavigate}
            refreshKey={refreshKey}
            onUnreadCountChange={handleUnreadCountChange}
            userRole="seller"
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onLogOut={onLogOut}
            onUserUpdate={onUserUpdate ?? ((u) => {})}
            onNavigateBilling={() => setShowBilling(true)}
            creditBalance={creditBalance}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>{renderScreen()}</View>
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        unreadCount={unreadCount}
        variant="seller"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.sm,
  },
  overlayTitle: {
    ...typography.h2,
    fontSize: 18,
    fontWeight: '700',
  },
})
