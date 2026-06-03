import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useTranslation } from 'react-i18next'

import { radius } from '../theme/tokens'
import { useTheme } from '../theme/use-theme'

interface UserAvatarProps {
  image?: string | null
  name?: string | null
  initials?: string
  size?: number
  showOnlineDot?: boolean
}

export function UserAvatar({
  image,
  name,
  initials: initialsProp,
  size = 44,
  showOnlineDot = true,
}: UserAvatarProps) {
  const t = useTheme()
  const { t: i18n } = useTranslation()
  const initial =
    initialsProp ?? (name?.[0] ?? i18n('common.userInitial')).toUpperCase()
  const sizeStyle = { width: size, height: size }
  const dotSize = Math.max(9, size * 0.22)

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={[styles.image, sizeStyle, { borderColor: t.border }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            sizeStyle,
            { backgroundColor: t.accent + '14', borderColor: t.accent + '28' },
          ]}
        >
          <Text
            style={[
              styles.initial,
              { color: t.accent, fontSize: Math.max(14, size * 0.38) },
            ]}
          >
            {initial}
          </Text>
        </View>
      )}
      {showOnlineDot && (
        <View
          style={[
            styles.online,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: t.success,
              borderColor: t.bg,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexShrink: 0,
  },
  image: {
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  fallback: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '600',
  },
  online: {
    position: 'absolute',
    borderWidth: 2,
  },
})
