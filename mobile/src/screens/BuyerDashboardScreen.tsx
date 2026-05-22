/* Hallmark · genre: modern-minimal · screen: BuyerDashboardScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { fetchBuyerRequests } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { Theme } from '../theme/tokens'
import type { SessionUser } from '../lib/api-client'
import type { BuyerRequestRow } from '../types/buyer'

// ── Status config ─────────────────────────────────────────────────────────────

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

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface BuyerDashboardScreenProps {
  user: SessionUser
  onSelectRequest: (id: string) => void
  refreshKey: number
}

export function BuyerDashboardScreen({
  user,
  onSelectRequest,
  refreshKey,
}: BuyerDashboardScreenProps) {
  const t = useTheme()
  const s = makeStyles(t)

  const [requests, setRequests] = useState<Array<BuyerRequestRow>>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(8)).current
  const didAnimate = useRef(false)

  const load = useCallback(
    async (isRefresh?: boolean) => {
      let cancelled = false
      if (isRefresh) setRefreshing(true)
      try {
        const data = await fetchBuyerRequests()
        if (!cancelled) {
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
        }
      } catch {
        if (!cancelled) Alert.alert('Error', 'Could not load your requests.')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setRefreshing(false)
        }
      }
      return () => {
        cancelled = true
      }
    },
    [refreshKey, fadeAnim, slideAnim],
  )

  useEffect(() => {
    load()
  }, [load])

  const metrics = useMemo(
    () => ({
      active: requests.filter((r) => r.status === 'open').length,
      offers: requests.reduce((s, r) => s + (r.quotes?.length ?? 0), 0),
      fulfilled: requests.filter((r) => r.status === 'fulfilled').length,
    }),
    [requests],
  )

  const recent = useMemo(
    () =>
      [...requests]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [requests],
  )

  const firstName = user.name?.split(' ')[0] ?? ''
  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  return (
    <View style={s.root}>
      <StatusBar
        barStyle={t.bg === '#ffffff' ? 'dark-content' : 'light-content'}
        backgroundColor={t.bg}
      />

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <FlatList
          data={recent}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => load(true)}
          showsVerticalScrollIndicator={false}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          initialNumToRender={5}
          contentContainerStyle={[s.scrollContent, { paddingTop: topInset }]}
          ListHeaderComponent={
            <>
              {/* ── Greeting header ──────────────────────── */}
              <View style={s.header}>
                <View style={s.headerRow}>
                  <View>
                    <Text style={s.greetingLabel}>
                      {greeting()}
                      {firstName ? `, ${firstName}` : ''}
                    </Text>
                    <Text style={s.greetingSub}>
                      Track requests and review incoming offers.
                    </Text>
                  </View>

                  <Avatar user={user} t={t} s={s} />
                </View>
              </View>

              {/* ── Metrics ──────────────────────────────── */}
              <View style={s.metricsRow}>
                <HeroMetric
                  value={metrics.active}
                  label="Active"
                  desc="Awaiting offers"
                  t={t}
                  s={s}
                />
                <View style={s.metricsCol}>
                  <SmallMetric
                    icon="chatbubbles-outline"
                    value={metrics.offers}
                    label="Offers"
                    color={t.success}
                    t={t}
                    s={s}
                  />
                  <SmallMetric
                    icon="checkmark-done-outline"
                    value={metrics.fulfilled}
                    label="Done"
                    color="#d97706"
                    t={t}
                    s={s}
                  />
                </View>
              </View>

              {/* ── Section header ────────────────────────── */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>RECENT REQUESTS</Text>
                <View style={s.sectionRule} />
                {requests.length > 0 && (
                  <View style={s.sectionCount}>
                    <Text style={s.sectionCountText}>{requests.length}</Text>
                  </View>
                )}
              </View>

              {loading && (
                <View style={{ gap: spacing.sm }}>
                  {[0, 1, 2].map((i) => (
                    <SkeletonCard key={i} t={t} s={s} />
                  ))}
                </View>
              )}
            </>
          }
          ListEmptyComponent={!loading ? <EmptyState t={t} s={s} /> : null}
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              pendingQuotes={
                item.quotes.filter((q) => q.status === 'pending').length
              }
              onPress={() => onSelectRequest(item.id)}
              t={t}
              s={s}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      </Animated.View>
    </View>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  user,
  t,
  s,
}: {
  user: SessionUser
  t: Theme
  s: ReturnType<typeof makeStyles>
}) {
  const initial = (user.name?.[0] ?? 'U').toUpperCase()
  return (
    <View style={s.avatarWrap}>
      {user.image ? (
        <Image source={{ uri: user.image }} style={s.avatarImage} />
      ) : (
        <View
          style={[
            s.avatarFallback,
            { backgroundColor: t.accent + '14', borderColor: t.accent + '28' },
          ]}
        >
          <Text style={[s.avatarInitial, { color: t.accent }]}>{initial}</Text>
        </View>
      )}
      <View
        style={[
          s.avatarOnline,
          { backgroundColor: t.success, borderColor: t.bg },
        ]}
      />
    </View>
  )
}

// ── Hero metric ───────────────────────────────────────────────────────────────

function HeroMetric({
  value,
  label,
  desc,
  t,
  s,
}: {
  value: number
  label: string
  desc: string
  t: Theme
  s: ReturnType<typeof makeStyles>
}) {
  return (
    <View style={[s.metricHero, { backgroundColor: t.accent }]}>
      <View
        style={[
          s.metricHeroIconBox,
          { backgroundColor: 'rgba(255,255,255,0.15)' },
        ]}
      >
        <Ionicons name="clipboard-outline" size={18} color="#fff" />
      </View>
      <View style={s.metricHeroBottom}>
        <Text style={s.metricHeroValue}>{value}</Text>
        <Text style={s.metricHeroLabel}>{label}</Text>
        <Text style={s.metricHeroDesc}>{desc}</Text>
      </View>
    </View>
  )
}

// ── Small metric ──────────────────────────────────────────────────────────────

function SmallMetric({
  icon,
  value,
  label,
  color,
  t,
  s,
}: {
  icon: keyof typeof Ionicons.glyphMap
  value: number
  label: string
  color: string
  t: Theme
  s: ReturnType<typeof makeStyles>
}) {
  return (
    <View
      style={[
        s.metricSmall,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={s.metricSmallTop}>
        <View style={[s.metricSmallIconBox, { backgroundColor: color + '12' }]}>
          <Ionicons name={icon} size={15} color={color} />
        </View>
        <Text style={[s.metricSmallValue, { color: t.text }]}>{value}</Text>
      </View>
      <Text style={[s.metricSmallLabel, { color: t.textMuted }]}>{label}</Text>
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
                size={20}
                color={t.textSubtle}
              />
            </View>
          )}
          {item.isPriority && (
            <View style={[s.priorityPin, { borderColor: t.bg }]}>
              <Ionicons name="star" size={7} color="#fff" />
            </View>
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

          <Text
            style={[s.cardVehicle, { color: t.textMuted }]}
            numberOfLines={1}
          >
            {item.vehicleBrand}
            {item.modelYear ? ` · ${item.modelYear}` : ''}
          </Text>

          <View style={s.cardFooter}>
            {item.brand?.clusterRegion ? (
              <View style={s.chip}>
                <Ionicons
                  name="location-outline"
                  size={11}
                  color={t.textSubtle}
                />
                <Text style={[s.chipText, { color: t.textSubtle }]}>
                  {item.brand.clusterRegion}
                </Text>
              </View>
            ) : null}

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
            { width: '30%', backgroundColor: t.border, marginTop: 5 },
          ]}
        />
      </View>
    </Animated.View>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ t, s }: { t: Theme; s: ReturnType<typeof makeStyles> }) {
  return (
    <View style={s.emptyWrap}>
      <View
        style={[
          s.emptyIconBox,
          { backgroundColor: t.bgMuted, borderColor: t.border },
        ]}
      >
        <Ionicons name="cube-outline" size={28} color={t.textSubtle} />
      </View>
      <Text style={[s.emptyTitle, { color: t.text }]}>No requests yet</Text>
      <Text style={[s.emptyDesc, { color: t.textMuted }]}>
        Post your first part request and receive competitive offers from
        verified sellers.
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
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
    },

    // ── Greeting header ───────────────────────────────────────
    header: {
      paddingTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    greetingLabel: {
      ...typography.h1,
      color: t.text,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    greetingSub: {
      ...typography.caption,
      color: t.textMuted,
      lineHeight: 20,
    },

    // ── Avatar ────────────────────────────────────────────────
    avatarWrap: {
      width: 44,
      height: 44,
      flexShrink: 0,
    },
    avatarImage: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: t.border,
    },
    avatarFallback: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: 17,
      fontWeight: '600',
    },
    avatarOnline: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 11,
      height: 11,
      borderRadius: radius.pill,
      borderWidth: 2,
    },

    // ── Metrics ───────────────────────────────────────────────
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xl,
      height: 148,
    },
    metricsCol: {
      flex: 1,
      gap: spacing.sm,
    },

    // Hero
    metricHero: {
      flex: 1.1,
      borderRadius: radius.xl,
      padding: spacing.lg,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    metricHeroIconBox: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricHeroBottom: {
      gap: 2,
    },
    metricHeroValue: {
      fontSize: 36,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: -1.5,
      lineHeight: 40,
    },
    metricHeroLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.80)',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    metricHeroDesc: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 1,
    },

    // Small
    metricSmall: {
      flex: 1,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      justifyContent: 'space-between',
      borderWidth: 1,
    },
    metricSmallTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metricSmallIconBox: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricSmallValue: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -1,
    },
    metricSmallLabel: {
      fontSize: 11,
      fontWeight: '500',
      letterSpacing: 0.2,
    },

    // ── Section header ────────────────────────────────────────
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
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
    sectionCount: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: radius.pill,
      backgroundColor: t.accent + '12',
    },
    sectionCountText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.accent,
    },

    // ── Request card ──────────────────────────────────────────
    card: {
      flexDirection: 'row',
      borderRadius: radius.lg,
      padding: spacing.lg,
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
      width: 60,
      height: 60,
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
      width: 17,
      height: 17,
      borderRadius: radius.pill,
      backgroundColor: '#d97706',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    cardBody: {
      flex: 1,
      gap: 4,
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
    cardVehicle: {
      fontSize: 13,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 2,
      flexWrap: 'wrap',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    chipText: {
      fontSize: 11,
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
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      alignItems: 'center',
    },
    skelThumb: {
      width: 60,
      height: 60,
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
