import { forwardRef } from 'react'
import { StyleSheet } from 'react-native'
import { View, Text, TextInput } from 'expo-rtl'
import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'

import { spacing, typography } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'
import type { TextInput as RNTextInput, TextInputProps } from 'react-native'

interface FieldProps extends TextInputProps {
  label: string
  error?: string | null
  hint?: string
  leftIcon?: React.ReactNode
}

export const Field = forwardRef<RNTextInput, FieldProps>(function Field(
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

interface ControlledFieldProps<T extends FieldValues> extends Omit<
  FieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> {
  control: Control<T>
  name: Path<T>
}

export function ControlledField<T extends FieldValues>({
  control,
  name,
  label,
  leftIcon,
  hint,
  ...rest
}: ControlledFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Field
          label={label}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          leftIcon={leftIcon}
          hint={hint}
          {...rest}
        />
      )}
    />
  )
}

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
