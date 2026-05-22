import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  fetchCreditBalance,
  fetchSellerDashboardStats,
} from '../lib/api-client'
import { spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { SessionUser } from '../lib/api-client'
import type {
  ChartQuotePoint,
  CreditBalance,
  SellerDashboardData,
} from '../types/seller'

const LOCALE = 'en-DZ'

function fmtDate(opt: Intl.DateTimeFormatOptions) {
  try {
    return new Date().toLocaleDateString(LOCALE, opt)
  } catch {
    return new Date().toLocaleDateString('en-US', opt)
  }
}

interface SellerDashboardScreenProps {
  user: SessionUser
  onNavigateMarketplace: () => void
  onNavigateQuotes: () => void
  onNavigateBilling: () => void
  refreshKey: number
}

const C = {
  won: '#059669',
  pending: '#2563eb',
  winRate: '#d97706',
  revenue: '#2563eb',
  credits: '#f59e0b',
  lost: '#dc2626',
} as const

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + spacing.md : 50

export function SellerDashboardScreen({
  user,
  onNavigateMarketplace,
  onNavigateQuotes,
  onNavigateBilling,
  refreshKey,
}: SellerDashboardScreenProps) {
  const t = useTheme()
  const [data, setData] = useState<SellerDashboardData | null>(null)
  const [credits, setCredits] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (isRefresh) setRefreshing(true)
      setError(null)
      try {
        const [statsResult, creditResult] = await Promise.all([
          fetchSellerDashboardStats(),
          fetchCreditBalance(),
        ])
        if (statsResult) setData(statsResult)
        if (creditResult) setCredits(creditResult)
      } catch {
        setError('Could not load dashboard data.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [refreshKey],
  )

  useEffect(() => {
    load()
  }, [load])

  const creditBalance = credits?.balance ?? 0

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: t.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: SAFE_TOP }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
      }
    >
      {/* ── Greeting Header ── */}
      <GreetingHeader
        user={user}
        creditBalance={creditBalance}
        totalQuotes={data?.stats.totalQuotes ?? 0}
        onNavigateBilling={onNavigateBilling}
        t={t}
      />

      {loading && !data ? (
        <SkeletonState t={t} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(true)} t={t} />
      ) : data ? (
        <>
          {/* ── Today's Activity ── */}
          <TodayCard today={data.todayStats} t={t} />

          {/* ── Performance Overview ── */}
          <PerformanceCard
            won={data.stats.won}
            pending={data.stats.pending}
            totalQuotes={data.stats.totalQuotes}
            totalRevenue={data.stats.totalRevenue}
            t={t}
          />

          {/* ── Weekly Revenue Chart ── */}
          {data.chartQuotes?.length > 0 && (
            <ChartSection chartQuotes={data.chartQuotes} t={t} />
          )}
        </>
      ) : (
        <EmptyState onNavigateMarketplace={onNavigateMarketplace} t={t} />
      )}
    </ScrollView>
  )
}

/* ── Sub-components ── */

function GreetingHeader({
  user,
  creditBalance,
  totalQuotes,
  onNavigateBilling,
  t,
}: {
  user: SessionUser
  creditBalance: number
  totalQuotes: number
  onNavigateBilling?: () => void
  t: any
}) {
  const initials = useMemo(() => {
    const name = user.storeName || user.name || 'S'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }, [user.storeName, user.name])

  const location = user.wilaya || user.city || ''

  return (
    <View
      style={[
        styles.greeting,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={styles.greetingTop}>
        <View style={styles.greetingTopLeft}>
          <View style={styles.avatarWrap}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  {
                    backgroundColor: t.accent + '10',
                    borderColor: t.accent + '25',
                  },
                ]}
              >
                <Text style={[styles.avatarInitials, { color: t.accent }]}>
                  {initials}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.greetingInfo}>
            <View style={styles.greetingNameRow}>
              <Ionicons name="storefront-outline" size={16} color={t.accent} />
              <Text
                style={[styles.greetingName, { color: t.text }]}
                numberOfLines={1}
              >
                {user.storeName || 'My Store'}
              </Text>
            </View>
            {location ? (
              <View style={styles.greetingSubRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={t.textMuted}
                />
                <Text style={[styles.greetingSub, { color: t.textMuted }]}>
                  {location}
                </Text>
              </View>
            ) : (
              <Text style={[styles.greetingSub, { color: t.textMuted }]}>
                Parts Specialist
              </Text>
            )}
          </View>
        </View>

        {creditBalance > 0 && creditBalance < 3 && (
          <Pressable
            onPress={onNavigateBilling}
            style={({ pressed }) => [
              styles.lowCreditBadge,
              {
                backgroundColor: C.credits + '08',
                borderColor: C.credits + '25',
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="alert-circle" size={16} color={C.credits} />
            <Text style={[styles.lowCreditBadgeText, { color: C.credits }]}>
              Low Credits
            </Text>
            <Ionicons name="chevron-forward" size={12} color={C.credits} />
          </Pressable>
        )}
      </View>

      <View style={[styles.greetingDivider, { backgroundColor: t.border }]} />

      <Pressable
        onPress={onNavigateBilling}
        style={({ pressed }) => [
          styles.greetingStats,
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.greetingStat}>
          <View
            style={[
              styles.greetingStatIcon,
              { backgroundColor: t.accent + '08' },
            ]}
          >
            <Ionicons name="chatbubbles-outline" size={15} color={t.accent} />
          </View>
          <Text style={[styles.greetingStatValue, { color: t.text }]}>
            {totalQuotes}
          </Text>
          <Text style={[styles.greetingStatLabel, { color: t.textMuted }]}>
            Quotes
          </Text>
        </View>
        <View
          style={[styles.greetingStatDivider, { backgroundColor: t.border }]}
        />
        <View style={styles.greetingStat}>
          <View
            style={[
              styles.greetingStatIcon,
              { backgroundColor: C.credits + '10' },
            ]}
          >
            <Ionicons name="wallet-outline" size={15} color={C.credits} />
          </View>
          <Text style={[styles.greetingStatValue, { color: C.credits }]}>
            {creditBalance}
          </Text>
          <Text style={[styles.greetingStatLabel, { color: t.textMuted }]}>
            Credits
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

function PerformanceCard({
  won,
  pending,
  totalQuotes,
  totalRevenue,
  t,
}: {
  won: number
  pending: number
  totalQuotes: number
  totalRevenue: number
  t: any
}) {
  const wonPct = totalQuotes > 0 ? (won / totalQuotes) * 100 : 0
  const pendingPct = totalQuotes > 0 ? (pending / totalQuotes) * 100 : 0

  return (
    <View
      style={[
        styles.perfCard,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={styles.perfHeader}>
        <View
          style={[styles.perfIconWrap, { backgroundColor: t.accent + '08' }]}
        >
          <Ionicons name="speedometer-outline" size={18} color={t.accent} />
        </View>
        <Text style={[styles.perfTitle, { color: t.text }]}>Performance</Text>
      </View>

      <Text style={[styles.perfTotalRevenue, { color: t.textMuted }]}>
        Total Revenue:{' '}
        <Text style={{ color: C.revenue }}>
          {totalRevenue.toLocaleString()} DA
        </Text>
      </Text>

      <PerfRow
        icon="trophy-outline"
        label="Won"
        value={`${won}`}
        color={C.won}
        pct={wonPct}
        detail={`${Math.round(wonPct)}% of quotes`}
        t={t}
      />
      <PerfRow
        icon="time-outline"
        label="Pending"
        value={`${pending}`}
        color={C.pending}
        pct={pendingPct}
        detail={`${Math.round(pendingPct)}% of quotes`}
        t={t}
      />
    </View>
  )
}

function PerfRow({
  icon,
  label,
  value,
  color,
  pct,
  detail,
  t,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  color: string
  pct: number
  detail: string
  t: any
}) {
  return (
    <View style={styles.perfRow}>
      <View style={[styles.perfRowLeft]}>
        <View style={[styles.perfDot, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={[styles.perfLabel, { color: t.text }]}>{label}</Text>
      </View>
      <Text style={[styles.perfValue, { color: t.text }]}>{value}</Text>
      <View style={[styles.perfBarTrack, { backgroundColor: t.border }]}>
        <View
          style={[
            styles.perfBarFill,
            {
              width: `${Math.min(Math.round(pct), 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={[styles.perfDetail, { color: t.textMuted }]}>{detail}</Text>
    </View>
  )
}

function TodayCard({
  today,
  t,
}: {
  today: { won: number; pending: number; lost: number; revenue: number }
  t: any
}) {
  const hasActivity = today.won > 0 || today.pending > 0 || today.lost > 0
  const total = hasActivity ? today.won + today.pending + today.lost : 1
  const wonPct = hasActivity ? (today.won / total) * 100 : 0
  const lostPct = hasActivity ? (today.lost / total) * 100 : 0

  return (
    <View
      style={[
        styles.todayCard,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={styles.todayAccent} />
      <View style={styles.todayInner}>
        <View style={styles.todayHeader}>
          <View style={styles.todayHeaderLeft}>
            <View
              style={[styles.todayStatusDot, { backgroundColor: '#059669' }]}
            />
            <Text style={[styles.todayTitle, { color: t.text }]}>Today</Text>
          </View>
          <Text style={[styles.todayDate, { color: t.textMuted }]}>
            {fmtDate({ weekday: 'short' }).toUpperCase()}
          </Text>
        </View>

        <View style={styles.todayStatsRow}>
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.won }]}>
              {today.won}
            </Text>
            <Text style={[styles.todayStatLabel, { color: t.textMuted }]}>
              Won
            </Text>
          </View>
          <View
            style={[styles.todayStatDivider, { backgroundColor: t.border }]}
          />
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.pending }]}>
              {today.pending}
            </Text>
            <Text style={[styles.todayStatLabel, { color: t.textMuted }]}>
              Pending
            </Text>
          </View>
          <View
            style={[styles.todayStatDivider, { backgroundColor: t.border }]}
          />
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.lost }]}>
              {today.lost}
            </Text>
            <Text style={[styles.todayStatLabel, { color: t.textMuted }]}>
              Lost
            </Text>
          </View>
        </View>

        {hasActivity && (
          <View style={styles.todayBarRow}>
            <View
              style={[
                styles.todayBarSegment,
                { flex: wonPct, backgroundColor: C.won },
              ]}
            />
            <View
              style={[
                styles.todayBarSegment,
                {
                  flex: (today.pending / total) * 100,
                  backgroundColor: C.pending,
                },
              ]}
            />
            <View
              style={[
                styles.todayBarSegment,
                { flex: lostPct, backgroundColor: C.lost },
              ]}
            />
          </View>
        )}

        <View style={[styles.todayFooter, { borderTopColor: t.border }]}>
          <Ionicons name="trending-up-outline" size={14} color={C.revenue} />
          <Text style={[styles.todayFooterText, { color: t.textMuted }]}>
            Revenue:{' '}
            <Text style={[styles.todayFooterValue, { color: C.revenue }]}>
              {today.revenue.toLocaleString()} DA
            </Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

function ChartSection({
  chartQuotes,
  t,
}: {
  chartQuotes: Array<ChartQuotePoint>
  t: any
}) {
  const bars = useMemo(() => buildDailyBars(chartQuotes), [chartQuotes])
  const maxVal = Math.max(...bars.map((b) => b.value), 1)
  const totalWeek = bars.reduce((s, b) => s + b.value, 0)

  return (
    <View
      style={[
        styles.chartSection,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={styles.chartHeader}>
        <View style={styles.chartHeaderLeft}>
          <View
            style={[
              styles.chartIconWrap,
              { backgroundColor: C.revenue + '10' },
            ]}
          >
            <Ionicons name="bar-chart-outline" size={16} color={C.revenue} />
          </View>
          <Text style={[styles.chartTitle, { color: t.text }]}>This Week</Text>
        </View>
        <Text style={[styles.chartTotal, { color: t.text }]}>
          {totalWeek.toLocaleString()} DA
        </Text>
      </View>

      <View style={styles.chartBarsRow}>
        {bars.map((bar, i) => {
          const h = Math.max((bar.value / maxVal) * 90, 4)
          return (
            <View key={i} style={styles.chartCol}>
              <Text style={[styles.chartBarValue, { color: t.textMuted }]}>
                {bar.value > 0 ? (bar.value / 1000).toFixed(0) + 'k' : ''}
              </Text>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: h,
                    backgroundColor: bar.value > 0 ? C.revenue : t.border,
                    opacity:
                      bar.value > 0 ? 0.6 + (bar.value / maxVal) * 0.4 : 0.3,
                  },
                ]}
              />
              <Text style={[styles.chartBarLabel, { color: t.textSubtle }]}>
                {bar.day.slice(0, 3)}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

function ErrorState({
  message,
  onRetry,
  t,
}: {
  message: string
  onRetry: () => void
  t: any
}) {
  return (
    <View
      style={[
        styles.stateCard,
        { backgroundColor: t.dangerBg, borderColor: t.danger + '30' },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={32} color={t.danger} />
      <Text style={[styles.stateTitle, { color: t.danger }]}>
        Something went wrong
      </Text>
      <Text style={[styles.stateDesc, { color: t.textMuted }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.stateBtn,
          { backgroundColor: t.danger },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Ionicons name="refresh-outline" size={16} color={t.accentFg} />
        <Text style={[styles.stateBtnText, { color: t.accentFg }]}>
          Try Again
        </Text>
      </Pressable>
    </View>
  )
}

function EmptyState({
  onNavigateMarketplace,
  t,
}: {
  onNavigateMarketplace: () => void
  t: any
}) {
  return (
    <View style={styles.emptyState}>
      <View
        style={[styles.emptyIconWrap, { backgroundColor: t.accent + '08' }]}
      >
        <Ionicons name="analytics-outline" size={36} color={t.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: t.text }]}>No data yet</Text>
      <Text style={[styles.emptyDesc, { color: t.textMuted }]}>
        Start quoting on requests to see your stats here.
      </Text>
      <Pressable
        onPress={onNavigateMarketplace}
        style={({ pressed }) => [
          styles.emptyCta,
          { backgroundColor: t.accent },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name="search-outline" size={16} color={t.accentFg} />
        <Text style={[styles.emptyCtaText, { color: t.accentFg }]}>
          Browse Requests
        </Text>
      </Pressable>
    </View>
  )
}

function SkeletonState({ t }: { t: any }) {
  const shimmer = useRef(new Animated.Value(0.35)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [shimmer])

  return (
    <View style={styles.skeletonWrap}>
      <Animated.View
        style={[
          styles.skeletonCard,
          { backgroundColor: t.border, opacity: shimmer, height: 56 },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonCard,
          { backgroundColor: t.border, opacity: shimmer, height: 52 },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonCard,
          { backgroundColor: t.border, opacity: shimmer, height: 200 },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonCard,
          { backgroundColor: t.border, opacity: shimmer, height: 170 },
        ]}
      />
    </View>
  )
}

/* ── Helpers ── */

function buildDailyBars(
  quotes: Array<ChartQuotePoint>,
): Array<{ day: string; value: number }> {
  if (!quotes || quotes.length === 0) return []

  const dayMap: Record<string, number> = {}
  for (const q of quotes) {
    const d = new Date(q.updatedAt)
    const key = d.toLocaleDateString('en-US', { weekday: 'short' })
    dayMap[key] = (dayMap[key] || 0) + q.price
  }

  return DAYS.map((day) => ({
    day,
    value: dayMap[day] || 0,
  }))
}

/* ── Styles ── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  /* Greeting Hero */
  greeting: {
    borderRadius: 12,
    borderWidth: 1,
  },
  greetingTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  greetingTopLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {},
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '800',
  },
  greetingInfo: {
    flex: 1,
    gap: 3,
  },
  greetingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingName: {
    ...typography.display,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  greetingSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  lowCreditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: 130,
  },
  lowCreditBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  greetingDivider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  greetingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  greetingStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  greetingStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingStatValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  greetingStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  greetingStatDivider: {
    width: 1,
    height: 24,
    marginHorizontal: spacing.sm,
  },

  /* Credit Card */

  /* Performance Card */
  perfCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  perfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  perfIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  perfTotalRevenue: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  perfRow: {
    gap: 4,
  },
  perfRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  perfDot: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perfLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  perfValue: {
    fontSize: 15,
    fontWeight: '800',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  perfBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  perfBarFill: {
    height: 6,
    borderRadius: 3,
  },
  perfDetail: {
    fontSize: 10,
    fontWeight: '500',
  },
  perfDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },

  /* Mini Chart */
  /* Weekly Chart */
  chartSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chartIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartTotal: {
    fontSize: 16,
    fontWeight: '800',
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    height: 120,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    fontSize: 9,
    fontWeight: '600',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  /* Today Card */
  todayCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  todayAccent: {
    height: 3,
    backgroundColor: '#059669',
  },
  todayInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todayStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  todayTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  todayDate: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  todayStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  todayStatValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  todayStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  todayStatDivider: {
    width: 1,
    height: 36,
  },
  todayBarRow: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  todayBarSegment: {
    height: 6,
  },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  todayFooterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  todayFooterValue: {
    fontWeight: '700',
  },

  /* Error State */
  stateCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: 40,
  },
  stateTitle: {
    ...typography.h2,
  },
  stateDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: 10,
  },
  stateBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.h2,
  },
  emptyDesc: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  emptyCtaText: {
    fontSize: 15,
    fontWeight: '700',
  },

  /* Skeleton */
  skeletonWrap: {
    gap: spacing.sm,
  },
  skeletonCard: {
    borderRadius: 14,
  },
})
