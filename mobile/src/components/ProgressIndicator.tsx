import { StyleSheet, Text, View } from 'react-native'
import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface Step {
  id: number
  label: string
}

interface ProgressIndicatorProps {
  steps: Array<Step>
  currentStep: number
  sellerMode: boolean
}

export function ProgressIndicator({
  steps,
  currentStep,
  sellerMode,
}: ProgressIndicatorProps) {
  const t = useTheme()
  const visible = sellerMode ? steps : steps.filter((s) => s.id !== 4)
  const total = visible.length
  const currentIdx = visible.findIndex((s) => s.id === currentStep)
  const currentLabel = visible[currentIdx]?.label ?? ''

  return (
    <View style={[styles.wrap, { backgroundColor: t.bg }]}>
      <View style={styles.segments}>
        {visible.map((step, idx) => {
          const isDone = idx < currentIdx
          const isCurrent = idx === currentIdx
          return (
            <View
              key={step.id}
              style={[
                styles.segment,
                {
                  backgroundColor: isCurrent
                    ? t.primary
                    : isDone
                      ? t.primary + '50'
                      : t.border,
                },
              ]}
            />
          )
        })}
      </View>

      <View style={styles.labelRow}>
        <Text style={[styles.stepLabel, { color: t.text }]}>
          {currentLabel}
        </Text>
        <Text style={[styles.stepCount, { color: t.textSubtle }]}>
          {currentIdx + 1} / {total}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  stepCount: {
    fontSize: 12,
    fontWeight: '500',
  },
})
