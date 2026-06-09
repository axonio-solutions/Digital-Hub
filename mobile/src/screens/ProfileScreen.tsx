import Ionicons from '@expo/vector-icons/Ionicons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Modal, Pressable, StyleSheet } from 'react-native'
import { ScrollView, Text, View, useIsRTL } from 'expo-rtl'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@tanstack/react-query'
import { AnimatedPressable } from '../components/AnimatedPressable'
import { radius, spacing, typography, type Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { useUserStore } from '../lib/stores/user-store'
import { creditBalanceQueryOptions } from '../features/seller/queries/dashboard'
import type { BuyerProfileStackParamList } from '../navigation/types'
import { changeLanguage } from '../i18n'


interface ProfileKpiData {
  pipelineValue: number
  revenue: number
  winRate: number
}

interface ProfileScreenProps {
  kpiData?: ProfileKpiData
}

const STATUS_META: Record<string, { dot: string; bg: string; label: string }> =
  {
    active: { dot: '#059669', bg: '#05966915', label: 'Active' },
    new: { dot: '#2563eb', bg: '#2563eb15', label: 'New' },
    waitlisted: { dot: '#d97706', bg: '#d9770615', label: 'Waitlisted' },
  }

const C = {
  green: '#059669',
  amber: '#d97706',
  blue: '#2563eb',
  red: '#dc2626',
  credits: '#2563eb',
}

function getStatusMeta(
  status: string | null | undefined,
  t: (key: string) => string,
) {
  const fallbackKey = status || 'active'
  const meta = STATUS_META[status ?? '']
  if (meta) {
    return { ...meta, label: t('profile.status.' + status) }
  }
  return {
    dot: C.green,
    bg: C.green + '15',
    label: t('profile.status.' + fallbackKey),
  }
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function ProfileScreen({ kpiData }: ProfileScreenProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<BuyerProfileStackParamList>>()
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  const setUser = useUserStore((s) => s.setUser)
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const isRTL = useIsRTL()
  const styles = makeStyles(t)
  const sheetStyles = makeSheetStyles(t)
  const insets = useSafeAreaInsets()
  const { data: creditsData } = useQuery(creditBalanceQueryOptions)
  const creditBalance = creditsData?.balance ?? 0
  const [showLogOutSheet, setShowLogOutSheet] = useState(false)
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [imgError, setImgError] = useState(false)
  const chevron = isRTL ? 'chevron-back' : 'chevron-forward'
  // Animation refs — must be declared before early return
  const sheetY = useRef(new Animated.Value(320)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const openLogOutSheet = useCallback(() => {
    setShowLogOutSheet(true)
    Animated.parallel([
      Animated.spring(sheetY, {
        toValue: 0,
        stiffness: 380,
        damping: 30,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }, [sheetY, backdropOpacity])

  const closeLogOutSheet = useCallback(
    (confirm: boolean) => {
      Animated.parallel([
        Animated.timing(sheetY, {
          toValue: 320,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        sheetY.setValue(320)
        backdropOpacity.setValue(0)
        setShowLogOutSheet(false)
        if (confirm) logout()
      })
    },
    [sheetY, backdropOpacity, logout],
  )

  const hasStats = !!kpiData
  const cardCount = hasStats ? 4 : 3

  const cardOpacity = useRef(
    Array.from({ length: cardCount }, () => new Animated.Value(0)),
  ).current
  const cardSlide = useRef(
    Array.from({ length: cardCount }, () => new Animated.Value(24)),
  ).current
  const avatarScale = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    const anims = cardOpacity.map((o, i) =>
      Animated.parallel([
        Animated.spring(o, {
          toValue: 1,
          friction: 9,
          tension: 70,
          delay: i * 80,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide[i], {
          toValue: 0,
          friction: 9,
          tension: 70,
          delay: i * 80,
          useNativeDriver: true,
        }),
      ]),
    )
    Animated.stagger(0, anims).start()
    Animated.spring(avatarScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start()
  }, [])

  const prevAvatarUrlRef = useRef<string | null>(null)

  if (!user) return null

  const statusMeta = getStatusMeta(user.account_status, i18n)
  const avatarUrl = user.image || null
  const initial = (user.name || user.email || 'U')[0].toUpperCase()

  if (prevAvatarUrlRef.current !== avatarUrl) {
    prevAvatarUrlRef.current = avatarUrl
    if (imgError) setImgError(false)
  }

  function handleLogOut() {
    openLogOutSheet()
  }

  function Card({
    index,
    children,
  }: {
    index: number
    children: React.ReactNode
  }) {
    return (
      <Animated.View
        style={{
          opacity: cardOpacity[index],
          transform: [{ translateY: cardSlide[index] }],
        }}
      >
        {children}
      </Animated.View>
    )
  }

  const infoRows: Array<{
    icon: string
    label: string
    value: string | null | undefined
  }> = [
    {
      icon: 'mail-outline',
      label: i18n('editProfile.email'),
      value: user.email,
    },
    {
      icon: 'call-outline',
      label: i18n('editProfile.phone'),
      value: user.phoneNumber,
    },
    {
      icon: 'logo-whatsapp',
      label: i18n('editProfile.whatsapp'),
      value: user.whatsappNumber,
    },
    {
      icon: 'location-outline',
      label: i18n('editProfile.wilaya'),
      value: user.wilaya,
    },
    {
      icon: 'storefront-outline',
      label: i18n('editProfile.name'),
      value: user.storeName,
    },
  ].filter((r) => r.value)

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <Card index={0}>
          <View style={styles.headerCard}>
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <View style={styles.avatarWrap}>
                {avatarUrl && !imgError ? (
                  <Image
                    key={avatarUrl}
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>{initial}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusMeta.dot },
                    isRTL ? { left: 2 } : { right: 2 },
                  ]}
                />
              </View>
            </Animated.View>

            <Text style={styles.name}>
              {user.name || i18n('profile.title')}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user.role === 'buyer'
                    ? i18n('onboarding.role.buyer')
                    : user.role === 'seller'
                      ? i18n('onboarding.role.seller')
                      : user.role || i18n('profile.title')}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusMeta.bg,
                    borderColor: statusMeta.dot + '30',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: statusMeta.dot },
                  ]}
                />
                <Text style={[styles.statusText, { color: statusMeta.dot }]}>
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            {user.role === 'seller' && creditBalance >= 0 && (
              <Pressable
                onPress={() => (navigation as any).navigate('Credits')}
                style={({ pressed }) => [
                  styles.creditBadge,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="wallet-outline" size={14} color={C.credits} />
                <Text style={[styles.creditText, { color: C.credits }]}>
                  {creditBalance} {i18n('credits.title')}
                </Text>
                <Ionicons name={chevron} size={14} color={C.credits} />
              </Pressable>
            )}

          </View>
        </Card>

        {/* Stats Card */}
        {hasStats && (
          <Card index={1}>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statTile}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: C.blue + '12' },
                    ]}
                  >
                    <Ionicons
                      name="trending-up-outline"
                      size={16}
                      color={C.blue}
                    />
                  </View>
                  <Text style={styles.statValue}>
                    DA {formatCurrency(kpiData.pipelineValue)}
                  </Text>
                  <Text style={styles.statLabel}>
                    {i18n('profile.pipelineValue')}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statTile}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: C.green + '12' },
                    ]}
                  >
                    <Ionicons name="wallet-outline" size={16} color={C.green} />
                  </View>
                  <Text style={styles.statValue}>
                    DA {formatCurrency(kpiData.revenue)}
                  </Text>
                  <Text style={styles.statLabel}>
                    {i18n('profile.revenue')}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statTile}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: C.amber + '12' },
                    ]}
                  >
                    <Ionicons name="trophy-outline" size={16} color={C.amber} />
                  </View>
                  <Text style={styles.statValue}>{kpiData.winRate}%</Text>
                  <Text style={styles.statLabel}>
                    {i18n('profile.winRate')}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Personal Info Card */}
        <Card index={hasStats ? 2 : 1}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={14} color={t.textSubtle} />
              <Text style={styles.sectionTitle}>
                {i18n('editProfile.name')}
              </Text>
            </View>
            {infoRows.map((row, i) => (
              <View
                key={row.icon}
                style={[
                  styles.infoRow,
                  i < infoRows.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: t.border + '50',
                  },
                ]}
              >
                <View style={styles.infoIcon}>
                  <Ionicons
                    name={row.icon as any}
                    size={16}
                    color={t.textMuted}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <Text style={styles.infoValue}>{row.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Account Card */}
        <Card index={hasStats ? 3 : 2}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="settings-outline"
                size={14}
                color={t.textSubtle}
              />
              <Text style={styles.sectionTitle}>
                {i18n('profile.myAccount')}
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="create-outline" size={16} color={t.accentFg} />
              <Text style={styles.primaryBtnText}>
                {i18n('profile.editProfile')}
              </Text>
            </Pressable>

            {user.role === 'seller' && (
              <>
            <Pressable
              onPress={() => (navigation as any).navigate('Credits')}
              style={({ pressed }) => [
                styles.menuRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={16}
                  color={t.textMuted}
                />
              </View>
              <Text style={styles.menuLabel}>
                {i18n('profile.billing')}
              </Text>
              <Ionicons name={chevron} size={16} color={t.textSubtle} />
            </Pressable>
            <View style={styles.menuDivider} />
              </>
            )}

            <Pressable
              onPress={() => navigation.navigate('Help')}
              style={({ pressed }) => [
                styles.menuRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="help-buoy-outline"
                  size={16}
                  color={t.textMuted}
                />
              </View>
              <Text style={styles.menuLabel}>{i18n('profile.help')}</Text>
              <Ionicons name={chevron} size={16} color={t.textSubtle} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              onPress={() => setShowLangSheet(true)}
              style={({ pressed }) => [
                styles.menuRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="language-outline"
                  size={16}
                  color={t.textMuted}
                />
              </View>
              <Text style={styles.menuLabel}>
                {i18n('splash.changeLanguage')}
              </Text>
              <Ionicons name={chevron} size={16} color={t.textSubtle} />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              onPress={handleLogOut}
              style={({ pressed }) => [
                styles.menuRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[styles.menuIcon, { backgroundColor: C.red + '10' }]}
              >
                <Ionicons name="log-out-outline" size={16} color={C.red} style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
              </View>
              <Text style={[styles.menuLabel, { color: C.red }]}>
                {i18n('profile.logOut')}
              </Text>
              <Ionicons name={chevron} size={16} color={t.textSubtle} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>

      {/* ── Language selection sheet ──────────────────── */}
      <Modal
        transparent
        visible={showLangSheet}
        animationType="none"
        onRequestClose={() => setShowLangSheet(false)}
        statusBarTranslucent
      >
        <View style={sheetStyles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowLangSheet(false)}
          />
          <Animated.View
            style={[
              sheetStyles.sheet,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24 },
            ]}
          >
            <View style={sheetStyles.handle} />
            <Text style={sheetStyles.title}>
              {i18n('splash.changeLanguage')}
            </Text>
            {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'fr', label: 'Français', flag: '🇫🇷' },
              { code: 'ar', label: 'العربية', flag: '🇩🇿' },
            ].map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  changeLanguage(lang.code)
                  setShowLangSheet(false)
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={{
                    fontSize: 22,
                    marginRight: isRTL ? 0 : 12,
                    marginLeft: isRTL ? 12 : 0,
                  }}
                >
                  {lang.flag}
                </Text>
                <Text style={styles.menuLabel}>{lang.label}</Text>
                <Ionicons
                  name="checkmark-outline"
                  size={18}
                  color={t.primary}
                />
              </Pressable>
            ))}
          </Animated.View>
        </View>
      </Modal>

      {/* ── Log-out confirmation sheet ──────────────────── */}
      <Modal
        transparent
        visible={showLogOutSheet}
        animationType="none"
        onRequestClose={() => closeLogOutSheet(false)}
        statusBarTranslucent
      >
        <View style={sheetStyles.overlay}>
          {/* Tapable backdrop */}
          <Animated.View
            style={[sheetStyles.backdrop, { opacity: backdropOpacity }]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeLogOutSheet(false)}
          />

          {/* Sheet */}
          <Animated.View
            style={[
              sheetStyles.sheet,
              {
                paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24,
                transform: [{ translateY: sheetY }],
              },
            ]}
          >
            {/* Handle */}
            <View style={sheetStyles.handle} />

            {/* Icon */}
            <View style={[sheetStyles.iconRing, { borderColor: C.red + '28' }]}>
              <View
                style={[
                  sheetStyles.iconWrap,
                  { backgroundColor: C.red + '12' },
                ]}
              >
                <Ionicons name="log-out-outline" size={30} color={C.red} style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
              </View>
            </View>

            {/* Copy */}
            <Text style={sheetStyles.title}>{i18n('profile.logOut')}?</Text>
            <Text style={sheetStyles.subtitle}>
              {i18n('profile.myAccount')}
            </Text>

            {/* Buttons */}
            <View style={sheetStyles.buttons}>
              <Pressable
                onPress={() => closeLogOutSheet(false)}
                style={({ pressed }) => [
                  sheetStyles.btnCancel,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={sheetStyles.btnCancelText}>
                  {i18n('common.cancel')}
                </Text>
              </Pressable>

              <AnimatedPressable
                onPress={() => closeLogOutSheet(true)}
                scaleTo={0.96}
                containerStyle={sheetStyles.btnConfirmWrap}
                style={[sheetStyles.btnConfirm, { backgroundColor: C.red }]}
              >
                <View style={sheetStyles.ctaHighlight} />
                <Ionicons name="log-out-outline" size={17} color="#fff" style={isRTL ? { transform: [{ rotate: '180deg' }] } : undefined} />
                <Text style={sheetStyles.btnConfirmText}>
                  {i18n('profile.logOut')}
                </Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  )
}

const AVATAR_SIZE = 96

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.bg,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: spacing.xxl + spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.lg,
    },

    /* Header Card */
    headerCard: {
      alignItems: 'center',
      padding: spacing.xl,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: t.surface,
      borderColor: t.border,
    },
    avatarWrap: {
      position: 'relative',
      marginBottom: spacing.md,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent + '15',
    },
    avatarInitial: {
      fontSize: 36,
      fontWeight: '700',
      color: t.accent,
    },
    statusDot: {
      position: 'absolute',
      bottom: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2.5,
      borderColor: t.surface,
    },
    name: {
      ...typography.display,
      fontSize: 24,
      marginBottom: spacing.sm,
      color: t.text,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    roleBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: radius.pill,
      backgroundColor: t.accent + '12',
    },
    roleText: {
      fontSize: 13,
      fontWeight: '700',
      color: t.accent,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    statusDotSmall: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
    },
    creditBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: 6,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.pill,
      borderWidth: 1,
      minHeight: 36,
    },
    creditText: {
      fontSize: 13,
      fontWeight: '700',
    },

    /* Stats Card */
    statsCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: spacing.lg,
      backgroundColor: t.surface,
      borderColor: t.border,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statTile: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: t.text,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      color: t.textMuted,
    },
    statDivider: {
      width: 1,
      height: 40,
      opacity: 0.3,
      backgroundColor: t.border,
    },

    /* Section Card */
    sectionCard: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: t.surface,
      borderColor: t.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: t.textMuted,
    },

    /* Info Rows */
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: 14,
      minHeight: 52,
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bgMuted,
    },
    infoContent: {
      flex: 1,
      gap: 2,
    },
    infoLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      color: t.textSubtle,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '600',
      color: t.text,
    },

    /* Account Actions */
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: 12,
      paddingVertical: 14,
      minHeight: 48,
      backgroundColor: t.accent,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: t.accentFg,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: 16,
      minHeight: 52,
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.bgMuted,
    },
    menuLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: t.text,
    },
    menuDivider: {
      height: 1,
      opacity: 0.2,
      marginHorizontal: spacing.lg,
      backgroundColor: t.border,
    },
  })
}

// ── Log-out sheet styles ─────────────────────────────────────
function makeSheetStyles(t: Theme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.52)',
    },
    sheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 12,
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 16,
      backgroundColor: t.surface,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      marginBottom: 12,
      backgroundColor: t.border,
    },
    iconRing: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    iconWrap: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'center',
      color: t.text,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 21,
      textAlign: 'center',
      paddingHorizontal: 12,
      marginBottom: 8,
      color: t.textMuted,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginTop: 4,
    },
    btnCancel: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: t.border,
      backgroundColor: t.bgMuted,
    },
    btnCancelText: {
      fontSize: 16,
      fontWeight: '700',
      color: t.text,
    },
    btnConfirmWrap: {
      flex: 1,
    },
    btnConfirm: {
      height: 56,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      overflow: 'hidden',
      shadowColor: C.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.38,
      shadowRadius: 14,
      elevation: 10,
    },
    ctaHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    btnConfirmText: {
      fontSize: 16,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: -0.2,
    },
  })
}
