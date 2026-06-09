/* Hallmark · component: SubmitQuoteScreen · genre: modern-minimal
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * tabs: offer → details → quotes (primary action first)
 * redesign: counter badge, accent bar, full‑width vehicle spec, enlarged part name
 */

import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { ScrollView, Text, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'

import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  fetchAnonymousQuotes,
  fetchRequestDetails,
  retractQuoteFn,
} from '../lib/api-client'
import { useUserStore } from '../lib/stores/user-store'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { tCategory } from '../utils/category-utils'
import { SellerQuoteForm } from './SellerQuoteForm'
import type { SellerQuoteFormHandle } from './SellerQuoteForm'
import type { Theme } from '../theme/tokens'
import type { OpenRequestRow } from '../types/seller'
import type { SellerQuotesStackParamList } from '../navigation/types'
import type { ScrollView as RNScrollView } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export interface ExistingQuoteData {
  id: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
}

type Tab = 'details' | 'quotes' | 'offer'

const TABS: Array<Tab> = ['details', 'quotes', 'offer']

const TAB_ICONS: Record<Tab, keyof typeof Ionicons.glyphMap> = {
  details: 'document-text-outline',
  quotes: 'people-outline',
  offer: 'sparkles',
}

const C = {
  pending: '#2563eb',
  won: '#059669',
  lost: '#dc2626',
  inDiscussion: '#d97706',
} as const

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(iso).toLocaleDateString('en-DZ', {
    month: 'short',
    day: 'numeric',
  })
}

function quoteStatusColor(status: string): string {
  switch (status) {
    case 'accepted':
      return C.won
    case 'rejected':
      return C.lost
    case 'pending':
    case 'submitted':
      return C.pending
    default:
      return '#a1a1aa'
  }
}

function rankStyle(rank: number): { bg: string; text: string } {
  if (rank === 1) return { bg: '#f59e0b22', text: '#b45309' }
  if (rank === 2) return { bg: '#94a3b820', text: '#475569' }
  if (rank === 3) return { bg: '#cd7c3a22', text: '#92400e' }
  return { bg: '#f1f5f915', text: '#94a3b8' }
}

function quoteStatusLabel(status: string, t: (k: string) => string): string {
  switch (status) {
    case 'accepted':
      return t('submitQuote.statSelected')
    case 'rejected':
      return t('submitQuote.statRejected')
    case 'pending':
    case 'submitted':
      return t('submitQuote.statPending')
    default:
      return status
  }
}

// ─── QuoteRow ────────────────────────────────────────────────────────────────

function QuoteRow({
  quote,
  rank,
  isOwn,
  isLocked,
  onEdit,
  onWithdraw,
  t,
  translate,
  isRTL,
}: {
  quote: any
  rank: number
  isOwn: boolean
  isLocked: boolean
  onEdit: () => void
  onWithdraw: () => void
  t: Theme
  translate: (k: string) => string
  isRTL: boolean
}) {
  const statusColor = quoteStatusColor(quote.status)
  const isAccepted = quote.status === 'accepted'
  const isRejected = quote.status === 'rejected'

  const statusBg = isAccepted
    ? '#05966910'
    : isRejected
      ? t.bgMuted
      : '#2563eb10'

  const statusTextColor = isAccepted
    ? C.won
    : isRejected
      ? t.textSubtle
      : C.pending

  const pricePart = (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      <Text style={[styles.ownPrice, { color: t.text }]}>
        {quote.price.toLocaleString()}
      </Text>
      <Text style={[styles.priceCurrency, { color: t.textMuted }]}>
        {translate('submitQuote.da')}
      </Text>
    </View>
  )

  const condPart = (
    <View style={[styles.condChip, { backgroundColor: t.accent + '10' }]}>
      <Text style={[styles.condChipText, { color: t.accent }]}>
        {quote.condition === 'new'
          ? translate('submitQuote.conditionNew')
          : translate('submitQuote.conditionUsed')}
      </Text>
    </View>
  )

  const priceContent = isOwn ? (
    <View>
      <View
        noFlip
        style={[
          styles.ownPriceRow,
          { backgroundColor: t.bgMuted, borderColor: t.border },
        ]}
      >
        {isRTL ? condPart : pricePart}
        {isRTL ? pricePart : condPart}
        {quote.warranty && (
          <View style={[styles.warrantyChip, { flexDirection: 'row' }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={11}
              color={C.won}
            />
            <Text style={[styles.warrantyText, { color: t.textMuted }]}>
              {quote.warranty}
            </Text>
          </View>
        )}
      </View>

      {/* Edit / Withdraw */}
      <View style={[styles.ownActions, { flexDirection: 'row' }]}>
        <Pressable
          onPress={onEdit}
          disabled={isLocked}
          style={({ pressed }) => [
            styles.editBtn,
            { backgroundColor: isLocked ? t.bgMuted : t.accent },
            pressed && !isLocked && { opacity: 0.85 },
          ]}
        >
          <Ionicons
            name="pencil-outline"
            size={13}
            color={isLocked ? t.textMuted : t.accentFg}
          />
          <Text
            style={[
              styles.editBtnText,
              { color: isLocked ? t.textMuted : t.accentFg },
            ]}
          >
            {translate('submitQuote.edit')}
          </Text>
        </Pressable>
        <Pressable
          onPress={onWithdraw}
          disabled={isLocked}
          style={({ pressed }) => [
            styles.withdrawBtn,
            { borderColor: isLocked ? t.border : t.border },
            pressed && !isLocked && { opacity: 0.7 },
          ]}
        >
          <Ionicons
            name="close-outline"
            size={13}
            color={isLocked ? t.textSubtle + '50' : t.textMuted}
          />
          <Text
            style={[
              styles.withdrawBtnText,
              { color: isLocked ? t.textSubtle + '50' : t.textMuted },
            ]}
          >
            {translate('submitQuote.withdraw')}
          </Text>
        </Pressable>
      </View>

      {/* Locked callout */}
      {isLocked && (
        <View
          style={[
            styles.lockedCallout,
            {
              backgroundColor: C.pending + '10',
              borderColor: C.pending + '20',
            },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={12}
            color={C.pending}
          />
          <Text style={[styles.lockedCalloutText, { color: C.pending }]}>
            {quote.status === 'accepted'
              ? translate('submitQuote.lockedInDiscussion')
              : translate('submitQuote.lockedCannotEdit')}
          </Text>
        </View>
      )}
    </View>
  ) : (
    <View
      dir="ltr"
      style={[
        styles.maskedRow,
        { backgroundColor: t.bgMuted, borderColor: t.border },
      ]}
    >
      <Text style={[styles.maskedPrice, { color: t.textSubtle }]}>
        ••••
      </Text>
      <Text style={[styles.priceCurrency, { color: t.textSubtle + '60' }]}>
        DA
      </Text>
      <Text style={[styles.maskedMeta, { color: t.textSubtle + '50' }]}>
        · •••• · ••••
      </Text>
    </View>
  )

  const statusRow = (
    <View style={[styles.quoteRowTop, { flexDirection: 'row' }]}>
      <View
        style={[
          styles.rankBadge,
          { backgroundColor: isOwn ? t.accent : rankStyle(rank).bg },
        ]}
      >
        <Text
          style={[
            styles.rankText,
            { color: isOwn ? t.accentFg : rankStyle(rank).text },
          ]}
        >
          #{rank}
        </Text>
      </View>

      <View style={[styles.statusChip, { backgroundColor: statusBg }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusChipText, { color: statusTextColor }]}>
          {quoteStatusLabel(quote.status, translate)}
        </Text>
      </View>

      {isOwn && (
        <View
          style={[
            styles.ownBadge,
            {
              backgroundColor: t.accent + '12',
              borderColor: t.accent + '25',
            },
          ]}
        >
          <Text style={[styles.ownBadgeText, { color: t.accent }]}>
            {translate('submitQuote.myOffer')}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.quoteTime,
          {
            color: t.textSubtle,
            marginLeft: 'auto',
          },
        ]}
      >
        {timeAgo(quote.createdAt)}
      </Text>
    </View>
  )

  return (
    <View
      style={[
        styles.quoteRow,
        {
          backgroundColor: isOwn ? t.accent + '06' : t.surface,
          borderColor: isOwn ? t.accent + '30' : t.border,
          borderLeftWidth: isOwn ? 3 : 0,
          borderLeftColor: isOwn ? t.accent : 'transparent',
        },
      ]}
    >
      {isRTL ? (
        <>
          {priceContent}
          {statusRow}
        </>
      ) : (
        <>
          {statusRow}
          {priceContent}
        </>
      )}
    </View>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function SubmitQuoteScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SellerQuotesStackParamList>>()
  const route = useRoute<any>()
  const params = route.params as {
    request: OpenRequestRow
    existingQuote: ExistingQuoteData | null
    initialTab?: Tab
    sellerId: string
  }
  const { request, existingQuote, initialTab, sellerId } = params
  const insets = useSafeAreaInsets()
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const queryClient = useQueryClient()
  const user = useUserStore((s) => s.user)
  const { width: windowWidth } = useWindowDimensions()
  const heroImageWidth = windowWidth - spacing.lg * 2

  const [activeTab, setActiveTab] = useState<Tab>(initialTab ?? 'details')
  const [imageIndex, setImageIndex] = useState(0)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editQuote, setEditQuote] = useState<any>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const tabSlide = useRef(new Animated.Value(0)).current
  const heroRef = useRef<RNScrollView>(null)
  const segWidth = useRef(0)
  const formRef = useRef<SellerQuoteFormHandle>(null)

  const {
    data: anonymousQuotes = [],
    isLoading: quotesLoading,
    refetch: refetchQuotes,
  } = useQuery({
    queryKey: ['anonymous-quotes', request.id],
    queryFn: () => fetchAnonymousQuotes(request.id),
    enabled: !!request.id,
  })

  const images = request.imageUrls ?? []
  const isEditing = editing || !!editQuote || !!existingQuote
  const orderedTabs = isRTL ? [...TABS].reverse() : TABS

  // ── Tab navigation ──

  function syncSlider(tab: Tab) {
    const renderIdx = orderedTabs.indexOf(tab)
    tabSlide.setValue(
      segWidth.current > 0
        ? (renderIdx * segWidth.current) / orderedTabs.length
        : 0,
    )
  }

  function switchTab(tab: Tab, renderIdx: number) {
    setActiveTab(tab)
    Animated.spring(tabSlide, {
      toValue:
        segWidth.current > 0
          ? (renderIdx * segWidth.current) / orderedTabs.length
          : 0,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start()
  }

  useEffect(() => {
    syncSlider(activeTab)
  }, [isRTL])

  // ── Quote actions ──

  async function invalidateParentQueries() {
    await queryClient.invalidateQueries({
      queryKey: ['anonymous-quotes', request.id],
    })
    await queryClient.refetchQueries({
      queryKey: ['open-requests'],
      type: 'all',
    })
    await queryClient.refetchQueries({
      queryKey: ['seller-quotes'],
      type: 'all',
    })
  }

  async function handleSubmitSuccess() {
    setEditQuote(null)
    await invalidateParentQueries()
    navigation.goBack()
  }

  async function handleWithdrawConfirm() {
    const target = editQuote || existingQuote
    if (!target) return
    setShowWithdrawConfirm(false)
    setActionLoading('withdraw')
    try {
      await retractQuoteFn(target.id)
      await invalidateParentQueries()
      setShowWithdrawSuccess(true)
    } catch (err: any) {
      setErrorMessage(err?.message || translate('common.somethingWentWrong'))
      setShowError(true)
    } finally {
      setActionLoading(null)
    }
  }

  // ── Image carousel ──

  const heroScrollEnd = useCallback((e: any) => {
    const idx = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    )
    setImageIndex(idx)
  }, [])

  // ── Tab labels ──

  const tabLabels: Record<Tab, string> = {
    details: translate('submitQuote.details'),
    quotes: translate('submitQuote.quotes'),
    offer: isEditing
      ? translate('submitQuote.editMyOffer')
      : translate('submitQuote.myOffer'),
  }

  // ── Quote stats ──

  const totalQuotes = (anonymousQuotes as any[]).length
  const pendingCount = (anonymousQuotes as any[]).filter(
    (q) => q.status === 'pending' || q.status === 'submitted',
  ).length
  const acceptedCount = (anonymousQuotes as any[]).filter(
    (q) => q.status === 'accepted',
  ).length

  const sortedQuotes = [...(anonymousQuotes as any[])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // ─── Offer tab ───────────────────────────────────────────────────────────────

  const offerContent = (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.tabContentInner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Context strip */}
        <View
          style={[
            styles.contextStrip,
            {
              backgroundColor: t.bgMuted,
              borderColor: t.border,
              borderLeftWidth: 3,
              borderLeftColor: t.accent,
              flexDirection: 'row',
            },
          ]}
        >
          <View
            style={[
              styles.contextIconBox,
              { backgroundColor: t.accent + '12' },
            ]}
          >
            <Ionicons name="cube-outline" size={18} color={t.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.contextPartName, { color: t.text }]}
              numberOfLines={1}
            >
              {request.partName}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
              <Text style={[styles.contextMeta, { color: t.textMuted }]}>
                {request.vehicleBrand}
                {request.modelYear ? ` · ${request.modelYear}` : ''}
              </Text>
              {request.oemNumber && (
                <>
                  <Text
                    style={[styles.contextMetaDot, { color: t.textSubtle }]}
                  >
                    ·
                  </Text>
                  <Text style={[styles.contextMeta, { color: t.textMuted }]}>
                    {request.oemNumber}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Offer form (without submit button) */}
        <View style={styles.offerFormWrap}>
          <Text style={[styles.offerSectionLabel, { color: t.textSubtle }]}>
            {isEditing
              ? translate('submitQuote.editQuoteTitle')
              : translate('submitQuote.submitQuoteTitle')}
          </Text>
          <SellerQuoteForm
            ref={formRef}
            requestId={request.id}
            sellerId={sellerId || user?.id || ''}
            existingQuote={editQuote || existingQuote}
            onSuccess={handleSubmitSuccess}
            onRequestCredits={() => navigation.navigate('Credits')}
            hideSubmit
            onSubmittingChange={setFormSubmitting}
          />
        </View>
      </ScrollView>

      {/* Sticky submit bar */}
      <View
        style={[
          styles.stickySubmitBar,
          { backgroundColor: t.surface, borderTopColor: t.border },
        ]}
      >
        <Pressable
          onPress={() => formRef.current?.submit()}
          disabled={formSubmitting}
          style={({ pressed }) => [
            styles.stickySubmitBtn,
            { backgroundColor: t.accent },
            formSubmitting && { opacity: 0.6 },
            pressed && !formSubmitting && { opacity: 0.85 },
          ]}
        >
          {formSubmitting ? (
            <ActivityIndicator size="small" color={t.accentFg} />
          ) : (
            <View style={styles.stickySubmitInner}>
              <Ionicons name="sparkles" size={16} color={t.accentFg} />
              <Text style={styles.stickySubmitText}>
                {isEditing
                  ? translate('submitQuote.editQuote')
                  : translate('submitQuote.submitQuote')}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  )

  // ─── Details tab ─────────────────────────────────────────────────────────────

  const infoSpecs = [
    {
      icon: 'car-sport-outline' as const,
      label: translate('submitQuote.vehicle'),
      value: [request.vehicleBrand, request.modelYear]
        .filter(Boolean)
        .join(' · '),
      imageUrl: request.brand?.imageUrl ?? null,
    },
    request.oemNumber
      ? {
          icon: 'barcode-outline' as const,
          label: translate('submitQuote.oemNumber'),
          value: request.oemNumber,
          imageUrl: null,
        }
      : null,
    request.category
      ? {
          icon: 'grid-outline' as const,
          label: translate('submitQuote.category'),
          value: tCategory(request.category.name, translate),
          imageUrl: request.category.imageUrl ?? null,
        }
      : null,
    request.brand?.brand
      ? {
          icon: 'pricetag-outline' as const,
          label: translate('submitQuote.partBrand'),
          value: request.brand.brand,
          imageUrl: null,
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: keyof typeof Ionicons.glyphMap
    label: string
    value: string
    imageUrl: string | null
  }>

  const detailsContent = (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentInner}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero image carousel */}
      <View style={styles.heroWrap}>
        {images.length > 0 ? (
          <>
            <ScrollView
              ref={heroRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={heroScrollEnd}
              dir="ltr"
              style={styles.heroScroll}
            >
              {images.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={[styles.heroImage, { width: heroImageWidth }]}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View dir="ltr" style={styles.heroDots}>
                {images.map((_, i) => (
                  <Pressable
                    key={i}
                    onPress={() => {
                      setImageIndex(i)
                      heroRef.current?.scrollTo({
                        x: i * heroImageWidth,
                        animated: true,
                      })
                    }}
                    style={[
                      styles.heroDot,
                      {
                        backgroundColor:
                          i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                        width: i === imageIndex ? 24 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
            <View style={[styles.imageCounterBadge, { right: 10 }]}>
              <Text style={styles.imageCounterText}>
                {imageIndex + 1}/{images.length}
              </Text>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: t.bgMuted, borderColor: t.border },
            ]}
          >
            <Ionicons name="image-outline" size={32} color={t.textSubtle} />
            <Text style={[styles.heroPlaceholderText, { color: t.textSubtle }]}>
              {translate('submitQuote.noImages')}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.partName, { color: t.text }]} numberOfLines={3}>
        {request.partName}
      </Text>

      {/* Info grid — card cells with brand/category logos */}
      {infoSpecs.length > 0 && (
        <View style={styles.infoGrid}>
          {infoSpecs.map((spec, i) => (
            <View key={i} style={styles.infoCellWrap}>
              <View
                style={[
                  styles.infoCell,
                  { backgroundColor: t.surface, borderColor: t.border },
                ]}
              >
                <View
                  style={[
                    styles.infoCellIconBox,
                    { backgroundColor: t.accent + '12' },
                  ]}
                >
                  {spec.imageUrl ? (
                    <Image
                      source={{ uri: spec.imageUrl }}
                      style={styles.logoIcon}
                      contentFit="contain"
                    />
                  ) : (
                    <Ionicons name={spec.icon} size={20} color={t.accent} />
                  )}
                </View>
                <Text
                  style={[styles.infoCellLabel, { color: t.textMuted }]}
                  numberOfLines={1}
                >
                  {spec.label}
                </Text>
                <Text
                  style={[styles.infoCellValue, { color: t.text }]}
                  numberOfLines={2}
                >
                  {spec.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Buyer notes — card with accent border */}
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
          <Text style={[styles.notesCardLabel, { color: t.textMuted }]}>
            {translate('submitQuote.buyerNotes')}
          </Text>
          <Text style={[styles.notesCardBody, { color: t.text }]}>
            {request.notes}
          </Text>
        </View>
      )}

      {/* Inline CTA — switch to offer tab */}
      {!editQuote && !existingQuote && (
        <Pressable
          onPress={() => switchTab('offer', orderedTabs.indexOf('offer'))}
          style={({ pressed }) => [
            styles.inlineCta,
            {
              backgroundColor: t.accent + '08',
              borderColor: t.accent + '30',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
            pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
          ]}
        >
          <View
            style={[styles.inlineCtaIconBox, { backgroundColor: t.accent }]}
          >
            <Ionicons name="sparkles" size={16} color={t.accentFg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inlineCtaTitle, { color: t.text }]}>
              {translate('submitQuote.readyToBid')}
            </Text>
            <Text style={[styles.inlineCtaSub, { color: t.textMuted }]}>
              {translate('submitQuote.readyToBidSub')}
            </Text>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={18}
            color={t.accent}
          />
        </Pressable>
      )}
    </ScrollView>
  )

  // ─── Quotes tab ──────────────────────────────────────────────────────────────

  const quotesContent = (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentInner}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats strip */}
      <View
        dir="ltr"
        style={[
          styles.statsStrip,
          {
            backgroundColor: t.bgMuted,
            borderColor: t.border,
            flexDirection: 'row',
          },
        ]}
      >
        <View style={styles.statItem}>
          <View style={[styles.statIconBox, { backgroundColor: t.border }]}>
            <Ionicons name="layers-outline" size={13} color={t.textMuted} />
          </View>
          <Text style={[styles.statValue, { color: t.text }]}>
            {totalQuotes}
          </Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>
            {translate('submitQuote.statTotal')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: t.border }]} />
        <View style={styles.statItem}>
          <View
            style={[styles.statIconBox, { backgroundColor: C.pending + '15' }]}
          >
            <Ionicons name="time-outline" size={13} color={C.pending} />
          </View>
          <Text style={[styles.statValue, { color: C.pending }]}>
            {pendingCount}
          </Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>
            {translate('submitQuote.statPending')}
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: t.border }]} />
        <View style={styles.statItem}>
          <View style={[styles.statIconBox, { backgroundColor: C.won + '15' }]}>
            <Ionicons name="checkmark-circle-outline" size={13} color={C.won} />
          </View>
          <Text style={[styles.statValue, { color: C.won }]}>
            {acceptedCount}
          </Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>
            {translate('submitQuote.statInDiscussion')}
          </Text>
        </View>
      </View>

      {/* Ranked quotes */}
      {quotesLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={t.accent} />
          <Text style={[styles.loadingText, { color: t.textMuted }]}>
            {translate('submitQuote.loadingOffers')}
          </Text>
        </View>
      ) : sortedQuotes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View
            style={[styles.emptyIcon, { backgroundColor: t.accent + '08' }]}
          >
            <Ionicons name="chatbubbles-outline" size={26} color={t.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: t.text }]}>
            {translate('submitQuote.noOffersYet')}
          </Text>
          <Text style={[styles.emptyDesc, { color: t.textMuted }]}>
            {translate('submitQuote.beFirst')}
          </Text>
        </View>
      ) : (
        <View style={styles.quotesList}>
          {sortedQuotes.map((quote: any, i: number) => {
            const isOwn = quote.sellerId === (user?.id ?? sellerId)
            return (
              <QuoteRow
                key={quote.id ?? i}
                quote={quote}
                rank={i + 1}
                isOwn={isOwn}
                isLocked={isOwn && quote.status !== 'pending'}
                onEdit={() => {
                  setEditQuote(quote)
                  switchTab('offer', orderedTabs.indexOf('offer'))
                }}
                onWithdraw={() => {
                  setEditQuote(quote)
                  setShowWithdrawConfirm(true)
                }}
                t={t}
                translate={translate}
                isRTL={isRTL}
              />
            )
          })}
        </View>
      )}
    </ScrollView>
  )

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: t.surface,
            borderBottomColor: t.border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={t.text}
          />
        </Pressable>

        <View
          style={[
            styles.headerCenter,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Text
            style={[styles.headerTitle, { color: t.text }]}
            numberOfLines={1}
          >
            {request.partName}
          </Text>
          {request.isPriority && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>
                {translate('submitQuote.priority')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ width: 32 }} />
      </View>

      {/* Segmented control */}
      <View
        dir="ltr"
        style={[
          styles.segTrack,
          {
            backgroundColor: t.bgMuted,
            borderColor: t.border,
            flexDirection: 'row',
          },
        ]}
        onLayout={(e) => {
          segWidth.current = e.nativeEvent.layout.width
          syncSlider(activeTab)
        }}
      >
        <Animated.View
          style={[
            styles.segSlider,
            {
              backgroundColor: t.surface,
              borderColor: t.border,
              transform: [{ translateX: tabSlide }],
            },
          ]}
        />
        {orderedTabs.map((tab, renderIdx) => {
          const isActive = activeTab === tab
          const sliderTarget = (renderIdx * segWidth.current) / 3
          return (
            <Pressable
              key={tab}
              style={styles.segBtn}
              onPress={() => switchTab(tab, renderIdx)}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {isRTL ? (
                  <>
                    <Text
                      style={[
                        styles.segBtnText,
                        {
                          color: isActive ? t.accent : t.textMuted,
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {tabLabels[tab]}
                    </Text>
                    <Ionicons
                      name={TAB_ICONS[tab]}
                      size={14}
                      color={isActive ? t.accent : t.textSubtle}
                    />
                  </>
                ) : (
                  <>
                    <Ionicons
                      name={TAB_ICONS[tab]}
                      size={14}
                      color={isActive ? t.accent : t.textSubtle}
                    />
                    <Text
                      style={[
                        styles.segBtnText,
                        {
                          color: isActive ? t.accent : t.textMuted,
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {tabLabels[tab]}
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          )
        })}
      </View>

      {/* Tab content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentWrap}
      >
        {activeTab === 'offer' && offerContent}
        {activeTab === 'details' && detailsContent}
        {activeTab === 'quotes' && quotesContent}
      </KeyboardAvoidingView>

      {/* Sticky bottom CTA */}
      {activeTab !== 'offer' && !editQuote && !existingQuote && (
        <View
          style={[
            styles.stickyBar,
            { backgroundColor: t.surface, borderTopColor: t.border },
          ]}
        >
          <View
            style={[
              styles.stickyBarRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.stickyCtaWrap}>
              <Pressable
                onPress={() => switchTab('offer', orderedTabs.indexOf('offer'))}
                style={({ pressed }) => [
                  styles.stickyCta,
                  { backgroundColor: t.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color={t.accentFg}
                />
                <Text style={[styles.stickyCtaText, { color: t.accentFg }]}>
                  {translate('submitQuote.submitOffer')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ── Withdraw confirm overlay ────────────────────────────────────────── */}
      {showWithdrawConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowWithdrawConfirm(false)}
          />
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.overlayIconWrap,
                { backgroundColor: '#d9770612', borderColor: '#d9770625' },
              ]}
            >
              <Ionicons name="trash-outline" size={32} color="#d97706" />
            </View>
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              {translate('submitQuote.withdrawTitle')}
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {translate('submitQuote.withdrawDesc')}
            </Text>
            <View dir="ltr" style={styles.overlayBtns}>
              <Pressable
                onPress={() => setShowWithdrawConfirm(false)}
                style={({ pressed }) => [
                  styles.overlayBtnOutline,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.overlayBtnText, { color: t.textMuted }]}>
                  {translate('submitQuote.keepIt')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleWithdrawConfirm}
                style={({ pressed }) => [
                  styles.overlayBtnFill,
                  { backgroundColor: '#d97706' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.overlayBtnText, { color: '#fff' }]}>
                  {translate('submitQuote.withdraw')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* ── Error overlay ───────────────────────────────────────────────────── */}
      {showError && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => setShowError(false)}
          />
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.overlayIconWrap,
                { backgroundColor: '#dc262612', borderColor: '#dc262625' },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
            </View>
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              {translate('common.error')}
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {errorMessage}
            </Text>
            <Pressable
              onPress={() => setShowError(false)}
              style={({ pressed }) => [
                styles.overlayBtnFill,
                { backgroundColor: '#dc2626' },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.overlayBtnText, { color: '#fff' }]}>
                {translate('common.gotIt')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Withdraw success overlay ────────────────────────────────────────── */}
      {showWithdrawSuccess && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.overlayBackdrop}
            onPress={() => {
              setShowWithdrawSuccess(false)
              navigation.goBack()
            }}
          />
          <View
            style={[
              styles.overlayCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.overlayIconWrap,
                { backgroundColor: '#05966912', borderColor: '#05966925' },
              ]}
            >
              <Ionicons name="checkmark-circle" size={32} color={C.won} />
            </View>
            <Text style={[styles.overlayTitle, { color: t.text }]}>
              {translate('submitQuote.withdrawTitle')}
            </Text>
            <Text style={[styles.overlayDesc, { color: t.textMuted }]}>
              {translate('submitQuote.withdrawDesc')}
            </Text>
            <Pressable
              onPress={() => {
                setShowWithdrawSuccess(false)
                navigation.goBack()
              }}
              style={({ pressed }) => [
                styles.overlayBtnFill,
                { backgroundColor: C.won, width: '100%' },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.overlayBtnText, { color: '#fff' }]}>
                {translate('common.done')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  priorityBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#fff',
  },

  // Segmented control
  segTrack: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    position: 'relative',
  },
  segSlider: {
    position: 'absolute',
    width: '33.33%',
    height: '100%',
    top: 3,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  segBtnText: {
    fontSize: 12,
    letterSpacing: 0.2,
  },

  // Content
  contentWrap: { flex: 1 },
  tabContent: { flex: 1 },
  tabContentInner: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },

  // Offer tab — context strip
  contextStrip: {
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
  },
  contextIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextPartName: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  contextMeta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  contextMetaDot: {
    fontSize: 12,
    fontWeight: '700',
  },
  offerFormWrap: {
    gap: spacing.md,
  },
  offerSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Details tab — hero
  heroWrap: {
    width: '100%',
    height: SCREEN_WIDTH * 0.62,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroScroll: { flex: 1 },
  heroImage: { height: '100%' },
  heroDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  heroDot: { height: 8, borderRadius: 4 },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  heroPlaceholderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  partName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  logoIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },

  // Info grid — card cells (matching buyer request details)
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  infoCellWrap: { width: '50%', paddingHorizontal: 5, paddingBottom: 10 },
  infoCell: {
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
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
  infoCellIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  infoCellLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  infoCellValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 19,
    textAlign: 'center',
  },
  notesCard: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 3.5,
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  notesCardLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  notesCardBody: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Inline CTA at bottom of details tab
  inlineCta: {
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  inlineCtaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCtaTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  inlineCtaSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },

  // Quotes tab — stats strip
  statsStrip: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    marginHorizontal: spacing.sm,
  },

  // Notice

  // Loading / empty
  loadingWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingText: { fontSize: 13, fontWeight: '500' },
  emptyWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Quote rows
  quotesList: { gap: spacing.sm },
  quoteRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  quoteRowTop: { alignItems: 'center', gap: 7 },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 10, fontWeight: '900' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  ownBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  ownBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quoteTime: { fontSize: 10, fontWeight: '500' },

  // Locked callout
  lockedCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
  },
  lockedCalloutText: { fontSize: 11, fontWeight: '600', flex: 1 },

  // Own quote price row
  ownPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  ownPrice: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  priceCurrency: { fontSize: 12, fontWeight: '700' },
  condChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  condChipText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  warrantyChip: { alignItems: 'center', gap: 3 },
  warrantyText: { fontSize: 11, fontWeight: '500' },

  // Masked row (other sellers)
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  maskedPrice: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  maskedMeta: { fontSize: 12, fontWeight: '500', letterSpacing: 1 },

  // Own offer actions
  ownActions: { gap: spacing.sm, marginTop: 2 },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: '700' },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  withdrawBtnText: { fontSize: 13, fontWeight: '600' },

  // Sticky bottom bar
  stickyBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickyBarRow: { alignItems: 'center' },
  stickyCtaWrap: { flex: 1 },
  stickyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stickyCtaText: { fontSize: 14, fontWeight: '800' },
  stickySubmitBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stickySubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stickySubmitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  stickySubmitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Overlays
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayCard: {
    position: 'absolute',
    top: '50%',
    left: spacing.xl,
    right: spacing.xl,
    transform: [{ translateY: -110 }],
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  overlayIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  overlayTitle: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  overlayDesc: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
  },
  overlayBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    width: '100%',
  },
  overlayBtnOutline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  overlayBtnFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  overlayBtnText: { fontSize: 14, fontWeight: '700' },
})
