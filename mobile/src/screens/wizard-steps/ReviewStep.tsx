import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet } from 'react-native'
import { Text, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { RequestFormData } from '../NewRequestScreen'

interface Props {
  onEditStep: (step: number) => void
}

export function ReviewStep({ onEditStep }: Props) {
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const { watch } = useFormContext<RequestFormData>()
  const {
    partName,
    description,
    vehicleBrand,
    vehicleModel,
    modelYear,
    vinNumber,
    imageUrls,
  } = watch()

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          {translate('wizard.step.review')}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        {translate('wizard.reviewDescription')}
      </Text>

      <View style={styles.grid}>
        <ReviewCard
          title={translate('wizard.step.partDetails')}
          icon="list-outline"
          editStep={0}
          onEditStep={onEditStep}
          t={t}
          isRTL={isRTL}
        >
          <Text
            style={[styles.reviewValue, { color: t.text }]}
            numberOfLines={2}
          >
            {partName || translate('wizard.notProvided')}
          </Text>
          {vehicleBrand ? (
            <View style={[styles.reviewBadge, { backgroundColor: t.bgMuted }]}>
              <Text style={[styles.reviewBadgeText, { color: t.textMuted }]}>
                {vehicleBrand}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.reviewMuted, { color: t.textMuted }]}>
            {description || translate('wizard.noDetails')}
          </Text>
        </ReviewCard>

        <ReviewCard
          title={translate('wizard.step.vehicleInfo')}
          icon="car-outline"
          editStep={3}
          onEditStep={onEditStep}
          t={t}
          isRTL={isRTL}
        >
          <View style={styles.reviewInfoRow}>
            <View style={styles.reviewInfoItem}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={t.textSubtle}
              />
              <Text style={[styles.reviewInfoLabel, { color: t.textSubtle }]}>
                {translate('wizard.year')}
              </Text>
              <Text style={[styles.reviewInfoValue, { color: t.text }]}>
                {modelYear || translate('wizard.notProvided')}
              </Text>
            </View>
            <View style={styles.reviewInfoItem}>
              <Ionicons name="car-outline" size={12} color={t.textSubtle} />
              <Text style={[styles.reviewInfoLabel, { color: t.textSubtle }]}>
                {translate('wizard.model')}
              </Text>
              <Text
                style={[styles.reviewInfoValue, { color: t.text }]}
                numberOfLines={1}
              >
                {vehicleModel || translate('wizard.notProvided')}
              </Text>
            </View>
          </View>
          {vinNumber ? (
            <View style={[styles.reviewVinRow, { borderTopColor: t.border }]}>
              <Ionicons name="barcode-outline" size={12} color={t.textSubtle} />
              <Text
                style={[
                  styles.reviewInfoLabel,
                  { color: t.textSubtle, width: 30 },
                ]}
              >
                {translate('wizard.vin')}
              </Text>
              <Text style={[styles.reviewVinValue, { color: t.text }]}>
                {vinNumber}
              </Text>
            </View>
          ) : null}
        </ReviewCard>

        <ReviewCard
          title={translate('wizard.step.photos')}
          icon="image-outline"
          editStep={4}
          onEditStep={onEditStep}
          t={t}
          isRTL={isRTL}
          wide
        >
          {imageUrls.length > 0 ? (
            <View style={styles.reviewPhotos}>
              {imageUrls.map((url, i) => (
                <View
                  key={i}
                  style={[styles.reviewThumbWrap, { borderColor: t.border }]}
                >
                  <Image
                    source={{ uri: url }}
                    style={styles.reviewThumb}
                    contentFit="cover"
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.reviewNoPhotos}>
              <Ionicons
                name="image-outline"
                size={20}
                color={t.textSubtle + '60'}
              />
              <Text
                style={[
                  styles.reviewMuted,
                  { color: t.textSubtle, marginTop: 0 },
                ]}
              >
                {translate('wizard.noPhotos')}
              </Text>
            </View>
          )}
        </ReviewCard>
      </View>

      <View
        style={[
          styles.readyBar,
          {
            borderColor: t.primary + '30',
            backgroundColor: t.primary + '08',
          },
        ]}
      >
        <View style={[styles.readyDot, { backgroundColor: t.primary }]} />
        <Text style={[styles.readyText, { color: t.primary }]}>
          {translate('wizard.readyToPublish')}
        </Text>
      </View>
    </View>
  )
}

function ReviewCard({
  title,
  icon,
  editStep,
  onEditStep,
  t,
  isRTL,
  wide,
  children,
}: {
  title: string
  icon: keyof typeof Ionicons.glyphMap
  editStep: number
  onEditStep: (s: number) => void
  t: any
  isRTL: boolean
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <View
      style={[
        styles.reviewCard,
        wide && styles.reviewCardWide,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={[styles.reviewCardHeader, { borderBottomColor: t.border }]}>
        <View style={styles.reviewCardHeaderLeft}>
          <Ionicons name={icon} size={16} color={t.textMuted} />
          <Text style={[styles.reviewCardTitle, { color: t.text }]}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={() => onEditStep(editStep)}
          style={({ pressed }) => [
            styles.reviewEditBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="pencil-outline" size={14} color={t.textMuted} />
        </Pressable>
      </View>
      <View style={styles.reviewCardBody}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  step: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  subtitle: {
    ...typography.body,
    marginTop: -spacing.sm,
  },
  grid: {
    gap: spacing.md,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  reviewCardWide: {},
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reviewCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewEditBtn: {
    padding: 4,
  },
  reviewCardBody: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  reviewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reviewMuted: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  reviewInfoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  reviewInfoItem: {
    gap: 2,
  },
  reviewInfoLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  reviewInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewVinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  reviewVinValue: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  reviewPhotos: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reviewThumbWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  reviewThumb: {
    width: '100%',
    height: '100%',
  },
  reviewNoPhotos: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  readyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  readyText: {
    fontSize: 14,
    fontWeight: '700',
  },
})
