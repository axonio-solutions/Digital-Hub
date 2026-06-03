import { type ReactNode } from 'react'
import { StyleSheet, Text, View, type ViewStyle } from 'react-native'

import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  style?: ViewStyle
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  const t = useTheme()

  return (
    <View style={[styles.wrap, { paddingTop: 72 }, style]}>
      {icon}
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.desc, { color: t.textMuted }]}>{description}</Text>
      )}
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
})
