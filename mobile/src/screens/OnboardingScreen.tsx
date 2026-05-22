import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { ProgressIndicator } from '../components/ProgressIndicator'
import { SpecialtiesSheet } from '../components/SpecialtiesSheet'
import { WilayaPicker } from '../components/WilayaPicker'
import { completeOnboarding, fetchServerFn } from '../lib/api-client'
import { SERVER_FNS, serverFnUrl } from '../lib/server-fn'
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

  // Step content transition
  const contentOpacity = useRef(new Animated.Value(1)).current
  const contentSlide = useRef(new Animated.Value(0)).current

  // Success entrance
  const successScale = useRef(new Animated.Value(0.75)).current
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
    const url = serverFnUrl(SERVER_FNS.getPublicTaxonomy)
    fetchServerFn<any>(url, { method: 'GET' })
      .then((raw: any) => {
        const payload = raw?.data ?? raw
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
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: dir * -24,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false })
      contentSlide.setValue(dir * 24)
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
          stiffness: 180,
          damping: 18,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 260,
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
      <View style={[styles.root, styles.centered, { backgroundColor: t.bg }]}>
        <Animated.View
          style={[
            styles.successWrap,
            { opacity: successOpacity, transform: [{ scale: successScale }] },
          ]}
        >
          <View
            style={[
              styles.successRing,
              {
                borderColor: isWaitlisted ? t.primary + '30' : t.success + '30',
              },
            ]}
          >
            <View
              style={[
                styles.successCircle,
                {
                  backgroundColor: isWaitlisted
                    ? t.primary + '14'
                    : t.success + '14',
                },
              ]}
            >
              <Ionicons
                name={isWaitlisted ? 'time-outline' : 'checkmark-circle'}
                size={52}
                color={isWaitlisted ? t.primary : t.success}
              />
            </View>
          </View>

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
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <Text style={[styles.topBarBrand, { color: t.text }]}>mlila</Text>
        <Pressable
          onPress={onLogOut}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Text style={[styles.logOutText, { color: t.textSubtle }]}>
            Log out
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ProgressIndicator
          steps={STEPS_ALL}
          currentStep={currentStep}
          sellerMode={isSeller}
        />

        <View style={[styles.divider, { backgroundColor: t.border }]} />

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
            { borderTopColor: t.border, backgroundColor: t.bg },
          ]}
        >
          {currentStep > 1 ? (
            <Pressable
              onPress={handlePrev}
              disabled={submitting}
              style={({ pressed }) => [
                styles.backBtn,
                { borderColor: t.border },
                pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color={t.textMuted} />
            </Pressable>
          ) : (
            <View style={styles.backBtnPlaceholder} />
          )}

          <Pressable
            onPress={handleNext}
            disabled={submitting || !stepValid}
            style={({ pressed }) => [
              styles.nextBtn,
              {
                backgroundColor: stepValid ? t.primary : t.border,
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
                  size={17}
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
          icon="person-outline"
          title="Choose your role"
          subtitle="How will you use mlila? This can't be changed later."
          theme={t}
        />
        <View style={styles.roleGrid}>
          <RoleCard
            icon="car-outline"
            title="Buyer"
            subtitle="For vehicle owners"
            description="Find spare parts, post requests, and receive competitive quotes."
            features={BUYER_FEATURES}
            selected={form.role === 'buyer'}
            onSelect={() => updateForm('role', 'buyer')}
            theme={t}
          />
          <RoleCard
            icon="storefront-outline"
            title="Seller"
            subtitle="For parts businesses"
            description="Connect with buyers, respond to leads, and grow your revenue."
            features={SELLER_FEATURES}
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
          icon="call-outline"
          title="Contact info"
          subtitle="How buyers and mlila can reach you."
          theme={t}
        />
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
          icon={isSeller ? 'business-outline' : 'location-outline'}
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
          icon="construct-outline"
          title="Your specialties"
          subtitle="Brands and categories you work with. Update these any time."
          theme={t}
        />
        {loadingTaxonomy ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={t.primary} />
            <Text style={[styles.loadingText, { color: t.textMuted }]}>
              Loading catalog…
            </Text>
          </View>
        ) : (
          <View style={styles.specialtiesWrap}>
            <SpecialtyPicker
              label="Brands"
              icon="ribbon-outline"
              count={form.brandIds.length}
              emptyHint="Tap to select vehicle brands"
              onPress={() => setSheetType('brands')}
              selectedItems={(taxonomy?.brands || []).filter((b) =>
                form.brandIds.includes(b.id),
              )}
              theme={t}
            />
            <SpecialtyPicker
              label="Part categories"
              icon="layers-outline"
              count={form.categoryIds.length}
              emptyHint="Tap to select part categories"
              onPress={() => setSheetType('categories')}
              selectedItems={(taxonomy?.categories || []).filter((c) =>
                form.categoryIds.includes(c.id),
              )}
              theme={t}
            />
          </View>
        )}
      </View>
    )
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StepHeading({
  icon,
  title,
  subtitle,
  theme: t,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  theme: any
}) {
  return (
    <View style={headingStyles.wrap}>
      <View
        style={[headingStyles.badge, { backgroundColor: t.primary + '12' }]}
      >
        <Ionicons name={icon} size={20} color={t.primary} />
      </View>
      <Text style={[headingStyles.title, { color: t.text }]}>{title}</Text>
      <Text style={[headingStyles.subtitle, { color: t.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  )
}

const headingStyles = StyleSheet.create({
  wrap: { gap: 6 },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
})

function RoleCard({
  icon,
  title,
  subtitle,
  description,
  features,
  selected,
  onSelect,
  theme: t,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  description: string
  features: Array<string>
  selected: boolean
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
            toValue: 0.975,
            stiffness: 400,
            damping: 25,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, {
            toValue: 1,
            stiffness: 400,
            damping: 25,
            useNativeDriver: true,
          }).start()
        }
        style={[
          cardStyles.card,
          {
            backgroundColor: selected ? t.primary + '08' : t.surface,
            borderColor: selected ? t.primary : t.border,
            shadowColor: selected ? t.primary : '#000',
            shadowOpacity: selected ? 0.14 : 0.04,
            shadowRadius: selected ? 14 : 4,
            shadowOffset: { width: 0, height: 4 },
            elevation: selected ? 5 : 1,
          },
        ]}
      >
        {/* Card header row */}
        <View style={cardStyles.header}>
          <View
            style={[
              cardStyles.iconWrap,
              {
                backgroundColor: selected ? t.primary + '18' : t.bgMuted,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={24}
              color={selected ? t.primary : t.textMuted}
            />
          </View>
          <View
            style={[
              cardStyles.radio,
              {
                borderColor: selected ? t.primary : t.borderStrong,
                backgroundColor: selected ? t.primary : 'transparent',
              },
            ]}
          >
            {selected && (
              <Ionicons name="checkmark" size={11} color={t.primaryFg} />
            )}
          </View>
        </View>

        {/* Text */}
        <Text style={[cardStyles.roleTag, { color: t.primary }]}>
          {subtitle}
        </Text>
        <Text style={[cardStyles.title, { color: t.text }]}>{title}</Text>
        <Text style={[cardStyles.desc, { color: t.textMuted }]}>
          {description}
        </Text>

        {/* Feature pills */}
        <View style={cardStyles.features}>
          {features.map((f) => (
            <View
              key={f}
              style={[
                cardStyles.featurePill,
                {
                  backgroundColor: selected ? t.primary + '14' : t.bgMuted,
                  borderColor: selected ? t.primary + '30' : t.border,
                },
              ]}
            >
              <Text
                style={[
                  cardStyles.featureText,
                  { color: selected ? t.primary : t.textMuted },
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
    borderWidth: 1.5,
    padding: spacing.xl,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
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
  roleTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  featurePill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
  },
})

function SpecialtyPicker({
  label,
  icon,
  count,
  emptyHint,
  onPress,
  selectedItems,
  theme: t,
}: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  count: number
  emptyHint: string
  onPress: () => void
  selectedItems: Array<TaxItem>
  theme: any
}) {
  const hasItems = count > 0
  return (
    <View style={pickerStyles.wrap}>
      {/* Section label */}
      <View style={pickerStyles.labelRow}>
        <Ionicons name={icon} size={13} color={t.textMuted} />
        <Text style={[pickerStyles.label, { color: t.textMuted }]}>
          {label}
        </Text>
        {hasItems && (
          <View style={[pickerStyles.badge, { backgroundColor: t.primary }]}>
            <Text style={[pickerStyles.badgeText, { color: t.primaryFg }]}>
              {count}
            </Text>
          </View>
        )}
      </View>

      {/* Trigger button */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pickerStyles.trigger,
          {
            backgroundColor: t.surface,
            borderColor: hasItems ? t.primary + '60' : t.border,
          },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text
          style={[
            pickerStyles.triggerText,
            { color: hasItems ? t.text : t.textSubtle },
          ]}
        >
          {hasItems ? `${count} selected` : emptyHint}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={t.textSubtle} />
      </Pressable>

      {/* Selected chips */}
      {selectedItems.length > 0 && (
        <View style={pickerStyles.chips}>
          {selectedItems.map((item) => (
            <View
              key={item.id}
              style={[
                pickerStyles.chip,
                {
                  backgroundColor: t.primary + '12',
                  borderColor: t.primary + '30',
                },
              ]}
            >
              <Text
                style={[pickerStyles.chipText, { color: t.primary }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const pickerStyles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  badge: {
    borderRadius: radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    gap: spacing.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})

// ─── Screen-level styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBarBrand: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
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

  // Specialties
  specialtiesWrap: { gap: spacing.xxl },
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
    paddingVertical: spacing.md,
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
    gap: 6,
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
  successRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCopy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
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
