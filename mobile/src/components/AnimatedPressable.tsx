import {
  type PressableProps,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated'

interface AnimatedPressableProps extends PressableProps {
  scaleTo?: number
  springConfig?: WithSpringConfig
  containerStyle?: StyleProp<ViewStyle>
}

const defaultSpring: WithSpringConfig = {
  stiffness: 400,
  damping: 20,
  mass: 0.3,
}

export function AnimatedPressable({
  scaleTo = 0.97,
  springConfig = defaultSpring,
  containerStyle,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, containerStyle]}>
      <View style={{ flex: 1 }}>
        <Pressable
          onPressIn={(e) => {
            scale.value = withSpring(scaleTo, springConfig)
            onPressIn?.(e)
          }}
          onPressOut={(e) => {
            scale.value = withSpring(1, springConfig)
            onPressOut?.(e)
          }}
          {...rest}
        >
          {children}
        </Pressable>
      </View>
    </Animated.View>
  )
}
