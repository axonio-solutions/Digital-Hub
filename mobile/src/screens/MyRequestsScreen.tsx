/* Hallmark · genre: modern-minimal · screen: MyRequestsScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Platform, Pressable, StatusBar, StyleSheet } from 'react-native'
import { ScrollView, Text, View, useIsRTL } from 'expo-rtl'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AnimatedPressable } from '../components/AnimatedPressable'
import { SkeletonCard } from '../components/Skeleton'
import { buyerRequestsQueryOptions } from '../features/buyer/queries/requests'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useTranslation } from 'react-i18next'
import type { Theme } from '../theme/tokens'
import type { BuyerRequestRow } from '../types/buyer'
import type { BuyerRequestsStackParamList } from '../navigation/types'
import { tCategory } from '../utils/category-utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'open' | 'fulfilled' | 'cancelled'

const FILTERS = (
  t: (k: string) => string,
): Array<{ key: StatusFilter; label: string }> => [
  { key: 'all', label: t('requests.filter.all') },
  { key: 'open', label: t('requests.filter.open') },
  { key: 'fulfilled', label: t('requests.filter.fulfilled') },
  { key: 'cancelled', label: t('requests.filter.cancelled') },
]

function statusConfig(t: Theme, translate?: (k: string) => string) {
  const tr = translate || ((s: string) => s)
  return {
    open: { label: tr('requests.status.open'), color: t.success },
    fulfilled: { label: tr('requests.status.fulfilled'), color: '#d97706' },
    cancelled: { label: tr('requests.status.cancelled'), color: t.danger },
  } as Record<string, { label: string; color: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string, t: (k: string) => string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  if (days < 7) return `${days}d ${t('common.ago')}`
  return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
}

function emptyMessage(filter: StatusFilter, t: (k: string) => string): string {
  if (filter === 'open') return t('requests.empty.noOpen')
  if (filter === 'fulfilled') return t('requests.empty.noFulfilled')
  if (filter === 'cancelled') return t('requests.empty.noCancelled')
  return t('requests.empty.title')
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface MyRequestsScreenProps {
  onSelectRequest?: (id: string) => void
  refreshKey?: number
}

export function MyRequestsScreen({
  onSelectRequest,
  refreshKey,
}: MyRequestsScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<BuyerRequestsStackParamList>>()
  const { t: translate } = useTranslation()
  const isRTL = useIsRTL()
  const t = useTheme()
  const s = makeStyles(t)
  const insets = useSafeAreaInsets()

  const queryClient = useQueryClient()
  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(buyerRequestsQueryOptions)
  const [filter, setFilter] = useState<StatusFilter>('all')

  const fadeAnim = useSharedValue(0)
  const slideAnim = useSharedValue(6)

  useEffect(() => {
    if (!isLoading) {
      fadeAnim.value = withTiming(1, { duration: 260 })
      slideAnim.value = withTiming(0, { duration: 260 })
    }
  }, [isLoading])

  const entryStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }))

  useEffect(() => {
    if (refreshKey !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['buyer-requests'] })
    }
  }, [refreshKey, queryClient])

  const filtered = useMemo(
    () => requests.filter((r) => filter === 'all' || r.status === filter),
    [requests, filter],
  )

  const countFor = useCallback(
    (key: StatusFilter) =>
      key === 'all'
        ? requests.length
        : requests.filter((r) => r.status === key).length,
    [requests],
  )

  const renderItem = useCallback(
    ({ item }: { item: BuyerRequestRow }) => (
      <RequestCard
        item={item}
        pendingQuotes={item.quotes.filter((q) => q.status === 'pending').length}
        onPress={() => {
          if (onSelectRequest) onSelectRequest(item.id)
          else navigation.navigate('RequestDetails', { requestId: item.id })
        }}
        t={t}
        s={s}
        translate={translate}
      />
    ),
    [onSelectRequest, t, s, translate],
  )

  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  return (
    <View style={s.root}>
      <StatusBar
        barStyle={t.bg === '#ffffff' ? 'dark-content' : 'light-content'}
        backgroundColor={t.bg}
      />

      {/* ── Sticky header + filters ──────────────────────────── */}
      <View style={[s.stickyTop, { paddingTop: topInset }]}>
        <View style={s.pageHeaderRow}>
          <View>
            <Text style={s.pageTitle}>{translate('requests.title')}</Text>
            <Text style={s.pageSub}>{translate('requests.subtitle')}</Text>
          </View>
          {requests.length > 0 && (
            <View style={s.countBadge}>
              <Text style={s.countBadgeText}>{requests.length}</Text>
            </View>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            s.filterRow,
            { flexGrow: 1 },
            !isRTL && { justifyContent: 'flex-end' },
          ]}
        >
          {FILTERS(translate).map((f) => {
            const active = filter === f.key
            const count = countFor(f.key)
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [
                  s.filterChip,
                  active ? s.filterChipActive : s.filterChipInactive,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[s.filterChipLabel, active && s.filterChipLabelActive]}
                >
                  {f.label}
                </Text>
                <View
                  style={[s.filterChipCount, active && s.filterChipCountActive]}
                >
                  <Text
                    style={[
                      s.filterChipCountText,
                      active && s.filterChipCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* ── List ─────────────────────────────────────────────── */}
      <Animated.View style={[{ flex: 1 }, entryStyle]}>
        <FlashList
          data={isLoading ? [] : filtered}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListHeaderComponent={
            isLoading ? (
              <View style={{ gap: spacing.sm }}>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                message={emptyMessage(filter, translate)}
                t={t}
                s={s}
                translate={translate}
              />
            ) : null
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      </Animated.View>
    </View>
  )
}

// ── Request card ──────────────────────────────────────────────────────────────

function RequestCard({
  item,
  pendingQuotes,
  onPress,
  t,
  s,
  translate,
}: {
  item: BuyerRequestRow
  pendingQuotes: number
  onPress: () => void
  t: Theme
  s: ReturnType<typeof makeStyles>
  translate: (k: string) => string
}) {
  const cfg = statusConfig(t, translate)[item.status] ?? {
    label: item.status,
    color: t.textSubtle,
  }
  const isNew = Date.now() - new Date(item.createdAt).getTime() < 86_400_000

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.partName}, ${cfg.label}`}
      scaleTo={0.97}
      springConfig={{ stiffness: 500, damping: 28 }}
      containerStyle={[
        s.card,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          borderLeftColor: cfg.color,
        },
      ]}
    >
      <View style={s.cardRow}>
        {/* Thumbnail */}
        <View>
          {item.imageUrls?.[0] ? (
            <Image
              source={{ uri: item.imageUrls[0] }}
              style={s.thumb}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                s.thumb,
                s.thumbPlaceholder,
                { backgroundColor: t.bgMuted },
              ]}
            >
              <Ionicons
                name="car-sport-outline"
                size={22}
                color={t.textSubtle}
              />
            </View>
          )}
          {item.isPriority && (
            <View style={[s.priorityPin, { borderColor: t.bg }]}>
              <Ionicons name="star" size={8} color="#fff" />
            </View>
          )}
          {isNew && (
            <View
              style={[
                s.newDot,
                { backgroundColor: t.success, borderColor: t.bg },
              ]}
            />
          )}
        </View>

        {/* Body */}
        <View style={s.cardBody}>
          <View style={s.cardTitleRow}>
            <Text style={[s.cardTitle, { color: t.text }]} numberOfLines={1}>
              {item.partName}
            </Text>
            <View
              style={[
                s.statusBadge,
                {
                  backgroundColor: cfg.color + '12',
                  borderColor: cfg.color + '28',
                },
              ]}
            >
              <View style={[s.statusDot, { backgroundColor: cfg.color }]} />
              <Text style={[s.statusLabel, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
          </View>

          <View style={s.metaRow}>
            {/* Brand */}
            <View
              style={[
                s.metaChip,
                { backgroundColor: t.bgMuted, borderColor: t.border },
              ]}
            >
              {item.brand?.imageUrl ? (
                <Image
                  source={{ uri: item.brand.imageUrl }}
                  style={s.metaLogo}
                  contentFit="cover"
                />
              ) : null}
              <Text
                style={[s.metaText, { color: t.textMuted }]}
                numberOfLines={1}
              >
                {item.brand?.brand ?? item.vehicleBrand}
              </Text>
            </View>

            {/* Category */}
            {item.category?.name ? (
              <View
                style={[
                  s.metaChip,
                  { backgroundColor: t.bgMuted, borderColor: t.border },
                ]}
              >
                <Text
                  style={[s.metaText, { color: t.textMuted }]}
                  numberOfLines={1}
                >
                  {tCategory(item.category, translate)}
                </Text>
              </View>
            ) : null}

            {/* Year */}
            {item.modelYear ? (
              <View
                style={[
                  s.metaChip,
                  { backgroundColor: t.bgMuted, borderColor: t.border },
                ]}
              >
                <Text style={[s.metaText, { color: t.textMuted }]}>
                  {item.modelYear}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.cardFooter}>
            {pendingQuotes > 0 && (
              <View
                style={[
                  s.offersBadge,
                  {
                    backgroundColor: t.success + '12',
                    borderColor: t.success + '28',
                  },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={11}
                  color={t.success}
                />
                <Text style={[s.offersText, { color: t.success }]}>
                  {pendingQuotes}{' '}
                  {pendingQuotes === 1
                    ? translate('requests.oneOffer')
                    : translate('requests.manyOffers')}
                </Text>
              </View>
            )}
            <Text style={[s.cardDate, { color: t.textSubtle }]}>
              {formatDate(item.createdAt, translate)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  message,
  t,
  s,
  translate,
}: {
  message: string
  t: Theme
  s: ReturnType<typeof makeStyles>
  translate: (k: string) => string
}) {
  return (
    <View style={s.emptyWrap}>
      <View
        style={[
          s.emptyIconBox,
          { backgroundColor: t.bgMuted, borderColor: t.border },
        ]}
      >
        <Ionicons name="clipboard-outline" size={28} color={t.textSubtle} />
      </View>
      <Text style={[s.emptyTitle, { color: t.text }]}>{message}</Text>
      <Text style={[s.emptyDesc, { color: t.textMuted }]}>
        {translate('requests.empty.description')}
      </Text>
    </View>
  )
}

// ── Styles factory ────────────────────────────────────────────────────────────

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },

    // ── Sticky top ────────────────────────────────────────────
    stickyTop: {
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      paddingHorizontal: spacing.xl,
      paddingBottom: 0,
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
    pageHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.md,
    },
    pageTitle: {
      ...typography.h1,
      color: t.text,
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    pageSub: {
      ...typography.caption,
      color: t.textMuted,
    },
    countBadge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: t.accent + '14',
      marginTop: 4,
    },
    countBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: t.accent,
    },

    // ── Filter chips ──────────────────────────────────────────
    filterRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingVertical: spacing.md,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    filterChipActive: {
      backgroundColor: t.accent,
      borderColor: t.accent,
    },
    filterChipInactive: {
      backgroundColor: t.surface,
      borderColor: t.border,
    },
    filterChipLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textMuted,
    },
    filterChipLabelActive: {
      fontWeight: '600',
      color: '#fff',
    },
    filterChipCount: {
      minWidth: 18,
      height: 18,
      borderRadius: radius.pill,
      backgroundColor: t.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    filterChipCountActive: {
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    filterChipCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textSubtle,
    },
    filterChipCountTextActive: {
      color: '#fff',
    },

    // ── List ──────────────────────────────────────────────────
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
    },

    // ── Request card ──────────────────────────────────────────
    card: {
      width: '100%',
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderLeftWidth: 3,
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
    thumb: {
      width: 64,
      height: 64,
      borderRadius: radius.md,
    },
    thumbPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    priorityPin: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: radius.pill,
      backgroundColor: '#d97706',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    newDot: {
      position: 'absolute',
      bottom: -3,
      left: -3,
      width: 11,
      height: 11,
      borderRadius: radius.pill,
      borderWidth: 2,
    },
    cardBody: {
      flex: 1,
      gap: 5,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: radius.sm,
      borderWidth: 1,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    statusLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
      borderWidth: 1,
    },
    metaLogo: {
      width: 13,
      height: 13,
      borderRadius: 2,
    },
    metaText: {
      fontSize: 11,
      fontWeight: '500',
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 1,
    },
    offersBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.sm,
      borderWidth: 1,
    },
    offersText: {
      fontSize: 11,
      fontWeight: '600',
    },
    cardDate: {
      fontSize: 11,
      marginLeft: 'auto' as any,
    },
    cardRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },

    // ── Empty state ───────────────────────────────────────────
    emptyWrap: {
      alignItems: 'center',
      paddingTop: 72,
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
      letterSpacing: -0.3,
    },
    emptyDesc: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
    },
  })
}
