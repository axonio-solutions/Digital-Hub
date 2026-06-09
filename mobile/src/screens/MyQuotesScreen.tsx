import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { ScrollView, Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { FlashList } from '@shopify/flash-list'

import {
  fetchRequestDetails,
  retractQuoteFn,
  sendReminderFn,
} from '../lib/api-client'
import { sellerQuotesQueryOptions } from '../features/seller/queries/quotes'
import { radius, spacing, typography } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import type { ExistingQuoteData } from './SubmitQuoteScreen'
import type { BuyerRequestRow } from '../types/buyer'
import type { OpenRequestRow, SellerQuote } from '../types/seller'
import type { SellerQuotesStackParamList } from '../navigation/types'
import { useTranslation } from 'react-i18next'

type QuoteTab = 'all' | 'pending' | 'won' | 'lost'
type TimeWindow = 'all' | 'today' | 'week' | 'month'
type SortKey = 'date-new' | 'date-old' | 'price-asc' | 'price-desc'

interface MyQuotesScreenProps {
  refreshKey?: number
  onEditQuote?: (
    request: OpenRequestRow,
    existingQuote: ExistingQuoteData,
  ) => void
  onSelectQuote?: (
    request: OpenRequestRow,
    existingQuote: ExistingQuoteData,
  ) => void
}

interface QuoteCardProps {
  item: SellerQuote
  index: number
  onSelect: () => void
  onEdit: (q: SellerQuote) => void
  onRetract: (id: string) => void
  onRemind: (id: string) => void
  actionLoading: string | null
  t: Theme
}

const SORT_OPTIONS = (
  t: (k: string) => string,
): Array<{
  key: SortKey
  icon: keyof typeof Ionicons.glyphMap
  label: string
}> => [
  { key: 'date-new', icon: 'arrow-down', label: t('quotes.sort.newest') },
  { key: 'date-old', icon: 'arrow-up', label: t('quotes.sort.oldest') },
  { key: 'price-asc', icon: 'trending-up', label: t('quotes.sort.priceAsc') },
  {
    key: 'price-desc',
    icon: 'trending-down',
    label: t('quotes.sort.priceDesc'),
  },
]

const C = {
  pending: '#2563eb',
  won: '#059669',
  lost: '#dc2626',
} as const

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function isThisWeek(iso: string) {
  const d = new Date(iso)
  return d.getTime() > Date.now() - 7 * 86400000
}

function isThisMonth(iso: string) {
  const d = new Date(iso)
  return d.getTime() > Date.now() - 30 * 86400000
}

function timeAgo(iso: string, t: (k: string) => string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}${t('quotes.timeAgoMin')}`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}${t('quotes.timeAgoHour')}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}${t('quotes.timeAgoDay')}`
  return new Date(iso).toLocaleDateString('en-DZ', {
    month: 'short',
    day: 'numeric',
  })
}

function getStatusMeta(status: string, t: (k: string) => string) {
  switch (status) {
    case 'pending':
      return {
        label: t('quotes.status.pending'),
        dot: C.pending,
        bg: C.pending + '12',
        border: C.pending + '30',
      }
    case 'accepted':
      return {
        label: t('quotes.status.won'),
        dot: C.won,
        bg: C.won + '12',
        border: C.won + '30',
      }
    case 'rejected':
      return {
        label: t('quotes.status.lost'),
        dot: C.lost,
        bg: C.lost + '12',
        border: C.lost + '30',
      }
    default:
      return {
        label: status,
        dot: '#a1a1aa',
        bg: '#a1a1aa12',
        border: '#a1a1aa30',
      }
  }
}

function buyerRowToOpenRequest(row: BuyerRequestRow): OpenRequestRow {
  return {
    id: row.id,
    partName: row.partName,
    oemNumber: row.oemNumber,
    vehicleBrand: row.vehicleBrand,
    modelYear: row.modelYear,
    imageUrls: row.imageUrls,
    notes: row.notes,
    createdAt: row.createdAt,
    quotesCount: row.quotes?.length ?? 0,
    isPriority: row.isPriority,
    category: row.category
      ? {
          id: row.category.id,
          name: row.category.name,
          imageUrl: row.category.imageUrl,
        }
      : null,
    brand: row.brand
      ? {
          id: row.brand.id,
          brand: row.brand.brand,
          imageUrl: row.brand.imageUrl,
        }
      : null,
  }
}

const QuoteCard = React.memo(function QuoteCard({
  item,
  index,
  onSelect,
  onEdit,
  onRetract,
  onRemind,
  actionLoading,
  t,
}: QuoteCardProps) {
  const isRTL = useIsRTL()
  const { t: translate } = useTranslation()
  const styles = makeStyles(t)
  const meta = getStatusMeta(item.status, translate)
  const isPending = item.status === 'pending'
  const isRejected = item.status === 'rejected'
  const isAccepted = item.status === 'accepted'
  const isRequestOpen = item.request.status === 'open'
  const canRetract = isPending || isRejected

  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(24)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: index * 60,
        friction: 9,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={[{ shadowColor: '#000' }, styles.qCardShadow]}>
        <Pressable
          onPress={onSelect}
          style={({ pressed }) => [pressed && { opacity: 0.92 }]}
        >
          <View
            style={[
              styles.qCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                borderTopColor: t.border,
              },
            ]}
          >
            <View
              style={[
                styles.qCardTopAccent,
                { backgroundColor: meta.dot + 'd4', borderColor: meta.dot },
              ]}
            >
              <View
                style={[styles.qCardAccentDot, { backgroundColor: meta.dot }]}
              />
            </View>

            <View style={styles.qCardBody}>
              <View style={styles.qCardTopRow}>
                <View
                  style={[
                    styles.qCardStatusBadge,
                    { backgroundColor: meta.bg, borderColor: meta.border },
                  ]}
                >
                  <View
                    style={[
                      styles.qCardStatusDot,
                      { backgroundColor: meta.dot },
                    ]}
                  />
                  <Text style={[styles.qCardStatusText, { color: meta.dot }]}>
                    {meta.label}
                  </Text>
                </View>
                <View style={styles.qCardTimeRow}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color={t.textSubtle}
                  />
                  <Text style={[styles.qCardTimeText, { color: t.textSubtle }]}>
                    {timeAgo(item.createdAt, translate)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.qCardPartName, { color: t.text }]}
                numberOfLines={2}
              >
                {item.request.partName.toUpperCase()}
              </Text>

              <View
                style={[
                  styles.qCardVehicle,
                  { backgroundColor: t.bgMuted, borderColor: t.border },
                ]}
              >
                <View
                  style={[
                    styles.qCardVehicleIcon,
                    { backgroundColor: t.surface, borderColor: t.border },
                  ]}
                >
                  <Ionicons
                    name="car-sport-outline"
                    size={16}
                    color={t.accent}
                  />
                </View>
                <View style={styles.qCardVehicleInfo}>
                  <Text
                    style={[styles.qCardVehicleBrand, { color: t.text }]}
                    numberOfLines={1}
                  >
                    {item.request.vehicleBrand}
                  </Text>
                  <Text
                    style={[styles.qCardVehicleYear, { color: t.textMuted }]}
                  >
                    {item.request.modelYear} &middot;{' '}
                    {item.condition === 'new'
                      ? translate('submitQuote.conditionNew')
                      : translate('submitQuote.conditionUsed')}
                  </Text>
                </View>
              </View>

              <View style={styles.qCardPriceRow}>
                <View style={styles.qCardPriceInner}>
                  <Text style={[styles.qCardPriceAmount, { color: t.text }]}>
                    {item.price.toLocaleString()}
                  </Text>
                  <Text
                    style={[styles.qCardPriceCurrency, { color: t.textMuted }]}
                  >
                    DA
                  </Text>
                </View>
                <View
                  style={[
                    styles.qCardCond,
                    {
                      backgroundColor: t.accent + '0c',
                      borderColor: t.accent + '1a',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.condition === 'new'
                        ? 'cube-outline'
                        : 'reload-outline'
                    }
                    size={10}
                    color={t.accent}
                  />
                  <Text style={[styles.qCardCondText, { color: t.accent }]}>
                    {item.condition === 'new'
                      ? translate('submitQuote.conditionNew')
                      : translate('submitQuote.conditionUsed')}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.qCardDivider, { backgroundColor: t.border }]}
              />

              <View style={styles.qCardBottomRow}>
                <View style={styles.qCardMeta}>
                  {item.warranty ? (
                    <View style={styles.qCardMetaItem}>
                      <View
                        style={[
                          styles.qCardMetaIconBox,
                          { backgroundColor: C.won + '12' },
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={10}
                          color={C.won}
                        />
                      </View>
                      <Text
                        style={[styles.qCardMetaText, { color: t.textMuted }]}
                      >
                        {item.warranty}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.qCardMetaItem}>
                      <View
                        style={[
                          styles.qCardMetaIconBox,
                          { backgroundColor: t.border },
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={10}
                          color={t.textSubtle}
                        />
                      </View>
                      <Text
                        style={[styles.qCardMetaText, { color: t.textSubtle }]}
                      >
                        {translate('submitQuote.noWarranty')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.qCardActionsRow,
                  { backgroundColor: t.bgMuted + '60', borderColor: t.border },
                ]}
              >
                {isPending && isRequestOpen && (
                  <Pressable
                    onPress={() => onEdit(item)}
                    disabled={actionLoading === `edit-${item.id}`}
                    style={({ pressed }) => [
                      styles.qCardEditBtn,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      { backgroundColor: t.accent },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    {actionLoading === `edit-${item.id}` ? (
                      <ActivityIndicator size="small" color={t.accentFg} />
                    ) : (
                      <>
                        <Ionicons
                          name="pencil-outline"
                          size={15}
                          color={t.accentFg}
                        />
                        <Text
                          style={[styles.qCardEditText, { color: t.accentFg }]}
                        >
                          {translate('quotes.editQuote')}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
                {canRetract && (
                  <Pressable
                    onPress={() => onRetract(item.id)}
                    disabled={actionLoading === item.id}
                    style={({ pressed }) => [
                      styles.qCardWithdrawBtn,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      { borderColor: t.border + '99' },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    {actionLoading === item.id ? (
                      <ActivityIndicator size="small" color={t.textMuted} />
                    ) : (
                      <>
                        <Ionicons
                          name="close-outline"
                          size={15}
                          color={t.textMuted}
                        />
                        <Text
                          style={[
                            styles.qCardWithdrawText,
                            { color: t.textMuted },
                          ]}
                        >
                          {translate('quotes.retractQuote')}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
                {isAccepted && isRequestOpen && (
                  <Pressable
                    onPress={() => onRemind(item.id)}
                    disabled={actionLoading === `remind-${item.id}`}
                    style={({ pressed }) => [
                      styles.qCardEditBtn,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                      {
                        backgroundColor: C.won + '12',
                        borderWidth: 1,
                        borderColor: C.won + '30',
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    {actionLoading === `remind-${item.id}` ? (
                      <ActivityIndicator size="small" color={C.won} />
                    ) : (
                      <>
                        <Ionicons
                          name="notifications-outline"
                          size={15}
                          color={C.won}
                        />
                        <Text style={[styles.qCardEditText, { color: C.won }]}>
                          {translate('quotes.sendReminder')}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  )
})

export function MyQuotesScreen({
  refreshKey,
  onEditQuote,
  onSelectQuote,
}: MyQuotesScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<SellerQuotesStackParamList>>()
  const user = useUserStore((s) => s.user)
  const isRTL = useIsRTL()
  const { t: translate } = useTranslation()
  const t = useTheme()
  const styles = makeStyles(t)
  const queryClient = useQueryClient()
  const {
    data: quotes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery(sellerQuotesQueryOptions)

  const [tab, setTab] = useState<QuoteTab>('all')
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all')
  const [sortBy, setSortBy] = useState<SortKey>('date-new')

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [pendingTab, setPendingTab] = useState<QuoteTab>('all')
  const [pendingTime, setPendingTime] = useState<TimeWindow>('all')
  const [pendingSort, setPendingSort] = useState<SortKey>('date-new')
  const [showRetractSuccess, setShowRetractSuccess] = useState(false)
  const [showRetractConfirm, setShowRetractConfirm] = useState(false)
  const [pendingRetractId, setPendingRetractId] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const wsBackdrop = useRef(new Animated.Value(0)).current
  const wsScale = useRef(new Animated.Value(0.5)).current
  const wsOpacity = useRef(new Animated.Value(0)).current
  const wsCheck = useRef(new Animated.Value(0)).current
  const wsSlide = useRef(new Animated.Value(30)).current

  const wcBackdrop = useRef(new Animated.Value(0)).current
  const wcScale = useRef(new Animated.Value(0.5)).current
  const wcOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (refreshKey !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['seller-quotes'] })
    }
  }, [refreshKey, queryClient])

  useEffect(() => {
    if (showRetractSuccess) {
      Animated.parallel([
        Animated.timing(wsBackdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(wsScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(wsOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(wsSlide, {
          toValue: 0,
          friction: 9,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start()
      Animated.spring(wsCheck, {
        toValue: 1,
        friction: 5,
        tension: 50,
        delay: 200,
        useNativeDriver: true,
      }).start()
    } else {
      wsBackdrop.setValue(0)
      wsScale.setValue(0.5)
      wsOpacity.setValue(0)
      wsCheck.setValue(0)
      wsSlide.setValue(30)
    }
  }, [showRetractSuccess])

  useEffect(() => {
    if (showRetractConfirm) {
      Animated.parallel([
        Animated.timing(wcBackdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(wcScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(wcOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      wcBackdrop.setValue(0)
      wcScale.setValue(0.5)
      wcOpacity.setValue(0)
    }
  }, [showRetractConfirm])

  const pendingQuotes = useMemo(
    () => quotes.filter((q) => q.status === 'pending'),
    [quotes],
  )

  const timeFiltered = useMemo(() => {
    return quotes.filter((q) => {
      switch (timeWindow) {
        case 'today':
          return isToday(q.createdAt)
        case 'week':
          return isThisWeek(q.createdAt)
        case 'month':
          return isThisMonth(q.createdAt)
        default:
          return true
      }
    })
  }, [quotes, timeWindow])

  const tabFiltered = useMemo(() => {
    return timeFiltered.filter((q) => {
      switch (tab) {
        case 'pending':
          return q.status === 'pending'
        case 'won':
          return q.status === 'accepted'
        case 'lost':
          return q.status === 'rejected'
        default:
          return true
      }
    })
  }, [timeFiltered, tab])

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return tabFiltered
    const q = searchQuery.toLowerCase()
    return tabFiltered.filter(
      (item) =>
        item.request.partName.toLowerCase().includes(q) ||
        item.request.vehicleBrand.toLowerCase().includes(q) ||
        (item.category?.name ?? '').toLowerCase().includes(q),
    )
  }, [tabFiltered, searchQuery])

  const displayed = useMemo(() => {
    const arr = [...searched]
    switch (sortBy) {
      case 'date-new':
        return arr.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      case 'date-old':
        return arr.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      case 'price-asc':
        return arr.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return arr.sort((a, b) => b.price - a.price)
      default:
        return arr
    }
  }, [searched, sortBy])

  function handleRetract(quoteId: string) {
    setPendingRetractId(quoteId)
    setShowRetractConfirm(true)
  }

  async function confirmRetract() {
    const quoteId = pendingRetractId
    if (!quoteId) return
    setShowRetractConfirm(false)
    setActionLoading(quoteId)
    try {
      await retractQuoteFn(quoteId)
      queryClient.setQueryData<Array<SellerQuote>>(['seller-quotes'], (prev) =>
        prev?.filter((q) => q.id !== quoteId),
      )
      setShowRetractSuccess(true)
    } catch (err: any) {
      setErrorMessage(err?.message || translate('quotes.retractError'))
      setShowError(true)
    } finally {
      setActionLoading(null)
      setPendingRetractId(null)
    }
  }

  async function handleRemind(quoteId: string) {
    setActionLoading(`remind-${quoteId}`)
    try {
      await sendReminderFn(quoteId)
    } catch (err: any) {
      setErrorMessage(err?.message || translate('quotes.reminderError'))
      setShowError(true)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleEditQuote(quote: SellerQuote) {
    setActionLoading(`edit-${quote.id}`)
    let openRequest: OpenRequestRow
    try {
      const row = await fetchRequestDetails(quote.requestId)
      openRequest = row
        ? buyerRowToOpenRequest(row)
        : {
            id: quote.request.id,
            partName: quote.request.partName,
            oemNumber: null,
            vehicleBrand: quote.request.vehicleBrand,
            modelYear: quote.request.modelYear,
            imageUrls: quote.request.imageUrls,
            notes: null,
            createdAt: quote.createdAt,
            quotesCount: 0,
            isPriority: false,
            category: quote.category
              ? {
                  id: quote.category.id,
                  name: quote.category.name,
                  imageUrl: null,
                }
              : null,
            brand: null,
          }
    } catch {
      openRequest = {
        id: quote.request.id,
        partName: quote.request.partName,
        oemNumber: null,
        vehicleBrand: quote.request.vehicleBrand,
        modelYear: quote.request.modelYear,
        imageUrls: quote.request.imageUrls,
        notes: null,
        createdAt: quote.createdAt,
        quotesCount: 0,
        isPriority: false,
        category: quote.category
          ? {
              id: quote.category.id,
              name: quote.category.name,
              imageUrl: null,
            }
          : null,
        brand: null,
      }
    }
    setActionLoading(null)
    const existingQuoteData = {
      id: quote.id,
      price: quote.price,
      condition: quote.condition,
      warranty: quote.warranty,
    }
    if (onEditQuote) {
      onEditQuote(openRequest, existingQuoteData)
    } else {
      navigation.navigate('SubmitQuote', {
        request: openRequest,
        existingQuote: existingQuoteData,
        initialTab: 'offer',
        sellerId: user?.id ?? '',
      })
    }
  }

  async function handleSelectQuote(quote: SellerQuote) {
    setActionLoading(`view-${quote.id}`)
    let openRequest: OpenRequestRow
    try {
      const row = await fetchRequestDetails(quote.requestId)
      openRequest = row
        ? buyerRowToOpenRequest(row)
        : {
            id: quote.request.id,
            partName: quote.request.partName,
            oemNumber: null,
            vehicleBrand: quote.request.vehicleBrand,
            modelYear: quote.request.modelYear,
            imageUrls: quote.request.imageUrls,
            notes: null,
            createdAt: quote.createdAt,
            quotesCount: 0,
            isPriority: false,
            category: quote.category
              ? {
                  id: quote.category.id,
                  name: quote.category.name,
                  imageUrl: null,
                }
              : null,
            brand: null,
          }
    } catch {
      openRequest = {
        id: quote.request.id,
        partName: quote.request.partName,
        oemNumber: null,
        vehicleBrand: quote.request.vehicleBrand,
        modelYear: quote.request.modelYear,
        imageUrls: quote.request.imageUrls,
        notes: null,
        createdAt: quote.createdAt,
        quotesCount: 0,
        isPriority: false,
        category: quote.category
          ? { id: quote.category.id, name: quote.category.name, imageUrl: null }
          : null,
        brand: null,
      }
    }
    setActionLoading(null)
    const existingQuoteData = {
      id: quote.id,
      price: quote.price,
      condition: quote.condition,
      warranty: quote.warranty,
    }
    if (onSelectQuote) {
      onSelectQuote(openRequest, existingQuoteData)
    } else {
      navigation.navigate('SubmitQuote', {
        request: openRequest,
        existingQuote: existingQuoteData,
        sellerId: user?.id ?? '',
      })
    }
  }

  function openFilterSheet() {
    setPendingTab(tab)
    setPendingTime(timeWindow)
    setPendingSort(sortBy)
    setShowFilterSheet(true)
  }

  function applyFilters() {
    setTab(pendingTab)
    setTimeWindow(pendingTime)
    setSortBy(pendingSort)
    setShowFilterSheet(false)
  }

  function activeFilterCount(): number {
    let count = 0
    if (tab !== 'all') count++
    if (timeWindow !== 'all') count++
    return count
  }

  const tabLabels: Record<QuoteTab, string> = {
    all: translate('quotes.filter.all'),
    pending: translate('quotes.filter.pending'),
    won: translate('quotes.filter.won'),
    lost: translate('quotes.filter.lost'),
  }
  const timeLabels: Record<TimeWindow, string> = {
    all: translate('quotes.time.all'),
    today: translate('quotes.time.today'),
    week: translate('quotes.time.week'),
    month: translate('quotes.time.month'),
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Sticky header */}
      <View
        style={[
          styles.stickyHeader,
          { backgroundColor: t.bg, borderBottomColor: t.border },
        ]}
      >
        <View style={styles.stickyHeaderInner}>
          <View style={styles.titleRow}>
            <View
              style={[styles.headerIcon, { backgroundColor: '#2563EB' + '12' }]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#2563EB"
              />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: t.text }]}>
                {translate('quotes.title')}
              </Text>
              <Text style={[styles.titleSub, { color: t.textMuted }]}>
                {translate('quotes.totalCount', { count: quotes.length })}
                {quotes.length > 0
                  ? ` · ${translate('quotes.activeCount', { count: pendingQuotes.length })}`
                  : ''}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.searchBar,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Ionicons name="search-outline" size={16} color={t.textSubtle} />
            <TextInput
              style={[styles.searchInput, { color: t.text }]}
              placeholder={translate('quotes.searchPlaceholder')}
              placeholderTextColor={t.textSubtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={t.textSubtle} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <FlashList
        data={isLoading ? [] : displayed}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll]}
        ListHeaderComponent={
          isLoading ? (
            <View style={styles.skeletonWrap}>
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} t={t} />
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {
                    backgroundColor: t.accent + '08',
                    borderColor: t.accent + '15',
                  },
                ]}
              >
                <Ionicons
                  name={
                    tab === 'lost'
                      ? 'close-circle-outline'
                      : 'chatbubbles-outline'
                  }
                  size={32}
                  color={t.accent}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                {tab === 'all'
                  ? translate('quotes.empty.title')
                  : tab === 'pending'
                    ? translate('quotes.empty.pending')
                    : tab === 'won'
                      ? translate('quotes.empty.won')
                      : translate('quotes.empty.lost')}
              </Text>
              <Text style={[styles.emptyDesc, { color: t.textMuted }]}>
                {tab === 'all'
                  ? translate('quotes.empty.description')
                  : tab === 'won'
                    ? translate('quotes.empty.wonDescription')
                    : tab === 'lost'
                      ? translate('quotes.empty.lostDescription')
                      : translate('quotes.empty.filterDescription')}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponentStyle={isLoading ? undefined : { display: 'none' }}
        renderItem={({ item, index }) => (
          <QuoteCard
            item={item}
            index={index}
            t={t}
            onSelect={() => handleSelectQuote(item)}
            onEdit={handleEditQuote}
            onRetract={handleRetract}
            onRemind={handleRemind}
            actionLoading={actionLoading}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />

      {/* Floating filter button */}
      <Pressable
        onPress={openFilterSheet}
        style={({ pressed }) => [
          styles.fab,
          isRTL
            ? { left: spacing.xl, right: undefined }
            : { right: spacing.xl, left: undefined },
          {
            backgroundColor: activeFilterCount() > 0 ? t.accent : t.surface,
            borderColor: activeFilterCount() > 0 ? t.accent : t.border,
          },
          pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Ionicons
          name="funnel-outline"
          size={20}
          color={activeFilterCount() > 0 ? t.accentFg : t.textMuted}
        />
        {activeFilterCount() > 0 && (
          <View
            style={[
              styles.fabBadge,
              isRTL
                ? { left: -4, right: undefined }
                : { right: -4, left: undefined },
              { backgroundColor: t.accentFg },
            ]}
          >
            <Text style={[styles.fabBadgeText, { color: t.accent }]}>
              {activeFilterCount()}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Filter bottom sheet */}
      <Modal
        visible={showFilterSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowFilterSheet(false)}
          />
          <View style={[styles.sheetBody, { backgroundColor: t.surface }]}>
            <View style={[styles.sheetHeader, { borderColor: t.border }]}>
              <Text style={[styles.sheetTitle, { color: t.text }]}>
                {translate('quotes.filter.title')}
              </Text>
              <Pressable onPress={() => setShowFilterSheet(false)} hitSlop={10}>
                <View
                  style={[styles.sheetCloseBtn, { backgroundColor: t.bgMuted }]}
                >
                  <Ionicons name="close" size={18} color={t.textMuted} />
                </View>
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
            >
              <Text style={[styles.sheetSectionTitle, { color: t.textSubtle }]}>
                {translate('quotes.filter.status')}
              </Text>
              <View style={styles.sheetPillRow}>
                {(Object.keys(tabLabels) as Array<QuoteTab>).map((k) => {
                  const active = pendingTab === k
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setPendingTab(k)}
                      style={({ pressed }) => [
                        styles.sheetPill,
                        {
                          backgroundColor: active ? t.accent + '12' : t.bgMuted,
                          borderColor: active ? t.accent : t.border,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sheetPillText,
                          { color: active ? t.accent : t.textMuted },
                        ]}
                      >
                        {tabLabels[k]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <Text
                style={[
                  styles.sheetSectionTitle,
                  { color: t.textSubtle, marginTop: spacing.xl },
                ]}
              >
                {translate('quotes.filter.period')}
              </Text>
              <View style={styles.sheetPillRow}>
                {(Object.keys(timeLabels) as Array<TimeWindow>).map((k) => {
                  const active = pendingTime === k
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setPendingTime(k)}
                      style={({ pressed }) => [
                        styles.sheetPill,
                        {
                          backgroundColor: active ? t.accent + '12' : t.bgMuted,
                          borderColor: active ? t.accent : t.border,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sheetPillText,
                          { color: active ? t.accent : t.textMuted },
                        ]}
                      >
                        {timeLabels[k]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              <Text
                style={[
                  styles.sheetSectionTitle,
                  { color: t.textSubtle, marginTop: spacing.xl },
                ]}
              >
                {translate('quotes.filter.sortBy')}
              </Text>
              <View style={styles.sheetSortList}>
                {SORT_OPTIONS(translate).map((opt) => {
                  const active = pendingSort === opt.key
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => setPendingSort(opt.key)}
                      style={({ pressed }) => [
                        styles.sheetSortItem,
                        { borderColor: active ? t.accent : t.border },
                        active && { backgroundColor: t.accent + '08' },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View
                        style={[
                          styles.sheetSortIcon,
                          {
                            backgroundColor: active
                              ? t.accent + '12'
                              : t.bgMuted,
                          },
                        ]}
                      >
                        <Ionicons
                          name={opt.icon}
                          size={16}
                          color={active ? t.accent : t.textMuted}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sheetSortLabel,
                          { color: active ? t.accent : t.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <View
                        style={[
                          styles.sheetSortCheck,
                          {
                            backgroundColor: active ? t.accent : 'transparent',
                            borderColor: active ? t.accent : t.border,
                          },
                        ]}
                      >
                        {active && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={t.accentFg}
                          />
                        )}
                      </View>
                    </Pressable>
                  )
                })}
              </View>
            </ScrollView>

            <View style={[styles.sheetFooter, { borderColor: t.border }]}>
              <Pressable
                onPress={() => {
                  setPendingTab('all')
                  setPendingTime('all')
                  setPendingSort('date-new')
                }}
                style={({ pressed }) => [
                  styles.sheetReset,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.sheetResetText, { color: t.textMuted }]}>
                  {translate('quotes.filter.reset')}
                </Text>
              </Pressable>
              <Pressable
                onPress={applyFilters}
                style={({ pressed }) => [
                  styles.sheetApply,
                  { backgroundColor: t.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.sheetApplyText, { color: t.accentFg }]}>
                  {translate('quotes.filter.apply')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Retract Confirm Overlay ── */}
      {showRetractConfirm && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.wcBackdrop, { opacity: wcBackdrop }]} />
          <Animated.View
            style={[
              styles.wcCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: wcOpacity,
                transform: [{ scale: wcScale }],
              },
            ]}
          >
            <View
              style={[
                styles.wcIconWrap,
                {
                  backgroundColor: '#d97706' + '12',
                  borderColor: '#d97706' + '25',
                },
              ]}
            >
              <Ionicons name="trash-outline" size={40} color="#d97706" />
            </View>
            <View style={[styles.wcAccent, { backgroundColor: '#d97706' }]} />
            <Text style={[styles.wcTitle, { color: t.text }]}>
              {translate('quotes.retractConfirmTitle')}
            </Text>
            <Text style={[styles.wcDesc, { color: t.textMuted }]}>
              {translate('quotes.retractConfirmDesc')}
            </Text>
            <View style={styles.wcActions}>
              <Pressable
                onPress={() => {
                  setShowRetractConfirm(false)
                  setPendingRetractId(null)
                }}
                style={({ pressed }) => [
                  styles.wcCancel,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.wcCancelText, { color: t.textMuted }]}>
                  {translate('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmRetract}
                style={({ pressed }) => [
                  styles.wcConfirm,
                  { backgroundColor: '#d97706' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Ionicons name="checkmark-outline" size={18} color="#fff" />
                <Text style={styles.wcConfirmText}>
                  {translate('quotes.retractQuote')}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {/* ── Error Overlay ── */}
      {showError && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable
            style={styles.errBackdrop}
            onPress={() => setShowError(false)}
          />
          <View
            style={[
              styles.errCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.wcIconWrap,
                {
                  backgroundColor: '#dc2626' + '12',
                  borderColor: '#dc2626' + '25',
                },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={40} color="#dc2626" />
            </View>
            <View style={[styles.wcAccent, { backgroundColor: '#dc2626' }]} />
            <Text style={[styles.wcTitle, { color: t.text }]}>
              {translate('common.error')}
            </Text>
            <Text style={[styles.wcDesc, { color: t.textMuted }]}>
              {errorMessage}
            </Text>
            <Pressable
              onPress={() => setShowError(false)}
              style={({ pressed }) => [
                styles.wcConfirm,
                {
                  backgroundColor: '#dc2626',
                  minWidth: 140,
                  alignSelf: 'center',
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.wcConfirmText}>{translate('common.ok')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Retract Success Overlay ── */}
      {showRetractSuccess && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.wsBackdrop, { opacity: wsBackdrop }]} />
          <Animated.View
            style={[
              styles.wsCard,
              {
                backgroundColor: t.surface,
                borderColor: t.border,
                opacity: wsOpacity,
                transform: [{ scale: wsScale }, { translateY: wsSlide }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.wsCheckWrap,
                { backgroundColor: C.won + '12', borderColor: C.won + '25' },
                { transform: [{ scale: wsCheck }] },
              ]}
            >
              <Ionicons name="checkmark-circle" size={48} color={C.won} />
            </Animated.View>
            <View style={[styles.wsAccent, { backgroundColor: C.won }]} />
            <Text style={[styles.wsTitle, { color: t.text }]}>
              {translate('quotes.retractSuccessTitle')}
            </Text>
            <Text style={[styles.wsDesc, { color: t.textMuted }]}>
              {translate('quotes.retractSuccessDesc')}
            </Text>
            <Pressable
              onPress={() => setShowRetractSuccess(false)}
              style={({ pressed }) => [
                styles.wsBtn,
                { backgroundColor: C.won },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
              <Text style={styles.wsBtnText}>{translate('common.done')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  )
}

function SkeletonCard({ t }: { t: Theme }) {
  const styles = makeStyles(t)
  const shimmer = useRef(new Animated.Value(0.35)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 0.75,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [shimmer])

  return (
    <View style={[styles.qCardShadow]}>
      <Animated.View
        style={[
          styles.qCard,
          {
            backgroundColor: t.surface,
            borderColor: t.border,
            opacity: shimmer,
          },
        ]}
      >
        <View
          style={[
            styles.qCardTopAccent,
            { backgroundColor: t.border, borderColor: t.border, opacity: 0.3 },
          ]}
        />
        <View style={styles.qCardBody}>
          <View
            style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.xs }}
          >
            <View
              style={[
                styles.skelLine,
                {
                  width: 80,
                  height: 26,
                  backgroundColor: t.border,
                  borderRadius: 20,
                },
              ]}
            />
            <View
              style={[
                styles.skelLine,
                {
                  width: 60,
                  height: 26,
                  backgroundColor: t.border,
                  marginLeft: 'auto',
                  borderRadius: 8,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.skelLine,
              { width: '70%', height: 20, backgroundColor: t.border },
            ]}
          />
          <View
            style={[
              styles.skelLine,
              {
                width: '100%',
                height: 52,
                backgroundColor: t.border,
                borderRadius: 12,
              },
            ]}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={[
                styles.skelLine,
                { width: '40%', height: 28, backgroundColor: t.border },
              ]}
            />
            <View
              style={[
                styles.skelLine,
                {
                  width: '20%',
                  height: 24,
                  backgroundColor: t.border,
                  borderRadius: 8,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.skelLine,
              {
                width: '100%',
                height: 1,
                backgroundColor: t.border,
                opacity: 0.2,
              },
            ]}
          />
          <View
            style={[
              styles.skelLine,
              { width: '35%', height: 18, backgroundColor: t.border },
            ]}
          />
          <View
            style={[
              styles.skelLine,
              {
                width: '100%',
                height: 42,
                backgroundColor: t.border,
                borderRadius: 12,
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  )
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextWrap: {
      flex: 1,
    },
    title: {
      ...typography.display,
      fontSize: 26,
    },
    titleSub: {
      fontSize: 13,
      marginTop: 2,
    },

    /* Sticky header */
    stickyHeader: {
      paddingTop:
        Platform.OS === 'ios'
          ? 54
          : (StatusBar.currentHeight ?? 28) + spacing.sm,
      borderBottomWidth: 1,
      zIndex: 10,
    },
    stickyHeaderInner: {
      paddingHorizontal: 20,
      paddingBottom: spacing.sm,
    },

    /* Search */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
    },

    /* FAB */
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    fabBadge: {
      position: 'absolute',
      top: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    fabBadgeText: {
      fontSize: 10,
      fontWeight: '800',
    },

    /* Quote card */
    qCard: {
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    qCardShadow: {
      elevation: 4,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    qCardTopAccent: {
      height: 4,
      borderBottomWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: spacing.md,
    },
    qCardAccentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: -1,
    },
    qCardBody: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    qCardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    qCardStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
    },
    qCardStatusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    qCardStatusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    qCardTimeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    qCardTimeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    qCardPartName: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
      lineHeight: 24,
    },
    qCardVehicle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
    },
    qCardVehicleIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    qCardVehicleInfo: {
      flex: 1,
      gap: 2,
    },
    qCardVehicleBrand: {
      fontSize: 14,
      fontWeight: '700',
    },
    qCardVehicleYear: {
      fontSize: 12,
      fontWeight: '500',
    },
    qCardPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    qCardPriceInner: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    qCardPriceAmount: {
      fontSize: 26,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    qCardPriceCurrency: {
      fontSize: 15,
      fontWeight: '600',
    },
    qCardCond: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    qCardCondText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    qCardDivider: {
      height: 1,
      opacity: 0.2,
    },
    qCardBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    qCardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    qCardMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    qCardMetaIconBox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qCardMetaText: {
      fontSize: 12,
      fontWeight: '500',
    },
    qCardActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
      borderRadius: 12,
      borderWidth: 1,
      padding: spacing.sm,
    },
    qCardEditBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 10,
      paddingVertical: 12,
      minHeight: 44,
    },
    qCardEditText: {
      fontSize: 14,
      fontWeight: '700',
    },
    qCardWithdrawBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 12,
      minHeight: 44,
    },
    qCardWithdrawText: {
      fontSize: 14,
      fontWeight: '600',
    },

    /* Skeleton */
    skeletonWrap: {
      gap: spacing.md,
    },
    skelLine: {
      height: 14,
      borderRadius: radius.sm,
    },

    /* Empty state */
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      gap: spacing.md,
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
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

    /* Filter sheet */
    sheetOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheetBody: {
      maxHeight: '80%',
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingBottom: spacing.xxl,
      flex: 1,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
    },
    sheetCloseBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetTitle: {
      ...typography.h2,
      fontSize: 20,
    },
    sheetScroll: {
      flex: 1,
    },
    sheetScrollContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },
    sheetSectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.md,
    },
    sheetPillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sheetPill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
    },
    sheetPillText: {
      fontSize: 13,
      fontWeight: '700',
    },
    sheetSortList: {
      gap: spacing.sm,
    },
    sheetSortItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
    },
    sheetSortIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetSortLabel: {
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    sheetSortCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetFooter: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      marginTop: spacing.md,
    },
    sheetReset: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    sheetResetText: {
      fontSize: 15,
      fontWeight: '600',
    },
    sheetApply: {
      flex: 2,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: radius.md,
    },
    sheetApplyText: {
      fontSize: 15,
      fontWeight: '700',
    },

    /* ── Withdraw Success ── */
    wsBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    wsCard: {
      position: 'absolute',
      left: spacing.xl,
      right: spacing.xl,
      top: '30%',
      alignItems: 'center',
      paddingVertical: spacing.xl + spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: 24,
      borderWidth: 1,
      gap: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    wsCheckWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: spacing.sm,
    },
    wsAccent: {
      width: 40,
      height: 3,
      borderRadius: 2,
      marginBottom: spacing.xs,
    },
    wsTitle: {
      fontSize: 22,
      fontWeight: '800',
    },
    wsDesc: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    wsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl + spacing.lg,
      minHeight: 48,
      marginTop: spacing.sm,
    },
    wsBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },

    /* ── Withdraw Confirm ── */
    wcBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    wcCard: {
      position: 'absolute',
      left: spacing.xl,
      right: spacing.xl,
      top: '30%',
      alignItems: 'center',
      paddingVertical: spacing.xl + spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: 24,
      borderWidth: 1,
      gap: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    wcIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: spacing.sm,
    },
    wcAccent: {
      width: 40,
      height: 3,
      borderRadius: 2,
      marginBottom: spacing.xs,
    },
    wcTitle: {
      fontSize: 22,
      fontWeight: '800',
    },
    wcDesc: {
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    wcActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
      width: '100%',
    },
    wcCancel: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      minHeight: 48,
    },
    wcCancelText: {
      fontSize: 15,
      fontWeight: '600',
    },
    wcConfirm: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: 14,
      borderRadius: radius.md,
      minHeight: 48,
    },
    wcConfirmText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },

    /* ── Error Overlay ── */
    errBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    errCard: {
      position: 'absolute',
      left: spacing.xl,
      right: spacing.xl,
      top: '30%',
      alignItems: 'center',
      paddingVertical: spacing.xl + spacing.lg,
      paddingHorizontal: spacing.xl,
      borderRadius: 24,
      borderWidth: 1,
      gap: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
  })
}
