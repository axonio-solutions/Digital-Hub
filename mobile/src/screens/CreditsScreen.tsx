/* Hallmark · genre: modern-minimal · screen: CreditsScreen
 * pre-emit critique: P5 H4 E5 S5 R4 V5
 */

import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { View, Text, ScrollView, useIsRTL } from 'expo-rtl'

import {
  fetchActiveCreditPackagesFn,
  fetchCreditBalance,
  requestCreditsFn,
} from '../lib/api-client'
import { palette, radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { CreditBalance, CreditPackage } from '../types/seller'
import type { Theme } from '../theme/tokens'

const ACCENT_GOLD = '#CA8A04'
const ACCENT_GREEN = '#059669'
const ACCENT_RED = '#DC2626'
const NAVY = '#0F172A'
const NAVY_MUTED = '#94A3B8'
const NAVY_BORDER = '#334155'

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + spacing.md : 50
const SCREEN_H = Dimensions.get('window').height

interface CreditsScreenProps {
  refreshKey?: number
}

export function CreditsScreen({ refreshKey }: CreditsScreenProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const styles = makeStyles(t)
  const [data, setData] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successCredits, setSuccessCredits] = useState(0)

  const load = useCallback(async (isRefresh?: boolean) => {
    if (isRefresh) setRefreshing(true)
    try {
      const result = await fetchCreditBalance()
      setData(result)
    } catch {
      Alert.alert(i18n('credits.title'), i18n('credits.error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  useEffect(() => {
    if (refreshKey !== undefined) load()
  }, [refreshKey])

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return i18n('notifications.today')
    if (days === 1) return i18n('notifications.yesterday')
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
  }

  const balance = data?.balance ?? 0
  const transactions = data?.transactions ?? []

  const usedCredits = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type !== 'credit' && tx.amount < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
    [transactions],
  )

  return (
    <View style={styles.root}>
      {loading ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: SAFE_TOP }]}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonCard />
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: SAFE_TOP }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={ACCENT_GOLD}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <HeroCard
            balance={balance}
            usedCredits={usedCredits}
            txCount={transactions.length}
          />

          <Pressable
            onPress={() => setShowModal(true)}
            style={({ pressed }) => [
              styles.ctaBtn,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>
              {i18n('credits.requestCredits')}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color="rgba(255,255,255,0.6)"
            />
          </Pressable>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{i18n('credits.history')}</Text>
            {transactions.length > 0 && (
              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>
                  {transactions.length}
                </Text>
              </View>
            )}
          </View>

          {transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {transactions.map((item) => {
                const isCredit = item.type === 'credit' || item.amount > 0
                return (
                  <TxCard
                    key={item.id}
                    description={
                      item.description ||
                      (isCredit
                        ? i18n('credits.buyCredits')
                        : i18n('quotes.submitQuote'))
                    }
                    date={formatDate(item.createdAt)}
                    amount={item.amount}
                    isCredit={isCredit}
                  />
                )
              })}
            </View>
          )}
        </ScrollView>
      )}

      <RequestCreditsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(credits) => {
          setShowModal(false)
          setSuccessCredits(credits)
          setShowSuccess(true)
          load(true)
        }}
      />

      <SuccessOverlay
        visible={showSuccess}
        onDone={() => setShowSuccess(false)}
        credits={successCredits}
      />
    </View>
  )
}

/* ──────────────────────────────────────────────
 * Hero Wallet Card
 * ────────────────────────────────────────────── */

interface HeroCardProps {
  balance: number
  usedCredits: number
  txCount: number
}

function HeroCard({ balance, usedCredits, txCount }: HeroCardProps) {
  const { t: i18n } = useTranslation()
  const enterScale = useRef(new Animated.Value(0.92)).current
  const enterOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enterScale, {
        toValue: 1,
        stiffness: 220,
        damping: 18,
        useNativeDriver: true,
      }),
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.heroCard,
        { opacity: enterOpacity, transform: [{ scale: enterScale }] },
      ]}
    >
      <View style={styles.heroCircle1} />
      <View style={styles.heroCircle2} />

      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroCardLabel}>
            {i18n('credits.title').toUpperCase()}
          </Text>
          <Text style={styles.heroCardSub}>{i18n('credits.yourBalance')}</Text>
        </View>
        <View style={styles.heroIconBox}>
          <Ionicons name="wallet" size={22} color={ACCENT_GOLD} />
        </View>
      </View>

      <Text style={styles.heroBalance}>{balance}</Text>
      <Text style={styles.heroUnit}>{i18n('credits.title')}</Text>

      <View style={styles.heroDivider} />

      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{usedCredits}</Text>
          <Text style={styles.heroStatLabel}>{i18n('quotes.status.won')}</Text>
        </View>
        <View style={styles.heroStatSep} />
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatValue, { color: ACCENT_GOLD }]}>
            {balance}
          </Text>
          <Text style={styles.heroStatLabel}>
            {i18n('credits.yourBalance')}
          </Text>
        </View>
        <View style={styles.heroStatSep} />
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{txCount}</Text>
          <Text style={styles.heroStatLabel}>{i18n('credits.history')}</Text>
        </View>
      </View>
    </Animated.View>
  )
}

/* ──────────────────────────────────────────────
 * Transaction Card
 * ────────────────────────────────────────────── */

interface TxCardProps {
  description: string
  date: string
  amount: number
  isCredit: boolean
}

function TxCard({ description, date, amount, isCredit }: TxCardProps) {
  const color = isCredit ? ACCENT_GREEN : ACCENT_RED
  const iconName: keyof typeof Ionicons.glyphMap = isCredit
    ? 'arrow-down-circle'
    : 'arrow-up-circle'

  return (
    <View style={styles.txCard}>
      <View style={[styles.txIconBox, { backgroundColor: `${color}14` }]}>
        <Ionicons name={iconName} size={20} color={color} />
      </View>
      <View style={styles.txBody}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <View style={[styles.txAmountBadge, { backgroundColor: `${color}0C` }]}>
        <Text style={[styles.txAmountText, { color }]}>
          {isCredit ? '+' : ''}
          {amount}
        </Text>
        <Text style={[styles.txAmountUnit, { color: `${color}99` }]}>cr</Text>
      </View>
    </View>
  )
}

/* ──────────────────────────────────────────────
 * Empty State
 * ────────────────────────────────────────────── */

function EmptyState() {
  const { t: i18n } = useTranslation()
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconArea}>
        <View style={styles.emptyDiamond}>
          <Ionicons
            name="receipt-outline"
            size={26}
            color="#fff"
            style={{ transform: [{ rotate: '-45deg' }] }}
          />
        </View>
      </View>
      <Text style={styles.emptyTitle}>{i18n('credits.noTransactions')}</Text>
      <View style={styles.emptyDivider} />
      <Text style={styles.emptyDesc}>{i18n('credits.noTransactions')}</Text>
    </View>
  )
}

/* ──────────────────────────────────────────────
 * Skeleton Loaders
 * ────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <View style={[styles.heroCard, { backgroundColor: t.border }]}>
      <View style={{ gap: spacing.sm, padding: spacing.xs }}>
        <SkeletonLine w={100} h={10} r={5} />
        <SkeletonLine w={80} h={44} r={8} />
        <SkeletonLine w={60} h={12} r={6} />
        <View
          style={{
            height: 1,
            backgroundColor: t.borderStrong,
            marginVertical: spacing.sm,
          }}
        />
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: spacing.xs }}>
              <SkeletonLine w={36} h={16} r={4} />
              <SkeletonLine w={40} h={10} r={4} />
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

function SkeletonBlock() {
  return (
    <View style={styles.txCard}>
      <SkeletonLine w={40} h={40} r={radius.md} />
      <View style={[styles.txBody, { gap: spacing.xs }]}>
        <SkeletonLine w="62%" h={12} r={6} />
        <SkeletonLine w="38%" h={10} r={5} />
      </View>
      <SkeletonLine w={48} h={28} r={8} />
    </View>
  )
}

function SkeletonLine({
  w,
  h,
  r,
}: {
  w: number | string
  h: number
  r: number
}) {
  const anim = useRef(new Animated.Value(0.35)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.75,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return (
    <Animated.View
      style={[
        {
          width: w as any,
          height: h,
          borderRadius: r,
          backgroundColor: t.borderStrong,
        },
        { opacity: anim },
      ]}
    />
  )
}

/* ──────────────────────────────────────────────
 * Request Credits Modal
 * ────────────────────────────────────────────── */

interface RequestCreditsModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: (credits: number) => void
}

function RequestCreditsModal({
  visible,
  onClose,
  onSuccess,
}: RequestCreditsModalProps) {
  const t = useTheme()
  const styles = makeStyles(t)
  const [packages, setPackages] = useState<Array<CreditPackage>>([])
  const [loading, setLoading] = useState(false)
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const backdropAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current

  useEffect(() => {
    if (visible) {
      setSelectedPkgId(null)
      loadPackages()
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_H,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  async function loadPackages() {
    setLoading(true)
    try {
      const pkgs = await fetchActiveCreditPackagesFn()
      setPackages(Array.isArray(pkgs) ? pkgs : [])
    } catch {
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const { t: i18n } = useTranslation()

  async function handleSubmit() {
    if (!selectedPkgId) return
    const pkg = packages.find((p) => p.id === selectedPkgId)
    if (!pkg) return

    setSubmitting(true)
    try {
      const res = await requestCreditsFn(pkg.credits, pkg.id)
      if (res.success) {
        onSuccess(pkg.credits)
      } else {
        Alert.alert(i18n('common.error'), res.error || i18n('credits.error'))
      }
    } catch {
      Alert.alert(i18n('common.error'), i18n('credits.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPkg = packages.find((p) => p.id === selectedPkgId)
  const popularIndex = Math.floor(packages.length / 2)

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalSheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.modalHandle} />

        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderIconWrap}>
            <Ionicons name="wallet" size={24} color={ACCENT_GOLD} />
          </View>
          <Text style={styles.modalTitle}>
            {i18n('credits.requestCredits')}
          </Text>
          <Text style={styles.modalSub}>{i18n('credits.buyCredits')}</Text>
        </View>

        {loading ? (
          <View style={styles.modalLoadingWrap}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.modalSkelCard}>
                <SkeletonLine w={52} h={52} r={radius.md} />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <SkeletonLine w="52%" h={11} r={6} />
                  <SkeletonLine w="36%" h={9} r={5} />
                </View>
                <SkeletonLine w={50} h={34} r={radius.sm} />
              </View>
            ))}
          </View>
        ) : packages.length === 0 ? (
          <View style={styles.modalEmptyWrap}>
            <Ionicons name="cube-outline" size={36} color={t.textSubtle} />
            <Text style={styles.modalEmptyText}>
              {i18n('credits.noTransactions')}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {packages.map((pkg, idx) => {
              const isSelected = selectedPkgId === pkg.id
              const isPopular = idx === popularIndex && packages.length > 1
              const perCredit =
                pkg.price > 0 ? (pkg.price / pkg.credits).toFixed(1) : null

              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelectedPkgId(isSelected ? null : pkg.id)}
                  style={({ pressed }) => [
                    styles.pkgCard,
                    isSelected && {
                      backgroundColor: `${ACCENT_GOLD}08`,
                      borderColor: ACCENT_GOLD,
                      borderWidth: 1.5,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {isPopular && (
                    <View style={styles.pkgPopularBadge}>
                      <Text style={styles.pkgPopularText}>
                        {i18n('credits.purchase')}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.pkgCreditsBox,
                      {
                        backgroundColor: isSelected
                          ? ACCENT_GOLD
                          : `${ACCENT_GOLD}12`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pkgCreditsNum,
                        { color: isSelected ? '#fff' : ACCENT_GOLD },
                      ]}
                    >
                      {pkg.credits}
                    </Text>
                    <Text
                      style={[
                        styles.pkgCreditsCap,
                        {
                          color: isSelected
                            ? 'rgba(255,255,255,0.7)'
                            : `${ACCENT_GOLD}99`,
                        },
                      ]}
                    >
                      cr
                    </Text>
                  </View>

                  <View style={styles.pkgBody}>
                    <Text style={styles.pkgName} numberOfLines={1}>
                      {pkg.name}
                    </Text>
                    {pkg.description ? (
                      <Text style={styles.pkgDesc} numberOfLines={1}>
                        {pkg.description}
                      </Text>
                    ) : perCredit ? (
                      <Text style={styles.pkgDesc}>
                        {perCredit} DA / credit
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.pkgRight}>
                    <Text
                      style={[
                        styles.pkgPrice,
                        isSelected && { color: ACCENT_GOLD },
                      ]}
                    >
                      {pkg.price.toLocaleString()}
                    </Text>
                    <Text style={styles.pkgPriceCur}>DA</Text>
                    {isSelected && (
                      <View style={styles.pkgCheckWrap}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={ACCENT_GOLD}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalBtnSecondary,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.modalBtnSecondaryText}>
              {i18n('credits.cancel')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedPkg || submitting}
            style={({ pressed }) => [
              styles.modalBtnPrimary,
              selectedPkg && { backgroundColor: ACCENT_GOLD },
              pressed && selectedPkg && { opacity: 0.88 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.modalBtnPrimaryText,
                  selectedPkg && { color: '#fff' },
                ]}
              >
                {selectedPkg
                  ? `${i18n('credits.requestCredits')} ${selectedPkg.credits}`
                  : i18n('credits.purchase')}
              </Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

/* ──────────────────────────────────────────────
 * Success Overlay
 * ────────────────────────────────────────────── */

interface SuccessOverlayProps {
  visible: boolean
  onDone: () => void
  credits: number
}

function SuccessOverlay({
  visible,
  onDone,
  credits: creditCount,
}: SuccessOverlayProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const styles = makeStyles(t)
  const backdropAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.55)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const checkScale = useRef(new Animated.Value(0)).current
  const slideY = useRef(new Animated.Value(24)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start()
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        delay: 220,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[styles.successBackdrop, { opacity: backdropAnim }]}
      />
      <View
        style={[StyleSheet.absoluteFillObject, styles.successRoot]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.successCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideY }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.successIconWrap,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            <View style={styles.successIconRing}>
              <Ionicons
                name="checkmark-circle"
                size={52}
                color={ACCENT_GREEN}
              />
            </View>
          </Animated.View>

          <Text style={styles.successTitle}>{i18n('credits.success')}</Text>
          <View
            style={[styles.successDivider, { backgroundColor: ACCENT_GREEN }]}
          />
          <Text style={styles.successDesc}>
            {i18n('credits.congratulations')}{' '}
            <Text style={{ fontWeight: '800', color: ACCENT_GREEN }}>
              {creditCount}
            </Text>
          </Text>

          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.successBtn,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.successBtnText}>{i18n('common.done')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

/* ──────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────── */

const t = palette.light
const styles = makeStyles(t)

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#F8FAFC',
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },

    // ── Hero Card ──────────────────────────────
    heroCard: {
      borderRadius: radius.xl,
      backgroundColor: NAVY,
      padding: spacing.xl,
      overflow: 'hidden',
      shadowColor: NAVY,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 20,
      elevation: 12,
    },
    heroCircle1: {
      position: 'absolute',
      top: -50,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: `${ACCENT_GOLD}0C`,
    },
    heroCircle2: {
      position: 'absolute',
      bottom: -40,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.03)',
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    heroCardLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: ACCENT_GOLD,
      letterSpacing: 1.8,
      marginBottom: spacing.xs,
    },
    heroCardSub: {
      fontSize: 12,
      fontWeight: '400',
      color: NAVY_MUTED,
      letterSpacing: 0.2,
    },
    heroIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: `${ACCENT_GOLD}18`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${ACCENT_GOLD}28`,
    },
    heroBalance: {
      fontSize: 56,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -3,
      lineHeight: 60,
      fontVariant: ['tabular-nums'],
    },
    heroUnit: {
      fontSize: 14,
      fontWeight: '500',
      color: NAVY_MUTED,
      letterSpacing: 0.5,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    heroDivider: {
      height: 1,
      backgroundColor: NAVY_BORDER,
      marginBottom: spacing.lg,
    },
    heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    heroStat: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
    heroStatValue: {
      fontSize: 18,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.5,
      fontVariant: ['tabular-nums'],
    },
    heroStatLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: NAVY_MUTED,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    heroStatSep: {
      width: 1,
      height: 28,
      backgroundColor: NAVY_BORDER,
    },

    // ── CTA Button ─────────────────────────────
    ctaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: ACCENT_GOLD,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      shadowColor: ACCENT_GOLD,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.38,
      shadowRadius: 12,
      elevation: 8,
    },
    ctaBtnText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
      flex: 1,
    },

    // ── Section ────────────────────────────────
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: '#0a0a0a',
      letterSpacing: -0.4,
    },
    sectionPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.pill,
      backgroundColor: `${ACCENT_GOLD}16`,
    },
    sectionPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: ACCENT_GOLD,
    },

    // ── Transaction Card ────────────────────────
    txCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },
    txIconBox: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txBody: {
      flex: 1,
      gap: spacing.xs,
    },
    txDesc: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0a0a0a',
      letterSpacing: -0.1,
    },
    txDate: {
      fontSize: 12,
      color: '#a1a1aa',
      fontWeight: '400',
    },
    txAmountBadge: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 2,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.sm + 4,
    },
    txAmountText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.3,
      fontVariant: ['tabular-nums'],
    },
    txAmountUnit: {
      fontSize: 10,
      fontWeight: '600',
    },

    // ── Empty State ─────────────────────────────
    emptyWrap: {
      alignItems: 'center',
      paddingTop: 56,
      paddingHorizontal: spacing.xxl,
    },
    emptyIconArea: {
      width: 90,
      height: 90,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    emptyDiamond: {
      width: 66,
      height: 66,
      borderRadius: radius.md,
      backgroundColor: ACCENT_GOLD,
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ rotate: '45deg' }],
      shadowColor: ACCENT_GOLD,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
      elevation: 10,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: '#0a0a0a',
      letterSpacing: -0.5,
      marginBottom: spacing.sm,
    },
    emptyDivider: {
      width: 32,
      height: 3,
      borderRadius: 2,
      backgroundColor: ACCENT_GOLD,
      marginBottom: spacing.sm,
    },
    emptyDesc: {
      fontSize: 14,
      color: '#71717a',
      textAlign: 'center',
      lineHeight: 21,
    },

    // ── Modal ──────────────────────────────────
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.52)',
    },
    modalSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      maxHeight: SCREEN_H * 0.84,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
      elevation: 16,
      backgroundColor: t.surface,
      borderColor: t.border,
    },
    modalHandle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: spacing.sm + 2,
      marginBottom: spacing.xs,
      backgroundColor: t.textSubtle + '40',
    },
    modalHeader: {
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    modalHeaderIconWrap: {
      width: 52,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: `${ACCENT_GOLD}14`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: `${ACCENT_GOLD}22`,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: t.text,
    },
    modalSub: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textMuted,
    },
    modalLoadingWrap: {
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
    },
    modalSkelCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      minHeight: 62,
      backgroundColor: t.bg,
    },
    modalEmptyWrap: {
      alignItems: 'center',
      paddingVertical: 48,
      gap: spacing.sm,
    },
    modalEmptyText: {
      fontSize: 14,
      fontWeight: '600',
      color: t.textMuted,
    },
    modalScroll: {
      maxHeight: SCREEN_H * 0.42,
    },
    modalScrollContent: {
      paddingHorizontal: spacing.xl,
      gap: spacing.sm,
      paddingBottom: spacing.sm,
    },

    // Package Card
    pkgCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: spacing.lg + 2,
      overflow: 'visible',
      backgroundColor: t.bg,
      borderColor: t.border,
      borderWidth: 1,
    },
    pkgPopularBadge: {
      position: 'absolute',
      top: -9,
      left: 18,
      backgroundColor: ACCENT_GOLD,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs - 1,
      borderRadius: spacing.sm - 2,
      zIndex: 1,
    },
    pkgPopularText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: 1.2,
    },
    pkgCreditsBox: {
      width: 58,
      height: 58,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 1,
    },
    pkgCreditsNum: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -1,
      fontVariant: ['tabular-nums'],
    },
    pkgCreditsCap: {
      fontSize: 11,
      fontWeight: '700',
      marginTop: 6,
    },
    pkgBody: {
      flex: 1,
      gap: spacing.xs,
    },
    pkgName: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
      color: t.text,
    },
    pkgDesc: {
      fontSize: 12,
      fontWeight: '500',
      color: t.textMuted,
    },
    pkgRight: {
      alignItems: 'flex-end',
    },
    pkgPrice: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.5,
      fontVariant: ['tabular-nums'],
      color: t.text,
    },
    pkgPriceCur: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 1,
      color: t.textMuted,
    },
    pkgCheckWrap: {
      marginTop: spacing.xs - 1,
    },

    // Modal Footer
    modalFooter: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      paddingBottom: 32,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
    },
    modalBtnSecondary: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      paddingVertical: 15,
      minHeight: 52,
      borderColor: t.border,
    },
    modalBtnSecondaryText: {
      fontSize: 14,
      fontWeight: '700',
      color: t.textMuted,
    },
    modalBtnPrimary: {
      flex: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      paddingVertical: 15,
      minHeight: 52,
      backgroundColor: t.border,
    },
    modalBtnPrimaryText: {
      fontSize: 15,
      fontWeight: '800',
      color: t.textSubtle,
    },

    // ── Success Overlay ────────────────────────
    successBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.58)',
    },
    successRoot: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    successCard: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 28,
      borderRadius: 28,
      borderWidth: 1,
      gap: spacing.xs,
      backgroundColor: t.surface,
      borderColor: t.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
    successIconWrap: {
      marginBottom: spacing.sm,
    },
    successIconRing: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 1.5,
      borderColor: `${ACCENT_GREEN}30`,
      backgroundColor: `${ACCENT_GREEN}10`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: {
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.6,
      color: t.text,
    },
    successDivider: {
      width: 32,
      height: 3,
      borderRadius: 2,
      marginVertical: spacing.xs,
    },
    successDesc: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 21,
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.sm,
      color: t.textMuted,
    },
    successBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: ACCENT_GREEN,
      paddingVertical: 15,
      paddingHorizontal: spacing.xl + 16,
      minHeight: 52,
      marginTop: spacing.xs,
      shadowColor: ACCENT_GREEN,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    successBtnText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
    },
  })
}
