import Ionicons from '@expo/vector-icons/Ionicons'
import { useRef, useState } from 'react'
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { SellerQuoteForm } from './SellerQuoteForm'
import type { OpenRequestRow } from '../types/seller'

interface ExistingQuoteData {
  id: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
}

interface SellerQuoteModalProps {
  visible: boolean
  request: OpenRequestRow | null
  existingQuote: ExistingQuoteData | null
  sellerId: string
  onClose: () => void
  onSuccess: () => void
  onRequestCredits?: () => void
}

type Tab = 'details' | 'offer'

export function SellerQuoteModal({
  visible,
  request,
  existingQuote,
  sellerId,
  onClose,
  onSuccess,
  onRequestCredits,
}: SellerQuoteModalProps) {
  const t = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [imageIndex, setImageIndex] = useState(0)
  const indicatorAnim = useRef(new Animated.Value(0)).current

  if (!request) return null

  const images = request.imageUrls ?? []
  const isEditing = !!existingQuote

  function switchTab(tab: Tab) {
    setActiveTab(tab)
    Animated.spring(indicatorAnim, {
      toValue: tab === 'details' ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start()
  }

  const detailsContent = (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={styles.tabScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Images */}
      {images.length > 0 ? (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: images[imageIndex] }}
            style={styles.image}
            resizeMode="cover"
          />
          {images.length > 1 && (
            <>
              <View style={styles.imageDots}>
                {images.map((_, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setImageIndex(i)}
                    style={[
                      styles.imageDot,
                      {
                        backgroundColor:
                          i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                        width: i === imageIndex ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
              {imageIndex > 0 && (
                <Pressable
                  style={[styles.imageChevron, styles.imageChevronLeft]}
                  onPress={() => setImageIndex((p) => p - 1)}
                >
                  <Ionicons name="chevron-back" size={18} color="#fff" />
                </Pressable>
              )}
              {imageIndex < images.length - 1 && (
                <Pressable
                  style={[styles.imageChevron, styles.imageChevronRight]}
                  onPress={() => setImageIndex((p) => p + 1)}
                >
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </Pressable>
              )}
            </>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            { backgroundColor: t.bgMuted, borderColor: t.border },
          ]}
        >
          <Ionicons name="image-outline" size={32} color={t.textSubtle} />
          <Text style={[styles.imagePlaceholderText, { color: t.textSubtle }]}>
            No images
          </Text>
        </View>
      )}

      {/* Part name */}
      <Text style={[styles.partName, { color: t.text }]}>
        {request.partName.toUpperCase()}
      </Text>

      {/* Specs grid */}
      <View style={styles.specsGrid}>
        <View
          style={[
            styles.specCard,
            { backgroundColor: t.bgMuted, borderColor: t.border },
          ]}
        >
          <View style={styles.specHeader}>
            <Ionicons name="car-sport-outline" size={13} color={t.accent} />
            <Text style={[styles.specLabel, { color: t.textSubtle }]}>
              Vehicle
            </Text>
          </View>
          <Text style={[styles.specValue, { color: t.text }]}>
            {request.vehicleBrand}
          </Text>
          <Text style={[styles.specSub, { color: t.textMuted }]}>
            Year {request.modelYear}
          </Text>
        </View>

        <View
          style={[
            styles.specCard,
            { backgroundColor: t.bgMuted, borderColor: t.border },
          ]}
        >
          <View style={styles.specHeader}>
            <Ionicons name="barcode-outline" size={13} color={t.accent} />
            <Text style={[styles.specLabel, { color: t.textSubtle }]}>
              OEM #
            </Text>
          </View>
          <Text style={[styles.specValue, { color: t.text }]} numberOfLines={2}>
            {request.oemNumber ?? 'N/A'}
          </Text>
        </View>

        {request.category && (
          <View
            style={[
              styles.specCard,
              { backgroundColor: t.bgMuted, borderColor: t.border },
            ]}
          >
            <View style={styles.specHeader}>
              <Ionicons name="grid-outline" size={13} color={t.accent} />
              <Text style={[styles.specLabel, { color: t.textSubtle }]}>
                Category
              </Text>
            </View>
            <Text style={[styles.specValue, { color: t.accent }]}>
              {request.category.name}
            </Text>
          </View>
        )}

        {request.brand && (
          <View
            style={[
              styles.specCard,
              { backgroundColor: t.bgMuted, borderColor: t.border },
            ]}
          >
            <View style={styles.specHeader}>
              <Ionicons name="pricetag-outline" size={13} color={t.accent} />
              <Text style={[styles.specLabel, { color: t.textSubtle }]}>
                Brand
              </Text>
            </View>
            <Text style={[styles.specValue, { color: t.text }]}>
              {request.brand.brand}
            </Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {request.notes && (
        <View
          style={[
            styles.notesBox,
            { backgroundColor: t.bgMuted + '80', borderColor: t.border },
          ]}
        >
          <Text style={[styles.notesLabel, { color: t.textSubtle }]}>
            Buyer Notes
          </Text>
          <Text style={[styles.notesText, { color: t.text }]}>
            "{request.notes}"
          </Text>
        </View>
      )}
    </ScrollView>
  )

  const offerContent = (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={styles.tabScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.offerHeader}>
        <Text style={[styles.offerTitle, { color: t.text }]}>
          {isEditing ? 'Edit Your Offer' : 'Submit an Offer'}
        </Text>
        <Text style={[styles.offerDesc, { color: t.textMuted }]}>
          {isEditing
            ? 'Update your price, condition, or warranty.'
            : 'Set your price, condition and warranty for this part.'}
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
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheet, { backgroundColor: t.surface }]}>
          {/* Drag handle */}
          <View style={styles.dragHandleRow}>
            <View style={[styles.dragHandle, { backgroundColor: t.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: t.border }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.headerIcon,
                  { backgroundColor: t.accent + '12' },
                ]}
              >
                <Ionicons
                  name={isEditing ? 'pencil-outline' : 'storefront-outline'}
                  size={18}
                  color={t.accent}
                />
              </View>
              <Text
                style={[styles.headerTitle, { color: t.text }]}
                numberOfLines={1}
              >
                {request.partName}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: t.bgMuted },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="close" size={18} color={t.textMuted} />
            </Pressable>
          </View>

          {/* Tab bar */}
          <View style={[styles.tabBar, { borderBottomColor: t.border }]}>
            <Pressable
              style={[
                styles.tabBtn,
                activeTab === 'details' && {
                  borderBottomColor: t.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => switchTab('details')}
            >
              <Ionicons
                name="document-text-outline"
                size={15}
                color={activeTab === 'details' ? t.accent : t.textSubtle}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color: activeTab === 'details' ? t.accent : t.textSubtle,
                    fontWeight: activeTab === 'details' ? '800' : '600',
                  },
                ]}
              >
                Details
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabBtn,
                activeTab === 'offer' && {
                  borderBottomColor: t.accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => switchTab('offer')}
            >
              <Ionicons
                name="sparkles"
                size={15}
                color={activeTab === 'offer' ? t.accent : t.textSubtle}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  {
                    color: activeTab === 'offer' ? t.accent : t.textSubtle,
                    fontWeight: activeTab === 'offer' ? '800' : '600',
                  },
                ]}
              >
                {isEditing ? 'Edit Offer' : 'Submit Offer'}
              </Text>
            </Pressable>
          </View>

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === 'details' ? detailsContent : offerContent}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 17,
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  /* Tab content */
  tabContent: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabScrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  /* Images */
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  imageDot: {
    height: 6,
    borderRadius: 3,
  },
  imageChevron: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageChevronLeft: { left: 10 },
  imageChevronRight: { right: 10 },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Part name */
  partName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 26,
  },

  /* Specs */
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specCard: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
  },
  specHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  specSub: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* Notes */
  notesBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.md,
    gap: spacing.sm,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  notesText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
  },

  /* Offer tab header */
  offerHeader: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  offerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  offerDesc: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
})
