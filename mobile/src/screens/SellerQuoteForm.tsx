import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { z } from 'zod'

import { createQuoteFn, updateQuoteFn } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

const quoteSchema = z.object({
  price: z.number().min(1, 'Price must be at least 1 DZD'),
  condition: z.enum(['new', 'used']),
  warranty: z.string().optional(),
})

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
}

export function SellerQuoteForm({
  requestId,
  sellerId,
  existingQuote,
  onSuccess,
  onRequestCredits,
}: SellerQuoteFormProps) {
  const t = useTheme()
  const [price, setPrice] = useState(
    existingQuote ? String(existingQuote.price) : '',
  )
  const [condition, setCondition] = useState<'new' | 'used'>(
    existingQuote?.condition ?? 'new',
  )
  const [warranty, setWarranty] = useState(existingQuote?.warranty ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit() {
    const priceNum = parseInt(price, 10)
    if (!price || isNaN(priceNum)) {
      setErrors({ price: 'Please enter a valid price.' })
      return
    }

    const result = quoteSchema.safeParse({
      price: priceNum,
      condition,
      warranty: warranty || undefined,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        if (!fieldErrors[path]) fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      if (existingQuote) {
        await updateQuoteFn(existingQuote.id, {
          requestId,
          sellerId,
          price: priceNum,
          condition,
          warranty: warranty || undefined,
        })
      } else {
        await createQuoteFn({
          requestId,
          sellerId,
          price: priceNum,
          condition,
          warranty: warranty || undefined,
        })
      }
      onSuccess()
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit quote. Please try again.'
      if (msg.toLowerCase().includes('credit')) {
        setShowCreditModal(true)
      } else {
        Alert.alert('Error', msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = !!existingQuote

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: t.textMuted }]}>Price</Text>
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
            style={[styles.priceInput, { color: t.text }]}
            placeholder="e.g. 25000"
            placeholderTextColor={t.textSubtle}
            keyboardType="number-pad"
            value={price}
            onChangeText={setPrice}
          />
          <View style={[styles.dzdBadge, { backgroundColor: t.bgMuted }]}>
            <Text style={[styles.dzdText, { color: t.textMuted }]}>DA</Text>
          </View>
        </View>
        {errors.price && (
          <View style={styles.fieldErrorRow}>
            <Ionicons name="alert-circle" size={12} color={t.danger} />
            <Text style={[styles.fieldError, { color: t.danger }]}>
              {errors.price}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: t.textMuted }]}>Condition</Text>
        <View style={styles.conditionRow}>
          <Pressable
            onPress={() => setCondition('new')}
            style={[
              styles.conditionCard,
              {
                backgroundColor: condition === 'new' ? t.accent + '12' : t.bg,
                borderColor: condition === 'new' ? t.accent : t.border,
              },
            ]}
          >
            <View
              style={[
                styles.conditionIconBox,
                {
                  backgroundColor:
                    condition === 'new' ? t.accent + '18' : t.bgMuted,
                  borderColor: condition === 'new' ? t.accent + '30' : t.border,
                },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={18}
                color={condition === 'new' ? t.accent : t.textMuted}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.conditionLabel,
                  { color: condition === 'new' ? t.accent : t.text },
                ]}
              >
                New
              </Text>
              <Text style={[styles.conditionDesc, { color: t.textSubtle }]}>
                Brand new, unused
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setCondition('used')}
            style={[
              styles.conditionCard,
              {
                backgroundColor: condition === 'used' ? t.accent + '12' : t.bg,
                borderColor: condition === 'used' ? t.accent : t.border,
              },
            ]}
          >
            <View
              style={[
                styles.conditionIconBox,
                {
                  backgroundColor:
                    condition === 'used' ? t.accent + '18' : t.bgMuted,
                  borderColor:
                    condition === 'used' ? t.accent + '30' : t.border,
                },
              ]}
            >
              <Ionicons
                name="reload-outline"
                size={18}
                color={condition === 'used' ? t.accent : t.textMuted}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.conditionLabel,
                  { color: condition === 'used' ? t.accent : t.text },
                ]}
              >
                Used
              </Text>
              <Text style={[styles.conditionDesc, { color: t.textSubtle }]}>
                Pre-owned, tested
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: t.textMuted }]}>
          Warranty{' '}
          <Text style={{ color: t.textSubtle, fontSize: 12 }}>(optional)</Text>
        </Text>
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
            style={[styles.input, { color: t.text }]}
            placeholder="e.g. 6 months"
            placeholderTextColor={t.textSubtle}
            value={warranty}
            onChangeText={setWarranty}
          />
        </View>
      </View>

      <View
        style={[
          styles.creditHint,
          { backgroundColor: t.bgMuted + '60', borderColor: t.border },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={t.textSubtle}
        />
        <Text style={[styles.creditHintText, { color: t.textSubtle }]}>
          1 credit will be used per quote
        </Text>
      </View>

      <Pressable
        onPress={handleSubmit}
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
            <Text style={[styles.submitText, { color: t.accentFg }]}>
              {isEditing ? 'Update' : 'Submit Offer'}
            </Text>
          </View>
        )}
      </Pressable>

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
          <Pressable
            onPress={() => {}}
            style={[styles.modalContent, { backgroundColor: t.surface }]}
          >
            <View
              style={[styles.modalIconWrap, { backgroundColor: '#d9770615' }]}
            >
              <Ionicons name="alert-circle-outline" size={40} color="#d97706" />
            </View>
            <Text style={[styles.modalTitle, { color: t.text }]}>
              Insufficient Credits
            </Text>
            <Text style={[styles.modalDesc, { color: t.textMuted }]}>
              You don't have enough credits to submit a quote. Each quote costs
              1 credit.
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
                <Text style={[styles.modalCancelText, { color: t.textMuted }]}>
                  Cancel
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
                <Text style={[styles.modalActionText, { color: t.accentFg }]}>
                  Get Credits
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: spacing.md,
    overflow: 'hidden',
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dzdBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  dzdText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fieldErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  creditHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  creditHintText: {
    fontSize: 12,
    fontWeight: '500',
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
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
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
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalAction: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '700',
  },
})
