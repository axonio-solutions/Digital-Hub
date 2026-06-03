import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useIsRTL } from 'expo-rtl'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

import SplashBg from '../components/SplashBg'
import SplashDots from '../components/SplashDots'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'

const C = {
  blue: '#2563EB',
  green: '#22C55E',
  bg: '#EFF6FF',
} as const

interface Slide {
  icon: keyof typeof Ionicons.glyphMap
  titleKey: string
  descKey: string
  badgeKey?: string
}

const SLIDES: Array<Slide> = [
  {
    icon: 'infinite-outline',
    titleKey: 'splash.slide1.title',
    descKey: 'splash.slide1.description',
    badgeKey: 'splash.slide1.badge',
  },
  {
    icon: 'camera-outline',
    titleKey: 'splash.slide2.title',
    descKey: 'splash.slide2.description',
  },
  {
    icon: 'pricetags-outline',
    titleKey: 'splash.slide3.title',
    descKey: 'splash.slide3.description',
  },
  {
    icon: 'checkmark-circle-outline',
    titleKey: 'splash.slide4.title',
    descKey: 'splash.slide4.description',
  },
]

interface SplashScreenProps {
  onComplete?: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { t } = useTranslation()
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const pagerRef = useRef<PagerView>(null)
  const currentIndexRef = useRef(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [reduced, setReduced] = useState(false)
  const isRTL = useIsRTL()
  const isRTLRef = useRef(isRTL)
  useEffect(() => {
    isRTLRef.current = isRTL
  }, [isRTL])

  // Shimmer animation
  const shimmerX = useRef(new Animated.Value(isRTL ? 100 : -100)).current

  // CTA press scale
  const ctaScale = useRef(new Animated.Value(1)).current

  const rtlGestureX = useRef(new Animated.Value(0)).current
  const { width: screenWidth } = Dimensions.get('window')
  const slideOffset = screenWidth * 0.3

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced)
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    )
    return () => sub.remove()
  }, [])

  // Shimmer loop
  useEffect(() => {
    const start = isRTL ? 100 : -100
    const end = isRTL ? -500 : 500
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(shimmerX, {
          toValue: end,
          duration: reduced ? 0 : 720,
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
  }, [shimmerX, reduced])

  const isLastSlide = currentIndex === SLIDES.length - 1

  const onPageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const index = e.nativeEvent.position
      currentIndexRef.current = index
      setCurrentIndex(index)
    },
    [],
  )

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onComplete?.()
      navigation.navigate('Login')
    } else {
      const nextIndex = currentIndex + 1
      currentIndexRef.current = nextIndex
      setCurrentIndex(nextIndex)
      Animated.timing(rtlGestureX, {
        toValue: nextIndex,
        duration: reduced ? 0 : 280,
        useNativeDriver: false,
      }).start(() => {
        pagerRef.current?.setPageWithoutAnimation(nextIndex)
      })
    }
  }, [isLastSlide, currentIndex, rtlGestureX, reduced, onComplete, navigation])

  // PanResponder overlay captures all touches (both RTL & LTR)
  // Maps finger dx → virtual scroll position for real-time gesture-driven animation.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        rtlGestureX.setValue(currentIndexRef.current)
      },
      onPanResponderMove: (_, gs) => {
        const cur = currentIndexRef.current
        const rtl = isRTLRef.current
        // RTL: right swipe (dx > 0) → advance; LTR: right swipe → go back
        const virtualPos = cur + (rtl ? 1 : -1) * (gs.dx / screenWidth)
        rtlGestureX.setValue(
          Math.max(-0.5, Math.min(SLIDES.length - 1 + 0.5, virtualPos)),
        )
      },
      onPanResponderRelease: (_, gs) => {
        const cur = currentIndexRef.current
        if (Math.abs(gs.dx) < 50) {
          // Snap back to current page
          Animated.spring(rtlGestureX, {
            toValue: cur,
            stiffness: 200,
            damping: 20,
            mass: 0.3,
            useNativeDriver: false,
          }).start()
          return
        }
        const rtl = isRTLRef.current
        // RTL:  right swipe → NEXT;  left swipe → PREVIOUS
        // LTR:  right swipe → PREVIOUS;  left swipe → NEXT
        const target =
          gs.dx > 50 ? (rtl ? cur + 1 : cur - 1) : rtl ? cur - 1 : cur + 1
        if (target >= 0 && target < SLIDES.length) {
          Animated.timing(rtlGestureX, {
            toValue: target,
            duration: reduced ? 0 : 200,
            useNativeDriver: false,
          }).start(() => {
            pagerRef.current?.setPageWithoutAnimation(target)
          })
        } else {
          Animated.spring(rtlGestureX, {
            toValue: cur,
            stiffness: 200,
            damping: 20,
            mass: 0.3,
            useNativeDriver: false,
          }).start()
        }
      },
    }),
  ).current

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
      <View
        style={[
          styles.topBar,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={styles.brandMark}>
          <View style={styles.brandDot} />
          <Text style={styles.brandName}>mlila</Text>
        </View>
        <View style={styles.topRight}>
          {!isLastSlide && (
            <Pressable
              onPress={() => {
                onComplete?.()
                navigation.navigate('Login')
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.skipBtn,
                pressed && !reduced && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.skipText}>{t('splash.skip')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Carousel area */}
      <View style={{ flex: 1 }}>
        {/* PagerView: always LTR, native scroll in LTR mode */}
        <PagerView
          ref={pagerRef}
          style={StyleSheet.absoluteFill}
          initialPage={0}
          layoutDirection="ltr"
          scrollEnabled={false}
          onPageSelected={onPageSelected}
        >
          {SLIDES.map((item, index) => {
            const pos = rtlGestureX

            const iconScale = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.55, 1, 0.55],
              extrapolate: 'clamp',
            })

            const textOpacity = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            })

            const textTranslateY = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [18, 0, 18],
              extrapolate: 'clamp',
            })

            const descTranslateY = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [28, 0, 28],
              extrapolate: 'clamp',
            })

            const ghostOpacity = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0, 0.055, 0],
              extrapolate: 'clamp',
            })

            // RTL: new from left (+offset → 0), old goes right (0 → +offset)
            // LTR: new from right (-offset → 0), old goes left (0 → -offset)
            const translateX = pos.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: isRTL
                ? [-slideOffset, 0, slideOffset]
                : [slideOffset, 0, -slideOffset],
              extrapolate: 'clamp',
            })

            const slideNumber = `0${index + 1}`
            const isGreenSlide = index >= 2

            return (
              <View key={String(index)} style={styles.slide}>
                <Animated.Text
                  style={[styles.ghostNumber, { opacity: ghostOpacity }]}
                >
                  {slideNumber}
                </Animated.Text>

                <Animated.View style={{ transform: [{ translateX }] }}>
                  {item.badgeKey && (
                    <Animated.View
                      style={[
                        styles.badge,
                        {
                          opacity: textOpacity,
                          transform: [{ translateY: textTranslateY }],
                        },
                      ]}
                    >
                      <View style={styles.badgeDot} />
                      <Text style={styles.badgeText}>{t(item.badgeKey)}</Text>
                    </Animated.View>
                  )}

                  <View
                    style={[
                      styles.iconArea,
                      { alignSelf: isRTL ? 'flex-end' : 'flex-start' },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.iconDiamond,
                        isGreenSlide && styles.iconDiamondGreen,
                        {
                          transform: [
                            { scale: iconScale },
                            { rotate: '45deg' },
                          ],
                        },
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

                  <Animated.Text
                    style={[
                      styles.title,
                      {
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                      },
                    ]}
                  >
                    {t(item.titleKey)}
                  </Animated.Text>

                  <Animated.View
                    style={[
                      styles.divider,
                      isGreenSlide && styles.dividerGreen,
                      {
                        opacity: textOpacity,
                        transform: [{ translateY: textTranslateY }],
                        alignSelf: isRTL ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  />

                  <Animated.Text
                    style={[
                      styles.description,
                      {
                        opacity: textOpacity,
                        transform: [{ translateY: descTranslateY }],
                      },
                    ]}
                  >
                    {t(item.descKey)}
                  </Animated.Text>
                </Animated.View>
              </View>
            )
          })}
        </PagerView>

        {/* Transparent overlay ON TOP of PagerView captures all touches */}
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
      </View>

      {/* Bottom area */}
      <View style={[styles.bottom, { paddingBottom: bottomPadding }]}>
        <Pressable
          onPress={() => {
            onComplete?.()
            navigation.navigate('Login')
          }}
          hitSlop={8}
          accessibilityLabel={t('splash.signIn')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.signInRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
            pressed && !reduced && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.signInPrefix}>
            {t('splash.alreadyHaveAccount')}
          </Text>
          <Text style={styles.signInLink}>{t('splash.signIn')}</Text>
        </Pressable>

        <SplashDots
          count={SLIDES.length}
          activeIndex={currentIndex}
          reduced={reduced}
        />

        <Animated.View
          style={[styles.ctaWrap, { transform: [{ scale: ctaScale }] }]}
        >
          <Pressable
            onPress={handleNext}
            onPressIn={handleCtaPressIn}
            onPressOut={handleCtaPressOut}
            accessibilityLabel={
              isLastSlide ? t('splash.getStarted') : t('common.next')
            }
            accessibilityRole="button"
            style={[
              styles.cta,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.ctaHighlight} />
            <Animated.View
              style={[
                styles.ctaShimmer,
                isRTL ? { right: 0 } : { left: 0 },
                {
                  transform: [{ skewX: '-18deg' }, { translateX: shimmerX }],
                },
              ]}
            />
            <Text style={styles.ctaText}>
              {isLastSlide ? t('splash.getStarted') : t('common.next')}
            </Text>
            <View style={styles.ctaIconBubble}>
              <Ionicons
                name={
                  isLastSlide
                    ? 'checkmark-outline'
                    : isRTL
                      ? 'arrow-back-outline'
                      : 'arrow-forward-outline'
                }
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    top: -10,
    bottom: -10,
    width: 56,
    backgroundColor: '#ffffff',
    opacity: 0.1,
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
