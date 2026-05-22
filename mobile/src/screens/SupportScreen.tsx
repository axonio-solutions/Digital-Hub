import Ionicons from '@expo/vector-icons/Ionicons'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { submitSupportTicketFn } from '../lib/api-client'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface SupportScreenProps {
  onBack: () => void
}

const CATEGORIES = [
  { id: 'problem', label: 'Report a Problem', icon: 'bug-outline' as const },
  { id: 'request', label: 'Feature Request', icon: 'bulb-outline' as const },
  { id: 'support', label: 'Get Support', icon: 'help-buoy-outline' as const },
  {
    id: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-circle-outline' as const,
  },
]

export function SupportScreen({ onBack }: SupportScreenProps) {
  const t = useTheme()
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!category) {
      Alert.alert('Error', 'Please select a category.')
      return
    }
    if (subject.trim().length < 3) {
      Alert.alert('Error', 'Subject must be at least 3 characters.')
      return
    }
    if (message.trim().length < 10) {
      Alert.alert('Error', 'Message must be at least 10 characters.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitSupportTicketFn({
        category,
        subject: subject.trim(),
        message: message.trim(),
      })
      if (!result.success) {
        throw new Error(result.error || 'Failed to send message.')
      }
      setSuccess(true)
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to send message. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.successWrap}>
          <View
            style={[styles.successIconWrap, { backgroundColor: '#05966915' }]}
          >
            <Ionicons name="checkmark-circle" size={56} color="#059669" />
          </View>
          <Text style={[styles.successTitle, { color: t.text }]}>
            Message sent successfully!
          </Text>
          <Text style={[styles.successDesc, { color: t.textMuted }]}>
            We'll get back to you soon.
          </Text>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: t.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: t.primaryFg }]}>
              Back to Profile
            </Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: t.border, backgroundColor: t.bg },
        ]}
      >
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={t.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: t.text }]}>
          Help & Support
        </Text>
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
          <Text style={[styles.sectionLabel, { color: t.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const selected = category === c.id
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    {
                      backgroundColor: selected ? t.primary + '10' : t.bgMuted,
                      borderColor: selected ? t.primary : t.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Ionicons
                    name={c.icon}
                    size={22}
                    color={selected ? t.primary : t.textSubtle}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: selected ? t.primary : t.text,
                        fontWeight: selected ? '600' : '400',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: t.text }]}>Subject</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: t.bgMuted,
                borderColor: t.border,
                color: t.text,
              },
            ]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Brief title describing your issue"
            placeholderTextColor={t.textSubtle}
            returnKeyType="next"
            maxLength={200}
          />

          <Text style={[styles.sectionLabel, { color: t.text }]}>Message</Text>
          <TextInput
            style={[
              styles.textarea,
              {
                backgroundColor: t.bgMuted,
                borderColor: t.border,
                color: t.text,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue in detail..."
            placeholderTextColor={t.textSubtle}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={5000}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submitBtn,
              { backgroundColor: t.primary },
              pressed && { opacity: 0.85 },
              submitting && { opacity: 0.6 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={t.primaryFg} />
            ) : (
              <Ionicons name="send" size={18} color={t.primaryFg} />
            )}
            <Text style={[styles.submitText, { color: t.primaryFg }]}>
              {submitting ? 'Sending...' : 'Send Message'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    padding: spacing.sm,
    minWidth: 60,
  },
  headerTitle: {
    ...typography.h2,
    textAlign: 'center',
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.h2,
    fontSize: 15,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '47%',
    flex: 1,
  },
  categoryLabel: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 120,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: spacing.xl,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  successIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.display,
    fontSize: 20,
    textAlign: 'center',
  },
  successDesc: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
})
