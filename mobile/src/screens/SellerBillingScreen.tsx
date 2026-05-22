import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
  fetchActiveCreditPackagesFn,
  fetchCreditBalance,
  requestCreditsFn,
} from '../lib/api-client'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { DimensionValue } from 'react-native'
import type { CreditBalance, CreditPackage } from '../types/seller'

const C = {
  amber: '#F59E0B',
  amberDeep: '#D97706',
  amberGlow: '#F59E0B18',
  green: '#059669',
  greenGlow: '#05966918',
  red: '#DC2626',
  redGlow: '#DC262618',
  navy: '#0F172A',
  navyMid: '#1E293B',
  navyBorder: '#334155',
  navyMuted: '#94A3B8',
  bg: '#EFF6FF',
} as const

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + spacing.md : 50
const SCREEN_H = Dimensions.get('window').height

interface SellerBillingScreenProps {
  refreshKey: number
}

export function SellerBillingScreen({ refreshKey }: SellerBillingScreenProps) {
  const t = useTheme()
  const [data, setData] = useState<CreditBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successCredits, setSuccessCredits] = useState(0)

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (isRefresh) setRefreshing(true)
      try {
        const result = await fetchCreditBalance()
        setData(result)
      } catch {
        Alert.alert('Error', 'Could not load billing data.')
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

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
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
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {loading ? (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: SAFE_TOP }]}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonHero />
          <View style={styles.skeletonBtnWrap}>
            <SkeletonLine width="100%" height={52} radius={radius.lg} />
          </View>
          <View style={styles.sectionRow}>
            <SkeletonLine width={130} height={18} radius={6} />
          </View>
          <View style={{ gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonTx key={i} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: SAFE_TOP }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={C.amber}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Wallet Card ── */}
          <HeroCard
            balance={balance}
            usedCredits={usedCredits}
            txCount={transactions.length}
          />

          {/* ── Request Credits CTA ── */}
          <Pressable
            onPress={() => setShowModal(true)}
            style={({ pressed }) => [
              styles.ctaBtn,
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={styles.ctaBtnInner} pointerEvents="none" />
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.ctaBtnText}>Request Credits</Text>
            <View style={styles.ctaBtnChevron}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="rgba(255,255,255,0.6)"
              />
            </View>
          </Pressable>

          {/* ── Recent Activity ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.length > 0 && (
              <View style={styles.sectionPill}>
                <Text style={styles.sectionPillText}>
                  {transactions.length}
                </Text>
              </View>
            )}
          </View>

          {transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <View style={{ gap: 10 }}>
              {transactions.map((item) => {
                const isCredit = item.type === 'credit' || item.amount > 0
                return (
                  <TxCard
                    key={item.id}
                    description={
                      item.description ||
                      (isCredit ? 'Credits added' : 'Quote submitted')
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

/* ──────────────────────────────────────────────────────────
 * Hero Wallet Card
 * ────────────────────────────────────────────────────────── */

interface HeroCardProps {
  balance: number
  usedCredits: number
  txCount: number
}

function HeroCard({ balance, usedCredits, txCount }: HeroCardProps) {
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
      {/* Decorative circles */}
      <View style={styles.heroCircle1} />
      <View style={styles.heroCircle2} />
      <View style={styles.heroCircle3} />

      {/* Top row */}
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroCardLabel}>CREDITS WALLET</Text>
          <Text style={styles.heroCardSub}>Available balance</Text>
        </View>
        <View style={styles.heroIconBox}>
          <Ionicons name="wallet" size={22} color={C.amber} />
        </View>
      </View>

      {/* Balance */}
      <Text style={styles.heroBalance}>{balance}</Text>
      <Text style={styles.heroUnit}>credits</Text>

      {/* Divider */}
      <View style={styles.heroDivider} />

      {/* Stats row */}
      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{usedCredits}</Text>
          <Text style={styles.heroStatLabel}>Used</Text>
        </View>
        <View style={styles.heroStatSep} />
        <View style={styles.heroStat}>
          <Text style={[styles.heroStatValue, { color: C.amber }]}>
            {balance}
          </Text>
          <Text style={styles.heroStatLabel}>Remaining</Text>
        </View>
        <View style={styles.heroStatSep} />
        <View style={styles.heroStat}>
          <Text style={styles.heroStatValue}>{txCount}</Text>
          <Text style={styles.heroStatLabel}>Transactions</Text>
        </View>
      </View>
    </Animated.View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Transaction Card
 * ────────────────────────────────────────────────────────── */

interface TxCardProps {
  description: string
  date: string
  amount: number
  isCredit: boolean
}

function TxCard({ description, date, amount, isCredit }: TxCardProps) {
  const color = isCredit ? C.green : C.red
  const glowBg = isCredit ? C.greenGlow : C.redGlow
  const iconName: keyof typeof Ionicons.glyphMap = isCredit
    ? 'arrow-down-circle'
    : 'arrow-up-circle'

  return (
    <View style={styles.txCard}>
      <View style={[styles.txAccent, { backgroundColor: color }]} />
      <View style={[styles.txIconBox, { backgroundColor: glowBg }]}>
        <Ionicons name={iconName} size={20} color={color} />
      </View>
      <View style={styles.txBody}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {description}
        </Text>
        <Text style={styles.txDate}>{date}</Text>
      </View>
      <View style={[styles.txAmountBadge, { backgroundColor: glowBg }]}>
        <Text style={[styles.txAmountText, { color }]}>
          {isCredit ? '+' : ''}
          {amount}
        </Text>
        <Text style={[styles.txAmountUnit, { color: `${color}99` }]}>cr</Text>
      </View>
    </View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Skeleton Loaders
 * ────────────────────────────────────────────────────────── */

function SkeletonLine({
  width,
  height,
  radius: r,
}: {
  width: DimensionValue
  height: number
  radius: number
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
        { width, height, borderRadius: r, backgroundColor: '#dde3ef' },
        { opacity: anim },
      ]}
    />
  )
}

function SkeletonHero() {
  const anim = useRef(new Animated.Value(0.35)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return (
    <Animated.View
      style={[styles.heroCard, { backgroundColor: '#c8d3e8', opacity: anim }]}
    >
      <View style={{ gap: 12, padding: 4 }}>
        <View
          style={{
            width: 100,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#b0bed4',
          }}
        />
        <View
          style={{
            width: 80,
            height: 44,
            borderRadius: 8,
            backgroundColor: '#b0bed4',
          }}
        />
        <View
          style={{
            width: 60,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#b0bed4',
          }}
        />
        <View
          style={{ height: 1, backgroundColor: '#b0bed4', marginVertical: 8 }}
        />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ gap: 4 }}>
              <View
                style={{
                  width: 36,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: '#b0bed4',
                }}
              />
              <View
                style={{
                  width: 40,
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: '#b0bed4',
                }}
              />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  )
}

function SkeletonTx() {
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
    <Animated.View style={[styles.txCard, { opacity: anim }]}>
      <View style={[styles.txAccent, { backgroundColor: '#dde3ef' }]} />
      <View
        style={[
          styles.txIconBox,
          { backgroundColor: '#edf0f7', width: 40, height: 40 },
        ]}
      />
      <View style={[styles.txBody, { gap: 6 }]}>
        <View
          style={{
            width: '62%',
            height: 12,
            borderRadius: 6,
            backgroundColor: '#dde3ef',
          }}
        />
        <View
          style={{
            width: '38%',
            height: 10,
            borderRadius: 5,
            backgroundColor: '#dde3ef',
          }}
        />
      </View>
      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 8,
          backgroundColor: '#edf0f7',
        }}
      />
    </Animated.View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Empty State
 * ────────────────────────────────────────────────────────── */

function EmptyTransactions() {
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  return (
    <View style={styles.emptyWrap}>
      <Animated.View
        style={[styles.emptyIconArea, { transform: [{ scale: pulse }] }]}
      >
        <View style={styles.emptyDiamond}>
          <Ionicons
            name="receipt-outline"
            size={26}
            color="#fff"
            style={{ transform: [{ rotate: '-45deg' }] }}
          />
        </View>
        <View style={styles.emptyAccentDot} />
      </Animated.View>
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <View style={styles.emptyDivider} />
      <Text style={styles.emptyDesc}>
        Your credit activity will appear here once you request or use credits.
      </Text>
    </View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Request Credits Modal
 * ────────────────────────────────────────────────────────── */

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
        Alert.alert('Error', res.error || 'Failed to submit request.')
      }
    } catch {
      Alert.alert('Error', 'Could not submit request. Please try again.')
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
            backgroundColor: t.surface,
            borderColor: t.border,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View
          style={[styles.modalHandle, { backgroundColor: t.textSubtle + '40' }]}
        />

        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderIconWrap}>
            <Ionicons name="wallet" size={24} color={C.amber} />
          </View>
          <Text style={[styles.modalTitle, { color: t.text }]}>
            Request Credits
          </Text>
          <Text style={[styles.modalSub, { color: t.textMuted }]}>
            Choose a package to request from admin
          </Text>
        </View>

        {/* Package list */}
        {loading ? (
          <View style={styles.modalLoadingWrap}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.modalSkelCard, { backgroundColor: t.bg }]}
              >
                <View
                  style={[styles.modalSkelIcon, { backgroundColor: t.border }]}
                />
                <View style={{ flex: 1, gap: 6 }}>
                  <View
                    style={{
                      width: '52%',
                      height: 11,
                      borderRadius: 6,
                      backgroundColor: t.border,
                    }}
                  />
                  <View
                    style={{
                      width: '36%',
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: t.border,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: 50,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: t.border,
                  }}
                />
              </View>
            ))}
          </View>
        ) : packages.length === 0 ? (
          <View style={styles.modalEmptyWrap}>
            <Ionicons name="cube-outline" size={36} color={t.textSubtle} />
            <Text style={[styles.modalEmptyText, { color: t.textMuted }]}>
              No packages available
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
                    {
                      backgroundColor: isSelected ? `${C.amber}08` : t.bg,
                      borderColor: isSelected ? C.amber : t.border,
                      borderWidth: isSelected ? 1.5 : 1,
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  {isPopular && (
                    <View style={styles.pkgPopularBadge}>
                      <Text style={styles.pkgPopularText}>POPULAR</Text>
                    </View>
                  )}

                  {/* Credits count — left focal point */}
                  <View
                    style={[
                      styles.pkgCreditsBox,
                      {
                        backgroundColor: isSelected ? C.amber : `${C.amber}12`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pkgCreditsNum,
                        { color: isSelected ? '#fff' : C.amber },
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
                            : `${C.amber}99`,
                        },
                      ]}
                    >
                      cr
                    </Text>
                  </View>

                  {/* Name + description */}
                  <View style={styles.pkgBody}>
                    <Text
                      style={[styles.pkgName, { color: t.text }]}
                      numberOfLines={1}
                    >
                      {pkg.name}
                    </Text>
                    {pkg.description ? (
                      <Text
                        style={[styles.pkgDesc, { color: t.textMuted }]}
                        numberOfLines={1}
                      >
                        {pkg.description}
                      </Text>
                    ) : perCredit ? (
                      <Text style={[styles.pkgDesc, { color: t.textMuted }]}>
                        {perCredit} DA / credit
                      </Text>
                    ) : null}
                  </View>

                  {/* Price + checkmark */}
                  <View style={styles.pkgRight}>
                    <Text
                      style={[
                        styles.pkgPrice,
                        { color: isSelected ? C.amber : t.text },
                      ]}
                    >
                      {pkg.price.toLocaleString()}
                    </Text>
                    <Text style={[styles.pkgPriceCur, { color: t.textMuted }]}>
                      DA
                    </Text>
                    {isSelected && (
                      <View style={styles.pkgCheckWrap}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={C.amber}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>
        )}

        {/* Footer actions */}
        <View style={[styles.modalFooter, { borderTopColor: t.border }]}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalBtnSecondary,
              { borderColor: t.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[styles.modalBtnSecondaryText, { color: t.textMuted }]}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedPkg || submitting}
            style={({ pressed }) => [
              styles.modalBtnPrimary,
              { backgroundColor: selectedPkg ? C.amber : t.border },
              pressed && selectedPkg && { opacity: 0.88 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                {selectedPkg && <View style={styles.modalBtnHighlight} />}
                <Text
                  style={[
                    styles.modalBtnPrimaryText,
                    { color: selectedPkg ? '#fff' : t.textSubtle },
                  ]}
                >
                  {selectedPkg
                    ? `Request ${selectedPkg.credits} Credits`
                    : 'Select a Package'}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Success Overlay
 * ────────────────────────────────────────────────────────── */

interface SuccessOverlayProps {
  visible: boolean
  onDone: () => void
  credits: number
}

function SuccessOverlay({ visible, onDone, credits }: SuccessOverlayProps) {
  const t = useTheme()
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
            { backgroundColor: t.surface, borderColor: t.border },
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideY }],
            },
          ]}
        >
          {/* Decorative top bar */}
          <View style={[styles.successTopBar, { backgroundColor: C.green }]} />

          {/* Check icon */}
          <Animated.View
            style={[
              styles.successIconWrap,
              { transform: [{ scale: checkScale }] },
            ]}
          >
            <View
              style={[
                styles.successIconRing,
                {
                  borderColor: `${C.green}30`,
                  backgroundColor: `${C.green}10`,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={52} color={C.green} />
            </View>
            <View style={styles.successAccentDot} />
          </Animated.View>

          <Text style={[styles.successTitle, { color: t.text }]}>
            Request Sent!
          </Text>
          <View style={[styles.successDivider, { backgroundColor: C.green }]} />
          <Text style={[styles.successDesc, { color: t.textMuted }]}>
            Your request for{' '}
            <Text style={{ fontWeight: '800', color: C.green }}>
              {credits} credits
            </Text>{' '}
            has been submitted. You'll be notified once it's approved.
          </Text>

          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.successBtn,
              { backgroundColor: C.green },
              pressed && { opacity: 0.88 },
            ]}
          >
            <View style={styles.successBtnHighlight} />
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.successBtnText}>Done</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },

  // ── Hero Card ────────────────────────────────────────────
  heroCard: {
    borderRadius: 24,
    backgroundColor: C.navy,
    padding: 22,
    overflow: 'hidden',
    shadowColor: C.navy,
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
    backgroundColor: `${C.amber}0C`,
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
  heroCircle3: {
    position: 'absolute',
    top: 30,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${C.amber}06`,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: C.amber,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  heroCardSub: {
    fontSize: 12,
    fontWeight: '400',
    color: C.navyMuted,
    letterSpacing: 0.2,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${C.amber}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${C.amber}28`,
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
    color: C.navyMuted,
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 18,
  },
  heroDivider: {
    height: 1,
    backgroundColor: C.navyBorder,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
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
    color: C.navyMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroStatSep: {
    width: 1,
    height: 28,
    backgroundColor: C.navyBorder,
  },

  // ── CTA Button ───────────────────────────────────────────
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.amber,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnInner: {
    position: 'absolute',
    top: 4,
    left: 14,
    width: 80,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  ctaBtnChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Section ──────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0a0a0a',
    letterSpacing: -0.4,
  },
  sectionPill: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: `${C.amber}16`,
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.amber,
  },

  // ── Skeleton wrappers ─────────────────────────────────────
  skeletonBtnWrap: {
    marginVertical: 0,
  },

  // ── Transaction Card ──────────────────────────────────────
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  txAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  txBody: {
    flex: 1,
    gap: 3,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
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

  // ── Empty State ───────────────────────────────────────────
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 32,
  },
  emptyIconArea: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyDiamond: {
    width: 66,
    height: 66,
    borderRadius: 14,
    backgroundColor: C.amber,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyAccentDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.green,
    borderWidth: 2.5,
    borderColor: C.bg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0a0a0a',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  emptyDivider: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.amber,
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 21,
  },

  // ── Modal ────────────────────────────────────────────────
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
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 4,
  },
  modalHeaderIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: `${C.amber}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: `${C.amber}22`,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalLoadingWrap: {
    paddingHorizontal: 20,
    gap: 10,
  },
  modalSkelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    minHeight: 62,
  },
  modalSkelIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  modalEmptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  modalEmptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: SCREEN_H * 0.42,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 10,
  },

  // Package Card
  pkgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    overflow: 'visible',
  },
  pkgPopularBadge: {
    position: 'absolute',
    top: -9,
    left: 18,
    backgroundColor: C.amber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
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
    borderRadius: 16,
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
    gap: 3,
  },
  pkgName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pkgDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
  pkgRight: {
    alignItems: 'flex-end',
    gap: 0,
  },
  pkgPrice: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  pkgPriceCur: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  pkgCheckWrap: {
    marginTop: 3,
  },

  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalBtnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 15,
    minHeight: 52,
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    paddingVertical: 15,
    minHeight: 52,
    overflow: 'hidden',
  },
  modalBtnHighlight: {
    position: 'absolute',
    top: 5,
    left: 14,
    width: 60,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Success Overlay ──────────────────────────────────────
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
    paddingTop: 0,
    paddingBottom: 28,
    paddingHorizontal: 28,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    gap: 6,
  },
  successTopBar: {
    alignSelf: 'stretch',
    height: 4,
    marginBottom: 20,
    borderRadius: 2,
  },
  successIconWrap: {
    marginBottom: 8,
  },
  successIconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successAccentDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.amber,
    borderWidth: 2,
    borderColor: '#fff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  successDivider: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginVertical: 4,
  },
  successDesc: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 40,
    minHeight: 52,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  successBtnHighlight: {
    position: 'absolute',
    top: 5,
    left: 14,
    width: 50,
    height: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
})
