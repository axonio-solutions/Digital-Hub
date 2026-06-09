/* Hallmark · genre: modern-minimal · screen: HomeScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo } from 'react'
import { useIsRTL } from 'expo-rtl'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Platform, StatusBar, StyleSheet } from 'react-native'
import { Text, View } from 'expo-rtl'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'

import { AnimatedPressable } from '../components/AnimatedPressable'
import { SkeletonCard } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { UserAvatar } from '../components/UserAvatar'
import { buyerRequestsQueryOptions } from '../features/buyer/queries/requests'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import type { Theme } from '../theme/tokens'
import type { BuyerRequestRow } from '../types/buyer'
import type { BuyerHomeStackParamList } from '../navigation/types'
import { useTranslation } from 'react-i18next'

// ── Status config ─────────────────────────────────────────────────────────────

function statusConfig(t: Theme, tr: (key: string) => string) {
  return {
    open: { label: tr('home.status.open'), color: t.success },
    fulfilled: { label: tr('home.status.fulfilled'), color: '#d97706' },
    cancelled: { label: tr('home.status.cancelled'), color: t.danger },
  } as Record<string, { label: string; color: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(
  iso: string,
  t: (key: string, options?: Record<string, any>) => string,
  lang: string,
): string {
  const d = new Date(iso)
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000)
  if (days === 0) return t('common.today')
  if (days === 1) return t('common.yesterday')
  if (days < 7) return t('common.xDaysAgo', { count: days })
  return d.toLocaleDateString(lang, { day: 'numeric', month: 'short' })
}

function greeting(tr: (key: string) => string): string {
  const h = new Date().getHours()
  if (h < 12) return tr('home.greeting.morning')
  if (h < 17) return tr('home.greeting.afternoon')
  return tr('home.greeting.evening')
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  onSelectRequest?: (id: string) => void
  refreshKey?: number
}

export function HomeScreen({ onSelectRequest, refreshKey }: HomeScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<BuyerHomeStackParamList>>()
  const user = useUserStore((s) => s.user)
  const t = useTheme()
  const { t: tr, i18n } = useTranslation()
  const isRTL = useIsRTL()
  const s = makeStyles(t)

  const queryClient = useQueryClient()
  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(buyerRequestsQueryOptions)

  const fadeAnim = useSharedValue(0)
  const slideAnim = useSharedValue(8)

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

  if (!user) return null

  const firstName = user.name?.split(' ')[0] ?? ''
  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  return (
    <View style={s.root}>
      <StatusBar
        barStyle={t.bg === '#ffffff' ? 'dark-content' : 'light-content'}
        backgroundColor={t.bg}
      />

      <Animated.View style={[{ flex: 1 }, entryStyle]}>
        <FlashList
          data={recent}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scrollContent, { paddingTop: topInset }]}
          ListHeaderComponent={
            <>
              {/* ── Greeting header ──────────────────────── */}
              <View style={s.header}>
                <View style={s.headerRow}>
                  <View>
                    <Text style={s.greetingLabel}>
                      {greeting(tr)}
                      {firstName ? tr('home.you', { name: firstName }) : ''}
                    </Text>
                    <Text style={s.greetingSub}>{tr('home.yourRequests')}</Text>
                  </View>

                  <UserAvatar image={user.image} name={user.name} />
                </View>
              </View>

              {/* ── Metrics ──────────────────────────────── */}
              <View style={s.metricsRow}>
                <HeroMetric
                  value={metrics.active}
                  label={tr('home.metrics.active')}
                  desc={tr('home.metrics.awaitingOffers')}
                  t={t}
                  s={s}
                />
                <View style={s.metricsCol}>
                  <SmallMetric
                    icon="chatbubbles-outline"
                    value={metrics.offers}
                    label={tr('home.metrics.offers')}
                    color={t.success}
                    t={t}
                    s={s}
                  />
                  <SmallMetric
                    icon="checkmark-done-outline"
                    value={metrics.fulfilled}
                    label={tr('home.metrics.done')}
                    color="#d97706"
                    t={t}
                    s={s}
                  />
                </View>
              </View>

              {/* ── Section header ────────────────────────── */}
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{tr('home.recentActivity')}</Text>
                <View style={s.sectionRule} />
                {requests.length > 0 && (
                  <View style={s.sectionCount}>
                    <Text style={s.sectionCountText}>{requests.length}</Text>
                  </View>
                )}
              </View>

              {isLoading && (
                <View style={{ gap: spacing.sm }}>
                  {[0, 1, 2].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 20,
                      borderWidth: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                      backgroundColor: t.bgMuted,
                      borderColor: t.border,
                    }}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={28}
                      color={t.textSubtle}
                    />
                  </View>
                }
                title={tr('home.empty.title')}
                description={tr('home.empty.description')}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              pendingQuotes={
                item.quotes.filter((q) => q.status === 'pending').length
              }
              onPress={() => {
                if (onSelectRequest) onSelectRequest(item.id)
                else
                  navigation.navigate('RequestDetails', { requestId: item.id })
              }}
              t={t}
              s={s}
              tr={tr}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      </Animated.View>
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
  tr,
}: {
  item: BuyerRequestRow
  pendingQuotes: number
  onPress: () => void
  t: Theme
  s: ReturnType<typeof makeStyles>
  tr: (key: string, options?: Record<string, any>) => string
}) {
  const { i18n: i18nInst } = useTranslation()
  const isRTL = useIsRTL()
  const cfg = statusConfig(t, tr)[item.status] ?? {
    label: item.status,
    color: t.textSubtle,
  }

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
          borderLeftWidth: isRTL ? 1 : 3,
          borderRightWidth: isRTL ? 3 : 1,
          borderLeftColor: isRTL ? t.border : cfg.color,
          borderRightColor: isRTL ? cfg.color : t.border,
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
                size={20}
                color={t.textSubtle}
              />
            </View>
          )}
            {item.isPriority && (
              <View
                style={[
                  s.priorityPin,
                  { borderColor: t.bg },
                  isRTL ? { left: -4 } : { right: -4 },
                ]}
              >
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
                  {tr('common.offer', { count: pendingQuotes })}
                </Text>
              </View>
            )}

            <Text style={[s.cardDate, { color: t.textSubtle }]}>
              {formatDate(item.createdAt, tr, i18nInst.language)}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

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
      width: '100%',
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
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
    cardRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
  })
}
