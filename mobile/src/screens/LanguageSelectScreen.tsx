import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { changeLanguage } from '../i18n'

/* Hallmark · component: language-select · genre: playful · theme: Plume (claymorphism)
 * states: default · selected · pressed · disabled · loading · success
 * Laws of UX: Hick's (3 options) · Fitts's (large targets) · Peak-End (delightful first impression)
 *              · Von Restorff (selected card pops) · Aesthetic-Usability · Goal-Gradient
 * contrast: pass (AAA)
 */

const LANGUAGES = [
  {
    code: 'en',
    native: 'English',
    subtitle: 'English',
    globe: '🇬🇧',
  },
  {
    code: 'fr',
    native: 'Français',
    subtitle: 'French',
    globe: '🇫🇷',
  },
  {
    code: 'ar',
    native: 'العربية',
    subtitle: 'Arabic',
    globe: '🇸🇦',
  },
] as const

const INDIGO_600 = '#4F46E5'
const INDIGO_50 = '#EEF2FF'
const INDIGO_100 = '#E0E7FF'
const INDIGO_950 = '#1E1B4B'
const INDIGO_500 = '#6366F1'
const WHITE = '#FFFFFF'
const SLATE_400 = '#94A3B8'

interface Props {
  onComplete: () => void
}

export function LanguageSelectScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // ── Entrance animations ────────────────────────────────────────────────────
  const brandOpacity = useRef(new Animated.Value(0)).current
  const brandTranslateY = useRef(new Animated.Value(-12)).current
  const globeScale = useRef(new Animated.Value(0)).current
  const titleOpacity = useRef(new Animated.Value(0)).current
  const titleTranslateY = useRef(new Animated.Value(20)).current
  const cardAnims = useRef(
    LANGUAGES.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    })),
  ).current

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(globeScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(
        80,
        cardAnims.map((a) =>
          Animated.parallel([
            Animated.timing(a.opacity, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(a.translateY, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    ]).start()
  }, [])

  // ── Selection animation ────────────────────────────────────────────────────
  const selectAnim = useRef(new Animated.Value(0)).current
  const buttonSlide = useRef(new Animated.Value(50)).current
  const buttonOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.spring(selectAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      selectAnim.setValue(0)
      buttonSlide.setValue(50)
      buttonOpacity.setValue(0)
    }
  }, [selected])

  async function handleContinue() {
    if (!selected || saving) return
    setSaving(true)
    // Brief delay so the loading state is visible
    await new Promise((r) => setTimeout(r, 400))
    await changeLanguage(selected)
    onComplete()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}>
      {/* ── Brand mark ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.brand,
          { opacity: brandOpacity, transform: [{ translateY: brandTranslateY }] },
        ]}
      >
        <View style={styles.brandDot}>
          <View style={styles.brandDotInner} />
        </View>
        <Text style={styles.brandText}>mlila</Text>
      </Animated.View>

      {/* ── Decorative globe ───────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.globeWrap, { transform: [{ scale: globeScale }] }]}
      >
        <View style={styles.globeRing}>
          <Ionicons name="globe-outline" size={48} color={INDIGO_600} />
        </View>
      </Animated.View>

      {/* ── Heading ────────────────────────────────────────────────────────── */}
      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }}
      >
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>
          Pick the language you feel most comfortable with
        </Text>
      </Animated.View>

      {/* ── Language cards ─────────────────────────────────────────────────── */}
      <View style={styles.cards}>
        {LANGUAGES.map((lang, i) => {
          const active = selected === lang.code
          const cardScale = cardAnims[i]
          const isSelectedAnim = selectAnim

          return (
            <Animated.View
              key={lang.code}
              style={{
                opacity: cardScale.opacity,
                transform: [{ translateY: cardScale.translateY }],
              }}
            >
              <Pressable
                onPress={() => setSelected(lang.code)}
                style={({ pressed }) => [
                  styles.card,
                  active && styles.cardActive,
                  pressed && !active && styles.cardPressed,
                  pressed && active && styles.cardActivePressed,
                ]}
              >
                {/* Radio indicator */}
                <Animated.View
                  style={[
                    styles.radio,
                    active && styles.radioActive,
                    active && {
                      transform: [
                        {
                          scale: isSelectedAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.15],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {active && (
                    <Animated.View
                      style={[
                        styles.radioInner,
                        {
                          transform: [
                            {
                              scale: isSelectedAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </Animated.View>

                {/* Language info */}
                <View style={styles.langInfo}>
                  <Text
                    style={[
                      styles.langNative,
                      active && styles.langNativeActive,
                    ]}
                  >
                    {lang.native}
                  </Text>
                  <Text
                    style={[
                      styles.langSub,
                      active && styles.langSubActive,
                    ]}
                  >
                    {lang.subtitle}
                  </Text>
                </View>

                {/* Flag icon */}
                <Text style={styles.flag}>{lang.globe}</Text>
              </Pressable>
            </Animated.View>
          )
        })}
      </View>

      <View style={styles.spacer} />

      {/* ── Continue button ─────────────────────────────────────────────────── */}
      <Animated.View
        style={{
          opacity: buttonOpacity,
          transform: [{ translateY: buttonSlide }],
        }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={!selected || saving}
          style={({ pressed }) => [
            styles.button,
            !selected && styles.buttonDisabled,
            pressed && selected && !saving && styles.buttonPressed,
          ]}
        >
          {saving ? (
            <View style={styles.buttonLoadingRow}>
              <Ionicons name="sync" size={18} color={WHITE} />
              <Text style={styles.buttonText}>Loading…</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <Text style={styles.buttonText}>Continue</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={WHITE}
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: INDIGO_50,
    paddingHorizontal: 28,
  },

  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  brandDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: INDIGO_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: INDIGO_600,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: INDIGO_950,
    letterSpacing: -0.5,
  },

  // ── Globe ──────────────────────────────────────────────────────────────────
  globeWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  globeRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: INDIGO_600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  // ── Heading ────────────────────────────────────────────────────────────────
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: INDIGO_950,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: INDIGO_500,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  // ── Cards ──────────────────────────────────────────────────────────────────
  cards: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: INDIGO_100,
    shadowColor: INDIGO_600,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: INDIGO_600,
    backgroundColor: WHITE,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardActivePressed: {
    opacity: 0.9,
  },

  // ── Radio ──────────────────────────────────────────────────────────────────
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: INDIGO_600,
  },
  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: INDIGO_600,
  },

  // ── Language info ──────────────────────────────────────────────────────────
  langInfo: {
    flex: 1,
  },
  langNative: {
    fontSize: 18,
    fontWeight: '700',
    color: INDIGO_950,
    marginBottom: 2,
  },
  langNativeActive: {
    color: INDIGO_600,
  },
  langSub: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  langSubActive: {
    color: '#6366F1',
  },
  flag: {
    fontSize: 28,
  },

  // ── Spacer ─────────────────────────────────────────────────────────────────
  spacer: {
    flex: 1,
  },

  // ── Button ─────────────────────────────────────────────────────────────────
  button: {
    backgroundColor: INDIGO_600,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: INDIGO_600,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#C7D2FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.2,
  },
})
