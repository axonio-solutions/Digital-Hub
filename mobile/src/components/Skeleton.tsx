import { useEffect, type ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { radius, spacing } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

export function SkeletonBox({
  style,
  children,
}: {
  style?: ViewStyle | ViewStyle[]
  children?: ReactNode
}) {
  const t = useTheme()
  const opacity = useSharedValue(0.35)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      ),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[{ backgroundColor: t.border }, animatedStyle, style]}
    >
      {children}
    </Animated.View>
  )
}

export function SkeletonCard() {
  const t = useTheme()
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: t.surface, borderColor: t.border },
        animatedStyle,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.thumb, { backgroundColor: t.border }]} />
        <View style={styles.body}>
          <View
            style={[styles.line, { width: '60%', backgroundColor: t.border }]}
          />
          <View
            style={[
              styles.line,
              { width: '42%', backgroundColor: t.border, marginTop: 7 },
            ]}
          />
          <View
            style={[
              styles.line,
              { width: '30%', backgroundColor: t.border, marginTop: 5 },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  line: {
    height: 12,
    borderRadius: 6,
  },
})
