import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Field } from '../components/Field'
import { submitSupportTicketFn } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface SupportScreenProps {
  onBack: () => void
}

interface FormErrors {
  category?: string
  subject?: string
  message?: string
}

const CATEGORIES = [
  { id: 'problem', label: 'Report a Problem', icon: 'bug-outline' as const },
  { id: 'request', label: 'Feature Request', icon: 'bulb-outline' as const },
  { id: 'support', label: 'Get Support', icon: 'headset-outline' as const },
  {
    id: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-circle-outline' as const,
  },
]

export function SupportScreen({ onBack }: SupportScreenProps) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const ctaScale = useRef(new Animated.Value(1)).current
  const shimmerX = useRef(new Animated.Value(-100)).current
  const successAnim = useRef(new Animated.Value(0)).current

  // Sweeping shimmer loop on CTA
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(shimmerX, {
          toValue: 500,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, { toValue: -100, duration: 0, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [shimmerX])

  // Success pop-in animation
  useEffect(() => {
    if (success) {
      Animated.spring(successAnim, {
        toValue: 1,
        stiffness: 180,
        damping: 14,
        useNativeDriver: true,
      }).start()
    }
  }, [success, successAnim])

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!category) next.category = 'Please select a category.'
    if (subject.trim().length < 3) next.subject = 'Subject must be at least 3 characters.'
    if (message.trim().length < 10) next.message = 'Message must be at least 10 characters.'
    return next
  }

  async function handleSubmit() {
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      const result = await submitSupportTicketFn({
        category,
        subject: subject.trim(),
        message: message.trim(),
      })
      if (!result.success) throw new Error(result.error || 'Failed to send message.')
      setSuccess(true)
    } catch (err: any) {
      setErrors({ message: err?.message || 'Failed to send. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCtaPressIn = useCallback(() => {
    if (submitting) return
    Animated.spring(ctaScale, {
      toValue: 0.97,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }, [ctaScale, submitting])

  const handleCtaPressOut = useCallback(() => {
    Animated.spring(ctaScale, {
      toValue: 1,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }, [ctaScale])

  // ── Success state ────────────────────────────────────────
  if (success) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <Animated.View
          style={[
            styles.successWrap,
            {
              opacity: successAnim,
              transform: [
                {
                  scale: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.successRing, { borderColor: t.success + '28' }]}>
            <View style={[styles.successIconWrap, { backgroundColor: t.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={58} color={t.success} />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: t.text }]}>Message Sent!</Text>
          <Text style={[styles.successDesc, { color: t.textMuted }]}>
            Our team will review your message and{'\n'}get back to you as soon as possible.
          </Text>

          <View
            style={[
              styles.successMeta,
              { backgroundColor: t.bgMuted, borderColor: t.border },
            ]}
          >
            <Ionicons name="time-outline" size={14} color={t.textSubtle} />
            <Text style={[styles.successMetaText, { color: t.textMuted }]}>
              Typical response: 1–2 business days
            </Text>
          </View>

          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.successBtn,
              { backgroundColor: t.primary, shadowColor: t.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="arrow-back-outline" size={18} color={t.primaryFg} />
            <Text style={[styles.successBtnText, { color: t.primaryFg }]}>
              Back to Profile
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    )
  }

  // ── Main form ────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Fixed header — above KAV so it never shifts */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: t.bg,
            borderBottomColor: t.border,
          },
        ]}
      >
        <Pressable
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.text }]}>Help & Support</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* KAV wraps ScrollView + sticky footer */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={[styles.heroIconWrap, { backgroundColor: t.primary + '12' }]}>
              <Ionicons name="headset-outline" size={30} color={t.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: t.text }]}>How can we help?</Text>
            <Text style={[styles.heroSubtitle, { color: t.textMuted }]}>
              Tell us what's going on and we'll get back to you shortly.
            </Text>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionLabel, { color: t.text }]}>Category</Text>
              {errors.category && (
                <Text style={[styles.fieldError, { color: t.danger }]}>
                  {errors.category}
                </Text>
              )}
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <CategoryCard
                  key={c.id}
                  label={c.label}
                  icon={c.icon}
                  selected={category === c.id}
                  onPress={() => {
                    setCategory(c.id)
                    setErrors((e) => ({ ...e, category: undefined }))
                  }}
                  accent={t.primary}
                  bg={t.bgMuted}
                  border={t.border}
                  text={t.text}
                  subtle={t.textSubtle}
                />
              ))}
            </View>
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Field
              label="Subject"
              value={subject}
              onChangeText={(v) => {
                setSubject(v)
                setErrors((e) => ({ ...e, subject: undefined }))
              }}
              placeholder="Brief title describing your issue"
              returnKeyType="next"
              maxLength={200}
              error={errors.subject}
              leftIcon={
                <Ionicons name="document-text-outline" size={18} color={t.textSubtle} />
              }
            />
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={[styles.fieldLabel, { color: t.textMuted }]}>Message</Text>
            <View
              style={[
                styles.textareaBox,
                {
                  backgroundColor: t.surface,
                  borderColor: errors.message ? t.danger : t.border,
                },
              ]}
            >
              <TextInput
                value={message}
                onChangeText={(v) => {
                  setMessage(v)
                  setErrors((e) => ({ ...e, message: undefined }))
                }}
                placeholder="Describe your issue in detail…"
                placeholderTextColor={t.textSubtle}
                multiline
                textAlignVertical="top"
                maxLength={5000}
                style={[styles.textarea, { color: t.text }]}
              />
            </View>
            <View style={styles.textareaFooter}>
              {errors.message ? (
                <Text style={[styles.fieldError, { color: t.danger }]}>
                  {errors.message}
                </Text>
              ) : (
                <View />
              )}
              <Text style={[styles.charCount, { color: t.textSubtle }]}>
                {message.length} / 5000
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* ── Sticky footer — outside ScrollView, inside KAV ── */}
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20 },
          ]}
        >
          <Animated.View style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}>
            <Pressable
              onPress={submitting ? undefined : handleSubmit}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Send support message"
              style={[
                styles.cta,
                { backgroundColor: t.primary, shadowColor: t.primary },
                submitting && { opacity: 0.65 },
              ]}
            >
              <View style={styles.ctaHighlight} />
              <Animated.View
                style={[styles.ctaShimmer, { transform: [{ translateX: shimmerX }] }]}
              />
              {submitting ? (
                <ActivityIndicator color={t.primaryFg} />
              ) : (
                <>
                  <Text style={[styles.ctaText, { color: t.primaryFg }]}>Send Message</Text>
                  <View style={[styles.ctaIconBubble, { backgroundColor: t.primaryFg + '20' }]}>
                    <Ionicons name="send-outline" size={16} color={t.primaryFg} />
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

// ── Category card with spring press ─────────────────────────
interface CategoryCardProps {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  selected: boolean
  onPress: () => void
  accent: string
  bg: string
  border: string
  text: string
  subtle: string
}

function CategoryCard({
  label,
  icon,
  selected,
  onPress,
  accent,
  bg,
  border,
  text,
  subtle,
}: CategoryCardProps) {
  const scale = useRef(new Animated.Value(1)).current

  function onPressIn() {
    Animated.spring(scale, {
      toValue: 0.96,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }

  function onPressOut() {
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View style={[catStyles.wrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        style={[
          catStyles.card,
          {
            backgroundColor: selected ? accent + '0D' : bg,
            borderColor: selected ? accent + '60' : border,
            borderLeftColor: selected ? accent : 'transparent',
          },
        ]}
      >
        <View
          style={[
            catStyles.iconWrap,
            { backgroundColor: selected ? accent + '18' : border + '50' },
          ]}
        >
          <Ionicons name={icon} size={17} color={selected ? accent : subtle} />
        </View>
        <Text
          style={[
            catStyles.label,
            {
              color: selected ? accent : text,
              fontWeight: selected ? '700' : '500',
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {selected && (
          <View style={[catStyles.check, { backgroundColor: accent }]}>
            <Ionicons name="checkmark" size={9} color="#fff" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

const catStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: '46%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
    flex: 1,
    textAlign: 'center',
  },

  // ── Scroll ───────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 20,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  // ── Hero ─────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // ── Sections ─────────────────────────────────────────────
  section: {
    marginBottom: spacing.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Category grid ────────────────────────────────────────
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // ── Field label (for textarea) ────────────────────────────
  fieldLabel: {
    ...typography.label,
    marginBottom: 6,
  },

  // ── Textarea ─────────────────────────────────────────────
  textareaBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  textarea: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  textareaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  charCount: {
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Sticky footer ────────────────────────────────────────
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaWrap: {
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 18,
    paddingVertical: 19,
    minHeight: 60,
    width: '100%',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 14,
  },
  ctaHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaShimmer: {
    position: 'absolute',
    top: -10,
    bottom: -10,
    left: 0,
    width: 56,
    backgroundColor: '#ffffff',
    opacity: 0.1,
    transform: [{ skewX: '-18deg' }],
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  ctaIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Success ──────────────────────────────────────────────
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  successRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 23,
    textAlign: 'center',
  },
  successMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  successMetaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  successBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
