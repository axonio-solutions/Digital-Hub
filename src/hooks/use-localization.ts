import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'

/**
 * Custom Localization Hook for MLILA
 * Provides current language, direction, and translation functions
 */
export function useLocalization() {
  const { t, i18n } = useTranslation()

  const currentLanguage = i18n.language
  const isRTL = useMemo(() => currentLanguage === 'ar' || currentLanguage === 'ar-DZ', [currentLanguage])
  const dir: 'ltr' | 'rtl' = useMemo(() => (isRTL ? 'rtl' : 'ltr'), [isRTL])

  const changeLanguage = useCallback(
    async (lng: string) => {
      await i18n.changeLanguage(lng)
      // Additional logic like persisting to localStorage or cookies
      // if not already handled by i18next-browser-languagedetector
      localStorage.setItem('i18nextLng', lng)
      document.documentElement.dir = (lng === 'ar' || lng === 'ar-DZ') ? 'rtl' : 'ltr'
      document.documentElement.lang = lng
    },
    [i18n],
  )

  return {
    t,
    i18n,
    currentLanguage,
    isRTL,
    dir,
    changeLanguage,
  }
}
