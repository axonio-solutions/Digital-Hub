import { useColorScheme } from 'react-native'
import { palette } from './tokens'
import type { Theme } from './tokens'

export function useTheme(): Theme {
  const scheme = useColorScheme()
  return scheme === 'dark' ? palette.dark : palette.light
}
