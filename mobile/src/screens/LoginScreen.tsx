import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useIsRTL } from 'expo-rtl'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

import { ControlledField } from '../components/Field'
import {
  fetchSession,
  signInWithEmail,
  signUpWithEmail,
} from '../lib/api-client'
import { useUserStore } from '../lib/stores/user-store'
import { useTheme } from '../theme/use-theme'
import type { Theme } from '../theme/tokens'
import type { TextInput } from 'react-native'
import type { RootStackParamList } from '../navigation/types'

type Mode = 'sign-in' | 'sign-up'

function getSignInSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('auth.error.invalidEmail')),
    password: z.string().min(6, t('auth.error.shortPassword')),
  })
}

function getSignUpSchema(t: (key: string) => string) {
  return z
    .object({
      name: z
        .string()
        .min(2, t('auth.error.shortName'))
        .optional()
        .or(z.literal('')),
      email: z.string().email(t('auth.error.invalidEmail')),
      password: z.string().min(6, t('auth.error.shortPassword')),
      confirm: z.string().min(1, t('auth.error.confirmRequired')),
    })
    .refine((d) => !d.password || d.password === d.confirm, {
      message: t('auth.error.passwordMismatch'),
      path: ['confirm'],
    })
}

type SignInForm = z.infer<ReturnType<typeof getSignInSchema>>
type SignUpForm = z.infer<ReturnType<typeof getSignUpSchema>>

export function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const t = useTheme()
  const { t: tI18n, i18n } = useTranslation()
  const isRTL = useIsRTL()
  const styles = makeStyles(t)
  const insets = useSafeAreaInsets()

  const signInSchema = useMemo(() => getSignInSchema(tI18n), [i18n.language])
  const signUpSchema = useMemo(() => getSignUpSchema(tI18n), [i18n.language])
  const [mode, setMode] = useState<Mode>('sign-in')
  const setUser = useUserStore((s) => s.setUser)
  const setAuthState = useUserStore((s) => s.setAuthState)
  const [submitting, setSubmitting] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [tabWidth, setTabWidth] = useState(0)

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)
  const formAnim = useRef(new Animated.Value(1)).current
  const bannerAnim = useRef(new Animated.Value(0)).current
  const tabIndicatorLeft = useRef(new Animated.Value(0)).current
  const shimmerX = useRef(new Animated.Value(isRTL ? 100 : -100)).current

  const resolver = useMemo(
    () => zodResolver(mode === 'sign-in' ? signInSchema : signUpSchema),
    [mode],
  )
  const form = useForm<SignInForm | SignUpForm>({
    resolver,
    defaultValues: { email: '', password: '', name: '', confirm: '' },
  })

  useEffect(() => {
    form.clearErrors()
    setBannerError('')
    form.reset(
      mode === 'sign-in'
        ? { email: '', password: '' }
        : { name: '', email: '', password: '', confirm: '' },
    )
  }, [mode])

  useEffect(() => {
    if (bannerError) {
      Animated.spring(bannerAnim, {
        toValue: 1,
        stiffness: 200,
        damping: 15,
        useNativeDriver: true,
      }).start()
    } else {
      bannerAnim.setValue(0)
    }
  }, [bannerError, bannerAnim])

  useEffect(() => {
    const start = isRTL ? 100 : -100
    const end = isRTL ? -500 : 500
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(shimmerX, {
          toValue: end,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: start,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [shimmerX])

  async function handleSubmit(data: SignInForm | SignUpForm) {
    setSubmitting(true)
    setBannerError('')
    try {
      if (mode === 'sign-in') {
        const d = data as SignInForm
        await signInWithEmail(d.email.trim(), d.password)
      } else {
        const d = data as SignUpForm
        await signUpWithEmail(
          d.email.trim(),
          d.password,
          d.name?.trim() || undefined,
        )
      }
      const sessionUser = await fetchSession()
      if (sessionUser) {
        setUser(sessionUser)
        setAuthState('ready')
      } else {
        setAuthState('signed-out')
      }
    } catch (err) {
      const e = err as Error & { code?: string }
      setBannerError(
        mode === 'sign-in'
          ? mapSignInError(e, tI18n)
          : mapSignUpError(e, tI18n),
      )
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    if (next === mode) return
    // In RTL: sign-in is the right tab (left: tabWidth), sign-up is the left tab (left: 0)
    // In LTR: sign-in is the left tab (left: 0), sign-up is the right tab (left: tabWidth)
    const targetLeft =
      next === 'sign-in' ? (isRTL ? tabWidth : 0) : isRTL ? 0 : tabWidth

    Animated.spring(tabIndicatorLeft, {
      toValue: targetLeft,
      stiffness: 420,
      damping: 30,
      mass: 0.8,
      useNativeDriver: false,
    }).start()

    Animated.timing(formAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setMode(next)
      setBannerError('')
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start()
    })
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconArea}>
              <View style={styles.iconDiamond}>
                <Ionicons
                  name="infinite-outline"
                  size={28}
                  color={t.primaryFg}
                  style={{ transform: [{ rotate: '-45deg' }] }}
                />
              </View>
              <View
                style={[
                  styles.headerAccentDot,
                  isRTL ? { left: 14, right: undefined } : { right: 14 },
                ]}
              />
              <View
                style={[
                  styles.headerAccentRing,
                  isRTL ? { right: 10, left: undefined } : { left: 10 },
                ]}
              />
            </View>

            <Text style={styles.brandName}>mlila</Text>

            <View
              style={[
                styles.badge,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>{tI18n('splash.badge')}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHandle} />

            <View
              style={[
                styles.toggle,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
              onLayout={(e) => {
                const w = (e.nativeEvent.layout.width - 8) / 2
                setTabWidth(w)
                if (isRTL && mode === 'sign-in') {
                  tabIndicatorLeft.setValue(w)
                }
              }}
            >
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    width: tabWidth || '50%',
                    left: tabIndicatorLeft,
                  },
                ]}
              />

              {(['sign-in', 'sign-up'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => switchMode(m)}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    m === 'sign-in'
                      ? `${tI18n('auth.signIn')} tab`
                      : `${tI18n('auth.signUp')} tab`
                  }
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
                    {m === 'sign-in'
                      ? tI18n('auth.signIn')
                      : tI18n('auth.signUp')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.heading}>
              <Text
                style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}
              >
                {mode === 'sign-in'
                  ? tI18n('auth.signIn')
                  : tI18n('auth.createAccount')}
              </Text>
              <View
                style={[
                  styles.titleDivider,
                  { alignSelf: isRTL ? 'flex-end' : 'flex-start' },
                ]}
              />
              <Text
                style={[
                  styles.subtitle,
                  { textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {mode === 'sign-in'
                  ? tI18n('auth.signInSubtitle')
                  : tI18n('auth.createAccountSubtitle')}
              </Text>
            </View>

            {bannerError ? (
              <Animated.View
                accessibilityRole="alert"
                style={[
                  styles.banner,
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
                  style={[
                    styles.bannerAccent,
                    isRTL
                      ? {
                          right: 0,
                          left: undefined,
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                        }
                      : { left: 0 },
                  ]}
                />
                <Ionicons
                  name="alert-circle-outline"
                  size={17}
                  color={t.danger}
                  style={styles.bannerIcon}
                />
                <Text style={styles.bannerText}>{bannerError}</Text>
              </Animated.View>
            ) : null}

            <Animated.View style={[styles.form, { opacity: formAnim }]}>
              {mode === 'sign-up' ? (
                <ControlledField<SignUpForm>
                  control={form.control as any}
                  name="name"
                  label={`${tI18n('auth.name')} ${tI18n('common.optional')}`}
                  placeholder={tI18n('auth.name')}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  editable={!submitting}
                  leftIcon={
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={t.textSubtle}
                    />
                  }
                />
              ) : null}

              <ControlledField<SignInForm | SignUpForm>
                control={form.control as any}
                name="email"
                label={tI18n('auth.email')}
                placeholder={tI18n('auth.emailPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                editable={!submitting}
                leftIcon={
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={t.textSubtle}
                  />
                }
              />

              <ControlledField<SignInForm | SignUpForm>
                control={form.control as any}
                name="password"
                label={tI18n('auth.password')}
                placeholder={tI18n('auth.passwordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={
                  mode === 'sign-up' ? 'new-password' : 'current-password'
                }
                textContentType={
                  mode === 'sign-up' ? 'newPassword' : 'password'
                }
                returnKeyType={mode === 'sign-up' ? 'next' : 'go'}
                editable={!submitting}
                hint={
                  mode === 'sign-up'
                    ? tI18n('auth.error.shortPassword')
                    : undefined
                }
                leftIcon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={t.textSubtle}
                  />
                }
              />

              {mode === 'sign-up' ? (
                <ControlledField<SignUpForm>
                  control={form.control as any}
                  name="confirm"
                  label={tI18n('auth.confirmPassword')}
                  placeholder={tI18n('auth.passwordPlaceholder')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="go"
                  editable={!submitting}
                  leftIcon={
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={t.textSubtle}
                    />
                  }
                />
              ) : null}
            </Animated.View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20 },
          ]}
        >
          <Pressable
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={
              mode === 'sign-in'
                ? tI18n('auth.signIn')
                : tI18n('auth.createAccount')
            }
            onPress={submitting ? undefined : form.handleSubmit(handleSubmit)}
            style={({ pressed }) => [
              styles.cta,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
              submitting && { opacity: 0.65 },
              pressed && { opacity: 0.9 },
            ]}
          >
            <View style={styles.ctaHighlight} />

            <Animated.View
              style={[
                styles.ctaShimmer,
                isRTL ? { right: 0, left: undefined } : { left: 0 },
                { transform: [{ translateX: shimmerX }, { skewX: '-18deg' }] },
              ]}
            />

            {submitting ? (
              <ActivityIndicator color={t.primaryFg} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {mode === 'sign-in'
                    ? tI18n('auth.signIn')
                    : tI18n('auth.createAccount')}
                </Text>
                <View style={styles.ctaIconBubble}>
                  <Ionicons
                    name={
                      mode === 'sign-in'
                        ? 'log-in-outline'
                        : 'person-add-outline'
                    }
                    size={17}
                    color={t.primaryFg}
                  />
                </View>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

function mapSignInError(
  err: Error & { code?: string },
  translate: (key: string) => string,
): string {
  if (err.code === 'USER_NOT_FOUND') {
    return translate('auth.error.loginFailed')
  }
  if (err.code === 'INVALID_EMAIL_OR_PASSWORD') {
    return translate('auth.error.loginFailed')
  }
  return err.message || translate('auth.error.generic')
}

function mapSignUpError(
  err: Error & { code?: string },
  translate: (key: string) => string,
): string {
  if (err.code === 'USER_ALREADY_EXISTS') {
    return translate('auth.error.generic')
  }
  return err.message || translate('auth.error.generic')
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },
    kav: {
      flex: 1,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },

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
      backgroundColor: t.primary,
      shadowColor: t.primary,
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
      backgroundColor: t.success,
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
      borderColor: t.primary,
    },
    brandName: {
      fontSize: 38,
      fontWeight: '900',
      letterSpacing: -1.5,
      marginBottom: 12,
      color: t.text,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: t.primary,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.success,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.primaryFg,
    },

    card: {
      borderRadius: 28,
      paddingHorizontal: 24,
      paddingBottom: 28,
      backgroundColor: t.surface + 'F2',
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
      backgroundColor: t.border,
    },

    toggle: {
      flexDirection: 'row',
      borderRadius: 16,
      padding: 4,
      marginBottom: 28,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: t.primary + '10',
    },
    tabIndicator: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      borderRadius: 12,
      backgroundColor: t.primary,
      shadowColor: t.primary,
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

    heading: {
      marginBottom: 24,
    },
    title: {
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.8,
      marginBottom: 10,
      color: t.text,
    },
    titleDivider: {
      width: 40,
      height: 3.5,
      borderRadius: 2,
      marginBottom: 10,
      backgroundColor: t.primary,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      color: t.textMuted,
    },

    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      overflow: 'hidden',
      borderColor: t.danger + '40',
      backgroundColor: t.dangerBg,
    },
    bannerAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3.5,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      backgroundColor: t.danger,
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
      color: t.danger,
    },

    form: {
      gap: 16,
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
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
      backgroundColor: t.primary,
      shadowColor: t.primary,
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
      color: t.primaryFg,
    },
    ctaIconBubble: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primaryFg + '20',
    },
  })
}
