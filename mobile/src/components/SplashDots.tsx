import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text } from 'react-native'
import { View } from 'expo-rtl'

const C = { blue: '#2563EB' } as const

interface SplashDotsProps {
  count: number
  activeIndex: number
  reduced: boolean
}

export default function SplashDots({
  count,
  activeIndex,
  reduced,
}: SplashDotsProps) {
  const barAnims = useRef<Array<Animated.Value>>([])

  if (barAnims.current.length === 0) {
    barAnims.current = Array.from(
      { length: count },
      (_, i) => new Animated.Value(i === 0 ? 1 : 0),
    )
  }

  useEffect(() => {
    barAnims.current.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0,
        duration: reduced ? 0 : 280,
        useNativeDriver: false,
      }).start()
    })
  }, [activeIndex, reduced])

  return (
    <View style={styles.container}>
      <View style={styles.numbers}>
        {Array.from({ length: count }, (_, i) => (
          <Text
            key={i}
            style={[styles.number, i === activeIndex && styles.numberActive]}
          >
            {i + 1}
          </Text>
        ))}
      </View>

      <View style={styles.bars}>
        {barAnims.current.map((anim, i) => {
          const bg = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#E4E4E7', C.blue],
          })
          const scaleX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          })
          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                { backgroundColor: bg, transform: [{ scaleX }] },
              ]}
            />
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  numbers: {
    flexDirection: 'row',
    gap: 10,
  },
  number: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  numberActive: {
    color: C.blue,
  },
  bars: {
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    height: 4,
    width: 38,
    borderRadius: 2,
  },
})
