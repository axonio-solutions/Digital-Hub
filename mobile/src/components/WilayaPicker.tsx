import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { WILAYAS } from '../lib/constants/wilayas'

import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface WilayaPickerProps {
  value: string
  onChange: (name: string) => void
  label: string
  error?: string | null
}

export function WilayaPicker({
  value,
  onChange,
  label,
  error,
}: WilayaPickerProps) {
  const t = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return WILAYAS
    return WILAYAS.filter(
      (w) => w.name.toLowerCase().includes(q) || w.id.includes(q),
    )
  }, [query])

  return (
    <View>
      <Text style={[styles.label, { color: t.textMuted }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: t.surface,
            borderColor: error ? t.danger : t.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[styles.triggerText, { color: value ? t.text : t.textSubtle }]}
        >
          {value || 'Select your wilaya'}
        </Text>
        <Text style={[styles.chevron, { color: t.textMuted }]}>▾</Text>
      </Pressable>
      {error ? (
        <Text style={[styles.helper, { color: t.danger }]}>{error}</Text>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: t.overlay }]}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            style={[
              styles.sheet,
              { backgroundColor: t.bg, borderColor: t.border },
            ]}
          >
            <View
              style={[styles.handle, { backgroundColor: t.borderStrong }]}
            />
            <Text style={[styles.sheetTitle, { color: t.text }]}>
              Choose wilaya
            </Text>
            <View
              style={[
                styles.search,
                { backgroundColor: t.bgMuted, borderColor: t.border },
              ]}
            >
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or number"
                placeholderTextColor={t.textSubtle}
                autoCorrect={false}
                autoCapitalize="none"
                style={[styles.searchInput, { color: t.text }]}
              />
            </View>
            <FlatList
              data={filtered}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => (
                <View
                  style={[styles.separator, { backgroundColor: t.border }]}
                />
              )}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: t.textSubtle }]}>
                  No wilayas match.
                </Text>
              }
              renderItem={({ item }) => {
                const selected = item.name === value
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.name)
                      setOpen(false)
                      setQuery('')
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && { backgroundColor: t.bgMuted },
                    ]}
                  >
                    <Text style={[styles.rowId, { color: t.textMuted }]}>
                      {item.id}
                    </Text>
                    <Text style={[styles.rowName, { color: t.text }]}>
                      {item.name}
                    </Text>
                    {selected ? (
                      <Text style={[styles.check, { color: t.accent }]}>✓</Text>
                    ) : null}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  triggerText: { flex: 1, fontSize: 16 },
  chevron: { fontSize: 16, marginLeft: spacing.sm },
  helper: { ...typography.caption, marginTop: 6 },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '85%',
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
    marginBottom: spacing.md,
  },
  search: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: { paddingVertical: 10, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
  },
  rowId: {
    width: 40,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  rowName: { flex: 1, fontSize: 16 },
  check: { fontSize: 18, fontWeight: '700' },
  separator: { height: StyleSheet.hairlineWidth },
  empty: { textAlign: 'center', padding: spacing.xl, ...typography.body },
})
