import { useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native'
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Polygon,
  Stop,
} from 'react-native-svg'

const { width: W, height: H } = Dimensions.get('window')

export default function SplashBg({ reduced }: { reduced: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current
  const float = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (reduced) return

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [reduced])

  const blobOpacity = reduced
    ? 0.08
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.13] })
  const blobScale = reduced
    ? 1
    : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] })
  const floatY = reduced
    ? 0
    : float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] })
  const greenBlobOpacity = reduced
    ? 0.05
    : float.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.08] })

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
            <Stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="g2" x1="100%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#22C55E" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Base gradient circles */}
        <Circle cx={W * 0.88} cy={-20} r={210} fill="url(#g1)" />
        <Circle cx={W * 0.12} cy={H * 1.02} r={170} fill="url(#g2)" />

        {/* Racing stripes — top-right corner */}
        <G opacity={0.07}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Polygon
              key={`tr${i}`}
              points={`${W + 10 - i * 24},0 ${W + 40 - i * 24},0 ${W - 50 - i * 24},170 ${W - 80 - i * 24},170`}
              fill="#2563EB"
            />
          ))}
        </G>

        {/* Racing stripes — bottom-left corner */}
        <G opacity={0.06}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Polygon
              key={`bl${i}`}
              points={`${-30 + i * 24},${H} ${5 + i * 24},${H} ${90 + i * 24},${H - 150} ${55 + i * 24},${H - 150}`}
              fill="#22C55E"
            />
          ))}
        </G>

        {/* Diamond outline accent — top-left */}
        <Polygon
          points={`${W * 0.09},${H * 0.2} ${W * 0.17},${H * 0.14} ${W * 0.25},${H * 0.2} ${W * 0.17},${H * 0.27}`}
          fill="none"
          stroke="#2563EB"
          strokeWidth="1.5"
          opacity={0.18}
        />

        {/* Small green diamond — right side */}
        <Polygon
          points={`${W * 0.87},${H * 0.56} ${W * 0.92},${H * 0.53} ${W * 0.97},${H * 0.56} ${W * 0.92},${H * 0.59}`}
          fill="#22C55E"
          opacity={0.22}
        />

        {/* Dot grid */}
        {[...Array(5)].map((_, row) =>
          [...Array(5)].map((_, col) => (
            <Circle
              key={`d${row}${col}`}
              cx={W * 0.18 + col * W * 0.16}
              cy={H * 0.46 + row * 22}
              r={1.8}
              fill="#2563EB"
              opacity={0.05}
            />
          )),
        )}
      </Svg>

      {/* Animated purple blob — top right */}
      <Animated.View
        style={[
          styles.blobPurple,
          {
            opacity: blobOpacity,
            transform: [{ scale: blobScale as any }],
          },
        ]}
      />

      {/* Animated green blob — bottom left */}
      <Animated.View
        style={[
          styles.blobGreen,
          {
            opacity: greenBlobOpacity,
            transform: [{ translateY: floatY as any }],
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  blobPurple: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2563EB',
  },
  blobGreen: {
    position: 'absolute',
    bottom: -90,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#22C55E',
  },
})
