/* Hallmark · genre: modern-minimal · screen: NotificationsScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Platform,
  Pressable,
  SectionList,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { View, Text, useIsRTL } from 'expo-rtl'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/api-client'
import { unreadNotificationsQueryOptions } from '../features/notifications/queries/notifications'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
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

function formatTime(
  iso: string,
  t: (key: string, options?: Record<string, any>) => string,
  lang: string,
): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return t('common.now')
  if (mins < 60) return t('common.minutesAgo', { count: mins })
  const h = Math.floor(mins / 60)
  if (h < 24) return t('common.hoursAgo', { count: h })
  const days = Math.floor(h / 24)
  if (days === 1) return t('common.yesterday')
  if (days < 7) return t('common.daysAgo', { count: days })
  return d.toLocaleDateString(lang, { day: 'numeric', month: 'short' })
}

function getDateGroup(iso: string, t: (key: string) => string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)
  if (diffDays === 0) return t('notifications.today')
  if (diffDays === 1) return t('notifications.yesterday')
  if (diffDays < 7) return t('notifications.thisWeek')
  return t('notifications.earlier')
}

// ── Grouping ──────────────────────────────────────────────────────────────────

interface Section {
  title: string
  data: Array<Notification>
}

const GROUP_ORDER_KEYS = [
  'notifications.today',
  'notifications.yesterday',
  'notifications.thisWeek',
  'notifications.earlier',
]

function groupNotifications(
  items: Array<Notification>,
  t: (key: string) => string,
): Array<Section> {
  const groups: Record<string, Array<Notification>> = {}
  for (const n of items) {
    const key = getDateGroup(n.createdAt, t)
    ;(groups[key] ??= []).push(n)
  }
  return GROUP_ORDER_KEYS.map((k) => t(k))
    .filter((title) => groups[title]?.length)
    .map((title) => ({
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

// ── i18n helpers ───────────────────────────────────────────────

const TITLE_TO_ACTION: Record<string, string> = {
  'Offer Price Updated': 'price_updated',
  'Offer Not Selected': 'rejected',
  'Offer Back in the Running': 'unrejected',
  'Offer Back in Consideration': 'revoked',
  'Action Required — Mark Request as Fulfilled': 'reminder',
  'Deal Confirmed!': 'fulfilled_winner',
  'Request Fulfilled by Another Seller': 'fulfilled_loser',
}

function getNotifTypeKey(
  type: NotificationType,
  title: string,
  meta?: Notification['metadata'],
): string | null {
  if (type === 'NEW_QUOTE' && meta?.action === 'batched') {
    return 'NEW_QUOTE_batched'
  }
  if (type === 'QUOTE_STATUS_CHANGE') {
    const action = meta?.action ?? TITLE_TO_ACTION[title]
    return action ? `QUOTE_STATUS_CHANGE.${action}` : null
  }
  if (type === 'CREDIT_REJECTED' && meta?.adminNote) {
    return 'CREDIT_REJECTED_with_reason'
  }
  return type
}

function lookupTranslation(
  t: (key: string, opts?: Record<string, any>) => string,
  base: string,
  item: Notification,
  raw: string,
): string {
  const rawLookup = t(base)
  if (rawLookup === base || rawLookup === undefined) return raw
  return t(base, item.metadata ?? {})
}

function translateNotificationTitle(
  item: Notification,
  t: (key: string, opts?: Record<string, any>) => string,
): string {
  const suffix = getNotifTypeKey(item.type, item.title, item.metadata)
  if (!suffix) return item.title
  return lookupTranslation(t, `notifications.titles.${suffix}`, item, item.title)
}

function translateNotificationMessage(
  item: Notification,
  t: (key: string, opts?: Record<string, any>) => string,
): string {
  const suffix = getNotifTypeKey(item.type, item.title, item.metadata)
  if (!suffix) return item.message
  return lookupTranslation(t, `notifications.messages.${suffix}`, item, item.message)
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface NotificationsScreenProps {
  onSelectRequest?: (id: string) => void
  onNavigateToTab?: (tab: TabId) => void
  refreshKey?: number
  onUnreadCountChange?: (count: number) => void
}

export function NotificationsScreen({
  onSelectRequest,
  onNavigateToTab,
  refreshKey,
  onUnreadCountChange,
}: NotificationsScreenProps) {
  const navigation = useNavigation<any>()
  const role = useUserStore((s) => s.user?.role ?? 'buyer')
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const typeMap = useTypeConfig(t)

  const {
    data: notifications = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(unreadNotificationsQueryOptions)
  const [markingAll, setMarkingAll] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(6)).current
  const didAnimate = useRef(false)

  const sections = useMemo(
    () => groupNotifications(notifications, i18n),
    [notifications, i18n],
  )
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  )

  useEffect(() => {
    onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  useEffect(() => {
    if (!isLoading && !didAnimate.current) {
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
  }, [isLoading, fadeAnim, slideAnim])

  const queryClient = useQueryClient()

  async function handleMarkAllRead() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      queryClient.setQueryData<Array<Notification>>(
        ['unread-notifications'],
        (prev) => prev?.map((n) => ({ ...n, isRead: true })),
      )
      onUnreadCountChange?.(0)
    } catch {
    } finally {
      setMarkingAll(false)
    }
  }

  async function handleTap(item: Notification) {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id)
        queryClient.setQueryData<Array<Notification>>(
          ['unread-notifications'],
          (prev) =>
            prev?.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        )
        onUnreadCountChange?.(Math.max(0, unreadCount - 1))
      } catch {}
    }

    const requestId = extractRequestId(item)

    if (role === 'seller') {
      if (item.type === 'QUOTE_STATUS_CHANGE') {
        const action = item.metadata?.action
        if (action === 'accepted' || action === 'rejected') {
          navigation.navigate('MyQuotes')
          return
        }
        if (action === 'order_change' && requestId) {
          const sellerId = useUserStore.getState().user?.id
          if (sellerId) {
            navigation.navigate('SubmitQuote', {
              requestId,
              existingQuote: null,
              sellerId,
              initialTab: 'offer',
            })
            return
          }
        }
      }

      if (requestId) {
        navigation.navigate('RequestDetails', { requestId })
        return
      }

      // Account/credit notifications: no requestId, fall through to tab
      const SELLER_TAB_ROUTES: Partial<Record<NotificationType, TabId>> = {
        ACCOUNT_APPROVED: 'profile',
        NEW_SELLER_WAITLIST: 'profile',
        CREDIT_APPROVED: 'profile',
        CREDIT_REJECTED: 'profile',
      }
      const tab = SELLER_TAB_ROUTES[item.type]
      if (tab && onNavigateToTab) {
        onNavigateToTab(tab)
      }
      return
    }

    // Buyer navigation
    const DETAIL_TYPES: Array<NotificationType> = [
      'FIRST_QUOTE',
      'NEW_QUOTE',
      'QUOTE_STATUS_CHANGE',
      'QUOTE_WON',
      'ABANDONED_REQUEST',
    ]

    if (DETAIL_TYPES.includes(item.type) && requestId) {
      if (onSelectRequest) {
        onSelectRequest(requestId)
      } else {
        navigation.navigate('RequestDetails', { requestId })
      }
      return
    }

    const BUYER_TAB_ROUTES: Partial<Record<NotificationType, TabId>> = {
      NEW_LEAD: 'requests',
      BOTTLENECK_ALERT: 'requests',
      MILESTONE_3_QUOTES: 'requests',
      DAILY_DIGEST: 'requests',
      ACCOUNT_APPROVED: 'profile',
      NEW_SELLER_WAITLIST: 'profile',
      CREDIT_APPROVED: 'profile',
      CREDIT_REJECTED: 'profile',
    }
    const tab = BUYER_TAB_ROUTES[item.type]
    if (tab && onNavigateToTab) {
      onNavigateToTab(tab)
    }
  }

  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  const isRTL = useIsRTL()
  const s = makeStyles(t, isRTL)

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
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} t={t} />
          )}
          ListEmptyComponent={
            isLoading ? <SkeletonList t={t} /> : <EmptyState t={t} />
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
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const s = makeStyles(t, isRTL)
  return (
    <View style={s.pageHeader}>
      <View style={s.pageHeaderTop}>
        <View style={s.titleRow}>
          <Text style={s.pageTitle}>{i18n('notifications.title')}</Text>
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
            accessibilityLabel={i18n('notifications.markAllRead')}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={15}
              color={t.accent}
            />
            <Text style={s.markAllText}>
              {markingAll
                ? i18n('notifications.markAllRead')
                : i18n('notifications.markAllRead')}
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={s.pageSubtitle}>
        {unreadCount > 0
          ? i18n('notifications.unread', { count: unreadCount })
          : i18n('notifications.empty')}
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
  const isRTL = useIsRTL()
  const s = makeStyles(t, isRTL)
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
  const { t: i18n, i18n: i18nInst } = useTranslation()
  const isRTL = useIsRTL()
  const s = makeStyles(t, isRTL)
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
      accessibilityLabel={translateNotificationTitle(item, i18n)}
    >
      <Animated.View
          style={[
            s.card,
            isUnread && s.cardUnread,
            isRTL
              ? { borderRightColor: isUnread ? cfg.color : 'transparent' }
              : { borderLeftColor: isUnread ? cfg.color : 'transparent' },
            {
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
              {translateNotificationTitle(item, i18n)}
            </Text>
            <Text style={s.cardTime}>
              {formatTime(item.createdAt, i18n, i18nInst.language)}
            </Text>
          </View>

          <Text style={s.cardMessage} numberOfLines={2}>
            {translateNotificationMessage(item, i18n)}
          </Text>

          {item.isPriority && (
            <View style={s.priorityPill}>
              <View style={[s.priorityDot, { backgroundColor: '#d97706' }]} />
              <Text style={s.priorityText}>{i18n('notifications.priority')}</Text>
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
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const s = makeStyles(t, isRTL)
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
      <Text style={s.emptyTitle}>{i18n('notifications.empty')}</Text>
      <Text style={s.emptyDesc}>{i18n('notifications.emptyDesc')}</Text>
    </View>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({ t }: { t: ReturnType<typeof useTheme> }) {
  const anim = useRef(new Animated.Value(1)).current
  const isRTL = useIsRTL()

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

  const s = makeStyles(t, isRTL)

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

function makeStyles(t: ReturnType<typeof useTheme>, isRTL: boolean) {
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
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      textAlign: isRTL ? 'right' : 'left',
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
      borderLeftWidth: isRTL ? 0 : 3,
      borderRightWidth: isRTL ? 3 : 0,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
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
