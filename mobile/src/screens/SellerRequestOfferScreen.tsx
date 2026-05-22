/* Hallmark · genre: modern-minimal · screen: SellerRequestOfferScreen
 * Mobile — React Native / Expo · design-system: tokens.ts
 * Pre-emit: P5 H4 E4 S4 R5 V4
 */
import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { fetchRequestDetails } from '../lib/api-client'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { SellerQuoteForm } from './SellerQuoteForm'
import type { Quote } from '../types/buyer'
import type { OpenRequestRow } from '../types/seller'

export interface ExistingQuoteData {
  id: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
}

interface SellerRequestOfferScreenProps {
  request: OpenRequestRow
  existingQuote?: ExistingQuoteData | null
  sellerId: string
  initialTab?: Tab
  onBack: () => void
  onSuccess: () => void
  onRequestCredits?: () => void
}

type Tab = 'details' | 'quotes' | 'offer'

const TABS: Array<Tab> = ['details', 'quotes', 'offer']
const ACCEPTED_COLOR = '#059669'
const PENDING_COLOR = '#2563eb'

// ── Status dot — static, no pulse ────────────────────────────────────────────

function StatusDot({ color }: { color: string }) {
  return (
    <View style={dotStyles.wrap}>
      <View style={[dotStyles.outer, { borderColor: color + '30' }]} />
      <View style={[dotStyles.core, { backgroundColor: color }]} />
    </View>
  )
}

const dotStyles = StyleSheet.create({
  wrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  core: { width: 7, height: 7, borderRadius: 4 },
})

// ── Anonymous competitor quote card ──────────────────────────────────────────

function AnonymousQuoteCard({ quote }: { quote: Quote }) {
  const t = useTheme()

  const isAccepted = quote.status === 'accepted'
  const isPending = quote.status === 'pending'
  const statusColor = isAccepted
    ? ACCEPTED_COLOR
    : isPending
      ? PENDING_COLOR
      : t.textSubtle
  const statusLabel = isAccepted
    ? 'In discussion'
    : isPending
      ? 'Pending'
      : 'Lost'

  return (
    <View
      style={[
        aqStyles.card,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={aqStyles.body}>
        {/* Avatar + seller + status */}
        <View style={aqStyles.topRow}>
          <View style={[aqStyles.avatar, { backgroundColor: t.bgMuted }]}>
            <Ionicons name="person-outline" size={15} color={t.textSubtle} />
          </View>

          <View style={aqStyles.sellerInfo}>
            <Text style={[aqStyles.sellerName, { color: t.text }]}>
              •••• ••••
            </Text>
            <Text style={[aqStyles.condText, { color: t.textSubtle }]}>
              {quote.condition === 'new' ? 'New part' : 'Used part'}
            </Text>
          </View>

          <View
            style={[
              aqStyles.statusBadge,
              {
                backgroundColor: statusColor + '0f',
                borderColor: statusColor + '28',
              },
            ]}
          >
            <StatusDot color={statusColor} />
            <Text style={[aqStyles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        {/* Rule */}
        <View style={[aqStyles.rule, { backgroundColor: t.border }]} />

        {/* Price + warranty */}
        <View style={aqStyles.priceRow}>
          <View>
            <Text style={[aqStyles.priceLabel, { color: t.textSubtle }]}>
              Offer price
            </Text>
            <Text style={[aqStyles.priceValue, { color: t.textMuted }]}>
              ••••• DA
            </Text>
          </View>

          {quote.warranty ? (
            <View
              style={[
                aqStyles.warrantyPill,
                {
                  backgroundColor: ACCEPTED_COLOR + '0a',
                  borderColor: ACCEPTED_COLOR + '28',
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={11}
                color={ACCEPTED_COLOR}
              />
              <Text style={[aqStyles.warrantyText, { color: ACCEPTED_COLOR }]}>
                {quote.warranty}
              </Text>
            </View>
          ) : (
            <View
              style={[
                aqStyles.warrantyPill,
                { backgroundColor: t.bgMuted, borderColor: t.border },
              ]}
            >
              <Ionicons name="shield-outline" size={11} color={t.textSubtle} />
              <Text style={[aqStyles.warrantyText, { color: t.textSubtle }]}>
                No warranty
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const aqStyles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  body: { padding: spacing.lg, gap: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInfo: { flex: 1, gap: 2 },
  sellerName: { fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  condText: { fontSize: 12, fontWeight: '400' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 12, fontWeight: '500' },
  rule: { height: 1 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  priceValue: { fontSize: 17, fontWeight: '600', letterSpacing: 3 },
  warrantyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  warrantyText: { fontSize: 11, fontWeight: '500' },
})

// ── Main screen ───────────────────────────────────────────────────────────────

export function SellerRequestOfferScreen({
  request,
  existingQuote,
  sellerId,
  initialTab,
  onBack,
  onSuccess,
  onRequestCredits,
}: SellerRequestOfferScreenProps) {
  const t = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'details')
  const [imageIndex, setImageIndex] = useState(0)
  const [heroWidth, setHeroWidth] = useState(0)
  const heroScrollRef = useRef<ScrollView>(null)
  const [segWidth, setSegWidth] = useState(0)
  const tabSlide = useRef(new Animated.Value(0)).current

  const [quotes, setQuotes] = useState<Array<Quote>>([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesLoaded, setQuotesLoaded] = useState(false)

  const images = request.imageUrls ?? []
  const isEditing = !!existingQuote
  const tabLabels = [
    'Details',
    'Offers',
    isEditing ? 'Edit offer' : 'Submit offer',
  ]
  const tabIcons: Array<keyof typeof Ionicons.glyphMap> = [
    'document-text-outline',
    'people-outline',
    isEditing ? 'pencil-outline' : 'add-circle-outline',
  ]

  function switchTab(newTab: Tab) {
    const idx = TABS.indexOf(newTab)
    Animated.spring(tabSlide, {
      toValue: segWidth > 0 ? (idx * segWidth) / 3 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start()
    setActiveTab(newTab)
  }

  useEffect(() => {
    if (segWidth > 0) {
      const idx = TABS.indexOf(activeTab)
      tabSlide.setValue((idx * segWidth) / 3)
    }
  }, [segWidth])

  useEffect(() => {
    if (activeTab !== 'quotes' || quotesLoaded) return
    setQuotesLoading(true)
    fetchRequestDetails(request.id)
      .then((row) => {
        setQuotes((row?.quotes ?? []).filter((q) => q.status !== 'rejected'))
        setQuotesLoaded(true)
      })
      .catch(() => setQuotesLoaded(true))
      .finally(() => setQuotesLoading(false))
  }, [activeTab, quotesLoaded, request.id])

  const acceptedCount = quotes.filter((q) => q.status === 'accepted').length
  const pendingCount = quotes.filter((q) => q.status === 'pending').length

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { backgroundColor: t.bg, borderBottomColor: t.border },
        ]}
      >
        <Pressable onPress={onBack} hitSlop={12}>
          <View style={[styles.backBtn, { backgroundColor: t.bgMuted }]}>
            <Ionicons name="arrow-back" size={17} color={t.text} />
          </View>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: t.text }]}
            numberOfLines={1}
          >
            {request.partName}
          </Text>
          <Text style={[styles.headerSub, { color: t.textMuted }]}>
            {request.vehicleBrand} · {request.modelYear}
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.segWrapper,
          { backgroundColor: t.bg, borderBottomColor: t.border },
        ]}
      >
        <View
          style={[styles.segTrack, { backgroundColor: t.bgMuted }]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width
            if (w !== segWidth) setSegWidth(w)
          }}
        >
          {segWidth > 0 && (
            <Animated.View
              style={[
                styles.segPill,
                {
                  width: segWidth / 3 - 6,
                  backgroundColor: t.surface,
                  borderColor: t.border,
                  transform: [{ translateX: tabSlide }],
                },
              ]}
            />
          )}

          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab
            return (
              <Pressable
                key={tab}
                style={styles.segBtn}
                onPress={() => switchTab(tab)}
              >
                <Ionicons
                  name={tabIcons[idx]}
                  size={13}
                  color={isActive ? t.accent : t.textSubtle}
                />
                <Text
                  style={[
                    styles.segBtnText,
                    {
                      color: isActive ? t.text : t.textSubtle,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {tabLabels[idx]}
                </Text>
                {tab === 'quotes' && request.quotesCount > 0 && (
                  <View
                    style={[
                      styles.segBadge,
                      { backgroundColor: isActive ? t.accent : t.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.segBadgeText,
                        { color: isActive ? t.accentFg : t.textSubtle },
                      ]}
                    >
                      {request.quotesCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          })}
        </View>
      </View>

      {/* ── Details tab ────────────────────────────────────────────────────── */}
      {activeTab === 'details' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero image — swipeable */}
          {images.length > 0 ? (
            <View
              style={styles.heroWrap}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width
                if (w !== heroWidth) setHeroWidth(w)
              }}
            >
              <ScrollView
                ref={heroScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                  if (heroWidth > 0) {
                    const idx = Math.round(
                      e.nativeEvent.contentOffset.x / heroWidth,
                    )
                    setImageIndex(idx)
                  }
                }}
                style={StyleSheet.absoluteFill}
                contentContainerStyle={{ flexDirection: 'row' }}
              >
                {images.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={{ width: heroWidth, height: '100%' }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>

              <View style={styles.heroGradient} pointerEvents="none" />

              {images.length > 1 && (
                <>
                  <View style={styles.heroDots}>
                    {images.map((_, i) => (
                      <Pressable
                        key={i}
                        onPress={() => {
                          heroScrollRef.current?.scrollTo({
                            x: i * heroWidth,
                            animated: true,
                          })
                          setImageIndex(i)
                        }}
                        hitSlop={6}
                        style={[
                          styles.heroDot,
                          {
                            backgroundColor:
                              i === imageIndex
                                ? '#fff'
                                : 'rgba(255,255,255,0.35)',
                            width: i === imageIndex ? 16 : 5,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.heroCountBadge}>
                    <Text style={styles.heroCountText}>
                      {imageIndex + 1}/{images.length}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: t.bgMuted, borderColor: t.border },
              ]}
            >
              <Ionicons name="image-outline" size={28} color={t.textSubtle} />
              <Text
                style={[styles.heroPlaceholderText, { color: t.textSubtle }]}
              >
                No images
              </Text>
            </View>
          )}

          {/* Part name + priority */}
          <View style={styles.partNameRow}>
            <Text style={[styles.partName, { color: t.text }]}>
              {request.partName}
            </Text>
            {request.isPriority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: '#fef2f2', borderColor: '#fecdd3' },
                ]}
              >
                <Ionicons name="flash" size={11} color="#e11d48" />
                <Text style={styles.priorityText}>Priority</Text>
              </View>
            )}
          </View>

          {/* Spec table */}
          <View style={[styles.specTable, { borderColor: t.border }]}>
            <SpecRow
              icon="car-sport-outline"
              label="Vehicle"
              value={request.vehicleBrand}
              sub={`Year ${request.modelYear}`}
              t={t}
            />
            <SpecRow
              icon="barcode-outline"
              label="OEM number"
              value={request.oemNumber ?? '—'}
              mono
              t={t}
            />
            {request.category && (
              <SpecRow
                icon="grid-outline"
                label="Category"
                value={request.category.name}
                accent
                t={t}
              />
            )}
            {request.brand && (
              <SpecRow
                icon="pricetag-outline"
                label="Part brand"
                value={request.brand.brand}
                t={t}
              />
            )}
          </View>

          {/* Buyer notes */}
          {request.notes && (
            <View
              style={[
                styles.notesCard,
                {
                  backgroundColor: t.surface,
                  borderColor: t.border,
                  borderLeftColor: t.accent,
                },
              ]}
            >
              <Text style={[styles.notesLabel, { color: t.accent }]}>
                Buyer notes
              </Text>
              <Text style={[styles.notesText, { color: t.text }]}>
                "{request.notes}"
              </Text>
            </View>
          )}

          {/* CTA */}
          <Pressable
            onPress={() => switchTab('offer')}
            style={({ pressed }) => [
              styles.ctaBtn,
              { backgroundColor: t.accent },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name={isEditing ? 'pencil-outline' : 'add-circle-outline'}
              size={16}
              color={t.accentFg}
            />
            <Text style={[styles.ctaBtnText, { color: t.accentFg }]}>
              {isEditing ? 'Edit my offer' : 'Submit an offer'}
            </Text>
          </Pressable>
        </ScrollView>
      )}

      {/* ── Offers tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'quotes' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {quotesLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator size="small" color={t.accent} />
              <Text style={[styles.centeredStateText, { color: t.textMuted }]}>
                Loading offers…
              </Text>
            </View>
          ) : quotes.length === 0 ? (
            <View style={styles.centeredState}>
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                No offers yet
              </Text>
              <Text style={[styles.emptyDesc, { color: t.textMuted }]}>
                Be the first to submit an offer on this request.
              </Text>
              <Pressable
                onPress={() => switchTab('offer')}
                style={({ pressed }) => [
                  styles.ctaBtn,
                  { backgroundColor: t.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color={t.accentFg}
                />
                <Text style={[styles.ctaBtnText, { color: t.accentFg }]}>
                  Submit an offer
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* Stats strip */}
              <View style={[styles.statsStrip, { borderColor: t.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: ACCEPTED_COLOR }]}>
                    {acceptedCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    In discussion
                  </Text>
                </View>
                <View
                  style={[styles.statDivider, { backgroundColor: t.border }]}
                />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: PENDING_COLOR }]}>
                    {pendingCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    Pending
                  </Text>
                </View>
                <View
                  style={[styles.statDivider, { backgroundColor: t.border }]}
                />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: t.text }]}>
                    {quotes.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    Total
                  </Text>
                </View>
              </View>

              {[...quotes]
                .sort((a, b) => {
                  if (a.status === 'accepted' && b.status !== 'accepted')
                    return -1
                  if (b.status === 'accepted' && a.status !== 'accepted')
                    return 1
                  return 0
                })
                .map((q) => (
                  <AnonymousQuoteCard key={q.id} quote={q} />
                ))}
            </>
          )}
        </ScrollView>
      )}

      {/* ── Submit / Edit tab ──────────────────────────────────────────────── */}
      {activeTab === 'offer' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Context card */}
          <View
            style={[
              styles.contextCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[styles.contextIconWrap, { backgroundColor: t.bgMuted }]}
            >
              <Ionicons
                name={isEditing ? 'pencil-outline' : 'storefront-outline'}
                size={17}
                color={t.accent}
              />
            </View>
            <View style={styles.contextText}>
              <Text
                style={[styles.contextTitle, { color: t.text }]}
                numberOfLines={1}
              >
                {request.partName}
              </Text>
              <Text style={[styles.contextSub, { color: t.textMuted }]}>
                {request.vehicleBrand} · {request.modelYear}
                {request.oemNumber ? ` · ${request.oemNumber}` : ''}
              </Text>
            </View>
          </View>

          {/* Form heading */}
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: t.text }]}>
              {isEditing ? 'Edit your offer' : 'Submit an offer'}
            </Text>
            <Text style={[styles.formDesc, { color: t.textMuted }]}>
              {isEditing
                ? 'Update your price, condition, or warranty.'
                : 'Set your price, condition, and warranty for this part.'}
            </Text>
          </View>

          <SellerQuoteForm
            requestId={request.id}
            sellerId={sellerId}
            existingQuote={existingQuote ?? undefined}
            onSuccess={onSuccess}
            onRequestCredits={onRequestCredits}
          />
        </ScrollView>
      )}
    </View>
  )
}

// ── Spec row — label left · value right ──────────────────────────────────────

function SpecRow({
  icon,
  label,
  value,
  sub,
  t,
  accent,
  mono,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  sub?: string
  t: any
  accent?: boolean
  mono?: boolean
}) {
  return (
    <View style={[specStyles.row, { borderBottomColor: t.border }]}>
      <View style={specStyles.labelWrap}>
        <Ionicons
          name={icon}
          size={12}
          color={accent ? t.accent : t.textSubtle}
        />
        <Text style={[specStyles.label, { color: t.textSubtle }]}>{label}</Text>
      </View>
      <View style={specStyles.valueWrap}>
        <Text
          style={[
            specStyles.value,
            {
              color: accent ? t.accent : t.text,
              fontFamily: mono ? 'monospace' : undefined,
            },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        {sub && (
          <Text style={[specStyles.sub, { color: t.textSubtle }]}>{sub}</Text>
        )}
      </View>
    </View>
  )
}

const specStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  valueWrap: { alignItems: 'flex-end', gap: 1 },
  value: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 11, fontWeight: '400' },
})

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop:
      Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  headerSub: { fontSize: 12, fontWeight: '400', textAlign: 'center' },

  // Tab bar
  segWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  segTrack: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: 3,
    position: 'relative',
    minHeight: 44,
    overflow: 'hidden',
  },
  segPill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    zIndex: 1,
  },
  segBtnText: { fontSize: 12 },
  segBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  segBadgeText: { fontSize: 10, fontWeight: '600' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: 48, gap: spacing.lg },

  // Hero
  heroWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  heroDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  heroDot: { height: 5, borderRadius: 3 },
  heroCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  heroCountText: { fontSize: 11, fontWeight: '500', color: '#fff' },
  heroPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  heroPlaceholderText: { fontSize: 13, fontWeight: '400' },

  // Part name
  partNameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  partName: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
    lineHeight: 28,
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  priorityText: { fontSize: 11, fontWeight: '600', color: '#e11d48' },

  // Spec table
  specTable: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },

  // Notes
  notesCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  notesLabel: { fontSize: 11, fontWeight: '600' },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    opacity: 0.85,
  },

  // CTA
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: 15,
    minHeight: 50,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '600' },

  // Centered state
  centeredState: { alignItems: 'center', paddingTop: 60, gap: spacing.lg },
  centeredStateText: { fontSize: 14, fontWeight: '400' },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyDesc: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2,
  },
  statDivider: { width: 1, height: 32 },
  statNum: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  statLabel: { fontSize: 11, fontWeight: '400' },

  // Submit tab
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  contextIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextText: { flex: 1, gap: 2 },
  contextTitle: { fontSize: 15, fontWeight: '600' },
  contextSub: { fontSize: 12, fontWeight: '400' },
  formHeader: { gap: spacing.xs },
  formTitle: { fontSize: 20, fontWeight: '600', letterSpacing: -0.3 },
  formDesc: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
})
