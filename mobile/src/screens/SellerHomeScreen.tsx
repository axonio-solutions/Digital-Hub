import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { ScrollView, Text, View, useIsRTL } from 'expo-rtl'
import {
  sellerDashboardQueryOptions,
  creditBalanceQueryOptions,
} from '../features/seller/queries/dashboard'
import { SkeletonBox } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { UserAvatar } from '../components/UserAvatar'
import { spacing, typography, type Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import type { SessionUser } from '../lib/api-client'
import type {
  ChartQuotePoint,
  CreditBalance,
  SellerDashboardData,
} from '../types/seller'
import type {
  SellerHomeStackParamList,
  RootStackParamList,
} from '../navigation/types'
import { useTranslation } from 'react-i18next'

function fmtDate(opt: Intl.DateTimeFormatOptions, locale: string) {
  try {
    return new Date().toLocaleDateString(locale, opt)
  } catch {
    return new Date().toLocaleDateString('en-US', opt)
  }
}

interface SellerHomeScreenProps {
  onNavigateMarketplace?: () => void
  onNavigateQuotes?: () => void
  onNavigateBilling?: () => void
  refreshKey?: number
}

const C = {
  won: '#059669',
  pending: '#2563eb',
  winRate: '#d97706',
  revenue: '#2563eb',
  credits: '#f59e0b',
  lost: '#dc2626',
} as const

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + spacing.md : 50

export function SellerHomeScreen({
  onNavigateMarketplace,
  onNavigateQuotes,
  onNavigateBilling,
  refreshKey,
}: SellerHomeScreenProps) {
  type DashNavParamList = SellerHomeStackParamList &
    Pick<RootStackParamList, 'SellerTabs'>
  const navigation =
    useNavigation<NativeStackNavigationProp<DashNavParamList>>()
  const user = useUserStore((s) => s.user)
  const t = useTheme()
  const { t: tr, i18n } = useTranslation()
  const isRTL = useIsRTL()
  const styles = makeStyles(t)
  const queryClient = useQueryClient()
  const { data, isLoading, refetch, isRefetching } = useQuery(
    sellerDashboardQueryOptions,
  )
  const { data: credits } = useQuery(creditBalanceQueryOptions)
  const error = null

  const creditBalance = credits?.balance ?? 0

  useEffect(() => {
    if (refreshKey !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] })
    }
  }, [refreshKey, queryClient])

  if (!user) return null

  const handleNavigateBilling =
    onNavigateBilling ?? (() => navigation.navigate('Credits'))
  const handleNavigateMarketplace =
    onNavigateMarketplace ??
    (() =>
      navigation.navigate('SellerTabs', {
        screen: 'SellerMarketplaceStack',
        params: { screen: 'Marketplace', params: undefined },
      }))
  const handleNavigateQuotes =
    onNavigateQuotes ??
    (() =>
      navigation.navigate('SellerTabs', {
        screen: 'SellerQuotesStack',
        params: { screen: 'MyQuotes', params: undefined },
      }))

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.scrollContent, { paddingTop: SAFE_TOP }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      {/* ── Greeting Header ── */}
      <GreetingHeader
        user={user}
        creditBalance={creditBalance}
        totalQuotes={data?.stats.totalQuotes ?? 0}
        onNavigateBilling={handleNavigateBilling}
        t={t}
      />

      {isLoading && !data ? (
        <View style={styles.skeletonWrap}>
          <SkeletonBox style={[styles.skeletonCard, { height: 56 }]} />
          <SkeletonBox style={[styles.skeletonCard, { height: 52 }]} />
          <SkeletonBox style={[styles.skeletonCard, { height: 200 }]} />
          <SkeletonBox style={[styles.skeletonCard, { height: 170 }]} />
        </View>
      ) : error ? (
        <ErrorState
          message={error ?? tr('home.errorLoading')}
          onRetry={() => refetch()}
        />
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
          <ChartSection chartQuotes={data.chartQuotes ?? []} t={t} />
        </>
      ) : (
        <EmptyState
          icon={
            <View style={styles.emptyIconWrap}>
              <Ionicons name="analytics-outline" size={36} color={t.accent} />
            </View>
          }
          title={tr('home.noData')}
          description={tr('home.noDataDescription')}
          action={
            <Pressable
              onPress={handleNavigateMarketplace}
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="search-outline" size={16} color={t.accentFg} />
              <Text style={styles.emptyCtaText}>{tr('home.viewAll')}</Text>
            </Pressable>
          }
        />
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
  t: Theme
}) {
  const initials = useMemo(() => {
    const name = user.storeName || user.name || 'S'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }, [user.storeName, user.name])

  const { t: tr } = useTranslation()
  const isRTL = useIsRTL()
  const location = user.wilaya || user.city || ''
  const styles = makeStyles(t, isRTL)

  return (
    <View style={styles.greeting}>
      <View style={styles.greetingTop}>
        <View style={styles.greetingTopLeft}>
          <UserAvatar
            image={user.image}
            name={user.name || user.storeName}
            initials={initials}
            size={56}
            showOnlineDot={false}
          />
          <View style={styles.greetingInfo}>
            <View style={styles.greetingNameRow}>
              <Ionicons name="storefront-outline" size={16} color={t.accent} />
              <Text style={styles.greetingName} numberOfLines={1}>
                {user.storeName || tr('home.myStore')}
              </Text>
            </View>
            {location ? (
              <View style={styles.greetingSubRow}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={t.textMuted}
                />
                <Text style={styles.greetingSub}>{location}</Text>
              </View>
            ) : (
              <Text style={styles.greetingSub}>
                {tr('home.partsSpecialist')}
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
              {tr('home.lowCredits')}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={12}
              color={C.credits}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.greetingDivider} />

      <Pressable
        onPress={onNavigateBilling}
        style={({ pressed }) => [
          styles.greetingStats,
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.greetingStat}>
          <View style={styles.greetingStatIcon}>
            <Ionicons name="chatbubbles-outline" size={15} color={t.accent} />
          </View>
          <Text style={styles.greetingStatValue}>{totalQuotes}</Text>
          <Text style={styles.greetingStatLabel}>{tr('home.quotesSent')}</Text>
        </View>
        <View style={styles.greetingStatDivider} />
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
          <Text style={styles.greetingStatLabel}>{tr('home.credits')}</Text>
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
  t: Theme
}) {
  const { t: tr } = useTranslation()
  const wonPct = totalQuotes > 0 ? (won / totalQuotes) * 100 : 0
  const pendingPct = totalQuotes > 0 ? (pending / totalQuotes) * 100 : 0
  const styles = makeStyles(t)

  return (
    <View style={styles.perfCard}>
      <View style={styles.perfHeader}>
        <View style={styles.perfIconWrap}>
          <Ionicons name="speedometer-outline" size={18} color={t.accent} />
        </View>
        <Text style={styles.perfTitle}>{tr('home.sellerDashboard')}</Text>
      </View>

      <Text style={styles.perfTotalRevenue}>
        {tr('home.revenue')}:{' '}
        <Text style={{ color: C.revenue }}>
          {totalRevenue.toLocaleString()} DA
        </Text>
      </Text>

      <PerfRow
        icon="trophy-outline"
        label={tr('home.won')}
        value={`${won}`}
        color={C.won}
        pct={wonPct}
        detail={tr('home.percentOfQuotes', { pct: Math.round(wonPct) })}
        t={t}
      />
      <PerfRow
        icon="time-outline"
        label={tr('home.activeRequests')}
        value={`${pending}`}
        color={C.pending}
        pct={pendingPct}
        detail={tr('home.percentOfQuotes', { pct: Math.round(pendingPct) })}
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
  t: Theme
}) {
  const styles = makeStyles(t)
  return (
    <View style={styles.perfRow}>
      <View style={[styles.perfRowLeft]}>
        <View style={[styles.perfDot, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={styles.perfLabel}>{label}</Text>
      </View>
      <Text style={[styles.perfValue, { right: 0 }]}>{value}</Text>
      <View style={styles.perfBarTrack}>
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
      <Text style={styles.perfDetail}>{detail}</Text>
    </View>
  )
}

function TodayCard({
  today,
  t,
}: {
  today: { won: number; pending: number; lost: number; revenue: number }
  t: Theme
}) {
  const { t: tr, i18n } = useTranslation()
  const hasActivity = today.won > 0 || today.pending > 0 || today.lost > 0
  const total = hasActivity ? today.won + today.pending + today.lost : 1
  const wonPct = hasActivity ? (today.won / total) * 100 : 0
  const lostPct = hasActivity ? (today.lost / total) * 100 : 0
  const styles = makeStyles(t)

  return (
    <View style={styles.todayCard}>
      <View style={styles.todayAccent} />
      <View style={styles.todayInner}>
        <View style={styles.todayHeader}>
          <View style={styles.todayHeaderLeft}>
            <View
              style={[styles.todayStatusDot, { backgroundColor: '#059669' }]}
            />
            <Text style={styles.todayTitle}>{tr('home.today')}</Text>
          </View>
          <Text style={styles.todayDate}>
            {fmtDate({ weekday: 'short' }, i18n.language).toUpperCase()}
          </Text>
        </View>

        <View style={styles.todayStatsRow}>
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.won }]}>
              {today.won}
            </Text>
            <Text style={styles.todayStatLabel}>{tr('home.won')}</Text>
          </View>
          <View style={styles.todayStatDivider} />
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.pending }]}>
              {today.pending}
            </Text>
            <Text style={styles.todayStatLabel}>
              {tr('home.activeRequests')}
            </Text>
          </View>
          <View style={styles.todayStatDivider} />
          <View style={styles.todayStatItem}>
            <Text style={[styles.todayStatValue, { color: C.lost }]}>
              {today.lost}
            </Text>
            <Text style={styles.todayStatLabel}>{tr('home.metrics.lost')}</Text>
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

        <View style={styles.todayFooter}>
          <Ionicons name="trending-up-outline" size={14} color={C.revenue} />
          <Text style={styles.todayFooterText}>
            {tr('home.revenue')}:{' '}
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
  t: Theme
}) {
  const { t: tr } = useTranslation()
  const dayShortcuts = tr('seller.dayShortcuts', {
    returnObjects: true,
  }) as string[]
  const bars = useMemo(
    () => buildDailyBars(chartQuotes, dayShortcuts),
    [chartQuotes, dayShortcuts],
  )
  const maxVal = Math.max(...bars.map((b) => b.value), 1)
  const totalWeek = bars.reduce((s, b) => s + b.value, 0)
  const hasData = chartQuotes.length > 0
  const styles = makeStyles(t)

  return (
    <View style={styles.chartSection}>
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
          <Text style={styles.chartTitle}>{tr('home.thisWeek')}</Text>
        </View>
        {hasData && (
          <Text style={styles.chartTotal}>{totalWeek.toLocaleString()} DA</Text>
        )}
      </View>

      {hasData ? (
        <View dir="ltr" style={styles.chartBarsRow}>
          {bars.map((bar, i) => {
            const h = Math.max((bar.value / maxVal) * 90, 4)
            return (
              <View key={i} style={styles.chartCol}>
                <Text style={styles.chartBarValue}>
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
                <Text style={styles.chartBarLabel}>{bar.day.slice(0, 3)}</Text>
              </View>
            )
          })}
        </View>
      ) : (
        <Text style={styles.chartEmptyText}>{tr('home.noData')}</Text>
      )}
    </View>
  )
}

/* ── Helpers ── */

const EN_DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildDailyBars(
  quotes: Array<ChartQuotePoint>,
  days: string[],
): Array<{ day: string; value: number }> {
  if (!quotes || quotes.length === 0) return []

  const dayMap: Record<string, number> = {}
  for (const q of quotes) {
    const d = new Date(q.updatedAt)
    const key = d.toLocaleDateString('en-US', { weekday: 'short' })
    dayMap[key] = (dayMap[key] || 0) + q.price
  }

  return days.map((day, i) => ({
    day,
    value: dayMap[EN_DAY_KEYS[i]] || 0,
  }))
}

/* ── Styles ── */

function makeStyles(t: Theme, isRTL?: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
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
      backgroundColor: t.surface,
      borderColor: t.border,
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
      color: t.text,
    },
    greetingSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    greetingSub: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textMuted,
    },
    lowCreditBadge: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      backgroundColor: t.border,
    },
    greetingStats: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      backgroundColor: t.accent + '08',
    },
    greetingStatValue: {
      fontSize: 16,
      fontWeight: '800',
      color: t.text,
    },
    greetingStatLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: t.textMuted,
    },
    greetingStatDivider: {
      width: 1,
      height: 24,
      marginHorizontal: spacing.sm,
      backgroundColor: t.border,
    },

    /* Credit Card */

    /* Performance Card */
    perfCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: t.surface,
      borderColor: t.border,
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
      backgroundColor: t.accent + '08',
    },
    perfTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: t.text,
    },
    perfTotalRevenue: {
      fontSize: 17,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.xs,
      color: t.textMuted,
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
      color: t.text,
    },
    perfValue: {
      fontSize: 15,
      fontWeight: '800',
      position: 'absolute',
      top: 0,
      color: t.text,
    },
    perfBarTrack: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: t.border,
    },
    perfBarFill: {
      height: 6,
      borderRadius: 3,
    },
    perfDetail: {
      fontSize: 10,
      fontWeight: '500',
      color: t.textMuted,
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
      backgroundColor: t.surface,
      borderColor: t.border,
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
      color: t.text,
    },
    chartTotal: {
      fontSize: 16,
      fontWeight: '800',
      color: t.text,
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
      color: t.textMuted,
    },
    chartBar: {
      width: '100%',
      borderRadius: 4,
      minHeight: 4,
    },
    chartBarLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: t.textSubtle,
    },
    chartEmptyText: {
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '500',
      color: t.textMuted,
      paddingVertical: spacing.lg,
    },

    /* Today Card */
    todayCard: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: t.surface,
      borderColor: t.border,
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
      color: t.text,
    },
    todayDate: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: t.textMuted,
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
      color: t.textMuted,
    },
    todayStatDivider: {
      width: 1,
      height: 36,
      backgroundColor: t.border,
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
      borderTopColor: t.border,
    },
    todayFooterText: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textMuted,
    },
    todayFooterValue: {
      fontWeight: '700',
    },

    /* Empty State */
    emptyIconWrap: {
      width: 68,
      height: 68,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
      backgroundColor: t.accent + '08',
    },
    emptyCta: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: spacing.md,
      backgroundColor: t.accent,
    },
    emptyCtaText: {
      fontSize: 15,
      fontWeight: '700',
      color: t.accentFg,
    },

    /* Skeleton */
    skeletonWrap: {
      gap: spacing.sm,
    },
    skeletonCard: {
      borderRadius: 14,
    },
  })
}
