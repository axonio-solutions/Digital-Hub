import Ionicons from '@expo/vector-icons/Ionicons'
import { EmptyState } from '../components/EmptyState'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native'
import { ScrollView, Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'

import { fetchOpenRequests } from '../lib/api-client'
import { openRequestsQueryOptions } from '../features/seller/queries/marketplace'
import { creditBalanceQueryOptions } from '../features/seller/queries/dashboard'
import { taxonomyQueryOptions } from '../features/taxonomy/queries/taxonomy'
import { radius, spacing, typography } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import type { OpenRequestRow } from '../types/seller'
import type { SellerMarketplaceStackParamList } from '../navigation/types'
import { useTranslation } from 'react-i18next'
import { tCategory } from '../utils/category-utils'

const PAGE_LIMIT = 12

interface MarketplaceScreenProps {
  onNavigateBilling?: () => void
  onSelectRequest?: (request: OpenRequestRow) => void
  refreshKey?: number
}

export function MarketplaceScreen({
  onNavigateBilling,
  onSelectRequest,
  refreshKey,
}: MarketplaceScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<SellerMarketplaceStackParamList>>()
  const user = useUserStore((s) => s.user)
  const t = useTheme()
  const styles = makeStyles(t)
  const { t: tr, i18n } = useTranslation()
  const isRTL = useIsRTL()
  const queryClient = useQueryClient()
  const [requests, setRequests] = useState<Array<OpenRequestRow>>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrands, setSelectedBrands] = useState<Array<string>>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [pendingBrands, setPendingBrands] = useState<Array<string>>([])
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [filterTab, setFilterTab] = useState<'category' | 'brand'>('category')

  const { data: taxonomy } = useQuery(taxonomyQueryOptions)
  const { data: credit } = useQuery(creditBalanceQueryOptions)
  const categories = taxonomy?.categories ?? []
  const brands = taxonomy?.brands ?? []

  const buildFilters = useCallback(
    (offset: number) => ({
      ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(selectedBrands.length > 0 ? { brandIds: selectedBrands } : {}),
      limit: PAGE_LIMIT,
      offset,
    }),
    [selectedCategory, search, selectedBrands],
  )

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      try {
        const requestsData = await fetchOpenRequests(buildFilters(0))
        setRequests(requestsData)
        setCreditBalance(credit?.balance ?? 0)
        setHasMore(requestsData.length >= PAGE_LIMIT)
        setPage(0)
      } catch {
        // silently fail — stale data is fine
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [buildFilters, credit?.balance],
  )

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (refreshKey !== undefined) load()
  }, [refreshKey])

  useFocusEffect(
    useCallback(() => {
      load(true)
    }, [load]),
  )

  async function handleLoadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextOffset = (page + 1) * PAGE_LIMIT
      const data = await fetchOpenRequests(buildFilters(nextOffset))
      setRequests((prev) => [...prev, ...data])
      setHasMore(data.length >= PAGE_LIMIT)
      setPage((p) => p + 1)
    } catch {
      // silently fail
    } finally {
      setLoadingMore(false)
    }
  }

  function handleSearch() {
    // reload triggered via useEffect when buildFilters changes
  }

  function handleClearSearch() {
    setSearch('')
  }

  function handleRequestForQuote(item: OpenRequestRow) {
    if (creditBalance <= 0) {
      setShowCreditModal(true)
    } else {
      if (onSelectRequest) onSelectRequest(item)
      else
        navigation.navigate('SubmitQuote', {
          request: item,
          existingQuote: null,
          sellerId: user?.id ?? '',
        })
    }
  }

  const renderRequestCard = useCallback(
    ({ item, index }: { item: OpenRequestRow; index: number }) => (
      <RequestCard
        item={item}
        index={index}
        onPress={() => handleRequestForQuote(item)}
        t={t}
      />
    ),
    [creditBalance, t],
  )

  const activeFilterCount = (selectedCategory ? 1 : 0) + selectedBrands.length

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
          <View style={styles.headerGroup}>
            <View
              style={[styles.headerIcon, { backgroundColor: '#2563EB' + '12' }]}
            >
              <Ionicons name="storefront-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: t.text }]}>
                {tr('marketplace.title')}
              </Text>
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                {tr('marketplace.subtitle')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.searchBar,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={t.textSubtle} />
            <TextInput
              style={[styles.searchInput, { color: t.text }]}
              placeholder={tr('marketplace.searchPlaceholder')}
              placeholderTextColor={t.textSubtle}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={18} color={t.textSubtle} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <FlashList
        data={loading ? [] : requests}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll]}
        ListHeaderComponent={
          loading ? (
            <View style={styles.skeletonWrap}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} t={t} />
              ))}
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading && hasMore && requests.length > 0 ? (
            <Pressable
              onPress={handleLoadMore}
              disabled={loadingMore}
              style={({ pressed }) => [
                styles.loadMoreBtn,
                { borderColor: t.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.loadMoreText, { color: t.accent }]}>
                {loadingMore
                  ? tr('marketplace.loading')
                  : tr('marketplace.loadMore')}
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={
                <Ionicons name="cube-outline" size={48} color={t.textSubtle} />
              }
              title={tr('marketplace.empty.title')}
              description={
                search || activeFilterCount > 0
                  ? tr('marketplace.empty.noResults')
                  : tr('marketplace.empty.noRequests')
              }
              style={{ paddingTop: 80 }}
            />
          ) : null
        }
        renderItem={renderRequestCard}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />

      {/* Floating filter FAB */}
      <Pressable
        onPress={() => {
          setPendingCategory(selectedCategory)
          setPendingBrands([...selectedBrands])
          setShowFilterSheet(true)
        }}
        style={({ pressed }) => [
          styles.fab,
          isRTL ? { left: spacing.xl } : { right: spacing.xl },
          {
            backgroundColor: activeFilterCount > 0 ? '#2563EB' : t.surface,
            borderColor: activeFilterCount > 0 ? '#2563EB' : t.border,
          },
          pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Ionicons
          name="funnel-outline"
          size={20}
          color={activeFilterCount > 0 ? '#fff' : t.textMuted}
        />
        {activeFilterCount > 0 && (
          <View
            style={[
              styles.fabBadge,
              isRTL ? { left: -4 } : { right: -4 },
              { backgroundColor: '#fff' },
            ]}
          >
            <Text style={[styles.fabBadgeText, { color: '#2563EB' }]}>
              {activeFilterCount}
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
                {tr('marketplace.filterTitle')}
              </Text>
              <Pressable onPress={() => setShowFilterSheet(false)} hitSlop={10}>
                <View
                  style={[styles.sheetCloseBtn, { backgroundColor: t.bgMuted }]}
                >
                  <Ionicons name="close" size={18} color={t.textMuted} />
                </View>
              </Pressable>
            </View>

            {/* Tabs */}
            <View style={[styles.sheetTabs, { borderColor: t.border }]}>
              <Pressable
                onPress={() => setFilterTab('category')}
                style={[
                  styles.sheetTab,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  filterTab === 'category' && {
                    borderBottomColor: '#2563EB',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Ionicons
                  name="grid-outline"
                  size={16}
                  color={filterTab === 'category' ? '#2563EB' : t.textMuted}
                />
                <Text
                  style={[
                    styles.sheetTabText,
                    {
                      color: filterTab === 'category' ? '#2563EB' : t.textMuted,
                    },
                  ]}
                >
                  {tr('marketplace.allCategories')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilterTab('brand')}
                style={[
                  styles.sheetTab,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  filterTab === 'brand' && {
                    borderBottomColor: '#2563EB',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Ionicons
                  name="pricetags-outline"
                  size={16}
                  color={filterTab === 'brand' ? '#2563EB' : t.textMuted}
                />
                <Text
                  style={[
                    styles.sheetTabText,
                    { color: filterTab === 'brand' ? '#2563EB' : t.textMuted },
                  ]}
                >
                  {tr('marketplace.allBrands')}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
            >
              {filterTab === 'category' ? (
                <View style={styles.sheetCatGrid}>
                  {categories.map((cat) => {
                    const active = pendingCategory === cat.id
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() =>
                          setPendingCategory(active ? null : cat.id)
                        }
                        style={[
                          styles.sheetCatCard,
                          {
                            backgroundColor: t.surface,
                            borderColor: active ? '#2563EB' : t.border,
                          },
                          active && { borderWidth: 2 },
                        ]}
                      >
                        {cat.imageUrl ? (
                          <Image
                            source={{ uri: cat.imageUrl }}
                            style={styles.sheetCatImage}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={[
                              styles.sheetCatInitials,
                              {
                                backgroundColor: active
                                  ? '#2563EB' + '15'
                                  : t.accent + '10',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.sheetCatInitialsText,
                                { color: active ? '#2563EB' : t.accent },
                              ]}
                            >
                              {getBrandInitials(cat.name)}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.sheetCatName,
                            { color: active ? '#2563EB' : t.text },
                          ]}
                          numberOfLines={2}
                        >
                          {cat.name}
                        </Text>
                        {active && (
                          <View
                            style={[
                              styles.sheetCatCheck,
                              isRTL
                                ? { left: spacing.sm }
                                : { right: spacing.sm },
                              { backgroundColor: '#2563EB' },
                            ]}
                          >
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          </View>
                        )}
                        {!active &&
                          pendingCategory === null &&
                          categories.indexOf(cat) === 0 &&
                          null}
                      </Pressable>
                    )
                  })}
                </View>
              ) : (
                <View style={styles.sheetBrandList}>
                  {brands.map((brand) => {
                    const selected = pendingBrands.includes(brand.id)
                    return (
                      <Pressable
                        key={brand.id}
                        onPress={() =>
                          setPendingBrands((prev) =>
                            prev.includes(brand.id)
                              ? prev.filter((id) => id !== brand.id)
                              : [...prev, brand.id],
                          )
                        }
                        style={({ pressed }) => [
                          styles.sheetBrandItem,
                          { flexDirection: isRTL ? 'row-reverse' : 'row' },
                          { borderColor: selected ? '#2563EB' : t.border },
                          selected && { backgroundColor: '#2563EB' + '08' },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        {brand.imageUrl ? (
                          <Image
                            source={{ uri: brand.imageUrl }}
                            style={styles.sheetBrandLogo}
                            contentFit="contain"
                          />
                        ) : (
                          <View
                            style={[
                              styles.sheetBrandLogoInit,
                              { backgroundColor: t.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.sheetBrandLogoInitText,
                                { color: t.textMuted },
                              ]}
                            >
                              {getBrandInitials(brand.brand)}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[
                            styles.sheetBrandText,
                            { color: selected ? '#2563EB' : t.text },
                          ]}
                        >
                          {brand.brand}
                        </Text>
                        <View
                          style={[
                            styles.sheetBrandCheck,
                            {
                              backgroundColor: selected
                                ? '#2563EB'
                                : 'transparent',
                              borderColor: selected ? '#2563EB' : t.border,
                            },
                          ]}
                        >
                          {selected && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              )}
            </ScrollView>

            <View style={[styles.sheetFooter, { borderColor: t.border }]}>
              <Pressable
                onPress={() => {
                  setPendingCategory(null)
                  setPendingBrands([])
                }}
                style={({ pressed }) => [
                  styles.sheetReset,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.sheetResetText, { color: t.textMuted }]}>
                  {tr('marketplace.filterReset')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedCategory(pendingCategory)
                  setSelectedBrands(pendingBrands)
                  setShowFilterSheet(false)
                }}
                style={({ pressed }) => [
                  styles.sheetApply,
                  { backgroundColor: '#2563EB' },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.sheetApplyText, { color: '#fff' }]}>
                  {tr('marketplace.filterApply')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreditModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCreditModal(false)}
        >
          <Pressable
            onPress={() => {}}
            style={[styles.modalContent, { backgroundColor: t.surface }]}
          >
            <Ionicons name="alert-circle-outline" size={44} color="#d97706" />
            <Text style={[styles.modalTitle, { color: t.text }]}>
              {tr('marketplace.insufficientCredits')}
            </Text>
            <Text style={[styles.modalDesc, { color: t.textMuted }]}>
              {tr('marketplace.insufficientCreditsDesc')}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowCreditModal(false)}
                style={({ pressed }) => [
                  styles.modalCancel,
                  { borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.modalCancelText, { color: t.textMuted }]}>
                  {tr('marketplace.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCreditModal(false)
                  if (onNavigateBilling) onNavigateBilling()
                  else navigation.navigate('Credits')
                }}
                style={({ pressed }) => [
                  styles.modalAction,
                  { backgroundColor: t.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={[styles.modalActionText, { color: t.accentFg }]}>
                  {tr('marketplace.buyCredits')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

function timeAgo(
  iso: string,
  t: (key: string, options?: Record<string, any>) => string,
  lang: string,
): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return t('common.minutesAgo', { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('common.hoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('common.daysAgo', { count: days })
  return new Date(iso).toLocaleDateString(lang, {
    month: 'short',
    day: 'numeric',
  })
}

function getBrandInitials(brand: string): string {
  const parts = brand.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return brand.substring(0, 2).toUpperCase()
}

function RequestCard({
  item,
  onPress,
  t,
  index,
}: {
  item: OpenRequestRow
  onPress: () => void
  t: Theme
  index?: number
}) {
  const { t: tr, i18n: i18nInst } = useTranslation()
  const isRTL = useIsRTL()
  const hasImage = !!item.imageUrls?.[0]
  const styles = makeStyles(t)
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardTranslateY = useRef(new Animated.Value(24)).current
  const sparkleOpacity = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    const delay = (index || 0) * 60
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start()

    const sparkleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    sparkleAnim.start()
    return () => sparkleAnim.stop()
  }, [])

  return (
    <Animated.View
      style={{
        opacity: cardOpacity,
        transform: [{ translateY: cardTranslateY }],
      }}
    >
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: t.surface, borderColor: t.border },
        ]}
      >
        <View style={styles.cardImageWrap}>
          {hasImage ? (
            <Image
              source={{ uri: item.imageUrls![0] }}
              style={styles.cardImage}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.cardImage,
                styles.cardImagePlaceholder,
                { backgroundColor: t.bgMuted },
              ]}
            >
              <View
                style={[
                  styles.cardImageIconBox,
                  { backgroundColor: t.surface, borderColor: t.border },
                ]}
              >
                <Ionicons name="car-outline" size={24} color={t.textSubtle} />
              </View>
            </View>
          )}

          <View style={styles.cardBadges}>
            <View
              style={[
                styles.badgeBrand,
                { backgroundColor: t.surface + 'e6', borderColor: t.border },
              ]}
            >
              {item.brand?.imageUrl ? (
                <Image
                  source={{ uri: item.brand.imageUrl }}
                  style={styles.badgeBrandImg}
                  contentFit="contain"
                />
              ) : (
                <View
                  style={[
                    styles.badgeBrandInitials,
                    { backgroundColor: t.accent + '15' },
                  ]}
                >
                  <Text
                    style={[styles.badgeBrandInitialsText, { color: t.accent }]}
                  >
                    {getBrandInitials(item.vehicleBrand)}
                  </Text>
                </View>
              )}
              <Text
                style={[styles.badgeBrandText, { color: t.text }]}
                numberOfLines={1}
              >
                {item.vehicleBrand}
              </Text>
            </View>
            <View style={styles.cardBadgesRight}>
              {item.isPriority && (
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyBadgeText}>
                    {tr('marketplace.urgent')}
                  </Text>
                </View>
              )}
              {item.category && (
                <View
                  style={[
                    styles.badgeCategory,
                    {
                      backgroundColor: t.surface + 'e6',
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Text style={[styles.badgeCategoryText, { color: t.text }]}>
                    {tCategory(item.category?.name, tr)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.blurCornerTR,
              isRTL ? { left: -40 } : { right: -40 },
              { backgroundColor: t.primary + '08' },
            ]}
          />
          <View
            style={[
              styles.blurCornerBL,
              isRTL ? { right: -40 } : { left: -40 },
              { backgroundColor: '#3b82f6' + '08' },
            ]}
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardBodyTop}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: '#05966915', borderColor: '#05966930' },
              ]}
            >
              <PulseDot />
              <Text style={[styles.statusText, { color: '#059669' }]}>
                {tr('requests.status.open')}
              </Text>
            </View>
            {item.quotesCount > 0 && (
              <View style={styles.quotesRow}>
                <Ionicons
                  name="chatbubble-outline"
                  size={12}
                  color={t.textSubtle}
                />
                <Text style={[styles.quotesText, { color: t.textSubtle }]}>
                  {item.quotesCount}
                </Text>
              </View>
            )}
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color={t.textSubtle} />
              <Text style={[styles.timeText, { color: t.textSubtle }]}>
                {timeAgo(item.createdAt, tr, i18nInst.language)}
              </Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text
              style={[styles.cardTitle, { color: t.text }]}
              numberOfLines={2}
            >
              {item.partName.toUpperCase()}
            </Text>
            <Ionicons
              name={isRTL ? 'arrow-back' : 'arrow-forward'}
              size={18}
              color={t.textSubtle + '80'}
            />
          </View>

          <View
            style={[
              styles.vehicleCard,
              { backgroundColor: t.bgMuted + '60', borderColor: t.border },
            ]}
          >
            <View
              style={[
                styles.vehicleIconBox,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              <Ionicons name="car-sport-outline" size={20} color={t.accent} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleHeader, { color: t.textSubtle }]}>
                {tr('marketplace.vehicle')}
              </Text>
              <Text
                style={[styles.vehicleModel, { color: t.text }]}
                numberOfLines={1}
              >
                {item.vehicleBrand}
              </Text>
              <Text style={[styles.vehicleYear, { color: t.textMuted }]}>
                {tr('marketplace.modelYear', { year: item.modelYear })}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.notesCard,
              {
                backgroundColor: t.bgMuted + '40',
                borderColor: t.border + '40',
              },
            ]}
          >
            <Text
              style={[styles.notesText, { color: t.textMuted }]}
              numberOfLines={2}
            >
              {item.notes || tr('marketplace.noDescription')}
            </Text>
          </View>

          <View
            style={[
              styles.actionBtn,
              {
                backgroundColor: t.accent + '12',
                borderColor: t.accent + '30',
              },
            ]}
          >
            <View style={styles.actionRow}>
              <Animated.View style={{ opacity: sparkleOpacity }}>
                <Ionicons name="sparkles" size={16} color={t.accent} />
              </Animated.View>
              <Text style={[styles.actionText, { color: t.accent }]}>
                {tr('marketplace.submitQuote')}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

function PulseDot() {
  const t = useTheme()
  const styles = makeStyles(t)
  const pulse = useRef(new Animated.Value(1)).current
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    )
    anim.start()
    return () => anim.stop()
  }, [pulse])
  return <Animated.View style={[styles.statusDot, { opacity: pulse }]} />
}

function SkeletonCard({ t }: { t: Theme }) {
  const styles = makeStyles(t)
  return (
    <View
      style={[
        styles.card,
        styles.skeletonCard,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View
        style={[styles.cardImage, { backgroundColor: t.border, opacity: 0.3 }]}
      />
      <View style={styles.cardBody}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 2 }}>
          <View
            style={[
              styles.skelLine,
              { width: 50, height: 22, backgroundColor: t.border },
            ]}
          />
          <View
            style={[
              styles.skelLine,
              {
                width: 60,
                height: 22,
                backgroundColor: t.border,
                marginLeft: 'auto',
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.skelLine,
            { width: '65%', height: 20, backgroundColor: t.border },
          ]}
        />
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: t.border,
            marginTop: spacing.sm,
          }}
        >
          <View
            style={[
              styles.skelLine,
              {
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: t.border,
              },
            ]}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <View
              style={[
                styles.skelLine,
                { width: '40%', height: 10, backgroundColor: t.border },
              ]}
            />
            <View
              style={[
                styles.skelLine,
                { width: '70%', height: 14, backgroundColor: t.border },
              ]}
            />
            <View
              style={[
                styles.skelLine,
                { width: '30%', height: 12, backgroundColor: t.border },
              ]}
            />
          </View>
        </View>
        <View
          style={[
            styles.skelLine,
            {
              width: '100%',
              height: 36,
              backgroundColor: t.border,
              borderRadius: 12,
              opacity: 0.3,
            },
          ]}
        />
      </View>
    </View>
  )
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.display,
      fontSize: 26,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '400',
      marginTop: 2,
    },
    headerGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
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
      paddingVertical: 12,
      fontSize: 15,
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
      gap: spacing.sm,
    },

    /* Floating filter FAB */
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

    /* Sheet tabs */
    sheetTabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
    },
    sheetTab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
    },
    sheetTabText: {
      fontSize: 14,
      fontWeight: '700',
    },

    /* Category grid */
    sheetCatGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    sheetCatCard: {
      width: '48%',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
      gap: spacing.sm,
      position: 'relative',
      marginBottom: spacing.sm,
    },
    sheetCatImage: {
      width: 48,
      height: 48,
      borderRadius: 12,
    },
    sheetCatInitials: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetCatInitialsText: {
      fontSize: 16,
      fontWeight: '800',
    },
    sheetCatName: {
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 16,
    },
    sheetCatCheck: {
      position: 'absolute',
      top: spacing.sm,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Brand list */
    sheetBrandList: {
      gap: spacing.sm,
    },
    sheetBrandItem: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.lg,
      borderRadius: 14,
      borderWidth: 1,
    },
    sheetBrandLogo: {
      width: 32,
      height: 32,
      borderRadius: 8,
    },
    sheetBrandLogoInit: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetBrandLogoInitText: {
      fontSize: 12,
      fontWeight: '700',
    },
    sheetBrandText: {
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    sheetBrandCheck: {
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

    skeletonWrap: {
      gap: spacing.md,
    },
    skeletonCard: {
      opacity: 0.5,
    },
    skelLine: {
      borderRadius: radius.sm,
    },
    card: {
      borderWidth: 1,
      borderRadius: 12,
      overflow: 'hidden',
    },
    cardImageWrap: {
      height: 224,
      position: 'relative',
    },
    cardImage: {
      width: '100%',
      height: 224,
    },
    cardImagePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardImageIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    cardBadges: {
      position: 'absolute',
      top: spacing.md,
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badgeBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      maxWidth: '55%',
    },
    badgeBrandImg: {
      width: 20,
      height: 20,
      borderRadius: 4,
    },
    badgeBrandInitials: {
      width: 20,
      height: 20,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeBrandInitialsText: {
      fontSize: 9,
      fontWeight: '800',
    },
    badgeBrandText: {
      fontSize: 11,
      fontWeight: '700',
    },
    badgeCategory: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    badgeCategoryText: {
      fontSize: 11,
      fontWeight: '700',
    },
    cardBadgesRight: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 4,
    },
    urgencyBadge: {
      backgroundColor: '#ef4444',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      shadowColor: '#ef4444',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    urgencyBadgeText: {
      color: '#ffffff',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    blurCornerTR: {
      position: 'absolute',
      top: -40,

      width: 160,
      height: 160,
      borderRadius: 80,
      pointerEvents: 'none',
    },
    blurCornerBL: {
      position: 'absolute',
      bottom: -40,

      width: 160,
      height: 160,
      borderRadius: 80,
      pointerEvents: 'none',
    },
    cardBody: {
      padding: spacing.lg,
      gap: spacing.sm,
    },
    cardBodyTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#059669',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    quotesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    quotesText: {
      fontSize: 12,
      fontWeight: '500',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginLeft: 'auto',
    },
    timeText: {
      fontSize: 11,
      fontWeight: '500',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '800',
      lineHeight: 24,
      letterSpacing: -0.5,
      fontStyle: 'italic',
      flex: 1,
    },
    vehicleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
    },
    vehicleIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    vehicleInfo: {
      flex: 1,
      gap: 2,
    },
    vehicleHeader: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    vehicleModel: {
      fontSize: 14,
      fontWeight: '700',
    },
    vehicleYear: {
      fontSize: 12,
      fontWeight: '600',
    },
    notesCard: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    notesText: {
      fontSize: 13,
      lineHeight: 18,
      flex: 1,
    },
    actionBtn: {
      borderWidth: 1,
      borderRadius: 16,
      overflow: 'hidden',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 12,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '800',
    },
    loadMoreBtn: {
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      marginTop: spacing.lg,
    },
    loadMoreText: {
      fontSize: 15,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    modalContent: {
      width: '100%',
      maxWidth: 320,
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.md,
    },
    modalTitle: {
      ...typography.h2,
      textAlign: 'center',
    },
    modalDesc: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    modalActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
      width: '100%',
    },
    modalCancel: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: '600',
    },
    modalAction: {
      flex: 2,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    modalActionText: {
      fontSize: 15,
      fontWeight: '700',
    },
    brandSheetOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    brandSheet: {
      maxHeight: '85%',
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingBottom: spacing.xxl,
      flex: 1,
    },
    brandSheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
    },
    brandSheetHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    brandSheetTitle: {
      ...typography.h2,
      fontSize: 20,
    },
    brandSheetCountBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    brandSheetCountText: {
      fontSize: 11,
      fontWeight: '700',
    },
    brandSearchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: spacing.xl,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    brandSearchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 15,
    },
    brandScroll: {
      flex: 1,
    },
    brandScrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
      flexGrow: 1,
    },
    popularSection: {
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    popularSectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.md,
    },
    popularGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    popularCard: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
      gap: spacing.sm,
      position: 'relative',
    },
    popularLogoWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    popularBrandImg: {
      width: 40,
      height: 40,
      borderRadius: 10,
    },
    popularLogoText: {
      fontSize: 14,
      fontWeight: '800',
    },
    popularBrandName: {
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    popularCheck: {
      position: 'absolute',
      top: spacing.sm,

      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    allBrandsSection: {
      marginBottom: spacing.lg,
    },
    allBrandsSectionTitle: {
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
    },
    brandItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    brandLogoImg: {
      width: 28,
      height: 28,
      borderRadius: 6,
    },
    brandLogoInit: {
      width: 28,
      height: 28,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandLogoInitText: {
      fontSize: 9,
      fontWeight: '700',
    },
    brandItemLogo: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandItemLogoText: {
      fontSize: 10,
      fontWeight: '700',
    },
    brandCheck: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
    },
    brandItemText: {
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    brandEmpty: {
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    brandSheetFooter: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      marginTop: spacing.md,
    },
    brandSheetCancel: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
      borderWidth: 1,
    },
    brandSheetCancelText: {
      fontSize: 14,
      fontWeight: '600',
    },
    brandSheetApply: {
      flex: 2,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    brandSheetApplyText: {
      fontSize: 15,
      fontWeight: '700',
    },
  })
}
