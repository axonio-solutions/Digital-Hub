import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'

import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface Item {
  id: string
  name: string
  imageUrl?: string | null
}

interface SpecialtiesSheetProps {
  title: string
  data: Array<Item>
  selectedIds: Array<string>
  onToggle: (id: string) => void
  visible: boolean
  onClose: () => void
}

export function SpecialtiesSheet({
  title,
  data,
  selectedIds,
  onToggle,
  visible,
  onClose,
}: SpecialtiesSheetProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: t.overlay }]}
        onPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: t.bg, borderColor: t.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: t.borderStrong }]} />
          <Text style={[styles.sheetTitle, { color: t.text }]}>{title}</Text>

          {selectedIds.length > 0 && (
            <View style={styles.selectionBadge}>
              <Text style={[styles.selectionBadgeText, { color: t.primary }]}>
                {i18n('specialtiesSheet.nSelected', {
                  count: selectedIds.length,
                })}
              </Text>
            </View>
          )}

          <FlashList
            data={data}
            keyExtractor={(item) => item.id}
            style={styles.list}
            ItemSeparatorComponent={() => (
              <View style={[styles.sep, { backgroundColor: t.border }]} />
            )}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id)
              return (
                <Pressable
                  onPress={() => onToggle(item.id)}
                  style={({ pressed }) => [
                    styles.row,
                    selected && {
                      backgroundColor: t.primary + '0a',
                      borderColor: t.primary + '30',
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  {item.imageUrl ? (
                    <View style={styles.rowImageWrap}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.rowImage}
                        contentFit="contain"
                      />
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.rowName,
                      { color: t.text },
                      selected && { color: t.primary, fontWeight: '600' },
                      item.imageUrl ? { paddingLeft: spacing.sm } : null,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: selected ? t.primary : t.borderStrong,
                        backgroundColor: selected ? t.primary : 'transparent',
                      },
                    ]}
                  >
                    {selected && (
                      <Text style={[styles.checkmark, { color: t.primaryFg }]}>
                        ✓
                      </Text>
                    )}
                  </View>
                </Pressable>
              )
            }}
          />

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.done,
              { backgroundColor: t.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.doneText, { color: t.primaryFg }]}>
              {i18n('specialtiesSheet.done')}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    maxHeight: '85%',
    marginTop: 'auto',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  selectionBadge: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.md,
    marginVertical: 2,
  },
  rowImageWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowImage: {
    width: 28,
    height: 28,
  },
  rowName: {
    flex: 1,
    fontSize: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '800',
  },
  done: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
