/* Hallmark · genre: modern-minimal · screen: NotificationScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  fetchUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/api-client'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { TabId } from '../components/BottomTabBar'
import type { Notification, NotificationType } from '../types/notification'

// ── Type config ───────────────────────────────────────────────────────────────

type TypeConfig = { icon: keyof typeof Ionicons.glyphMap; color: string }

function useTypeConfig(t: ReturnType<typeof useTheme>) {
  return useMemo<Record<string, TypeConfig>>(
    () => ({
      FIRST_QUOTE: { icon: 'chatbubble-outline', color: t.success },
      NEW_QUOTE: { icon: 'chatbubbles-outline', color: t.accent },
      MILESTONE_3_QUOTES: { icon: 'trophy-outline', color: '#d97706' },
      QUOTE_STATUS_CHANGE: { icon: 'swap-horizontal-outline', color: t.accent },
      QUOTE_WON: { icon: 'checkmark-circle-outline', color: t.success },
      ABANDONED_REQUEST: { icon: 'alert-circle-outline', color: t.danger },
      NEW_LEAD: { icon: 'person-add-outline', color: t.accent },
      DAILY_DIGEST: { icon: 'newspaper-outline', color: t.textSubtle },
      ACCOUNT_APPROVED: { icon: 'checkmark-done-outline', color: t.success },
      BOTTLENECK_ALERT: { icon: 'warning-outline', color: t.danger },
      NEW_SELLER_WAITLIST: { icon: 'people-outline', color: t.accent },
      SPAM_FLAG: { icon: 'flag-outline', color: t.danger },
      CREDIT_REQUEST: { icon: 'card-outline', color: t.accent },
      CREDIT_APPROVED: { icon: 'checkmark-circle-outline', color: t.success },
      CREDIT_REJECTED: { icon: 'close-circle-outline', color: t.danger },
      SYSTEM: { icon: 'information-circle-outline', color: t.textSubtle },
    }),
    [t],
  )
}

function getConfig(
  map: Record<string, TypeConfig>,
  type: NotificationType,
): TypeConfig {
  return map[type] ?? { icon: 'notifications-outline', color: '#6b7280' }
}

// ── Time formatting ───────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d`
  return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
}

function getDateGroup(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'This week'
  return 'Earlier'
}

// ── Grouping ──────────────────────────────────────────────────────────────────

interface Section {
  title: string
  data: Array<Notification>
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier']

function groupNotifications(items: Array<Notification>): Array<Section> {
  const groups: Record<string, Array<Notification>> = {}
  for (const n of items) {
    const key = getDateGroup(n.createdAt)
    ;(groups[key] ??= []).push(n)
  }
  return GROUP_ORDER.filter((k) => groups[k]?.length).map((title) => ({
    title,
    data: groups[title],
  }))
}

// ── Request ID extraction ─────────────────────────────────────────────────────

function extractRequestId(n: Notification): string | null {
  if (n.metadata?.requestId) return n.metadata.requestId
  const m = n.linkUrl?.match(/\/requests\/([^/]+)/)
  if (m) return m[1]
  return n.referenceId ?? null
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface NotificationScreenProps {
  onSelectRequest: (id: string) => void
  onNavigateToTab?: (tab: TabId) => void
  refreshKey: number
  onUnreadCountChange: (count: number) => void
  userRole?: 'buyer' | 'seller'
}

export function NotificationScreen({
  onSelectRequest,
  onNavigateToTab,
  refreshKey,
  onUnreadCountChange,
  userRole,
}: NotificationScreenProps) {
  const t = useTheme()
  const typeMap = useTypeConfig(t)

  const [notifications, setNotifications] = useState<Array<Notification>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(6)).current
  const didAnimate = useRef(false)

  const sections = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  )
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (isRefresh) setRefreshing(true)
      try {
        const data = await fetchUnreadNotifications()
        setNotifications(data)
        onUnreadCountChange(data.filter((n) => !n.isRead).length)

        if (!didAnimate.current) {
          didAnimate.current = true
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 260,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }),
          ]).start()
        }
      } catch {
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [onUnreadCountChange, fadeAnim, slideAnim],
  )

  useEffect(() => {
    load()
  }, [load, refreshKey])

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      onUnreadCountChange(0)
    } catch {
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleTap(item: Notification) {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        )
        onUnreadCountChange(Math.max(0, unreadCount - 1))
      } catch {}
    }

    const DETAIL_TYPES: Array<NotificationType> = [
      'FIRST_QUOTE',
      'NEW_QUOTE',
      'QUOTE_STATUS_CHANGE',
      'QUOTE_WON',
      'ABANDONED_REQUEST',
    ]

    const TAB_ROUTES: Partial<Record<NotificationType, TabId>> =
      userRole === 'seller'
        ? {
            FIRST_QUOTE: 'quotes',
            NEW_QUOTE: 'quotes',
            QUOTE_STATUS_CHANGE: 'quotes',
            QUOTE_WON: 'quotes',
            ABANDONED_REQUEST: 'quotes',
            NEW_LEAD: 'quotes',
            BOTTLENECK_ALERT: 'quotes',
            MILESTONE_3_QUOTES: 'quotes',
            DAILY_DIGEST: 'quotes',
            ACCOUNT_APPROVED: 'profile',
            NEW_SELLER_WAITLIST: 'profile',
            CREDIT_APPROVED: 'profile',
            CREDIT_REJECTED: 'profile',
          }
        : {
            NEW_LEAD: 'requests',
            BOTTLENECK_ALERT: 'requests',
            MILESTONE_3_QUOTES: 'requests',
            DAILY_DIGEST: 'requests',
            ACCOUNT_APPROVED: 'profile',
            NEW_SELLER_WAITLIST: 'profile',
            CREDIT_APPROVED: 'profile',
            CREDIT_REJECTED: 'profile',
          }

    if (userRole !== 'seller' && DETAIL_TYPES.includes(item.type)) {
      const requestId = extractRequestId(item)
      if (requestId) {
        onSelectRequest(requestId)
        return
      }
    }

    const tab = TAB_ROUTES[item.type]
    if (tab) onNavigateToTab?.(tab)
  }

  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  const s = makeStyles(t)

  return (
    <View style={s.root}>
      <StatusBar
        barStyle={t.bg === '#ffffff' ? 'dark-content' : 'light-content'}
        backgroundColor={t.bg}
      />

      {/* Sticky page header — sits outside the scroll */}
      <View style={[s.stickyHeader, { paddingTop: topInset }]}>
        <PageHeader
          unreadCount={unreadCount}
          markingAll={markingAll}
          onMarkAll={handleMarkAllRead}
          t={t}
        />
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} t={t} />
          )}
          ListEmptyComponent={
            loading ? <SkeletonList t={t} /> : <EmptyState t={t} />
          }
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              cfg={getConfig(typeMap, item.type)}
              onTap={handleTap}
              t={t}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        />
      </Animated.View>
    </View>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────

function PageHeader({
  unreadCount,
  markingAll,
  onMarkAll,
  t,
}: {
  unreadCount: number
  markingAll: boolean
  onMarkAll: () => void
  t: ReturnType<typeof useTheme>
}) {
  const s = makeStyles(t)
  return (
    <View style={s.pageHeader}>
      <View style={s.pageHeaderTop}>
        <View style={s.titleRow}>
          <Text style={s.pageTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <Pressable
            onPress={onMarkAll}
            disabled={markingAll}
            style={({ pressed }) => [s.markAllBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Ionicons
              name="checkmark-done-outline"
              size={15}
              color={t.accent}
            />
            <Text style={s.markAllText}>
              {markingAll ? 'Clearing…' : 'Mark all'}
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={s.pageSubtitle}>
        {unreadCount > 0
          ? `${unreadCount} unread update${unreadCount !== 1 ? 's' : ''}`
          : "You're all caught up"}
      </Text>
    </View>
  )
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  t,
}: {
  title: string
  t: ReturnType<typeof useTheme>
}) {
  const s = makeStyles(t)
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={s.sectionRule} />
    </View>
  )
}

// ── Notification card ─────────────────────────────────────────────────────────

const NotificationCard = React.memo(function NotificationCard({
  item,
  cfg,
  onTap,
  t,
}: {
  item: Notification
  cfg: TypeConfig
  onTap: (n: Notification) => void
  t: ReturnType<typeof useTheme>
}) {
  const s = makeStyles(t)
  const pressScale = useRef(new Animated.Value(1)).current

  const onPressIn = () =>
    Animated.spring(pressScale, {
      toValue: 0.97,
      stiffness: 500,
      damping: 28,
      useNativeDriver: true,
    }).start()

  const onPressOut = () =>
    Animated.spring(pressScale, {
      toValue: 1,
      stiffness: 500,
      damping: 28,
      useNativeDriver: true,
    }).start()

  const isUnread = !item.isRead

  return (
    <Pressable
      onPress={() => onTap(item)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <Animated.View
        style={[
          s.card,
          isUnread && s.cardUnread,
          {
            borderLeftColor: isUnread ? cfg.color : 'transparent',
            transform: [{ scale: pressScale }],
          },
        ]}
      >
        {/* Icon */}
        <View style={[s.iconBox, { backgroundColor: cfg.color + '12' }]}>
          <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
        </View>

        {/* Body */}
        <View style={s.cardBody}>
          <View style={s.cardHeaderRow}>
            <Text
              style={[s.cardTitle, isUnread && s.cardTitleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={s.cardTime}>{formatTime(item.createdAt)}</Text>
          </View>

          <Text style={s.cardMessage} numberOfLines={2}>
            {item.message}
          </Text>

          {item.isPriority && (
            <View style={s.priorityPill}>
              <View style={[s.priorityDot, { backgroundColor: '#d97706' }]} />
              <Text style={s.priorityText}>Priority</Text>
            </View>
          )}
        </View>

        {/* Unread dot */}
        {isUnread && (
          <View style={[s.unreadDot, { backgroundColor: cfg.color }]} />
        )}
      </Animated.View>
    </Pressable>
  )
})

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ t }: { t: ReturnType<typeof useTheme> }) {
  const s = makeStyles(t)
  return (
    <View style={s.emptyWrap}>
      <View
        style={[
          s.emptyIconBox,
          { backgroundColor: t.bgMuted, borderColor: t.border },
        ]}
      >
        <Ionicons
          name="notifications-off-outline"
          size={28}
          color={t.textSubtle}
        />
      </View>
      <Text style={s.emptyTitle}>No notifications</Text>
      <Text style={s.emptyDesc}>
        Updates on your requests and offers will appear here.
      </Text>
    </View>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({ t }: { t: ReturnType<typeof useTheme> }) {
  const anim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [anim])

  const s = makeStyles(t)

  return (
    <Animated.View style={[s.skelCard, { opacity: anim }]}>
      <View style={[s.skelIconBox, { backgroundColor: t.border }]} />
      <View style={s.skelBody}>
        <View
          style={[s.skelLine, { width: '45%', backgroundColor: t.border }]}
        />
        <View
          style={[
            s.skelLine,
            { width: '75%', backgroundColor: t.border, marginTop: 7 },
          ]}
        />
        <View
          style={[
            s.skelLine,
            { width: '35%', backgroundColor: t.border, marginTop: 5 },
          ]}
        />
      </View>
    </Animated.View>
  )
}

function SkeletonList({ t }: { t: ReturnType<typeof useTheme> }) {
  return (
    <View style={{ gap: 6, marginTop: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} t={t} />
      ))}
    </View>
  )
}

// ── Styles factory ────────────────────────────────────────────────────────────

function makeStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },
    stickyHeader: {
      paddingHorizontal: spacing.xl,
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        android: { elevation: 2 },
      }),
    },
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },

    // ── Page header ───────────────────────────
    pageHeader: {
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    pageHeaderTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
      color: t.text,
    },
    countBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.pill,
      backgroundColor: t.accent + '14',
    },
    countBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.accent,
    },
    pageSubtitle: {
      fontSize: 14,
      color: t.textMuted,
      fontWeight: '400',
    },
    markAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: t.accent + '28',
      backgroundColor: t.accent + '08',
    },
    markAllText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.accent,
    },

    // ── Section header ────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      backgroundColor: t.bg,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.1,
      color: t.textSubtle,
    },
    sectionRule: {
      flex: 1,
      height: 1,
      backgroundColor: t.border,
    },

    // ── Card ──────────────────────────────────
    card: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: t.border,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        android: { elevation: 1 },
      }),
    },
    cardUnread: {
      backgroundColor: t.bgMuted,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      color: t.textMuted,
      letterSpacing: -0.1,
    },
    cardTitleUnread: {
      fontWeight: '600',
      color: t.text,
    },
    cardTime: {
      fontSize: 11,
      fontWeight: '500',
      color: t.textSubtle,
      flexShrink: 0,
    },
    cardMessage: {
      fontSize: 13,
      color: t.textMuted,
      lineHeight: 19,
    },
    priorityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      marginTop: 5,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: radius.sm,
      backgroundColor: '#d9770608',
      borderWidth: 1,
      borderColor: '#d9770620',
    },
    priorityDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#d97706',
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      marginTop: 6,
      flexShrink: 0,
    },

    // ── Empty ─────────────────────────────────
    emptyWrap: {
      alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: spacing.xxl,
      gap: spacing.md,
    },
    emptyIconBox: {
      width: 64,
      height: 64,
      borderRadius: radius.xl,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: t.text,
      letterSpacing: -0.3,
    },
    emptyDesc: {
      fontSize: 14,
      color: t.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },

    // ── Skeleton ──────────────────────────────
    skelCard: {
      flexDirection: 'row',
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
    },
    skelIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      flexShrink: 0,
    },
    skelBody: {
      flex: 1,
    },
    skelLine: {
      height: 10,
      borderRadius: radius.sm,
    },
  })
}
