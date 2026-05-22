/* Hallmark · genre: modern-minimal · screen: RequestsScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { fetchBuyerRequests } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { Theme } from '../theme/tokens'
import type { BuyerRequestRow } from '../types/buyer'

// ── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'open' | 'fulfilled' | 'cancelled'

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'cancelled', label: 'Cancelled' },
]

function statusConfig(t: Theme) {
  return {
    open: { label: 'Open', color: t.success },
    fulfilled: { label: 'Fulfilled', color: '#d97706' },
    cancelled: { label: 'Cancelled', color: t.danger },
  } as Record<string, { label: string; color: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
}

function emptyMessage(filter: StatusFilter): string {
  if (filter === 'open') return 'No open requests'
  if (filter === 'fulfilled') return 'No fulfilled requests'
  if (filter === 'cancelled') return 'No cancelled requests'
  return 'No requests yet'
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface RequestsScreenProps {
  onSelectRequest: (id: string) => void
  refreshKey: number
}

export function RequestsScreen({
  onSelectRequest,
  refreshKey,
}: RequestsScreenProps) {
  const t = useTheme()
  const s = makeStyles(t)
  const insets = useSafeAreaInsets()

  const [requests, setRequests] = useState<Array<BuyerRequestRow>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>('all')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(6)).current
  const didAnimate = useRef(false)

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (isRefresh) setRefreshing(true)
      try {
        const data = await fetchBuyerRequests()
        setRequests(data)
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
        // silently fail — stale data is fine
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [refreshKey, fadeAnim, slideAnim],
  )

  useEffect(() => {
    load()
  }, [load])

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
        onPress={() => onSelectRequest(item.id)}
        t={t}
        s={s}
      />
    ),
    [onSelectRequest, t, s],
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
            <Text style={s.pageTitle}>My Requests</Text>
            <Text style={s.pageSub}>Track and manage your part requests.</Text>
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
          contentContainerStyle={s.filterRow}
        >
          {FILTERS.map((f) => {
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
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <FlatList
          data={loading ? [] : filtered}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          initialNumToRender={5}
          contentContainerStyle={[
            s.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListHeaderComponent={
            loading ? (
              <View style={{ gap: spacing.sm }}>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonCard key={i} t={t} s={s} />
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState message={emptyMessage(filter)} t={t} s={s} />
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
}: {
  item: BuyerRequestRow
  pendingQuotes: number
  onPress: () => void
  t: Theme
  s: ReturnType<typeof makeStyles>
}) {
  const pressScale = useRef(new Animated.Value(1)).current
  const cfg = statusConfig(t)[item.status] ?? {
    label: item.status,
    color: t.textSubtle,
  }
  const isNew = Date.now() - new Date(item.createdAt).getTime() < 86_400_000

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

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={`${item.partName}, ${cfg.label}`}
    >
      <Animated.View
        style={[
          s.card,
          {
            backgroundColor: t.surface,
            borderColor: t.border,
            borderLeftColor: cfg.color,
          },
          { transform: [{ scale: pressScale }] },
        ]}
      >
        {/* Thumbnail */}
        <View>
          {item.imageUrls?.[0] ? (
            <Image
              source={{ uri: item.imageUrls[0] }}
              style={s.thumb}
              resizeMode="cover"
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
                  {item.category.name}
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
                  {pendingQuotes} offer{pendingQuotes !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
            <Text style={[s.cardDate, { color: t.textSubtle }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({
  t,
  s,
}: {
  t: Theme
  s: ReturnType<typeof makeStyles>
}) {
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

  return (
    <Animated.View
      style={[
        s.skelCard,
        { backgroundColor: t.surface, borderColor: t.border, opacity: anim },
      ]}
    >
      <View style={[s.skelThumb, { backgroundColor: t.border }]} />
      <View style={s.skelBody}>
        <View
          style={[s.skelLine, { width: '60%', backgroundColor: t.border }]}
        />
        <View
          style={[
            s.skelLine,
            { width: '42%', backgroundColor: t.border, marginTop: 7 },
          ]}
        />
        <View
          style={[
            s.skelLine,
            { width: '28%', backgroundColor: t.border, marginTop: 5 },
          ]}
        />
      </View>
    </Animated.View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  message,
  t,
  s,
}: {
  message: string
  t: Theme
  s: ReturnType<typeof makeStyles>
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
        Post a part request and receive competitive quotes from verified sellers
        across Algeria.
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
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
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

    // ── Skeleton ──────────────────────────────────────────────
    skelCard: {
      flexDirection: 'row',
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    skelThumb: {
      width: 64,
      height: 64,
      borderRadius: radius.md,
      flexShrink: 0,
    },
    skelBody: { flex: 1 },
    skelLine: {
      height: 10,
      borderRadius: radius.sm,
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
