/* Hallmark · macrostructure: single-column progressive form
 * genre: modern-minimal · theme: Quiet
 * tone: utilitarian · anchor hue: blue-260
 * P5 H5 E5 S5 R5 V4
 */
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { SpecialtiesSheet } from '../components/SpecialtiesSheet'
import { WilayaPicker } from '../components/WilayaPicker'
import { completeOnboarding, getPublicTaxonomyFn } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { SessionUser } from '../lib/api-client'

type Role = 'buyer' | 'seller' | ''

interface FormData {
  role: Role
  name: string
  email: string
  phoneNumber: string
  whatsappNumber: string
  storeName: string
  wilaya: string
  city: string
  address: string
  companyAddress: string
  commercialRegister: string
  brandIds: Array<string>
  categoryIds: Array<string>
}

interface TaxItem {
  id: string
  name: string
  imageUrl?: string | null
}

type TaxonomyData = {
  brands: Array<TaxItem>
  categories: Array<TaxItem>
}

const STEPS_ALL = [
  { id: 1, label: 'Role' },
  { id: 2, label: 'Contact' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Specialties' },
]

const BUYER_FEATURES = ['Post requests', 'Get quotes', 'Compare offers']
const SELLER_FEATURES = ['Browse leads', 'Send quotes', 'Track orders']

interface OnboardingScreenProps {
  user: SessionUser
  onComplete: (accountStatus: string) => void
  onLogOut: () => void
}

export function OnboardingScreen({
  user,
  onComplete,
  onLogOut,
}: OnboardingScreenProps) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const scrollRef = useRef<ScrollView>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [redirectStatus, setRedirectStatus] = useState('active')
  const [taxonomy, setTaxonomy] = useState<TaxonomyData | null>(null)
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false)
  const [sheetType, setSheetType] = useState<'brands' | 'categories' | null>(null)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

  const contentOpacity = useRef(new Animated.Value(1)).current
  const contentSlide = useRef(new Animated.Value(0)).current

  // Success entrance
  const successScale = useRef(new Animated.Value(0.8)).current
  const successOpacity = useRef(new Animated.Value(0)).current

  const [form, setForm] = useState<FormData>({
    role: (user.role as Role) || '',
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
  })

  const isSeller = form.role === 'seller'
  const totalSteps = isSeller ? 4 : 3

  const updateForm = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const stepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return form.role === 'buyer' || form.role === 'seller'
      case 2:
        return (
          form.name.length >= 2 &&
          form.email.includes('@') &&
          form.phoneNumber.length >= 8 &&
          form.whatsappNumber.length >= 8
        )
      case 3: {
        const base =
          form.wilaya.length > 0 &&
          form.city.length > 0 &&
          form.address.length > 0
        if (isSeller) return base && form.storeName.length >= 2
        return base
      }
      case 4:
        return true
      default:
        return true
    }
  }, [currentStep, form, isSeller])

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
      .catch(() => Alert.alert('Error', 'Could not load specialties.'))
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
    if (!stepValid) {
      Alert.alert('Incomplete', 'Please fill all required fields.')
      return
    }
    if (currentStep === 3 && !isSeller) {
      await doSubmit()
    } else if (currentStep === 4) {
      await doSubmit()
    } else {
      animateToStep(currentStep + 1)
    }
  }, [currentStep, stepValid, isSeller])

  const handlePrev = useCallback(() => {
    if (currentStep > 1) animateToStep(currentStep - 1)
  }, [currentStep])

  async function doSubmit() {
    setSubmitting(true)
    try {
      const result = await completeOnboarding({
        name: form.name,
        email: form.email,
        role: form.role as 'buyer' | 'seller',
        phoneNumber: form.phoneNumber,
        whatsappNumber: form.whatsappNumber,
        storeName: form.storeName,
        wilaya: form.wilaya,
        city: form.city,
        address: form.address,
        companyAddress: form.companyAddress,
        commercialRegister: form.commercialRegister,
        brandIds: form.brandIds,
        categoryIds: form.categoryIds,
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
      Alert.alert('Submission failed', err?.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoNext() {
    onComplete(redirectStatus === 'waitlisted' ? 'waitlisted' : 'active')
  }

  const pickAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to add a profile photo.',
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
        setAvatarUri(result.assets[0].uri)
      }
    } catch {
      Alert.alert('Error', 'Could not open photo library.')
    }
  }, [])

  function toggleBrand(id: string) {
    setForm((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(id)
        ? prev.brandIds.filter((i) => i !== id)
        : [...prev.brandIds, id],
    }))
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((i) => i !== id)
        : [...prev.categoryIds, id],
    }))
  }

  // ─── Success screen ────────────────────────────────────────────────
  if (success) {
    const isWaitlisted = redirectStatus === 'waitlisted'
    return (
      <View
        style={[
          styles.root,
          styles.centered,
          { backgroundColor: t.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Animated.View
          style={[
            styles.successWrap,
            {
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          {/* Avatar or icon */}
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
            <Text style={[styles.successTitle, { color: t.text }]}>
              {isWaitlisted ? "You're on the list" : "You're all set!"}
            </Text>
            <Text style={[styles.successBody, { color: t.textMuted }]}>
              {isWaitlisted
                ? "Your seller profile is under review. We'll notify you when approved."
                : "Your account is ready. Let's get started."}
            </Text>
          </View>

          <Button
            label={isWaitlisted ? 'Got it' : 'Go to dashboard'}
            onPress={handleGoNext}
          />

          {isWaitlisted && (
            <Pressable onPress={onLogOut} style={styles.logOutLink}>
              <Text style={[styles.logOutLinkText, { color: t.textSubtle }]}>
                Log out
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    )
  }

  // ─── Main flow ─────────────────────────────────────────────────────
  const isLastStep = (currentStep === 3 && !isSeller) || currentStep === 4

  const nextLabel = (() => {
    if (currentStep === 1 && !form.role) return 'Select a role'
    if (isLastStep) return 'Complete'
    return 'Continue'
  })()

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.brandMark}>
          <View style={[styles.brandDot, { backgroundColor: t.primary }]} />
          <Text style={[styles.brandName, { color: t.text }]}>mlila</Text>
        </View>
        <Pressable
          onPress={onLogOut}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={({ pressed }) => pressed && { opacity: 0.6 }}
        >
          <Text style={[styles.logOutText, { color: t.textSubtle }]}>
            Log out
          </Text>
        </Pressable>
      </View>

      {/* Step progress bar */}
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

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: t.border,
              backgroundColor: t.bg,
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
                { borderColor: t.border, backgroundColor: t.bg },
                pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={t.textMuted} />
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleNext}
            disabled={submitting || !stepValid}
            style={({ pressed }) => [
              styles.nextBtn,
              {
                backgroundColor: stepValid ? t.primary : t.border,
                shadowColor: stepValid ? t.primary : 'transparent',
              },
              pressed && stepValid && !submitting && { opacity: 0.88 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={t.primaryFg} />
            ) : (
              <>
                <Text
                  style={[
                    styles.nextBtnLabel,
                    { color: stepValid ? t.primaryFg : t.textSubtle },
                  ]}
                >
                  {nextLabel}
                </Text>
                <Ionicons
                  name={isLastStep ? 'checkmark' : 'arrow-forward'}
                  size={16}
                  color={stepValid ? t.primaryFg : t.textSubtle}
                />
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <SpecialtiesSheet
        title="Select brands"
        data={taxonomy?.brands || []}
        selectedIds={form.brandIds}
        onToggle={toggleBrand}
        visible={sheetType === 'brands'}
        onClose={() => setSheetType(null)}
      />
      <SpecialtiesSheet
        title="Select categories"
        data={taxonomy?.categories || []}
        selectedIds={form.categoryIds}
        onToggle={toggleCategory}
        visible={sheetType === 'categories'}
        onClose={() => setSheetType(null)}
      />
    </View>
  )

  // ─── Step renderers ────────────────────────────────────────────────

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
          title="Choose your role"
          subtitle="How will you use mlila? This can't be changed later."
          theme={t}
        />
        <View style={styles.roleGrid}>
          <RoleCard
            icon="car-outline"
            title="Buyer"
            subtitle="For vehicle owners"
            features={BUYER_FEATURES}
            accentColor={t.primary}
            selected={form.role === 'buyer'}
            onSelect={() => updateForm('role', 'buyer')}
            theme={t}
          />
          <RoleCard
            icon="storefront-outline"
            title="Seller"
            subtitle="For parts businesses"
            features={SELLER_FEATURES}
            accentColor={t.success}
            selected={form.role === 'seller'}
            onSelect={() => updateForm('role', 'seller')}
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
          title="Contact info"
          subtitle="How buyers and mlila can reach you."
          theme={t}
        />

        {/* Avatar picker */}
        <AvatarPicker uri={avatarUri} onPress={pickAvatar} theme={t} />

        <View style={styles.fields}>
          <Field
            label="Full name"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
            placeholder="Your name"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />
          <Field
            label="Email"
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
          />
          <Field
            label="Phone number"
            value={form.phoneNumber}
            onChangeText={(v) => updateForm('phoneNumber', v)}
            placeholder="05xx xx xx xx"
            keyboardType="phone-pad"
            returnKeyType="next"
          />
          <Field
            label="WhatsApp number"
            value={form.whatsappNumber}
            onChangeText={(v) => updateForm('whatsappNumber', v)}
            placeholder="05xx xx xx xx"
            keyboardType="phone-pad"
            returnKeyType="done"
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
          title={isSeller ? 'Store & location' : 'Your location'}
          subtitle={
            isSeller
              ? 'Tell buyers where your store is based.'
              : 'Help sellers find parts near you.'
          }
          theme={t}
        />
        <View style={styles.fields}>
          {isSeller && (
            <Field
              label="Store name"
              value={form.storeName}
              onChangeText={(v) => updateForm('storeName', v)}
              placeholder="Your store name"
              autoCapitalize="words"
              returnKeyType="next"
            />
          )}
          <WilayaPicker
            label="Wilaya"
            value={form.wilaya}
            onChange={(v) => updateForm('wilaya', v)}
          />
          <Field
            label="City / municipality"
            value={form.city}
            onChangeText={(v) => updateForm('city', v)}
            placeholder="City name"
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Field
            label="Address"
            value={form.address}
            onChangeText={(v) => updateForm('address', v)}
            placeholder="Street, building, etc."
            returnKeyType="next"
          />
          <Field
            label="Company address (optional)"
            value={form.companyAddress}
            onChangeText={(v) => updateForm('companyAddress', v)}
            placeholder="If different from above"
            returnKeyType="next"
          />
          {isSeller && (
            <Field
              label="Commercial register (optional)"
              value={form.commercialRegister}
              onChangeText={(v) => updateForm('commercialRegister', v)}
              placeholder="RC number"
              autoCapitalize="characters"
              returnKeyType="done"
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
          title="Your specialties"
          subtitle="Brands and categories you work with. Update any time."
          theme={t}
        />
        {loadingTaxonomy ? (
          <View style={[styles.listWrap, { borderTopColor: t.border, borderBottomColor: t.border }]}>
            <SkeletonRow theme={t} />
            <View style={[styles.listDivider, { backgroundColor: t.border }]} />
            <SkeletonRow theme={t} />
          </View>
        ) : (
          <View style={[styles.listWrap, { borderTopColor: t.border, borderBottomColor: t.border }]}>
            <SpecialtyRow
              label="Brands"
              icon="ribbon-outline"
              count={form.brandIds.length}
              onPress={() => setSheetType('brands')}
              selectedItems={(taxonomy?.brands || []).filter((b) =>
                form.brandIds.includes(b.id),
              )}
              accentColor={t.primary}
              theme={t}
            />
            <View style={[styles.listDivider, { backgroundColor: t.border }]} />
            <SpecialtyRow
              label="Categories"
              icon="layers-outline"
              count={form.categoryIds.length}
              onPress={() => setSheetType('categories')}
              selectedItems={(taxonomy?.categories || []).filter((c) =>
                form.categoryIds.includes(c.id),
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

// ─── StepBar ───────────────────────────────────────────────────────────────────

function StepBar({
  total,
  current,
  theme: t,
}: {
  total: number
  current: number
  theme: any
}) {
  return (
    <View style={stepBarStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            stepBarStyles.segment,
            {
              backgroundColor:
                i < current
                  ? t.primary
                  : t.border,
              opacity: i === current - 1 ? 1 : i < current - 1 ? 0.5 : 0.25,
            },
          ]}
        />
      ))}
    </View>
  )
}

const stepBarStyles = StyleSheet.create({
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

// ─── StepHeading ───────────────────────────────────────────────────────────────

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
  theme: any
}) {
  return (
    <View style={headingStyles.wrap}>
      <Text style={[headingStyles.counter, { color: t.textSubtle }]}>
        {step < 10 ? `0${step}` : step} / {total < 10 ? `0${total}` : total}
      </Text>
      <Text style={[headingStyles.title, { color: t.text }]}>{title}</Text>
      <Text style={[headingStyles.subtitle, { color: t.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  )
}

const headingStyles = StyleSheet.create({
  wrap: { gap: 4 },
  counter: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
})

// ─── AvatarPicker ──────────────────────────────────────────────────────────────

const AVATAR_SIZE = 88

function AvatarPicker({
  uri,
  onPress,
  theme: t,
}: {
  uri: string | null
  onPress: () => void
  theme: any
}) {
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
        accessibilityLabel="Set profile photo"
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
                accessibilityLabel="Profile photo"
              />
            ) : (
              <Ionicons
                name="person-outline"
                size={34}
                color={t.textSubtle}
              />
            )}
          </View>
          {/* Camera badge */}
          <View
            style={[
              avatarStyles.badge,
              {
                backgroundColor: t.primary,
                borderColor: t.bg,
              },
            ]}
          >
            <Ionicons name="camera" size={12} color={t.primaryFg} />
          </View>
        </Animated.View>
      </Pressable>

      <View style={avatarStyles.labelGroup}>
        <Text style={[avatarStyles.label, { color: t.text }]}>
          {uri ? 'Change photo' : 'Profile photo'}
        </Text>
        <Text style={[avatarStyles.hint, { color: t.textSubtle }]}>
          Optional
        </Text>
      </View>
    </View>
  )
}

const avatarStyles = StyleSheet.create({
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
  },
  labelGroup: {
    alignItems: 'center',
    gap: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
  },
})

// ─── RoleCard ──────────────────────────────────────────────────────────────────

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
  theme: any
}) {
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
            backgroundColor: t.surface,
            borderTopWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderLeftWidth: 5,
            borderTopColor: t.border,
            borderRightColor: t.border,
            borderBottomColor: t.border,
            borderLeftColor: selected ? accentColor : 'transparent',
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 1,
          },
        ]}
      >
        {/* Header: large icon circle + radio */}
        <View style={cardStyles.header}>
          <View
            style={[
              cardStyles.iconCircle,
              {
                backgroundColor: selected
                  ? accentColor + '16'
                  : t.bgMuted,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected
                  ? accentColor + '38'
                  : t.border,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={28}
              color={selected ? accentColor : t.textMuted}
            />
          </View>

          {/* Selection indicator */}
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

        {/* Eyebrow + title */}
        <Text style={[cardStyles.eyebrow, { color: accentColor }]}>
          {subtitle}
        </Text>
        <Text style={[cardStyles.title, { color: t.text }]}>{title}</Text>

        {/* Divider */}
        <View
          style={[
            cardStyles.divider,
            {
              backgroundColor: selected
                ? accentColor + '22'
                : t.border,
            },
          ]}
        />

        {/* Feature rows */}
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

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
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

/* Hallmark · component: specialty-row · genre: modern-minimal · theme: catalog-existing
 * states: default · active · loading · pressed
 * contrast: pass (46–50)
 * P5 H5 E5 S5 R5 V5
 */

// ─── SpecialtyRow ─────────────────────────────────────────────────────────────

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
  theme: any
}) {
  const opacity = useRef(new Animated.Value(1)).current
  const hasItems = count > 0

  return (
    <View>
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.timing(opacity, { toValue: 0.5, duration: 70, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }).start()
        }
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count} selected. Tap to edit.`}
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

          <Text style={[rowStyles.label, { color: t.text }]}>{label}</Text>

          <View style={rowStyles.trailing}>
            {hasItems ? (
              <View style={[rowStyles.badge, { backgroundColor: accentColor }]}>
                <Text style={rowStyles.badgeText}>{count}</Text>
              </View>
            ) : (
              <Text style={[rowStyles.none, { color: t.textSubtle }]}>None</Text>
            )}
            <Ionicons name="chevron-forward" size={15} color={t.textSubtle} />
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
                { backgroundColor: accentColor + '10', borderColor: accentColor + '26' },
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
            <View style={[rowStyles.chip, { backgroundColor: t.bgMuted, borderColor: t.border }]}>
              <Text style={[rowStyles.chipText, { color: t.textMuted }]}>
                +{count - 8}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const rowStyles = StyleSheet.create({
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
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})

// ─── SkeletonRow ──────────────────────────────────────────────────────────────

function SkeletonRow({ theme: t }: { theme: any }) {
  const pulse = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 680, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 680, useNativeDriver: true }),
      ]),
    ).start()
  }, [])

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.sm,
        opacity: pulse,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.bgMuted }} />
      <View style={{ flex: 1, height: 14, borderRadius: 7, backgroundColor: t.bgMuted }} />
      <View style={{ width: 28, height: 22, borderRadius: radius.pill, backgroundColor: t.bgMuted }} />
      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.bgMuted }} />
    </Animated.View>
  )
}

// ─── Screen-level styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },

  // Top bar — minimal, no border
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
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  logOutText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Step content
  scrollContent: { paddingBottom: spacing.xl },
  stepPad: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  fields: { gap: spacing.lg },
  roleGrid: { gap: spacing.md },

  // Specialties list
  listWrap: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
  },
  loadingBlock: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  backBtn: {
    width: 48,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 48,
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

  // Success
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
  },
  successBody: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 280,
  },
  logOutLink: {
    paddingVertical: spacing.sm,
  },
  logOutLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
})
