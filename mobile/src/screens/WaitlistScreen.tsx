import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useTranslation } from 'react-i18next'

import { clearAuthToken } from '../lib/api-client'
import { radius, spacing, typography, type Theme } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface WaitlistScreenProps {
  onLogOut: () => void
  onCheckStatus: () => void
  checking: boolean
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: spacing.lg,
      paddingTop: 64,
      paddingBottom: spacing.sm,
    },
    logOutBtn: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: t.border,
    },
    logOutText: {
      ...typography.caption,
      fontWeight: '600',
      color: t.textMuted,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingBottom: spacing.xl,
    },
    hero: {
      alignItems: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    },
    iconWrap: {
      position: 'relative',
      marginBottom: spacing.lg,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.primary + '18',
    },
    iconGlyph: {
      fontSize: 36,
      color: t.primary,
    },
    badge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 3,
      borderColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#16a34a',
    },
    badgeGlyph: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '800',
    },
    title: {
      ...typography.display,
      fontSize: 26,
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: t.text,
    },
    desc: {
      ...typography.body,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: spacing.md,
      color: t.textMuted,
    },
    descBold: {
      fontWeight: '700',
      color: t.primary,
    },
    steps: {
      gap: spacing.md,
      marginBottom: spacing.xxl,
    },
    stepCard: {
      borderRadius: 12,
      borderWidth: 1.5,
      padding: spacing.lg,
    },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    stepIconText: {
      fontSize: 18,
    },
    stepTitle: {
      ...typography.bodyStrong,
      marginBottom: 2,
    },
    stepDesc: {
      ...typography.caption,
      lineHeight: 18,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      marginBottom: spacing.xl,
      backgroundColor: t.border,
    },
    actions: {
      gap: spacing.md,
    },
    primaryBtn: {
      borderRadius: radius.md,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      backgroundColor: t.primary,
    },
    primaryBtnText: {
      fontSize: 16,
      fontWeight: '700',
      color: t.primaryFg,
    },
    secondaryBtn: {
      borderRadius: radius.md,
      borderWidth: 2,
      paddingVertical: 14,
      alignItems: 'center',
      borderColor: t.borderStrong,
    },
    secondaryBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: t.text,
    },
  })
}

export function WaitlistScreen({
  onLogOut,
  onCheckStatus,
  checking,
}: WaitlistScreenProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const styles = makeStyles(t)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogOut() {
    setLoggingOut(true)
    try {
      await clearAuthToken()
      onLogOut()
    } catch {
      setLoggingOut(false)
    }
  }

  function confirmLogOut() {
    Alert.alert(i18n('waitlist.logOut'), i18n('waitlist.description'), [
      { text: i18n('common.cancel'), style: 'cancel' },
      {
        text: i18n('waitlist.logOut'),
        style: 'destructive',
        onPress: () => void handleLogOut(),
      },
    ])
  }

  function handleContact() {
    Linking.openURL('mailto:support@mlila.dz')
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable
          onPress={confirmLogOut}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logOutBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={t.textMuted} />
          ) : (
            <Text style={styles.logOutText}>{i18n('waitlist.logOut')}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconGlyph}>⏳</Text>
            </View>
            <View style={[styles.badge]}>
              <Text style={styles.badgeGlyph}>✓</Text>
            </View>
          </View>

          <Text style={styles.title}>{i18n('waitlist.title')}</Text>
          <Text style={styles.desc}>
            {i18n('waitlist.description')}
            {'\n'}
            {i18n('waitlist.description2')}
          </Text>
        </View>

        <View style={styles.steps}>
          <StepCard
            icon="🛡️"
            title={i18n('waitlist.title')}
            desc={i18n('waitlist.description')}
            active
          />
          <StepCard
            icon="📬"
            title={i18n('notifications.title')}
            desc={i18n('waitlist.description2')}
            active={false}
          />
          <StepCard
            icon="🚀"
            title={i18n('waitlist.title')}
            desc={i18n('waitlist.description')}
            active={false}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <Pressable
            onPress={onCheckStatus}
            disabled={checking}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            {checking ? (
              <ActivityIndicator color={t.primaryFg} />
            ) : (
              <Text style={styles.primaryBtnText}>
                {i18n('waitlist.checkStatus')}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleContact}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.secondaryBtnText}>
              {i18n('common.contact')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}

function StepCard({
  icon,
  title,
  desc,
  active,
}: {
  icon: string
  title: string
  desc: string
  active: boolean
}) {
  const t = useTheme()
  const s = makeStyles(t)
  return (
    <View
      style={[
        s.stepCard,
        {
          backgroundColor: active ? t.primary + '0a' : t.bgMuted,
          borderColor: active ? t.primary + '30' : 'transparent',
        },
      ]}
    >
      <View
        style={[
          s.stepIcon,
          { backgroundColor: active ? t.surface : t.bgMuted },
        ]}
      >
        <Text style={s.stepIconText}>{icon}</Text>
      </View>
      <Text style={[s.stepTitle, { color: active ? t.text : t.textMuted }]}>
        {title}
      </Text>
      <Text
        style={[s.stepDesc, { color: active ? t.textMuted : t.textSubtle }]}
      >
        {desc}
      </Text>
    </View>
  )
}
