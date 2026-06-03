import { Pressable, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'

import { spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.dangerBg, borderColor: t.danger + '30' },
      ]}
    >
      <Ionicons name="cloud-offline-outline" size={32} color={t.danger} />
      <Text style={[styles.title, { color: t.danger }]}>
        {i18n('error.somethingWentWrong')}
      </Text>
      <Text style={[styles.desc, { color: t.textMuted }]}>{message}</Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: t.danger },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Ionicons name="refresh-outline" size={16} color={t.accentFg} />
        <Text style={[styles.btnText, { color: t.accentFg }]}>
          {i18n('error.tryAgain')}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
})
