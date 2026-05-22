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
import Ionicons from '@expo/vector-icons/Ionicons'

import { Field } from '../components/Field'
import { signInWithEmail, signUpWithEmail } from '../lib/api-client'
import { spacing } from '../theme/tokens'
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
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)
  const formAnim = useRef(new Animated.Value(1)).current
  const bannerAnim = useRef(new Animated.Value(0)).current
  const ctaScale = useRef(new Animated.Value(1)).current

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

  const topInset =
    Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ?? 28) + 12

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topInset }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
              <View
                style={[styles.headerAccentDot, { backgroundColor: t.success }]}
              />
              <View
                style={[styles.headerAccentRing, { borderColor: t.primary }]}
              />
            </View>

            <Text style={[styles.brandName, { color: t.text }]}>mlila</Text>

            <View style={[styles.badge, { backgroundColor: t.primary }]}>
              <View style={[styles.badgeDot, { backgroundColor: t.success }]} />
              <Text style={[styles.badgeText, { color: t.primaryFg }]}>
                First Reverse-Marketplace in Algeria
              </Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: t.surface + 'F2' }]}>
            <View style={[styles.cardHandle, { backgroundColor: t.border }]} />

            <View
              style={[styles.toggle, { backgroundColor: t.primary + '12' }]}
            >
              {(['sign-in', 'sign-up'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => switchMode(m)}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    m === 'sign-in' ? 'Sign in tab' : 'Register tab'
                  }
                  accessibilityState={{ selected: mode === m }}
                  style={({ pressed }) => [
                    styles.tab,
                    mode === m && [
                      styles.tabActive,
                      { backgroundColor: t.primary },
                    ],
                    pressed && mode !== m && { opacity: 0.6 },
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

            <View style={styles.heading}>
              <Text style={[styles.title, { color: t.text }]}>
                {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
              </Text>
              <View
                style={[styles.titleDivider, { backgroundColor: t.primary }]}
              />
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                {mode === 'sign-in'
                  ? 'Sign in to continue your work.'
                  : 'Set up your account to start sourcing or selling parts.'}
              </Text>
            </View>

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
                <View
                  style={[styles.bannerAccent, { backgroundColor: t.danger }]}
                />
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={t.danger}
                  style={styles.bannerIcon}
                />
                <Text style={[styles.bannerText, { color: t.danger }]}>
                  {errors.banner}
                </Text>
              </Animated.View>
            ) : null}

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
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={t.textSubtle}
                    />
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
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={t.textSubtle}
                  />
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
                textContentType={
                  mode === 'sign-up' ? 'newPassword' : 'password'
                }
                returnKeyType={mode === 'sign-up' ? 'next' : 'go'}
                editable={!submitting}
                onSubmitEditing={() =>
                  mode === 'sign-up'
                    ? confirmRef.current?.focus()
                    : handleSubmit()
                }
                error={errors.password}
                hint={mode === 'sign-up' ? 'At least 6 characters.' : undefined}
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={t.textSubtle}
                  />
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
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={t.textSubtle}
                    />
                  }
                />
              ) : null}

              <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
                <Pressable
                  onPress={submitting ? undefined : handleSubmit}
                  onPressIn={handleCtaPressIn}
                  onPressOut={handleCtaPressOut}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel={
                    mode === 'sign-in' ? 'Sign in' : 'Create account'
                  }
                  style={({ pressed }) => [
                    styles.cta,
                    { backgroundColor: t.primary, shadowColor: t.primary },
                    submitting && { opacity: 0.65 },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <View
                    style={[
                      styles.ctaShimmer,
                      { backgroundColor: t.primaryFg },
                    ]}
                  />
                  {submitting ? (
                    <ActivityIndicator color={t.primaryFg} />
                  ) : (
                    <>
                      <Text style={[styles.ctaText, { color: t.primaryFg }]}>
                        {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                      </Text>
                      <View
                        style={[
                          styles.ctaIconBubble,
                          { backgroundColor: t.primaryFg + '22' },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward-outline"
                          size={17}
                          color={t.primaryFg}
                        />
                      </View>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>
        </ScrollView>
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
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 20,
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

  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: -4 },
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

  toggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabActive: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

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

  form: {
    gap: 16,
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
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaShimmer: {
    position: 'absolute',
    left: '35%',
    top: -10,
    bottom: -10,
    width: 28,
    opacity: 0.07,
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

  legal: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
})
