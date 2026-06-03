import Ionicons from '@expo/vector-icons/Ionicons'
import { StyleSheet } from 'react-native'
import { Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { useFormContext, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { radius, spacing, typography } from '../../theme/tokens'
import { useTheme } from '../../theme/use-theme'
import type { RequestFormData } from '../NewRequestScreen'

export function VehicleInfoStep() {
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
        <Ionicons name="car-outline" size={20} color={t.primary} />
        <Text style={[styles.title, { color: t.text }]}>
          {translate('wizard.step.vehicleInfo')}
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: t.textMuted }]}>
        {translate('wizard.vehicleInfoDescription')}
      </Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="car-outline" size={14} color={t.primary} />
            <Text style={[styles.label, { color: t.textMuted }]}>
              {translate('wizard.modelVersion')}
            </Text>
          </View>
          <Controller
            control={control}
            name="vehicleModel"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={translate('wizard.modelPlaceholder')}
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
            )}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Ionicons name="calendar-outline" size={14} color={t.primary} />
            <Text style={[styles.label, { color: t.textMuted }]}>
              {translate('wizard.modelYear')}
            </Text>
          </View>
          <Controller
            control={control}
            name="modelYear"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={translate('wizard.yearPlaceholder')}
                placeholderTextColor={t.textSubtle}
                style={[
                  styles.input,
                  {
                    color: t.text,
                    backgroundColor: t.surface,
                    borderColor: errors.modelYear ? t.danger : t.border,
                  },
                ]}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="next"
              />
            )}
          />
          {errors.modelYear && (
            <Text style={[styles.errorText, { color: t.danger }]}>
              {errors.modelYear.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons name="barcode-outline" size={14} color={t.primary} />
          <Text style={[styles.label, { color: t.textMuted }]}>
            {translate('wizard.vinNumber')}
          </Text>
          <View
            style={[
              styles.vinHint,
              isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' },
            ]}
          >
            <Ionicons
              name="help-circle-outline"
              size={14}
              color={t.textSubtle}
            />
          </View>
        </View>
        <Controller
          control={control}
          name="vinNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={translate('wizard.vinPlaceholder')}
              placeholderTextColor={t.textSubtle}
              style={[
                styles.input,
                styles.vinInput,
                {
                  color: t.text,
                  backgroundColor: t.surface,
                  borderColor: t.border,
                },
              ]}
              autoCapitalize="characters"
              maxLength={17}
              returnKeyType="done"
            />
          )}
        />
      </View>

      <View
        style={[
          styles.infoBox,
          {
            borderColor: t.accent + '30',
            backgroundColor: t.accent + '08',
          },
        ]}
      >
        <View
          style={[
            styles.infoIconBox,
            {
              backgroundColor: t.bg,
              borderColor: t.accent + '30',
            },
          ]}
        >
          <Ionicons name="car-outline" size={16} color={t.accent} />
        </View>
        <View style={styles.infoText}>
          <Text style={[styles.infoTitle, { color: t.accent }]}>
            {translate('wizard.whyModelYear')}
          </Text>
          <Text style={[styles.infoBody, { color: t.textMuted }]}>
            {translate('wizard.whyModelYearDescription')}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
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
  vinHint: {},
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  vinInput: {
    fontFamily: 'monospace',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  infoBox: {
    flexDirection: 'row',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
})
