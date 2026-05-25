import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

import SplashBg from '../components/SplashBg'
import SplashDots from '../components/SplashDots'

const C = {
  blue: '#2563EB',
  green: '#22C55E',
  bg: '#EFF6FF',
} as const

interface Slide {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  description: string
  badge?: string
}

const SLIDES: Array<Slide> = [
  {
    icon: 'infinite-outline',
    title: "Don't search for parts.",
    description:
      'Let the parts find you. Post what you need and let verified sellers across Algeria compete to give the best quotes.',
    badge: 'First Reverse-Marketplace in Algeria',
  },
  {
    icon: 'camera-outline',
    title: 'Request a Part',
    description:
      'Submit the exact details of the spare part you need, including vehicle brand, year, and photos. Sellers receive your request instantly.',
  },
  {
    icon: 'pricetags-outline',
    title: 'Receive Quotes',
    description:
      'Verified sellers across the network respond with competitive quotes for New or Used parts. Compare prices, warranties, and reviews.',
  },
  {
    icon: 'checkmark-circle-outline',
    title: 'Accept & Connect',
    description:
      'Select the best offer and connect with the seller directly via Call or WhatsApp. Join thousands already using mlila.',
  },
]

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reduced, setReduced] = useState(false)
  const ctaScale = useRef(new Animated.Value(1)).current
  const shimmerX = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => sub.remove()
  }, [])

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

  const isLastSlide = currentIndex === SLIDES.length - 1

  const handleScroll = useCallback(
    (event: any) => {
      Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: false,
      })(event)
    },
    [scrollX],
  )

  const handleMomentumEnd = useCallback(
    (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width)
      setCurrentIndex(index)
    },
    [width],
  )

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onComplete()
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
      setCurrentIndex(currentIndex + 1)
    }
  }, [isLastSlide, currentIndex, onComplete])

  const handleCtaPressIn = useCallback(() => {
    if (reduced) return
    Animated.spring(ctaScale, {
      toValue: 0.97,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }, [ctaScale, reduced])

  const handleCtaPressOut = useCallback(() => {
    if (reduced) return
    Animated.spring(ctaScale, {
      toValue: 1,
      stiffness: 400,
      damping: 20,
      mass: 0.3,
      useNativeDriver: true,
    }).start()
  }, [ctaScale, reduced])

  const topPadding = insets.top + 4
  const bottomPadding = insets.bottom + 16

  return (
    <View style={[styles.root, { paddingTop: topPadding }]}>
      <SplashBg reduced={reduced} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.brandMark}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>mlila</Text>
        </View>
        {!isLastSlide && (
          <Pressable
            onPress={onComplete}
            hitSlop={12}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
            style={({ pressed }) => [styles.skipBtn, pressed && !reduced && { opacity: 0.6 }]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => {
          const inputRange = [width * (index - 1), width * index, width * (index + 1)]

          const iconScale = scrollX.interpolate({
            inputRange,
            outputRange: [0.55, 1, 0.55],
            extrapolate: 'clamp',
          })

          const textOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          })

          const textTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [18, 0, 18],
            extrapolate: 'clamp',
          })

          const descTranslateY = scrollX.interpolate({
            inputRange,
            outputRange: [28, 0, 28],
            extrapolate: 'clamp',
          })

          const ghostOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0, 0.055, 0],
            extrapolate: 'clamp',
          })

          const slideNumber = `0${index + 1}`
          const isGreenSlide = index >= 2

          return (
            <View style={[styles.slide, { width }]}>
              {/* Ghost step number */}
              <Animated.Text style={[styles.ghostNumber, { opacity: ghostOpacity }]}>
                {slideNumber}
              </Animated.Text>

              {/* Badge — slide 1 only */}
              {item.badge && (
                <Animated.View
                  style={[
                    styles.badge,
                    { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
                  ]}
                >
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </Animated.View>
              )}

              {/* Icon diamond */}
              <View style={styles.iconArea}>
                <Animated.View
                  style={[
                    styles.iconDiamond,
                    isGreenSlide && styles.iconDiamondGreen,
                    { transform: [{ scale: iconScale }, { rotate: '45deg' }] },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={36}
                    color="#fff"
                    style={{ transform: [{ rotate: '-45deg' }] }}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.accentDot,
                    isGreenSlide && styles.accentDotBlue,
                    { transform: [{ scale: iconScale }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.accentRing,
                    isGreenSlide && styles.accentRingGreen,
                    { transform: [{ scale: iconScale }] },
                  ]}
                />
              </View>

              {/* Title */}
              <Animated.Text
                style={[
                  styles.title,
                  { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
                ]}
              >
                {item.title}
              </Animated.Text>

              {/* Accent divider */}
              <Animated.View
                style={[
                  styles.divider,
                  isGreenSlide && styles.dividerGreen,
                  { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
                ]}
              />

              {/* Description */}
              <Animated.Text
                style={[
                  styles.description,
                  { opacity: textOpacity, transform: [{ translateY: descTranslateY }] },
                ]}
              >
                {item.description}
              </Animated.Text>
            </View>
          )
        }}
      />

      {/* Bottom area */}
      <View style={[styles.bottom, { paddingBottom: bottomPadding }]}>
        {/* Sign in link */}
        <Pressable
          onPress={onComplete}
          hitSlop={8}
          accessibilityLabel="Sign in to existing account"
          accessibilityRole="button"
          style={({ pressed }) => [styles.signInRow, pressed && !reduced && { opacity: 0.6 }]}
        >
          <Text style={styles.signInPrefix}>Already have an account? </Text>
          <Text style={styles.signInLink}>Sign in</Text>
        </Pressable>

        <SplashDots
          count={SLIDES.length}
          activeIndex={currentIndex}
          scrollX={scrollX}
          width={width}
          reduced={reduced}
        />

        {/* CTA */}
        <Animated.View style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}>
          <Pressable
            onPress={handleNext}
            onPressIn={handleCtaPressIn}
            onPressOut={handleCtaPressOut}
            accessibilityLabel={isLastSlide ? 'Get started with mlila' : 'Go to next slide'}
            accessibilityRole="button"
            style={styles.cta}
          >
            <View style={styles.ctaHighlight} />
            <Animated.View
              style={[styles.ctaShimmer, { transform: [{ translateX: shimmerX }] }]}
            />
            <Text style={styles.ctaText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
            <View style={styles.ctaIconBubble}>
              <Ionicons
                name={isLastSlide ? 'checkmark-outline' : 'arrow-forward-outline'}
                size={17}
                color="#fff"
              />
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Top bar ──────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
    height: 52,
    zIndex: 10,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: C.blue,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0a0a0a',
    letterSpacing: -0.6,
  },
  skipBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: `${C.blue}30`,
    backgroundColor: `${C.blue}08`,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.blue,
    letterSpacing: 0.1,
  },

  // ── Slide ────────────────────────────────────────────────
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ghostNumber: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 172,
    fontWeight: '900',
    color: C.blue,
    letterSpacing: -10,
    top: '18%',
    zIndex: 0,
  },

  // ── Badge ────────────────────────────────────────────────
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: C.blue,
    marginBottom: 32,
    zIndex: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // ── Icon ─────────────────────────────────────────────────
  iconArea: {
    width: 148,
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  iconDiamond: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 22,
    elevation: 14,
  },
  iconDiamondGreen: {
    backgroundColor: C.green,
    shadowColor: C.green,
  },
  accentDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.green,
    zIndex: 2,
  },
  accentDotBlue: {
    backgroundColor: C.blue,
  },
  accentRing: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: C.blue,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  accentRingGreen: {
    borderColor: C.green,
  },

  // ── Text ─────────────────────────────────────────────────
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.9,
    color: '#0a0a0a',
    marginBottom: 12,
    zIndex: 1,
  },
  divider: {
    width: 44,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: C.blue,
    marginBottom: 16,
    zIndex: 1,
  },
  dividerGreen: {
    backgroundColor: C.green,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 28,
    color: '#52525b',
    zIndex: 1,
  },

  // ── Bottom ───────────────────────────────────────────────
  bottom: {
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'center',
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  signInPrefix: {
    fontSize: 14,
    fontWeight: '400',
    color: '#71717a',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: C.blue,
  },

  // ── CTA ──────────────────────────────────────────────────
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
    backgroundColor: C.blue,
    overflow: 'hidden',
    shadowColor: C.blue,
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
    left: 0,
    top: -10,
    bottom: -10,
    width: 56,
    backgroundColor: '#ffffff',
    opacity: 0.1,
    transform: [{ skewX: '-18deg' }],
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
  },
  ctaIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
