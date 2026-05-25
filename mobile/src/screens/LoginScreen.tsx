import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

import { Field } from '../components/Field'
import { signInWithEmail, signUpWithEmail } from '../lib/api-client'
import { useTheme } from '../theme/use-theme'
import type { TextInput } from 'react-native'

type Mode = 'sign-in' | 'sign-up'

interface LoginScreenProps {
  onSignedIn: () => void
}

interface FormErrors {
  email?: string
  password?: string
  name?: string
  confirm?: string
  banner?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginScreen({ onSignedIn }: LoginScreenProps) {
  const t = useTheme()
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [tabWidth, setTabWidth] = useState(0)

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)
  const formAnim = useRef(new Animated.Value(1)).current
  const bannerAnim = useRef(new Animated.Value(0)).current
  const ctaScale = useRef(new Animated.Value(1)).current
  // Sliding tab indicator — animates to 0 (sign-in) or tabWidth (register)
  const tabIndicatorX = useRef(new Animated.Value(0)).current
  // Sweeping shimmer on CTA — loops every ~3s
  const shimmerX = useRef(new Animated.Value(-100)).current

  // Banner slide-in
  useEffect(() => {
    if (errors.banner) {
      Animated.spring(bannerAnim, {
        toValue: 1,
        stiffness: 200,
        damping: 15,
        useNativeDriver: true,
      }).start()
    } else {
      bannerAnim.setValue(0)
    }
  }, [errors.banner, bannerAnim])

  // CTA shimmer loop
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

  function validate(): FormErrors {
    const next: FormErrors = {}
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email.'
    if (password.length < 6) next.password = 'At least 6 characters.'
    if (mode === 'sign-up') {
      if (name.trim().length > 0 && name.trim().length < 2) {
        next.name = 'Name must be at least 2 characters.'
      }
      if (confirm !== password) next.confirm = 'Passwords do not match.'
    }
    return next
  }

  async function handleSubmit() {
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signInWithEmail(email.trim(), password)
      } else {
        await signUpWithEmail(email.trim(), password, name.trim() || undefined)
      }
      onSignedIn()
    } catch (err) {
      const e = err as Error & { code?: string }
      const banner = mode === 'sign-in' ? mapSignInError(e) : mapSignUpError(e)
      setErrors({ banner })
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    if (next === mode) return

    // Slide the tab indicator
    Animated.spring(tabIndicatorX, {
      toValue: next === 'sign-in' ? 0 : tabWidth,
      stiffness: 420,
      damping: 30,
      mass: 0.8,
      useNativeDriver: true,
    }).start()

    // Fade + swap form fields
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setMode(next)
      setErrors({})
      setConfirm('')
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start()
    })
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

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Scrollable content ─────────────────────────── */}
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding header */}
          <View style={styles.header}>
            <View style={styles.iconArea}>
              <View
                style={[
                  styles.iconDiamond,
                  { backgroundColor: t.primary, shadowColor: t.primary },
                ]}
              >
                <Ionicons
                  name="infinite-outline"
                  size={28}
                  color={t.primaryFg}
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </View>
              <View style={[styles.headerAccentDot, { backgroundColor: t.success }]} />
              <View style={[styles.headerAccentRing, { borderColor: t.primary }]} />
            </View>

            <Text style={[styles.brandName, { color: t.text }]}>mlila</Text>

            <View style={[styles.badge, { backgroundColor: t.primary }]}>
              <View style={[styles.badgeDot, { backgroundColor: t.success }]} />
              <Text style={[styles.badgeText, { color: t.primaryFg }]}>
                First Reverse-Marketplace in Algeria
              </Text>
            </View>
          </View>

          {/* Form card */}
          <View style={[styles.card, { backgroundColor: t.surface + 'F2' }]}>
            <View style={[styles.cardHandle, { backgroundColor: t.border }]} />

            {/* ── Mode toggle with sliding indicator ─────── */}
            <View
              style={[styles.toggle, { backgroundColor: t.primary + '10' }]}
              onLayout={(e) => {
                const w = (e.nativeEvent.layout.width - 8) / 2
                setTabWidth(w)
              }}
            >
              {/* Sliding pill indicator */}
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    backgroundColor: t.primary,
                    width: tabWidth || '50%',
                    shadowColor: t.primary,
                    transform: [{ translateX: tabIndicatorX }],
                  },
                ]}
              />

              {/* Tab buttons */}
              {(['sign-in', 'sign-up'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => switchMode(m)}
                  accessibilityRole="tab"
                  accessibilityLabel={m === 'sign-in' ? 'Sign in tab' : 'Register tab'}
                  accessibilityState={{ selected: mode === m }}
                  style={({ pressed }) => [
                    styles.tab,
                    pressed && mode !== m && { opacity: 0.65 },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: mode === m ? t.primaryFg : t.textSubtle },
                    ]}
                  >
                    {m === 'sign-in' ? 'Sign In' : 'Register'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Heading */}
            <View style={styles.heading}>
              <Text style={[styles.title, { color: t.text }]}>
                {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
              </Text>
              <View style={[styles.titleDivider, { backgroundColor: t.primary }]} />
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                {mode === 'sign-in'
                  ? 'Sign in to continue your work.'
                  : 'Set up your account to start sourcing or selling parts.'}
              </Text>
            </View>

            {/* Error banner */}
            {errors.banner ? (
              <Animated.View
                accessibilityRole="alert"
                style={[
                  styles.banner,
                  { borderColor: t.danger + '40', backgroundColor: t.dangerBg },
                  {
                    opacity: bannerAnim,
                    transform: [
                      {
                        translateY: bannerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.bannerAccent, { backgroundColor: t.danger }]} />
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={t.danger}
                  style={styles.bannerIcon}
                />
                <Text style={[styles.bannerText, { color: t.danger }]}>{errors.banner}</Text>
              </Animated.View>
            ) : null}

            {/* Form fields */}
            <Animated.View style={[styles.form, { opacity: formAnim }]}>
              {mode === 'sign-up' ? (
                <Field
                  label="Name (optional)"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  editable={!submitting}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  error={errors.name}
                  leftIcon={
                    <Ionicons name="person-outline" size={18} color={t.textSubtle} />
                  }
                />
              ) : null}

              <Field
                ref={emailRef}
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                editable={!submitting}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={errors.email}
                leftIcon={
                  <Ionicons name="mail-outline" size={18} color={t.textSubtle} />
                }
              />

              <Field
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={mode === 'sign-up' ? 'password-new' : 'password'}
                textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
                returnKeyType={mode === 'sign-up' ? 'next' : 'go'}
                editable={!submitting}
                onSubmitEditing={() =>
                  mode === 'sign-up' ? confirmRef.current?.focus() : handleSubmit()
                }
                error={errors.password}
                hint={mode === 'sign-up' ? 'At least 6 characters.' : undefined}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={18} color={t.textSubtle} />
                }
              />

              {mode === 'sign-up' ? (
                <Field
                  ref={confirmRef}
                  label="Confirm password"
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="••••••••"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  textContentType="newPassword"
                  returnKeyType="go"
                  editable={!submitting}
                  onSubmitEditing={handleSubmit}
                  error={errors.confirm}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={18} color={t.textSubtle} />
                  }
                />
              ) : null}
            </Animated.View>
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
              accessibilityLabel={mode === 'sign-in' ? 'Sign in' : 'Create account'}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: t.primary, shadowColor: t.primary },
                submitting && { opacity: 0.65 },
                pressed && { opacity: 0.9 },
              ]}
            >
              {/* Top edge highlight for depth */}
              <View style={styles.ctaHighlight} />

              {/* Sweeping shimmer */}
              <Animated.View
                style={[
                  styles.ctaShimmer,
                  { transform: [{ translateX: shimmerX }] },
                ]}
              />

              {submitting ? (
                <ActivityIndicator color={t.primaryFg} />
              ) : (
                <>
                  <Text style={[styles.ctaText, { color: t.primaryFg }]}>
                    {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </Text>
                  <View style={[styles.ctaIconBubble, { backgroundColor: t.primaryFg + '20' }]}>
                    <Ionicons
                      name={mode === 'sign-in' ? 'log-in-outline' : 'person-add-outline'}
                      size={17}
                      color={t.primaryFg}
                    />
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

function mapSignInError(err: Error & { code?: string }): string {
  if (err.code === 'USER_NOT_FOUND') {
    return 'No account with that email. Switch to "Register" to create one.'
  }
  if (err.code === 'INVALID_EMAIL_OR_PASSWORD') {
    return 'Email or password is incorrect.'
  }
  return err.message || 'Sign-in failed.'
}

function mapSignUpError(err: Error & { code?: string }): string {
  if (err.code === 'USER_ALREADY_EXISTS') {
    return 'An account with that email already exists. Switch to "Sign In".'
  }
  return err.message || 'Could not create account.'
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 16,
  },
  iconArea: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconDiamond: {
    width: 80,
    height: 80,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 14,
  },
  headerAccentDot: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  headerAccentRing: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
  },
  brandName: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Card ─────────────────────────────────────────────────
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 14,
    marginBottom: 28,
  },

  // ── Sliding toggle ───────────────────────────────────────
  toggle: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // ── Heading ──────────────────────────────────────────────
  heading: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  titleDivider: {
    width: 40,
    height: 3.5,
    borderRadius: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },

  // ── Error banner ─────────────────────────────────────────
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  bannerIcon: {
    marginRight: 10,
    marginLeft: 6,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
  },

  // ── Form ─────────────────────────────────────────────────
  form: {
    gap: 16,
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
})
