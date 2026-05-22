import { useEffect, useRef } from 'react'
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

interface Blob {
  x: Animated.Value
  y: Animated.Value
  scale: Animated.Value
  rotate: Animated.Value
  size: number
  color: string
  durationX: number
  durationY: number
  delay: number
  baseOpacity: number
}

const BLOBS: Array<Omit<Blob, 'x' | 'y' | 'scale' | 'rotate'>> = [
  {
    size: 220,
    color: '#2563EB',
    durationX: 8000,
    durationY: 11000,
    delay: 0,
    baseOpacity: 0.18,
  },
  {
    size: 160,
    color: '#22C55E',
    durationX: 10000,
    durationY: 9000,
    delay: 500,
    baseOpacity: 0.13,
  },
  {
    size: 140,
    color: '#2563EB',
    durationX: 12000,
    durationY: 13000,
    delay: 1000,
    baseOpacity: 0.09,
  },
  {
    size: 100,
    color: '#22C55E',
    durationX: 9000,
    durationY: 10000,
    delay: 1500,
    baseOpacity: 0.06,
  },
  {
    size: 180,
    color: '#0EA5E9',
    durationX: 11000,
    durationY: 8000,
    delay: 2000,
    baseOpacity: 0.15,
  },
]

export default function SplashBlobs({ reduced }: { reduced: boolean }) {
  const anims = useRef<Array<Blob>>([])

  if (anims.current.length === 0) {
    anims.current = BLOBS.map((b) => ({
      ...b,
      x: new Animated.Value(-80),
      y: new Animated.Value(SCREEN_H * 0.15 + Math.random() * SCREEN_H * 0.5),
      scale: new Animated.Value(1),
      rotate: new Animated.Value(-1),
    }))
  }

  useEffect(() => {
    if (reduced) return

    anims.current.forEach((b) => {
      const startX = -80
      const endX = SCREEN_W - 60
      const startY = b.y as any as number
      const endY = startY + 60

      const cycleX = () => {
        Animated.sequence([
          Animated.timing(b.x, {
            toValue: endX,
            duration: b.durationX * 0.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(b.x, {
            toValue: startX,
            duration: b.durationX * 0.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => cycleX())
      }

      const cycleY = () => {
        Animated.sequence([
          Animated.timing(b.y, {
            toValue: endY,
            duration: b.durationY * 0.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(b.y, {
            toValue: startY,
            duration: b.durationY * 0.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => cycleY())
      }

      const cycleScale = () => {
        Animated.sequence([
          Animated.timing(b.scale, {
            toValue: 1.08,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(b.scale, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => cycleScale())
      }

      const cycleRotate = () => {
        Animated.sequence([
          Animated.timing(b.rotate, {
            toValue: 1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(b.rotate, {
            toValue: -1,
            duration: 4500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]).start(() => cycleRotate())
      }

      setTimeout(() => {
        cycleX()
        cycleY()
        cycleScale()
        cycleRotate()
      }, b.delay)
    })
  }, [reduced])

  if (reduced) return null

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {anims.current.map((b, i) => (
        <Animated.View
          key={i}
          style={[
            styles.blob,
            {
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              backgroundColor: b.color,
              opacity: b.baseOpacity,
              transform: [
                { translateX: b.x },
                { translateY: b.y as any },
                { scale: b.scale },
                {
                  rotate: b.rotate.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-2deg', '2deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
})
