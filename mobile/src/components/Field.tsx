import { forwardRef } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { radius, spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { TextInputProps } from 'react-native'

interface FieldProps extends TextInputProps {
  label: string
  error?: string | null
  hint?: string
  leftIcon?: React.ReactNode
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, hint, leftIcon, style, ...rest },
  ref,
) {
  const t = useTheme()
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: t.textMuted }]}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: t.surface,
            borderColor: error ? t.danger : t.border,
          },
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={t.textSubtle}
          {...rest}
          style={[
            styles.input,
            { color: t.text, paddingLeft: leftIcon ? spacing.sm : spacing.md },
            style,
          ]}
        />
      </View>
      {error ? (
        <Text style={[styles.helper, { color: t.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.helper, { color: t.textSubtle }]}>{hint}</Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: {
    ...typography.label,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 52,
  },
  icon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: spacing.md,
    fontSize: 16,
  },
  helper: {
    ...typography.caption,
    marginTop: 6,
  },
})
