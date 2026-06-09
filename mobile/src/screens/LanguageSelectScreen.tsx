import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { changeLanguage } from '../i18n'

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', icon: 'language-outline' },
  { code: 'fr', label: 'Français', native: 'Français', icon: 'language-outline' },
  { code: 'ar', label: 'العربية', native: 'العربية', icon: 'language-outline', isRTL: true },
] as const

interface Props {
  onComplete: () => void
}

export function LanguageSelectScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!selected || saving) return
    setSaving(true)
    await changeLanguage(selected)
    onComplete()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.brand}>
        <View style={styles.dot} />
        <Text style={styles.brandText}>mlila</Text>
      </View>

      <Text style={styles.title}>Choose your language</Text>
      <Text style={styles.subtitle}>Select your preferred language to get started</Text>

      <View style={styles.cards}>
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code
          return (
            <Pressable
              key={lang.code}
              onPress={() => setSelected(lang.code)}
              style={[styles.card, active && styles.cardActive]}
            >
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                {lang.native}
              </Text>
              {active && (
                <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
              )}
            </Pressable>
          )
        })}
      </View>

      <View style={styles.spacer} />

      <Pressable
        onPress={handleContinue}
        disabled={!selected || saving}
        style={({ pressed }) => [
          styles.button,
          !selected && styles.buttonDisabled,
          pressed && selected && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonText, !selected && styles.buttonTextDisabled]}>
          {saving ? 'Loading…' : 'Continue'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  cardLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardLabelActive: {
    color: '#1E293B',
  },
  spacer: {
    flex: 1,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#F1F5F9',
  },
})
