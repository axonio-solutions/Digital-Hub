import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

const C = { blue: '#2563EB' } as const

interface SplashDotsProps {
  count: number
  activeIndex: number
  scrollX: Animated.Value
  width: number
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

  const step = String(activeIndex + 1).padStart(2, '0')
  const total = String(count).padStart(2, '0')

  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>
        <Text style={styles.stepActive}>{step}</Text>
        <Text style={styles.stepSep}> — </Text>
        <Text style={styles.stepTotal}>{total}</Text>
      </Text>

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
  stepLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
  },
  stepActive: {
    fontWeight: '800',
    color: C.blue,
  },
  stepSep: {
    fontWeight: '400',
    color: '#a1a1aa',
  },
  stepTotal: {
    fontWeight: '600',
    color: '#a1a1aa',
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
