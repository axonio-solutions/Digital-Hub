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

import { clearAuthToken } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface WaitlistScreenProps {
  onLogOut: () => void
  onCheckStatus: () => void
  checking: boolean
}

export function WaitlistScreen({
  onLogOut,
  onCheckStatus,
  checking,
}: WaitlistScreenProps) {
  const t = useTheme()
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
    Alert.alert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => void handleLogOut(),
      },
    ])
  }

  function handleContact() {
    Linking.openURL('mailto:support@mlila.dz')
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={confirmLogOut}
          disabled={loggingOut}
          style={({ pressed }) => [
            styles.logOutBtn,
            { borderColor: t.border },
            pressed && { opacity: 0.6 },
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={t.textMuted} />
          ) : (
            <Text style={[styles.logOutText, { color: t.textMuted }]}>
              Log out
            </Text>
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
            <View
              style={[styles.iconCircle, { backgroundColor: t.primary + '18' }]}
            >
              <Text style={[styles.iconGlyph, { color: t.primary }]}>⏳</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: '#16a34a', borderColor: t.bg },
              ]}
            >
              <Text style={styles.badgeGlyph}>✓</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: t.text }]}>
            Application submitted
          </Text>
          <Text style={[styles.desc, { color: t.textMuted }]}>
            Your seller profile is now under review by the{' '}
            <Text style={[styles.descBold, { color: t.primary }]}>MLILA</Text>{' '}
            team. We'll notify you once it's approved.
          </Text>
        </View>

        <View style={styles.steps}>
          <StepCard
            icon="🛡️"
            title="Reviewing"
            desc="Our team verifies your details and business info."
            active
            theme={t}
          />
          <StepCard
            icon="📬"
            title="Notification"
            desc="You'll receive an email and in-app alert when approved."
            active={false}
            theme={t}
          />
          <StepCard
            icon="🚀"
            title="Access"
            desc="Start receiving and responding to buyer requests."
            active={false}
            theme={t}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: t.border }]} />

        <View style={styles.actions}>
          <Pressable
            onPress={onCheckStatus}
            disabled={checking}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: t.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            {checking ? (
              <ActivityIndicator color={t.primaryFg} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: t.primaryFg }]}>
                Check status
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleContact}
            style={({ pressed }) => [
              styles.secondaryBtn,
              {
                borderColor: t.borderStrong,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: t.text }]}>
              Contact support
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
  theme: t,
}: {
  icon: string
  title: string
  desc: string
  active: boolean
  theme: any
}) {
  return (
    <View
      style={[
        styles.stepCard,
        {
          backgroundColor: active ? t.primary + '0a' : t.bgMuted,
          borderColor: active ? t.primary + '30' : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.stepIcon,
          { backgroundColor: active ? t.surface : t.bgMuted },
        ]}
      >
        <Text style={styles.stepIconText}>{icon}</Text>
      </View>
      <Text
        style={[styles.stepTitle, { color: active ? t.text : t.textMuted }]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.stepDesc,
          { color: active ? t.textMuted : t.textSubtle },
        ]}
      >
        {desc}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  },
  logOutText: {
    ...typography.caption,
    fontWeight: '600',
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
  },
  iconGlyph: {
    fontSize: 36,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  desc: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  descBold: {
    fontWeight: '700',
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
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: radius.md,
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
