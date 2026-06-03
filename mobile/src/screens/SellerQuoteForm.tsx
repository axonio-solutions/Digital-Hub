import Ionicons from '@expo/vector-icons/Ionicons'
import { forwardRef, useImperativeHandle, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createQuoteFn, updateQuoteFn } from '../lib/api-client'
import { radius, spacing, typography, type Theme } from '../theme/tokens'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/use-theme'

const quoteSchema = (t: (k: string) => string) =>
  z.object({
    price: z
      .string()
      .min(1, t('submitQuote.errors.priceRequired'))
      .refine(
        (v) => !isNaN(parseInt(v, 10)) && parseInt(v, 10) >= 1,
        t('submitQuote.errors.minPrice'),
      ),
    condition: z.enum(['new', 'used']),
    warranty: z.string().optional(),
  })

type QuoteForm = z.infer<ReturnType<typeof quoteSchema>>

interface ExistingQuoteData {
  id: string
  price: number
  condition: 'new' | 'used'
  warranty: string | null
}

interface SellerQuoteFormProps {
  requestId: string
  sellerId: string
  existingQuote?: ExistingQuoteData | null
  onSuccess: () => void
  onRequestCredits?: () => void
  hideSubmit?: boolean
  onSubmittingChange?: (submitting: boolean) => void
}

export interface SellerQuoteFormHandle {
  submit: () => Promise<void>
}

export const SellerQuoteForm = forwardRef<
  SellerQuoteFormHandle,
  SellerQuoteFormProps
>(function SellerQuoteForm(
  {
    requestId,
    sellerId,
    existingQuote,
    onSuccess,
    onRequestCredits,
    hideSubmit,
    onSubmittingChange,
  },
  ref,
) {
  const { t: translate } = useTranslation()
  const t = useTheme()
  const isRTL = useIsRTL()
  const styles = makeStyles(t, isRTL)
  const [submitting, setSubmitting] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema(translate)),
    defaultValues: {
      price: existingQuote ? String(existingQuote.price) : '',
      condition: existingQuote?.condition ?? 'new',
      warranty: existingQuote?.warranty ?? '',
    },
  })

  useImperativeHandle(ref, () => ({ submit: handleSubmit(onSubmit) }))

  async function onSubmit(data: QuoteForm) {
    const priceNum = parseInt(data.price, 10)

    setSubmitting(true)
    onSubmittingChange?.(true)
    try {
      if (existingQuote) {
        await updateQuoteFn(existingQuote.id, {
          requestId,
          sellerId,
          price: priceNum,
          condition: data.condition,
          warranty: data.warranty || undefined,
        })
      } else {
        await createQuoteFn({
          requestId,
          sellerId,
          price: priceNum,
          condition: data.condition,
          warranty: data.warranty || undefined,
        })
      }
      onSuccess()
    } catch (err: any) {
      const msg = err?.message || translate('submitQuote.errors.submitFailed')
      if (msg.toLowerCase().includes('credit')) {
        setShowCreditModal(true)
      } else {
        Alert.alert(translate('common.error'), msg)
      }
    } finally {
      setSubmitting(false)
      onSubmittingChange?.(false)
    }
  }

  const isEditing = !!existingQuote

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.field}>
        <Text style={styles.label}>{translate('submitQuote.price')}</Text>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <View
                style={[
                  styles.priceRow,
                  {
                    backgroundColor: t.bg,
                    borderColor: errors.price ? t.danger : t.border,
                  },
                ]}
              >
                <TextInput
                  style={styles.priceInput}
                  placeholder={translate('submitQuote.pricePlaceholder')}
                  placeholderTextColor={t.textSubtle}
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <View style={styles.dzdBadge}>
                  <Text style={styles.dzdText}>
                    {translate('submitQuote.da')}
                  </Text>
                </View>
              </View>
              {errors.price && (
                <View style={styles.fieldErrorRow}>
                  <Ionicons name="alert-circle" size={12} color={t.danger} />
                  <Text style={styles.fieldError}>{errors.price.message}</Text>
                </View>
              )}
            </>
          )}
        />
      </View>

      <Controller
        control={control}
        name="condition"
        render={({ field: { onChange, value } }) => (
          <View style={styles.field}>
            <Text style={styles.label}>
              {translate('submitQuote.condition')}
            </Text>
            <View style={styles.conditionRow}>
                <Pressable
                  onPress={() => onChange('new')}
                  style={[
                    styles.conditionCard,
                    {
                      backgroundColor: value === 'new' ? t.accent + '12' : t.bg,
                      borderColor: value === 'new' ? t.accent : t.border,
                    },
                  ]}
                >
                  {value === 'new' && (
                    <View style={[styles.condCheckWrap, { backgroundColor: t.accent }]}>
                      <Ionicons name="checkmark" size={11} color={t.accentFg} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.conditionIconBox,
                      {
                        backgroundColor:
                          value === 'new' ? t.accent + '18' : t.bgMuted,
                        borderColor: value === 'new' ? t.accent + '30' : t.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={18}
                      color={value === 'new' ? t.accent : t.textMuted}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.conditionLabel,
                        { color: value === 'new' ? t.accent : t.text },
                      ]}
                    >
                      {translate('submitQuote.conditionNew')}
                    </Text>
                    <Text style={styles.conditionDesc}>
                      {translate('submitQuote.conditionNewDesc')}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => onChange('used')}
                  style={[
                    styles.conditionCard,
                    {
                      backgroundColor: value === 'used' ? t.accent + '12' : t.bg,
                      borderColor: value === 'used' ? t.accent : t.border,
                    },
                  ]}
                >
                  {value === 'used' && (
                    <View style={[styles.condCheckWrap, { backgroundColor: t.accent }]}>
                      <Ionicons name="checkmark" size={11} color={t.accentFg} />
                    </View>
                  )}
                  <View
                    style={[
                      styles.conditionIconBox,
                      {
                        backgroundColor:
                          value === 'used' ? t.accent + '18' : t.bgMuted,
                        borderColor:
                          value === 'used' ? t.accent + '30' : t.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="reload-outline"
                      size={18}
                      color={value === 'used' ? t.accent : t.textMuted}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.conditionLabel,
                        { color: value === 'used' ? t.accent : t.text },
                      ]}
                    >
                      {translate('submitQuote.conditionUsed')}
                    </Text>
                    <Text style={styles.conditionDesc}>
                      {translate('submitQuote.conditionUsedDesc')}
                    </Text>
                  </View>
                </Pressable>
            </View>
          </View>
        )}
      />

      <View style={styles.field}>
        <Text style={styles.label}>
          {translate('submitQuote.warranty')}{' '}
          <Text style={styles.labelHint}>
            {translate('submitQuote.warrantyOptional')}
          </Text>
        </Text>
        <Controller
          control={control}
          name="warranty"
          render={({ field: { onChange, onBlur, value } }) => (
            <View
              style={[
                styles.inputRow,
                { backgroundColor: t.bg, borderColor: t.border },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={t.textSubtle}
              />
              <TextInput
                style={styles.input}
                placeholder={translate('submitQuote.warrantyPlaceholder')}
                placeholderTextColor={t.textSubtle}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </View>
          )}
        />
      </View>

      <View
        style={[
          styles.creditHint,
          {
            backgroundColor: t.bgMuted + '60',
            borderColor: t.border,
            borderLeftWidth: 3,
            borderLeftColor: t.accent,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={t.textSubtle}
        />
        <Text style={styles.creditHintText}>
          {translate('submitQuote.creditHint')}
        </Text>
      </View>

      {!hideSubmit && (
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: t.accent },
            submitting && { opacity: 0.6 },
            pressed && !submitting && { opacity: 0.85 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={t.accentFg} />
          ) : (
            <View style={styles.submitInner}>
              <Ionicons name="sparkles" size={16} color={t.accentFg} />
              <Text style={styles.submitText}>
                {isEditing
                  ? translate('submitQuote.editQuote')
                  : translate('submitQuote.submitQuote')}
              </Text>
            </View>
          )}
        </Pressable>
      )}

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
          <Pressable onPress={() => {}} style={styles.modalContent}>
            <View
              style={[styles.modalIconWrap, { backgroundColor: '#d9770615' }]}
            >
              <Ionicons name="alert-circle-outline" size={40} color="#d97706" />
            </View>
            <Text style={styles.modalTitle}>
              {translate('submitQuote.insufficientCredits')}
            </Text>
            <Text style={styles.modalDesc}>
              {translate('submitQuote.insufficientCreditsDesc')}
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
                <Text style={styles.modalCancelText}>
                  {translate('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowCreditModal(false)
                  onRequestCredits?.()
                }}
                style={({ pressed }) => [
                  styles.modalAction,
                  { backgroundColor: t.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.modalActionText}>
                  {translate('credits.getCredits')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
})

function makeStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    field: {
      gap: spacing.sm,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: t.textMuted,
    },
    labelHint: {
      color: t.textSubtle,
      fontSize: 12,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 14,
      paddingLeft: spacing.md,
      overflow: 'hidden',
      backgroundColor: t.bg,
    },
    priceInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.5,
      color: t.text,
    },
    dzdBadge: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      backgroundColor: t.accent,
    },
    dzdText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: t.accentFg,
    },
    fieldErrorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    fieldError: {
      fontSize: 12,
      fontWeight: '500',
      color: t.danger,
    },
    conditionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    conditionCard: {
      flex: 1,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      overflow: 'visible',
    },
    condCheckWrap: {
      position: 'absolute',
      top: -5,
      right: isRTL ? undefined : -5,
      left: isRTL ? -5 : undefined,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 3,
    },
    conditionIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    conditionLabel: {
      fontSize: 15,
      fontWeight: '700',
    },
    conditionDesc: {
      fontSize: 11,
      marginTop: 1,
      color: t.textSubtle,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      backgroundColor: t.bg,
      borderColor: t.border,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 16,
      color: t.text,
    },
    creditHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: t.bgMuted + '60',
      borderColor: t.border,
    },
    creditHintText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.textSubtle,
    },
    submitBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      paddingVertical: 14,
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
      backgroundColor: t.accent,
    },
    submitInner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    submitText: {
      fontSize: 15,
      fontWeight: '800',
      color: t.accentFg,
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
      borderRadius: 20,
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: t.surface,
    },
    modalIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      ...typography.h2,
      textAlign: 'center',
      color: t.text,
    },
    modalDesc: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      color: t.textMuted,
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
      borderColor: t.border,
    },
    modalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.textMuted,
    },
    modalAction: {
      flex: 2,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: radius.md,
      backgroundColor: t.accent,
    },
    modalActionText: {
      fontSize: 15,
      fontWeight: '700',
      color: t.accentFg,
    },
  })
}
