import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import {
  createRequestFn,
  fetchRequestDetails,
  getPublicTaxonomyFn,
  updateRequestFn,
} from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { BrandStep } from './wizard-steps/BrandStep'
import { CategoryStep } from './wizard-steps/CategoryStep'
import { PartDetailsStep } from './wizard-steps/PartDetailsStep'
import { PhotosStep } from './wizard-steps/PhotosStep'
import { ReviewStep } from './wizard-steps/ReviewStep'
import { VehicleInfoStep } from './wizard-steps/VehicleInfoStep'
import type { TaxBrand, TaxCategory } from '../types/taxonomy'
import type { BuyerRequestRow } from '../types/buyer'

const STEP_LABELS = [
  'Part Details',
  'Category',
  'Brand',
  'Vehicle Info',
  'Photos',
  'Review',
]

interface CreateRequestScreenProps {
  buyerId: string
  onBack: () => void
  editRequestId?: string
  initialData?: import('../types/buyer').BuyerRequestRow
}

export function CreateRequestScreen({
  buyerId,
  onBack,
  editRequestId,
  initialData,
}: CreateRequestScreenProps) {
  const t = useTheme()
  const scrollRef = useRef<ScrollView>(null)
  const isEditing = !!editRequestId

  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [categories, setCategories] = useState<Array<TaxCategory>>([])
  const [brands, setBrands] = useState<Array<TaxBrand>>([])
  const [taxLoading, setTaxLoading] = useState(false)

  const [partName, setPartName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [vehicleBrand, setVehicleBrand] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [modelYear, setModelYear] = useState('')
  const [vinNumber, setVinNumber] = useState('')
  const [imageUrls, setImageUrls] = useState<Array<string>>([])

  const loadTaxonomy = useCallback(async () => {
    setTaxLoading(true)
    try {
      const data = await getPublicTaxonomyFn()
      setCategories(data.categories)
      setBrands(data.brands)
    } catch {
      Alert.alert('Error', 'Could not load categories and brands.')
    } finally {
      setTaxLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTaxonomy()
  }, [loadTaxonomy])

  useEffect(() => {
    if (!editRequestId) return

    function populate(req: NonNullable<typeof initialData>) {
      setPartName(req.partName || '')
      setDescription(req.notes || '')
      setCategoryId(req.categoryId)
      setBrandId(req.brandId)
      setVehicleBrand(req.vehicleBrand || '')
      const sep = req.modelYear?.indexOf(' - ')
      if (sep && sep > 0) {
        setVehicleModel(req.modelYear.slice(0, sep).trim())
        setModelYear(req.modelYear.slice(sep + 3).trim())
      } else {
        setModelYear(req.modelYear || '')
      }
      setVinNumber(req.oemNumber || '')
      setImageUrls(req.imageUrls || [])
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

  function handleBrandSelect(id: string, brandName: string) {
    setBrandId(id)
    setVehicleBrand(brandName)
  }

  function handleCategorySelect(id: string) {
    setCategoryId(id === categoryId ? null : id)
  }

  function validateStep(step: number): boolean {
    switch (step) {
      case 0:
        if (partName.trim().length < 2) {
          Alert.alert('Required', 'Part name must be at least 2 characters.')
          return false
        }
        return true
      case 1:
        return true
      case 2:
        if (!brandId || !vehicleBrand) {
          Alert.alert('Required', 'Please select a vehicle brand.')
          return false
        }
        return true
      case 3:
        if (!modelYear.trim()) {
          Alert.alert('Required', 'Model year is required.')
          return false
        }
        return true
      case 4:
        return true
      case 5:
        return true
      default:
        return true
    }
  }

  function goNext() {
    if (!validateStep(currentStep)) return
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
      onBack()
    }
  }

  async function handleSubmit() {
    if (!partName.trim() || !vehicleBrand || !modelYear.trim()) {
      Alert.alert('Missing fields', 'Please complete all required fields.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const combinedYear = vehicleModel
        ? `${vehicleModel} - ${modelYear}`
        : modelYear

      const payload = {
        partName: partName.trim(),
        notes: description.trim() || undefined,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        vehicleBrand,
        modelYear: combinedYear,
        oemNumber: vinNumber.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      }

      const result = isEditing
        ? await updateRequestFn(editRequestId, payload)
        : await createRequestFn(buyerId, payload)

      if (result?.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result?.error || 'Failed to save request.')
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred.')
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
            {isEditing ? 'Request Updated!' : 'Request Published!'}
          </Text>
          <Text style={[styles.successDesc, { color: t.textMuted }]}>
            {isEditing
              ? 'Your request has been updated successfully.'
              : 'Sellers in your area will review your request and send you offers.'}
          </Text>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.successBtn,
              { backgroundColor: t.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="arrow-back-outline" size={18} color={t.primaryFg} />
            <Text style={[styles.successBtnText, { color: t.primaryFg }]}>
              Back to Dashboard
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <PartDetailsStep
            partName={partName}
            description={description}
            onChangePartName={setPartName}
            onChangeDescription={setDescription}
          />
        )
      case 1:
        return (
          <CategoryStep
            categories={categories}
            selectedId={categoryId}
            onSelect={handleCategorySelect}
            loading={taxLoading}
          />
        )
      case 2:
        return (
          <BrandStep
            brands={brands}
            selectedId={brandId}
            onSelect={handleBrandSelect}
            loading={taxLoading}
          />
        )
      case 3:
        return (
          <VehicleInfoStep
            vehicleModel={vehicleModel}
            modelYear={modelYear}
            vinNumber={vinNumber}
            onChangeModel={setVehicleModel}
            onChangeYear={setModelYear}
            onChangeVin={setVinNumber}
          />
        )
      case 4:
        return <PhotosStep imageUrls={imageUrls} onChange={setImageUrls} />
      case 5:
        return (
          <ReviewStep
            partName={partName}
            description={description}
            vehicleBrand={vehicleBrand}
            vehicleModel={vehicleModel}
            modelYear={modelYear}
            vinNumber={vinNumber}
            imageUrls={imageUrls}
            onEditStep={setCurrentStep}
          />
        )
      default:
        return null
    }
  }

  const isLastStep = currentStep === 5
  const canGoNext = currentStep < 5

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: t.bg,
            borderBottomColor: t.border,
          },
        ]}
      >
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </Pressable>

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
          onPress={onBack}
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="close" size={22} color={t.textSubtle} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}

        {submitError && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: t.dangerBg, borderColor: t.danger + '30' },
            ]}
          >
            <Ionicons name="alert-circle" size={16} color={t.danger} />
            <Text style={[styles.errorText, { color: t.danger }]}>
              {submitError}
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: t.bg,
            borderTopColor: t.border,
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
              { borderColor: t.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={t.textMuted} />
            <Text style={[styles.footerBtnText, { color: t.textMuted }]}>
              Back
            </Text>
          </Pressable>
        )}

        {currentStep > 0 && <View style={{ width: spacing.md }} />}

        <Pressable
          onPress={isLastStep ? handleSubmit : goNext}
          disabled={submitting}
          style={({ pressed }) => [
            styles.footerBtn,
            styles.footerBtnPrimary,
            {
              backgroundColor: isLastStep ? t.success : t.primary,
              opacity: submitting ? 0.5 : pressed ? 0.85 : 1,
            },
            currentStep === 0 && { flex: 1 },
          ]}
        >
          <Text style={[styles.footerBtnText, { color: t.primaryFg }]}>
            {submitting
              ? isEditing
                ? 'Saving...'
                : 'Publishing...'
              : isLastStep
                ? isEditing
                  ? 'Save Changes'
                  : 'Publish Request'
                : 'Next'}
          </Text>
          {!isLastStep && !submitting && (
            <Ionicons name="chevron-forward" size={18} color={t.primaryFg} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
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
    paddingBottom: spacing.xl,
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
