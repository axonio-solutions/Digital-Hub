import Ionicons from '@expo/vector-icons/Ionicons'
import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'
import { Text, View } from 'expo-rtl'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../theme/use-theme'

export type TabId =
  | 'home'
  | 'requests'
  | 'notifications'
  | 'profile'
  | 'billing'
  | 'quotes'

export interface TabConfig {
  id: TabId
  label: string
  iconActive: keyof typeof Ionicons.glyphMap
  iconInactive: keyof typeof Ionicons.glyphMap
}

const BUYER_TABS: Array<TabConfig> = [
  {
    id: 'home',
    label: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    id: 'requests',
    label: 'Requests',
    iconActive: 'clipboard',
    iconInactive: 'clipboard-outline',
  },
  {
    id: 'notifications',
    label: 'Alerts',
    iconActive: 'notifications',
    iconInactive: 'notifications-outline',
  },
  {
    id: 'profile',
    label: 'Profile',
    iconActive: 'person',
    iconInactive: 'person-outline',
  },
]

const SELLER_TABS: Array<TabConfig> = [
  {
    id: 'home',
    label: 'Home',
    iconActive: 'home',
    iconInactive: 'home-outline',
  },
  {
    id: 'requests',
    label: 'Market',
    iconActive: 'search',
    iconInactive: 'search-outline',
  },
  {
    id: 'quotes',
    label: 'Quotes',
    iconActive: 'chatbubbles',
    iconInactive: 'chatbubbles-outline',
  },
  {
    id: 'notifications',
    label: 'Alerts',
    iconActive: 'notifications',
    iconInactive: 'notifications-outline',
  },
  {
    id: 'profile',
    label: 'Profile',
    iconActive: 'person',
    iconInactive: 'person-outline',
  },
]

const C = {
  blue: '#2563EB',
  green: '#22C55E',
} as const

const PADDING_H = 10
const BAR_CR = 26

const TAB_LABEL_KEYS: Record<string, { buyer: string; seller: string }> = {
  home: { buyer: 'nav.buyer.home', seller: 'nav.seller.home' },
  requests: { buyer: 'nav.buyer.requests', seller: 'nav.seller.market' },
  notifications: { buyer: 'nav.buyer.alerts', seller: 'nav.seller.alerts' },
  profile: { buyer: 'nav.buyer.profile', seller: 'nav.seller.profile' },
  quotes: { buyer: 'nav.seller.quotes', seller: 'nav.seller.quotes' },
  billing: { buyer: 'nav.seller.billing', seller: 'nav.seller.billing' },
}

// ── Animated tab item ─────────────────────────────────────────────────────────

interface AnimatedTabItemProps {
  tab: TabConfig
  isActive: boolean
  onPress: () => void
  showBadge?: boolean
  badgeCount?: number
  inactiveColor: string
  activePillBg: string
  barBg: string
  variant: 'buyer' | 'seller'
}

function AnimatedTabItem({
  tab,
  isActive,
  onPress,
  showBadge = false,
  badgeCount = 0,
  inactiveColor,
  activePillBg,
  barBg,
  variant,
}: AnimatedTabItemProps) {
  const { t } = useTranslation()
  const bounceScale = useRef(new Animated.Value(1)).current
  const pillOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current
  const pillScale = useRef(new Animated.Value(isActive ? 1 : 0.6)).current
  const liftY = useRef(new Animated.Value(isActive ? -2 : 0)).current
  const dotScale = useRef(new Animated.Value(isActive ? 1 : 0)).current
  const dotOpacity = useRef(new Animated.Value(isActive ? 1 : 0)).current

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.spring(bounceScale, {
          toValue: 1.22,
          stiffness: 600,
          damping: 8,
          useNativeDriver: true,
        }),
        Animated.spring(bounceScale, {
          toValue: 1,
          stiffness: 300,
          damping: 22,
          useNativeDriver: true,
        }),
      ]).start()
    }
    Animated.parallel([
      Animated.spring(pillOpacity, {
        toValue: isActive ? 1 : 0,
        stiffness: 280,
        damping: 28,
        useNativeDriver: true,
      }),
      Animated.spring(pillScale, {
        toValue: isActive ? 1 : 0.6,
        stiffness: 280,
        damping: 28,
        useNativeDriver: true,
      }),
      Animated.spring(liftY, {
        toValue: isActive ? -2 : 0,
        stiffness: 320,
        damping: 26,
        useNativeDriver: true,
      }),
      Animated.spring(dotScale, {
        toValue: isActive ? 1 : 0,
        stiffness: 360,
        damping: 28,
        useNativeDriver: true,
      }),
      Animated.spring(dotOpacity, {
        toValue: isActive ? 1 : 0,
        stiffness: 360,
        damping: 28,
        useNativeDriver: true,
      }),
    ]).start()
  }, [isActive])

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={t(TAB_LABEL_KEYS[tab.id]?.[variant] ?? tab.label)}
      style={({ pressed }) => [
        styles.tabItem,
        pressed && !isActive && styles.tabItemPressed,
      ]}
    >
      <Animated.View
        style={[styles.iconWrap, { transform: [{ translateY: liftY }] }]}
      >
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: activePillBg,
              opacity: pillOpacity,
              transform: [{ scale: pillScale }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: bounceScale }] }}>
          <Ionicons
            name={isActive ? tab.iconActive : tab.iconInactive}
            size={22}
            color={isActive ? C.blue : inactiveColor}
          />
        </Animated.View>
        {showBadge && (
          <View style={[styles.badge, { borderColor: barBg }]}>
            <Text style={styles.badgeText}>
              {badgeCount > 9 ? '9+' : String(badgeCount)}
            </Text>
          </View>
        )}
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          isActive
            ? styles.tabLabelActive
            : [styles.tabLabelInactive, { color: inactiveColor }],
        ]}
      >
        {t(TAB_LABEL_KEYS[tab.id]?.[variant] ?? tab.label)}
      </Text>
      {/* Active indicator bar */}
      <Animated.View
        style={[
          styles.activeIndicator,
          { opacity: dotOpacity, transform: [{ scaleX: dotScale }] },
        ]}
      />
    </Pressable>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface BottomTabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onCreatePress?: () => void
  unreadCount?: number
  variant?: 'buyer' | 'seller'
}

export function BottomTabBar({
  activeTab,
  onTabChange,
  onCreatePress,
  unreadCount = 0,
  variant = 'buyer',
}: BottomTabBarProps) {
  const t = useTheme()
  const { t: tr } = useTranslation()
  const tabs = variant === 'seller' ? SELLER_TABS : BUYER_TABS
  const isBuyer = variant === 'buyer'

  const fabScale = useRef(new Animated.Value(1)).current
  const fabRotate = useRef(new Animated.Value(0)).current

  const rotateInterp = fabRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  function handleFabPressIn() {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 0.88,
        stiffness: 500,
        damping: 18,
        mass: 0.3,
        useNativeDriver: true,
      }),
      Animated.spring(fabRotate, {
        toValue: 1,
        stiffness: 400,
        damping: 22,
        mass: 0.2,
        useNativeDriver: true,
      }),
    ]).start()
  }

  function handleFabPress() {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        stiffness: 500,
        damping: 18,
        mass: 0.3,
        useNativeDriver: true,
      }),
      Animated.spring(fabRotate, {
        toValue: 0,
        stiffness: 400,
        damping: 22,
        mass: 0.2,
        useNativeDriver: true,
      }),
    ]).start()
    onCreatePress?.()
  }

  // ── Shared pill ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.pill, { backgroundColor: t.surface }]}>
      {isBuyer ? (
        <>
          {/* Home + Requests */}
          {tabs.slice(0, 2).map((tab) => (
            <AnimatedTabItem
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
              inactiveColor={t.textSubtle}
              activePillBg={t.primary + '16'}
              barBg={t.surface}
              variant={variant}
            />
          ))}

          {/* FAB tab — integrated into the pill */}
          <View style={styles.fabTabItem}>
            <Animated.View
              style={{
                transform: [{ scale: fabScale }, { rotate: rotateInterp }],
              }}
            >
              <Pressable
                onPress={handleFabPress}
                onPressIn={handleFabPressIn}
                style={({ pressed }) => [
                  styles.fabTabCircle,
                  pressed && { backgroundColor: '#1D4ED8' },
                ]}
                accessibilityRole="button"
                accessibilityLabel={tr('nav.createRequest')}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </Pressable>
            </Animated.View>
            <Text style={styles.fabTabLabel}>{tr('nav.new')}</Text>
          </View>

          {/* Alerts + Profile */}
          {tabs.slice(2).map((tab) => (
            <AnimatedTabItem
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onPress={() => onTabChange(tab.id)}
              showBadge={tab.id === 'notifications' && unreadCount > 0}
              badgeCount={unreadCount}
              inactiveColor={t.textSubtle}
              activePillBg={t.primary + '16'}
              barBg={t.surface}
              variant={variant}
            />
          ))}
        </>
      ) : (
        tabs.map((tab) => (
          <AnimatedTabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => onTabChange(tab.id)}
            showBadge={tab.id === 'notifications' && unreadCount > 0}
            badgeCount={unreadCount}
            inactiveColor={t.textSubtle}
            activePillBg={t.primary + '16'}
            barBg={t.surface}
            variant={variant}
          />
        ))
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Shared tab item ────────────────────────────────────────
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 68,
    gap: 2,
  },
  tabItemPressed: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    width: 46,
    height: 30,
    borderRadius: 15,
  },
  activeIndicator: {
    width: 18,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.blue,
    marginTop: 1,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: C.blue,
    fontWeight: '800',
  },
  tabLabelInactive: {
    fontWeight: '400',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // ── Floating pill ────────────────────────────────────────────
  pill: {
    flexDirection: 'row',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: BAR_CR,
    borderBottomRightRadius: BAR_CR,

    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 10,
  },

  // ── Buyer FAB tab (inside the pill) ─────────────────────────
  fabTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 68,
    gap: 2,
  },
  fabTabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 10,
  },
  fabTabLabel: {
    fontSize: 11,
    color: C.blue,
    fontWeight: '800',
  },
})
