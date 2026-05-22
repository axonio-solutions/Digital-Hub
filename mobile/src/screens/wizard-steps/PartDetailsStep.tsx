import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'

interface Props {
  partName: string
  description: string
  onChangePartName: (v: string) => void
  onChangeDescription: (v: string) => void
}

export function PartDetailsStep({
  partName,
  description,
  onChangePartName,
  onChangeDescription,
}: Props) {
  const t = useTheme()

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>Part Details</Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        Describe the part you're looking for in detail.
      </Text>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons name="pricetag-outline" size={14} color={t.primary} />
          <Text style={[styles.label, { color: t.textMuted }]}>Part Name</Text>
        </View>
        <TextInput
          value={partName}
          onChangeText={onChangePartName}
          placeholder="e.g. Brake Pads, Front Bumper"
          placeholderTextColor={t.textSubtle}
          style={[
            styles.input,
            {
              color: t.text,
              backgroundColor: t.surface,
              borderColor: t.border,
            },
          ]}
          autoCapitalize="sentences"
          returnKeyType="next"
        />
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={t.primary}
          />
          <Text style={[styles.label, { color: t.textMuted }]}>
            Description
          </Text>
        </View>
        <TextInput
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Include any specific requirements, OEM numbers, or condition preferences."
          placeholderTextColor={t.textSubtle}
          style={[
            styles.textarea,
            {
              color: t.text,
              backgroundColor: t.surface,
              borderColor: t.border,
            },
          ]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoCapitalize="sentences"
        />
        <View style={styles.hintRow}>
          <Ionicons
            name="information-circle-outline"
            size={12}
            color={t.textSubtle}
          />
          <Text style={[styles.hint, { color: t.textSubtle }]}>
            Specify the variant, engine type, or whether you need OEM or
            aftermarket parts.
          </Text>
        </View>
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
  field: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 110,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  hint: {
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
})
