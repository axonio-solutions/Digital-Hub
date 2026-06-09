import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native'
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  View,
  useIsRTL,
} from 'expo-rtl'
import { Image } from 'expo-image'

import {
  acceptQuoteFn,
  cancelRequestFn,
  deleteRequestFn,
  fulfillRequestFn,
  rejectQuoteFn,
  reopenRequestFn,
  revokeQuoteFn,
  unrejectQuoteFn,
} from '../lib/api-client'
import { buyerRequestDetailQueryOptions } from '../features/buyer/queries/requests'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { Theme } from '../theme/tokens'
import type { BuyerRequestRow, Quote } from '../types/buyer'
import type { BuyerHomeStackParamList } from '../navigation/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { tCategory } from '../utils/category-utils'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Status config factories ───────────────────────────────────────────────────

type RequestStatus = 'open' | 'fulfilled' | 'cancelled'
type RequestAction = 'edit' | 'fulfill' | 'close' | 'reopen' | 'delete'
type QuoteAction = 'accept' | 'reject' | 'contact' | 'revoke' | 'unreject'

const REQUEST_ACTIONS: Record<RequestStatus, RequestAction[]> = {
  open: ['edit', 'close', 'delete'],
  fulfilled: [],
  cancelled: ['reopen', 'delete'],
}

const QUOTE_ACTIONS: Record<RequestStatus, Record<string, QuoteAction[]>> = {
  open: {
    pending: ['accept', 'reject'],
    accepted: ['contact', 'reject', 'revoke'],
    rejected: ['unreject'],
  },
  fulfilled: {
    pending: [],
    accepted: ['contact'],
    rejected: [],
  },
  cancelled: {
    pending: [],
    accepted: ['contact'],
    rejected: [],
  },
}

const QUOTE_DISABLED_REASON = (
  t: (k: string) => string,
): Record<RequestStatus, string | undefined> => ({
  open: undefined,
  fulfilled: t('requestDetails.fulfilled'),
  cancelled: t('requestDetails.cancelled'),
})

const QUOTE_ACTION_BTN = (
  t: (k: string) => string,
): Record<
  QuoteAction,
  {
    label: string
    icon: keyof typeof Ionicons.glyphMap
    variant: 'primary' | 'outline' | 'whatsapp'
    handler: (ctx: {
      quote: Quote
      requestStatus: string
      onAccept: (id: string) => void
      onReject: (id: string) => void
      onRevoke: (id: string) => void
      onUnreject: (id: string) => void
      onContact: (seller: Quote['seller']) => void
    }) => void
  }
> => ({
  accept: {
    label: t('requestDetails.accept'),
    icon: 'checkmark-circle-outline',
    variant: 'primary',
    handler: ({ quote, onAccept }) => onAccept(quote.id),
  },
  reject: {
    label: t('requestDetails.reject'),
    icon: 'close-circle-outline',
    variant: 'outline',
    handler: ({ quote, onReject }) => onReject(quote.id),
  },
  contact: {
    label: t('requestDetails.contact'),
    icon: 'logo-whatsapp',
    variant: 'whatsapp',
    handler: ({ quote, onContact }) => onContact(quote.seller),
  },
  revoke: {
    label: t('requestDetails.revoke'),
    icon: 'arrow-undo-outline',
    variant: 'outline',
    handler: ({ quote, onRevoke }) => onRevoke(quote.id),
  },
  unreject: {
    label: t('requestDetails.unreject'),
    icon: 'refresh-outline',
    variant: 'outline',
    handler: ({ quote, onUnreject }) => onUnreject(quote.id),
  },
})

function statusConfig(t: Theme, translate?: (k: string) => string) {
  const tr = translate || ((s: string) => s)
  return {
    open: {
      label: tr('requests.status.open'),
      color: t.success,
      bg: `${t.success}14`,
    },
    fulfilled: {
      label: tr('requests.status.fulfilled'),
      color: '#D97706',
      bg: '#D9770614',
    },
    cancelled: {
      label: tr('requests.status.cancelled'),
      color: t.danger,
      bg: t.dangerBg,
    },
  }
}

function quoteStatusConfig(t: Theme, translate?: (k: string) => string) {
  const tr = translate || ((s: string) => s)
  return {
    pending: {
      label: tr('quotes.status.pending'),
      color: '#D97706',
      bg: '#D9770614',
    },
    accepted: {
      label: tr('requestDetails.accepted'),
      color: t.success,
      bg: `${t.success}14`,
    },
    rejected: {
      label: tr('requestDetails.rejected'),
      color: t.danger,
      bg: t.dangerBg,
    },
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface RequestDetailsScreenProps {
  requestId?: string
  onBack?: () => void
  onEdit?: (id: string, data: BuyerRequestRow) => void
}

export function RequestDetailsScreen({
  requestId: requestIdProp,
  onBack,
  onEdit,
}: RequestDetailsScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<BuyerHomeStackParamList>>()
  const route = useRoute<any>()
  const requestId = requestIdProp ?? route.params?.requestId ?? ''
  const { t: translate } = useTranslation()
  const isRTL = useIsRTL()
  const t = useTheme()
  const s = makeStyles(t)
  const insets = useSafeAreaInsets()

  const queryClient = useQueryClient()
  const { data: request, isLoading } = useQuery(
    buyerRequestDetailQueryOptions(requestId),
  )
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<
    'close' | 'fulfill' | 'reopen' | 'delete' | null
  >(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [contactSeller, setContactSeller] = useState<Quote['seller'] | null>(
    null,
  )
  const [acceptOverlay, setAcceptOverlay] = useState<Quote | null>(null)
  const [showRevokeOverlay, setShowRevokeOverlay] = useState(false)
  const [showRejectOverlay, setShowRejectOverlay] = useState(false)
  const scrollRef = useRef<any>(null)

  const images = request?.imageUrls?.filter(Boolean) || []

  function invalidateRequest() {
    queryClient.invalidateQueries({ queryKey: ['buyer-request', requestId] })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-DZ', {
      day: 'numeric',
      month: 'short',
    })
  }

  async function handleAcceptQuote(quoteId: string) {
    const quoteCopy = request?.quotes?.find((q) => q.id === quoteId) ?? null
    if (!quoteCopy) return
    setActionLoading(`accept-${quoteId}`)
    try {
      await acceptQuoteFn(quoteId)
      setAcceptOverlay(quoteCopy)
    } catch {
      Alert.alert(
        translate('common.error'),
        translate('requestDetails.couldNotAccept'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectQuote(quoteId: string) {
    setActionLoading(`reject-${quoteId}`)
    try {
      await rejectQuoteFn(quoteId)
      setShowRejectOverlay(true)
    } catch {
      Alert.alert(
        translate('common.error'),
        translate('requestDetails.couldNotReject'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRevokeQuote(quoteId: string) {
    setActionLoading(`revoke-${quoteId}`)
    try {
      await revokeQuoteFn(quoteId)
      setShowRevokeOverlay(true)
    } catch {
      Alert.alert(
        translate('common.error'),
        translate('requestDetails.couldNotRevoke'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  function confirmFulfill() {
    setConfirmAction('fulfill')
  }

  async function handleUnrejectQuote(quoteId: string) {
    setActionLoading(`unreject-${quoteId}`)
    try {
      await unrejectQuoteFn(quoteId)
      invalidateRequest()
    } catch {
      Alert.alert(
        translate('common.error'),
        translate('requestDetails.couldNotUnreject'),
      )
    } finally {
      setActionLoading(null)
    }
  }

  function confirmCancel() {
    setConfirmAction('close')
  }

  function confirmReopen() {
    setConfirmAction('reopen')
  }

  function confirmDelete() {
    setConfirmAction('delete')
  }

  async function executeConfirmedAction() {
    if (!confirmAction) return
    setConfirmLoading(true)
    try {
      switch (confirmAction) {
        case 'close':
          await cancelRequestFn(requestId)
          invalidateRequest()
          break
        case 'fulfill':
          await fulfillRequestFn(requestId)
          invalidateRequest()
          break
        case 'reopen':
          await reopenRequestFn(requestId)
          invalidateRequest()
          break
        case 'delete':
          await deleteRequestFn(requestId)
          onBack?.() ?? navigation.goBack()
          break
      }
      setConfirmAction(null)
    } catch (e: any) {
      setConfirmAction(null)
      Alert.alert(
        translate('common.error'),
        e?.message || translate('requestDetails.actionFailed'),
      )
    } finally {
      setConfirmLoading(false)
    }
  }

  const topInset = insets.top

  const sCfg = statusConfig(t, translate)[request?.status || 'open'] ?? {
    label: request?.status || '',
    color: t.textMuted,
    bg: t.bgMuted,
  }

  const reqStatus = request?.status as RequestStatus | undefined
  const isOpen = reqStatus === 'open'
  const isCancelled = reqStatus === 'cancelled'
  const hasAcceptedQuote =
    request?.quotes?.some((q) => q.status === 'accepted') ?? false

  function getRequestActions(
    reqStatus: RequestStatus,
    accepted: boolean,
  ): RequestAction[] {
    if (reqStatus === 'open') {
      return accepted
        ? ['fulfill', 'close']
        : ['edit', 'close', 'delete']
    }
    return REQUEST_ACTIONS[reqStatus] ?? []
  }

  const requestActions = reqStatus
    ? getRequestActions(reqStatus, hasAcceptedQuote)
    : []

  if (!request && !isLoading) {
    return (
      <View style={[s.root, s.center]}>
        <StatusBar barStyle="dark-content" />
        <Text style={s.notFoundText}>
          {translate('requestDetails.notFound')}
        </Text>
        <Pressable
          onPress={() => {
            onBack?.() ?? navigation.goBack()
          }}
          style={s.notFoundBack}
        >
          <Text style={s.notFoundBackText}>{translate('common.back')}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header bar ───────────────────────────────────────── */}
      <View style={[s.headerBar, { paddingTop: topInset }]}>
        <Pressable
          onPress={() => {
            onBack?.() ?? navigation.goBack()
          }}
          hitSlop={10}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel={translate('common.back')}
        >
          <View style={s.backIconBox}>
            <Ionicons name="chevron-back" size={18} color={t.accent} />
          </View>
        </Pressable>
      </View>

      {/* ── Scroll content ───────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Image carousel */}
        {isLoading ? (
          <SkeletonImage />
        ) : images.length > 0 ? (
          <View style={s.imageSection}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                )
                setImageIndex(idx)
              }}
            >
              {images.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={s.image}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            {images.length > 1 && (
              <View style={s.dotsRow}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      s.dot,
                      i === imageIndex ? s.dotActive : s.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}

            {images.length > 1 && (
              <View style={s.imageCounter}>
                <Text style={s.imageCounterText}>
                  {imageIndex + 1}/{images.length}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={s.imagePlaceholder}>
            <View style={s.imagePlaceholderIconBox}>
              <Ionicons name="car-sport-outline" size={32} color={t.accent} />
            </View>
          </View>
        )}

        <View style={s.content}>
          {isLoading ? (
            <SkeletonContent />
          ) : request ? (
            <>
              {/* ── Title row ──────────────────────────────────── */}
              <View style={s.titleRow}>
                <Text style={s.partName} numberOfLines={2}>
                  {request.partName}
                </Text>
                <View style={[s.statusBadge, { backgroundColor: sCfg.bg }]}>
                  <View
                    style={[s.statusDot, { backgroundColor: sCfg.color }]}
                  />
                  <Text style={[s.statusLabel, { color: sCfg.color }]}>
                    {sCfg.label}
                  </Text>
                </View>
              </View>

              {/* ── Info grid ──────────────────────────────────── */}
              <View style={s.infoGrid}>
                <InfoGridCell
                  icon="calendar-outline"
                  label={translate('requestDetails.posted')}
                  value={formatDate(request.createdAt)}
                />
                <InfoGridLogoCell
                  imageUrl={request.brand?.imageUrl}
                  fallbackIcon="car-sport-outline"
                  label={translate('requestDetails.vehicle')}
                  value={`${request.vehicleBrand}${request.modelYear ? ` ${request.modelYear}` : ''}`}
                />
                {request.brand?.clusterRegion && (
                  <InfoGridCell
                    icon="location-outline"
                    label={translate('requestDetails.location')}
                    value={request.brand.clusterRegion}
                  />
                )}
                {request.category?.name && (
                  <InfoGridLogoCell
                    imageUrl={request.category?.imageUrl}
                    fallbackIcon="pricetag-outline"
                    label={translate('requestDetails.category')}
                    value={tCategory(request.category, translate)}
                  />
                )}
                {request.oemNumber && (
                  <InfoGridCell
                    icon="document-text-outline"
                    label={translate('requestDetails.oem')}
                    value={request.oemNumber}
                  />
                )}
              </View>

              {/* ── Notes ─────────────────────────────────────── */}
              {request.notes ? (
                <View style={s.notesCard}>
                  <Text style={s.notesLabel}>
                    {translate('requestDetails.notes')}
                  </Text>
                  <Text style={s.notesBody}>{request.notes}</Text>
                </View>
              ) : null}

              {/* ── Quotes section ────────────────────────────── */}
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>
                  {translate('requestDetails.offers')}
                </Text>
                {(request.quotes?.length ?? 0) > 0 && (
                  <View style={s.sectionPill}>
                    <Text style={s.sectionPillText}>
                      {request.quotes.length}
                    </Text>
                  </View>
                )}
              </View>

              {request.quotes && request.quotes.length > 0 ? (
                <View style={s.quoteList}>
                  {[...request.quotes]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((q) => (
                      <QuoteCard
                        key={q.id}
                        quote={q}
                        requestStatus={request.status}
                        actionLoading={actionLoading}
                        onAccept={handleAcceptQuote}
                        onReject={handleRejectQuote}
                        onRevoke={handleRevokeQuote}
                        onUnreject={handleUnrejectQuote}
                        onContact={setContactSeller}
                        translate={translate}
                      />
                    ))}
                </View>
              ) : (
                <View style={s.noQuotesWrap}>
                  <View style={s.noQuotesIconBox}>
                    <Ionicons
                      name="pricetags-outline"
                      size={24}
                      color={t.textMuted}
                    />
                  </View>
                  <Text style={s.noQuotesText}>
                    {translate('requestDetails.noQuotes')}
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Action bar ───────────────────────────────────────── */}
      <View style={s.actionBar}>
        {isLoading ? (
          <>
            <View style={[s.actionBtnSkeleton, { flex: 1 }]} />
            <View style={[s.actionBtnSkeleton, { flex: 1 }]} />
          </>
        ) : request ? (
          <>
            {requestActions.includes('edit') && (
              <ActionBtn
                icon="create-outline"
                label={translate('requestDetails.edit')}
                onPress={() => {
                  if (!request) return
                  if (onEdit) {
                    onEdit(requestId, request)
                  } else {
                    navigation.navigate('EditRequest', {
                      buyerId: request.buyerId,
                      requestId,
                      prefetchedRequest: request,
                    })
                  }
                }}
                loading={actionLoading === 'edit'}
                variant="outline"
              />
            )}
            {requestActions.includes('fulfill') && (
              <ActionBtn
                icon="checkmark-circle-outline"
                label={translate('requestDetails.fulfill')}
                onPress={confirmFulfill}
                loading={false}
                variant="success"
              />
            )}
            {requestActions.includes('close') && (
              <ActionBtn
                icon="close-circle-outline"
                label={translate('requestDetails.close')}
                onPress={confirmCancel}
                loading={false}
                variant="danger"
              />
            )}
            {requestActions.includes('reopen') && (
              <ActionBtn
                icon="refresh-outline"
                label={translate('requestDetails.reopen')}
                onPress={confirmReopen}
                loading={actionLoading === 'reopen'}
                variant="primary"
              />
            )}
            {requestActions.includes('delete') && (
              <ActionBtn
                icon="trash-outline"
                label={translate('requestDetails.delete')}
                onPress={confirmDelete}
                loading={actionLoading === 'delete'}
                variant="danger"
              />
            )}
          </>
        ) : null}
      </View>

      {/* ── Contact modal ────────────────────────────────────── */}
      <ContactSellerModal
        visible={!!contactSeller}
        seller={contactSeller}
        partName={request?.partName || ''}
        onClose={() => setContactSeller(null)}
        translate={translate}
      />

      {acceptOverlay && (
        <AcceptSuccessOverlay
          quote={acceptOverlay}
          partName={request?.partName || ''}
          onClose={() => {
            setAcceptOverlay(null)
            invalidateRequest()
          }}
          translate={translate}
        />
      )}
      {showRevokeOverlay && (
        <RevokeOverlay
          onClose={() => {
            setShowRevokeOverlay(false)
            invalidateRequest()
          }}
          translate={translate}
        />
      )}
      {showRejectOverlay && (
        <RejectOverlay
          onClose={() => {
            setShowRejectOverlay(false)
            invalidateRequest()
          }}
          translate={translate}
        />
      )}
      {confirmAction && (
        <RequestConfirmOverlay
          action={confirmAction}
          loading={confirmLoading}
          onConfirm={executeConfirmedAction}
          onDismiss={() => {
            if (!confirmLoading) setConfirmAction(null)
          }}
          translate={translate}
        />
      )}
    </View>
  )
}

// ── InfoGridCell ─────────────────────────────────────────────────────────────

function InfoGridCell({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  return (
    <View style={s.infoCellWrap}>
      <View style={s.infoCell}>
        <View style={s.infoCellIconBox}>
          <Ionicons name={icon} size={20} color={t.accent} />
        </View>
        <Text style={s.infoCellLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={s.infoCellValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  )
}

function InfoGridLogoCell({
  imageUrl,
  fallbackIcon,
  label,
  value,
}: {
  imageUrl: string | null | undefined
  fallbackIcon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  return (
    <View style={s.infoCellWrap}>
      <View style={s.infoCell}>
        <View style={s.infoCellIconBox}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={s.logoIcon}
              contentFit="cover"
            />
          ) : (
            <Ionicons name={fallbackIcon} size={20} color={t.accent} />
          )}
        </View>
        <Text style={s.infoCellLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={s.infoCellValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  )
}

// ── QuoteCard ─────────────────────────────────────────────────────────────────

interface QuoteCardProps {
  quote: Quote
  requestStatus: string
  actionLoading: string | null
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onRevoke: (id: string) => void
  onUnreject: (id: string) => void
  onContact: (seller: Quote['seller']) => void
}

function QuoteCard({
  quote,
  requestStatus,
  actionLoading,
  onAccept,
  onReject,
  onRevoke,
  onUnreject,
  onContact,
  translate,
}: QuoteCardProps & { translate: (k: string) => string }) {
  const t = useTheme()
  const s = makeStyles(t)
  const isRTL = useIsRTL()
  const qCfg = quoteStatusConfig(t, translate)[quote.status] ?? {
    label: quote.status,
    color: t.textMuted,
    bg: t.bgMuted,
  }

  const storeName =
    quote.seller?.storeName ||
    quote.seller?.name ||
    translate('requestDetails.unknownSeller')
  const isNew = quote.condition === 'new'
  const qActions =
    QUOTE_ACTIONS[requestStatus as RequestStatus]?.[quote.status] ?? []
  const quoteDisabledReason =
    QUOTE_DISABLED_REASON(translate)[requestStatus as RequestStatus]

  return (
    <View
      style={[
        s.quoteCard,
        { borderLeftWidth: 3.5, borderLeftColor: qCfg.color },
      ]}
    >
      {/* Seller header */}
      <View style={s.quoteHeader}>
        <View style={s.sellerRow}>
          <View style={[s.sellerAvatar, { backgroundColor: qCfg.color }]}>
            <Text style={s.sellerAvatarText}>
              {storeName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sellerName} numberOfLines={1}>
              {storeName}
            </Text>
            {quote.seller?.wilaya && (
              <Text style={s.sellerLocation}>{quote.seller.wilaya}</Text>
            )}
          </View>
        </View>

        <View style={[s.qStatusBadge, { backgroundColor: qCfg.bg }]}>
          {quote.status === 'accepted' && (
            <Ionicons name="checkmark-circle" size={11} color={qCfg.color} />
          )}
          {quote.status === 'rejected' && (
            <Ionicons name="close-circle" size={11} color={qCfg.color} />
          )}
          <Text style={[s.qStatusLabel, { color: qCfg.color }]}>
            {qCfg.label}
          </Text>
        </View>
      </View>

      {/* Price band */}
      <View
        noFlip
        style={[
          s.priceBand,
          {
            backgroundColor: `${qCfg.color}0A`,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <Text style={[s.priceValue, { color: qCfg.color }]}>
          {quote.price.toLocaleString('en-DZ')}
        </Text>
        <Text style={[s.priceCurrency, { color: `${qCfg.color}99` }]}>DZD</Text>
      </View>

      {/* Details grid */}
      <View style={s.detailsGrid}>
        <DetailChip
          icon={isNew ? 'sparkles-outline' : 'refresh-circle-outline'}
          label={translate('requestDetails.condition')}
          value={
            isNew
              ? translate('requestDetails.new')
              : translate('requestDetails.used')
          }
          accent={isNew ? t.success : '#D97706'}
        />
        {quote.seller?.wilaya && (
          <DetailChip
            icon="location-outline"
            label={translate('requestDetails.location')}
            value={quote.seller.wilaya}
          />
        )}
        {quote.warranty && (
          <DetailChip
            icon="shield-checkmark-outline"
            label={translate('requestDetails.warranty')}
            value={quote.warranty}
            accent={t.success}
          />
        )}
        <DetailChip
          icon="time-outline"
          label={translate('requestDetails.submitted')}
          value={new Date(quote.createdAt).toLocaleDateString('en-DZ', {
            day: 'numeric',
            month: 'short',
          })}
        />
      </View>

      {/* Actions — driven by matrix */}
      <View style={s.quoteActions}>
        {qActions.length > 0 ? (
          qActions.map((action) => {
            const cfg = QUOTE_ACTION_BTN(translate)[action]
            return (
              <QuoteActionBtn
                key={action}
                label={cfg.label}
                icon={cfg.icon}
                loading={actionLoading === `${action}-${quote.id}`}
                onPress={() =>
                  cfg.handler({
                    quote,
                    requestStatus,
                    onAccept,
                    onReject,
                    onRevoke,
                    onUnreject,
                    onContact,
                  })
                }
                variant={cfg.variant}
              />
            )
          })
        ) : quoteDisabledReason ? (
          <View style={s.disabledBadge}>
            <Text style={s.disabledBadgeText}>{quoteDisabledReason}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function DetailChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  accent?: string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  return (
    <View style={s.detailChip}>
      <Ionicons name={icon} size={12} color={accent ?? t.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={s.detailChipLabel}>{label}</Text>
        <Text style={s.detailChipValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

// ── QuoteActionBtn ────────────────────────────────────────────────────────────

function QuoteActionBtn({
  label,
  icon,
  loading,
  onPress,
  variant,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  loading: boolean
  onPress: () => void
  variant: 'primary' | 'outline' | 'whatsapp'
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const isRTL = useIsRTL()
  const pressScale = useRef(new Animated.Value(1)).current

  const bg =
    variant === 'whatsapp'
      ? '#25D366'
      : variant === 'primary'
        ? t.accent
        : 'transparent'
  const fg = variant === 'outline' ? t.accent : '#fff'
  const border = variant === 'outline' ? t.border : 'transparent'

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      onPressIn={() =>
        Animated.spring(pressScale, {
          toValue: 0.96,
          stiffness: 400,
          damping: 20,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, {
          toValue: 1,
          stiffness: 400,
          damping: 20,
          useNativeDriver: true,
        }).start()
      }
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          s.quoteActionBtn,
          {
            backgroundColor: bg,
            borderColor: border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            transform: [{ scale: pressScale }],
          },
          loading && { opacity: 0.6 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <Ionicons name={icon} size={16} color={fg} />
        )}
        <Text style={[s.quoteActionText, { color: fg }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  )
}

// ── ActionBtn (bottom bar) ────────────────────────────────────────────────────

function ActionBtn({
  icon,
  label,
  loading,
  onPress,
  variant,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  loading: boolean
  onPress: () => void
  variant: 'primary' | 'outline' | 'danger' | 'success'
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const isRTL = useIsRTL()
  const pressScale = useRef(new Animated.Value(1)).current

  const bg =
    variant === 'primary'
      ? t.accent
      : variant === 'danger'
        ? t.danger
        : variant === 'success'
          ? t.success
          : 'transparent'
  const fg = variant === 'outline' ? t.accent : '#fff'
  const border =
    variant === 'outline'
      ? t.border
      : variant === 'danger'
        ? t.danger
        : variant === 'success'
          ? t.success
          : 'transparent'

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      onPressIn={() =>
        Animated.spring(pressScale, {
          toValue: 0.96,
          stiffness: 400,
          damping: 22,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(pressScale, {
          toValue: 1,
          stiffness: 400,
          damping: 22,
          useNativeDriver: true,
        }).start()
      }
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          s.actionBtn,
          {
            backgroundColor: bg,
            borderColor: border,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            transform: [{ scale: pressScale }],
          },
          loading && { opacity: 0.6 },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={fg} />
        ) : (
          <Ionicons name={icon} size={18} color={fg} />
        )}
        <Text style={[s.actionBtnText, { color: fg }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  )
}

// ── ContactSellerModal ────────────────────────────────────────────────────────

function ContactSellerModal({
  visible,
  seller,
  partName,
  onClose,
  translate,
}: {
  visible: boolean
  seller: Quote['seller'] | null
  partName: string
  onClose: () => void
  translate: (k: string) => string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const isRTL = useIsRTL()
  const storeName =
    seller?.storeName || seller?.name || translate('requestDetails.seller')

  function handleWhatsApp() {
    const phone = seller?.whatsappNumber || seller?.phoneNumber
    if (!phone) {
      Alert.alert(
        translate('common.unavailable'),
        translate('requestDetails.noContactNumber'),
      )
      return
    }
    const digits = phone.replace(/\D/g, '')
    const wa = digits.startsWith('213')
      ? digits
      : digits.startsWith('0')
        ? '213' + digits.slice(1)
        : '213' + digits
    const msg = encodeURIComponent(
      `Hi ${storeName}, I'm interested in your quote for "${partName}".`,
    )
    Linking.openURL(`https://wa.me/${wa}?text=${msg}`)
  }

  function handleCall() {
    const phone = seller?.phoneNumber || seller?.whatsappNumber
    if (!phone) {
      Alert.alert(
        translate('common.unavailable'),
        translate('requestDetails.noPhoneNumber'),
      )
      return
    }
    Linking.openURL(`tel:${phone}`)
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable onPress={() => {}} style={s.modalSheet}>
          <View style={s.sheetHandle} />

          <View style={s.sheetHeader}>
            <View style={s.sheetAvatar}>
              <Text style={s.sheetAvatarText}>
                {storeName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={s.sheetStoreName}>{storeName}</Text>
            {seller?.wilaya && (
              <Text style={s.sheetLocation}>{seller.wilaya}</Text>
            )}
          </View>

          <Pressable
            onPress={handleWhatsApp}
            style={({ pressed }) => [
              s.sheetBtn,
              s.sheetBtnWa,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={s.sheetBtnText}>{translate('common.whatsapp')}</Text>
          </Pressable>

          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              s.sheetBtn,
              s.sheetBtnCall,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={s.sheetBtnText}>{translate('common.call')}</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.sheetClose, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.sheetCloseText}>{translate('common.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

// ── AcceptSuccessOverlay ──────────────────────────────────────────────────────

function AcceptSuccessOverlay({
  quote,
  partName,
  onClose,
  translate,
}: {
  quote: Quote
  partName: string
  onClose: () => void
  translate: (k: string) => string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const bgOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.94)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        stiffness: 320,
        damping: 24,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const storeName =
    quote.seller?.storeName ||
    quote.seller?.name ||
    translate('requestDetails.seller')

  function handleContact() {
    const phone = quote.seller?.whatsappNumber || quote.seller?.phoneNumber
    if (!phone) {
      Alert.alert(
        translate('common.unavailable'),
        translate('requestDetails.noContactNumber'),
      )
      return
    }
    const digits = phone.replace(/\D/g, '')
    const wa = digits.startsWith('213')
      ? digits
      : digits.startsWith('0')
        ? '213' + digits.slice(1)
        : '213' + digits
    const msg = encodeURIComponent(
      `Hi ${storeName}, I'm interested in your quote for "${partName}".`,
    )
    Linking.openURL(`https://wa.me/${wa}?text=${msg}`)
    onClose()
  }

  return (
    <View style={[StyleSheet.absoluteFillObject, s.overlayRoot]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          s.overlayBg,
          { opacity: bgOpacity },
        ]}
      />
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <Animated.View
        style={[
          s.overlayCard,
          { transform: [{ scale: cardScale }], opacity: cardOpacity },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => {}} style={s.overlayCardInner}>
          <View
            style={[s.overlayIconBox, { backgroundColor: `${t.success}14` }]}
          >
            <Ionicons name="checkmark-circle" size={36} color={t.success} />
          </View>
          <Text style={s.overlayTitle}>
            {translate('requestDetails.quoteAccepted')}
          </Text>
          <Text style={s.overlaySub}>
            {translate('requestDetails.youAccepted')}{' '}
            <Text style={{ fontWeight: '700', color: t.text }}>
              {storeName}
            </Text>
            {translate('requestDetails.sOffer')}
          </Text>
          <View
            style={[s.overlayPriceChip, { backgroundColor: `${t.success}10` }]}
          >
            <Text style={[s.overlayPrice, { color: t.success }]}>
              {quote.price.toLocaleString('en-DZ')}
            </Text>
            <Text style={[s.overlayPriceCurrency, { color: `${t.success}80` }]}>
              DZD
            </Text>
          </View>
          <Pressable
            onPress={handleContact}
            style={({ pressed }) => [
              s.overlayBtn,
              s.overlayBtnWa,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text style={s.overlayBtnText}>
              {translate('requestDetails.contactSeller')}
            </Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              s.overlayBtn,
              s.overlayBtnOutline,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[s.overlayBtnText, { color: t.accent }]}>
              {translate('common.done')}
            </Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── RevokeOverlay ─────────────────────────────────────────────────────────────

function RevokeOverlay({
  onClose,
  translate,
}: {
  onClose: () => void
  translate: (k: string) => string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const bgOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.94)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        stiffness: 320,
        damping: 24,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={[StyleSheet.absoluteFillObject, s.overlayRoot]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          s.overlayBg,
          { opacity: bgOpacity },
        ]}
      />
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <Animated.View
        style={[
          s.overlayCard,
          { transform: [{ scale: cardScale }], opacity: cardOpacity },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => {}} style={s.overlayCardInner}>
          <View style={[s.overlayIconBox, { backgroundColor: '#D9770614' }]}>
            <Ionicons name="arrow-undo" size={32} color="#D97706" />
          </View>
          <Text style={s.overlayTitle}>
            {translate('requestDetails.quoteRevoked')}
          </Text>
          <Text style={s.overlaySub}>
            {translate('requestDetails.quoteRevokedDesc')}
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              s.overlayBtn,
              { backgroundColor: '#D97706' },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={s.overlayBtnText}>{translate('common.gotIt')}</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── RejectOverlay ─────────────────────────────────────────────────────────────

function RejectOverlay({
  onClose,
  translate,
}: {
  onClose: () => void
  translate: (k: string) => string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const bgOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.94)).current
  const cardOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        stiffness: 320,
        damping: 24,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <View style={[StyleSheet.absoluteFillObject, s.overlayRoot]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          s.overlayBg,
          { opacity: bgOpacity },
        ]}
      />
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <Animated.View
        style={[
          s.overlayCard,
          { transform: [{ scale: cardScale }], opacity: cardOpacity },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => {}} style={s.overlayCardInner}>
          <View style={[s.overlayIconBox, { backgroundColor: t.dangerBg }]}>
            <Ionicons name="close-circle" size={32} color={t.danger} />
          </View>
          <Text style={s.overlayTitle}>
            {translate('requestDetails.quoteRejected')}
          </Text>
          <Text style={s.overlaySub}>
            {translate('requestDetails.quoteRejectedDesc')}
          </Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              s.overlayBtn,
              { backgroundColor: t.danger },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={s.overlayBtnText}>{translate('common.gotIt')}</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── RequestConfirmOverlay ─────────────────────────────────────────────────────

function RequestConfirmOverlay({
  action,
  loading,
  onConfirm,
  onDismiss,
  translate,
}: {
  action: 'close' | 'fulfill' | 'reopen' | 'delete'
  loading: boolean
  onConfirm: () => void
  onDismiss: () => void
  translate: (k: string) => string
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const bgOpacity = useRef(new Animated.Value(0)).current
  const cardScale = useRef(new Animated.Value(0.88)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const confirmScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        stiffness: 320,
        damping: 24,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const cfg = {
    close: {
      icon: 'close-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: t.danger,
      iconBg: t.dangerBg,
      title: translate('requestDetails.confirm.cancelRequest'),
      sub: translate('requestDetails.confirm.cancelRequestMessage'),
      confirmLabel: translate('requestDetails.close'),
      confirmBg: t.danger,
    },
    fulfill: {
      icon: 'checkmark-circle-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: t.success,
      iconBg: `${t.success}14`,
      title: translate('requestDetails.markAsFulfilled'),
      sub: translate('requestDetails.fulfillConfirm'),
      confirmLabel: translate('requestDetails.markFulfilled'),
      confirmBg: t.success,
    },
    reopen: {
      icon: 'refresh-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: t.accent,
      iconBg: `${t.accent}14`,
      title: translate('requestDetails.reopen'),
      sub: translate('requestDetails.reopenConfirm'),
      confirmLabel: translate('requestDetails.reopen'),
      confirmBg: t.accent,
    },
    delete: {
      icon: 'trash-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: t.danger,
      iconBg: t.dangerBg,
      title: translate('requestDetails.delete'),
      sub: translate('requestDetails.deleteConfirm'),
      confirmLabel: translate('requestDetails.delete'),
      confirmBg: t.danger,
    },
  }[action]

  return (
    <View style={[StyleSheet.absoluteFillObject, s.overlayRoot]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          s.overlayBg,
          { opacity: bgOpacity },
        ]}
      />
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={loading ? undefined : onDismiss}
      />
      <Animated.View
        style={[
          s.overlayCard,
          { transform: [{ scale: cardScale }], opacity: cardOpacity },
        ]}
        pointerEvents="box-none"
      >
        <Pressable onPress={() => {}} style={s.overlayCardInner}>
          <View style={[s.overlayIconBox, { backgroundColor: cfg.iconBg }]}>
            <Ionicons name={cfg.icon} size={36} color={cfg.iconColor} />
          </View>
          <Text style={s.overlayTitle}>{cfg.title}</Text>
          <Text style={s.overlaySub}>{cfg.sub}</Text>
          <Pressable
            onPress={onConfirm}
            disabled={loading}
            onPressIn={() =>
              Animated.spring(confirmScale, {
                toValue: 0.96,
                stiffness: 400,
                damping: 20,
                useNativeDriver: true,
              }).start()
            }
            onPressOut={() =>
              Animated.spring(confirmScale, {
                toValue: 1,
                stiffness: 400,
                damping: 20,
                useNativeDriver: true,
              }).start()
            }
            style={{ width: '100%' }}
          >
            <Animated.View
              style={[
                s.overlayBtn,
                {
                  backgroundColor: cfg.confirmBg,
                  transform: [{ scale: confirmScale }],
                },
                loading && { opacity: 0.65 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={cfg.icon} size={18} color="#fff" />
              )}
              <Text style={s.overlayBtnText}>
                {loading ? translate('common.pleaseWait') : cfg.confirmLabel}
              </Text>
            </Animated.View>
          </Pressable>
          <Pressable
            onPress={loading ? undefined : onDismiss}
            style={({ pressed }) => [
              s.overlayBtn,
              s.overlayBtnOutline,
              pressed && !loading && { opacity: 0.7 },
            ]}
          >
            <Text style={[s.overlayBtnText, { color: t.accent }]}>
              {translate('common.cancel')}
            </Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── Skeleton components ───────────────────────────────────────────────────────

function SkeletonImage() {
  const t = useTheme()
  const s = makeStyles(t)
  const anim = useRef(new Animated.Value(0.38)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.72,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.38,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [])
  return <Animated.View style={[s.skeletonImage, { opacity: anim }]} />
}

function SkeletonContent() {
  const t = useTheme()
  const s = makeStyles(t)
  const anim = useRef(new Animated.Value(0.38)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.72,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.38,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [])

  const line = (w: number | `${number}%`, h = 12, mb = 10) => (
    <Animated.View
      style={[
        s.skeletonLine,
        { width: w, height: h, marginBottom: mb, opacity: anim },
      ]}
    />
  )

  return (
    <View>
      {line('72%', 22, 16)}
      <View style={[s.infoGrid, { marginBottom: 6 }]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={s.infoCellWrap}>
            <Animated.View style={[s.infoCell, { opacity: anim }]}>
              <View
                style={[s.infoCellIconBox, { backgroundColor: t.bgMuted }]}
              />
              <View
                style={[
                  s.skeletonLine,
                  { width: '55%', height: 9, marginBottom: 8 },
                ]}
              />
              <View style={[s.skeletonLine, { width: '80%', height: 13 }]} />
            </Animated.View>
          </View>
        ))}
      </View>
      <View style={s.sectionRow}>{line(80, 18, 0)}</View>
      <View
        style={[
          s.quoteCard,
          {
            borderLeftWidth: 3.5,
            borderLeftColor: t.border,
            gap: 12,
            marginTop: 16,
          },
        ]}
      >
        {line('60%', 14)}
        {line('35%', 28)}
        {line('45%')}
      </View>
    </View>
  )
}

// ── Styles factory ────────────────────────────────────────────────────────────

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    center: { alignItems: 'center', justifyContent: 'center' },
    notFoundText: { fontSize: 16, color: t.textMuted },
    notFoundBack: {
      marginTop: 16,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: radius.md,
      backgroundColor: `${t.accent}14`,
    },
    notFoundBackText: { fontSize: 15, fontWeight: '600', color: t.accent },

    // ── Header bar ────────────────────────────────────────────
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.xl,
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: {
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingEnd: 16,
    },
    backIconBox: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: `${t.accent}12`,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Scroll ────────────────────────────────────────────────
    scroll: { paddingBottom: 32 },

    // ── Image section ─────────────────────────────────────────
    imageSection: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH * 0.62,
      position: 'relative',
    },
    image: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.62 },
    dotsRow: {
      position: 'absolute',
      bottom: 14,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 5,
    },
    dot: { height: 5, borderRadius: 2.5 },
    dotActive: { width: 18, backgroundColor: '#fff' },
    dotInactive: { width: 5, backgroundColor: 'rgba(255,255,255,0.45)' },
    imageCounter: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    imageCounterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    imagePlaceholder: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH * 0.62,
      backgroundColor: t.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholderIconBox: {
      width: 72,
      height: 72,
      borderRadius: radius.xl,
      backgroundColor: `${t.accent}12`,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ── Content ───────────────────────────────────────────────
    content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8,
    },
    partName: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: t.text,
      letterSpacing: -0.5,
      lineHeight: 30,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 10,
      marginTop: 4,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusLabel: { fontSize: 12, fontWeight: '600' },

    // ── Info grid ─────────────────────────────────────────────
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
      marginBottom: 16,
    },
    infoCellWrap: { width: '50%', paddingHorizontal: 5, paddingBottom: 10 },
    infoCell: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
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
      backgroundColor: `${t.accent}12`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    logoIcon: { width: 24, height: 24, borderRadius: 6 },
    infoCellLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: t.textMuted,
      letterSpacing: 0.5,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    infoCellValue: {
      fontSize: 14,
      fontWeight: '600',
      color: t.text,
      letterSpacing: -0.1,
      lineHeight: 19,
    },

    // ── Notes card ────────────────────────────────────────────
    notesCard: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
      borderLeftWidth: 3.5,
      borderLeftColor: t.accent,
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
    notesLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: t.accent,
      letterSpacing: 1.0,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    notesBody: { fontSize: 14, color: t.textMuted, lineHeight: 22 },

    // ── Section header ────────────────────────────────────────
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: t.textMuted,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
    },
    sectionPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: `${t.accent}14`,
    },
    sectionPillText: { fontSize: 12, fontWeight: '600', color: t.accent },

    // ── Quotes list ───────────────────────────────────────────
    quoteList: { gap: 12 },
    noQuotesWrap: { alignItems: 'center', gap: 10, paddingVertical: 40 },
    noQuotesIconBox: {
      width: 52,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: t.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noQuotesText: { fontSize: 14, color: t.textMuted, textAlign: 'center' },

    // ── Quote card ────────────────────────────────────────────
    quoteCard: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: 16,
      gap: 14,
      borderWidth: 1,
      borderColor: t.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
        },
        android: { elevation: 2 },
      }),
    },
    quoteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    sellerAvatar: {
      width: 38,
      height: 38,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sellerAvatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    sellerName: {
      fontSize: 15,
      fontWeight: '600',
      color: t.text,
      letterSpacing: -0.1,
    },
    sellerLocation: { fontSize: 12, color: t.textMuted, marginTop: 1 },
    qStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    qStatusLabel: { fontSize: 11, fontWeight: '600' },

    // ── Price band ────────────────────────────────────────────
    priceBand: {
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 6,
    },
    priceValue: {
      fontSize: 34,
      fontWeight: '700',
      letterSpacing: -1.5,
      lineHeight: 38,
      fontVariant: ['tabular-nums'],
    },
    priceCurrency: { fontSize: 14, fontWeight: '600', marginBottom: 3 },

    // ── Details grid ──────────────────────────────────────────
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    detailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.bgMuted,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 7,
      minWidth: '47%',
      flex: 1,
    },
    detailChipLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: t.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    detailChipValue: {
      fontSize: 13,
      fontWeight: '600',
      color: t.text,
      marginTop: 1,
    },

    // ── Quote action buttons ───────────────────────────────────
    quoteActions: { flexDirection: 'row', gap: 8 },
    quoteActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: radius.md,
      paddingVertical: 12,
      borderWidth: 1.5,
    },
    quoteActionText: { fontSize: 13, fontWeight: '600' },
    disabledBadge: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: t.bgMuted,
    },
    disabledBadgeText: { fontSize: 13, fontWeight: '500', color: t.textMuted },

    // ── Action bar ────────────────────────────────────────────
    actionBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: t.bg,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: radius.lg,
      paddingVertical: 14,
      minHeight: 50,
      borderWidth: 1.5,
    },
    actionBtnText: { fontSize: 14, fontWeight: '600' },
    actionBtnSkeleton: {
      height: 50,
      borderRadius: radius.lg,
      backgroundColor: t.bgMuted,
    },

    // ── Contact modal ─────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
    modalSheet: {
      backgroundColor: t.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingBottom: 36,
      paddingTop: 8,
      gap: 12,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.border,
      alignSelf: 'center',
      marginBottom: 8,
    },
    sheetHeader: { alignItems: 'center', gap: 6, paddingBottom: 8 },
    sheetAvatar: {
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    sheetAvatarText: { fontSize: 22, fontWeight: '700', color: '#fff' },
    sheetStoreName: {
      fontSize: 20,
      fontWeight: '700',
      color: t.text,
      letterSpacing: -0.4,
    },
    sheetLocation: { fontSize: 13, color: t.textMuted },
    sheetBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: radius.lg,
      paddingVertical: 16,
      minHeight: 56,
    },
    sheetBtnWa: { backgroundColor: '#25D366' },
    sheetBtnCall: { backgroundColor: t.accent },
    sheetBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    sheetClose: {
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radius.md,
      paddingVertical: 13,
    },
    sheetCloseText: { fontSize: 15, fontWeight: '600', color: t.accent },

    // ── Skeleton ──────────────────────────────────────────────
    skeletonImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH * 0.62,
      backgroundColor: t.bgMuted,
    },
    skeletonLine: { borderRadius: 6, backgroundColor: t.bgMuted },

    // ── Overlays ──────────────────────────────────────────────
    overlayRoot: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    overlayBg: { backgroundColor: 'rgba(0,0,0,0.55)' },
    overlayCardInner: { width: '100%', alignItems: 'center' },
    overlayCard: {
      width: '100%',
      backgroundColor: t.surface,
      borderRadius: 24,
      paddingHorizontal: 28,
      paddingTop: 32,
      paddingBottom: 28,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 20,
    },
    overlayIconBox: {
      width: 72,
      height: 72,
      borderRadius: radius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    overlayTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: t.text,
      letterSpacing: -0.5,
      marginBottom: 10,
      textAlign: 'center',
    },
    overlaySub: {
      fontSize: 15,
      color: t.textMuted,
      textAlign: 'center',
      lineHeight: 23,
      marginBottom: 20,
    },
    overlayPriceChip: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 5,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    overlayPrice: {
      fontSize: 32,
      fontWeight: '700',
      letterSpacing: -1.5,
      lineHeight: 36,
      fontVariant: ['tabular-nums'],
    },
    overlayPriceCurrency: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 3,
    },
    overlayBtn: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: radius.lg,
      paddingVertical: 16,
      minHeight: 54,
      marginTop: 8,
    },
    overlayBtnWa: { backgroundColor: '#25D366' },
    overlayBtnOutline: {
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.bgMuted,
    },
    overlayBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  })
}
