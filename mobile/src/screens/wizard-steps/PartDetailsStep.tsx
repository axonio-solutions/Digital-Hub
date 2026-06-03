import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet } from 'react-native'
import { Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { RequestFormData } from '../NewRequestScreen'

export function PartDetailsStep() {
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const {
    control,
    formState: { errors },
  } = useFormContext<RequestFormData>()

  return (
    <View style={styles.step}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          {translate('wizard.step.partDetails')}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        {translate('wizard.partDetailsDescription')}
      </Text>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons name="pricetag-outline" size={14} color={t.primary} />
          <Text style={[styles.label, { color: t.textMuted }]}>
            {translate('wizard.partName')}
          </Text>
        </View>
        <Controller
          control={control}
          name="partName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={translate('wizard.partNamePlaceholder')}
              placeholderTextColor={t.textSubtle}
              style={[
                styles.input,
                {
                  color: t.text,
                  backgroundColor: t.surface,
                  borderColor: errors.partName ? t.danger : t.border,
                },
              ]}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          )}
        />
        {errors.partName && (
          <Text style={[styles.errorText, { color: t.danger }]}>
            {errors.partName.message}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={t.primary}
          />
          <Text style={[styles.label, { color: t.textMuted }]}>
            {translate('wizard.description')}
          </Text>
        </View>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={translate('wizard.descriptionPlaceholder')}
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
          )}
        />
        <View style={styles.hintRow}>
          <Ionicons
            name="information-circle-outline"
            size={12}
            color={t.textSubtle}
          />
          <Text style={[styles.hint, { color: t.textSubtle }]}>
            {translate('wizard.descriptionHint')}
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
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
})
