import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import { EditProfileScreen } from './EditProfileScreen'
import { SupportScreen } from './SupportScreen'
import type { SessionUser } from '../lib/api-client'

interface ProfileKpiData {
  pipelineValue: number
  revenue: number
  winRate: number
}

interface ProfileScreenProps {
  user: SessionUser
  onLogOut: () => void
  onUserUpdate: (user: SessionUser) => void
  kpiData?: ProfileKpiData
  onNavigateBilling?: () => void
  creditBalance?: number
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

function getStatusMeta(status: string | null | undefined) {
  return (
    STATUS_META[status ?? ''] ?? {
      dot: C.green,
      bg: C.green + '15',
      label: status || 'Active',
    }
  )
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function ProfileScreen({
  user,
  onLogOut,
  onUserUpdate,
  kpiData,
  onNavigateBilling,
  creditBalance,
}: ProfileScreenProps) {
  const t = useTheme()
  const [editing, setEditing] = useState(false)
  const [showSupport, setShowSupport] = useState(false)

  const statusMeta = getStatusMeta(user.account_status)
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

  const avatarUrl = user.image || null
  const initial = (user.name || user.email || 'U')[0].toUpperCase()

  if (showSupport) {
    return <SupportScreen onBack={() => setShowSupport(false)} />
  }

  if (editing) {
    return (
      <EditProfileScreen
        user={user}
        onSave={(updated) => {
          onUserUpdate(updated)
          setEditing(false)
        }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  function handleLogOut() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogOut },
    ])
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
    { icon: 'mail-outline', label: 'Email', value: user.email },
    { icon: 'call-outline', label: 'Phone', value: user.phoneNumber },
    { icon: 'logo-whatsapp', label: 'WhatsApp', value: user.whatsappNumber },
    { icon: 'location-outline', label: 'Wilaya', value: user.wilaya },
    { icon: 'storefront-outline', label: 'Store', value: user.storeName },
  ].filter((r) => r.value)

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <Card index={0}>
          <View
            style={[
              styles.headerCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      styles.avatarPlaceholder,
                      { backgroundColor: t.accent + '15' },
                    ]}
                  >
                    <Text style={[styles.avatarInitial, { color: t.accent }]}>
                      {initial}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusMeta.dot, borderColor: t.surface },
                  ]}
                />
              </View>
            </Animated.View>

            <Text style={[styles.name, { color: t.text }]}>
              {user.name || 'User'}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[styles.roleBadge, { backgroundColor: t.accent + '12' }]}
              >
                <Text style={[styles.roleText, { color: t.accent }]}>
                  {user.role === 'buyer'
                    ? 'Buyer'
                    : user.role === 'seller'
                      ? 'Seller'
                      : user.role || 'User'}
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

            {creditBalance !== undefined && (
              <Pressable
                onPress={onNavigateBilling}
                style={({ pressed }) => [
                  styles.creditBadge,
                  {
                    backgroundColor: C.credits + '12',
                    borderColor: C.credits + '25',
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="wallet-outline" size={14} color={C.credits} />
                <Text style={[styles.creditText, { color: C.credits }]}>
                  {creditBalance} Credit{creditBalance !== 1 ? 's' : ''}
                </Text>
                <Ionicons name="chevron-forward" size={12} color={C.credits} />
              </Pressable>
            )}
          </View>
        </Card>

        {/* Stats Card */}
        {hasStats && (
          <Card index={1}>
            <View
              style={[
                styles.statsCard,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
            >
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
                  <Text style={[styles.statValue, { color: t.text }]}>
                    DA {formatCurrency(kpiData.pipelineValue)}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    Pipeline
                  </Text>
                </View>
                <View
                  style={[styles.statDivider, { backgroundColor: t.border }]}
                />
                <View style={styles.statTile}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: C.green + '12' },
                    ]}
                  >
                    <Ionicons name="wallet-outline" size={16} color={C.green} />
                  </View>
                  <Text style={[styles.statValue, { color: t.text }]}>
                    DA {formatCurrency(kpiData.revenue)}
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    Revenue
                  </Text>
                </View>
                <View
                  style={[styles.statDivider, { backgroundColor: t.border }]}
                />
                <View style={styles.statTile}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: C.amber + '12' },
                    ]}
                  >
                    <Ionicons name="trophy-outline" size={16} color={C.amber} />
                  </View>
                  <Text style={[styles.statValue, { color: t.text }]}>
                    {kpiData.winRate}%
                  </Text>
                  <Text style={[styles.statLabel, { color: t.textMuted }]}>
                    Win Rate
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Personal Info Card */}
        <Card index={hasStats ? 2 : 1}>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[styles.sectionHeader, { borderBottomColor: t.border }]}
            >
              <Ionicons name="person-outline" size={14} color={t.textSubtle} />
              <Text style={[styles.sectionTitle, { color: t.textMuted }]}>
                Personal Information
              </Text>
            </View>
            {infoRows.map((row, i) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  i < infoRows.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: t.border + '50',
                  },
                ]}
              >
                <View style={[styles.infoIcon, { backgroundColor: t.bgMuted }]}>
                  <Ionicons
                    name={row.icon as any}
                    size={16}
                    color={t.textMuted}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: t.textSubtle }]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.infoValue, { color: t.text }]}>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Account Card */}
        <Card index={hasStats ? 3 : 2}>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View
              style={[styles.sectionHeader, { borderBottomColor: t.border }]}
            >
              <Ionicons
                name="settings-outline"
                size={14}
                color={t.textSubtle}
              />
              <Text style={[styles.sectionTitle, { color: t.textMuted }]}>
                Account
              </Text>
            </View>

            <Pressable
              onPress={() => setEditing(true)}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: t.accent },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons name="create-outline" size={16} color={t.accentFg} />
              <Text style={[styles.primaryBtnText, { color: t.accentFg }]}>
                Edit Profile
              </Text>
            </Pressable>

            {!!onNavigateBilling && (
              <>
                <Pressable
                  onPress={onNavigateBilling}
                  style={({ pressed }) => [
                    styles.menuRow,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View
                    style={[styles.menuIcon, { backgroundColor: t.bgMuted }]}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={t.textMuted}
                    />
                  </View>
                  <Text style={[styles.menuLabel, { color: t.text }]}>
                    Credits & Billing
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={t.textSubtle}
                  />
                </Pressable>
                <View
                  style={[styles.menuDivider, { backgroundColor: t.border }]}
                />
              </>
            )}

            <Pressable
              onPress={() => setShowSupport(true)}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={[styles.menuIcon, { backgroundColor: t.bgMuted }]}>
                <Ionicons
                  name="help-buoy-outline"
                  size={16}
                  color={t.textMuted}
                />
              </View>
              <Text style={[styles.menuLabel, { color: t.text }]}>
                Help & Support
              </Text>
              <Ionicons name="chevron-forward" size={16} color={t.textSubtle} />
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: t.border }]} />

            <Pressable
              onPress={handleLogOut}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[styles.menuIcon, { backgroundColor: C.red + '10' }]}
              >
                <Ionicons name="log-out-outline" size={16} color={C.red} />
              </View>
              <Text style={[styles.menuLabel, { color: C.red }]}>Log Out</Text>
              <Ionicons name="chevron-forward" size={16} color={t.textSubtle} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  )
}

const AVATAR_SIZE = 96

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  name: {
    ...typography.display,
    fontSize: 24,
    marginBottom: spacing.sm,
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
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
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
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },

  /* Section Card */
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
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
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    opacity: 0.2,
    marginHorizontal: spacing.lg,
  },
})
