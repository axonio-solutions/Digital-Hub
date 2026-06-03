import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native'
import { ScrollView, Text, TextInput, View, useIsRTL } from 'expo-rtl'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { ControlledField } from '../components/Field'
import { submitSupportTicketFn } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { Theme } from '../theme/tokens'

interface HelpScreenProps {
  onBack?: () => void
}

const CATEGORIES: Array<{
  id: string
  labelKey: string
  icon: keyof typeof Ionicons.glyphMap
}> = [
  {
    id: 'problem',
    labelKey: 'help.categories.reportProblem',
    icon: 'bug-outline' as const,
  },
  {
    id: 'request',
    labelKey: 'help.categories.featureRequest',
    icon: 'bulb-outline' as const,
  },
  {
    id: 'support',
    labelKey: 'help.categories.getSupport',
    icon: 'headset-outline' as const,
  },
  {
    id: 'other',
    labelKey: 'help.categories.other',
    icon: 'ellipsis-horizontal-circle-outline' as const,
  },
]

function getSupportSchema(t: (key: string) => string) {
  return z.object({
    category: z.string().min(1, t('help.errors.selectCategory')),
    subject: z.string().min(3, t('help.errors.subjectMinLength')),
    message: z.string().min(10, t('help.errors.messageMinLength')),
  })
}

type SupportForm = z.infer<ReturnType<typeof getSupportSchema>>

function makeCatStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      minWidth: '46%',
    },
    card: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 13,
      borderRadius: radius.lg,
      borderWidth: 1,
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
      backgroundColor: t.primary,
    },
  })
}

function makeStyles(t: Theme, isRTL: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },
    flex: {
      flex: 1,
    },

    header: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: t.bg,
      borderBottomColor: t.border,
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
      color: t.text,
    },

    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },

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
      color: t.text,
    },
    heroSubtitle: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 21,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      color: t.textMuted,
    },

    section: {
      marginBottom: spacing.xl,
    },
    sectionHead: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
      color: t.text,
    },
    fieldError: {
      fontSize: 12,
      fontWeight: '500',
    },

    categoryGrid: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },

    fieldLabel: {
      ...typography.label,
      marginBottom: 6,
      color: t.textMuted,
    },

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
      color: t.text,
    },
    textareaFooter: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    charCount: {
      fontSize: 11,
      fontWeight: '500',
      color: t.textSubtle,
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    ctaWrap: {
      width: '100%',
    },
    cta: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      backgroundColor: t.primary,
      shadowColor: t.primary,
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
    },

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
      color: t.text,
    },
    successDesc: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 23,
      textAlign: 'center',
      color: t.textMuted,
    },
    successMeta: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      marginTop: spacing.sm,
      backgroundColor: t.bgMuted,
      borderColor: t.border,
    },
    successMetaText: {
      fontSize: 13,
      fontWeight: '500',
      color: t.textMuted,
    },
    successBtn: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
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
      backgroundColor: t.primary,
      shadowColor: t.primary,
    },
    successBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: t.primaryFg,
    },
  })
}

export function HelpScreen({ onBack }: HelpScreenProps) {
  const navigation = useNavigation()
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const catStyles = makeCatStyles(t, isRTL)
  const styles = makeStyles(t, isRTL)
  const insets = useSafeAreaInsets()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const ctaScale = useRef(new Animated.Value(1)).current
  const shimmerX = useRef(new Animated.Value(-100)).current
  const successAnim = useRef(new Animated.Value(0)).current

  const supportSchema = useMemo(() => getSupportSchema(i18n), [i18n])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: { category: '', subject: '', message: '' },
  })

  const messageValue = watch('message')

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(shimmerX, {
          toValue: 500,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [shimmerX])

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

  async function onSubmit(data: SupportForm) {
    setSubmitting(true)
    try {
      const result = await submitSupportTicketFn({
        category: data.category,
        subject: data.subject.trim(),
        message: data.message.trim(),
      })
      if (!result.success) throw new Error(result.error || i18n('help.error'))
      setSuccess(true)
    } catch (err: any) {
      setError('message', { message: err?.message || i18n('help.error') })
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

  if (success) {
    return (
      <View style={styles.root}>
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
            <View
              style={[
                styles.successIconWrap,
                { backgroundColor: t.success + '15' },
              ]}
            >
              <Ionicons name="checkmark-circle" size={58} color={t.success} />
            </View>
          </View>

          <Text style={styles.successTitle}>{i18n('help.success')}</Text>
          <Text style={styles.successDesc}>{i18n('help.responseMessage')}</Text>

          <View style={styles.successMeta}>
            <Ionicons name="time-outline" size={14} color={t.textSubtle} />
            <Text style={styles.successMetaText}>
              {i18n('help.typicalResponse')}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              onBack?.() ?? navigation.goBack()
            }}
            style={({ pressed }) => [
              styles.successBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="arrow-back-outline" size={18} color={t.primaryFg} />
            <Text style={styles.successBtnText}>{i18n('common.back')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => {
            onBack?.() ?? navigation.goBack()
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={i18n('help.goBack')}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n('help.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View
              style={[
                styles.heroIconWrap,
                { backgroundColor: t.primary + '12' },
              ]}
            >
              <Ionicons name="headset-outline" size={30} color={t.primary} />
            </View>
            <Text style={styles.heroTitle}>{i18n('help.title')}</Text>
            <Text style={styles.heroSubtitle}>{i18n('help.heroSubtitle')}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionLabel}>{i18n('help.category')}</Text>
              {errors.category && (
                <Text style={[styles.fieldError, { color: t.danger }]}>
                  {errors.category.message}
                </Text>
              )}
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <CategoryCard
                  key={c.id}
                  label={i18n(c.labelKey)}
                  icon={c.icon}
                  selected={watch('category') === c.id}
                  onPress={() =>
                    setValue('category', c.id, { shouldValidate: true })
                  }
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ControlledField<SupportForm>
              control={control}
              name="subject"
              label={i18n('help.subject')}
              placeholder={i18n('help.subject')}
              returnKeyType="next"
              maxLength={200}
              leftIcon={
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={t.textSubtle}
                />
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>{i18n('help.message')}</Text>
            <Controller
              control={control}
              name="message"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
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
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder={i18n('help.message')}
                      placeholderTextColor={t.textSubtle}
                      multiline
                      textAlignVertical="top"
                      maxLength={5000}
                      style={styles.textarea}
                    />
                  </View>
                  <View style={styles.textareaFooter}>
                    {errors.message ? (
                      <Text style={[styles.fieldError, { color: t.danger }]}>
                        {errors.message.message}
                      </Text>
                    ) : (
                      <View />
                    )}
                    <Text style={styles.charCount}>
                      {messageValue.length} / 5000
                    </Text>
                  </View>
                </>
              )}
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20 },
          ]}
        >
          <Animated.View
            style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}
          >
            <Pressable
              onPress={submitting ? undefined : handleSubmit(onSubmit)}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={i18n('help.sendMessage')}
              style={[styles.cta, submitting && { opacity: 0.65 }]}
            >
              <View style={styles.ctaHighlight} />
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
                  <Text style={styles.ctaText}>{i18n('help.submit')}</Text>
                  <View
                    style={[
                      styles.ctaIconBubble,
                      { backgroundColor: t.primaryFg + '20' },
                    ]}
                  >
                    <Ionicons
                      name="send-outline"
                      size={16}
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

interface CategoryCardProps {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  selected: boolean
  onPress: () => void
}

function CategoryCard({ label, icon, selected, onPress }: CategoryCardProps) {
  const t = useTheme()
  const isRTL = useIsRTL()
  const catStyles = makeCatStyles(t, isRTL)
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
            backgroundColor: selected ? t.primary + '0D' : t.bgMuted,
            borderColor: selected ? t.primary + '60' : t.border,
            borderLeftColor: selected ? t.primary : 'transparent',
          },
        ]}
      >
        <View
          style={[
            catStyles.iconWrap,
            { backgroundColor: selected ? t.primary + '18' : t.border + '50' },
          ]}
        >
          <Ionicons
            name={icon}
            size={17}
            color={selected ? t.primary : t.textSubtle}
          />
        </View>
        <Text
          style={[
            catStyles.label,
            {
              color: selected ? t.primary : t.text,
              fontWeight: selected ? '700' : '500',
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {selected && (
          <View style={catStyles.check}>
            <Ionicons name="checkmark" size={9} color="#fff" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}
