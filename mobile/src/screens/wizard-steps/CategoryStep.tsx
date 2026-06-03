import Ionicons from '@expo/vector-icons/Ionicons'
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { Text, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { TaxCategory } from '../../types/taxonomy'
import type { RequestFormData } from '../NewRequestScreen'
import { tCategory, tCategoryDescription } from '../../utils/category-utils'

interface Props {
  categories: Array<TaxCategory>
  loading?: boolean
}

export function CategoryStep({ categories, loading }: Props) {
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const { watch, setValue } = useFormContext<RequestFormData>()
  const categoryId = watch('categoryId')

  if (loading) {
    return (
      <View style={styles.step}>
        <SkeletonLine width={180} t={t} />
        <SkeletonLine width={260} t={t} />
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} t={t} />
        ))}
      </View>
    )
  }

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="grid-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          {translate('wizard.step.category')}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        {translate('wizard.categoryDescription')}
      </Text>

      <View style={styles.list}>
        {categories.map((cat) => {
          const selected = categoryId === cat.id
          const displayName = tCategory(cat, translate)
          const displayDescription =
            tCategoryDescription(cat, translate) || cat.description
          return (
            <Pressable
              key={cat.id}
              onPress={() =>
                setValue('categoryId', cat.id === categoryId ? null : cat.id, {
                  shouldDirty: true,
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: selected ? t.primary + '05' : t.surface,
                  borderColor: selected ? t.primary : t.border,
                },
                pressed && !selected && { opacity: 0.8 },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: selected ? t.primary : t.bgMuted,
                  },
                ]}
              >
                {cat.imageUrl ? (
                  <Image
                    source={{ uri: cat.imageUrl }}
                    style={styles.iconImg}
                    contentFit="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.iconFallback,
                      {
                        color: selected ? t.primaryFg : t.textMuted,
                      },
                    ]}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: selected ? t.primary : t.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                {displayDescription && (
                  <Text
                    style={[styles.cardDesc, { color: t.textSubtle }]}
                    numberOfLines={1}
                  >
                    {displayDescription}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.check,
                  {
                    backgroundColor: selected ? t.primary : 'transparent',
                    borderColor: selected ? t.primary : t.borderStrong,
                  },
                ]}
              >
                {selected && (
                  <Ionicons name="checkmark" size={12} color={t.primaryFg} />
                )}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function SkeletonLine({ width, t }: { width: number; t: any }) {
  return (
    <View style={[styles.skelLine, { width, backgroundColor: t.border }]} />
  )
}

function SkeletonCard({ t }: { t: any }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surface, borderColor: t.border },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: t.border }]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            height: 12,
            width: '60%',
            borderRadius: radius.sm,
            backgroundColor: t.border,
          }}
        />
        <View
          style={{
            height: 10,
            width: '40%',
            borderRadius: radius.sm,
            backgroundColor: t.border,
          }}
        />
      </View>
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
  list: {
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 24,
    height: 24,
  },
  iconFallback: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skelLine: {
    height: 14,
    borderRadius: radius.sm,
  },
})
