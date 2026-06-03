import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'

import { AnimatedPressable } from './AnimatedPressable'
import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { PressableProps } from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string
  variant?: Variant
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  fullWidth = true,
  ...rest
}: ButtonProps) {
  const t = useTheme()
  const isDisabled = disabled || loading

  const colors = (() => {
    switch (variant) {
      case 'primary':
        return { bg: t.primary, fg: t.primaryFg, border: t.primary }
      case 'secondary':
        return { bg: t.surface, fg: t.text, border: t.borderStrong }
      case 'ghost':
        return { bg: 'transparent', fg: t.text, border: 'transparent' }
      case 'danger':
        return { bg: t.danger, fg: '#fff', border: t.danger }
    }
  })()

  return (
    <AnimatedPressable
      disabled={isDisabled}
      scaleTo={0.96}
      springConfig={{ stiffness: 300, damping: 20, mass: 0.3 }}
      containerStyle={fullWidth && styles.fullWidth}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <Text style={[styles.label, { color: colors.fg }]}>{label}</Text>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  label: {
    ...typography.bodyStrong,
    fontSize: 16,
  },
})
