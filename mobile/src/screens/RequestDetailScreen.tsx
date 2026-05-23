import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  acceptQuoteFn,
  cancelRequestFn,
  deleteRequestFn,
  fetchRequestDetails,
  fulfillRequestFn,
  rejectQuoteFn,
  reopenRequestFn,
  revokeQuoteFn,
  unrejectQuoteFn,
} from '../lib/api-client'
import { radius, spacing } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { BuyerRequestRow, Quote } from '../types/buyer'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Status config factories ───────────────────────────────────────────────────

function statusConfig(t: Theme) {
  return {
    open: { label: 'Open', color: t.success, bg: `${t.success}14` },
    fulfilled: { label: 'Fulfilled', color: '#D97706', bg: '#D9770614' },
    cancelled: { label: 'Cancelled', color: t.danger, bg: t.dangerBg },
  }
}

function quoteStatusConfig(t: Theme) {
  return {
    pending: { label: 'Pending', color: '#D97706', bg: '#D9770614' },
    accepted: { label: 'Accepted', color: t.success, bg: `${t.success}14` },
    rejected: { label: 'Rejected', color: t.danger, bg: t.dangerBg },
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

interface RequestDetailScreenProps {
  requestId: string
  onBack: () => void
  onEdit?: (id: string, data: BuyerRequestRow) => void
}

export function RequestDetailScreen({
  requestId,
  onBack,
  onEdit,
}: RequestDetailScreenProps) {
  const t = useTheme()
  const s = makeStyles(t)

  const [request, setRequest] = useState<BuyerRequestRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isFulfilling, setIsFulfilling] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [contactSeller, setContactSeller] = useState<Quote['seller'] | null>(
    null,
  )
  const [acceptOverlay, setAcceptOverlay] = useState<Quote | null>(null)
  const [showRevokeOverlay, setShowRevokeOverlay] = useState(false)
  const [showRejectOverlay, setShowRejectOverlay] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchRequestDetails(requestId)
      setRequest(data)
    } catch {
      Alert.alert('Error', 'Could not load request details.')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  const silentLoad = useCallback(async () => {
    try {
      const data = await fetchRequestDetails(requestId)
      setRequest(data)
    } catch {}
  }, [requestId])

  useEffect(() => {
    load()
  }, [load])

  const images = request?.imageUrls?.filter(Boolean) || []

  function formatDate(iso: string) {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
  }

  async function handleAcceptQuote(quoteId: string) {
    const quoteCopy = request?.quotes?.find((q) => q.id === quoteId) ?? null
    if (!quoteCopy) return
    setActionLoading(`accept-${quoteId}`)
    try {
      await acceptQuoteFn(quoteId)
      setAcceptOverlay(quoteCopy)
    } catch {
      Alert.alert('Error', 'Could not accept quote.')
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
      Alert.alert('Error', 'Could not reject quote.')
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
      Alert.alert('Error', 'Could not revoke acceptance.')
    } finally {
      setActionLoading(null)
    }
  }

  function confirmFulfill() {
    Alert.alert(
      'Mark as Fulfilled',
      'Confirm that the deal is done and close this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Fulfilled',
          onPress: async () => {
            setIsFulfilling(true)
            try {
              await fulfillRequestFn(requestId)
              silentLoad()
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Could not fulfill request.')
            } finally {
              setIsFulfilling(false)
            }
          },
        },
      ],
    )
  }

  async function handleUnrejectQuote(quoteId: string) {
    setActionLoading(`unreject-${quoteId}`)
    try {
      await unrejectQuoteFn(quoteId)
      silentLoad()
    } catch {
      Alert.alert('Error', 'Could not unreject quote.')
    } finally {
      setActionLoading(null)
    }
  }

  function confirmCancel() {
    Alert.alert('Close request', 'Mark this request as closed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Close',
        style: 'destructive',
        onPress: async () => {
          setActionLoading('close')
          try {
            await cancelRequestFn(requestId)
            silentLoad()
          } catch {
            Alert.alert('Error', 'Could not close request.')
          } finally {
            setActionLoading(null)
          }
        },
      },
    ])
  }

  function confirmReopen() {
    Alert.alert('Reopen request', 'Reopen this request for new offers?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reopen',
        onPress: async () => {
          setActionLoading('reopen')
          try {
            await reopenRequestFn(requestId)
            silentLoad()
          } catch {
            Alert.alert('Error', 'Could not reopen request.')
          } finally {
            setActionLoading(null)
          }
        },
      },
    ])
  }

  function confirmDelete() {
    Alert.alert('Delete request', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading('delete')
          try {
            await deleteRequestFn(requestId)
            onBack()
          } catch {
            Alert.alert('Error', 'Could not delete request.')
          } finally {
            setActionLoading(null)
          }
        },
      },
    ])
  }

  const topInset =
    Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 28) + 8

  const sCfg = statusConfig(t)[request?.status || ''] ?? {
    label: request?.status || '',
    color: t.textMuted,
    bg: t.bgMuted,
  }

  const isOpen = request?.status === 'open'
  const isFulfilled = request?.status === 'fulfilled'
  const isCancelled = request?.status === 'cancelled'

  if (!request && !loading) {
    return (
      <View style={[s.root, s.center]}>
        <StatusBar barStyle="dark-content" />
        <Text style={s.notFoundText}>Request not found.</Text>
        <Pressable onPress={onBack} style={s.notFoundBack}>
          <Text style={s.notFoundBackText}>Go back</Text>
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
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <View style={s.backIconBox}>
            <Ionicons name="chevron-back" size={18} color={t.accent} />
          </View>
          <Text style={s.backText}>Back</Text>
        </Pressable>

        <Text style={s.headerTitle} numberOfLines={1}>
          Request Details
        </Text>
        <View style={s.headerRight} />
      </View>

      {/* ── Scroll content ───────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Image carousel */}
        {loading ? (
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
                  resizeMode="cover"
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
          {loading ? (
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
                  label="Posted"
                  value={formatDate(request.createdAt)}
                />
                <InfoGridLogoCell
                  imageUrl={request.brand?.imageUrl}
                  fallbackIcon="car-sport-outline"
                  label="Vehicle"
                  value={`${request.vehicleBrand}${request.modelYear ? ` ${request.modelYear}` : ''}`}
                />
                {request.brand?.clusterRegion && (
                  <InfoGridCell
                    icon="location-outline"
                    label="Location"
                    value={request.brand.clusterRegion}
                  />
                )}
                {request.category?.name && (
                  <InfoGridLogoCell
                    imageUrl={request.category?.imageUrl}
                    fallbackIcon="pricetag-outline"
                    label="Category"
                    value={request.category.name}
                  />
                )}
                {request.oemNumber && (
                  <InfoGridCell
                    icon="document-text-outline"
                    label="OEM #"
                    value={request.oemNumber}
                  />
                )}
              </View>

              {/* ── Notes ─────────────────────────────────────── */}
              {request.notes ? (
                <View style={s.notesCard}>
                  <Text style={s.notesLabel}>Notes</Text>
                  <Text style={s.notesBody}>{request.notes}</Text>
                </View>
              ) : null}

              {/* ── Quotes section ────────────────────────────── */}
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Offers</Text>
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
                        isRequestOpen={isOpen}
                        actionLoading={actionLoading}
                        onAccept={handleAcceptQuote}
                        onReject={handleRejectQuote}
                        onRevoke={handleRevokeQuote}
                        onUnreject={handleUnrejectQuote}
                        onContact={setContactSeller}
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
                    No offers yet. Check back later.
                  </Text>
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* ── Action bar ───────────────────────────────────────── */}
      <View style={s.actionBar}>
        {loading ? (
          <>
            <View style={[s.actionBtnSkeleton, { flex: 1 }]} />
            <View style={[s.actionBtnSkeleton, { flex: 1 }]} />
          </>
        ) : request ? (
          <>
            {!!onEdit && (
              <ActionBtn
                icon="create-outline"
                label="Edit"
                onPress={() => request && onEdit(requestId, request)}
                loading={actionLoading === 'edit'}
                variant="outline"
              />
            )}
            {isOpen && request.quotes?.some((q) => q.status === 'accepted') && (
              <ActionBtn
                icon="checkmark-circle-outline"
                label="Fulfilled"
                onPress={confirmFulfill}
                loading={isFulfilling}
                variant="success"
              />
            )}
            {isOpen && (
              <ActionBtn
                icon="close-circle-outline"
                label="Close"
                onPress={confirmCancel}
                loading={actionLoading === 'close'}
                variant="danger"
              />
            )}
            {isCancelled && (
              <ActionBtn
                icon="refresh-outline"
                label="Reopen"
                onPress={confirmReopen}
                loading={actionLoading === 'reopen'}
                variant="primary"
              />
            )}
            {!isOpen && !isCancelled && !isFulfilled && (
              <ActionBtn
                icon="trash-outline"
                label="Delete"
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
      />

      {acceptOverlay && (
        <AcceptSuccessOverlay
          quote={acceptOverlay}
          partName={request?.partName || ''}
          onClose={() => {
            setAcceptOverlay(null)
            silentLoad()
          }}
        />
      )}
      {showRevokeOverlay && (
        <RevokeOverlay
          onClose={() => {
            setShowRevokeOverlay(false)
            silentLoad()
          }}
        />
      )}
      {showRejectOverlay && (
        <RejectOverlay
          onClose={() => {
            setShowRejectOverlay(false)
            silentLoad()
          }}
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
            <Image source={{ uri: imageUrl }} style={s.logoIcon} />
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
  isRequestOpen: boolean
  actionLoading: string | null
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onRevoke: (id: string) => void
  onUnreject: (id: string) => void
  onContact: (seller: Quote['seller']) => void
}

function QuoteCard({
  quote,
  isRequestOpen,
  actionLoading,
  onAccept,
  onReject,
  onRevoke,
  onUnreject,
  onContact,
}: QuoteCardProps) {
  const t = useTheme()
  const s = makeStyles(t)
  const qCfg = quoteStatusConfig(t)[quote.status] ?? {
    label: quote.status,
    color: t.textMuted,
    bg: t.bgMuted,
  }

  const storeName =
    quote.seller?.storeName || quote.seller?.name || 'Unknown seller'
  const isPending = quote.status === 'pending'
  const isAccepted = quote.status === 'accepted'
  const isRejected = quote.status === 'rejected'
  const isNew = quote.condition === 'new'

  function formatDateLocal(iso: string) {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-DZ', { day: 'numeric', month: 'short' })
  }

  return (
    <View style={[s.quoteCard, { borderLeftColor: qCfg.color }]}>
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
          {isAccepted && (
            <Ionicons name="checkmark-circle" size={11} color={qCfg.color} />
          )}
          {isRejected && (
            <Ionicons name="close-circle" size={11} color={qCfg.color} />
          )}
          <Text style={[s.qStatusLabel, { color: qCfg.color }]}>
            {qCfg.label}
          </Text>
        </View>
      </View>

      {/* Price band */}
      <View style={[s.priceBand, { backgroundColor: `${qCfg.color}0A` }]}>
        <Text style={[s.priceValue, { color: qCfg.color }]}>
          {quote.price.toLocaleString('en-DZ')}
        </Text>
        <Text style={[s.priceCurrency, { color: `${qCfg.color}99` }]}>DZD</Text>
      </View>

      {/* Details grid */}
      <View style={s.detailsGrid}>
        <DetailChip
          icon={isNew ? 'sparkles-outline' : 'refresh-circle-outline'}
          label="Condition"
          value={isNew ? 'New' : 'Used'}
          accent={isNew ? t.success : '#D97706'}
        />
        {quote.seller?.wilaya && (
          <DetailChip
            icon="location-outline"
            label="Location"
            value={quote.seller.wilaya}
          />
        )}
        {quote.warranty && (
          <DetailChip
            icon="shield-checkmark-outline"
            label="Warranty"
            value={quote.warranty}
            accent={t.success}
          />
        )}
        <DetailChip
          icon="time-outline"
          label="Submitted"
          value={formatDateLocal(quote.createdAt)}
        />
      </View>

      {/* Actions */}
      {isPending && isRequestOpen && (
        <View style={s.quoteActions}>
          <QuoteActionBtn
            label="Accept"
            icon="checkmark-circle-outline"
            loading={actionLoading === `accept-${quote.id}`}
            onPress={() => onAccept(quote.id)}
            variant="primary"
          />
          <QuoteActionBtn
            label="Reject"
            icon="close-circle-outline"
            loading={actionLoading === `reject-${quote.id}`}
            onPress={() => onReject(quote.id)}
            variant="outline"
          />
        </View>
      )}
      {isPending && !isRequestOpen && (
        <View style={s.quoteActions}>
          <View style={s.disabledBadge}>
            <Text style={s.disabledBadgeText}>Request closed</Text>
          </View>
        </View>
      )}
      {isAccepted && (
        <View style={s.quoteActions}>
          <QuoteActionBtn
            label="Contact"
            icon="logo-whatsapp"
            loading={false}
            onPress={() => onContact(quote.seller)}
            variant="whatsapp"
          />
          {isRequestOpen && (
            <QuoteActionBtn
              label="Reject"
              icon="close-circle-outline"
              loading={actionLoading === `reject-${quote.id}`}
              onPress={() => onReject(quote.id)}
              variant="outline"
            />
          )}
          {isRequestOpen && (
            <QuoteActionBtn
              label="Revoke"
              icon="arrow-undo-outline"
              loading={actionLoading === `revoke-${quote.id}`}
              onPress={() => onRevoke(quote.id)}
              variant="outline"
            />
          )}
        </View>
      )}
      {isRejected && (
        <View style={s.quoteActions}>
          {isRequestOpen ? (
            <QuoteActionBtn
              label="Restore"
              icon="refresh-outline"
              loading={actionLoading === `unreject-${quote.id}`}
              onPress={() => onUnreject(quote.id)}
              variant="outline"
            />
          ) : (
            <View style={s.disabledBadge}>
              <Text style={s.disabledBadgeText}>Request closed</Text>
            </View>
          )}
        </View>
      )}
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
}: {
  visible: boolean
  seller: Quote['seller'] | null
  partName: string
  onClose: () => void
}) {
  const t = useTheme()
  const s = makeStyles(t)
  const storeName = seller?.storeName || seller?.name || 'Seller'

  function handleWhatsApp() {
    const phone = seller?.whatsappNumber || seller?.phoneNumber
    if (!phone) {
      Alert.alert('Unavailable', 'No contact number for this seller.')
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
      Alert.alert('Unavailable', 'No phone number for this seller.')
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
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={s.sheetBtnText}>WhatsApp</Text>
          </Pressable>

          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              s.sheetBtn,
              s.sheetBtnCall,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text style={s.sheetBtnText}>Call</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.sheetClose, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.sheetCloseText}>Close</Text>
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
}: {
  quote: Quote
  partName: string
  onClose: () => void
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

  const storeName = quote.seller?.storeName || quote.seller?.name || 'Seller'

  function handleContact() {
    const phone = quote.seller?.whatsappNumber || quote.seller?.phoneNumber
    if (!phone) {
      Alert.alert('Unavailable', 'No contact number for this seller.')
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
          <Text style={s.overlayTitle}>Quote Accepted!</Text>
          <Text style={s.overlaySub}>
            You accepted{' '}
            <Text style={{ fontWeight: '700', color: t.text }}>
              {storeName}
            </Text>
            's offer
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
            <Text style={s.overlayBtnText}>Contact Seller</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              s.overlayBtn,
              s.overlayBtnOutline,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[s.overlayBtnText, { color: t.accent }]}>Done</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── RevokeOverlay ─────────────────────────────────────────────────────────────

function RevokeOverlay({ onClose }: { onClose: () => void }) {
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
          <Text style={s.overlayTitle}>Quote Revoked</Text>
          <Text style={s.overlaySub}>
            The offer has been removed. Your request is open again for new
            quotes.
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
            <Text style={s.overlayBtnText}>Got it</Text>
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  )
}

// ── RejectOverlay ─────────────────────────────────────────────────────────────

function RejectOverlay({ onClose }: { onClose: () => void }) {
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
          <Text style={s.overlayTitle}>Quote Rejected</Text>
          <Text style={s.overlaySub}>
            The seller's offer has been declined. Your request remains open for
            other quotes.
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
            <Text style={s.overlayBtnText}>Got it</Text>
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

  const line = (w: string | number, h = 12, mb = 10) => (
    <Animated.View
      style={[
        s.skeletonLine,
        { width: w as any, height: h, marginBottom: mb, opacity: anim },
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
          { borderLeftColor: t.border, gap: 12, marginTop: 16 },
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
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.xl,
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingRight: 16,
    },
    backIconBox: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: `${t.accent}12`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: { fontSize: 15, fontWeight: '600', color: t.accent },
    headerTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: t.text,
      textAlign: 'center',
      letterSpacing: -0.3,
      marginRight: 72,
    },
    headerRight: { width: 72 },

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
      alignItems: 'flex-start',
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
      borderLeftWidth: 3.5,
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
