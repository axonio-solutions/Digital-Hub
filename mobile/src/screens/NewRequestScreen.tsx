import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Alert, Animated, Platform, Pressable, StyleSheet } from 'react-native'
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  useIsRTL,
} from 'expo-rtl'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import {
  createRequestFn,
  fetchRequestDetails,
  updateRequestFn,
} from '../lib/api-client'
import { taxonomyQueryOptions } from '../features/taxonomy/queries/taxonomy'
import { radius, spacing, typography } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { BrandStep } from './wizard-steps/BrandStep'
import { CategoryStep } from './wizard-steps/CategoryStep'
import { PartDetailsStep } from './wizard-steps/PartDetailsStep'
import { PhotosStep } from './wizard-steps/PhotosStep'
import { ReviewStep } from './wizard-steps/ReviewStep'
import { VehicleInfoStep } from './wizard-steps/VehicleInfoStep'
import type { BuyerRequestRow } from '../types/buyer'

function getRequestSchema(t: (key: string) => string) {
  return z.object({
    partName: z.string().min(2, t('wizard.errors.shortPartName')),
    description: z.string().optional(),
    categoryId: z.string().nullable().optional(),
    brandId: z.string().nullable().optional(),
    vehicleBrand: z.string().optional(),
    vehicleModel: z.string().optional(),
    modelYear: z.string().min(1, t('wizard.errors.yearRequired')),
    vinNumber: z.string().optional(),
    imageUrls: z.array(z.string()),
  })
}

export type RequestFormData = z.infer<ReturnType<typeof getRequestSchema>>

const defaultValues: RequestFormData = {
  partName: '',
  description: '',
  categoryId: null,
  brandId: null,
  vehicleBrand: '',
  vehicleModel: '',
  modelYear: '',
  vinNumber: '',
  imageUrls: [],
}

interface NewRequestScreenProps {
  buyerId?: string
  onBack?: () => void
  editRequestId?: string
  initialData?: BuyerRequestRow
}

export function NewRequestScreen({
  buyerId: buyerIdProp,
  onBack,
  editRequestId: editRequestIdProp,
  initialData: initialDataProp,
}: NewRequestScreenProps) {
  const navigation = useNavigation()
  const route = useRoute<any>()
  const {
    buyerId: routeBuyerId,
    requestId: routeRequestId,
    prefetchedRequest,
  } = route.params ?? {}
  const buyerId = buyerIdProp ?? routeBuyerId ?? ''
  const editRequestId = editRequestIdProp ?? routeRequestId
  const initialData = initialDataProp ?? prefetchedRequest
  const { t: translate } = useTranslation()
  const isRTL = useIsRTL()
  const t = useTheme()
  const styles = makeStyles(t)
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<any>(null)
  const isEditing = !!editRequestId

  const STEP_LABELS = [
    translate('wizard.step.partDetails'),
    translate('wizard.step.category'),
    translate('wizard.step.brand'),
    translate('wizard.step.vehicleInfo'),
    translate('wizard.step.photos'),
    translate('wizard.step.review'),
  ]

  const requestSchema = useMemo(() => getRequestSchema(translate), [])

  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: taxonomy, isLoading: taxLoading } =
    useQuery(taxonomyQueryOptions)
  const categories = taxonomy?.categories ?? []
  const brands = taxonomy?.brands ?? []

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!editRequestId) return

    function populate(req: NonNullable<typeof initialData>) {
      form.reset({
        partName: req.partName || '',
        description: req.notes || '',
        categoryId: req.categoryId,
        brandId: req.brandId,
        vehicleBrand: req.vehicleBrand || '',
        vehicleModel: '',
        modelYear: '',
        vinNumber: req.oemNumber || '',
        imageUrls: req.imageUrls || [],
      })
      const sep = req.modelYear?.indexOf(' - ')
      if (sep && sep > 0) {
        form.setValue('vehicleModel', req.modelYear.slice(0, sep).trim())
        form.setValue('modelYear', req.modelYear.slice(sep + 3).trim())
      } else {
        form.setValue('modelYear', req.modelYear || '')
      }
    }

    if (initialData) {
      populate(initialData)
      return
    }

    fetchRequestDetails(editRequestId).then((req) => {
      if (!req) return
      populate(req)
    })
  }, [editRequestId])

  async function goNext() {
    const stepFields: Record<number, Array<keyof RequestFormData>> = {
      0: ['partName'],
      1: [],
      2: ['brandId', 'vehicleBrand'],
      3: ['modelYear'],
      4: [],
    }

    const fields = stepFields[currentStep] ?? []
    if (fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      scrollRef.current?.scrollTo({ y: 0, animated: false })
    } else {
      onBack?.() ?? navigation.goBack()
    }
  }

  async function handleSubmit(data: RequestFormData) {
    if (!data.partName.trim() || !data.vehicleBrand || !data.modelYear.trim()) {
      Alert.alert(translate('common.error'), translate('common.requiredFields'))
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const combinedYear = data.vehicleModel
        ? `${data.vehicleModel} - ${data.modelYear}`
        : data.modelYear

      const payload = {
        partName: data.partName.trim(),
        notes: data.description?.trim() || undefined,
        categoryId: data.categoryId || undefined,
        brandId: data.brandId || undefined,
        vehicleBrand: data.vehicleBrand || '',
        modelYear: combinedYear,
        oemNumber: data.vinNumber?.trim() || undefined,
        imageUrls: data.imageUrls.length > 0 ? data.imageUrls : undefined,
      }

      const result = isEditing
        ? await updateRequestFn(editRequestId, payload)
        : await createRequestFn(buyerId, payload)

      if (result?.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result?.error || translate('common.somethingWentWrong'))
      }
    } catch (err: any) {
      setSubmitError(err?.message || translate('common.somethingWentWrong'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.successWrap}>
          <View
            style={[
              styles.successIconWrap,
              { backgroundColor: t.success + '15' },
            ]}
          >
            <Ionicons name="checkmark-circle" size={64} color={t.success} />
          </View>
          <Text style={[styles.successTitle, { color: t.text }]}>
            {isEditing
              ? translate('wizard.requestUpdated')
              : translate('wizard.requestCreated')}
          </Text>
          <Text style={[styles.successDesc, { color: t.textMuted }]}>
            {isEditing
              ? translate('wizard.requestUpdatedDesc')
              : translate('wizard.requestCreatedDesc')}
          </Text>
          <Pressable
            onPress={() => {
              onBack?.() ?? navigation.goBack()
            }}
            style={({ pressed }) => [
              styles.successBtn,
              {
                backgroundColor: t.primary,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name={isRTL ? 'arrow-forward-outline' : 'arrow-back-outline'}
              size={18}
              color={t.primaryFg}
            />
            <Text style={[styles.successBtnText, { color: t.primaryFg }]}>
              {translate('common.back')}
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  const isLastStep = currentStep === 5

  return (
    <FormProvider {...form}>
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: t.bg,
              borderBottomColor: t.border,
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.headerCenter}>
            <Text
              style={[styles.stepLabel, { color: t.textMuted }]}
              numberOfLines={1}
            >
              {STEP_LABELS[currentStep]}
            </Text>

            <View style={styles.dots}>
              {STEP_LABELS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === currentStep
                          ? t.primary
                          : i < currentStep
                            ? t.primary + '40'
                            : t.border,
                      width: i === currentStep ? 20 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => {
              onBack?.() ?? navigation.goBack()
            }}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={22} color={t.textSubtle} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {currentStep === 0 && <PartDetailsStep />}
            {currentStep === 1 && (
              <CategoryStep categories={categories} loading={taxLoading} />
            )}
            {currentStep === 2 && (
              <BrandStep
                brands={brands}
                popularBrands={
                  translate('wizard.popularBrands', {
                    returnObjects: true,
                  }) as string[]
                }
                loading={taxLoading}
              />
            )}
            {currentStep === 3 && <VehicleInfoStep />}
            {currentStep === 4 && <PhotosStep />}
            {currentStep === 5 && <ReviewStep onEditStep={setCurrentStep} />}

            {submitError && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: t.dangerBg,
                    borderColor: t.danger + '30',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={16} color={t.danger} />
                <Text style={[styles.errorText, { color: t.danger }]}>
                  {submitError}
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: t.bg,
              borderTopColor: t.border,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : spacing.xl,
            },
          ]}
        >
          {currentStep > 0 && (
            <Pressable
              onPress={goBack}
              disabled={submitting}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.footerBtnOutline,
                {
                  borderColor: t.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons
                name={isRTL ? 'chevron-forward' : 'chevron-back'}
                size={18}
                color={t.textMuted}
              />
              <Text style={[styles.footerBtnText, { color: t.textMuted }]}>
                {translate('wizard.back')}
              </Text>
            </Pressable>
          )}

          {currentStep > 0 && <View style={{ width: spacing.md }} />}

          <Pressable
            onPress={isLastStep ? form.handleSubmit(handleSubmit) : goNext}
            disabled={submitting}
            style={({ pressed }) => [
              styles.footerBtn,
              styles.footerBtnPrimary,
              {
                backgroundColor: isLastStep ? t.success : t.primary,
                opacity: submitting ? 0.5 : pressed ? 0.85 : 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
              currentStep === 0 && { flex: 1 },
            ]}
          >
            <Text style={[styles.footerBtnText, { color: t.primaryFg }]}>
              {submitting
                ? isEditing
                  ? translate('common.saving')
                  : translate('common.submitting')
                : isLastStep
                  ? isEditing
                    ? translate('wizard.updateRequest')
                    : translate('wizard.createRequest')
                  : translate('wizard.next')}
            </Text>
            {!isLastStep && !submitting && (
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={t.primaryFg}
              />
            )}
          </Pressable>
        </View>
      </View>
    </FormProvider>
  )
}

const POPULAR_BRANDS = [] as string[]

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    kav: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    stepLabel: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    footerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl,
      gap: spacing.xs,
    },
    footerBtnPrimary: {
      flex: 1,
    },
    footerBtnOutline: {
      borderWidth: 1.5,
      backgroundColor: 'transparent',
    },
    footerBtnText: {
      fontSize: 16,
      fontWeight: '700',
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.xl,
    },
    errorText: {
      fontSize: 13,
      fontWeight: '600',
      flex: 1,
    },
    successWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl * 2,
      gap: spacing.lg,
    },
    successIconWrap: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    successTitle: {
      ...typography.h1,
      textAlign: 'center',
    },
    successDesc: {
      ...typography.body,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: spacing.lg,
    },
    successBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.xxl,
      marginTop: spacing.md,
    },
    successBtnText: {
      fontSize: 16,
      fontWeight: '700',
    },
  })
}
