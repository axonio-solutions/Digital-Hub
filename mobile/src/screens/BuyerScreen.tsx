import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomTabBar } from '../components/BottomTabBar'
import { fetchUnreadNotifications } from '../lib/api-client'
import { scheduleLocalNotification } from '../lib/push-notifications'
import { BuyerDashboardScreen } from './BuyerDashboardScreen'
import { CreateRequestScreen } from './CreateRequestScreen'
import { NotificationScreen } from './NotificationScreen'
import { ProfileScreen } from './ProfileScreen'
import { RequestsScreen } from './RequestsScreen'
import { RequestDetailScreen } from './RequestDetailScreen'
import type { TabId } from '../components/BottomTabBar'
import type { SessionUser } from '../lib/api-client'
import type { BuyerRequestRow } from '../types/buyer'

const POLL_INTERVAL_MS = 30000

type NavState =
  | { screen: 'tabs' }
  | { screen: 'detail'; requestId: string }
  | { screen: 'edit'; requestId: string; prefetchedRequest: BuyerRequestRow }
  | { screen: 'create' }

interface BuyerScreenProps {
  user: SessionUser
  onLogOut: () => void
  onUserUpdate?: (user: SessionUser) => void
  pendingRequestId?: string | null
  onPendingRequestConsumed?: () => void
}

export function BuyerScreen({
  user,
  onLogOut,
  onUserUpdate,
  pendingRequestId,
  onPendingRequestConsumed,
}: BuyerScreenProps) {
  const [nav, setNav] = useState<NavState>({ screen: 'tabs' })
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [refreshKey, setRefreshKey] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const prevNotifIdsRef = useRef<Set<string>>(new Set())

  function bumpRefresh() {
    setRefreshKey((k) => k + 1)
  }

  function handleBackFromDetail() {
    setNav({ screen: 'tabs' })
    bumpRefresh()
  }

  function handleEditRequest(id: string, data: BuyerRequestRow) {
    setNav({ screen: 'edit', requestId: id, prefetchedRequest: data })
  }

  function handleBackFromCreate() {
    if (nav.screen === 'edit') {
      setNav({ screen: 'detail', requestId: nav.requestId })
    } else {
      setNav({ screen: 'tabs' })
      setActiveTab('home')
    }
    bumpRefresh()
  }

  function handleTabChange(tab: TabId) {
    if (tab === 'billing' || tab === 'quotes') return
    setActiveTab(tab)
    bumpRefresh()
  }

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  useEffect(() => {
    if (pendingRequestId) {
      setNav({ screen: 'detail', requestId: pendingRequestId })
      setActiveTab('home')
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
  }, [refreshKey])

  // ── Full-screen nav states ───────────────────────────────────────────────────

  if (nav.screen === 'edit') {
    return (
      <CreateRequestScreen
        buyerId={user.id}
        editRequestId={nav.requestId}
        initialData={nav.prefetchedRequest}
        onBack={handleBackFromCreate}
      />
    )
  }

  if (nav.screen === 'create') {
    return (
      <CreateRequestScreen buyerId={user.id} onBack={handleBackFromCreate} />
    )
  }

  if (nav.screen === 'detail') {
    return (
      <RequestDetailScreen
        requestId={nav.requestId}
        onBack={handleBackFromDetail}
        onEdit={handleEditRequest}
      />
    )
  }

  // ── Tab layout ───────────────────────────────────────────────────────────────

  function renderScreen() {
    switch (activeTab) {
      case 'home':
        return (
          <BuyerDashboardScreen
            user={user}
            onSelectRequest={(id) =>
              setNav({ screen: 'detail', requestId: id })
            }
            refreshKey={refreshKey}
          />
        )
      case 'requests':
        return (
          <RequestsScreen
            onSelectRequest={(id) =>
              setNav({ screen: 'detail', requestId: id })
            }
            refreshKey={refreshKey}
          />
        )
      case 'notifications':
        return (
          <NotificationScreen
            onSelectRequest={(id) =>
              setNav({ screen: 'detail', requestId: id })
            }
            onNavigateToTab={handleTabChange}
            refreshKey={refreshKey}
            onUnreadCountChange={handleUnreadCountChange}
            userRole="buyer"
          />
        )
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onLogOut={onLogOut}
            onUserUpdate={onUserUpdate ?? (() => {})}
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
        onCreatePress={() => setNav({ screen: 'create' })}
        unreadCount={unreadCount}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenArea: { flex: 1 },
})
