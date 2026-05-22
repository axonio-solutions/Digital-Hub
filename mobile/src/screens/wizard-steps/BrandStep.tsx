import Ionicons from '@expo/vector-icons/Ionicons'
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { TaxBrand } from '../../types/taxonomy'

const POPULAR_BRANDS = [
  'Renault',
  'Peugeot',
  'Toyota',
  'Hyundai',
  'Volkswagen',
  'Dacia',
  'Ford',
  'Nissan',
  'BMW',
  'Mercedes-Benz',
]

interface Props {
  brands: Array<TaxBrand>
  selectedId: string | null
  onSelect: (id: string, brandName: string) => void
  loading?: boolean
}

export function BrandStep({ brands, selectedId, onSelect, loading }: Props) {
  const t = useTheme()

  const popular = brands.filter((b) => POPULAR_BRANDS.includes(b.brand))
  const others = brands
    .filter((b) => !POPULAR_BRANDS.includes(b.brand))
    .sort((a, b) => a.brand.localeCompare(b.brand))

  const renderBrand = (brand: TaxBrand) => {
    const selected = selectedId === brand.id
    return (
      <Pressable
        key={brand.id}
        onPress={() => onSelect(brand.id, brand.brand)}
        style={({ pressed }) => [
          styles.brandCard,
          {
            backgroundColor: selected ? t.primary + '05' : t.surface,
            borderColor: selected ? t.primary : t.border,
          },
          pressed && !selected && { opacity: 0.8 },
        ]}
      >
        <View
          style={[
            styles.brandLogoBox,
            {
              backgroundColor: selected ? t.primary + '10' : t.bgMuted,
              borderColor: selected ? t.primary + '30' : t.border,
            },
          ]}
        >
          {brand.imageUrl ? (
            <Image
              source={{ uri: brand.imageUrl }}
              style={[
                styles.brandLogo,
                !selected && { opacity: 0.5, tintColor: t.textMuted },
              ]}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={[
                styles.brandFallback,
                {
                  color: selected ? t.primary : t.textMuted,
                },
              ]}
            >
              {brand.brand.slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.brandName,
            { color: selected ? t.primary : t.text },
            selected && { fontWeight: '700' },
          ]}
          numberOfLines={1}
        >
          {brand.brand}
        </Text>
        {selected && (
          <View style={[styles.brandCheck, { backgroundColor: t.primary }]}>
            <Ionicons name="checkmark" size={10} color={t.primaryFg} />
          </View>
        )}
      </Pressable>
    )
  }

  if (loading) {
    return (
      <View style={styles.step}>
        <SkeletonLine width={200} t={t} />
        <SkeletonLine width={280} t={t} />
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={[
                styles.brandCard,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
              <View
                style={[styles.brandLogoBox, { backgroundColor: t.border }]}
              />
            </View>
          ))}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="business-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          Select Vehicle Brand
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        Choose your vehicle's manufacturer for accurate part matching.
      </Text>

      <View style={styles.list}>
        {popular.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.textSubtle }]}>
              POPULAR
            </Text>
            <View style={styles.grid}>{popular.map(renderBrand)}</View>
          </>
        )}

        {others.length > 0 && (
          <>
            <Text
              style={[
                styles.sectionLabel,
                { color: t.textSubtle, marginTop: spacing.sm },
              ]}
            >
              ALL BRANDS
            </Text>
            <View style={styles.grid}>{others.map(renderBrand)}</View>
          </>
        )}
      </View>
    </View>
  )
}

function SkeletonLine({ width, t }: { width: number; t: any }) {
  return (
    <View
      style={{
        height: 14,
        width,
        borderRadius: radius.sm,
        backgroundColor: t.border,
      }}
    />
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
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  brandCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    position: 'relative',
  },
  brandLogoBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 24,
    height: 24,
  },
  brandFallback: {
    fontSize: 14,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  brandCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
