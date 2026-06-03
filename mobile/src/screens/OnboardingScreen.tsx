import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TFunction } from 'i18next'
import {
  ActivityIndicator,
  Alert,
  Animated,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { SpecialtiesSheet } from '../components/SpecialtiesSheet'
import { WilayaPicker } from '../components/WilayaPicker'
import { completeOnboarding, getPublicTaxonomyFn } from '../lib/api-client'
import { compressAndUpload } from '../lib/compress-image'
import { radius, spacing, typography } from '../theme/tokens'
import type { Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { SessionUser } from '../lib/api-client'

type Role = 'buyer' | 'seller'

interface TaxItem {
  id: string
  name: string
  imageUrl?: string | null
}

type TaxonomyData = {
  brands: Array<TaxItem>
  categories: Array<TaxItem>
}

type OnboardingForm = z.infer<ReturnType<typeof getOnboardingSchema>>

function getOnboardingSchema(tTranslate: TFunction) {
  return z.object({
    role: z.enum(['buyer', 'seller']),
    name: z.string().min(2, tTranslate('onboarding.error.shortName')),
    email: z.string().email(tTranslate('onboarding.error.invalidEmail')),
    phoneNumber: z.string().min(8, tTranslate('onboarding.error.shortPhone')),
    whatsappNumber: z
      .string()
      .min(8, tTranslate('onboarding.error.shortWhatsapp')),
    storeName: z.string().optional(),
    wilaya: z.string().min(1, tTranslate('onboarding.error.wilayaRequired')),
    city: z.string().min(1, tTranslate('onboarding.error.cityRequired')),
    address: z.string().min(1, tTranslate('onboarding.error.addressRequired')),
    companyAddress: z.string().optional(),
    commercialRegister: z.string().optional(),
    brandIds: z.array(z.string()),
    categoryIds: z.array(z.string()),
  })
}

interface OnboardingScreenProps {
  user: SessionUser
  onComplete: (role: string, accountStatus: string) => void
  onLogOut: () => void
}

export function OnboardingScreen({
  user,
  onComplete,
  onLogOut,
}: OnboardingScreenProps) {
  const t = useTheme()
  const { t: tI18n, i18n } = useTranslation()
  const styles = makeStyles(t)
  const insets = useSafeAreaInsets()

  const onboardingSchema = useMemo(
    () => getOnboardingSchema(tI18n),
    [i18n.language],
  )
  const buyerFeatures = tI18n('onboarding.buyerFeatures', {
    returnObjects: true,
  }) as Array<string>
  const sellerFeatures = tI18n('onboarding.sellerFeatures', {
    returnObjects: true,
  }) as Array<string>
  const scrollRef = useRef<ScrollView>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [redirectStatus, setRedirectStatus] = useState('active')
  const [taxonomy, setTaxonomy] = useState<TaxonomyData | null>(null)
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false)
  const [sheetType, setSheetType] = useState<'brands' | 'categories' | null>(
    null,
  )
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const contentOpacity = useRef(new Animated.Value(1)).current
  const contentSlide = useRef(new Animated.Value(0)).current

  const successScale = useRef(new Animated.Value(0.8)).current
  const successOpacity = useRef(new Animated.Value(0)).current

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: (user.role as Role) || ('' as any),
      name: user.name || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      whatsappNumber: user.whatsappNumber || '',
      storeName: user.storeName || '',
      wilaya: user.wilaya || '',
      city: user.city || '',
      address: user.address || '',
      companyAddress: user.companyAddress || '',
      commercialRegister: user.commercialRegister || '',
      brandIds: [],
      categoryIds: [],
    },
  })

  const watchRole = form.watch('role')
  const watchName = form.watch('name')
  const watchEmail = form.watch('email')
  const watchPhone = form.watch('phoneNumber')
  const watchWhatsapp = form.watch('whatsappNumber')
  const watchWilaya = form.watch('wilaya')
  const watchCity = form.watch('city')
  const watchAddress = form.watch('address')
  const watchStoreName = form.watch('storeName')
  const watchBrandIds = form.watch('brandIds')
  const watchCategoryIds = form.watch('categoryIds')

  const isSeller = watchRole === 'seller'
  const totalSteps = isSeller ? 4 : 3

  const taxonomyFetchedRef = useRef(false)

  useEffect(() => {
    if (currentStep !== 4) {
      taxonomyFetchedRef.current = false
      return
    }
    if (taxonomy || taxonomyFetchedRef.current) return
    taxonomyFetchedRef.current = true
    setLoadingTaxonomy(true)
    getPublicTaxonomyFn()
      .then((payload: any) => {
        if (payload?.brands || payload?.categories) {
          setTaxonomy({
            brands: (payload.brands || []).map((b: any) => ({
              id: b.id,
              name: b.brand,
              imageUrl: b.imageUrl,
            })),
            categories: (payload.categories || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              imageUrl: c.imageUrl,
            })),
          })
        }
      })
      .catch(() =>
        Alert.alert(
          tI18n('onboarding.error.generic'),
          tI18n('common.somethingWentWrong'),
        ),
      )
      .finally(() => setLoadingTaxonomy(false))
  }, [currentStep, taxonomy])

  function animateToStep(next: number) {
    const dir = next > currentStep ? 1 : -1
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: dir * -20,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
      contentSlide.setValue(dir * 20)
      setCurrentStep(next)
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          stiffness: 500,
          damping: 40,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }

  const handleNext = useCallback(async () => {
    const stepFields: Record<number, Array<keyof OnboardingForm>> = {
      1: ['role'],
      2: ['name', 'email', 'phoneNumber', 'whatsappNumber'],
      3: ['wilaya', 'city', 'address'],
      4: [],
    }

    const fields = stepFields[currentStep] ?? []
    if (fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }

    if (currentStep === 3 && !isSeller) {
      await doSubmit()
    } else if (currentStep === 4) {
      await doSubmit()
    } else {
      animateToStep(currentStep + 1)
    }
  }, [currentStep, isSeller, form])

  const handlePrev = useCallback(() => {
    if (currentStep > 1) animateToStep(currentStep - 1)
  }, [currentStep])

  async function doSubmit() {
    setSubmitting(true)
    try {
      const data = form.getValues()
      const result = await completeOnboarding({
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber,
        storeName: data.storeName,
        wilaya: data.wilaya,
        city: data.city,
        address: data.address,
        companyAddress: data.companyAddress,
        commercialRegister: data.commercialRegister,
        brandIds: data.brandIds,
        categoryIds: data.categoryIds,
        image: avatarUrl || undefined,
      })
      const status = result.account_status || 'active'
      setRedirectStatus(status)
      setSuccess(true)
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          stiffness: 200,
          damping: 18,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start()
    } catch (err: any) {
      Alert.alert(
        tI18n('onboarding.error.generic'),
        err?.message || tI18n('common.somethingWentWrong'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoNext() {
    const data = form.getValues()
    onComplete(
      data.role,
      redirectStatus === 'waitlisted' ? 'waitlisted' : 'active',
    )
  }

  const pickAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          tI18n('common.somethingWentWrong'),
          tI18n('onboarding.error.generic'),
        )
        return
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      })
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri
        setAvatarUri(uri)
        setUploadingAvatar(true)
        try {
          const url = await compressAndUpload(uri, 'profiles')
          setAvatarUrl(url)
        } catch (err: any) {
          if (__DEV__)
            console.log(
              '\n❌ avatar upload error:',
              JSON.stringify(err),
              err?.message,
              '\n',
            )
          Alert.alert(
            tI18n('onboarding.error.generic'),
            err?.message || tI18n('common.somethingWentWrong'),
          )
        } finally {
          setUploadingAvatar(false)
        }
      }
    } catch {
      Alert.alert(
        tI18n('onboarding.error.generic'),
        tI18n('common.somethingWentWrong'),
      )
    }
  }, [])

  function toggleBrand(id: string) {
    const current = form.getValues('brandIds')
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id]
    form.setValue('brandIds', next, { shouldDirty: true })
  }

  function toggleCategory(id: string) {
    const current = form.getValues('categoryIds')
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id]
    form.setValue('categoryIds', next, { shouldDirty: true })
  }

  if (success) {
    const isWaitlisted = redirectStatus === 'waitlisted'
    return (
      <View style={styles.root}>
        <View style={{ flex: 0.85, minHeight: insets.top }} />
        <View style={styles.successWrap}>
          {avatarUri ? (
            <View
              style={[
                styles.successAvatarRing,
                {
                  borderColor: isWaitlisted
                    ? t.primary + '25'
                    : t.success + '25',
                },
              ]}
            >
              <Image
                source={{ uri: avatarUri }}
                style={styles.successAvatarImage}
                contentFit="cover"
              />
            </View>
          ) : (
            <View
              style={[
                styles.successIconRing,
                {
                  borderColor: isWaitlisted
                    ? t.primary + '25'
                    : t.success + '25',
                },
              ]}
            >
              <View
                style={[
                  styles.successIconCircle,
                  {
                    backgroundColor: isWaitlisted
                      ? t.primary + '12'
                      : t.success + '12',
                  },
                ]}
              >
                <Ionicons
                  name={isWaitlisted ? 'time-outline' : 'checkmark-circle'}
                  size={48}
                  color={isWaitlisted ? t.primary : t.success}
                />
              </View>
            </View>
          )}

          <View style={styles.successCopy}>
            <Text style={styles.successTitle}>
              {isWaitlisted
                ? tI18n('waitlist.title')
                : tI18n('onboarding.completeSetup')}
            </Text>
            <Text style={styles.successBody}>
              {isWaitlisted
                ? tI18n('waitlist.description')
                : tI18n('onboarding.completeSetup')}
            </Text>
          </View>

          <Button
            label={isWaitlisted ? tI18n('common.done') : tI18n('common.next')}
            onPress={handleGoNext}
          />

          {isWaitlisted && (
            <Pressable onPress={onLogOut} style={styles.logOutLink}>
              <Text style={styles.logOutLinkText}>
                {tI18n('profile.logOut')}
              </Text>
            </Pressable>
          )}
        </View>
        <View style={{ flex: 1 }} />
      </View>
    )
  }

  const isLastStep = (currentStep === 3 && !isSeller) || currentStep === 4

  const nextLabel = (() => {
    if (currentStep === 1 && !watchRole) return tI18n('onboarding.selectPhoto')
    if (isLastStep) return tI18n('onboarding.completeSetup')
    return tI18n('common.next')
  })()

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.brandMark}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>mlila</Text>
        </View>
        <Pressable
          onPress={onLogOut}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={styles.logOutText}>{tI18n('profile.logOut')}</Text>
        </Pressable>
      </View>

      <StepBar total={totalSteps} current={currentStep} theme={t} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateX: contentSlide }],
            }}
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: spacing.md,
            },
          ]}
        >
          {currentStep > 1 ? (
            <Pressable
              onPress={handlePrev}
              disabled={submitting}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={t.textMuted} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleNext}
            disabled={submitting}
            style={({ pressed }) => [
              styles.nextBtn,
              {
                backgroundColor: t.primary,
                shadowColor: t.primary,
              },
              pressed && !submitting && { opacity: 0.88 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={t.primaryFg} />
            ) : (
              <>
                <Text style={[styles.nextBtnLabel, { color: t.primaryFg }]}>
                  {nextLabel}
                </Text>
                <Ionicons
                  name={isLastStep ? 'checkmark' : 'arrow-forward'}
                  size={16}
                  color={t.primaryFg}
                />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <SpecialtiesSheet
        title={tI18n('onboarding.selectSpecialties')}
        data={taxonomy?.brands || []}
        selectedIds={watchBrandIds}
        onToggle={toggleBrand}
        visible={sheetType === 'brands'}
        onClose={() => setSheetType(null)}
      />
      <SpecialtiesSheet
        title={tI18n('onboarding.selectSpecialties')}
        data={taxonomy?.categories || []}
        selectedIds={watchCategoryIds}
        onToggle={toggleCategory}
        visible={sheetType === 'categories'}
        onClose={() => setSheetType(null)}
      />
    </View>
  )

  function renderStep() {
    switch (currentStep) {
      case 1:
        return renderRoleStep()
      case 2:
        return renderContactStep()
      case 3:
        return renderLocationStep()
      case 4:
        return renderSpecialtiesStep()
      default:
        return null
    }
  }

  function renderRoleStep() {
    return (
      <View style={styles.stepPad}>
        <StepHeading
          step={1}
          total={totalSteps}
          title={tI18n('onboarding.step.role')}
          subtitle={tI18n('onboarding.role.buyerDescription')}
          theme={t}
        />
        <View style={styles.roleGrid}>
          <RoleCard
            icon="car-outline"
            title={tI18n('onboarding.role.buyer')}
            subtitle={tI18n('onboarding.role.buyerDescription')}
            features={buyerFeatures}
            accentColor={t.primary}
            selected={watchRole === 'buyer'}
            onSelect={() =>
              form.setValue('role', 'buyer', { shouldValidate: true })
            }
            theme={t}
          />
          <RoleCard
            icon="storefront-outline"
            title={tI18n('onboarding.role.seller')}
            subtitle={tI18n('onboarding.role.sellerDescription')}
            features={sellerFeatures}
            accentColor={t.success}
            selected={watchRole === 'seller'}
            onSelect={() =>
              form.setValue('role', 'seller', { shouldValidate: true })
            }
            theme={t}
          />
        </View>
      </View>
    )
  }

  function renderContactStep() {
    return (
      <View style={styles.stepPad}>
        <StepHeading
          step={2}
          total={totalSteps}
          title={tI18n('onboarding.step.contact')}
          subtitle={tI18n('onboarding.phoneVisible')}
          theme={t}
        />

        <AvatarPicker
          uri={avatarUri}
          onPress={pickAvatar}
          theme={t}
          uploading={uploadingAvatar}
        />

        <View style={styles.fields}>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.name')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.name')}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.email')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.emailPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.phone')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.phonePlaceholder')}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={form.control}
            name="whatsappNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={
                  tI18n('onboarding.phone') + tI18n('onboarding.whatsappSuffix')
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.phonePlaceholder')}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            )}
          />
        </View>
      </View>
    )
  }

  function renderLocationStep() {
    return (
      <View style={styles.stepPad}>
        <StepHeading
          step={3}
          total={totalSteps}
          title={tI18n('onboarding.step.location')}
          subtitle={
            isSeller
              ? tI18n('onboarding.step.location')
              : tI18n('onboarding.step.location')
          }
          theme={t}
        />
        <View style={styles.fields}>
          {isSeller && (
            <Controller
              control={form.control}
              name="storeName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label={tI18n('onboarding.name')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={tI18n('onboarding.name')}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
          )}
          <WilayaPicker
            label={tI18n('onboarding.selectWilaya')}
            value={watchWilaya}
            onChange={(v) =>
              form.setValue('wilaya', v, { shouldValidate: true })
            }
          />
          <Controller
            control={form.control}
            name="city"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.city')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.cityPlaceholder')}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={form.control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.address')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.addressPlaceholder')}
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={form.control}
            name="companyAddress"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label={tI18n('onboarding.companyAddress')}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={tI18n('onboarding.companyAddressPlaceholder')}
                returnKeyType="next"
              />
            )}
          />
          {isSeller && (
            <Controller
              control={form.control}
              name="commercialRegister"
              render={({ field: { onChange, onBlur, value } }) => (
                <Field
                  label={tI18n('onboarding.commercialRegister')}
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={tI18n('onboarding.rcNumberPlaceholder')}
                  autoCapitalize="characters"
                  returnKeyType="done"
                />
              )}
            />
          )}
        </View>
      </View>
    )
  }

  function renderSpecialtiesStep() {
    return (
      <View style={styles.stepPad}>
        <StepHeading
          step={4}
          total={totalSteps}
          title={tI18n('onboarding.step.specialties')}
          subtitle={tI18n('onboarding.selectSpecialties')}
          theme={t}
        />
        {loadingTaxonomy ? (
          <View style={styles.listWrap}>
            <SkeletonRow theme={t} />
            <View style={styles.listDivider} />
            <SkeletonRow theme={t} />
          </View>
        ) : (
          <View style={styles.listWrap}>
            <SpecialtyRow
              label={tI18n('onboarding.brands')}
              icon="ribbon-outline"
              count={watchBrandIds.length}
              onPress={() => setSheetType('brands')}
              selectedItems={(taxonomy?.brands || []).filter((b) =>
                watchBrandIds.includes(b.id),
              )}
              accentColor={t.primary}
              theme={t}
            />
            <View style={styles.listDivider} />
            <SpecialtyRow
              label={tI18n('onboarding.categories')}
              icon="layers-outline"
              count={watchCategoryIds.length}
              onPress={() => setSheetType('categories')}
              selectedItems={(taxonomy?.categories || []).filter((c) =>
                watchCategoryIds.includes(c.id),
              )}
              accentColor={t.success}
              theme={t}
            />
          </View>
        )}
      </View>
    )
  }
}

function StepBar({
  total,
  current,
  theme: t,
}: {
  total: number
  current: number
  theme: Theme
}) {
  const stepBarStyles = makeStepBarStyles(t)
  return (
    <View style={stepBarStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            stepBarStyles.segment,
            {
              backgroundColor: i < current ? t.primary : t.border,
              opacity: i === current - 1 ? 1 : i < current - 1 ? 0.5 : 0.25,
            },
          ]}
        />
      ))}
    </View>
  )
}

function makeStepBarStyles(t: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 4,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
    },
    segment: {
      flex: 1,
      height: 3,
      borderRadius: 2,
    },
  })
}

function StepHeading({
  step,
  total,
  title,
  subtitle,
  theme: t,
}: {
  step: number
  total: number
  title: string
  subtitle: string
  theme: Theme
}) {
  const headingStyles = makeHeadingStyles(t)
  return (
    <View style={headingStyles.wrap}>
      <Text style={headingStyles.counter}>
        {step < 10 ? `0${step}` : step} / {total < 10 ? `0${total}` : total}
      </Text>
      <Text style={headingStyles.title}>{title}</Text>
      <Text style={headingStyles.subtitle}>{subtitle}</Text>
    </View>
  )
}

function makeHeadingStyles(t: Theme) {
  return StyleSheet.create({
    wrap: { gap: 4 },
    counter: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 2,
      color: t.textSubtle,
    },
    title: {
      fontSize: 27,
      fontWeight: '700',
      letterSpacing: -0.5,
      lineHeight: 33,
      color: t.text,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      marginTop: 2,
      color: t.textMuted,
    },
  })
}

const AVATAR_SIZE = 88

function AvatarPicker({
  uri,
  onPress,
  theme: t,
  uploading,
}: {
  uri: string | null
  onPress: () => void
  theme: Theme
  uploading?: boolean
}) {
  const { t: tI18n } = useTranslation()
  const avatarStyles = makeAvatarStyles(t)
  const scale = useRef(new Animated.Value(1)).current

  return (
    <View style={avatarStyles.wrap}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.93,
            stiffness: 420,
            damping: 22,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            stiffness: 420,
            damping: 22,
            useNativeDriver: true,
          }).start()
        }
        accessibilityLabel={tI18n('onboarding.selectPhoto')}
        accessibilityRole="button"
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <View
            style={[
              avatarStyles.circle,
              {
                backgroundColor: t.bgMuted,
                borderColor: uri ? t.primary + '40' : t.border,
              },
            ]}
          >
            {uri ? (
              <Image
                source={{ uri }}
                style={avatarStyles.image}
                contentFit="cover"
                accessibilityLabel={tI18n('onboarding.selectPhoto')}
              />
            ) : (
              <Ionicons name="person-outline" size={34} color={t.textSubtle} />
            )}
            {uploading && (
              <View style={avatarStyles.uploadOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </View>
          <View style={avatarStyles.badge}>
            <Ionicons name="camera" size={12} color={t.primaryFg} />
          </View>
        </Animated.View>
      </Pressable>

      <View style={avatarStyles.labelGroup}>
        <Text style={avatarStyles.label}>
          {tI18n('onboarding.selectPhoto')}
        </Text>
        <Text style={avatarStyles.hint}>{tI18n('onboarding.optional')}</Text>
      </View>
    </View>
  )
}

function makeAvatarStyles(t: Theme) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
    },
    circle: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    badge: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primary,
      borderColor: t.bg,
    },
    uploadOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: AVATAR_SIZE / 2,
    },
    labelGroup: {
      alignItems: 'center',
      gap: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: t.text,
    },
    hint: {
      fontSize: 12,
      fontWeight: '400',
      color: t.textSubtle,
    },
  })
}

function RoleCard({
  icon,
  title,
  subtitle,
  features,
  selected,
  accentColor,
  onSelect,
  theme: t,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  features: Array<string>
  selected: boolean
  accentColor: string
  onSelect: () => void
  theme: Theme
}) {
  const cardStyles = makeCardStyles(t)
  const scale = useRef(new Animated.Value(1)).current

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onSelect}
        onPressIn={() =>
          Animated.spring(scale, {
            toValue: 0.972,
            stiffness: 420,
            damping: 28,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            stiffness: 420,
            damping: 28,
            useNativeDriver: true,
          }).start()
        }
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[
          cardStyles.card,
          {
            borderLeftColor: selected ? accentColor : 'transparent',
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          },
        ]}
      >
        <View style={cardStyles.header}>
          <View
            style={[
              cardStyles.iconCircle,
              {
                backgroundColor: selected ? accentColor + '16' : t.bgMuted,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? accentColor + '38' : t.border,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={28}
              color={selected ? accentColor : t.textMuted}
            />
          </View>

          <View
            style={[
              cardStyles.radio,
              {
                borderColor: selected ? accentColor : t.borderStrong,
                backgroundColor: selected ? accentColor : 'transparent',
              },
            ]}
          >
            {selected && (
              <Ionicons name="checkmark" size={12} color={t.primaryFg} />
            )}
          </View>
        </View>

        <Text style={[cardStyles.eyebrow, { color: accentColor }]}>
          {subtitle}
        </Text>
        <Text style={cardStyles.title}>{title}</Text>

        <View
          style={[
            cardStyles.divider,
            {
              backgroundColor: selected ? accentColor + '22' : t.border,
            },
          ]}
        />

        <View style={cardStyles.featureList}>
          {features.map((f) => (
            <View key={f} style={cardStyles.featureRow}>
              <View
                style={[
                  cardStyles.featureDot,
                  {
                    backgroundColor: selected ? accentColor : t.textSubtle,
                    opacity: selected ? 1 : 0.45,
                  },
                ]}
              />
              <Text
                style={[
                  cardStyles.featureText,
                  { color: selected ? t.text : t.textMuted },
                ]}
              >
                {f}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  )
}

function makeCardStyles(t: Theme) {
  return StyleSheet.create({
    card: {
      borderRadius: radius.xl,
      padding: spacing.lg,
      backgroundColor: t.surface,
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 5,
      borderTopColor: t.border,
      borderRightColor: t.border,
      borderBottomColor: t.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
      marginBottom: spacing.sm,
      color: t.text,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginBottom: spacing.md,
    },
    featureList: {
      gap: spacing.sm,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    featureText: {
      fontSize: 14,
      fontWeight: '500',
    },
  })
}

function SpecialtyRow({
  label,
  icon,
  count,
  onPress,
  selectedItems,
  accentColor,
  theme: t,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  count: number
  onPress: () => void
  selectedItems: Array<TaxItem>
  accentColor: string
  theme: Theme
}) {
  const { t: tI18n } = useTranslation()
  const rowStyles = makeRowStyles(t)
  const opacity = useRef(new Animated.Value(1)).current
  const hasItems = count > 0

  return (
    <View>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 70,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.timing(opacity, {
            toValue: 1,
            duration: 140,
            useNativeDriver: true,
          }).start()
        }
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count} ${tI18n('specialtiesSheet.nSelected', { count })}`}
      >
        <Animated.View style={[rowStyles.row, { opacity }]}>
          <View
            style={[
              rowStyles.iconWrap,
              { backgroundColor: hasItems ? accentColor + '14' : t.bgMuted },
            ]}
          >
            <Ionicons
              name={icon}
              size={15}
              color={hasItems ? accentColor : t.textSubtle}
            />
          </View>

          <Text style={rowStyles.label}>{label}</Text>

          <View style={rowStyles.trailing}>
            {hasItems ? (
              <View style={[rowStyles.badge, { backgroundColor: accentColor }]}>
                <Text style={rowStyles.badgeText}>{count}</Text>
              </View>
            ) : (
              <Text style={rowStyles.none}>{tI18n('common.skip')}</Text>
            )}
            <Ionicons
              name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
              size={15}
              color={t.textSubtle}
            />
          </View>
        </Animated.View>
      </Pressable>

      {hasItems && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={rowStyles.chipScroll}
          contentContainerStyle={rowStyles.chipContent}
        >
          {selectedItems.slice(0, 8).map((item) => (
            <View
              key={item.id}
              style={[
                rowStyles.chip,
                {
                  backgroundColor: accentColor + '10',
                  borderColor: accentColor + '26',
                },
              ]}
            >
              <Text
                style={[rowStyles.chipText, { color: accentColor }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
          ))}
          {count > 8 && (
            <View style={rowStyles.chip}>
              <Text style={rowStyles.chipText}>+{count - 8}</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

function makeRowStyles(t: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: t.text,
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    badge: {
      borderRadius: radius.pill,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    none: {
      fontSize: 14,
      color: t.textSubtle,
    },
    chipScroll: {
      marginBottom: spacing.md,
    },
    chipContent: {
      gap: spacing.xs,
      flexDirection: 'row',
    },
    chip: {
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: 11,
      paddingVertical: 5,
      backgroundColor: t.bgMuted,
      borderColor: t.border,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.textMuted,
    },
  })
}

function SkeletonRow({ theme: t }: { theme: Theme }) {
  const skelStyles = makeSkelStyles(t)
  const pulse = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 680,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  return (
    <Animated.View style={[skelStyles.row, { opacity: pulse }]}>
      <View style={skelStyles.block} />
      <View style={skelStyles.line} />
      <View style={skelStyles.pill} />
      <View style={skelStyles.dot} />
    </Animated.View>
  )
}

function makeSkelStyles(t: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      gap: spacing.sm,
    },
    block: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.bgMuted,
    },
    line: { flex: 1, height: 14, borderRadius: 7, backgroundColor: t.bgMuted },
    pill: {
      width: 28,
      height: 22,
      borderRadius: radius.pill,
      backgroundColor: t.bgMuted,
    },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: t.bgMuted },
  })
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    flex: { flex: 1 },
    centered: { alignItems: 'center', justifyContent: 'center' },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.sm,
    },
    brandMark: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    brandDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: t.primary,
    },
    brandName: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.4,
      color: t.text,
    },
    logOutText: {
      fontSize: 14,
      fontWeight: '500',
      color: t.textSubtle,
    },

    scrollContent: { paddingBottom: spacing.xl },
    stepPad: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      gap: spacing.xl,
    },
    fields: { gap: spacing.lg },
    roleGrid: { gap: spacing.md },

    listWrap: {
      marginHorizontal: -spacing.xl,
      paddingHorizontal: spacing.xl,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
      borderBottomColor: t.border,
    },
    listDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: t.border,
    },
    loadingBlock: {
      paddingVertical: 48,
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      ...typography.body,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
      gap: spacing.sm,
      backgroundColor: t.bg,
    },
    backBtn: {
      width: 48,
      height: 52,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bg,
    },
    nextBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      minHeight: 52,
      gap: 7,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 6,
    },
    nextBtnLabel: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.1,
    },

    successWrap: {
      paddingHorizontal: spacing.xxl,
      alignItems: 'center',
      gap: spacing.xl,
    },
    successAvatarRing: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    successAvatarImage: {
      width: 108,
      height: 108,
      borderRadius: 54,
    },
    successIconRing: {
      width: 112,
      height: 112,
      borderRadius: 56,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successIconCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successCopy: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    successTitle: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.4,
      textAlign: 'center',
      color: t.text,
    },
    successBody: {
      ...typography.body,
      textAlign: 'center',
      lineHeight: 23,
      maxWidth: 280,
      color: t.textMuted,
    },
    logOutLink: {
      paddingVertical: spacing.sm,
    },
    logOutLinkText: {
      fontSize: 14,
      fontWeight: '500',
      color: t.textSubtle,
    },
  })
}
